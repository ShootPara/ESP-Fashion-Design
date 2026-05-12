import { getModuleCatalog } from "../content/courseContent";
import {
  getAdminUserDetail,
  listAdminUsers,
  updateAdminUserModuleAccess,
  updateAdminUserState
} from "../db/adminUsers";
import type { AuthenticatedAppUser } from "../db/users";
import type { Env, UpdateAdminUserModuleAccessRequest, UpdateAdminUserRequest } from "../types";

function getUserIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function getUserIdFromModuleAccessPath(pathname: string): string | null {
  const match = pathname.match(/^\/api\/admin\/users\/([^/]+)\/module-access$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function isUpdateAdminUserRequest(body: unknown): body is UpdateAdminUserRequest {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  const allowedKeys = new Set(["is_enabled", "is_test_mode"]);

  return (
    Object.keys(candidate).every((key) => allowedKeys.has(key)) &&
    (candidate.is_enabled === undefined || typeof candidate.is_enabled === "boolean") &&
    (candidate.is_test_mode === undefined || typeof candidate.is_test_mode === "boolean")
  );
}

function isUpdateAdminUserModuleAccessRequest(body: unknown): body is UpdateAdminUserModuleAccessRequest {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  return (
    Array.isArray(candidate.module_access) &&
    candidate.module_access.every(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        typeof (entry as Record<string, unknown>).module_id === "string" &&
        typeof (entry as Record<string, unknown>).is_enabled === "boolean"
    )
  );
}

function createRootProtectionResponse(): Response {
  return Response.json({ error: "root_superuser_protected" }, { status: 409 });
}

export async function createAdminUsersListResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser,
  rootSuperusers: Set<string>
): Promise<Response> {
  if (!appUser.canAccessAdmin) {
    return Response.json({ error: "admin_forbidden" }, { status: 403 });
  }

  const modules = await getModuleCatalog(env.ASSETS, new URL(request.url).origin);
  const users = await listAdminUsers(env.DB, modules, rootSuperusers);
  return Response.json({ ok: true, users });
}

export async function createAdminUserDetailResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser,
  rootSuperusers: Set<string>
): Promise<Response> {
  if (!appUser.canAccessAdmin) {
    return Response.json({ error: "admin_forbidden" }, { status: 403 });
  }

  const userId = getUserIdFromPath(new URL(request.url).pathname);
  if (!userId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const modules = await getModuleCatalog(env.ASSETS, new URL(request.url).origin);
  const user = await getAdminUserDetail(env.DB, userId, modules, rootSuperusers);
  if (!user) {
    return Response.json({ error: "user_not_found" }, { status: 404 });
  }

  return Response.json({ ok: true, user });
}

export async function createAdminUserPatchResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser,
  rootSuperusers: Set<string>
): Promise<Response> {
  if (!appUser.canAccessAdmin) {
    return Response.json({ error: "admin_forbidden" }, { status: 403 });
  }

  const userId = getUserIdFromPath(new URL(request.url).pathname);
  if (!userId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const body = (await request.json()) as unknown;
  if (!isUpdateAdminUserRequest(body)) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const modules = await getModuleCatalog(env.ASSETS, new URL(request.url).origin);

  try {
    const user = await updateAdminUserState(env.DB, userId, body, modules, rootSuperusers);
    if (!user) {
      return Response.json({ error: "user_not_found" }, { status: 404 });
    }

    return Response.json({ ok: true, user });
  } catch (error) {
    if (error instanceof Error && error.message === "root_superuser_protected") {
      return createRootProtectionResponse();
    }

    throw error;
  }
}

export async function createAdminUserModuleAccessPatchResponse(
  request: Request,
  env: Env,
  appUser: AuthenticatedAppUser,
  rootSuperusers: Set<string>
): Promise<Response> {
  if (!appUser.canAccessAdmin) {
    return Response.json({ error: "admin_forbidden" }, { status: 403 });
  }

  const userId = getUserIdFromModuleAccessPath(new URL(request.url).pathname);
  if (!userId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const body = (await request.json()) as unknown;
  if (!isUpdateAdminUserModuleAccessRequest(body)) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const modules = await getModuleCatalog(env.ASSETS, new URL(request.url).origin);

  try {
    const user = await updateAdminUserModuleAccess(env.DB, userId, body.module_access, modules, rootSuperusers);
    if (!user) {
      return Response.json({ error: "user_not_found" }, { status: 404 });
    }

    return Response.json({ ok: true, user });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("invalid_module_id:")) {
      return Response.json({ error: "invalid_module_id" }, { status: 400 });
    }

    throw error;
  }
}
