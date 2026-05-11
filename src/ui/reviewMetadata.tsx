import type { ModuleActivity, ModuleWeekBundle } from "../types";
import { getActivityAssets } from "./assetPaths";

function renderList(values: string[] | undefined, emptyLabel: string) {
  if (!values || values.length === 0) {
    return <p className="meta-empty">{emptyLabel}</p>;
  }

  return (
    <div className="chip-wrap">
      {values.map((value) => (
        <span key={value} className="status-chip neutral">
          {value}
        </span>
      ))}
    </div>
  );
}

export function ReviewMetadataPanel({
  week,
  activity
}: {
  week: ModuleWeekBundle;
  activity: ModuleActivity;
}) {
  const assets = getActivityAssets(week, activity);
  const expectedOutput = activity.expected_output;

  return (
    <aside className="review-panel">
      <div className="review-panel__header">
        <p className="eyebrow">Review Metadata</p>
        <h3>Activity review details</h3>
      </div>

      <div className="review-grid">
        <div className="review-cell">
          <span className="review-label">Activity ID</span>
          <strong>{activity.activity_id}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">Week ID</span>
          <strong>{activity.week_id}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">Sequence</span>
          <strong>{activity.sequence_number}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">Estimated minutes</span>
          <strong>{activity.estimated_minutes}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">Activity type</span>
          <strong>{activity.activity_type}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">Primary interaction</span>
          <strong>{activity.primary_interaction_type}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">Submission type</span>
          <strong>{activity.submission_type}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">Checked by</span>
          <strong>{activity.checked_by}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">Teacher review</span>
          <strong>{activity.teacher_review_required ? "Required" : "No"}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">Revision supported</span>
          <strong>{activity.revision_supported ? "Yes" : "No"}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">CEFR access</span>
          <strong>{activity.cefr_access_level || "Not set"}</strong>
        </div>
        <div className="review-cell">
          <span className="review-label">CEFR target</span>
          <strong>{activity.cefr_target_level || "Not set"}</strong>
        </div>
      </div>

      <section className="review-section">
        <h4>Skill focus</h4>
        {renderList(activity.skill_focus, "No skill focus metadata.")}
      </section>

      <section className="review-section">
        <h4>Expected output</h4>
        {expectedOutput ? (
          <div className="review-copy">
            <p>
              <strong>{expectedOutput.mode}</strong>
            </p>
            <p>{expectedOutput.description_en}</p>
            <p className="muted">{expectedOutput.length_or_format}</p>
          </div>
        ) : (
          <p className="meta-empty">No expected output metadata.</p>
        )}
      </section>

      <section className="review-section">
        <h4>Assessment mode</h4>
        <p>{activity.assessment?.mode || "Not set"}</p>
      </section>

      <section className="review-section">
        <h4>Assets</h4>
        {assets.length === 0 ? (
          <p className="meta-empty">No asset refs.</p>
        ) : (
          <div className="review-asset-list">
            {assets.map((asset) => (
              <div key={asset.assetId} className="review-asset-row">
                <div>
                  <strong>{asset.assetId}</strong>
                  <p>{asset.title}</p>
                </div>
                <div className="review-asset-meta">
                  <span className="status-chip neutral">{asset.assetType}</span>
                  <span className="status-chip neutral">{asset.status}</span>
                  <code>{asset.canonicalPath || "(missing canonical path)"}</code>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="review-section">
        <h4>Vocabulary refs</h4>
        {renderList(activity.vocabulary_refs, "No vocabulary refs.")}
      </section>

      <section className="review-section">
        <h4>Notes for app design</h4>
        <p className="review-copy">{activity.notes_for_app_design || "No app design notes."}</p>
      </section>
    </aside>
  );
}
