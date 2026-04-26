# Fashion Design English Course Content

This repository contains the content-production system for an **English for Special Purposes course focused on fashion design**.

The current phase is **content generation only**. The goal is to create structured, reviewable, app-ready curriculum content that can later be converted into SQLite or another app-consumable content pack.

This repository is not currently building the student app, teacher app, authentication system, grading system, analytics, deployment pipeline, or final UI.

## Source of Truth

The main requirements document is:

```text
docs/fashion-course-content-requirements.md
```

Read that document before making structural content changes.

Existing material under `docs/` is living course-planning and reference material. It can guide content decisions and may be updated when a task specifically requires documentation or source-material cleanup.

Canonical app-ready content belongs under:

```text
content/
```

Once `content/` exists, it is the canonical structured source for future app/database consumption.

## Project Strategy

The content pipeline is:

```text
existing curriculum notes and planning materials
        ↓
structured weekly content files under content/
        ↓
schema and reference validation
        ↓
human review
        ↓
asset generation planning
        ↓
future database/content-pack build
        ↓
future app integration
```

SQLite is expected in a future phase, but it should be generated from the canonical files under `content/`. SQLite should not be the primary authoring format.

## Current Phase

The current phase creates the content-production foundation.

In scope:

- course/module/week manifests
- weekly lesson plans
- weekly activities
- vocabulary files
- teacher notes
- asset manifests
- image prompt planning
- audio prompt planning
- JSON schemas
- validation script
- validation report
- documentation for the content pipeline

Out of scope unless explicitly requested:

- app implementation
- authentication
- accounts
- grading infrastructure
- analytics
- deployment
- production SQLite generation
- image generation
- audio generation
- final UI design

## Expected Repository Structure

Phase 1 should create or maintain this structure:

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

Future phases may add:

```text
schemas/course_content.sql
tools/build_sqlite.py
generated/course_content.sqlite
assets/images/
assets/audio/
```

## Canonical Content Files

Each week should contain these files:

```text
week_manifest.json
lesson_plan.md
activities.json
vocabulary.json
teacher_notes.md
asset_manifest.json
image_prompts.json
audio_prompts.json
```

`image_prompts.json` and `audio_prompts.json` should always exist, even if they contain empty arrays.

## JSON Authoring Rules

Canonical JSON files should follow these rules:

- UTF-8 JSON
- two-space indentation
- `snake_case` field names
- object wrappers, not bare arrays
- internal field names in English
- arrays for repeatable values
- empty arrays for intentionally empty repeatable values
- empty strings only when a required field is not applicable yet
- no `null` unless explicitly allowed by schema
- no comments in JSON

Wrapper examples:

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

## Bilingual Student-Facing Content

Student-facing app content must include both English and Brazilian Portuguese from the beginning.

Internal field names remain English.

Student-facing bilingual content is required for:

- activity titles and summaries shown to students
- student instructions
- success criteria
- sentence frames
- word-bank labels
- step instructions
- completion criteria
- checklist items
- model responses
- feedback prompts
- app-facing labels or prompts inside activity inputs

Teacher notes and internal reviewer fields may remain English-only during this phase.

## ID Conventions

Use stable, sortable IDs.

Examples:

```text
module-01
week-01
m01w01
m01w01-a01
m01w01-v001
m01w01-img-001
m01w01-aud-001
```

Asset target paths should follow the same structure:

```text
assets/images/module-01/week-01/m01w01-img-001.png
assets/audio/module-01/week-01/m01w01-aud-001.mp3
```

## Markdown File Requirements

Weekly `lesson_plan.md` files should use these headings:

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

Weekly `teacher_notes.md` files should use these headings:

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

## Asset Planning

Assets are planned during this phase but not generated unless explicitly requested.

Weekly asset planning uses:

```text
asset_manifest.json
image_prompts.json
audio_prompts.json
```

Image prompts should be task-appropriate. Common preferred styles include:

- digital watercolor for warm ESL textbook-style scenes and visual prompts
- fashion sketch style for garments, silhouettes, design process, and portfolio-oriented visuals

Audio prompts should target OpenAI/ChatGPT voice generation. They should describe desired speaker role, accent or variety, speed, delivery style, and voice direction. Do not design around Amazon Polly. Do not hard-code current voice names as schema requirements.

## Validation

Run validation from the repository root:

```bash
python tools/validate_content.py
```

On Windows, either of these may be appropriate depending on the local Python installation:

```powershell
python tools/validate_content.py
```

```powershell
py tools/validate_content.py
```

The validator should write:

```text
generated/validation_report.md
```

The report is overwritten on each run.

The Phase 1 validator should use only the Python standard library unless the requirements document is explicitly changed.

The validator should check at minimum:

- required files exist
- JSON files parse correctly
- JSON wrapper shapes are correct
- required fields are present
- bilingual student-facing fields are present where required
- Markdown files include required headings
- ID patterns are valid
- controlled values are valid
- activity references resolve
- vocabulary references resolve
- asset references resolve
- image/audio prompt asset IDs exist in `asset_manifest.json`
- estimated minutes are numeric

The schema files under `schemas/` describe the intended complete structure. The Python validator enforces the most important checks without third-party dependencies. Any known gap between schemas and validator enforcement should be documented.

## Phase Plan

### Phase 1 — Content System Foundation

Create:

- directory structure
- schemas
- validation script
- minimal but real course/module/week seed files
- course manifest with designed module/week counts if clearly available from `docs/`
- README
- AGENTS.md
- validation report

Phase 1 Week 1 should be small and structurally complete. It should not be nonsense dummy content, but it should not attempt to become the full Week 1 gold standard yet.

### Phase 2 — Week 1 Gold Standard

Create complete Week 1 files using the agreed curriculum notes and relevant existing course materials.

Week 1 becomes the structural and quality model for later weeks.

### Phase 3 — Weekly Content Production

Generate each remaining week one at a time.

Each week should pass validation before moving on.

### Phase 4 — Asset Generation Planning Review

Review all image and audio prompts.

Generate media assets separately after text content stabilizes.

### Phase 5 — SQLite Builder

Create a database schema and build script that converts validated content files into SQLite.

### Phase 6 — Future App Integration

Use the generated database or content pack in a future app.

## Codex Workflow

Before making content-pipeline changes, Codex should read:

```text
docs/fashion-course-content-requirements.md
AGENTS.md
README.md
```

After each implementation task, Codex should report:

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

If no images or audio are needed, the summary should say that explicitly.

## First Phase 1 Task

After `docs/fashion-course-content-requirements.md`, `README.md`, and `AGENTS.md` are in place, the first implementation task is:

1. Create the `content/` directory structure.
2. Create schemas.
3. Create `tools/validate_content.py`.
4. Create small but real seed content for course, module 1, and week 1.
5. Include bilingual English/Portuguese student-facing fields.
6. Create `generated/validation_report.md` by running validation.
7. Report files changed, validation result, assumptions, and any needed image/audio assets.

Do not build an app, create production SQLite, or generate media in this phase unless explicitly instructed.
