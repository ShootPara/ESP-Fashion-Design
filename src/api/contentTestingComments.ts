import { canAccessModule, type AuthenticatedAppUser } from "../db/users";
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

  if (!canAccessModule(appUser, body.module_id)) {
    return Response.json({ error: "module_forbidden" }, { status: 403 });
  }

  if (!appUser.row.is_test_mode && !appUser.canAccessAdmin) {
    return Response.json({ error: "comment_submission_forbidden" }, { status: 403 });
  }

  const trimmedText = body.comment_text.trim();
  if (!trimmedText) {
    return Response.json({ error: "comment_text_required" }, { status: 400 });
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
