import { Fragment, useState } from "react";
import type {
  ActivityAnswerPayload,
  ActivityInputItem,
  AppCheckItemResult,
  AppCheckResult,
  ModuleActivity,
  ModuleWeekBundle
} from "../types";
import { findAssetById, getActivityAssets, type AssetReferenceState } from "./assetPaths";

interface ActivityRendererProps {
  activity: ModuleActivity;
  week: ModuleWeekBundle;
  isReviewMode: boolean;
  answer: ActivityAnswerPayload;
  appCheckResult: AppCheckResult | null;
  setItemAnswer: (itemIndex: number, responseType: string, value: unknown) => void;
  clearItemAnswer: (itemIndex: number) => void;
  checkResponse: () => void;
  saveResponse: () => void;
  markComplete: () => void;
  hasSavedResponse: boolean;
  isAppCheckable: boolean;
  hasAnyResponse: boolean;
  isSubmitting: boolean;
  loadingState: boolean;
  statusMessage: string;
}

function normalize(value: string | boolean | undefined | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getFriendlyAssetLabel(
  week: ModuleWeekBundle,
  rawValue: string,
  fallbackLabel?: string
) {
  const asset = findAssetById(week, rawValue);
  if (asset) {
    return {
      primary: asset.displayTitle,
      secondary: asset.assetId
    };
  }

  return {
    primary: fallbackLabel || rawValue,
    secondary: rawValue
  };
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

function getItemAnswer(answer: ActivityAnswerPayload, itemIndex: number): unknown {
  return answer.items[String(itemIndex)]?.value;
}

function getItemResult(appCheckResult: AppCheckResult | null, itemIndex: number): AppCheckItemResult | null {
  return appCheckResult?.items.find((item) => item.item_index === itemIndex) ?? null;
}

function formatExpected(result: AppCheckItemResult | null): string {
  if (!result?.expected) {
    return "Not provided";
  }

  if (Array.isArray(result.expected)) {
    return result.expected.join(", ");
  }

  if (typeof result.expected === "object") {
    return Object.entries(result.expected)
      .map(([key, value]) => `${key} -> ${value}`)
      .join(", ");
  }

  return String(result.expected);
}

function hasValueForItem(item: ActivityInputItem, value: unknown): boolean {
  switch (item.response_type) {
    case "single_choice":
    case "true_false":
    case "read_and_choose":
    case "listen_and_choose":
    case "reading_match":
    case "multiple_choice":
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    case "word_bank_fill_blank":
    case "sentence_frame_completion":
    case "correction_task":
    case "corrected_sentence":
      return typeof value === "string" && value.trim().length > 0;
    case "image_match":
    case "translation_match":
    case "category_sort":
      return typeof value === "object" && value !== null && Object.keys(value as Record<string, string>).length > 0;
    case "word_ordering":
      return Array.isArray(value) && value.every((entry) => String(entry ?? "").trim().length > 0);
    case "structured_text":
    case "self_check":
      return (
        typeof value === "object" &&
        value !== null &&
        Object.values(value as Record<string, string>).some((entry) => String(entry ?? "").trim().length > 0)
      );
    default:
      return false;
  }
}

function isInteractiveCheckableItem(item: ActivityInputItem): boolean {
  return !["structured_text", "self_check", "context_display", "reading_text", "reading_passages"].includes(
    item.response_type ?? ""
  );
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
          <h4 className="media-card__title" title={asset.displayTitle}>
            {asset.displayTitle}
          </h4>
          {isReviewMode ? (
            <details className="technical-details">
              <summary>Technical details</summary>
              <div className="technical-details__body">
                <code>{asset.assetId}</code>
                <code>{asset.canonicalPath}</code>
              </div>
            </details>
          ) : null}
        </div>
        <audio controls preload="none" onError={() => setFailed(true)} src={asset.runtimeUrl} className="audio-player" />
      </div>
    );
  }

  if (asset.assetType === "image") {
    return (
      <figure className="media-card">
        <img alt={asset.displayTitle} className="media-card__image" onError={() => setFailed(true)} src={asset.runtimeUrl} />
        <figcaption className="media-card__meta">
          <strong className="media-card__title" title={asset.displayTitle}>
            {asset.displayTitle}
          </strong>
          {isReviewMode ? (
            <details className="technical-details">
              <summary>Technical details</summary>
              <div className="technical-details__body">
                <code>{asset.assetId}</code>
                <code>{asset.canonicalPath}</code>
              </div>
            </details>
          ) : null}
        </figcaption>
      </figure>
    );
  }

  return null;
}

function ItemFeedback({ result }: { result: AppCheckItemResult | null }) {
  if (!result) {
    return null;
  }

  return (
    <p className={`feedback-line ${result.is_correct ? "is-correct" : "is-incorrect"}`}>
      {result.is_correct ? "Correct." : `Not quite. Expected: ${formatExpected(result)}`}
    </p>
  );
}

function ChoiceItem({
  item,
  index,
  multiple = false,
  answer,
  setItemAnswer,
  clearItemAnswer,
  checkResponse,
  isAppCheckable,
  itemResult
}: {
  item: ActivityInputItem;
  index: number;
  multiple?: boolean;
  answer: ActivityAnswerPayload;
  setItemAnswer: ActivityRendererProps["setItemAnswer"];
  clearItemAnswer: ActivityRendererProps["clearItemAnswer"];
  checkResponse: ActivityRendererProps["checkResponse"];
  isAppCheckable: boolean;
  itemResult: AppCheckItemResult | null;
}) {
  const selected = Array.isArray(getItemAnswer(answer, index)) ? (getItemAnswer(answer, index) as string[]) : [];
  const answerKey = resolveSingleCorrectAnswer(item);
  const options = item.options_en ?? [];

  function toggle(option: string) {
    if (!multiple) {
      setItemAnswer(index, item.response_type ?? "single_choice", [option]);
      return;
    }

    const next = selected.includes(option) ? selected.filter((value) => value !== option) : [...selected, option];
    setItemAnswer(index, item.response_type ?? "multiple_choice", next);
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
        {isAppCheckable ? (
          <button className="primary-button" disabled={selected.length === 0} onClick={checkResponse} type="button">
            Check answer
          </button>
        ) : null}
        <button className="secondary-button" onClick={() => clearItemAnswer(index)} type="button">
          Clear
        </button>
      </div>
      {isAppCheckable ? <ItemFeedback result={itemResult} /> : null}
      {!isAppCheckable && answerKey.length > 0 ? <p className="review-note">This activity keeps the learner response but is not app-checked in this milestone.</p> : null}
    </section>
  );
}

function FillBlankItem({
  item,
  index,
  answer,
  setItemAnswer,
  clearItemAnswer,
  checkResponse,
  isAppCheckable,
  itemResult
}: {
  item: ActivityInputItem;
  index: number;
  answer: ActivityAnswerPayload;
  setItemAnswer: ActivityRendererProps["setItemAnswer"];
  clearItemAnswer: ActivityRendererProps["clearItemAnswer"];
  checkResponse: ActivityRendererProps["checkResponse"];
  isAppCheckable: boolean;
  itemResult: AppCheckItemResult | null;
}) {
  const value = typeof getItemAnswer(answer, index) === "string" ? String(getItemAnswer(answer, index)) : "";

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
            <button
              key={word}
              className="status-chip action"
              onClick={() => setItemAnswer(index, item.response_type ?? "word_bank_fill_blank", word)}
              type="button"
            >
              {word}
            </button>
          ))}
        </div>
      ) : null}
      <input
        className="text-input"
        onChange={(event) => setItemAnswer(index, item.response_type ?? "word_bank_fill_blank", event.target.value)}
        placeholder="Type your answer"
        value={value}
      />
      <div className="question-actions">
        {isAppCheckable ? (
          <button className="primary-button" disabled={!value.trim()} onClick={checkResponse} type="button">
            Check answer
          </button>
        ) : null}
        <button className="secondary-button" onClick={() => clearItemAnswer(index)} type="button">
          Clear
        </button>
      </div>
      {isAppCheckable ? <ItemFeedback result={itemResult} /> : <p className="review-note">This response can be saved in normal mode.</p>}
    </section>
  );
}

function CorrectionItem(props: {
  item: ActivityInputItem;
  index: number;
  answer: ActivityAnswerPayload;
  setItemAnswer: ActivityRendererProps["setItemAnswer"];
  clearItemAnswer: ActivityRendererProps["clearItemAnswer"];
  checkResponse: ActivityRendererProps["checkResponse"];
  isAppCheckable: boolean;
  itemResult: AppCheckItemResult | null;
}) {
  const { item, index, answer, setItemAnswer, clearItemAnswer, checkResponse, isAppCheckable, itemResult } = props;
  const value = typeof getItemAnswer(answer, index) === "string" ? String(getItemAnswer(answer, index)) : "";

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
        onChange={(event) => setItemAnswer(index, item.response_type ?? "correction_task", event.target.value)}
        placeholder="Type the corrected sentence"
        value={value}
      />
      <div className="question-actions">
        {isAppCheckable ? (
          <button className="primary-button" disabled={!value.trim()} onClick={checkResponse} type="button">
            Check answer
          </button>
        ) : null}
        <button className="secondary-button" onClick={() => clearItemAnswer(index)} type="button">
          Clear
        </button>
      </div>
      {isAppCheckable ? <ItemFeedback result={itemResult} /> : null}
    </section>
  );
}

function MatchingItem(props: {
  item: ActivityInputItem;
  index: number;
  isReviewMode: boolean;
  week: ModuleWeekBundle;
  answer: ActivityAnswerPayload;
  setItemAnswer: ActivityRendererProps["setItemAnswer"];
  clearItemAnswer: ActivityRendererProps["clearItemAnswer"];
  checkResponse: ActivityRendererProps["checkResponse"];
  isAppCheckable: boolean;
  itemResult: AppCheckItemResult | null;
}) {
  const { item, index, isReviewMode, week, answer, setItemAnswer, clearItemAnswer, checkResponse, isAppCheckable, itemResult } = props;
  const selected =
    typeof getItemAnswer(answer, index) === "object" && getItemAnswer(answer, index) !== null
      ? (getItemAnswer(answer, index) as Record<string, string>)
      : {};
  const assetPreviews = (item.asset_ids ?? [])
    .map((assetId) => findAssetById(week, assetId))
    .filter((asset): asset is AssetReferenceState => Boolean(asset));
  const correctMap =
    item.correct_matches ??
    item.matches?.reduce<Record<string, string>>((map, match) => {
      const prompt = match.image_key || match.term_en || "";
      const response = match.target_key || match.answer_en || "";
      if (prompt && response) {
        map[prompt] = response;
      }
      return map;
    }, {}) ??
    item.pairs?.reduce<Record<string, string>>((map, pair) => {
      const prompt = pair.pt || pair.term_pt || "";
      const response = pair.en || pair.term_en || "";
      if (prompt && response) {
        map[prompt] = response;
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
  const answerChoiceLabels = new Map(
    answerChoices.map((choice, choiceIndex) => {
      const friendly = getFriendlyAssetLabel(week, choice, `Image ${choiceIndex + 1}`);
      return [choice, friendly];
    })
  );
  const prompts =
    Object.keys(correctMap).length > 0
      ? Object.keys(correctMap)
      : item.matches?.map((match) => match.image_key || match.term_en || "").filter(Boolean) ??
        item.pairs?.map((pair) => pair.pt || pair.term_pt || "").filter(Boolean) ??
        item.terms_en ??
        [];
  const asset = findAssetById(week, item.asset_id);

  function updatePrompt(prompt: string, value: string) {
    setItemAnswer(index, item.response_type ?? "image_match", {
      ...selected,
      [prompt]: value
    });
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
            <span className="match-row__label" title={prompt}>
              {prompt}
            </span>
            <select
              className="select-input"
              onChange={(event) => updatePrompt(prompt, event.target.value)}
              title={selected[prompt] ? answerChoiceLabels.get(selected[prompt])?.primary ?? selected[prompt] : "Choose an option"}
              value={selected[prompt] ?? ""}
            >
              <option value="">Choose...</option>
              {answerChoices.map((choice) => (
                <option key={choice} title={answerChoiceLabels.get(choice)?.primary ?? choice} value={choice}>
                  {answerChoiceLabels.get(choice)?.primary ?? choice}
                </option>
              ))}
            </select>
            {isReviewMode && selected[prompt] ? (
              <span className="technical-inline" title={selected[prompt]}>
                {answerChoiceLabels.get(selected[prompt])?.secondary ?? selected[prompt]}
              </span>
            ) : null}
          </label>
        ))}
      </div>
      <div className="question-actions">
        {isAppCheckable ? (
          <button
            className="primary-button"
            disabled={prompts.some((prompt) => !selected[prompt]) || prompts.length === 0}
            onClick={checkResponse}
            type="button"
          >
            Check answer
          </button>
        ) : null}
        <button className="secondary-button" onClick={() => clearItemAnswer(index)} type="button">
          Clear
        </button>
      </div>
      {isAppCheckable ? <ItemFeedback result={itemResult} /> : null}
    </section>
  );
}

function WordOrderingItem(props: {
  item: ActivityInputItem;
  index: number;
  answer: ActivityAnswerPayload;
  setItemAnswer: ActivityRendererProps["setItemAnswer"];
  clearItemAnswer: ActivityRendererProps["clearItemAnswer"];
  checkResponse: ActivityRendererProps["checkResponse"];
  isAppCheckable: boolean;
  itemResult: AppCheckItemResult | null;
}) {
  const { item, index, answer, setItemAnswer, clearItemAnswer, checkResponse, isAppCheckable, itemResult } = props;
  const expectedLength = item.correct_order?.length ?? 0;
  const selected = Array.isArray(getItemAnswer(answer, index))
    ? (getItemAnswer(answer, index) as string[])
    : new Array(expectedLength).fill("");
  const options = item.lines_en ?? [];
  const answerKey = item.correct_order ?? [];

  function updatePosition(position: number, value: string) {
    const next = [...selected];
    next[position] = value;
    setItemAnswer(index, item.response_type ?? "word_ordering", next);
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
      <div className="ordering-grid">
        {answerKey.map((_, position) => (
          <label key={position} className="match-row">
            <span>Line {position + 1}</span>
            <select className="select-input" onChange={(event) => updatePosition(position, event.target.value)} value={selected[position] ?? ""}>
              <option value="">Choose...</option>
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
        {isAppCheckable ? (
          <button className="primary-button" disabled={selected.some((value) => !value)} onClick={checkResponse} type="button">
            Check answer
          </button>
        ) : null}
        <button className="secondary-button" onClick={() => clearItemAnswer(index)} type="button">
          Clear
        </button>
      </div>
      {isAppCheckable ? <ItemFeedback result={itemResult} /> : null}
    </section>
  );
}

function StructuredTextItem(props: {
  item: ActivityInputItem;
  index: number;
  answer: ActivityAnswerPayload;
  setItemAnswer: ActivityRendererProps["setItemAnswer"];
}) {
  const { item, index, answer, setItemAnswer } = props;
  const fields =
    item.fields?.map((field) => ({ key: field.field_id, label: field.prompt_en })) ??
    item.sentence_frame_en?.split("\n").map((line, lineIndex) => ({ key: `line-${lineIndex}`, label: line })) ??
    [{ key: "response", label: itemTitle(item, index) }];
  const values =
    typeof getItemAnswer(answer, index) === "object" && getItemAnswer(answer, index) !== null
      ? (getItemAnswer(answer, index) as Record<string, string>)
      : {};

  function updateField(key: string, value: string) {
    setItemAnswer(index, item.response_type ?? "structured_text", {
      ...values,
      [key]: value
    });
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
      <div className="structured-fields">
        {fields.map((field) => (
          <label key={field.key} className="field-stack">
            <span>{field.label}</span>
            <textarea
              className="text-area"
              onChange={(event) => updateField(field.key, event.target.value)}
              placeholder="Type here"
              value={values[field.key] ?? ""}
            />
          </label>
        ))}
      </div>
      <p className="review-note">This activity can be saved in normal mode but is not auto-graded in this milestone.</p>
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
      <p className="review-note">Speaking remains teacher-observed only. Milestone 3 records completion only, not audio or scoring.</p>
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
        <p className="review-note">This prompt is shown as review/support content in the current milestone.</p>
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
  props: ActivityRendererProps
) {
  const itemResult = getItemResult(props.appCheckResult, index);
  const commonProps = {
    item,
    index,
    answer: props.answer,
    setItemAnswer: props.setItemAnswer,
    clearItemAnswer: props.clearItemAnswer,
    checkResponse: props.checkResponse,
    isAppCheckable: props.isAppCheckable,
    itemResult
  };

  switch (item.response_type) {
    case "single_choice":
    case "true_false":
    case "read_and_choose":
    case "listen_and_choose":
    case "reading_match":
      return <ChoiceItem {...commonProps} />;
    case "multiple_choice":
      return <ChoiceItem {...commonProps} multiple />;
    case "word_bank_fill_blank":
    case "sentence_frame_completion":
      return <FillBlankItem {...commonProps} />;
    case "correction_task":
    case "corrected_sentence":
      return <CorrectionItem {...commonProps} />;
    case "image_match":
    case "translation_match":
    case "category_sort":
      return <MatchingItem {...commonProps} isReviewMode={props.isReviewMode} week={props.week} />;
    case "word_ordering":
      return <WordOrderingItem {...commonProps} />;
    case "structured_text":
    case "self_check":
      return <StructuredTextItem answer={props.answer} index={index} item={item} setItemAnswer={props.setItemAnswer} />;
    case "teacher_observed_speaking":
    case "speaking_prompt":
      return <SpeakingItem activity={props.activity} />;
    case "context_display":
    case "reading_text":
    case "reading_passages":
      return <PassiveItem index={index} item={item} />;
    default:
      return <UnknownItem index={index} item={item} />;
  }
}

export function ActivityRenderer(props: ActivityRendererProps) {
  const { activity, week, isReviewMode } = props;
  const items = activity.input?.items ?? [];
  const assets = getActivityAssets(week, activity);
  const checkableItemsAnswered =
    !props.isAppCheckable ||
    items.every((item, index) =>
      isInteractiveCheckableItem(item) ? hasValueForItem(item, getItemAnswer(props.answer, index)) : true
    );

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

      {props.loadingState ? (
        <section className="card-surface">
          <p className="muted">Loading saved activity state...</p>
        </section>
      ) : null}

      <section className="stack-sm">
        {items.length > 0 ? (
          items.map((item, index) => <Fragment key={`${activity.activity_id}-${index}`}>{renderItem(item, index, props)}</Fragment>)
        ) : activity.primary_interaction_type === "teacher_observed_speaking" ? (
          <SpeakingItem activity={activity} />
        ) : activity.primary_interaction_type === "structured_text" ? (
          <StructuredTextItem
            answer={props.answer}
            index={0}
            item={{ fields: [], prompt_en: studentInstructions(activity), response_type: "structured_text" }}
            setItemAnswer={props.setItemAnswer}
          />
        ) : (
          <section className="question-card">
            <h4>Fallback review renderer</h4>
            <p>This activity has sparse input data in the generated bundle, so the shell is showing the surrounding review scaffolding.</p>
          </section>
        )}
      </section>

      <section className="card-surface stack-sm">
        <div className="section-heading">
          <h3>Activity actions</h3>
          <span className={`status-chip ${isReviewMode ? "warn" : "success"}`}>{isReviewMode ? "test mode" : "normal mode"}</span>
        </div>
        <div className="question-actions">
          {props.isAppCheckable ? (
            <button
              className="primary-button"
              disabled={!checkableItemsAnswered || props.isSubmitting}
              onClick={props.checkResponse}
              type="button"
            >
              Check answer
            </button>
          ) : null}
          {props.hasSavedResponse ? (
            <button className="secondary-button" disabled={!props.hasAnyResponse || props.isSubmitting} onClick={props.saveResponse} type="button">
              Save response
            </button>
          ) : (
            <button className="secondary-button" disabled={props.isSubmitting} onClick={props.markComplete} type="button">
              Mark complete
            </button>
          )}
        </div>
        {props.appCheckResult ? (
          <p className={`feedback-line ${props.appCheckResult.is_correct ? "is-correct" : "is-incorrect"}`}>
            Score: {props.appCheckResult.score}/{props.appCheckResult.max_score}
          </p>
        ) : null}
        {props.statusMessage ? <p className="review-note">{props.statusMessage}</p> : null}
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
