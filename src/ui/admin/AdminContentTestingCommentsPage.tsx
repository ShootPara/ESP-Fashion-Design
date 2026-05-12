import { Link } from "react-router-dom";
import { useAdminContentTestingComments } from "./useAdminContentTesting";

function formatDate(value: string) {
  return value ? new Date(value).toLocaleString() : "-";
}

export function AdminContentTestingCommentsPage() {
  const { comments, loading, error } = useAdminContentTestingComments();

  return (
    <section className="stack-lg">
      <section className="hero-panel">
        <div>
          <Link className="text-link" to="/admin">
            Back to admin
          </Link>
          <p className="eyebrow">Admin review</p>
          <h2>Content testing data</h2>
          <p>Review submitted testing comments with context, severity, and workflow status.</p>
        </div>
        <div className="hero-panel__meta">
          <span className="status-chip neutral">{comments.length} comments</span>
        </div>
      </section>

      {loading ? (
        <section className="card-surface">
          <p className="muted">Loading content testing comments...</p>
        </section>
      ) : error ? (
        <section className="empty-state card-surface danger-surface">
          <h3>Content testing data unavailable</h3>
          <p>{error}</p>
        </section>
      ) : (
        <section className="card-surface admin-table">
          <div className="admin-table__header admin-comment-row">
            <strong>Comment</strong>
            <strong>Context</strong>
            <strong>Triage</strong>
            <strong>Submitted</strong>
          </div>
          {comments.map((comment) => (
            <Link
              key={comment.id}
              className="admin-comment-row admin-user-row--link"
              to={`/admin/content-testing-comments/${comment.id}`}
            >
              <div className="admin-user-main">
                <strong>{comment.user_display_name_snapshot || comment.user_email_snapshot}</strong>
                <span>{comment.user_email_snapshot}</span>
                <p className="admin-comment-preview">{comment.comment_text}</p>
              </div>
              <div className="admin-user-meta">
                <span>{comment.module_id}</span>
                <span>{comment.week_id || "-"}</span>
                <span>{comment.activity_id || "-"}</span>
                <span>{comment.screen_context}</span>
              </div>
              <div className="chip-wrap">
                <span className="status-chip neutral">{comment.category}</span>
                <span className={`status-chip ${comment.severity === "blocker" || comment.severity === "high" ? "warn" : "neutral"}`}>
                  {comment.severity}
                </span>
                <span className={`status-chip ${comment.status === "completed" ? "success" : comment.status === "in_progress" ? "accent" : "neutral"}`}>
                  {comment.status}
                </span>
              </div>
              <div className="admin-user-meta">
                <span>{formatDate(comment.created_at)}</span>
                <span>Updated: {formatDate(comment.updated_at)}</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </section>
  );
}
