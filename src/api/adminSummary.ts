import { getModuleCatalog } from "../content/courseContent";
import { getAdminSummary } from "../db/adminUsers";
import type { AuthenticatedAppUser } from "../db/users";
import type { Env } from "../types";

export async function createAdminSummaryResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser,
  rootSuperusers: Set<string>
): Promise<Response> {
  if (!appUser.canAccessAdmin) {
    return Response.json({ error: "admin_forbidden" }, { status: 403 });
  }

  const modules = await getModuleCatalog(env.ASSETS, new URL(request.url).origin);
  const summary = await getAdminSummary(env.DB, modules, rootSuperusers);

  return Response.json({
    ok: true,
    summary
  });
}
