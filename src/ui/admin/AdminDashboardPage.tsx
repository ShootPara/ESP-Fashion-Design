import { Link } from "react-router-dom";
import type { MeResponse } from "../../types";
import { useAdminSummary } from "./useAdminUsers";

function AdminStatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function AdminDashboardPage({ me }: { me: MeResponse }) {
  const { summary, loading, error } = useAdminSummary();

  return (
    <section className="stack-lg">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>User management dashboard</h2>
          <p>Manage student access, test mode, and planned module availability without leaving the Worker-based LMS.</p>
        </div>
        <div className="hero-panel__meta">
          <span className="status-chip accent">{me.user.is_root_superuser ? "root superuser" : "superuser"}</span>
          <span className="status-chip neutral">{me.user.email}</span>
        </div>
      </section>

      {loading ? (
        <section className="card-surface">
          <p className="muted">Loading admin summary...</p>
        </section>
      ) : error || !summary ? (
        <section className="empty-state card-surface danger-surface">
          <h3>Admin summary unavailable</h3>
          <p>{error || "Unable to load admin summary."}</p>
        </section>
      ) : (
        <section className="stats-grid">
          <AdminStatCard label="total users" value={summary.total_users} />
          <AdminStatCard label="enabled users" value={summary.enabled_users} />
          <AdminStatCard label="disabled users" value={summary.disabled_users} />
          <AdminStatCard label="test mode users" value={summary.test_mode_users} />
          <AdminStatCard label="superusers" value={summary.superusers} />
          <AdminStatCard label="root superusers" value={summary.root_superusers} />
        </section>
      )}

      <section className="admin-link-grid">
        <Link className="module-card" to="/admin/users">
          <div className="module-card__header">
            <p className="eyebrow">Users</p>
            <span className="status-chip neutral">Milestone 4</span>
          </div>
          <h3>User management</h3>
          <p>Open the user list, review login metadata, and manage enabled state, test mode, and module access.</p>
        </Link>

        <section className="module-card">
          <div className="module-card__header">
            <p className="eyebrow">Later milestone</p>
            <span className="status-chip neutral">placeholder</span>
          </div>
          <h3>Content testing data</h3>
          <p>This remains intentionally out of scope for Milestone 4 and will land with the review dashboard work.</p>
        </section>
      </section>
    </section>
  );
}
