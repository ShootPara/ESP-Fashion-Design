# Fashion Design English Course Content Requirements

## 1. Purpose

This document defines the content-production requirements for an English for Special Purposes course focused on fashion design.

The current project phase is **content generation only**. The purpose of this phase is to create structured, reviewable, app-ready curriculum content files that can later be converted into a database or content pack for an application.

This document governs canonical content authoring and the content pipeline. LMS and app implementation work is governed separately by `docs/fashion-lms-requiremements-for-review-mode.md`.

This phase does **not** include app development, UI implementation, authentication, student tracking, grading infrastructure, analytics, or deployment.

The immediate goal is to create high-quality weekly course content in structured source files, supported by schemas, manifests, validation scripts, and clear asset-planning files.

This document is the source of truth for content-system structure, canonical content format, schema and validator expectations, and current phase boundaries.

The companion document `docs/fashion-activity-design-guidance.md` is the source of truth for activity-design quality, concrete student interaction, app-readiness at the activity level, teacher review needs, and revision workflow expectations.

For LMS implementation, Cloudflare architecture, D1 decisions, review/test mode behavior, and milestone planning, use `docs/fashion-lms-requiremements-for-review-mode.md`.

## 2. Project Strategy

The course content should be authored as human-readable structured files in the repository. These files are the canonical source of truth.

A future phase may convert the content into SQLite or another app-consumable format. However, SQLite must be treated as a generated artifact, not the primary authoring format.

The intended workflow for weekly production is:

```text
existing curriculum notes and planning materials
        ↓
planning pass
        ↓
execution/content creation pass
        ↓
student-render review pass
        ↓
surgical refinement pass if needed
        ↓
commit only after review/refinement passes
        ↓
separate media-generation pass
        ↓
media verification/status-update pass
        ↓
future database/content-pack build
        ↓
future app integration
```

Codex should build the content-production system first, then use it to create course weeks one at a time.

## 3. Current Phase Scope

### 3.1 In Scope

The current phase includes:

- Creating the repository structure for course content.
- Creating course, module, and week manifests.
- Creating JSON schemas for structured content files.
- Creating weekly content files.
- Creating activity definitions.
- Creating vocabulary files.
- Creating teacher notes.
- Creating image and audio planning manifests.
- Creating validation scripts.
- Creating validation reports.
- Creating a README explaining the content pipeline.
- Creating an AGENTS.md file instructing Codex how to work in this repo.
- Producing execution summaries that list missing or needed images and audio clips.

### 3.2 Out of Scope

The current phase does not include:

- Building a student app.
- Building a teacher/admin app.
- Creating login or authentication.
- Creating user accounts.
- Creating grading infrastructure.
- Creating analytics.
- Deploying anything.
- Creating production SQLite as the first step.
- Generating images unless explicitly requested in a separate step.
- Generating audio unless explicitly requested in a separate step.
- Designing final UI screens.
- Rewriting the curriculum scope without instruction.
- Migrating the full existing course manual automatically in Phase 1.

## 4. Canonical Source Format

The canonical app-ready course source should live in structured files under `content/`.

Existing curriculum material under `docs/` is living course-planning material. It should be treated as source/reference material for Codex and may provide specific guidance for content generation. It should remain in `docs/` unless a task explicitly asks Codex to reorganize it.

For this project phase, both of these documents must be used together:

```text
docs/fashion-course-content-requirements.md
docs/fashion-activity-design-guidance.md
```

Conflict-resolution rule:

- `docs/fashion-course-content-requirements.md` controls file structure, canonical content format, schema and validator expectations, and phase boundaries.
- `docs/fashion-activity-design-guidance.md` controls activity-design quality, student interaction, app-readiness, teacher review needs, and revision workflow.
- If the current schema prevents the activity guidance from being followed, update the requirements, schema, and validator in a planned follow-up before generating more content.

The structured content produced by this phase must live under `content/`. The `content/` files are the canonical source for future app/database consumption once they exist.

Phase 1 should create a clean parallel `content/` structure. It should not attempt a full migration of existing course materials. Full adaptation of existing `docs/` materials belongs to Phase 2 and later weekly production passes.

Codex may update files under `docs/` when the assigned task calls for documentation updates, requirements clarification, or source-material cleanup. Codex should not casually rewrite planning documents while generating weekly content unless instructed.

Recommended structure:

```text
content/
  course/
    course_manifest.json
    modules/
      module-01/
        module_manifest.json
        week-01/
          week_manifest.json
          lesson_plan.md
          activities.json
          vocabulary.json
          teacher_notes.md
          asset_manifest.json
          image_prompts.json
          audio_prompts.json
```

The exact structure may be expanded if needed, but Codex should avoid unnecessary complexity during the content-only phase.

## 5. Required Top-Level Directories

### 5.1 `content/`

Contains canonical course content.

### 5.2 `schemas/`

Contains JSON schemas used to validate and document content files.

### 5.3 `tools/`

Contains scripts for validation and future content transformation.

### 5.4 `generated/`

Contains generated validation reports and, in later phases, generated databases or content packs.

### 5.5 `docs/`

Contains project documentation, including this requirements document and existing course-planning materials.

Existing `docs/` materials may be used as reference input, but they are not the canonical structured content format.

### 5.6 `assets/`

May contain generated or manually added media assets in a later phase.

During the current phase, Codex should plan assets but should not assume the assets already exist unless they are present in the repo.

## 6. Course Manifest Requirements

The file `content/course/course_manifest.json` should describe the whole course.

It should include:

- `course_id`
- `title`
- `subtitle`
- `description`
- `target_learners`
- `language_focus`
- `professional_focus`
- `cefr_range`
- `total_modules`
- `total_weeks`
- `modules`
- `version`

The course has a designed scope, so `total_modules` and `total_weeks` should be declared from the start rather than treated as open-ended placeholders. Codex should derive these values from the existing course-planning materials in `docs/` when available. If Codex cannot confidently determine the designed total module/week count during Phase 1, it should stop short of inventing numbers and report the missing decision in its execution summary.

Example ID style:

```json
{
  "course_id": "fashion-design-english",
  "title": "English for Fashion Design",
  "cefr_range": "A2-B2"
}
```

## 7. Module Manifest Requirements

Each module should have a `module_manifest.json` file.

It should include:

- `module_id`
- `module_number`
- `title`
- `description`
- `weeks`
- `learning_goals`
- `professional_outcomes`
- `language_outcomes`

Example module ID:

```text
module-01
```

### 7.1 Week Status Meanings

When a module manifest lists week status values, use only documented and already-supported values.

- `planned` means the week is expected or source material exists, but the canonical structured week content is not yet complete.
- `seeded` means the canonical structured week folder exists, has passed student-render review and any needed refinement, and validates successfully.

Do not invent additional week status values unless the schema, data, documentation, and workflow are updated together.

## 8. Week Manifest Requirements

Each week should have a `week_manifest.json` file.

It should include:

- `week_id`
- `module_id`
- `week_number`
- `title`
- `summary`
- `essential_question`
- `professional_context`
- `language_focus`
- `skill_focus`
- `target_vocabulary_groups`
- `grammar_focus`
- `pronunciation_focus`
- `cefr_access_level`
- `cefr_target_level`
- `estimated_total_minutes`
- `activity_ids`
- `asset_ids`
- `teacher_preparation`
- `student_deliverables`

Example week ID:

```text
m01w01
```

### 8.1 CEFR Modeling

Use both access and target levels at week level and activity level.

- `cefr_access_level` means the minimum level where a student can attempt the activity with scaffolding.
- `cefr_target_level` means the expected performance level for the main version of the activity.

Example:

```json
{
  "cefr_access_level": "A2",
  "cefr_target_level": "B1"
}
```

The older `cefr_level` field may still be used as a short display label in activity files, but the preferred structured fields are `cefr_access_level` and `cefr_target_level`.

### 8.2 JSON Authoring Contract

All canonical JSON files should be formatted consistently so they are easy for humans to review and easy for future tooling to consume.

General JSON rules:

- Use UTF-8 JSON.
- Use two-space indentation.
- Use stable field ordering following the examples in this document and the matching schema files.
- Use object wrappers for list-style files; do not use bare arrays.
- Use `snake_case` field names.
- Keep internal field names in English.
- Use arrays for repeatable values, even when only one value is present.
- Use empty arrays `[]` for intentionally empty repeatable values.
- Use empty strings `""` only when a field is required but not applicable yet.
- Do not use `null` unless a schema explicitly allows it.
- Do not use comments in JSON files.

Required wrapper patterns:

```json
{
  "week_id": "m01w01",
  "activities": []
}
```

```json
{
  "week_id": "m01w01",
  "vocabulary_groups": []
}
```

```json
{
  "week_id": "m01w01",
  "assets": []
}
```

```json
{
  "week_id": "m01w01",
  "image_prompts": []
}
```

```json
{
  "week_id": "m01w01",
  "audio_prompts": []
}
```

Schema files should define the intended complete structure. The Phase 1 Python validator should enforce the most important correctness rules without requiring third-party schema-validation packages. Where the schema and validator differ, Codex should document the difference in README.md or the execution summary.

### 8.3 Localization Contract

Student-facing app text should be bilingual in English and Brazilian Portuguese from the beginning.

Bilingual fields are required for:

- activity titles and summaries shown to students
- student instructions
- student success criteria
- sentence frames shown to students
- word-bank labels shown to students
- activity step instructions shown to students
- completion criteria shown to students
- checklist items shown to students
- model responses shown to students
- feedback prompts shown to students
- app-facing labels or prompts inside activity `input` objects

Teacher-only notes and internal reviewer fields may remain English-only during this phase.

Vocabulary terms themselves should remain English because this is an English course. Vocabulary files should include Portuguese support fields where useful, but Codex should not replace English learning content with Portuguese translations.

Recommended bilingual field pattern:

```json
{
  "en": "Describe the garment.",
  "pt": "Descreva a peça de roupa."
}
```

For larger grouped student-facing content, use nested `en` and `pt` objects as specified in the relevant section.

## 9. Lesson Plan Requirements

Each week should include a human-readable `lesson_plan.md` file.

The lesson plan should explain the week in enough detail for a teacher, content reviewer, or future app designer to understand the instructional design.

Markdown files should use fixed section headings so reviewers and future tooling can find expected information consistently. The validator does not need deep semantic validation of the markdown in Phase 1, but it should check that required headings are present.

Required `lesson_plan.md` headings:

```markdown
# Week <number>: <title>

## Overview
## Learning Objectives
## Professional Fashion-Design Context
## Language Objectives
## Materials Needed
## Suggested Sequence
## Timing Estimate
## Differentiation Options
## Extension Options
## Notes for Future App Implementation
```

The lesson plan may repeat information from the structured JSON files when useful for readability.

## 10. Activity File Requirements

Each week should include an `activities.json` file.

The file should use an object wrapper, not a bare array. This keeps room for metadata without breaking future compatibility.

Required top-level shape:

```json
{
  "week_id": "m01w01",
  "activities": []
}
```

A complete activity object should follow this structure:

```json
{
  "activity_id": "m01w01-a01",
  "week_id": "m01w01",
  "sequence_number": 1,
  "title": "Internal reviewer title",
  "activity_type": "warmup",
  "summary": "Internal reviewer summary.",
  "student_facing": {
    "en": {
      "title": "",
      "summary": "",
      "instructions": "",
      "success_criteria": [],
      "sentence_frames": [],
      "word_bank_label": "Word bank"
    },
    "pt": {
      "title": "",
      "summary": "",
      "instructions": "",
      "success_criteria": [],
      "sentence_frames": [],
      "word_bank_label": "Banco de palavras"
    }
  },
  "teacher_instructions": "",
  "estimated_minutes": 15,
  "primary_interaction_type": "single_choice",
  "primary_interaction_type_custom": "",
  "submission_type": "selection",
  "checked_by": "app",
  "teacher_review_required": false,
  "revision_supported": false,
  "skill_focus": [],
  "skill_focus_custom": "",
  "cefr_access_level": "A2",
  "cefr_target_level": "B1",
  "cefr_level": "A2-B1",
  "materials": [],
  "vocabulary_refs": [],
  "asset_refs": [],
  "input": {
    "input_type": "none",
    "prompt_en": "",
    "prompt_pt": "",
    "items": []
  },
  "steps": [],
  "expected_output": {
    "mode": "spoken_response",
    "description_en": "",
    "description_pt": "",
    "length_or_format": ""
  },
  "assessment": {
    "mode": "completion",
    "completion_criteria_en": [],
    "completion_criteria_pt": [],
    "checklist_en": [],
    "checklist_pt": [],
    "rubric": [],
    "model_response_en": "",
    "model_response_pt": "",
    "common_errors": [],
    "feedback_prompts_en": [],
    "feedback_prompts_pt": []
  },
  "adaptations": {
    "support": [],
    "challenge": []
  },
  "extension_options": [],
  "notes_for_app_design": ""
}
```

Each activity should include:

- `activity_id`
- `week_id`
- `sequence_number`
- `title`
- `activity_type`
- `summary`
- `student_facing`
- `teacher_instructions`
- `estimated_minutes`
- `primary_interaction_type`
- `submission_type`
- `checked_by`
- `teacher_review_required`
- `revision_supported`
- `skill_focus`
- `cefr_access_level`
- `cefr_target_level`
- `cefr_level`
- `materials`
- `vocabulary_refs`
- `asset_refs`
- `input`
- `steps`
- `expected_output`
- `assessment`
- `adaptations`
- `extension_options`
- `notes_for_app_design`

For all new or rewritten activities going forward, the operational activity metadata above is required. Existing activities such as the current Week 1 content may remain in their present structure during this documentation pass, but they should be brought into conformance in a later content/schema/validator follow-up.

Each activity must define concrete student interaction, the expected student output, the submission type, who checks the result, whether teacher review is required, whether revision is supported, and concrete `notes_for_app_design`. The goal is to make the content app-ready without building the app itself in this phase.

### 10.1 Main Saved-Output Alignment Rule

Operational activity metadata must match the primary saved or scored output.

Examples:

- If `primary_interaction_type` is `image_match` and `submission_type` is `matching`, the main saved or scored output must be matching.
- If `primary_interaction_type` is `word_bank_fill_blank` and `submission_type` is `fill_blank`, the main saved or scored output must be fill-blank phrase completion.
- If every app-checked item is single-choice, do not label the activity `multiple_choice`.

Secondary support screens are allowed, such as Portuguese bridge items, category sort items, grammar choices, or follow-up fill-blanks, but they must be described as secondary support when the submission type remains `matching` or `fill_blank`.

### 10.2 Student-Facing Localization

Student-facing activity content must be bilingual from the beginning so a future app can support a language toggle without major restructuring.

Use a structured `student_facing` object with English and Portuguese content.

Recommended shape:

```json
{
  "student_facing": {
    "en": {
      "title": "",
      "summary": "",
      "instructions": "",
      "success_criteria": [],
      "sentence_frames": [],
      "word_bank_label": "Word bank"
    },
    "pt": {
      "title": "",
      "summary": "",
      "instructions": "",
      "success_criteria": [],
      "sentence_frames": [],
      "word_bank_label": "Banco de palavras"
    }
  }
}
```

Internal JSON field names should remain English. Student-facing display strings should have English and Brazilian Portuguese versions when they are intended for student display.

`title` and `summary` may remain as top-level internal/reviewer fields, but the app-facing versions belong inside `student_facing.en` and `student_facing.pt`.

### 10.3 Activity ID Format

Activity IDs should use stable, sortable IDs.

Example:

```text
m01w01-a01
m01w01-a02
m01w01-a03
```

### 10.4 Activity Types

Activity types should use a controlled list, but the system should remain extensible.

Initial recommended activity types:

- `warmup`
- `vocabulary_matching`
- `visual_analysis`
- `listening_comprehension`
- `pronunciation_practice`
- `guided_speaking`
- `role_play`
- `reading_comprehension`
- `writing_short_response`
- `writing_professional_text`
- `design_description`
- `peer_feedback`
- `presentation`
- `reflection`
- `assessment_task`
- `custom`

Phase 1 schemas should hard-fail unknown activity types unless the activity uses `activity_type: "custom"` and includes a non-empty `activity_type_custom` field with a short explanation. This prevents accidental typos while preserving flexibility.

If Codex adds a custom type, it must explain the addition in its execution summary.

### 10.5 Skill Focus

Skill focus should use a controlled list, but the system should remain extensible.

Recommended values:

- `listening`
- `speaking`
- `reading`
- `writing`
- `vocabulary`
- `grammar`
- `pronunciation`
- `professional_communication`
- `critical_thinking`
- `visual_literacy`
- `custom`

Phase 1 schemas should hard-fail unknown skill values unless the activity includes `custom` in `skill_focus` and includes a non-empty `skill_focus_custom` field with a short explanation.

### 10.6 CEFR Values

CEFR values should be controlled.

Allowed values:

- `A1`
- `A2`
- `B1`
- `B2`
- `C1`
- `A1-A2`
- `A2-B1`
- `B1-B2`
- `B2-C1`

For structured content, prefer `cefr_access_level` and `cefr_target_level`. Use `cefr_level` as a convenient display label when useful.

### 10.7 Primary Interaction Type

`primary_interaction_type` describes the main app/rendering interaction for the activity. It is distinct from `activity_type`, which remains the pedagogical category.

Recommended values:

- `single_choice`
- `multiple_choice`
- `true_false`
- `image_match`
- `translation_match`
- `word_bank_fill_blank`
- `sentence_frame_completion`
- `word_ordering`
- `read_and_choose`
- `listen_and_choose`
- `short_text`
- `structured_text`
- `correction_task`
- `teacher_observed_speaking`
- `custom`

If an activity uses `primary_interaction_type: "custom"`, it must include `primary_interaction_type_custom` with a short explanation and the execution summary should also explain the custom choice.

### 10.8 Submission Type

`submission_type` describes what kind of student response is saved, checked, or tracked.

Recommended values:

- `none`
- `selection`
- `matching`
- `fill_blank`
- `short_text`
- `structured_text`
- `corrected_sentence`
- `teacher_observed_speaking`
- `self_check`

### 10.9 Checked By

`checked_by` identifies who checks or confirms completion of the activity.

Allowed values:

- `app`
- `teacher`
- `student`
- `not_submitted`

### 10.9 Teacher Review and Revision Flags

`teacher_review_required` should be `true` only when teacher review adds clear value.

`revision_supported` should be `true` when the activity is designed to support a feedback and revision cycle.

Teacher-reviewed writing and speaking tasks should state the review expectation clearly in `assessment` and `notes_for_app_design`. If `revision_supported` is `true`, the activity should include specific revision guidance rather than a vague instruction to revise later.

## 11. Activity Step Requirements

Each activity should include clear steps.

Each step should include:

- `step_number`
- `title`
- `student_action_en`
- `student_action_pt`
- `teacher_action`
- `estimated_minutes`
- `mode`

Recommended step shape:

```json
{
  "step_number": 1,
  "title": "Notice the design details",
  "student_action_en": "Look at the image and choose three details to describe.",
  "student_action_pt": "Observe a imagem e escolha três detalhes para descrever.",
  "teacher_action": "Model one example before students begin.",
  "estimated_minutes": 5,
  "mode": "individual"
}
```

Use `student_action_en` and `student_action_pt` for app-facing step instructions. `teacher_action` may remain English-only unless a later phase requires Portuguese teacher-facing material.

Recommended step modes:

- `individual`
- `pair`
- `small_group`
- `whole_class`
- `teacher_led`
- `app_individual`
- `app_pair`

Even if the future app implementation differs, the steps should be pedagogically complete.

## 12. Assessment Requirements

Activities that produce student output should include assessment guidance.

The `assessment` field should use one shared object that supports simple and rich assessment without requiring every activity to use every field.

Recommended structure:

```json
{
  "mode": "checklist",
  "completion_criteria_en": [],
  "completion_criteria_pt": [],
  "checklist_en": [],
  "checklist_pt": [],
  "rubric": [],
  "model_response_en": "",
  "model_response_pt": "",
  "common_errors": [],
  "feedback_prompts_en": [],
  "feedback_prompts_pt": []
}
```

Allowed `mode` values:

- `completion`
- `checklist`
- `rubric`
- `model_response`
- `teacher_review`
- `self_check`
- `peer_feedback`

Assessment fields may be empty arrays or empty strings when not applicable, but the `assessment` object itself should be present. Student-facing assessment text should have English and Portuguese versions when it may be shown directly to students.

Rubrics should be simple and practical.

A rubric item should include bilingual student-facing labels when the rubric may be shown to students.

Recommended rubric item shape:

```json
{
  "criterion": "Use of fashion vocabulary",
  "excellent_en": "Uses accurate fashion vocabulary naturally.",
  "excellent_pt": "Usa vocabulário de moda com precisão e naturalidade.",
  "satisfactory_en": "Uses some correct fashion vocabulary.",
  "satisfactory_pt": "Usa algum vocabulário de moda corretamente.",
  "needs_work_en": "Needs more accurate fashion vocabulary.",
  "needs_work_pt": "Precisa usar vocabulário de moda com mais precisão."
}
```

## 13. Vocabulary File Requirements

Each week should include `vocabulary.json`.

The vocabulary file should use an object wrapper, not a bare array.

Required top-level shape:

```json
{
  "week_id": "m01w01",
  "vocabulary_groups": []
}
```

Vocabulary items should be stored inline inside their vocabulary groups. This keeps weekly files easy to review and avoids unnecessary indirection during content writing.

Each vocabulary item should include:

- `vocab_id`
- `term`
- `part_of_speech`
- `definition_en`
- `learner_friendly_definition_en`
- `learner_friendly_definition_pt`
- `example_sentence_en`
- `example_sentence_pt`
- `professional_context_en`
- `professional_context_pt`
- `translation_notes_pt`
- `pronunciation_notes`
- `related_terms`
- `difficulty`

Recommended vocabulary item shape:

```json
{
  "vocab_id": "m01w01-v001",
  "term": "silhouette",
  "part_of_speech": "noun",
  "definition_en": "The overall shape or outline of a garment or look.",
  "learner_friendly_definition_en": "The outside shape you see when you look at clothing.",
  "learner_friendly_definition_pt": "A forma geral que você vê quando olha para uma peça de roupa.",
  "example_sentence_en": "This dress has a loose A-line silhouette.",
  "example_sentence_pt": "Este vestido tem uma silhueta evasê e solta.",
  "professional_context_en": "Designers use silhouette to describe the first visual impression of a garment.",
  "professional_context_pt": "Designers usam silhueta para descrever a primeira impressão visual de uma peça.",
  "translation_notes_pt": "Em moda, 'silhouette' geralmente corresponde a 'silhueta'.",
  "pronunciation_notes": "Stress the first syllable: SIL-oo-et.",
  "related_terms": ["shape", "outline", "fit"],
  "difficulty": "core"
}
```

### 13.1 Vocabulary ID Format

Vocabulary IDs should be stable and sortable.

Example:

```text
m01w01-v001
m01w01-v002
m01w01-v003
```

### 13.2 Vocabulary Groups

Vocabulary groups should include:

- `group_id`
- `title`
- `description`
- `items`

Example groups for an early fashion-design module may include:

- garment categories
- silhouette and shape
- fabric and materials
- color and pattern
- measurements and fit
- design process language
- classroom critique language

## 14. Teacher Notes Requirements

Each week should include `teacher_notes.md`.

Teacher notes should use fixed section headings so reviewers and future tooling can find expected information consistently. The validator does not need deep semantic validation of the markdown in Phase 1, but it should check that required headings are present.

Required `teacher_notes.md` headings:

```markdown
# Teacher Notes: Week <number> — <title>

## Common Learner Difficulties
## Classroom Management Suggestions
## Professional Context Notes
## Cultural or Industry Notes
## Simplify This Week
## Extend This Week
## Asynchronous or App-Based Adaptation
```

Teacher notes should be practical and concrete, not generic.

## 15. Asset Manifest Requirements

Each week should include `asset_manifest.json`.

The asset manifest should list all media assets needed by activities.

The file should use an object wrapper, not a bare array.

Required top-level shape:

```json
{
  "week_id": "m01w01",
  "assets": []
}
```

Assets may include:

- Images.
- Audio clips.
- PDFs.
- Printable worksheets.
- Reference cards.
- Example student outputs.

Each asset should include:

- `asset_id`
- `week_id`
- `asset_type`
- `title`
- `description`
- `target_filename`
- `status`
- `used_by_activity_ids`
- `generation_source`
- `notes`

Recommended asset shape:

```json
{
  "asset_id": "m01w01-img-001",
  "week_id": "m01w01",
  "asset_type": "image",
  "title": "Garment silhouette comparison",
  "description": "Visual prompt for comparing basic garment silhouettes.",
  "target_filename": "assets/images/module-01/week-01/m01w01-img-001.png",
  "status": "needed",
  "used_by_activity_ids": ["m01w01-a02"],
  "generation_source": "image_generation",
  "notes": "Generate after Week 1 text is approved."
}
```

Allowed `asset_type` values:

- `image`
- `audio`
- `pdf`
- `worksheet`
- `reference_card`
- `example_output`

Allowed asset statuses:

- `needed`
- `planned`
- `generated`
- `provided`
- `missing`
- `not_required`

Asset IDs should be stable and sortable.

Examples:

```text
m01w01-img-001
m01w01-aud-001
m01w01-pdf-001
```

## 16. Image Prompt Requirements

Each week should always include `image_prompts.json`, even if no images are needed. If no images are needed, use an empty `image_prompts` array.

The file should use an object wrapper, not a bare array.

Required top-level shape:

```json
{
  "week_id": "m01w01",
  "image_prompts": []
}
```

Image prompts should not assume images have already been generated.

Each image prompt should include:

- `asset_id`
- `purpose`
- `target_filename`
- `visual_description`
- `style_instructions`
- `composition_notes`
- `text_in_image`
- `avoid`
- `used_by_activity_ids`
- `status`

Recommended image prompt shape:

```json
{
  "asset_id": "m01w01-img-001",
  "purpose": "Student visual prompt for comparing garment silhouettes.",
  "target_filename": "assets/images/module-01/week-01/m01w01-img-001.png",
  "visual_description": "Four adult mannequins or illustrated figures wearing clearly different basic silhouettes.",
  "style_instructions": "Use a clean fashion sketch style because the activity focuses on garment shape.",
  "composition_notes": "Place the figures side by side with uncluttered background and clear garment outlines.",
  "text_in_image": "None.",
  "avoid": "Avoid brand logos, tiny labels, exaggerated runway poses, or childish cartoon styling.",
  "used_by_activity_ids": ["m01w01-a02"],
  "status": "needed"
}
```

### 16.1 Image Style Guidance

Image style should remain flexible and should be appropriate to the instructional task.

The most common preferred styles are likely to be:

- digital watercolor for warm, ESL textbook-friendly scenes and visual prompts
- fashion sketch style for garment, silhouette, design-process, and portfolio-oriented visuals

Codex should not hard-spec one universal style across the course. Each image prompt should choose a style based on the activity purpose and should explain that choice in `style_instructions`.

Images should be clear, inclusive, and suitable for adult learners. They should avoid looking childish unless an activity specifically requires simplified visuals.

Images should represent diverse learners, designers, models, body types, skin tones, and genders where people are shown.

### 16.2 Text in Images

Text inside images should be avoided unless absolutely necessary.

When text is needed, it should be short and included explicitly in `text_in_image`.

## 17. Audio Prompt Requirements

Each week should always include `audio_prompts.json`, even if no audio is needed. If no audio is needed, use an empty `audio_prompts` array.

The file should use an object wrapper, not a bare array.

Required top-level shape:

```json
{
  "week_id": "m01w01",
  "audio_prompts": []
}
```

Audio prompts should describe needed audio clips but should not generate audio in this phase.

Each audio prompt should include:

- `asset_id`
- `purpose`
- `target_filename`
- `script`
- `speaker_profile`
- `accent_or_variety`
- `speed`
- `voice_direction`
- `suggested_openai_voice_role`
- `duration_estimate_seconds`
- `used_by_activity_ids`
- `status`

Recommended audio prompt shape:

```json
{
  "asset_id": "m01w01-aud-001",
  "purpose": "Listening model for a short designer-client introduction.",
  "target_filename": "assets/audio/module-01/week-01/m01w01-aud-001.mp3",
  "script": "Designer: Hello, I’m Ana. I’m a student designer. Client: Nice to meet you. Can you describe your design idea?",
  "speaker_profile": "Two adult speakers: one student fashion designer and one client.",
  "accent_or_variety": "Clear international English suitable for A2-B1 learners.",
  "speed": "slow-natural",
  "voice_direction": "Friendly, professional, clear pauses between turns.",
  "suggested_openai_voice_role": "Use two contrasting ChatGPT/OpenAI voices available at generation time; one should sound like a young adult designer and one like a professional client.",
  "duration_estimate_seconds": 20,
  "used_by_activity_ids": ["m01w01-a04"],
  "status": "needed"
}
```

The project expects to use OpenAI/ChatGPT-provided voices available at the time of asset generation. Do not design around Amazon Polly. Do not hard-code current ChatGPT voice names as schema requirements because voice availability may change. Instead, describe the desired speaker role, delivery style, accent or variety, speed, and voice direction so the asset-generation pass can select an appropriate available OpenAI/ChatGPT voice.

### 17.1 Audio Script Requirements

Audio scripts should be classroom-appropriate and realistic.

Scripts may include:

- Designer-client conversations.
- Critique language.
- Studio instructions.
- Measurement and fitting dialogue.
- Fashion presentation excerpts.
- Short lectures or explanations.

Audio scripts should be useful both for generated audio and for teacher read-aloud use.

Where a dialogue has multiple speakers, the audio prompt should identify speaker turns clearly and may recommend contrasting voice roles, such as instructor, student designer, client, peer reviewer, studio manager, or narrator.

For the current phase, keep the usable transcript or script inside `audio_prompts.json`. Do not create a separate transcript asset unless the schema and workflow are explicitly updated to support one.

## 18. Language and Pedagogical Requirements

The course is English for Special Purposes.

Content should balance:

- Practical workplace/professional fashion language.
- General English development.
- Visual description.
- Presentation and critique language.
- Design-process communication.
- Student production.

Activities should not be generic ESL activities with fashion words pasted in. The fashion-design context should matter.

## 19. Learner Level Assumptions

The likely learner range is A2 to B2.

Activities should support mixed-level groups by including:

- Sentence frames.
- Word banks.
- Optional challenge tasks.
- Model answers.
- Pair or group scaffolding.
- Visual support.

Beginner-accessible output should still feel adult and professionally relevant.

## 20. Student-Facing Language

Student-facing language should be clear, direct, bilingual, and usable in an app later.

Student-facing fields should include both English and Brazilian Portuguese when they may be shown to students. The future app should be able to toggle student-facing instructions between English and Portuguese without changing the underlying activity structure.

Avoid overlong explanations in student instructions.

Use action verbs:

- Look.
- Choose.
- Match.
- Describe.
- Compare.
- Explain.
- Present.
- Revise.
- Reflect.

## 21. Teacher-Facing Language

Teacher-facing language may be more detailed and may remain English-only during this phase unless a task specifically requests Portuguese teacher-facing support.

Teacher instructions should explain:

- What the teacher should prepare.
- How to introduce the task.
- What to monitor.
- What errors to expect.
- How to give feedback.
- How to adapt the task.

## 22. App-Readiness Requirements

Although no app is being built in this phase, content should be designed so a future app can consume it.

This means the project is making content app-ready without implementing the student app, teacher/admin systems, grading infrastructure, or future interface layer in this pass.

Activities should therefore separate:

- Student instructions.
- Teacher instructions.
- Input material.
- Steps.
- Expected output.
- Assessment.
- Asset references.

Avoid burying app-critical information only in prose.

For all new or rewritten activities, `notes_for_app_design` should be concrete enough to identify the expected interaction pattern, saved output, checking path, and any teacher-review or revision implications.

Each activity should include `notes_for_app_design` describing likely app needs, such as:

- draggable matching
- short text entry
- audio playback
- image prompt
- pair discussion not directly app-graded
- teacher-reviewed output
- self-check quiz
- rubric-based review

Validation passing is necessary but not sufficient. A week is not model-ready or commit-ready until a student-render review confirms that student interaction, exact output, checker path, A2 suitability, metadata alignment, media use, and `notes_for_app_design` are all clear and workable.

## 23. Validation Requirements

Codex should create validation scripts that check at minimum:

- Required files exist for each week.
- JSON files parse correctly.
- JSON files match the required wrapper shapes and required fields from this document.
- JSON files are compatible with the schema files created in `schemas/`.
- Markdown files include required headings.
- IDs follow expected naming patterns.
- Activity IDs listed in `week_manifest.json` exist in `activities.json`.
- Asset IDs referenced in activities exist in `asset_manifest.json`.
- Image prompt asset IDs exist in `asset_manifest.json`.
- Audio prompt asset IDs exist in `asset_manifest.json`.
- Vocabulary references exist in `vocabulary.json`.
- Estimated minutes are numeric.
- Required student and teacher instruction fields are present.

Schema and validator hardening for the new operational activity metadata is expected as follow-up work after this documentation alignment pass. That future work should add enforcement for fields such as `primary_interaction_type`, `submission_type`, `checked_by`, `teacher_review_required`, and `revision_supported`, along with any related controlled values and cross-field checks.

Validation can confirm structure, references, and many required fields, but it may not catch metadata/output mismatches, overlong A2 writing tasks, unclear student interaction, audio-answer mismatch, image-label ambiguity, or vague app-design notes. Those issues belong in student-render review.

### 23.1 Validator Dependency Rule

The Phase 1 validator should be written in Python and should use the Python standard library only.

Codex should not introduce required third-party dependencies such as `jsonschema` unless explicitly instructed in a later phase. The JSON schema files should still be created as documentation and future tooling artifacts, but the Phase 1 validator must implement the required checks directly in Python.

For Phase 1, the schemas and validator should be aligned at the contract level:

- schemas describe the intended full shape of each JSON file
- the Python validator enforces required files, required wrapper keys, required fields, ID patterns, controlled values, bilingual student-facing fields, and cross-file references
- the Python validator may skip advanced JSON Schema features that would require a third-party package
- any checks present in schemas but not enforced by the validator should be documented as warnings or future enforcement notes

This keeps validation portable and easy to run from a clean repo checkout.

### 23.2 Validation Report Behavior

Validation should produce a readable report at:

```text
generated/validation_report.md
```

The validator should overwrite `generated/validation_report.md` on each run. It does not need to preserve history, append previous runs, or create timestamped reports in Phase 1.

The report should include:

- Pass/fail status.
- Files checked.
- Errors.
- Warnings.
- Missing assets.
- Suggested next actions.

## 24. Future SQLite Requirements

SQLite is expected in a later phase.

The current phase should not start by designing a final database schema unless specifically requested.

When the content source files are stable, a future milestone should add:

```text
schemas/course_content.sql
tools/build_sqlite.py
generated/course_content.sqlite
```

The future SQLite builder should consume the canonical files in `content/`.

Likely future tables include:

- `courses`
- `modules`
- `weeks`
- `activities`
- `activity_steps`
- `vocabulary_groups`
- `vocabulary_items`
- `assets`
- `image_prompts`
- `audio_prompts`
- `rubrics`
- `teacher_notes`

But these tables should not constrain the current content authoring model prematurely.

## 25. Weekly Content Generation Requirements

When instructed to generate a week, Codex should:

1. Read `docs/fashion-course-content-requirements.md` and `docs/fashion-activity-design-guidance.md`.
2. Read the existing course/module/week structure.
3. Use the previous week as a structural model where applicable.
4. Review relevant existing `docs/` course materials as living source/reference material when available.
5. Start with a planning pass when the task calls for planning or review-first workflow.
6. Create or update only the target week folder unless instructed otherwise.
7. Create complete weekly files during the execution pass.
8. Keep IDs stable and consistent.
9. Add bilingual English/Portuguese student-facing content.
10. Add asset planning records for needed images and audio.
11. Run validation.
12. Fix validation errors.
13. Run a student-render review pass before calling the week complete or model-ready.
14. Apply a surgical refinement pass if the review finds interaction or metadata issues.
15. Commit only after review and refinement passes are complete.
16. Handle media generation and post-generation verification in separate later passes.
17. Produce an execution summary.

The normal weekly workflow is:

1. planning pass
2. execution/content creation pass
3. student-render review pass
4. surgical refinement pass if needed
5. commit only after review/refinement passes
6. separate media-generation pass
7. media verification/status-update pass after binaries are pushed

## 26. Execution Summary Requirements

After each Codex task, Codex should report:

- Files created.
- Files modified.
- Validation command run.
- Validation result.
- New activity IDs.
- New vocabulary IDs.
- Needed image assets.
- Needed audio assets.
- Any schema changes.
- Any open questions or assumptions.

The image and audio sections are important because this project will use later image/audio generation passes.

When the task creates or revises activities, the execution summary should also include this per-activity block:

```text
For each activity:
- activity ID
- title
- primary interaction type
- submission type
- who checks it: app / teacher / student / not_submitted
- expected student output
- teacher review required: yes/no
- revision supported: yes/no
- media used
```

The summary should include a clear asset checklist like:

```text
Images needed:
- m01w01-img-001 — Garment silhouette comparison image — assets/images/module-01/week-01/m01w01-img-001.png
- m01w01-img-002 — Studio critique scene — assets/images/module-01/week-01/m01w01-img-002.png

Audio needed:
- m01w01-aud-001 — Short designer-client greeting dialogue — assets/audio/module-01/week-01/m01w01-aud-001.mp3
```

## 27. Media Workflow Requirements

Media assets are planned inside canonical week content but generated separately.

When a later pass generates image or audio binaries, the follow-up workflow should:

1. verify the target files exist at the planned filenames
2. update `asset_manifest.json` statuses
3. update `image_prompts.json` statuses
4. update `audio_prompts.json` statuses
5. run validation again
6. confirm the week no longer appears under missing assets in `generated/validation_report.md`

Completed weeks later need a separate media-production bundle drawn from:

- `asset_manifest.json`
- `image_prompts.json`
- `audio_prompts.json`

That bundle should include:

- image-generation prompts
- TTS or teacher read-aloud scripts
- target filenames
- asset checklist
- post-generation verification and status-update instructions

## 28. Phased Implementation Plan

### Phase 1 — Content System Foundation

Create:

- Directory structure.
- Schemas.
- Validation script.
- Minimal but real course/module/week seed files.
- A course manifest that declares the designed total module and week counts if those values are available in `docs/`.
- README.
- AGENTS.md.

Phase 1 Week 1 should not be nonsense dummy text. It should be small and structurally complete, and it may reflect existing fashion-course materials where easy to do so. However, it should not try to become the full Week 1 gold standard yet.

Phase 1 should include bilingual student-facing English/Portuguese fields in the seed activity content so the schema and validator establish localization from the beginning.

Do not generate full course content yet.

### Phase 2 — Week 1 Gold Standard

Create complete Week 1 files using the agreed curriculum notes and relevant existing course materials.

Week 1 becomes the model for later weeks.

### Phase 3 — Weekly Content Production

Generate each remaining week one at a time.

Each week should pass validation, complete student-render review, and receive any needed refinement before it becomes the next model week.

### Phase 4 — Asset Generation Planning Review

Review all image and audio prompts.

Generate media assets separately after text content stabilizes.

### Phase 5 — SQLite Builder

Create a database schema and build script that converts the validated content files into SQLite.

### Phase 6 — Future App Integration

Use the generated database/content pack in a future app.

This is explicitly outside the current content-generation phase.

## 29. Codex Working Rules

Codex should follow these rules:

- Read `docs/fashion-course-content-requirements.md` and `docs/fashion-activity-design-guidance.md` before creating or revising activities.
- Do not build app code or scaffolding during content-only tasks unless explicitly instructed.
- Do not modify unrelated files.
- Do not rename established files, IDs, or folders without explicit instruction.
- Do not generate binary media files unless explicitly instructed.
- Prefer simple, reviewable files over clever abstractions.
- Keep content human-readable.
- Keep schemas strict enough to catch mistakes but not so strict that curriculum writing becomes painful.
- Treat `content/` as the canonical structured source once files exist there.
- Treat existing `docs/` materials as living reference/source material unless instructed to migrate them.
- Use relevant `docs/` materials to guide content decisions when needed.
- Update `docs/` only when the assigned task requires documentation changes, requirements updates, or source-material cleanup.
- Do not derive content from `.obsidian`, workspace metadata, editor settings, cache files, or other non-curriculum metadata.
- Report assumptions clearly.
- Run validation before reporting completion.
- Treat validation as necessary but not sufficient for model-ready content.
- Require student-render review before treating a week as commit-ready or the next structural model.
- Include exact commands used for validation.
- Include exact file paths in summaries.

## 30. Naming Conventions

Use lowercase directory names and stable IDs.

Canonical `content/` filenames should be concise and machine-oriented. Use stable names like `activities.json`, `vocabulary.json`, and `lesson_plan.md` rather than long descriptive filenames.

Long descriptive titles belong inside file contents, not in canonical filenames.

Recommended patterns:

```text
module-01
week-01
m01w01
m01w01-a01
m01w01-v001
m01w01-img-001
m01w01-aud-001
```

Target media paths should use matching structure:

```text
assets/images/module-01/week-01/m01w01-img-001.png
assets/audio/module-01/week-01/m01w01-aud-001.mp3
```

## 31. Quality Bar

The content should be good enough that a future teacher, app designer, or developer can understand what students are supposed to do without reading the original planning conversation.

Each activity should answer:

- What does the student do?
- Why does it matter professionally?
- What language does the student practice?
- What input does the student need?
- What output does the student produce?
- How does the teacher or app know the student completed it?
- What assets are needed?

If an activity does not answer these questions, it is not complete.

## 32. Phase 1 Implementation Decisions

These decisions resolve expected implementation ambiguities for Codex.

1. Existing `docs/` course materials are reference/source material, not the canonical structured source.
2. Phase 1 should create a clean `content/` structure in parallel with existing docs.
3. Phase 1 Week 1 should be minimal but real, not meaningless dummy content.
4. Full Week 1 development belongs to Phase 2.
5. Markdown files should use fixed required headings.
6. Weekly JSON files should use object wrappers, not bare arrays.
7. Controlled vocabularies should be strict by default but allow explicit custom fields with explanations.
8. CEFR should use both access level and target level.
9. Vocabulary items should be inline inside vocabulary groups.
10. Assessment should use one shared object that supports both simple and rich assessment.
11. `image_prompts.json` and `audio_prompts.json` should always exist, even when empty.
12. The Phase 1 validator should be Python standard-library only.
13. `generated/validation_report.md` should be overwritten on each validation run.
14. AGENTS.md should tell Codex to ignore `.obsidian` and other workspace metadata.
15. Canonical filenames should be concise and machine-oriented.
16. Codex may read existing `docs/` materials during Phase 1, but should not perform a full migration until instructed.
17. The course manifest should declare the designed total module and week counts from the start when those values are available in the course-planning materials.
18. Student-facing activity content should include English and Brazilian Portuguese from the beginning.
19. Image style should remain flexible and task-appropriate, with digital watercolor and fashion sketch style as common preferred defaults.
20. Audio planning should target OpenAI/ChatGPT voice generation, using voice-role and delivery guidance rather than hard-coded provider-specific voice names.
21. Existing `docs/` content is living material and may be updated when the task requires it, but weekly canonical app-ready content belongs under `content/`.
22. Validation passing is required but does not replace student-render review.
23. For early Module 1 weeks, teacher-reviewed writing should use structured sentence-frame outputs instead of paragraph-length base requirements.
24. Media generation and media verification happen in separate later passes from weekly content authoring.

## 33. First Milestone Prompt for Codex

Use the following prompt for the first Codex implementation milestone after this requirements document is placed in `docs/`.

```text
We are building the canonical content source structure for an English for Special Purposes fashion design course.

Read `docs/fashion-course-content-requirements.md` and `docs/fashion-activity-design-guidance.md` and implement Phase 1 only.

Do not build app code or scaffolding during this content-system milestone. Do not create a production SQLite database. Do not generate images or audio. Do not modify unrelated files.

Phase 1 scope:
1. Create the content directory structure.
2. Create schemas for course, module, week, activities, vocabulary, asset manifest, image prompts, and audio prompts.
3. Create a standard-library-only Python validation script that checks required files, wrapper shapes, required JSON fields, bilingual student-facing fields, markdown headings, ID consistency, controlled values, and references between activities, vocabulary, and assets.
4. Create minimal but real seed content for course_manifest.json, module-01/module_manifest.json, and module-01/week-01 files. This should not be nonsense placeholder text, but it should remain small and should not attempt full Week 1 development yet.
5. Include bilingual English/Portuguese student-facing fields in the seed activity content.
6. Declare the designed total module and week counts in course_manifest.json if those values are clearly available in the existing docs. If not, report the missing decision rather than inventing values.
7. Create generated/validation_report.md by running the validator.
8. Create or update README.md with instructions for the content pipeline.
9. Create or update AGENTS.md with Codex working rules for this repo.

Expected structure:

content/
  course/
    course_manifest.json
    modules/
      module-01/
        module_manifest.json
        week-01/
          week_manifest.json
          lesson_plan.md
          activities.json
          vocabulary.json
          teacher_notes.md
          asset_manifest.json
          image_prompts.json
          audio_prompts.json

schemas/
  course_manifest.schema.json
  module_manifest.schema.json
  week_manifest.schema.json
  activities.schema.json
  vocabulary.schema.json
  asset_manifest.schema.json
  image_prompts.schema.json
  audio_prompts.schema.json

tools/
  validate_content.py

generated/
  validation_report.md

Requirements:
- Use stable IDs like m01w01-a01, m01w01-v001, m01w01-img-001, and m01w01-aud-001.
- Use object wrappers for weekly JSON files, such as { "week_id": "m01w01", "activities": [] }, not bare arrays.
- Follow the JSON Authoring Contract in the requirements document, including two-space indentation, snake_case field names, no nulls unless explicitly allowed, and empty arrays for intentionally empty repeatable values.
- Always create image_prompts.json and audio_prompts.json, even when the prompt arrays are empty.
- Use fixed headings in lesson_plan.md and teacher_notes.md.
- Keep Phase 1 Week 1 small but structurally complete.
- The validator should be runnable from the repo root.
- The validator should write generated/validation_report.md and overwrite the previous report on each run.
- The README should explain how to validate the content.
- AGENTS.md should tell future Codex runs to treat `docs/fashion-course-content-requirements.md` as the source of truth for the content system, treat `docs/fashion-activity-design-guidance.md` as the source of truth for activity design quality, treat `content/` as the canonical structured source, use relevant `docs/` course materials as living source/reference material, and ignore `.obsidian` or other workspace metadata.

After implementation, report:
- Files created.
- Files modified.
- Validation command run.
- Validation result.
- Any assumptions made.
- Any suggested changes to the requirements document.
- Needed image assets, if any.
- Needed audio assets, if any.
```

