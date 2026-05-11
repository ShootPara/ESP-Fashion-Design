import type {
  ActivityAnswerPayload,
  ActivityInputItem,
  AppCheckItemResult,
  AppCheckResult,
  ModuleActivity
} from "../types";

function normalizeValue(value: string | boolean | undefined | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function itemLabel(item: ActivityInputItem, index: number): string {
  return item.label_en || item.prompt_en || `Prompt ${index + 1}`;
}

function resolveSingleAnswers(item: ActivityInputItem): string[] {
  if (Array.isArray(item.correct_answers) && item.correct_answers.length > 0) {
    return item.correct_answers.map((value) => normalizeValue(value));
  }

  if (item.correct_answer !== undefined) {
    return [normalizeValue(item.correct_answer)];
  }

  return [];
}

function resolveAcceptedAnswers(item: ActivityInputItem): string[] {
  return (item.accepted_answers ?? []).map((value) => normalizeValue(value));
}

function formatSingleExpected(item: ActivityInputItem): string | string[] | undefined {
  if (Array.isArray(item.correct_answers) && item.correct_answers.length > 0) {
    return item.correct_answers;
  }

  if (item.correct_answer !== undefined) {
    return String(item.correct_answer);
  }

  return undefined;
}

function resolveMatchingAnswerMap(item: ActivityInputItem): Record<string, string> {
  if (item.correct_matches) {
    return item.correct_matches;
  }

  if (item.matches?.length) {
    return item.matches.reduce<Record<string, string>>((map, match) => {
      const prompt = match.image_key || match.term_en || "";
      const answer = match.target_key || match.answer_en || "";
      if (prompt && answer) {
        map[prompt] = answer;
      }
      return map;
    }, {});
  }

  if (item.pairs?.length) {
    return item.pairs.reduce<Record<string, string>>((map, pair) => {
      const prompt = pair.pt || pair.term_pt || "";
      const answer = pair.en || pair.term_en || "";
      if (prompt && answer) {
        map[prompt] = answer;
      }
      return map;
    }, {});
  }

  if (item.category_matches?.length) {
    return item.category_matches.reduce<Record<string, string>>((map, pair) => {
      map[pair.term_en] = pair.category;
      return map;
    }, {});
  }

  return {};
}

export function isAppCheckableResponseType(responseType: string | undefined): boolean {
  return [
    "single_choice",
    "true_false",
    "read_and_choose",
    "listen_and_choose",
    "reading_match",
    "multiple_choice",
    "word_bank_fill_blank",
    "sentence_frame_completion",
    "correction_task",
    "corrected_sentence",
    "image_match",
    "translation_match",
    "category_sort",
    "word_ordering"
  ].includes(responseType ?? "");
}

export function hasRealSavedResponse(activity: ModuleActivity): boolean {
  if (
    activity.submission_type === "teacher_observed_speaking" ||
    activity.primary_interaction_type === "teacher_observed_speaking"
  ) {
    return false;
  }

  return (activity.input?.items ?? []).some((item) =>
    [
      "single_choice",
      "true_false",
      "read_and_choose",
      "listen_and_choose",
      "reading_match",
      "multiple_choice",
      "word_bank_fill_blank",
      "sentence_frame_completion",
      "correction_task",
      "corrected_sentence",
      "image_match",
      "translation_match",
      "category_sort",
      "word_ordering",
      "structured_text",
      "self_check"
    ].includes(item.response_type ?? "")
  );
}

export function evaluateActivitySubmission(
  activity: ModuleActivity,
  answer: ActivityAnswerPayload,
  checkedAt = new Date().toISOString()
): AppCheckResult | null {
  const items = activity.input?.items ?? [];
  const results: AppCheckItemResult[] = [];

  items.forEach((item, index) => {
    const responseType = item.response_type ?? "";
    if (!isAppCheckableResponseType(responseType)) {
      return;
    }

    const submitted = answer.items[String(index)]?.value;
    const label = itemLabel(item, index);

    switch (responseType) {
      case "single_choice":
      case "true_false":
      case "read_and_choose":
      case "listen_and_choose":
      case "reading_match": {
        const expected = resolveSingleAnswers(item);
        const received = Array.isArray(submitted) ? submitted.map((value) => normalizeValue(String(value))) : [normalizeValue(String(submitted ?? ""))];
        results.push({
          item_index: index,
          response_type: responseType,
          prompt_label: label,
          is_correct: JSON.stringify([...received].sort()) === JSON.stringify([...expected].sort()),
          expected: formatSingleExpected(item),
          received: submitted
        });
        return;
      }
      case "multiple_choice": {
        const expected = resolveSingleAnswers(item);
        const received = Array.isArray(submitted) ? submitted.map((value) => normalizeValue(String(value))) : [];
        results.push({
          item_index: index,
          response_type: responseType,
          prompt_label: label,
          is_correct: JSON.stringify([...received].sort()) === JSON.stringify([...expected].sort()),
          expected: formatSingleExpected(item),
          received: submitted
        });
        return;
      }
      case "word_bank_fill_blank":
      case "sentence_frame_completion":
      case "correction_task":
      case "corrected_sentence": {
        const expected = resolveAcceptedAnswers(item);
        const received = normalizeValue(String(submitted ?? ""));
        results.push({
          item_index: index,
          response_type: responseType,
          prompt_label: label,
          is_correct: expected.includes(received),
          expected: item.accepted_answers ?? [],
          received: submitted
        });
        return;
      }
      case "image_match":
      case "translation_match":
      case "category_sort": {
        const expected = resolveMatchingAnswerMap(item);
        const received = typeof submitted === "object" && submitted !== null ? (submitted as Record<string, string>) : {};
        const isCorrect =
          Object.keys(expected).length > 0 &&
          Object.entries(expected).every(([key, value]) => normalizeValue(received[key]) === normalizeValue(value));
        results.push({
          item_index: index,
          response_type: responseType,
          prompt_label: label,
          is_correct: isCorrect,
          expected,
          received: submitted
        });
        return;
      }
      case "word_ordering": {
        const expected = (item.correct_order ?? []).map((value) => normalizeValue(value));
        const received = Array.isArray(submitted) ? submitted.map((value) => normalizeValue(String(value))) : [];
        results.push({
          item_index: index,
          response_type: responseType,
          prompt_label: label,
          is_correct: JSON.stringify(received) === JSON.stringify(expected),
          expected: item.correct_order ?? [],
          received: submitted
        });
        return;
      }
      default:
        return;
    }
  });

  if (results.length === 0) {
    return null;
  }

  const score = results.filter((result) => result.is_correct).length;

  return {
    checked_at: checkedAt,
    is_correct: score === results.length,
    score,
    max_score: results.length,
    items: results
  };
}
