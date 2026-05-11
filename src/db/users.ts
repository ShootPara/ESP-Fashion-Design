import { getCourseIndex } from "../content/courseContent";
import { isRootSuperuser } from "../auth/superusers";
import type { CourseIndexModuleSummary, Env, Identity, UserRow } from "../types";

export interface AuthenticatedAppUser {
  row: UserRow;
  isSuperuser: boolean;
  isRootSuperuser: boolean;
  visibleModules: CourseIndexModuleSummary[];
}

function nowIso() {
  return new Date().toISOString();
}

async function getUserByEmail(env: Env, email: string): Promise<UserRow | null> {
  return env.DB.prepare("SELECT * FROM users WHERE email = ? LIMIT 1").bind(email).first<UserRow>();
}

async function listEnabledModuleIdsForUser(env: Env, userId: string): Promise<Set<string>> {
  const result = await env.DB.prepare(
    "SELECT module_id FROM user_module_access WHERE user_id = ? AND is_enabled = 1"
  )
    .bind(userId)
    .all<{ module_id: string }>();

  return new Set(result.results.map((row) => row.module_id));
}

export async function upsertAuthenticatedUser(
  env: Env,
  identity: Identity,
  rootSuperusers: Set<string>
): Promise<UserRow> {
  const timestamp = nowIso();
  const root = isRootSuperuser(identity.email, rootSuperusers);
  const existingUser = await getUserByEmail(env, identity.email);

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

    await env.DB.prepare(
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

  await env.DB.prepare(
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
      root ? 1 : existingUser.is_root_superuser,
      timestamp,
      timestamp,
      existingUser.id
    )
    .run();

  const updatedUser = await getUserByEmail(env, identity.email);
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
  const root = isRootSuperuser(row.email, rootSuperusers);
  const effectiveSuperuser = root || row.role === "superuser";
  const courseIndex = await getCourseIndex(env.ASSETS, new URL(request.url).origin);
  const enabledModuleIds = await listEnabledModuleIdsForUser(env, row.id);

  const visibleModules = row.is_test_mode
    ? courseIndex.available_modules
    : courseIndex.available_modules.filter((moduleSummary) => enabledModuleIds.has(moduleSummary.module_id));

  return {
    row,
    isSuperuser: effectiveSuperuser,
    isRootSuperuser: root,
    visibleModules
  };
}
