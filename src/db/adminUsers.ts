import {
  canRowAccessAdmin,
  getEffectiveIsEnabled,
  getEffectiveIsRootSuperuser,
  getEffectiveIsSuperuser
} from "./users";
import type {
  AdminModuleAccessEntry,
  AdminSummaryResponse,
  AdminUserDetail,
  AdminUserSummary,
  CourseIndexModuleCatalogEntry,
  D1DatabaseLike,
  UserRow
} from "../types";

interface ModuleAccessRow {
  user_id: string;
  module_id: string;
  is_enabled: number;
}

function nowIso(): string {
  return new Date().toISOString();
}

async function listUserRows(db: D1DatabaseLike): Promise<UserRow[]> {
  const result = await db.prepare("SELECT * FROM users").all<UserRow>();
  return result.results;
}

async function getUserRowById(db: D1DatabaseLike, userId: string): Promise<UserRow | null> {
  return db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(userId).first<UserRow>();
}

async function listModuleAccessRows(db: D1DatabaseLike): Promise<ModuleAccessRow[]> {
  const result = await db.prepare("SELECT user_id, module_id, is_enabled FROM user_module_access").all<ModuleAccessRow>();
  return result.results;
}

async function listModuleAccessRowsForUser(db: D1DatabaseLike, userId: string): Promise<ModuleAccessRow[]> {
  const result = await db
    .prepare("SELECT user_id, module_id, is_enabled FROM user_module_access WHERE user_id = ?")
    .bind(userId)
    .all<ModuleAccessRow>();

  return result.results;
}

function createEnabledModuleSet(rows: ModuleAccessRow[]): Set<string> {
  return new Set(rows.filter((row) => row.is_enabled === 1).map((row) => row.module_id));
}

function buildModuleAccessSummary(enabledModuleIds: Set<string>, modules: CourseIndexModuleCatalogEntry[]) {
  const generatedModuleIds = new Set(modules.filter((moduleEntry) => moduleEntry.is_generated).map((moduleEntry) => moduleEntry.module_id));
  const enabledIds = modules
    .map((moduleEntry) => moduleEntry.module_id)
    .filter((moduleId) => enabledModuleIds.has(moduleId));

  const generatedEnabledCount = enabledIds.filter((moduleId) => generatedModuleIds.has(moduleId)).length;

  return {
    enabled_module_ids: enabledIds,
    enabled_count: enabledIds.length,
    total_modules: modules.length,
    generated_enabled_count: generatedEnabledCount,
    planned_enabled_count: enabledIds.length - generatedEnabledCount
  };
}

function toAdminUserSummary(
  row: UserRow,
  enabledModuleIds: Set<string>,
  modules: CourseIndexModuleCatalogEntry[],
  rootSuperusers: Set<string>
): AdminUserSummary {
  const isRootSuperuser = getEffectiveIsRootSuperuser(row, rootSuperusers);
  const isSuperuser = getEffectiveIsSuperuser(row, rootSuperusers);
  const isEnabled = getEffectiveIsEnabled(row, rootSuperusers);

  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name,
    first_login_at: row.first_login_at,
    last_login_at: row.last_login_at,
    role: isSuperuser ? "superuser" : row.role,
    is_superuser: isSuperuser,
    is_root_superuser: isRootSuperuser,
    is_enabled: isEnabled,
    is_test_mode: Boolean(row.is_test_mode),
    module_access_summary: buildModuleAccessSummary(enabledModuleIds, modules)
  };
}

function toAdminUserDetail(
  row: UserRow,
  enabledModuleIds: Set<string>,
  modules: CourseIndexModuleCatalogEntry[],
  rootSuperusers: Set<string>
): AdminUserDetail {
  const summary = toAdminUserSummary(row, enabledModuleIds, modules, rootSuperusers);
  const moduleAccess: AdminModuleAccessEntry[] = modules.map((moduleEntry) => ({
    ...moduleEntry,
    access_enabled: enabledModuleIds.has(moduleEntry.module_id)
  }));

  return {
    ...summary,
    module_access: moduleAccess
  };
}

function sortAdminUsers(left: AdminUserSummary, right: AdminUserSummary): number {
  const leftRank = left.is_root_superuser ? 0 : left.is_superuser ? 1 : 2;
  const rightRank = right.is_root_superuser ? 0 : right.is_superuser ? 1 : 2;

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  return left.email.localeCompare(right.email);
}

export async function getAdminSummary(
  db: D1DatabaseLike,
  modules: CourseIndexModuleCatalogEntry[],
  rootSuperusers: Set<string>
): Promise<AdminSummaryResponse["summary"]> {
  const users = await listUserRows(db);
  const moduleAccessRows = await listModuleAccessRows(db);
  const moduleAccessByUser = new Map<string, Set<string>>();

  for (const row of moduleAccessRows) {
    if (row.is_enabled !== 1) {
      continue;
    }

    const existing = moduleAccessByUser.get(row.user_id) ?? new Set<string>();
    existing.add(row.module_id);
    moduleAccessByUser.set(row.user_id, existing);
  }

  return users.reduce<AdminSummaryResponse["summary"]>(
    (summary, row) => {
      const enabledModuleIds = moduleAccessByUser.get(row.id) ?? new Set<string>();
      const user = toAdminUserSummary(row, enabledModuleIds, modules, rootSuperusers);

      summary.total_users += 1;
      summary.enabled_users += user.is_enabled ? 1 : 0;
      summary.disabled_users += user.is_enabled ? 0 : 1;
      summary.test_mode_users += user.is_test_mode ? 1 : 0;
      summary.superusers += user.is_superuser ? 1 : 0;
      summary.root_superusers += user.is_root_superuser ? 1 : 0;
      summary.users_with_module_01 += user.module_access_summary.enabled_module_ids.includes("module-01") ? 1 : 0;

      return summary;
    },
    {
      total_users: 0,
      enabled_users: 0,
      disabled_users: 0,
      test_mode_users: 0,
      superusers: 0,
      root_superusers: 0,
      users_with_module_01: 0
    }
  );
}

export async function listAdminUsers(
  db: D1DatabaseLike,
  modules: CourseIndexModuleCatalogEntry[],
  rootSuperusers: Set<string>
): Promise<AdminUserSummary[]> {
  const users = await listUserRows(db);
  const moduleAccessRows = await listModuleAccessRows(db);
  const moduleAccessByUser = new Map<string, Set<string>>();

  for (const row of moduleAccessRows) {
    if (row.is_enabled !== 1) {
      continue;
    }

    const existing = moduleAccessByUser.get(row.user_id) ?? new Set<string>();
    existing.add(row.module_id);
    moduleAccessByUser.set(row.user_id, existing);
  }

  return users
    .map((row) => toAdminUserSummary(row, moduleAccessByUser.get(row.id) ?? new Set<string>(), modules, rootSuperusers))
    .sort(sortAdminUsers);
}

export async function getAdminUserDetail(
  db: D1DatabaseLike,
  userId: string,
  modules: CourseIndexModuleCatalogEntry[],
  rootSuperusers: Set<string>
): Promise<AdminUserDetail | null> {
  const user = await getUserRowById(db, userId);
  if (!user) {
    return null;
  }

  const moduleAccessRows = await listModuleAccessRowsForUser(db, userId);
  return toAdminUserDetail(user, createEnabledModuleSet(moduleAccessRows), modules, rootSuperusers);
}

export async function updateAdminUserState(
  db: D1DatabaseLike,
  userId: string,
  updates: {
    is_enabled?: boolean;
    is_test_mode?: boolean;
  },
  modules: CourseIndexModuleCatalogEntry[],
  rootSuperusers: Set<string>
): Promise<AdminUserDetail | null> {
  const user = await getUserRowById(db, userId);
  if (!user) {
    return null;
  }

  const isRootSuperuser = getEffectiveIsRootSuperuser(user, rootSuperusers);
  if (isRootSuperuser && updates.is_enabled === false) {
    throw new Error("root_superuser_protected");
  }

  const nextIsEnabled = isRootSuperuser ? 1 : updates.is_enabled === undefined ? user.is_enabled : updates.is_enabled ? 1 : 0;
  const nextIsTestMode = updates.is_test_mode === undefined ? user.is_test_mode : updates.is_test_mode ? 1 : 0;
  const timestamp = nowIso();

  await db
    .prepare(
      `UPDATE users
        SET is_enabled = ?,
            is_test_mode = ?,
            updated_at = ?
      WHERE id = ?`
    )
    .bind(nextIsEnabled, nextIsTestMode, timestamp, userId)
    .run();

  return getAdminUserDetail(db, userId, modules, rootSuperusers);
}

export async function updateAdminUserModuleAccess(
  db: D1DatabaseLike,
  userId: string,
  updates: Array<{
    module_id: string;
    is_enabled: boolean;
  }>,
  modules: CourseIndexModuleCatalogEntry[],
  rootSuperusers: Set<string>
): Promise<AdminUserDetail | null> {
  const user = await getUserRowById(db, userId);
  if (!user) {
    return null;
  }

  const validModuleIds = new Set(modules.map((moduleEntry) => moduleEntry.module_id));
  const timestamp = nowIso();

  for (const update of updates) {
    if (!validModuleIds.has(update.module_id)) {
      throw new Error(`invalid_module_id:${update.module_id}`);
    }

    await db
      .prepare(
        `INSERT INTO user_module_access (
          id, user_id, module_id, is_enabled, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, module_id) DO UPDATE SET
          is_enabled = excluded.is_enabled,
          updated_at = excluded.updated_at`
      )
      .bind(crypto.randomUUID(), userId, update.module_id, update.is_enabled ? 1 : 0, timestamp, timestamp)
      .run();
  }

  return getAdminUserDetail(db, userId, modules, rootSuperusers);
}

export async function assertAdminActorCanManageUsers(
  db: D1DatabaseLike,
  actorUserId: string,
  rootSuperusers: Set<string>
): Promise<boolean> {
  const actor = await getUserRowById(db, actorUserId);
  if (!actor) {
    return false;
  }

  return canRowAccessAdmin(actor, rootSuperusers);
}
