import { Link, useParams } from "react-router-dom";
import type { AdminModuleAccessEntry } from "../../types";
import { useAdminUserDetail } from "./useAdminUserDetail";

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

function ModuleAccessRow({
  entry,
  saving,
  onToggle
}: {
  entry: AdminModuleAccessEntry;
  saving: boolean;
  onToggle: (entry: AdminModuleAccessEntry) => void;
}) {
  return (
    <div className="admin-module-row">
      <div>
        <strong>
          Module {entry.module_number}: {entry.title}
        </strong>
        <p>{entry.description || "Planned module metadata is present, but a generated bundle is not available yet."}</p>
      </div>
      <div className="admin-module-row__meta">
        <div className="chip-wrap">
          <span className={`status-chip ${entry.access_enabled ? "success" : "neutral"}`}>
            {entry.access_enabled ? "access enabled" : "access disabled"}
          </span>
          <span className={`status-chip ${entry.is_generated ? "success" : "warn"}`}>
            {entry.is_generated ? "generated" : "planned only"}
          </span>
          <span className="status-chip neutral">{entry.source_status}</span>
        </div>
        <button className="secondary-button" disabled={saving} onClick={() => onToggle(entry)} type="button">
          {entry.access_enabled ? "Disable access" : "Enable access"}
        </button>
      </div>
    </div>
  );
}

export function AdminUserDetailPage() {
  const { userId } = useParams();
  const { user, loading, saving, error, statusMessage, patchUserState, patchModuleAccess } = useAdminUserDetail(userId);

  function toggleModule(entry: AdminModuleAccessEntry) {
    void patchModuleAccess({
      module_access: [
        {
          module_id: entry.module_id,
          is_enabled: !entry.access_enabled
        }
      ]
    });
  }

  return (
    <section className="stack-lg">
      <section className="hero-panel">
        <div>
          <Link className="text-link" to="/admin/users">
            Back to users
          </Link>
          <p className="eyebrow">Admin user detail</p>
          <h2>{user?.display_name || user?.email || "Loading user..."}</h2>
          <p>{user?.email || "Inspecting user profile, access state, and module permissions."}</p>
        </div>
        {user ? (
          <div className="hero-panel__meta">
            <span className={`status-chip ${user.is_enabled ? "success" : "warn"}`}>
              {user.is_enabled ? "enabled" : "disabled"}
            </span>
            <span className={`status-chip ${user.is_test_mode ? "warn" : "neutral"}`}>
              {user.is_test_mode ? "test mode" : "normal mode"}
            </span>
            <span className={`status-chip ${user.is_root_superuser ? "accent" : user.is_superuser ? "success" : "neutral"}`}>
              {user.is_root_superuser ? "root superuser" : user.is_superuser ? "superuser" : "student"}
            </span>
          </div>
        ) : null}
      </section>

      {loading ? (
        <section className="card-surface">
          <p className="muted">Loading user detail...</p>
        </section>
      ) : error || !user ? (
        <section className="empty-state card-surface danger-surface">
          <h3>User detail unavailable</h3>
          <p>{error || "Unable to load user detail."}</p>
        </section>
      ) : (
        <>
          {user.is_root_superuser ? (
            <section className="card-surface admin-notice">
              <p className="eyebrow">Protected root superuser</p>
              <h3>This account is protected by `SUPERUSER_EMAILS`.</h3>
              <p>It always keeps effective admin access and cannot be disabled through the admin UI or API.</p>
            </section>
          ) : null}

          <section className="stats-grid">
            <div className="stat-card">
              <strong>{formatDate(user.first_login_at)}</strong>
              <span>first login</span>
            </div>
            <div className="stat-card">
              <strong>{formatDate(user.last_login_at)}</strong>
              <span>last login</span>
            </div>
            <div className="stat-card">
              <strong>{user.module_access_summary.enabled_count}</strong>
              <span>enabled modules</span>
            </div>
            <div className="stat-card">
              <strong>{user.module_access_summary.generated_enabled_count}</strong>
              <span>generated modules enabled</span>
            </div>
          </section>

          <section className="card-surface stack-sm">
            <div className="section-heading">
              <h3>Access controls</h3>
              <span className="status-chip neutral">{saving ? "saving..." : "ready"}</span>
            </div>
            <div className="admin-control-grid">
              <div className="admin-control-card">
                <strong>Enabled state</strong>
                <p>Disabled users are blocked from the course APIs and the student experience.</p>
                <button
                  className="primary-button"
                  disabled={saving || user.is_root_superuser}
                  onClick={() => void patchUserState({ is_enabled: !user.is_enabled })}
                  type="button"
                >
                  {user.is_enabled ? "Disable user" : "Enable user"}
                </button>
              </div>
              <div className="admin-control-card">
                <strong>Test mode</strong>
                <p>Test mode overrides normal module visibility and prevents learner progress writes.</p>
                <button
                  className="primary-button"
                  disabled={saving}
                  onClick={() => void patchUserState({ is_test_mode: !user.is_test_mode })}
                  type="button"
                >
                  {user.is_test_mode ? "Turn test mode off" : "Turn test mode on"}
                </button>
              </div>
            </div>
            {statusMessage ? <p className="review-note">{statusMessage}</p> : null}
            {error ? <p className="feedback-line is-incorrect">{error}</p> : null}
          </section>

          <section className="card-surface stack-sm">
            <div className="section-heading">
              <h3>Module access</h3>
              <span className="status-chip neutral">{user.module_access.length} modules</span>
            </div>
            <p className="muted">
              Planned modules can be pre-enabled now, but they will not appear in student mode until generated app-content exists.
            </p>
            <div className="admin-module-list">
              {user.module_access.map((entry) => (
                <ModuleAccessRow key={entry.module_id} entry={entry} onToggle={toggleModule} saving={saving} />
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
