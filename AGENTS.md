# AGENTS.md

## Project Role

This repository is being used to build the canonical content source for an **English for Special Purposes course focused on fashion design**.

The current phase is **content generation only**. Do not build an app unless explicitly instructed.

## Source of Truth

Read and follow:

```text
docs/fashion-course-content-requirements.md
```

That requirements document is the source of truth for this phase.

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

## Working Rules for Codex

- Read `docs/fashion-course-content-requirements.md` before making content-pipeline changes.
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

New vocabulary IDs:
- ...

Images needed:
- asset_id — description — target path

Audio needed:
- asset_id — description — target path

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
