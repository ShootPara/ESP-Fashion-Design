import { createIdentityProblemResponse, getAuthenticatedIdentity } from "./auth/identity";
import { parseSuperuserEmails } from "./auth/superusers";
import { createMeResponse } from "./api/me";
import { createModuleResponse } from "./api/modules";
import { createActivityStateResponse } from "./api/activityState";
import { createActivityProgressResponse } from "./api/activityProgress";
import { createActivitySubmissionResponse } from "./api/activitySubmissions";
import { resolveAuthenticatedAppUser } from "./db/users";
import type { Env } from "./types";

async function resolveAppUser(request: Request, env: Env) {
  const identity = getAuthenticatedIdentity(request, env);
  if (!identity) {
    return { identity: null, appUser: null };
  }

  const superusers = parseSuperuserEmails(env.SUPERUSER_EMAILS);
  const appUser = await resolveAuthenticatedAppUser(env, request, identity, superusers);
  return { identity, appUser };
}

async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/api/health") {
    return Response.json({ ok: true });
  }

  const { identity, appUser } = await resolveAppUser(request, env);
  if (!identity || !appUser) {
    return createIdentityProblemResponse();
  }

  if (request.method === "GET" && url.pathname === "/api/me") {
    return createMeResponse(appUser);
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/modules/")) {
    const moduleId = url.pathname.replace("/api/modules/", "").trim();
    return createModuleResponse(request, env, appUser, moduleId);
  }

  if (request.method === "GET" && url.pathname === "/api/activity-state") {
    return createActivityStateResponse(env, appUser, url);
  }

  if (request.method === "POST" && url.pathname === "/api/progress/activity") {
    return createActivityProgressResponse(request, env, appUser);
  }

  if (request.method === "POST" && url.pathname === "/api/submissions/activity") {
    return createActivitySubmissionResponse(request, env, appUser);
  }

  return Response.json({ error: "not_found" }, { status: 404 });
}

async function handleAdminRequest(request: Request, env: Env): Promise<Response> {
  const { identity, appUser } = await resolveAppUser(request, env);
  if (!identity || !appUser) {
    return createIdentityProblemResponse();
  }

  if (!appUser.isSuperuser) {
    return new Response("Admin access is restricted to superusers.", {
      status: 403,
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    });
  }

  return env.ASSETS.fetch(request);
}

async function handleProtectedModuleBundleRequest(request: Request, env: Env): Promise<Response> {
  const { identity, appUser } = await resolveAppUser(request, env);
  if (!identity || !appUser) {
    return createIdentityProblemResponse();
  }

  const url = new URL(request.url);
  const fileName = url.pathname.split("/").at(-1) ?? "";
  const moduleId = fileName.replace(/\.json$/i, "");

  return createModuleResponse(request, env, appUser, moduleId);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, env);
    }

    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      return handleAdminRequest(request, env);
    }

    if (url.pathname.startsWith("/app-content/modules/") && url.pathname.endsWith(".json")) {
      return handleProtectedModuleBundleRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};
