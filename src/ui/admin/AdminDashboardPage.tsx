import { Link } from "react-router-dom";
import type { MeResponse } from "../../types";
import { useAdminSummary } from "./useAdminUsers";
import { useAdminReviewSummary } from "./useAdminContentTesting";

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
  const { summary: reviewSummary, loading: reviewLoading, error: reviewError } = useAdminReviewSummary();

  return (
    <section className="stack-lg">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>User management dashboard</h2>
          <p>Manage student access, test mode, and module availability in one place.</p>
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

      {reviewLoading ? (
        <section className="card-surface">
          <p className="muted">Loading review summary...</p>
        </section>
      ) : reviewError || !reviewSummary ? (
        <section className="empty-state card-surface danger-surface">
          <h3>Review summary unavailable</h3>
          <p>{reviewError || "Unable to load review summary."}</p>
        </section>
      ) : (
        <>
          <section className="stats-grid">
            <AdminStatCard label="unread comments" value={reviewSummary.comments.unread} />
            <AdminStatCard label="high or blocker" value={reviewSummary.comments.high_or_blocker} />
            <AdminStatCard label="missing/non-generated assets" value={reviewSummary.quick_flags.missing_or_non_generated_assets} />
            <AdminStatCard label="broken asset refs" value={reviewSummary.quick_flags.broken_asset_references} />
            <AdminStatCard label="teacher review activities" value={reviewSummary.quick_flags.teacher_review_required_activities} />
            <AdminStatCard label="renderer gap activities" value={reviewSummary.quick_flags.renderer_gap_activities} />
          </section>

          <section className="card-surface stack-sm">
            <div className="section-heading">
              <h3>Review quick flags</h3>
              <span className="status-chip neutral">{reviewSummary.quick_flags.modules_scanned} modules scanned</span>
            </div>
            <div className="review-summary-grid">
              {reviewSummary.modules.map((module) => (
                <div key={module.module_id} className="admin-control-card">
                  <strong>{module.module_title}</strong>
                  <p>{module.total_activities} activities across {module.total_weeks} weeks.</p>
                  <div className="chip-wrap">
                    <span className="status-chip neutral">{module.app_checkable_activities} app-checkable</span>
                    <span className="status-chip warn">{module.missing_or_non_generated_assets} asset issues</span>
                    <span className="status-chip accent">{module.renderer_gap_activities} renderer gaps</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
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

        <Link className="module-card" to="/admin/content-testing-comments">
          <div className="module-card__header">
            <p className="eyebrow">Review</p>
            <span className="status-chip neutral">Milestone 5</span>
          </div>
          <h3>Review notes</h3>
          <p>Open saved notes, review page details, update status, and remove notes you no longer need.</p>
        </Link>
      </section>
    </section>
  );
}
