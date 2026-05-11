import { evaluateActivitySubmission } from "../activity/checking";
import { getModuleBundle } from "../content/courseContent";
import { upsertLearnerActivityProgress } from "../db/learnerActivityProgress";
import { upsertLearnerActivitySubmission } from "../db/learnerActivitySubmissions";
import { canAccessModule, type AuthenticatedAppUser } from "../db/users";
import type {
  ActivitySubmissionRequest,
  ActivitySubmissionResponse,
  AppCheckResult,
  Env,
  ModuleActivity
} from "../types";

function isActivityAnswerShape(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && typeof (value as Record<string, unknown>).activity_id === "string");
}

function isValidSubmissionRequest(body: unknown): body is ActivitySubmissionRequest {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.module_id === "string" &&
    typeof candidate.week_id === "string" &&
    typeof candidate.activity_id === "string" &&
    typeof candidate.submission_type === "string" &&
    typeof candidate.run_app_check === "boolean" &&
    typeof candidate.mark_completed === "boolean" &&
    isActivityAnswerShape(candidate.answer)
  );
}

function findActivity(bundleModuleId: string, weekId: string, activityId: string, activity: ModuleActivity): boolean {
  return activity.activity_id === activityId && activity.week_id === weekId && bundleModuleId.length > 0;
}

function toSubmissionResponse(
  row: Awaited<ReturnType<typeof upsertLearnerActivitySubmission>>,
  appCheck: AppCheckResult | null
): ActivitySubmissionResponse["submission"] {
  return {
    id: row.id,
    submission_type: row.submission_type,
    answer: JSON.parse(row.answer_json),
    app_check_result: row.app_check_result_json ? JSON.parse(row.app_check_result_json) : appCheck,
    is_correct: row.is_correct === null ? null : Boolean(row.is_correct),
    updated_at: row.updated_at
  };
}

export async function createActivitySubmissionResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser
): Promise<Response> {
  const body = (await request.json()) as unknown;

  if (!isValidSubmissionRequest(body)) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!appUser.row.is_enabled) {
    return Response.json({ error: "user_disabled" }, { status: 403 });
  }

  if (!canAccessModule(appUser, body.module_id)) {
    return Response.json({ error: "module_forbidden" }, { status: 403 });
  }

  const bundle = await getModuleBundle(env.ASSETS, new URL(request.url).origin, body.module_id);
  const activity =
    bundle?.weeks
      .find((week) => week.week_id === body.week_id)
      ?.activities.activities.find((candidate) => findActivity(body.module_id, body.week_id, body.activity_id, candidate)) ?? null;

  if (!bundle || !activity) {
    return Response.json({ error: "activity_not_found" }, { status: 404 });
  }

  const appCheck = body.run_app_check ? evaluateActivitySubmission(activity, body.answer) : null;

  if (appUser.row.is_test_mode) {
    return Response.json({
      ok: true,
      mode: "test",
      persisted: false,
      reason: "test_mode_no_write",
      progress: null,
      submission: null,
      app_check: appCheck
    } satisfies ActivitySubmissionResponse);
  }

  const submission = await upsertLearnerActivitySubmission(env.DB, {
    userId: appUser.row.id,
    moduleId: body.module_id,
    weekId: body.week_id,
    activityId: body.activity_id,
    submissionType: body.submission_type,
    answer: body.answer,
    appCheckResult: appCheck
  });

  const progress = await upsertLearnerActivityProgress(env.DB, appUser.row.id, {
    module_id: body.module_id,
    week_id: body.week_id,
    activity_id: body.activity_id,
    status: body.mark_completed ? "completed" : "in_progress",
    event: body.run_app_check ? "check" : "save"
  });

  return Response.json({
    ok: true,
    mode: "normal",
    persisted: true,
    progress,
    submission: toSubmissionResponse(submission, appCheck),
    app_check: appCheck
  } satisfies ActivitySubmissionResponse);
}
