import type { ContentTestingCommentContext, ContentTestingCommentScreenContext } from "../types";
import {
  CONTENT_TESTING_COMMENT_CATEGORY_OPTIONS,
  CONTENT_TESTING_COMMENT_SEVERITY_OPTIONS,
  useContentTestingCommentForm
} from "./useContentTestingCommentForm";

function formatCategory(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
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
        <h3>Review note</h3>
        <span className="status-chip neutral">{props.screenContext} review</span>
      </div>
      <p className="muted">
        Tell us what you noticed on this page. Add the detail that will help us fix it, and we will attach the page location automatically.
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
        <span>What did you notice?</span>
        <textarea
          className="text-area"
          onChange={(event) => form.setCommentText(event.target.value)}
          placeholder="What seems wrong, confusing, or missing?"
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
          {form.saving ? "Saving note..." : "Submit note"}
        </button>
      </div>
      {form.statusMessage ? <p className="review-note">{form.statusMessage}</p> : null}
      {form.latestComment ? <p className="review-note">Saved as {formatCategory(form.latestComment.status)}.</p> : null}
      {form.error ? <p className="feedback-line is-incorrect">{form.error}</p> : null}
    </section>
  );
}
