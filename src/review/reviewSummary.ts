import { getModuleBundle, getModuleCatalog } from "../content/courseContent";
import type {
  AssetBinding,
  ReviewSummaryModuleFlags,
  ReviewSummaryResponse
} from "../types";

const SUPPORTED_RESPONSE_TYPES = new Set([
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
  "self_check",
  "teacher_observed_speaking",
  "speaking_prompt",
  "context_display",
  "reading_text",
  "reading_passages"
]);

function emptyModuleFlags(moduleId: string, moduleTitle: string): ReviewSummaryModuleFlags {
  return {
    module_id: moduleId,
    module_title: moduleTitle,
    total_weeks: 0,
    total_activities: 0,
    missing_or_non_generated_assets: 0,
    broken_asset_references: 0,
    teacher_review_required_activities: 0,
    revision_supported_activities: 0,
    speaking_activities: 0,
    listening_activities: 0,
    app_checkable_activities: 0,
    not_submitted_activities: 0,
    renderer_gap_activities: 0
  };
}

function hasRendererGap(activity: {
  primary_interaction_type: string;
  input?: { items?: Array<{ response_type?: string }> };
}): boolean {
  const items = activity.input?.items ?? [];

  if (items.some((item) => item.response_type && !SUPPORTED_RESPONSE_TYPES.has(item.response_type))) {
    return true;
  }

  if (items.length === 0) {
    return !["teacher_observed_speaking", "structured_text"].includes(activity.primary_interaction_type);
  }

  return false;
}

export async function buildReviewSummary(
  assets: AssetBinding,
  origin: string
): Promise<ReviewSummaryResponse["summary"]> {
  const moduleCatalog = await getModuleCatalog(assets, origin);
  const generatedModules = moduleCatalog.filter((moduleEntry) => moduleEntry.is_generated);
  const modules: ReviewSummaryModuleFlags[] = [];

  const totals = {
    modules_scanned: 0,
    total_activities: 0,
    missing_or_non_generated_assets: 0,
    broken_asset_references: 0,
    teacher_review_required_activities: 0,
    revision_supported_activities: 0,
    speaking_activities: 0,
    listening_activities: 0,
    app_checkable_activities: 0,
    not_submitted_activities: 0,
    renderer_gap_activities: 0
  };

  for (const moduleEntry of generatedModules) {
    const bundle = await getModuleBundle(assets, origin, moduleEntry.module_id);
    if (!bundle) {
      continue;
    }

    const moduleFlags = emptyModuleFlags(bundle.module_id, bundle.title);
    moduleFlags.total_weeks = bundle.weeks.length;

    for (const week of bundle.weeks) {
      const assetMap = new Map((week.asset_manifest?.assets ?? []).map((asset) => [asset.asset_id, asset]));

      for (const activity of week.activities.activities) {
        moduleFlags.total_activities += 1;

        if (activity.teacher_review_required) {
          moduleFlags.teacher_review_required_activities += 1;
        }
        if (activity.revision_supported) {
          moduleFlags.revision_supported_activities += 1;
        }
        if (activity.primary_interaction_type.includes("speaking")) {
          moduleFlags.speaking_activities += 1;
        }
        if (activity.primary_interaction_type.includes("listen")) {
          moduleFlags.listening_activities += 1;
        }
        if (activity.checked_by === "app") {
          moduleFlags.app_checkable_activities += 1;
        }
        if (activity.submission_type === "not_submitted") {
          moduleFlags.not_submitted_activities += 1;
        }
        if (hasRendererGap(activity)) {
          moduleFlags.renderer_gap_activities += 1;
        }

        for (const assetRef of activity.asset_refs ?? []) {
          const asset = assetMap.get(assetRef);
          if (!asset) {
            moduleFlags.broken_asset_references += 1;
            continue;
          }

          if (asset.status !== "generated") {
            moduleFlags.missing_or_non_generated_assets += 1;
          }
        }
      }
    }

    totals.modules_scanned += 1;
    totals.total_activities += moduleFlags.total_activities;
    totals.missing_or_non_generated_assets += moduleFlags.missing_or_non_generated_assets;
    totals.broken_asset_references += moduleFlags.broken_asset_references;
    totals.teacher_review_required_activities += moduleFlags.teacher_review_required_activities;
    totals.revision_supported_activities += moduleFlags.revision_supported_activities;
    totals.speaking_activities += moduleFlags.speaking_activities;
    totals.listening_activities += moduleFlags.listening_activities;
    totals.app_checkable_activities += moduleFlags.app_checkable_activities;
    totals.not_submitted_activities += moduleFlags.not_submitted_activities;
    totals.renderer_gap_activities += moduleFlags.renderer_gap_activities;
    modules.push(moduleFlags);
  }

  return {
    comments: {
      total: 0,
      unread: 0,
      in_progress: 0,
      completed: 0,
      high_or_blocker: 0
    },
    quick_flags: totals,
    modules
  };
}
