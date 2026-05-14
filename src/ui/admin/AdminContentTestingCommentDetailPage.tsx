import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type {
  ContentTestingCommentCategory,
  ContentTestingCommentSeverity,
  ContentTestingCommentStatus
} from "../../types";
import {
  CONTENT_TESTING_COMMENT_CATEGORY_OPTIONS,
  CONTENT_TESTING_COMMENT_SEVERITY_OPTIONS
} from "../useContentTestingCommentForm";
import { useAdminContentTestingCommentDetail } from "./useAdminContentTesting";

const STATUS_OPTIONS: ContentTestingCommentStatus[] = ["unread", "read", "in_progress", "completed"];

function formatDate(value: string) {
  return value ? new Date(value).toLocaleString() : "-";
}

export function AdminContentTestingCommentDetailPage() {
  const { commentId } = useParams();
  const navigate = useNavigate();
  const { comment, loading, saving, error, statusMessage, patchComment, deleteComment } = useAdminContentTestingCommentDetail(commentId);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    const deleted = await deleteComment();
    if (deleted) {
      navigate("/admin/content-testing-comments");
    }
  }

  return (
    <section className="stack-lg">
      <section className="hero-panel">
        <div>
          <Link className="text-link" to="/admin/content-testing-comments">
            Back to review notes
          </Link>
          <p className="eyebrow">Admin review detail</p>
          <h2>{comment?.activity_id || comment?.week_id || comment?.module_id || "Loading comment..."}</h2>
          <p>{comment?.user_email_snapshot || "Review the saved note and page details."}</p>
        </div>
        {comment ? (
          <div className="hero-panel__meta">
            <span className={`status-chip ${comment.status === "completed" ? "success" : comment.status === "in_progress" ? "accent" : "neutral"}`}>
              {comment.status}
            </span>
            <span className={`status-chip ${comment.severity === "blocker" || comment.severity === "high" ? "warn" : "neutral"}`}>
              {comment.severity}
            </span>
            <span className="status-chip neutral">{comment.category}</span>
          </div>
        ) : null}
      </section>

      {loading ? (
        <section className="card-surface">
          <p className="muted">Loading review note...</p>
        </section>
      ) : error || !comment ? (
        <section className="empty-state card-surface danger-surface">
          <h3>Review note unavailable</h3>
          <p>{error || "Unable to load this review note."}</p>
        </section>
      ) : (
        <>
          <section className="stats-grid">
            <div className="stat-card">
              <strong>{formatDate(comment.created_at)}</strong>
              <span>submitted</span>
            </div>
            <div className="stat-card">
              <strong>{formatDate(comment.updated_at)}</strong>
              <span>updated</span>
            </div>
            <div className="stat-card">
              <strong>{comment.screen_context}</strong>
              <span>screen</span>
            </div>
            <div className="stat-card">
              <strong>{comment.user_display_name_snapshot || comment.user_email_snapshot}</strong>
              <span>submitter</span>
            </div>
          </section>

          <section className="card-surface stack-sm">
            <div className="section-heading">
              <h3>Saved note</h3>
              <span className="status-chip neutral">{saving ? "saving..." : "ready"}</span>
            </div>
            <p className="review-copy">{comment.comment_text}</p>
          </section>

          <section className="card-surface stack-sm">
            <div className="section-heading">
              <h3>Note controls</h3>
              <span className="status-chip neutral">{comment.id}</span>
            </div>
            <div className="review-form-grid">
              <label className="field-stack">
                <span>Status</span>
                <select
                  className="select-input"
                  disabled={saving}
                  onChange={(event) => void patchComment({ status: event.target.value as ContentTestingCommentStatus })}
                  value={comment.status}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Category</span>
                <select
                  className="select-input"
                  disabled={saving}
                  onChange={(event) => void patchComment({ category: event.target.value as ContentTestingCommentCategory })}
                  value={comment.category}
                >
                  {CONTENT_TESTING_COMMENT_CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Severity</span>
                <select
                  className="select-input"
                  disabled={saving}
                  onChange={(event) => void patchComment({ severity: event.target.value as ContentTestingCommentSeverity })}
                  value={comment.severity}
                >
                  {CONTENT_TESTING_COMMENT_SEVERITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="question-actions">
              <button className="secondary-button danger-button" disabled={saving} onClick={() => void handleDelete()} type="button">
                {deleteConfirm ? "Confirm delete" : "Delete note"}
              </button>
            </div>
            {statusMessage ? <p className="review-note">{statusMessage}</p> : null}
            {error ? <p className="feedback-line is-incorrect">{error}</p> : null}
          </section>

          <section className="card-surface stack-sm">
            <div className="section-heading">
              <h3>Page details</h3>
              <span className="status-chip neutral">{comment.context.route_path || "no route path"}</span>
            </div>
            <div className="review-grid">
              <div className="review-cell">
                <span className="review-label">Module</span>
                <strong>{comment.module_id}</strong>
              </div>
              <div className="review-cell">
                <span className="review-label">Week</span>
                <strong>{comment.week_id || "-"}</strong>
              </div>
              <div className="review-cell">
                <span className="review-label">Activity</span>
                <strong>{comment.activity_id || "-"}</strong>
              </div>
              <div className="review-cell">
                <span className="review-label">Checked by</span>
                <strong>{comment.context.checked_by || "-"}</strong>
              </div>
              <div className="review-cell">
                <span className="review-label">Interaction</span>
                <strong>{comment.context.primary_interaction_type || "-"}</strong>
              </div>
              <div className="review-cell">
                <span className="review-label">Submission type</span>
                <strong>{comment.context.submission_type || "-"}</strong>
              </div>
            </div>
            <div className="field-stack">
              <span className="review-label">Technical details</span>
              <pre className="raw-data-block">{JSON.stringify(comment.context, null, 2)}</pre>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
