from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
CONTENT_ROOT = ROOT / "content" / "course"
GENERATED_ROOT = ROOT / "generated"
REPORT_PATH = GENERATED_ROOT / "validation_report.md"

CEFR_LEVELS = {"A1", "A2", "B1", "B2", "C1"}
CEFR_RANGES = {"A1", "A2", "B1", "B2", "C1", "A1-A2", "A2-B1", "B1-B2", "B2-C1"}
ACTIVITY_TYPES = {
    "warmup",
    "vocabulary_matching",
    "visual_analysis",
    "listening_comprehension",
    "pronunciation_practice",
    "guided_speaking",
    "role_play",
    "reading_comprehension",
    "writing_short_response",
    "writing_professional_text",
    "design_description",
    "peer_feedback",
    "presentation",
    "reflection",
    "assessment_task",
    "custom",
}
PRIMARY_INTERACTION_TYPES = {
    "single_choice",
    "multiple_choice",
    "true_false",
    "image_match",
    "translation_match",
    "word_bank_fill_blank",
    "sentence_frame_completion",
    "word_ordering",
    "read_and_choose",
    "listen_and_choose",
    "short_text",
    "structured_text",
    "correction_task",
    "teacher_observed_speaking",
    "custom",
}
SUBMISSION_TYPES = {
    "none",
    "selection",
    "matching",
    "fill_blank",
    "short_text",
    "structured_text",
    "corrected_sentence",
    "teacher_observed_speaking",
    "self_check",
}
CHECKED_BY_VALUES = {"app", "teacher", "student", "not_submitted"}
SKILL_FOCUS_VALUES = {
    "listening",
    "speaking",
    "reading",
    "writing",
    "vocabulary",
    "grammar",
    "pronunciation",
    "professional_communication",
    "critical_thinking",
    "visual_literacy",
    "custom",
}
ASSESSMENT_MODES = {
    "completion",
    "checklist",
    "rubric",
    "model_response",
    "teacher_review",
    "self_check",
    "peer_feedback",
}
STEP_MODES = {
    "individual",
    "pair",
    "small_group",
    "whole_class",
    "teacher_led",
    "app_individual",
    "app_pair",
}
ASSET_TYPES = {"image", "audio", "pdf", "worksheet", "reference_card", "example_output"}
ASSET_STATUSES = {"needed", "planned", "generated", "provided", "missing", "not_required"}
SNAKE_CASE_KEY = re.compile(r"^[a-z][a-z0-9_]*$")
MODULE_ID_RE = re.compile(r"^module-\d{2}$")
WEEK_DIR_RE = re.compile(r"^week-\d{2}$")
WEEK_ID_RE = re.compile(r"^m\d{2}w\d{2}$")
ACTIVITY_ID_RE = re.compile(r"^m\d{2}w\d{2}-a\d{2}$")
VOCAB_ID_RE = re.compile(r"^m\d{2}w\d{2}-v\d{3}$")
VOCAB_GROUP_ID_RE = re.compile(r"^m\d{2}w\d{2}-vg\d{2}$")
ASSET_ID_RE = re.compile(r"^m\d{2}w\d{2}-(img|aud|pdf)-\d{3}$")
IMAGE_ASSET_ID_RE = re.compile(r"^m\d{2}w\d{2}-img-\d{3}$")
AUDIO_ASSET_ID_RE = re.compile(r"^m\d{2}w\d{2}-aud-\d{3}$")

LESSON_PLAN_HEADINGS = [
    "## Overview",
    "## Learning Objectives",
    "## Professional Fashion-Design Context",
    "## Language Objectives",
    "## Materials Needed",
    "## Suggested Sequence",
    "## Timing Estimate",
    "## Differentiation Options",
    "## Extension Options",
    "## Notes for Future App Implementation",
]
TEACHER_NOTES_HEADINGS = [
    "## Common Learner Difficulties",
    "## Classroom Management Suggestions",
    "## Professional Context Notes",
    "## Cultural or Industry Notes",
    "## Simplify This Week",
    "## Extend This Week",
    "## Asynchronous or App-Based Adaptation",
]


class ValidationContext:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.files_checked: list[str] = []
        self.missing_assets: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warning(self, message: str) -> None:
        self.warnings.append(message)

    def checked(self, path: Path) -> None:
        rel = path.relative_to(ROOT).as_posix()
        if rel not in self.files_checked:
            self.files_checked.append(rel)


def is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def load_json(path: Path, ctx: ValidationContext) -> Any:
    ctx.checked(path)
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        ctx.error(f"Missing required JSON file: {path.relative_to(ROOT).as_posix()}")
    except json.JSONDecodeError as exc:
        ctx.error(
            f"Invalid JSON in {path.relative_to(ROOT).as_posix()} at line {exc.lineno}, column {exc.colno}: {exc.msg}"
        )
    return None


def require_file(path: Path, ctx: ValidationContext) -> bool:
    ctx.checked(path)
    if not path.exists():
        ctx.error(f"Missing required file: {path.relative_to(ROOT).as_posix()}")
        return False
    return True


def validate_snake_case_keys(obj: Any, ctx: ValidationContext, path_label: str) -> None:
    if isinstance(obj, dict):
        for key, value in obj.items():
            if not SNAKE_CASE_KEY.match(key):
                ctx.error(f"{path_label} uses a non-snake_case key: {key}")
            validate_snake_case_keys(value, ctx, path_label)
    elif isinstance(obj, list):
        for item in obj:
            validate_snake_case_keys(item, ctx, path_label)


def validate_required_fields(obj: dict[str, Any], required_fields: list[str], ctx: ValidationContext, label: str) -> None:
    for field in required_fields:
        if field not in obj:
            ctx.error(f"{label} is missing required field: {field}")


def validate_markdown(path: Path, required_headings: list[str], title_prefix: str, ctx: ValidationContext) -> None:
    if not require_file(path, ctx):
        return
    text = path.read_text(encoding="utf-8")
    if not text.startswith(title_prefix):
        ctx.error(f"{path.relative_to(ROOT).as_posix()} must start with '{title_prefix}'")
    for heading in required_headings:
        if heading not in text:
            ctx.error(f"{path.relative_to(ROOT).as_posix()} is missing heading: {heading}")


def validate_course_manifest(path: Path, ctx: ValidationContext) -> None:
    data = load_json(path, ctx)
    if not isinstance(data, dict):
        return
    validate_snake_case_keys(data, ctx, path.relative_to(ROOT).as_posix())
    validate_required_fields(
        data,
        [
            "course_id",
            "title",
            "subtitle",
            "description",
            "target_learners",
            "language_focus",
            "professional_focus",
            "cefr_range",
            "total_modules",
            "total_weeks",
            "modules",
            "version",
        ],
        ctx,
        "course_manifest.json",
    )
    if "cefr_range" in data and data["cefr_range"] not in CEFR_RANGES | {"A2-B2"}:
        ctx.error("course_manifest.json has an invalid cefr_range value")
    if "total_modules" in data and not is_number(data["total_modules"]):
        ctx.error("course_manifest.json total_modules must be numeric")
    if "total_weeks" in data and not is_number(data["total_weeks"]):
        ctx.error("course_manifest.json total_weeks must be numeric")


def validate_module_manifest(path: Path, ctx: ValidationContext) -> None:
    data = load_json(path, ctx)
    if not isinstance(data, dict):
        return
    validate_snake_case_keys(data, ctx, path.relative_to(ROOT).as_posix())
    validate_required_fields(
        data,
        [
            "module_id",
            "module_number",
            "title",
            "description",
            "weeks",
            "learning_goals",
            "professional_outcomes",
            "language_outcomes",
        ],
        ctx,
        "module_manifest.json",
    )
    module_id = data.get("module_id")
    if isinstance(module_id, str) and not MODULE_ID_RE.match(module_id):
        ctx.error("module_manifest.json has an invalid module_id format")


def validate_week_manifest(path: Path, ctx: ValidationContext) -> dict[str, Any] | None:
    data = load_json(path, ctx)
    if not isinstance(data, dict):
        return None
    validate_snake_case_keys(data, ctx, path.relative_to(ROOT).as_posix())
    validate_required_fields(
        data,
        [
            "week_id",
            "module_id",
            "week_number",
            "title",
            "summary",
            "essential_question",
            "professional_context",
            "language_focus",
            "skill_focus",
            "target_vocabulary_groups",
            "grammar_focus",
            "pronunciation_focus",
            "cefr_access_level",
            "cefr_target_level",
            "estimated_total_minutes",
            "activity_ids",
            "asset_ids",
            "teacher_preparation",
            "student_deliverables",
        ],
        ctx,
        "week_manifest.json",
    )
    if isinstance(data.get("week_id"), str) and not WEEK_ID_RE.match(data["week_id"]):
        ctx.error("week_manifest.json has an invalid week_id format")
    for field in ("cefr_access_level", "cefr_target_level"):
        value = data.get(field)
        if value is not None and value not in CEFR_LEVELS:
            ctx.error(f"week_manifest.json has invalid {field}: {value}")
    if "estimated_total_minutes" in data and not is_number(data["estimated_total_minutes"]):
        ctx.error("week_manifest.json estimated_total_minutes must be numeric")
    return data


def validate_student_facing(activity: dict[str, Any], label: str, ctx: ValidationContext) -> None:
    student_facing = activity.get("student_facing")
    if not isinstance(student_facing, dict):
        ctx.error(f"{label} student_facing must be an object")
        return
    for lang in ("en", "pt"):
        localized = student_facing.get(lang)
        if not isinstance(localized, dict):
            ctx.error(f"{label} student_facing.{lang} must be an object")
            continue
        for field in ("title", "summary", "instructions", "success_criteria", "sentence_frames", "word_bank_label"):
            if field not in localized:
                ctx.error(f"{label} student_facing.{lang} is missing field: {field}")


def validate_steps(activity: dict[str, Any], label: str, ctx: ValidationContext) -> None:
    steps = activity.get("steps")
    if not isinstance(steps, list):
        ctx.error(f"{label} steps must be an array")
        return
    for index, step in enumerate(steps, start=1):
        if not isinstance(step, dict):
            ctx.error(f"{label} step {index} must be an object")
            continue
        for field in (
            "step_number",
            "title",
            "student_action_en",
            "student_action_pt",
            "teacher_action",
            "estimated_minutes",
            "mode",
        ):
            if field not in step:
                ctx.error(f"{label} step {index} is missing field: {field}")
        if "estimated_minutes" in step and not is_number(step["estimated_minutes"]):
            ctx.error(f"{label} step {index} estimated_minutes must be numeric")
        if "mode" in step and step["mode"] not in STEP_MODES:
            ctx.error(f"{label} step {index} has invalid mode: {step['mode']}")


def validate_assessment(activity: dict[str, Any], label: str, ctx: ValidationContext) -> None:
    assessment = activity.get("assessment")
    if not isinstance(assessment, dict):
        ctx.error(f"{label} assessment must be an object")
        return
    for field in (
        "mode",
        "completion_criteria_en",
        "completion_criteria_pt",
        "checklist_en",
        "checklist_pt",
        "rubric",
        "model_response_en",
        "model_response_pt",
        "common_errors",
        "feedback_prompts_en",
        "feedback_prompts_pt",
    ):
        if field not in assessment:
            ctx.error(f"{label} assessment is missing field: {field}")
    mode = assessment.get("mode")
    if mode is not None and mode not in ASSESSMENT_MODES:
        ctx.error(f"{label} has invalid assessment mode: {mode}")
    rubric = assessment.get("rubric", [])
    if isinstance(rubric, list):
        for index, item in enumerate(rubric, start=1):
            if not isinstance(item, dict):
                ctx.error(f"{label} rubric item {index} must be an object")
                continue
            for field in (
                "criterion",
                "excellent_en",
                "excellent_pt",
                "satisfactory_en",
                "satisfactory_pt",
                "needs_work_en",
                "needs_work_pt",
            ):
                if field not in item:
                    ctx.error(f"{label} rubric item {index} is missing field: {field}")


def validate_activities(path: Path, week_id: str, ctx: ValidationContext) -> tuple[dict[str, Any] | None, set[str], set[str]]:
    data = load_json(path, ctx)
    activity_ids: set[str] = set()
    asset_refs: set[str] = set()
    if not isinstance(data, dict):
        return None, activity_ids, asset_refs
    validate_snake_case_keys(data, ctx, path.relative_to(ROOT).as_posix())
    if set(data.keys()) != {"week_id", "activities"}:
        ctx.error(f"{path.relative_to(ROOT).as_posix()} must use the wrapper keys 'week_id' and 'activities'")
    if data.get("week_id") != week_id:
        ctx.error(f"{path.relative_to(ROOT).as_posix()} week_id must match {week_id}")
    activities = data.get("activities")
    if not isinstance(activities, list):
        ctx.error(f"{path.relative_to(ROOT).as_posix()} activities must be an array")
        return data, activity_ids, asset_refs
    for index, activity in enumerate(activities, start=1):
        label = f"{path.relative_to(ROOT).as_posix()} activity {index}"
        if not isinstance(activity, dict):
            ctx.error(f"{label} must be an object")
            continue
        validate_required_fields(
            activity,
            [
                "activity_id",
                "week_id",
                "sequence_number",
                "title",
                "activity_type",
                "activity_type_custom",
                "summary",
                "student_facing",
                "teacher_instructions",
                "estimated_minutes",
                "primary_interaction_type",
                "primary_interaction_type_custom",
                "submission_type",
                "checked_by",
                "teacher_review_required",
                "revision_supported",
                "skill_focus",
                "skill_focus_custom",
                "cefr_access_level",
                "cefr_target_level",
                "cefr_level",
                "materials",
                "vocabulary_refs",
                "asset_refs",
                "input",
                "steps",
                "expected_output",
                "assessment",
                "adaptations",
                "extension_options",
                "notes_for_app_design",
            ],
            ctx,
            label,
        )
        activity_id = activity.get("activity_id")
        if isinstance(activity_id, str):
            activity_ids.add(activity_id)
            if not ACTIVITY_ID_RE.match(activity_id):
                ctx.error(f"{label} has an invalid activity_id format: {activity_id}")
        if activity.get("week_id") != week_id:
            ctx.error(f"{label} week_id must match {week_id}")
        activity_type = activity.get("activity_type")
        if activity_type not in ACTIVITY_TYPES:
            ctx.error(f"{label} has invalid activity_type: {activity_type}")
        if activity_type == "custom" and not str(activity.get("activity_type_custom", "")).strip():
            ctx.error(f"{label} must include a non-empty activity_type_custom when activity_type is 'custom'")
        primary_interaction_type = activity.get("primary_interaction_type")
        if primary_interaction_type not in PRIMARY_INTERACTION_TYPES:
            ctx.error(f"{label} has invalid primary_interaction_type: {primary_interaction_type}")
        primary_interaction_type_custom = activity.get("primary_interaction_type_custom")
        if not isinstance(primary_interaction_type_custom, str):
            ctx.error(f"{label} primary_interaction_type_custom must be a string")
        if primary_interaction_type == "custom" and not str(primary_interaction_type_custom).strip():
            ctx.error(
                f"{label} must include a non-empty primary_interaction_type_custom when primary_interaction_type is 'custom'"
            )
        submission_type = activity.get("submission_type")
        if submission_type not in SUBMISSION_TYPES:
            ctx.error(f"{label} has invalid submission_type: {submission_type}")
        checked_by = activity.get("checked_by")
        if checked_by not in CHECKED_BY_VALUES:
            ctx.error(f"{label} has invalid checked_by: {checked_by}")
        if not isinstance(activity.get("teacher_review_required"), bool):
            ctx.error(f"{label} teacher_review_required must be a boolean")
        if not isinstance(activity.get("revision_supported"), bool):
            ctx.error(f"{label} revision_supported must be a boolean")
        skill_focus = activity.get("skill_focus")
        if isinstance(skill_focus, list):
            invalid_skills = [skill for skill in skill_focus if skill not in SKILL_FOCUS_VALUES]
            for skill in invalid_skills:
                ctx.error(f"{label} has invalid skill_focus value: {skill}")
            if "custom" in skill_focus and not str(activity.get("skill_focus_custom", "")).strip():
                ctx.error(f"{label} must include skill_focus_custom when skill_focus contains 'custom'")
        if "estimated_minutes" in activity and not is_number(activity["estimated_minutes"]):
            ctx.error(f"{label} estimated_minutes must be numeric")
        for field in ("cefr_access_level", "cefr_target_level"):
            value = activity.get(field)
            if value is not None and value not in CEFR_LEVELS:
                ctx.error(f"{label} has invalid {field}: {value}")
        if (cefr_level := activity.get("cefr_level")) is not None and cefr_level not in CEFR_RANGES:
            ctx.error(f"{label} has invalid cefr_level: {cefr_level}")
        validate_student_facing(activity, label, ctx)
        input_obj = activity.get("input")
        if isinstance(input_obj, dict):
            for field in ("input_type", "prompt_en", "prompt_pt", "items"):
                if field not in input_obj:
                    ctx.error(f"{label} input is missing field: {field}")
        else:
            ctx.error(f"{label} input must be an object")
        expected_output = activity.get("expected_output")
        if isinstance(expected_output, dict):
            for field in ("mode", "description_en", "description_pt", "length_or_format"):
                if field not in expected_output:
                    ctx.error(f"{label} expected_output is missing field: {field}")
        else:
            ctx.error(f"{label} expected_output must be an object")
        validate_steps(activity, label, ctx)
        validate_assessment(activity, label, ctx)
        adaptations = activity.get("adaptations")
        if isinstance(adaptations, dict):
            for field in ("support", "challenge"):
                if field not in adaptations:
                    ctx.error(f"{label} adaptations is missing field: {field}")
        else:
            ctx.error(f"{label} adaptations must be an object")
        for vocab_ref in activity.get("vocabulary_refs", []):
            if isinstance(vocab_ref, str) and not VOCAB_ID_RE.match(vocab_ref):
                ctx.error(f"{label} has invalid vocabulary ref: {vocab_ref}")
        for asset_ref in activity.get("asset_refs", []):
            if isinstance(asset_ref, str):
                asset_refs.add(asset_ref)
                if not ASSET_ID_RE.match(asset_ref):
                    ctx.error(f"{label} has invalid asset ref: {asset_ref}")
    return data, activity_ids, asset_refs


def validate_vocabulary(path: Path, week_id: str, ctx: ValidationContext) -> tuple[dict[str, Any] | None, set[str], set[str]]:
    data = load_json(path, ctx)
    vocab_ids: set[str] = set()
    group_ids: set[str] = set()
    if not isinstance(data, dict):
        return None, vocab_ids, group_ids
    validate_snake_case_keys(data, ctx, path.relative_to(ROOT).as_posix())
    if set(data.keys()) != {"week_id", "vocabulary_groups"}:
        ctx.error(f"{path.relative_to(ROOT).as_posix()} must use the wrapper keys 'week_id' and 'vocabulary_groups'")
    if data.get("week_id") != week_id:
        ctx.error(f"{path.relative_to(ROOT).as_posix()} week_id must match {week_id}")
    groups = data.get("vocabulary_groups")
    if not isinstance(groups, list):
        ctx.error(f"{path.relative_to(ROOT).as_posix()} vocabulary_groups must be an array")
        return data, vocab_ids, group_ids
    for group_index, group in enumerate(groups, start=1):
        label = f"{path.relative_to(ROOT).as_posix()} group {group_index}"
        if not isinstance(group, dict):
            ctx.error(f"{label} must be an object")
            continue
        validate_required_fields(group, ["group_id", "title", "description", "items"], ctx, label)
        group_id = group.get("group_id")
        if isinstance(group_id, str):
            group_ids.add(group_id)
            if not VOCAB_GROUP_ID_RE.match(group_id):
                ctx.error(f"{label} has invalid group_id format: {group_id}")
        items = group.get("items")
        if not isinstance(items, list):
            ctx.error(f"{label} items must be an array")
            continue
        for item_index, item in enumerate(items, start=1):
            item_label = f"{label} item {item_index}"
            if not isinstance(item, dict):
                ctx.error(f"{item_label} must be an object")
                continue
            validate_required_fields(
                item,
                [
                    "vocab_id",
                    "term",
                    "part_of_speech",
                    "definition_en",
                    "learner_friendly_definition_en",
                    "learner_friendly_definition_pt",
                    "example_sentence_en",
                    "example_sentence_pt",
                    "professional_context_en",
                    "professional_context_pt",
                    "translation_notes_pt",
                    "pronunciation_notes",
                    "related_terms",
                    "difficulty",
                ],
                ctx,
                item_label,
            )
            vocab_id = item.get("vocab_id")
            if isinstance(vocab_id, str):
                vocab_ids.add(vocab_id)
                if not VOCAB_ID_RE.match(vocab_id):
                    ctx.error(f"{item_label} has invalid vocab_id format: {vocab_id}")
    return data, vocab_ids, group_ids


def validate_asset_manifest(path: Path, week_id: str, ctx: ValidationContext) -> tuple[dict[str, Any] | None, set[str]]:
    data = load_json(path, ctx)
    asset_ids: set[str] = set()
    if not isinstance(data, dict):
        return None, asset_ids
    validate_snake_case_keys(data, ctx, path.relative_to(ROOT).as_posix())
    if set(data.keys()) != {"week_id", "assets"}:
        ctx.error(f"{path.relative_to(ROOT).as_posix()} must use the wrapper keys 'week_id' and 'assets'")
    if data.get("week_id") != week_id:
        ctx.error(f"{path.relative_to(ROOT).as_posix()} week_id must match {week_id}")
    assets = data.get("assets")
    if not isinstance(assets, list):
        ctx.error(f"{path.relative_to(ROOT).as_posix()} assets must be an array")
        return data, asset_ids
    for index, asset in enumerate(assets, start=1):
        label = f"{path.relative_to(ROOT).as_posix()} asset {index}"
        if not isinstance(asset, dict):
            ctx.error(f"{label} must be an object")
            continue
        validate_required_fields(
            asset,
            [
                "asset_id",
                "week_id",
                "asset_type",
                "title",
                "description",
                "target_filename",
                "status",
                "used_by_activity_ids",
                "generation_source",
                "notes",
            ],
            ctx,
            label,
        )
        asset_id = asset.get("asset_id")
        if isinstance(asset_id, str):
            asset_ids.add(asset_id)
            if not ASSET_ID_RE.match(asset_id):
                ctx.error(f"{label} has invalid asset_id format: {asset_id}")
        if asset.get("week_id") != week_id:
            ctx.error(f"{label} week_id must match {week_id}")
        asset_type = asset.get("asset_type")
        if asset_type not in ASSET_TYPES:
            ctx.error(f"{label} has invalid asset_type: {asset_type}")
        status = asset.get("status")
        if status not in ASSET_STATUSES:
            ctx.error(f"{label} has invalid status: {status}")
    return data, asset_ids


def validate_prompt_wrapper(
    path: Path,
    week_id: str,
    key: str,
    asset_pattern: re.Pattern[str],
    ctx: ValidationContext,
) -> tuple[dict[str, Any] | None, set[str]]:
    data = load_json(path, ctx)
    prompt_asset_ids: set[str] = set()
    if not isinstance(data, dict):
        return None, prompt_asset_ids
    validate_snake_case_keys(data, ctx, path.relative_to(ROOT).as_posix())
    if set(data.keys()) != {"week_id", key}:
        ctx.error(f"{path.relative_to(ROOT).as_posix()} must use the wrapper keys 'week_id' and '{key}'")
    if data.get("week_id") != week_id:
        ctx.error(f"{path.relative_to(ROOT).as_posix()} week_id must match {week_id}")
    prompts = data.get(key)
    if not isinstance(prompts, list):
        ctx.error(f"{path.relative_to(ROOT).as_posix()} {key} must be an array")
        return data, prompt_asset_ids
    required = {
        "image_prompts": [
            "asset_id",
            "purpose",
            "target_filename",
            "visual_description",
            "style_instructions",
            "composition_notes",
            "text_in_image",
            "avoid",
            "used_by_activity_ids",
            "status",
        ],
        "audio_prompts": [
            "asset_id",
            "purpose",
            "target_filename",
            "script",
            "speaker_profile",
            "accent_or_variety",
            "speed",
            "voice_direction",
            "suggested_openai_voice_role",
            "duration_estimate_seconds",
            "used_by_activity_ids",
            "status",
        ],
    }[key]
    for index, prompt in enumerate(prompts, start=1):
        label = f"{path.relative_to(ROOT).as_posix()} prompt {index}"
        if not isinstance(prompt, dict):
            ctx.error(f"{label} must be an object")
            continue
        validate_required_fields(prompt, required, ctx, label)
        asset_id = prompt.get("asset_id")
        if isinstance(asset_id, str):
            prompt_asset_ids.add(asset_id)
            if not asset_pattern.match(asset_id):
                ctx.error(f"{label} has invalid asset_id format: {asset_id}")
        status = prompt.get("status")
        if status is not None and status not in ASSET_STATUSES:
            ctx.error(f"{label} has invalid status: {status}")
        if key == "audio_prompts" and "duration_estimate_seconds" in prompt and not is_number(prompt["duration_estimate_seconds"]):
            ctx.error(f"{label} duration_estimate_seconds must be numeric")
    return data, prompt_asset_ids


def write_report(ctx: ValidationContext) -> None:
    GENERATED_ROOT.mkdir(parents=True, exist_ok=True)
    status = "PASS" if not ctx.errors else "FAIL"
    lines = [
        "# Validation Report",
        "",
        f"- Status: **{status}**",
        f"- Generated at (UTC): {datetime.now(timezone.utc).isoformat()}",
        "",
        "## Files Checked",
    ]
    for item in sorted(ctx.files_checked):
        lines.append(f"- `{item}`")
    lines.extend(["", "## Errors"])
    if ctx.errors:
        for error in ctx.errors:
            lines.append(f"- {error}")
    else:
        lines.append("- None.")
    lines.extend(["", "## Warnings"])
    if ctx.warnings:
        for warning in ctx.warnings:
            lines.append(f"- {warning}")
    else:
        lines.append("- None.")
    lines.extend(["", "## Missing Assets"])
    if ctx.missing_assets:
        for item in ctx.missing_assets:
            lines.append(f"- {item}")
    else:
        lines.append("- None.")
    lines.extend(
        [
            "",
            "## Validator Scope Notes",
            "- The Phase 1 validator enforces required files, wrapper shapes, required fields, bilingual student-facing fields, ID patterns, controlled values, numeric minute fields, and cross-file references.",
            "- The JSON Schema files document a fuller contract, but this script does not execute full JSON Schema validation because the Phase 1 toolchain is standard-library only.",
            "- The validator checks currently present week folders under `content/`; it does not require future planned weeks listed in manifests to exist yet.",
            "",
            "## Suggested Next Actions",
        ]
    )
    if ctx.errors:
        lines.append("- Fix the validation errors above and rerun `python tools/validate_content.py`.")
    else:
        lines.append("- Continue expanding content one week at a time and keep the same validation workflow.")
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def validate_week_directory(week_dir: Path, ctx: ValidationContext) -> None:
    required_files = [
        week_dir / "week_manifest.json",
        week_dir / "lesson_plan.md",
        week_dir / "activities.json",
        week_dir / "vocabulary.json",
        week_dir / "teacher_notes.md",
        week_dir / "asset_manifest.json",
        week_dir / "image_prompts.json",
        week_dir / "audio_prompts.json",
    ]
    for path in required_files:
        require_file(path, ctx)

    week_manifest = validate_week_manifest(week_dir / "week_manifest.json", ctx)
    if not isinstance(week_manifest, dict):
        return
    week_id = week_manifest["week_id"]

    validate_markdown(week_dir / "lesson_plan.md", LESSON_PLAN_HEADINGS, "# Week ", ctx)
    validate_markdown(week_dir / "teacher_notes.md", TEACHER_NOTES_HEADINGS, "# Teacher Notes: Week ", ctx)

    _, activity_ids, activity_asset_refs = validate_activities(week_dir / "activities.json", week_id, ctx)
    _, vocab_ids, vocab_group_ids = validate_vocabulary(week_dir / "vocabulary.json", week_id, ctx)
    assets_data, asset_ids = validate_asset_manifest(week_dir / "asset_manifest.json", week_id, ctx)
    _, image_prompt_asset_ids = validate_prompt_wrapper(
        week_dir / "image_prompts.json",
        week_id,
        "image_prompts",
        IMAGE_ASSET_ID_RE,
        ctx,
    )
    _, audio_prompt_asset_ids = validate_prompt_wrapper(
        week_dir / "audio_prompts.json",
        week_id,
        "audio_prompts",
        AUDIO_ASSET_ID_RE,
        ctx,
    )

    week_activity_ids = set(week_manifest.get("activity_ids", []))
    if week_activity_ids != activity_ids:
        missing = sorted(week_activity_ids - activity_ids)
        extra = sorted(activity_ids - week_activity_ids)
        if missing:
            ctx.error(f"{week_dir.relative_to(ROOT).as_posix()}/week_manifest.json references missing activity_ids: {missing}")
        if extra:
            ctx.error(f"{week_dir.relative_to(ROOT).as_posix()}/activities.json includes activity_ids not listed in week_manifest.json: {extra}")

    target_groups = set(week_manifest.get("target_vocabulary_groups", []))
    if not target_groups.issubset(vocab_group_ids):
        missing_groups = sorted(target_groups - vocab_group_ids)
        ctx.error(f"{week_dir.relative_to(ROOT).as_posix()}/week_manifest.json references missing vocabulary groups: {missing_groups}")

    week_asset_ids = set(week_manifest.get("asset_ids", []))
    if not week_asset_ids.issubset(asset_ids):
        missing_assets = sorted(week_asset_ids - asset_ids)
        ctx.error(f"{week_dir.relative_to(ROOT).as_posix()}/week_manifest.json references missing asset_ids: {missing_assets}")

    if not activity_asset_refs.issubset(asset_ids):
        missing_assets = sorted(activity_asset_refs - asset_ids)
        ctx.error(f"{week_dir.relative_to(ROOT).as_posix()}/activities.json references missing assets: {missing_assets}")

    if not image_prompt_asset_ids.issubset(asset_ids):
        missing_assets = sorted(image_prompt_asset_ids - asset_ids)
        ctx.error(f"{week_dir.relative_to(ROOT).as_posix()}/image_prompts.json references asset_ids not found in asset_manifest.json: {missing_assets}")

    if not audio_prompt_asset_ids.issubset(asset_ids):
        missing_assets = sorted(audio_prompt_asset_ids - asset_ids)
        ctx.error(f"{week_dir.relative_to(ROOT).as_posix()}/audio_prompts.json references asset_ids not found in asset_manifest.json: {missing_assets}")

    activities_data = load_json(week_dir / "activities.json", ctx)
    if isinstance(activities_data, dict):
        for activity in activities_data.get("activities", []):
            if not isinstance(activity, dict):
                continue
            label = activity.get("activity_id", "unknown activity")
            missing_vocab = sorted(set(activity.get("vocabulary_refs", [])) - vocab_ids)
            if missing_vocab:
                ctx.error(f"{label} references missing vocabulary ids: {missing_vocab}")

    if isinstance(assets_data, dict):
        for asset in assets_data.get("assets", []):
            if not isinstance(asset, dict):
                continue
            asset_label = asset.get("asset_id", "unknown asset")
            used_by = set(asset.get("used_by_activity_ids", []))
            missing_activity_links = sorted(used_by - activity_ids)
            if missing_activity_links:
                ctx.error(f"{asset_label} references missing activity ids: {missing_activity_links}")
            if asset.get("status") in {"needed", "planned", "missing"}:
                ctx.missing_assets.append(
                    f"{asset_label} — {asset.get('description', '')} — {asset.get('target_filename', '')}"
                )


def validate_root_files(ctx: ValidationContext) -> None:
    for path in [
        ROOT / "AGENTS.md",
        ROOT / "README.md",
        ROOT / "docs" / "fashion-course-content-requirements.md",
        ROOT / "schemas" / "course_manifest.schema.json",
        ROOT / "schemas" / "module_manifest.schema.json",
        ROOT / "schemas" / "week_manifest.schema.json",
        ROOT / "schemas" / "activities.schema.json",
        ROOT / "schemas" / "vocabulary.schema.json",
        ROOT / "schemas" / "asset_manifest.schema.json",
        ROOT / "schemas" / "image_prompts.schema.json",
        ROOT / "schemas" / "audio_prompts.schema.json",
        ROOT / "tools" / "validate_content.py",
        CONTENT_ROOT / "course_manifest.json",
        CONTENT_ROOT / "modules" / "module-01" / "module_manifest.json",
    ]:
        require_file(path, ctx)
    validate_course_manifest(CONTENT_ROOT / "course_manifest.json", ctx)
    validate_module_manifest(CONTENT_ROOT / "modules" / "module-01" / "module_manifest.json", ctx)


def main() -> int:
    ctx = ValidationContext()
    validate_root_files(ctx)

    modules_dir = CONTENT_ROOT / "modules"
    if not modules_dir.exists():
        ctx.error("Missing modules directory: content/course/modules")
        write_report(ctx)
        return 1

    for module_dir in sorted(path for path in modules_dir.iterdir() if path.is_dir()):
        if not MODULE_ID_RE.match(module_dir.name):
            ctx.warning(f"Skipping unexpected module directory name: {module_dir.relative_to(ROOT).as_posix()}")
            continue
        for week_dir in sorted(path for path in module_dir.iterdir() if path.is_dir()):
            if WEEK_DIR_RE.match(week_dir.name):
                validate_week_directory(week_dir, ctx)

    write_report(ctx)
    return 0 if not ctx.errors else 1


if __name__ == "__main__":
    sys.exit(main())
