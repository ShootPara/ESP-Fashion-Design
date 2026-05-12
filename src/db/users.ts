import { getCourseIndex } from "../content/courseContent";
import { isRootSuperuser } from "../auth/superusers";
import type { CourseIndexModuleSummary, D1DatabaseSessionLike, Env, Identity, UserRow } from "../types";

export interface AuthenticatedAppUser {
  row: UserRow;
  isSuperuser: boolean;
  isRootSuperuser: boolean;
  isEnabled: boolean;
  canAccessAdmin: boolean;
  visibleModules: CourseIndexModuleSummary[];
  enabledModuleIds: Set<string>;
}

function nowIso() {
  return new Date().toISOString();
}

function getAuthSession(env: Env): D1DatabaseSessionLike {
  return env.DB.withSession?.("first-primary") ?? env.DB;
}

async function getUserByEmail(db: D1DatabaseSessionLike, email: string): Promise<UserRow | null> {
  return db.prepare("SELECT * FROM users WHERE email = ? LIMIT 1").bind(email).first<UserRow>();
}

async function listEnabledModuleIdsForUser(env: Env, userId: string): Promise<Set<string>> {
  const result = await env.DB.prepare(
    "SELECT module_id FROM user_module_access WHERE user_id = ? AND is_enabled = 1"
  )
    .bind(userId)
    .all<{ module_id: string }>();

  return new Set(result.results.map((row) => row.module_id));
}

export function getEffectiveIsRootSuperuser(row: Pick<UserRow, "email">, rootSuperusers: Set<string>): boolean {
  return isRootSuperuser(row.email, rootSuperusers);
}

export function getEffectiveIsSuperuser(
  row: Pick<UserRow, "email" | "role">,
  rootSuperusers: Set<string>
): boolean {
  return getEffectiveIsRootSuperuser(row, rootSuperusers) || row.role === "superuser";
}

export function getEffectiveIsEnabled(
  row: Pick<UserRow, "email" | "is_enabled">,
  rootSuperusers: Set<string>
): boolean {
  return getEffectiveIsRootSuperuser(row, rootSuperusers) || Boolean(row.is_enabled);
}

export function canRowAccessAdmin(
  row: Pick<UserRow, "email" | "role" | "is_enabled">,
  rootSuperusers: Set<string>
): boolean {
  return getEffectiveIsSuperuser(row, rootSuperusers) && getEffectiveIsEnabled(row, rootSuperusers);
}

export async function upsertAuthenticatedUser(
  env: Env,
  identity: Identity,
  rootSuperusers: Set<string>
): Promise<UserRow> {
  const timestamp = nowIso();
  const root = isRootSuperuser(identity.email, rootSuperusers);
  const authSession = getAuthSession(env);
  const existingUser = await getUserByEmail(authSession, identity.email);

  if (!existingUser) {
    const newUser: UserRow = {
      id: crypto.randomUUID(),
      email: identity.email,
      display_name: identity.displayName,
      role: root ? "superuser" : "student",
      is_enabled: 1,
      is_test_mode: 0,
      is_root_superuser: root ? 1 : 0,
      first_login_at: timestamp,
      last_login_at: timestamp,
      created_at: timestamp,
      updated_at: timestamp
    };

    await authSession.prepare(
      `INSERT INTO users (
        id, email, display_name, role, is_enabled, is_test_mode, is_root_superuser,
        first_login_at, last_login_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        newUser.id,
        newUser.email,
        newUser.display_name,
        newUser.role,
        newUser.is_enabled,
        newUser.is_test_mode,
        newUser.is_root_superuser,
        newUser.first_login_at,
        newUser.last_login_at,
        newUser.created_at,
        newUser.updated_at
      )
      .run();

    return newUser;
  }

  await authSession.prepare(
    `UPDATE users
      SET display_name = ?,
          role = ?,
          is_enabled = ?,
          is_root_superuser = ?,
          last_login_at = ?,
          updated_at = ?
      WHERE id = ?`
  )
    .bind(
      identity.displayName || existingUser.display_name,
      root ? "superuser" : existingUser.role,
      root ? 1 : existingUser.is_enabled,
      root ? 1 : 0,
      timestamp,
      timestamp,
      existingUser.id
    )
    .run();

  const updatedUser = await getUserByEmail(authSession, identity.email);
  if (!updatedUser) {
    throw new Error("User could not be reloaded after update.");
  }

  return updatedUser;
}

export async function resolveAuthenticatedAppUser(
  env: Env,
  request: Request,
  identity: Identity,
  rootSuperusers: Set<string>
): Promise<AuthenticatedAppUser> {
  const row = await upsertAuthenticatedUser(env, identity, rootSuperusers);
  const root = getEffectiveIsRootSuperuser(row, rootSuperusers);
  const effectiveSuperuser = getEffectiveIsSuperuser(row, rootSuperusers);
  const isEnabled = getEffectiveIsEnabled(row, rootSuperusers);
  const canAccessAdmin = canRowAccessAdmin(row, rootSuperusers);
  const courseIndex = await getCourseIndex(env.ASSETS, new URL(request.url).origin);
  const enabledModuleIds = await listEnabledModuleIdsForUser(env, row.id);

  const visibleModules = !isEnabled
    ? []
    : row.is_test_mode
      ? courseIndex.available_modules
      : courseIndex.available_modules.filter((moduleSummary) => enabledModuleIds.has(moduleSummary.module_id));

  return {
    row,
    isSuperuser: effectiveSuperuser,
    isRootSuperuser: root,
    isEnabled,
    canAccessAdmin,
    visibleModules,
    enabledModuleIds
  };
}

export function canAccessModule(appUser: AuthenticatedAppUser, moduleId: string): boolean {
  return appUser.visibleModules.some((moduleSummary) => moduleSummary.module_id === moduleId);
}
