import {
  CONTENT_TESTING_COMMENT_CATEGORIES,
  CONTENT_TESTING_COMMENT_SEVERITIES,
  CONTENT_TESTING_COMMENT_STATUSES,
  deleteContentTestingComment,
  getContentTestingCommentDetail,
  listContentTestingComments,
  updateContentTestingComment
} from "../db/contentTestingComments";
import type {
  AuthenticatedAppUser
} from "../db/users";
import type {
  AdminContentTestingCommentDeleteResponse,
  ContentTestingCommentCategory,
  ContentTestingCommentSeverity,
  ContentTestingCommentStatus,
  Env,
  UpdateContentTestingCommentRequest
} from "../types";

function getCommentIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/api\/admin\/content-testing-comments\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function isUpdateContentTestingCommentRequest(body: unknown): body is UpdateContentTestingCommentRequest {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  const allowedKeys = new Set(["status", "category", "severity"]);

  return (
    Object.keys(candidate).every((key) => allowedKeys.has(key)) &&
    (candidate.status === undefined ||
      CONTENT_TESTING_COMMENT_STATUSES.includes(candidate.status as ContentTestingCommentStatus)) &&
    (candidate.category === undefined ||
      CONTENT_TESTING_COMMENT_CATEGORIES.includes(candidate.category as ContentTestingCommentCategory)) &&
    (candidate.severity === undefined ||
      CONTENT_TESTING_COMMENT_SEVERITIES.includes(candidate.severity as ContentTestingCommentSeverity))
  );
}

function requireAdmin(appUser: AuthenticatedAppUser): Response | null {
  if (!appUser.canAccessAdmin) {
    return Response.json({ error: "admin_forbidden" }, { status: 403 });
  }

  return null;
}

export async function createAdminContentTestingCommentsListResponse(
  env: Env,
  appUser: AuthenticatedAppUser
): Promise<Response> {
  const adminError = requireAdmin(appUser);
  if (adminError) {
    return adminError;
  }

  const comments = await listContentTestingComments(env.DB);
  return Response.json({
    ok: true,
    comments: comments.map(({ context: _context, user_id: _userId, ...summary }) => summary)
  });
}

export async function createAdminContentTestingCommentDetailResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser
): Promise<Response> {
  const adminError = requireAdmin(appUser);
  if (adminError) {
    return adminError;
  }

  const commentId = getCommentIdFromPath(new URL(request.url).pathname);
  if (!commentId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const comment = await getContentTestingCommentDetail(env.DB, commentId);
  if (!comment) {
    return Response.json({ error: "comment_not_found" }, { status: 404 });
  }

  return Response.json({
    ok: true,
    comment
  });
}

export async function createAdminContentTestingCommentPatchResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser
): Promise<Response> {
  const adminError = requireAdmin(appUser);
  if (adminError) {
    return adminError;
  }

  const commentId = getCommentIdFromPath(new URL(request.url).pathname);
  if (!commentId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const body = (await request.json()) as unknown;
  if (!isUpdateContentTestingCommentRequest(body)) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const comment = await updateContentTestingComment(env.DB, commentId, body);
  if (!comment) {
    return Response.json({ error: "comment_not_found" }, { status: 404 });
  }

  return Response.json({
    ok: true,
    comment
  });
}

export async function createAdminContentTestingCommentDeleteResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser
): Promise<Response> {
  const adminError = requireAdmin(appUser);
  if (adminError) {
    return adminError;
  }

  const commentId = getCommentIdFromPath(new URL(request.url).pathname);
  if (!commentId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const deleted = await deleteContentTestingComment(env.DB, commentId);
  if (!deleted) {
    return Response.json({ error: "comment_not_found" }, { status: 404 });
  }

  return Response.json({
    ok: true,
    deleted_id: commentId
  } satisfies AdminContentTestingCommentDeleteResponse);
}
