# AGENTS.md

## Project Role

This repository is being used to build the canonical content source for an **English for Special Purposes course focused on fashion design**.

The current phase is **content generation only**. Do not build an app unless explicitly instructed.

## Source of Truth

Read and follow:

```text
docs/fashion-course-content-requirements.md
docs/fashion-activity-design-guidance.md
```

Use both documents together:

- `docs/fashion-course-content-requirements.md` is the source of truth for content-system structure, canonical content format, schema and validator expectations, and phase boundaries.
- `docs/fashion-activity-design-guidance.md` is the source of truth for activity-design quality, concrete student interaction, app-readiness, teacher review needs, and revision workflow.

If the current schema prevents the activity guidance from being followed, plan a requirements/schema/validator follow-up before generating more content.

Once `content/` exists, treat it as the canonical structured source for app-ready course content. Existing materials under `docs/` are living course-planning and reference materials. Use relevant `docs/` material to guide content decisions when needed, but do not treat existing docs as the final structured app-ready content format.

## Current Phase Boundary

In scope:

- course/module/week content structure
- manifests
- JSON schemas
- weekly activity JSON
- vocabulary JSON
- lesson plans
- teacher notes
- asset manifests
- image prompt planning
- audio prompt planning
- validation scripts
- validation reports
- documentation updates directly related to this content pipeline

Out of scope unless explicitly requested:

- student app
- teacher/admin app
- authentication
- user accounts
- grading infrastructure
- analytics
- deployment
- production SQLite generation
- image generation
- audio generation
- final UI design

SQLite is expected later, but it must be treated as a generated artifact, not the primary authoring format.

## Expected Repository Structure

Use this structure for Phase 1 unless the requirements document is explicitly updated:

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
```

## Content Authoring Rules

### Canonical Content

Canonical app-ready content belongs under:

```text
content/
```

Existing material under:

```text
docs/
```

is source/reference material unless a task explicitly says to update, reorganize, or migrate it.

Do not perform a full migration from `docs/` to `content/` unless instructed.

### JSON Rules

All canonical JSON files must follow the JSON Authoring Contract in the requirements document:

- UTF-8 JSON
- two-space indentation
- object wrappers, not bare arrays
- `snake_case` field names
- internal field names in English
- arrays for repeatable values
- empty arrays for intentionally empty repeatable values
- empty strings only when a required field is not applicable yet
- no `null` unless explicitly allowed by schema
- no comments in JSON

Weekly list-style JSON files must use wrappers such as:

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

### Markdown Rules

Weekly Markdown files must use the fixed required headings from the requirements document.

`lesson_plan.md` must include:

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

`teacher_notes.md` must include:

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

### Bilingual Student-Facing Content

Student-facing app text must include English and Brazilian Portuguese from the beginning.

Use English internal field names. Provide Portuguese only in student-facing content fields.

Bilingual student-facing content is required for:

- activity titles shown to students
- activity summaries shown to students
- student instructions
- student success criteria
- sentence frames
- word-bank labels
- activity step instructions
- completion criteria
- checklist items
- model responses
- feedback prompts
- app-facing labels or prompts inside activity input objects

Teacher-only notes and internal reviewer fields may remain English-only during this phase.

### Vocabulary

Vocabulary terms remain English because this is an English course. Vocabulary files should include Portuguese support fields where useful, but should not replace English learning content with Portuguese translations.

Vocabulary items should be inline inside vocabulary groups unless the requirements document is later changed.

### ID Rules

Use stable, sortable IDs.

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

Do not rename established IDs unless explicitly instructed.

### Controlled Values

Use controlled lists from the requirements document.

If an activity type does not fit the controlled list, use:

```json
"activity_type": "custom",
"activity_type_custom": "Short explanation."
```

If a skill focus does not fit the controlled list, include:

```json
"skill_focus": ["custom"],
"skill_focus_custom": "Short explanation."
```

Explain any custom values in the execution summary.

## Asset Planning Rules

Do not generate binary images or audio unless explicitly requested.

Do plan assets using:

```text
asset_manifest.json
image_prompts.json
audio_prompts.json
```

Always create `image_prompts.json` and `audio_prompts.json`, even if the prompt arrays are empty.

Image style should remain task-appropriate. Common preferred styles include digital watercolor and fashion sketch style, but do not hard-code one universal style across the course.

Audio planning should target OpenAI/ChatGPT voice generation. Do not design around Amazon Polly. Do not hard-code current voice names as schema requirements. Use role, accent or variety, speed, delivery style, and voice-direction guidance.

## Validation Rules

Phase 1 validation must use:

```text
tools/validate_content.py
```

The validator must be Python standard-library only unless the user explicitly approves dependencies.

The validator should be runnable from the repository root and should write:

```text
generated/validation_report.md
```

The report should be overwritten on each run.

The validator should check at minimum:

- required files exist
- JSON parses correctly
- wrapper shapes are correct
- required JSON fields are present
- bilingual student-facing fields are present where required
- Markdown required headings are present
- ID patterns are valid
- controlled values are valid
- activity references resolve
- asset references resolve
- vocabulary references resolve
- image/audio prompt asset IDs exist in `asset_manifest.json`
- estimated minutes are numeric

Schema files under `schemas/` describe the intended full structure. The Python validator enforces the most important checks without third-party packages. If a schema includes checks not enforced by the validator, document that gap in the README, validation report, or execution summary.

Schema and validator hardening for the newer operational activity metadata is expected in a later pass. Do not treat the absence of that hardening as permission to ignore the documentation requirements for new or rewritten activities.

## Working Rules for Codex

- Read `docs/fashion-course-content-requirements.md`, `docs/fashion-activity-design-guidance.md`, `AGENTS.md`, and `README.md` before creating or revising activities.
- Keep work scoped to the user’s current milestone.
- Do not build an app unless explicitly instructed.
- Do not create production SQLite unless explicitly instructed.
- Do not generate images or audio unless explicitly instructed.
- Do not modify unrelated files.
- Do not rename established files, folders, IDs, classes, or modules without explicit instruction.
- Prefer simple, reviewable files over clever abstractions.
- Keep content human-readable.
- Keep schemas strict enough to catch mistakes but not so strict that curriculum writing becomes painful.
- Use relevant `docs/` course materials when needed.
- Update `docs/` only when the task requires documentation changes, requirements updates, or source-material cleanup.
- Do not derive content from `.obsidian`, workspace metadata, editor settings, cache files, or other non-curriculum metadata.
- Run validation before reporting completion.
- Fix validation errors before reporting completion when possible.
- Include exact commands used for validation.
- Include exact file paths in summaries.

## Weekly Workflow Rules

Future weeks should normally follow this sequence:

1. planning pass
2. execution/content creation pass
3. student-render review pass
4. surgical refinement pass if needed
5. commit only after review/refinement passes
6. separate media-generation pass
7. media verification/status-update pass after binaries are pushed

Validation alone is not enough. A week is not model-ready or commit-ready until student-render review confirms:

- what the student sees first
- what the student taps, chooses, matches, types, listens to, reads, or says
- exact expected output
- checker path
- A2 suitability
- metadata/content alignment
- media use
- `notes_for_app_design` clarity

## Activity Guardrails

- For early Module 1 weeks, teacher-reviewed writing must not use paragraph-length word counts as the base requirement. Use sentence frames, structured text fields, 4 to 6 required lines, 1 optional challenge sentence, teacher checklist, feedback prompts, and revision support where meaningful.
- Operational metadata must match the primary saved or scored output. If `primary_interaction_type` is `image_match` and `submission_type` is `matching`, the main saved output must be matching. If `primary_interaction_type` is `word_bank_fill_blank` and `submission_type` is `fill_blank`, the main saved output must be fill-blank phrase completion. If every app-checked item is single-choice, do not label the activity `multiple_choice`.
- Any `checked_by: app` activity must include enough answer data for future app checking: visible options, `correct_answer` or `accepted_answers`, image keys or point labels where relevant, clear answer match to the prompt, and no hidden teacher judgment.
- For `listen_and_choose` activities, the audio script must match every app-checked item. Question labels, options, correct answers, expected output, model response, and the `audio_prompts.json` script must agree. Keep the transcript or script in `audio_prompts.json` for now. Do not create a separate transcript asset in the current phase.
- For reading or visual tasks using image boards, app-checked image matching or label tasks must use explicit visible keys such as image A/B/C or point A-H. `correct_answer` values must resolve clearly to those keys, and `image_prompts.json` plus `asset_manifest.json` notes must match the same point/key strategy used in `activities.json`.
- Speaking activities are teacher-observed. Do not design them around audio recording, upload, or automated speech scoring unless a future requirement explicitly changes that rule.

## Media and Status Rules

- Media assets are planned in canonical week files but generated separately.
- After media binaries are pushed, verify target files exist, update `asset_manifest.json` statuses, update `image_prompts.json` statuses, update `audio_prompts.json` statuses, run validation, and confirm the week no longer appears under missing assets in `generated/validation_report.md`.
- In module manifests, `planned` means the week is expected or source material exists but canonical structured content is not yet complete. `seeded` means the canonical structured week folder exists, has passed student-render review/refinement, and validates.
- Do not invent additional status values unless schemas, data, documentation, and workflow are updated together.

## Required Execution Summary

After each task, report:

```text
Files created:
- ...

Files modified:
- ...

Validation command run:
- ...

Validation result:
- PASS/FAIL with brief details

New activity IDs:
- ...

For each activity created or revised:
- activity ID
- title
- primary interaction type
- submission type
- who checks it: app / teacher / student / not_submitted
- expected student output
- teacher review required: yes/no
- revision supported: yes/no
- media used

New vocabulary IDs:
- ...

Images needed:
- asset_id - description - target path

Audio needed:
- asset_id - description - target path

Schema changes:
- none / details

Assumptions:
- ...

Open questions:
- ...
```

If there are no images or audio needed, say so explicitly.

## Phase 1 Target

For Phase 1, implement only the content system foundation:

1. Create the content directory structure.
2. Create schemas.
3. Create the standard-library-only Python validator.
4. Create minimal but real seed content for course, module, and Week 1.
5. Include bilingual English/Portuguese student-facing fields in seed activities.
6. Declare designed total modules/weeks in `course_manifest.json` if clearly available from `docs/`; otherwise report the missing decision instead of inventing values.
7. Run validation and write `generated/validation_report.md`.
8. Update `README.md`.
9. Update this `AGENTS.md` if needed to remain aligned with the requirements document.
