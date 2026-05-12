import { canAccessModule, type AuthenticatedAppUser } from "../db/users";
import { getLearnerActivityProgress } from "../db/learnerActivityProgress";
import { getLearnerActivitySubmission } from "../db/learnerActivitySubmissions";
import type {
  ActivityAnswerPayload,
  ActivityStateResponse,
  AppCheckResult,
  Env,
  LearnerActivitySubmissionRow
} from "../types";

function parseSubmission(row: LearnerActivitySubmissionRow | null): ActivityStateResponse["submission"] {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    submission_type: row.submission_type,
    answer: JSON.parse(row.answer_json) as ActivityAnswerPayload,
    app_check_result: row.app_check_result_json ? (JSON.parse(row.app_check_result_json) as AppCheckResult) : null,
    is_correct: row.is_correct === null ? null : Boolean(row.is_correct),
    updated_at: row.updated_at
  };
}

export async function createActivityStateResponse(
  env: Env,
  appUser: AuthenticatedAppUser,
  requestUrl: URL
): Promise<Response> {
  const moduleId = requestUrl.searchParams.get("module_id") ?? "";
  const weekId = requestUrl.searchParams.get("week_id") ?? "";
  const activityId = requestUrl.searchParams.get("activity_id") ?? "";

  if (!moduleId || !weekId || !activityId) {
    return Response.json({ error: "missing_query" }, { status: 400 });
  }

  if (!appUser.isEnabled) {
    return Response.json({ error: "user_disabled" }, { status: 403 });
  }

  if (!canAccessModule(appUser, moduleId)) {
    return Response.json({ error: "module_forbidden" }, { status: 403 });
  }

  if (appUser.row.is_test_mode) {
    return Response.json({
      ok: true,
      mode: "test",
      persisted: false,
      progress: null,
      submission: null
    } satisfies ActivityStateResponse);
  }

  const progress = await getLearnerActivityProgress(env.DB, appUser.row.id, activityId);
  const submission = await getLearnerActivitySubmission(env.DB, appUser.row.id, activityId);

  return Response.json({
    ok: true,
    mode: "normal",
    persisted: true,
    progress,
    submission: parseSubmission(submission)
  } satisfies ActivityStateResponse);
}
