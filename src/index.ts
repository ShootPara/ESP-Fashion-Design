import { createIdentityProblemResponse, getAuthenticatedIdentity } from "./auth/identity";
import { parseSuperuserEmails } from "./auth/superusers";
import { createMeResponse } from "./api/me";
import { resolveAuthenticatedAppUser } from "./db/users";
import type { Env } from "./types";

async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/api/health") {
    return Response.json({ ok: true });
  }

  const identity = getAuthenticatedIdentity(request, env);
  if (!identity) {
    return createIdentityProblemResponse();
  }

  const superusers = parseSuperuserEmails(env.SUPERUSER_EMAILS);
  const appUser = await resolveAuthenticatedAppUser(env, request, identity, superusers);

  if (request.method === "GET" && url.pathname === "/api/me") {
    return createMeResponse(appUser);
  }

  return Response.json({ error: "not_found" }, { status: 404 });
}

async function handleAdminRequest(request: Request, env: Env): Promise<Response> {
  const identity = getAuthenticatedIdentity(request, env);
  if (!identity) {
    return createIdentityProblemResponse();
  }

  const superusers = parseSuperuserEmails(env.SUPERUSER_EMAILS);
  const appUser = await resolveAuthenticatedAppUser(env, request, identity, superusers);

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, env);
    }

    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      return handleAdminRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};
