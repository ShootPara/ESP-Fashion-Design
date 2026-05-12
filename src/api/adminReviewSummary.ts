import { getContentTestingCommentCounts } from "../db/contentTestingComments";
import type { AuthenticatedAppUser } from "../db/users";
import { buildReviewSummary } from "../review/reviewSummary";
import type { Env } from "../types";

export async function createAdminReviewSummaryResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser
): Promise<Response> {
  if (!appUser.canAccessAdmin) {
    return Response.json({ error: "admin_forbidden" }, { status: 403 });
  }

  const summary = await buildReviewSummary(env.ASSETS, new URL(request.url).origin);
  summary.comments = await getContentTestingCommentCounts(env.DB);

  return Response.json({
    ok: true,
    summary
  });
}
