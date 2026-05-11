import { getModuleBundle } from "../content/courseContent";
import { canAccessModule, type AuthenticatedAppUser } from "../db/users";
import type { Env } from "../types";

export async function createModuleResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser,
  moduleId: string
): Promise<Response> {
  if (!appUser.row.is_enabled) {
    return Response.json({ error: "user_disabled" }, { status: 403 });
  }

  if (!canAccessModule(appUser, moduleId)) {
    return Response.json({ error: "module_forbidden" }, { status: 403 });
  }

  const bundle = await getModuleBundle(env.ASSETS, new URL(request.url).origin, moduleId);
  if (!bundle) {
    return Response.json({ error: "module_not_found" }, { status: 404 });
  }

  return Response.json(bundle);
}
