import { Link } from "react-router-dom";
import { useAdminUsers } from "./useAdminUsers";

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

export function AdminUsersPage() {
  const { users, loading, error } = useAdminUsers();

  return (
    <section className="stack-lg">
      <section className="hero-panel">
        <div>
          <Link className="text-link" to="/admin">
            Back to admin
          </Link>
          <p className="eyebrow">Admin users</p>
          <h2>User list</h2>
          <p>Review account state, login history, and access summaries before opening an individual profile.</p>
        </div>
        <div className="hero-panel__meta">
          <span className="status-chip neutral">{users.length} users</span>
        </div>
      </section>

      {loading ? (
        <section className="card-surface">
          <p className="muted">Loading users...</p>
        </section>
      ) : error ? (
        <section className="empty-state card-surface danger-surface">
          <h3>User list unavailable</h3>
          <p>{error}</p>
        </section>
      ) : (
        <section className="card-surface admin-table">
          <div className="admin-table__header admin-user-row">
            <strong>User</strong>
            <strong>Logins</strong>
            <strong>State</strong>
            <strong>Module access</strong>
          </div>
          {users.map((user) => (
            <Link key={user.id} className="admin-user-row admin-user-row--link" to={`/admin/users/${user.id}`}>
              <div className="admin-user-main">
                <strong>{user.display_name || user.email}</strong>
                <span>{user.email}</span>
              </div>
              <div className="admin-user-meta">
                <span>First: {formatDate(user.first_login_at)}</span>
                <span>Last: {formatDate(user.last_login_at)}</span>
              </div>
              <div className="chip-wrap">
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
              <div className="admin-user-meta">
                <span>
                  {user.module_access_summary.enabled_count}/{user.module_access_summary.total_modules} enabled
                </span>
                <span>
                  {user.module_access_summary.generated_enabled_count} generated • {user.module_access_summary.planned_enabled_count} planned
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </section>
  );
}
