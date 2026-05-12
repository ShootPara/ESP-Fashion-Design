import type { Env } from "../types";

export const LOCAL_DEV_SUPERUSER_EMAILS_HEADER = "x-local-dev-superuser-emails";

export function parseSuperuserEmails(raw: string | undefined): Set<string> {
  if (!raw) {
    return new Set();
  }

  return new Set(
    raw
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isRootSuperuser(email: string, superuserEmails: Set<string>): boolean {
  return superuserEmails.has(email.trim().toLowerCase());
}

function isLocalDevRequest(request: Request): boolean {
  const { hostname } = new URL(request.url);
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function getConfiguredSuperuserEmails(request: Request, env: Pick<Env, "SUPERUSER_EMAILS">): Set<string> {
  const localHeaderValue = isLocalDevRequest(request)
    ? request.headers.get(LOCAL_DEV_SUPERUSER_EMAILS_HEADER)?.trim()
    : undefined;

  return parseSuperuserEmails(env.SUPERUSER_EMAILS?.trim() || localHeaderValue);
}
