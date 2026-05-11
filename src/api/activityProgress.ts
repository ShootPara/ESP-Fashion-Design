import { canAccessModule, type AuthenticatedAppUser } from "../db/users";
import { upsertLearnerActivityProgress } from "../db/learnerActivityProgress";
import type { ActivityProgressRequest, ActivityProgressResponse, Env } from "../types";

function isValidProgressRequest(body: unknown): body is ActivityProgressRequest {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.module_id === "string" &&
    typeof candidate.week_id === "string" &&
    typeof candidate.activity_id === "string" &&
    (candidate.status === "in_progress" || candidate.status === "completed") &&
    ["view", "save", "check", "mark_complete"].includes(String(candidate.event))
  );
}

export async function createActivityProgressResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser
): Promise<Response> {
  const body = (await request.json()) as unknown;

  if (!isValidProgressRequest(body)) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!appUser.row.is_enabled) {
    return Response.json({ error: "user_disabled" }, { status: 403 });
  }

  if (!canAccessModule(appUser, body.module_id)) {
    return Response.json({ error: "module_forbidden" }, { status: 403 });
  }

  if (appUser.row.is_test_mode) {
    return Response.json({
      ok: true,
      mode: "test",
      persisted: false,
      reason: "test_mode_no_write",
      progress: null
    } satisfies ActivityProgressResponse);
  }

  const progress = await upsertLearnerActivityProgress(env.DB, appUser.row.id, body);

  return Response.json({
    ok: true,
    mode: "normal",
    persisted: true,
    progress
  } satisfies ActivityProgressResponse);
}
