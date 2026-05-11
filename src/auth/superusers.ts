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
