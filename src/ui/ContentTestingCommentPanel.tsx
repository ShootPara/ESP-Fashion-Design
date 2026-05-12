import type { ContentTestingCommentContext, ContentTestingCommentScreenContext } from "../types";
import {
  CONTENT_TESTING_COMMENT_CATEGORY_OPTIONS,
  CONTENT_TESTING_COMMENT_SEVERITY_OPTIONS,
  useContentTestingCommentForm
} from "./useContentTestingCommentForm";

function formatCategory(value: string) {
  return value.replaceAll("_", " ");
}

export function ContentTestingCommentPanel(props: {
  moduleId: string;
  weekId?: string;
  activityId?: string;
  screenContext: ContentTestingCommentScreenContext;
  context: ContentTestingCommentContext;
}) {
  const form = useContentTestingCommentForm(props);

  return (
    <section className="card-surface stack-sm">
      <div className="section-heading">
        <h3>Content testing comment</h3>
        <span className="status-chip neutral">{props.screenContext} review</span>
      </div>
      <p className="muted">
        Submit a review note with automatic module, week, activity, and screen context capture for the admin triage queue.
      </p>
      <div className="review-form-grid">
        <label className="field-stack">
          <span>Category</span>
          <select className="select-input" onChange={(event) => form.setCategory(event.target.value as never)} value={form.category}>
            {CONTENT_TESTING_COMMENT_CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatCategory(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="field-stack">
          <span>Severity</span>
          <select className="select-input" onChange={(event) => form.setSeverity(event.target.value as never)} value={form.severity}>
            {CONTENT_TESTING_COMMENT_SEVERITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field-stack">
        <span>Comment</span>
        <textarea
          className="text-area"
          onChange={(event) => form.setCommentText(event.target.value)}
          placeholder="Describe the content, media, answer key, rendering, or navigation issue."
          value={form.commentText}
        />
      </label>
      <div className="chip-wrap">
        <span className="status-chip neutral">{props.moduleId}</span>
        {props.weekId ? <span className="status-chip neutral">{props.weekId}</span> : null}
        {props.activityId ? <span className="status-chip neutral">{props.activityId}</span> : null}
      </div>
      <div className="question-actions">
        <button className="primary-button" disabled={form.saving || !form.commentText.trim()} onClick={() => void form.submit()} type="button">
          {form.saving ? "Submitting..." : "Submit comment"}
        </button>
      </div>
      {form.statusMessage ? <p className="review-note">{form.statusMessage}</p> : null}
      {form.latestComment ? <p className="review-note">Saved with status `{form.latestComment.status}`.</p> : null}
      {form.error ? <p className="feedback-line is-incorrect">{form.error}</p> : null}
    </section>
  );
}
