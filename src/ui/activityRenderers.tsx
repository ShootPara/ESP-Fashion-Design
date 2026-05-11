import { Fragment, useState } from "react";
import type { ActivityInputItem, ModuleActivity, ModuleWeekBundle } from "../types";
import { findAssetById, getActivityAssets, type AssetReferenceState } from "./assetPaths";

interface ActivityRendererProps {
  activity: ModuleActivity;
  week: ModuleWeekBundle;
  isReviewMode: boolean;
}

function normalize(value: string | boolean | undefined | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function studentTitle(activity: ModuleActivity) {
  return activity.student_facing?.en?.title || activity.title;
}

function studentInstructions(activity: ModuleActivity) {
  return activity.student_facing?.en?.instructions || "No student-facing instructions were provided.";
}

function itemTitle(item: ActivityInputItem, index: number) {
  return item.label_en || item.prompt_en || `Prompt ${index + 1}`;
}

function resolveSingleCorrectAnswer(item: ActivityInputItem) {
  if (Array.isArray(item.correct_answers) && item.correct_answers.length > 0) {
    return item.correct_answers.map((value) => normalize(value));
  }

  if (item.correct_answer !== undefined) {
    return [normalize(item.correct_answer)];
  }

  return [];
}

function MissingMediaCard({
  asset,
  label
}: {
  asset: AssetReferenceState;
  label: string;
}) {
  return (
    <div className="media-missing-card">
      <div>
        <p className="eyebrow">Missing media</p>
        <h4>{label}</h4>
      </div>
      <p>
        <strong>{asset.assetId}</strong> could not be loaded.
      </p>
      <code>{asset.canonicalPath || "(missing canonical path)"}</code>
    </div>
  );
}

function MediaPreview({
  asset,
  isReviewMode
}: {
  asset: AssetReferenceState;
  isReviewMode: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!asset.runtimeUrl) {
    return isReviewMode ? <MissingMediaCard asset={asset} label={asset.title} /> : null;
  }

  if (failed) {
    return isReviewMode ? <MissingMediaCard asset={asset} label={asset.title} /> : null;
  }

  if (asset.assetType === "audio") {
    return (
      <div className="media-card">
        <div className="media-card__meta">
          <p className="eyebrow">Audio asset</p>
          <h4>{asset.title}</h4>
          <code>{asset.canonicalPath}</code>
        </div>
        <audio controls preload="none" onError={() => setFailed(true)} src={asset.runtimeUrl} className="audio-player" />
      </div>
    );
  }

  if (asset.assetType === "image") {
    return (
      <figure className="media-card">
        <img alt={asset.title} className="media-card__image" onError={() => setFailed(true)} src={asset.runtimeUrl} />
        <figcaption className="media-card__meta">
          <strong>{asset.title}</strong>
          <code>{asset.canonicalPath}</code>
        </figcaption>
      </figure>
    );
  }

  return null;
}

function ChoiceItem({
  item,
  index,
  multiple = false
}: {
  item: ActivityInputItem;
  index: number;
  multiple?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const answerKey = resolveSingleCorrectAnswer(item);
  const options = item.options_en ?? [];

  function toggle(option: string) {
    setChecked(null);

    if (!multiple) {
      setSelected([option]);
      return;
    }

    setSelected((current) =>
      current.includes(option) ? current.filter((value) => value !== option) : [...current, option]
    );
  }

  function checkAnswer() {
    const sortedSelected = [...selected].map((value) => normalize(value)).sort();
    const sortedAnswers = [...answerKey].sort();
    setChecked(JSON.stringify(sortedSelected) === JSON.stringify(sortedAnswers));
  }

  return (
    <section className="question-card">
      <header className="question-card__header">
        <span className="question-number">{index + 1}</span>
        <div>
          <h4>{itemTitle(item, index)}</h4>
          {item.prompt_en ? <p>{item.prompt_en}</p> : null}
        </div>
      </header>
      <div className="choice-grid">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              className={`choice-button${active ? " is-active" : ""}`}
              onClick={() => toggle(option)}
              type="button"
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="question-actions">
        <button className="primary-button" disabled={selected.length === 0} onClick={checkAnswer} type="button">
          Check answer
        </button>
        <button
          className="secondary-button"
          onClick={() => {
            setSelected([]);
            setChecked(null);
          }}
          type="button"
        >
          Try again
        </button>
      </div>
      {checked !== null ? (
        <p className={`feedback-line ${checked ? "is-correct" : "is-incorrect"}`}>
          {checked ? "Correct." : `Not quite. Correct answer: ${answerKey.join(", ") || "Not provided"}`}
        </p>
      ) : null}
    </section>
  );
}

function FillBlankItem({ item, index }: { item: ActivityInputItem; index: number }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const accepted = (item.accepted_answers ?? []).map((answer) => normalize(answer));

  return (
    <section className="question-card">
      <header className="question-card__header">
        <span className="question-number">{index + 1}</span>
        <div>
          <h4>{itemTitle(item, index)}</h4>
          <p>{item.sentence_frame_en || item.prompt_en || "Complete the response."}</p>
        </div>
      </header>
      {item.word_bank && item.word_bank.length > 0 ? (
        <div className="chip-wrap">
          {item.word_bank.map((word) => (
            <button key={word} className="status-chip action" onClick={() => setValue(word)} type="button">
              {word}
            </button>
          ))}
        </div>
      ) : null}
      <input
        className="text-input"
        onChange={(event) => {
          setValue(event.target.value);
          setChecked(null);
        }}
        placeholder="Type your answer"
        value={value}
      />
      <div className="question-actions">
        <button
          className="primary-button"
          disabled={!value.trim() || accepted.length === 0}
          onClick={() => setChecked(accepted.includes(normalize(value)))}
          type="button"
        >
          Check answer
        </button>
        <button
          className="secondary-button"
          onClick={() => {
            setValue("");
            setChecked(null);
          }}
          type="button"
        >
          Try again
        </button>
      </div>
      {checked !== null ? (
        <p className={`feedback-line ${checked ? "is-correct" : "is-incorrect"}`}>
          {checked ? "Correct." : `Not quite. Accepted answers: ${item.accepted_answers?.join(", ") || "Not provided"}`}
        </p>
      ) : null}
    </section>
  );
}

function CorrectionItem({ item, index }: { item: ActivityInputItem; index: number }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const accepted = (item.accepted_answers ?? []).map((answer) => normalize(answer));

  return (
    <section className="question-card">
      <header className="question-card__header">
        <span className="question-number">{index + 1}</span>
        <div>
          <h4>{itemTitle(item, index)}</h4>
          {item.prompt_en ? <p>{item.prompt_en}</p> : null}
        </div>
      </header>
      <textarea
        className="text-area"
        onChange={(event) => {
          setValue(event.target.value);
          setChecked(null);
        }}
        placeholder="Type the corrected sentence"
        value={value}
      />
      <div className="question-actions">
        <button
          className="primary-button"
          disabled={!value.trim() || accepted.length === 0}
          onClick={() => setChecked(accepted.includes(normalize(value)))}
          type="button"
        >
          Check answer
        </button>
        <button
          className="secondary-button"
          onClick={() => {
            setValue("");
            setChecked(null);
          }}
          type="button"
        >
          Try again
        </button>
      </div>
      {checked !== null ? (
        <p className={`feedback-line ${checked ? "is-correct" : "is-incorrect"}`}>
          {checked ? "Correct." : `Not quite. Accepted answers: ${item.accepted_answers?.join(" / ") || "Not provided"}`}
        </p>
      ) : null}
    </section>
  );
}

function MatchingItem({
  item,
  index,
  isReviewMode,
  week
}: {
  item: ActivityInputItem;
  index: number;
  isReviewMode: boolean;
  week: ModuleWeekBundle;
}) {
  const assetPreviews = (item.asset_ids ?? [])
    .map((assetId) => findAssetById(week, assetId))
    .filter((asset): asset is AssetReferenceState => Boolean(asset));
  const correctMap =
    item.correct_matches ??
    item.matches?.reduce<Record<string, string>>((map, match) => {
      const prompt = match.image_key || match.term_en || "";
      const answer = match.target_key || match.answer_en || "";
      if (prompt && answer) {
        map[prompt] = answer;
      }
      return map;
    }, {}) ??
    item.pairs?.reduce<Record<string, string>>((map, pair) => {
      const left = pair.pt || pair.term_pt;
      const right = pair.en || pair.term_en;
      if (left && right) {
        map[left] = right;
      }
      return map;
    }, {}) ??
    item.category_matches?.reduce<Record<string, string>>((map, pair) => {
      map[pair.term_en] = pair.category;
      return map;
    }, {}) ??
    {};
  const answerChoices =
    item.asset_ids ??
    item.match_terms_en ??
    item.pairs?.map((pair) => pair.en || pair.term_en || "").filter(Boolean) ??
    item.category_targets ??
    [];
  const prompts =
    Object.keys(correctMap).length > 0
      ? Object.keys(correctMap)
      : item.matches?.map((match) => match.image_key || match.term_en || "").filter(Boolean) ??
        item.pairs?.map((pair) => pair.pt || pair.term_pt || "").filter(Boolean) ??
        item.terms_en ??
        [];
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<null | boolean>(null);
  const asset = findAssetById(week, item.asset_id);

  function checkAnswer() {
    const allCorrect = prompts.every((prompt) => normalize(selected[prompt]) === normalize(correctMap[prompt]));
    setChecked(allCorrect);
  }

  return (
    <section className="question-card">
      <header className="question-card__header">
        <span className="question-number">{index + 1}</span>
        <div>
          <h4>{itemTitle(item, index)}</h4>
          {item.prompt_en ? <p>{item.prompt_en}</p> : null}
        </div>
      </header>
      {asset ? <MediaPreview asset={asset} isReviewMode={isReviewMode} /> : null}
      {assetPreviews.length > 0 ? (
        <div className="mini-media-grid">
          {assetPreviews.map((preview) => (
            <MediaPreview key={preview.assetId} asset={preview} isReviewMode={isReviewMode} />
          ))}
        </div>
      ) : null}
      <div className="matching-grid">
        {prompts.map((prompt) => (
          <label key={prompt} className="match-row">
            <span>{prompt}</span>
            <select
              className="select-input"
              onChange={(event) => {
                setSelected((current) => ({ ...current, [prompt]: event.target.value }));
                setChecked(null);
              }}
              value={selected[prompt] ?? ""}
            >
              <option value="">Choose…</option>
              {answerChoices.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="question-actions">
        <button
          className="primary-button"
          disabled={prompts.some((prompt) => !selected[prompt]) || prompts.length === 0}
          onClick={checkAnswer}
          type="button"
        >
          Check answer
        </button>
        <button
          className="secondary-button"
          onClick={() => {
            setSelected({});
            setChecked(null);
          }}
          type="button"
        >
          Try again
        </button>
      </div>
      {checked !== null ? (
        <p className={`feedback-line ${checked ? "is-correct" : "is-incorrect"}`}>
          {checked ? "Correct." : "Not quite. Review the image keys or terms and try again."}
        </p>
      ) : null}
    </section>
  );
}

function WordOrderingItem({ item, index }: { item: ActivityInputItem; index: number }) {
  const [selected, setSelected] = useState<string[]>(() => new Array(item.correct_order?.length ?? 0).fill(""));
  const [checked, setChecked] = useState<null | boolean>(null);
  const options = item.lines_en ?? [];
  const answer = item.correct_order ?? [];

  return (
    <section className="question-card">
      <header className="question-card__header">
        <span className="question-number">{index + 1}</span>
        <div>
          <h4>{itemTitle(item, index)}</h4>
          {item.prompt_en ? <p>{item.prompt_en}</p> : null}
        </div>
      </header>
      <div className="ordering-grid">
        {answer.map((_, position) => (
          <label key={position} className="match-row">
            <span>Line {position + 1}</span>
            <select
              className="select-input"
              onChange={(event) => {
                const next = [...selected];
                next[position] = event.target.value;
                setSelected(next);
                setChecked(null);
              }}
              value={selected[position] ?? ""}
            >
              <option value="">Choose…</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="question-actions">
        <button
          className="primary-button"
          disabled={selected.some((value) => !value)}
          onClick={() =>
            setChecked(JSON.stringify(selected.map((value) => normalize(value))) === JSON.stringify(answer.map((value) => normalize(value))))
          }
          type="button"
        >
          Check answer
        </button>
        <button
          className="secondary-button"
          onClick={() => {
            setSelected(new Array(answer.length).fill(""));
            setChecked(null);
          }}
          type="button"
        >
          Try again
        </button>
      </div>
      {checked !== null ? (
        <p className={`feedback-line ${checked ? "is-correct" : "is-incorrect"}`}>
          {checked ? "Correct." : "Not quite. Review the sentence sequence and try again."}
        </p>
      ) : null}
    </section>
  );
}

function StructuredTextItem({ item, index }: { item: ActivityInputItem; index: number }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const fields =
    item.fields?.map((field) => ({ key: field.field_id, label: field.prompt_en })) ??
    item.sentence_frame_en?.split("\n").map((line, lineIndex) => ({ key: `line-${lineIndex}`, label: line })) ??
    [{ key: "response", label: itemTitle(item, index) }];

  return (
    <section className="question-card">
      <header className="question-card__header">
        <span className="question-number">{index + 1}</span>
        <div>
          <h4>{itemTitle(item, index)}</h4>
          {item.prompt_en ? <p>{item.prompt_en}</p> : null}
        </div>
      </header>
      <div className="structured-fields">
        {fields.map((field) => (
          <label key={field.key} className="field-stack">
            <span>{field.label}</span>
            <textarea
              className="text-area"
              onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              placeholder="Type here for review"
              value={values[field.key] ?? ""}
            />
          </label>
        ))}
      </div>
      <p className="review-note">
        This activity is rendered for review and drafting only. It is not auto-graded in Milestone 2.
      </p>
    </section>
  );
}

function SpeakingItem({ activity }: { activity: ModuleActivity }) {
  return (
    <section className="question-card">
      <header className="question-card__header">
        <span className="question-number">•</span>
        <div>
          <h4>Teacher-observed speaking</h4>
          <p>{studentInstructions(activity)}</p>
        </div>
      </header>
      {activity.student_facing?.en?.sentence_frames?.length ? (
        <div className="chip-wrap">
          {activity.student_facing.en.sentence_frames.map((frame) => (
            <span key={frame} className="status-chip neutral">
              {frame}
            </span>
          ))}
        </div>
      ) : null}
      {activity.assessment?.checklist_en?.length ? (
        <ul className="support-list">
          {activity.assessment.checklist_en.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <p className="review-note">
        Speaking remains teacher-observed only. Milestone 2 does not record audio or auto-score speech.
      </p>
    </section>
  );
}

function PassiveItem({ item, index }: { item: ActivityInputItem; index: number }) {
  return (
    <section className="question-card">
      <header className="question-card__header">
        <span className="question-number">{index + 1}</span>
        <div>
          <h4>{itemTitle(item, index)}</h4>
          {item.prompt_en ? <p>{item.prompt_en}</p> : null}
        </div>
      </header>
      {item.checklist_items_en?.length ? (
        <ul className="support-list">
          {item.checklist_items_en.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      ) : (
        <p className="review-note">This prompt is shown as review/support content in Milestone 2.</p>
      )}
    </section>
  );
}

function UnknownItem({ item, index }: { item: ActivityInputItem; index: number }) {
  return (
    <section className="question-card">
      <header className="question-card__header">
        <span className="question-number">{index + 1}</span>
        <div>
          <h4>{itemTitle(item, index)}</h4>
          <p>Fallback renderer for sparse or uncommon item data.</p>
        </div>
      </header>
      <pre className="raw-data-block">{JSON.stringify(item, null, 2)}</pre>
    </section>
  );
}

function renderItem(
  item: ActivityInputItem,
  index: number,
  activity: ModuleActivity,
  week: ModuleWeekBundle,
  isReviewMode: boolean
) {
  switch (item.response_type) {
    case "single_choice":
    case "true_false":
    case "read_and_choose":
    case "listen_and_choose":
    case "reading_match":
      return <ChoiceItem index={index} item={item} />;
    case "multiple_choice":
      return <ChoiceItem index={index} item={item} multiple />;
    case "word_bank_fill_blank":
    case "sentence_frame_completion":
      return <FillBlankItem index={index} item={item} />;
    case "correction_task":
    case "corrected_sentence":
      return <CorrectionItem index={index} item={item} />;
    case "image_match":
    case "translation_match":
    case "category_sort":
      return <MatchingItem index={index} isReviewMode={isReviewMode} item={item} week={week} />;
    case "word_ordering":
      return <WordOrderingItem index={index} item={item} />;
    case "structured_text":
      return <StructuredTextItem index={index} item={item} />;
    case "teacher_observed_speaking":
    case "speaking_prompt":
      return <SpeakingItem activity={activity} />;
    case "context_display":
    case "reading_text":
    case "reading_passages":
    case "self_check":
      return <PassiveItem index={index} item={item} />;
    default:
      return <UnknownItem index={index} item={item} />;
  }
}

export function ActivityRenderer({ activity, week, isReviewMode }: ActivityRendererProps) {
  const items = activity.input?.items ?? [];
  const assets = getActivityAssets(week, activity);

  return (
    <div className="activity-layout">
      <section className="activity-hero card-surface">
        <div className="activity-hero__copy">
          <p className="eyebrow">{activity.primary_interaction_type}</p>
          <h2>{studentTitle(activity)}</h2>
          <p>{activity.student_facing?.en?.summary || activity.summary}</p>
        </div>
        <div className="chip-wrap">
          <span className="status-chip neutral">{activity.submission_type}</span>
          <span className={`status-chip ${activity.checked_by === "app" ? "success" : activity.checked_by === "teacher" ? "warn" : "neutral"}`}>
            {activity.checked_by}
          </span>
          {activity.revision_supported ? <span className="status-chip accent">revision</span> : null}
        </div>
      </section>

      <section className="card-surface stack-sm">
        <div className="section-heading">
          <h3>Student instructions</h3>
          <span className="status-chip neutral">{activity.input?.input_type || "generic_input"}</span>
        </div>
        <p>{studentInstructions(activity)}</p>
        {activity.input?.prompt_en ? <p className="muted">{activity.input.prompt_en}</p> : null}
        {activity.student_facing?.en?.success_criteria?.length ? (
          <ul className="support-list">
            {activity.student_facing.en.success_criteria.map((criterion) => (
              <li key={criterion}>{criterion}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {assets.length > 0 ? (
        <section className="card-surface stack-sm">
          <div className="section-heading">
            <h3>Media</h3>
            <span className="status-chip neutral">{assets.length} linked assets</span>
          </div>
          <div className="media-grid">
            {assets.map((asset) => (
              <MediaPreview key={asset.assetId} asset={asset} isReviewMode={isReviewMode} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="stack-sm">
        {items.length > 0 ? (
          items.map((item, index) => <Fragment key={`${activity.activity_id}-${index}`}>{renderItem(item, index, activity, week, isReviewMode)}</Fragment>)
        ) : activity.primary_interaction_type === "teacher_observed_speaking" ? (
          <SpeakingItem activity={activity} />
        ) : activity.primary_interaction_type === "structured_text" ? (
          <StructuredTextItem index={0} item={{ fields: [], prompt_en: studentInstructions(activity), response_type: "structured_text" }} />
        ) : (
          <section className="question-card">
            <h4>Fallback review renderer</h4>
            <p>This activity has sparse input data in the generated bundle, so Milestone 2 is showing the surrounding review scaffolding.</p>
          </section>
        )}
      </section>

      {activity.steps?.length ? (
        <section className="card-surface stack-sm">
          <div className="section-heading">
            <h3>Sequence steps</h3>
            <span className="status-chip neutral">{activity.steps.length} steps</span>
          </div>
          <ol className="sequence-list">
            {activity.steps.map((step) => (
              <li key={step.step_number}>
                <strong>{step.title}</strong>
                <p>{step.student_action_en}</p>
                <p className="muted">
                  {step.mode} · {step.estimated_minutes} min
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
