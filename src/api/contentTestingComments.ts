import { canAccessModule, type AuthenticatedAppUser } from "../db/users";
import { getModuleBundle } from "../content/courseContent";
import {
  CONTENT_TESTING_COMMENT_CATEGORIES,
  CONTENT_TESTING_COMMENT_SEVERITIES,
  createContentTestingComment
} from "../db/contentTestingComments";
import type {
  ContentTestingCommentScreenContext,
  CreateContentTestingCommentRequest,
  Env
} from "../types";

const SCREEN_CONTEXTS: ContentTestingCommentScreenContext[] = ["module", "week", "activity"];

function isCreateContentTestingCommentRequest(body: unknown): body is CreateContentTestingCommentRequest {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.module_id === "string" &&
    typeof candidate.week_id === "string" &&
    typeof candidate.activity_id === "string" &&
    typeof candidate.comment_text === "string" &&
    SCREEN_CONTEXTS.includes(candidate.screen_context as ContentTestingCommentScreenContext) &&
    CONTENT_TESTING_COMMENT_CATEGORIES.includes(candidate.category as (typeof CONTENT_TESTING_COMMENT_CATEGORIES)[number]) &&
    CONTENT_TESTING_COMMENT_SEVERITIES.includes(candidate.severity as (typeof CONTENT_TESTING_COMMENT_SEVERITIES)[number]) &&
    candidate.context !== null &&
    typeof candidate.context === "object"
  );
}

async function validateCommentContext(
  request: Request,
  env: Env,
  body: CreateContentTestingCommentRequest
): Promise<Response | null> {
  const bundle = await getModuleBundle(env.ASSETS, new URL(request.url).origin, body.module_id);
  if (!bundle) {
    return Response.json({ error: "module_not_found" }, { status: 404 });
  }

  if (body.screen_context === "module") {
    return null;
  }

  const week = bundle.weeks.find((candidate) => candidate.week_id === body.week_id);
  if (!week) {
    return Response.json({ error: "week_not_found" }, { status: 404 });
  }

  if (body.screen_context === "week") {
    return null;
  }

  const activity = week.activities.activities.find((candidate) => candidate.activity_id === body.activity_id);
  if (!activity) {
    return Response.json({ error: "activity_not_found" }, { status: 404 });
  }

  return null;
}

export async function createContentTestingCommentResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser
): Promise<Response> {
  const body = (await request.json()) as unknown;
  if (!isCreateContentTestingCommentRequest(body)) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!appUser.isEnabled) {
    return Response.json({ error: "user_disabled" }, { status: 403 });
  }

  const hasNormalModuleAccess = canAccessModule(appUser, body.module_id);
  if (!appUser.canAccessAdmin && !hasNormalModuleAccess) {
    return Response.json({ error: "module_forbidden" }, { status: 403 });
  }

  if (!appUser.canAccessAdmin && !appUser.row.is_test_mode) {
    return Response.json({ error: "comment_submission_forbidden" }, { status: 403 });
  }

  const trimmedText = body.comment_text.trim();
  if (!trimmedText) {
    return Response.json({ error: "comment_text_required" }, { status: 400 });
  }

  const contextError = await validateCommentContext(request, env, body);
  if (contextError) {
    return contextError;
  }

  const comment = await createContentTestingComment(env.DB, {
    ...body,
    comment_text: trimmedText,
    userId: appUser.row.id,
    userEmailSnapshot: appUser.row.email,
    userDisplayNameSnapshot: appUser.row.display_name
  });

  return Response.json({
    ok: true,
    comment
  });
}
