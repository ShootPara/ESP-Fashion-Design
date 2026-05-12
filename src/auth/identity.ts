import type { Env, Identity } from "../types";

export const SUPPORT_EMAIL = "unopenedparachute@gmail.com";
export const SUPPORT_LOGIN_URL =
  "mailto:unopenedparachute@gmail.com?subject=Fashion%20LMS%20login%20problem";
export const LOCAL_DEV_AUTH_NAME_HEADER = "x-local-dev-auth-name";

function isLocalDevRequest(request: Request): boolean {
  const { hostname } = new URL(request.url);
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function readAccessIdentity(request: Request): Identity | null {
  const email = request.headers.get("Cf-Access-Authenticated-User-Email")?.trim().toLowerCase();
  if (!email) {
    return null;
  }

  const jwtAssertion = request.headers.get("Cf-Access-Jwt-Assertion");
  let displayName = "";

  if (jwtAssertion) {
    const parts = jwtAssertion.split(".");
    if (parts.length >= 2) {
      try {
        const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadJson) as { name?: string };
        displayName = (payload.name ?? "").trim();
      } catch {
        displayName = "";
      }
    }
  }

  if (!displayName && isLocalDevRequest(request)) {
    displayName = request.headers.get(LOCAL_DEV_AUTH_NAME_HEADER)?.trim() ?? "";
  }

  return {
    email,
    displayName,
    source: "access"
  };
}

function readDevOverride(request: Request, env: Env): Identity | null {
  if (!isLocalDevRequest(request)) {
    return null;
  }

  const email = env.DEV_AUTH_EMAIL?.trim().toLowerCase();
  if (!email) {
    return null;
  }

  return {
    email,
    displayName: env.DEV_AUTH_NAME?.trim() ?? "",
    source: "dev_override"
  };
}

export function getAuthenticatedIdentity(request: Request, env: Env): Identity | null {
  return readAccessIdentity(request) ?? readDevOverride(request, env);
}

export function createIdentityProblemResponse(status = 401): Response {
  return Response.json(
    {
      authenticated: false,
      error: "identity_unavailable",
      message: "The LMS could not confirm your login.",
      support: {
        email: SUPPORT_EMAIL,
        login_help_url: SUPPORT_LOGIN_URL
      }
    },
    { status }
  );
}
