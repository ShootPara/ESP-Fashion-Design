# Fashion Design English LMS and Course Content

This repository contains the canonical course-content source and implementation documentation for an **English for Special Purposes course focused on fashion design**.

The repository is entering the **`fashion-lms` build phase**. Canonical course content remains under `content/course/`, and the LMS will consume that content through a generated app-content bundle in a later build step.

Module 1 content and media are currently complete and validated. The current repo milestone is documentation alignment and LMS implementation preparation, not app scaffolding in this document pass.

## Source of Truth

Use these documents according to the type of work being done:

```text
docs/fashion-lms-requiremements-for-review-mode.md
docs/fashion-course-content-requirements.md
docs/fashion-activity-design-guidance.md
```

- `docs/fashion-lms-requiremements-for-review-mode.md` is the source of truth for LMS implementation, Cloudflare architecture, D1 usage, review/test mode behavior, admin behavior, and implementation milestones.
- `docs/fashion-course-content-requirements.md` is the source of truth for content-system structure, canonical content format, schemas, validation expectations, and phase boundaries.
- `docs/fashion-activity-design-guidance.md` is the source of truth for activity-level design quality, concrete student interaction, app-readiness, teacher review needs, and revision workflow.

If the current schema prevents the activity guidance from being followed, plan a requirements/schema/validator follow-up before generating more content.

Existing material under `docs/` is living course-planning and reference material. It can guide content decisions and may be updated when a task specifically requires documentation or source-material cleanup.

Canonical app-ready content belongs under:

```text
content/
```

Once `content/` exists, it is the canonical structured source for future app/database consumption.

## Current Workstreams

This repository now has two coordinated workstreams:

- canonical course content authoring under `content/course/`
- LMS implementation planning and build work under the `fashion-lms` requirements

For content-generation work, follow:

```text
docs/fashion-course-content-requirements.md
docs/fashion-activity-design-guidance.md
```

For LMS and app implementation work, read first:

```text
docs/fashion-lms-requiremements-for-review-mode.md
```

The content docs still govern canonical content authoring. The LMS requirements document governs app implementation.

## Project Strategy

The content pipeline is:

```text
existing curriculum notes and planning materials
        ↓
structured weekly content files under content/
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

SQLite is expected in a future phase, but it should be generated from the canonical files under `content/`. SQLite should not be the primary authoring format.

## Current Repo State

The content foundation is already in place, and the repository is now preparing for LMS implementation around that canonical content.

Content-system scope remains in place:

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

LMS planning and documentation scope now also includes:

- Worker architecture decisions
- Cloudflare Access and D1 requirements
- app-content bundle planning
- LMS milestone planning
- implementation-facing documentation alignment

Still out of scope in this documentation-alignment pass unless explicitly requested:

- creating app code or scaffolding
- deployment setup files
- production SQLite generation
- image generation
- audio generation
- final UI design work

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

Schema and validator hardening for newer operational activity metadata is expected as follow-up work. This documentation pass does not change schemas or `tools/validate_content.py`, but new or rewritten activities should still be authored with the documented activity-design standard in mind.

The schema files under `schemas/` describe the intended complete structure. The Python validator enforces the most important checks without third-party dependencies. Any known gap between schemas and validator enforcement should be documented.

## Quality Gates

Validation passing is necessary but not sufficient. The normal weekly workflow is:

1. Read `docs/fashion-course-content-requirements.md`, `docs/fashion-activity-design-guidance.md`, `AGENTS.md`, and `README.md`.
2. Plan the week when the task calls for a planning pass.
3. Create or revise the canonical week files.
4. Run validation.
5. Run a student-render review pass.
6. Apply surgical refinement if needed.
7. Commit only after review and refinement are complete.
8. Handle media generation later in a separate pass.
9. After binaries exist, run a media verification/status-update pass.

For detailed rules about A2 writing limits, app-checked answer data, listening alignment, image-point keys, and speaking constraints, use the two `docs/` policy files plus `AGENTS.md`.

## Week Status

Use only current documented statuses in `module_manifest.json`:

- `planned`: source material exists or the week is expected, but canonical structured content is not yet complete
- `seeded`: canonical structured content exists, has passed student-render review/refinement, and validates

Do not invent additional status values unless the schema, data, documentation, and workflow are updated together.

## Media Workflow

Media is planned in:

- `asset_manifest.json`
- `image_prompts.json`
- `audio_prompts.json`

Generated binaries are handled later in a separate pass. After binaries are pushed, verify the target files exist, update prompt and asset statuses, rerun validation, and confirm the week no longer appears under missing assets in `generated/validation_report.md`.

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

Use the generated content and later build artifacts in the `fashion-lms` implementation governed by `docs/fashion-lms-requiremements-for-review-mode.md`.

## Codex Workflow

Before making content-pipeline changes, Codex should read:

```text
docs/fashion-course-content-requirements.md
docs/fashion-activity-design-guidance.md
AGENTS.md
README.md
```

For activity creation or revision work, both documentation files are required pre-reading, not optional reference material.

Before making LMS or app-implementation changes, Codex should read:

```text
docs/fashion-lms-requiremements-for-review-mode.md
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

Do not build app scaffolding during a content-only task unless explicitly instructed. For LMS implementation work, follow `docs/fashion-lms-requiremements-for-review-mode.md`.

## LMS Milestone 1 Setup

Milestone 1 adds the first `fashion-lms` Worker-centered app shell:

```text
package.json
wrangler.jsonc
src/
  api/
  auth/
  content/
  db/
  ui/
public/
  app-content/
migrations/
tools/build-app-content.mjs
```

This implementation keeps canonical course content under:

```text
content/course/
```

and generates app-consumable bundle files under:

```text
public/app-content/
```

The generated bundle is a build artifact derived from canonical content. Do not hand-edit files under `public/app-content/`.

## LMS Install and Local Dev

Install dependencies from the repository root:

```powershell
npm install
```

Create a local `.dev.vars` file based on `.dev.vars.example` and set:

```text
SUPERUSER_EMAILS=unopenedparachute@gmail.com,brianreambrazil@gmail.com
DEV_AUTH_EMAIL=unopenedparachute@gmail.com
DEV_AUTH_NAME=Unopened Parachute
```

The local dev identity override exists only for local development. Production must rely on Cloudflare Access-provided identity data.

`.dev.vars` is local-only, must never be committed, and must never be deployed as a production secret source.

## LMS Build and Migrations

Generate app content:

```powershell
npm run build:content
```

Apply local D1 migrations:

```powershell
npx wrangler d1 migrations apply fashion_lms_db --local
```

Typecheck and build:

```powershell
npm run typecheck
npm run build
```

Start local development:

```powershell
npm run dev
```

The npm scripts for `dev`, `build`, and `deploy` run `build:content` first so the generated app bundle stays in sync with `content/course/`.

## LMS Production Deployment Runbook

Use this runbook during the real production deployment pass for:

```text
fashion-lms
fashion.slopcopy.com
fashion_lms_db
DB
```

### Production Preconditions

- Do not put secrets in git.
- Do not commit `.dev.vars`.
- Do not use `DEV_AUTH_EMAIL` or `DEV_AUTH_NAME` in production.
- Keep canonical course content under `content/course/` unchanged during deployment prep unless a separate content task explicitly requires changes.
- The whole hostname should be gated by Cloudflare Access with Google before production use.

### 1. Create the Remote D1 Database

Run:

```powershell
npx wrangler d1 create fashion_lms_db
```

Cloudflare will return the real `database_id` UUID for `fashion_lms_db`.

### 2. Confirm the Real `database_id`

Open:

```text
wrangler.jsonc
```

The current production-target block should look like:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "fashion_lms_db",
    "database_id": "831f1465-041d-434c-946d-d1c616ab2747"
  }
]
```

If the remote D1 database is ever recreated, replace the `database_id` value with the new UUID returned by the `wrangler d1 create` command.

### 3. Local Verification Before Deployment

Run from the repository root:

```powershell
npm run build:content
npm run db:migrate:local
npm run typecheck
npm run build
```

Also verify that no `.dev.vars` file exists anywhere inside:

```text
dist/
```

The Vite build configuration strips generated `.dev.vars` artifacts from build output. Treat any `.dev.vars` file found in `dist/` as a deployment blocker.

### 4. Set the Production Superuser Secret

Set `SUPERUSER_EMAILS` in Cloudflare for the Worker:

```powershell
'unopenedparachute@gmail.com,brianreambrazil@gmail.com' | npx wrangler secret put SUPERUSER_EMAILS
```

This value is the root authority for superuser access.

### 5. Apply Remote D1 Migrations

Run:

```powershell
npm run db:migrate:remote
```

This applies the repo `migrations/` files to the remote `fashion_lms_db` database.

### 6. Deploy the Worker

Run:

```powershell
npm run deploy
```

The deploy script runs the content build and app build before `wrangler deploy`.

### 7. Post-Deploy Smoke Tests

Check these URLs after deploy:

- `https://fashion.slopcopy.com/`
- `https://fashion.slopcopy.com/api/health`
- `https://fashion.slopcopy.com/api/me`
- `https://fashion.slopcopy.com/admin`
- `https://fashion.slopcopy.com/module/module-01`
- `https://fashion.slopcopy.com/module/module-01/week/m01w01`
- `https://fashion.slopcopy.com/module/module-01/week/m01w01/activity/m01w01-a01`
- `https://fashion.slopcopy.com/api/modules/module-01`

Expected outcomes:

- Cloudflare Access prompts for Google login when needed.
- `/api/health` returns `{ "ok": true }`.
- `/api/me` returns the authenticated user and correct superuser/admin state.
- Module 1 routes render successfully.
- `/admin` is available to the configured superusers.

### 8. Rollback and Recovery Notes

Useful Worker rollback commands:

```powershell
npx wrangler deployments list
npx wrangler rollback
```

Useful D1 recovery/export commands:

```powershell
npx wrangler d1 export fashion_lms_db --remote
npx wrangler d1 time-travel info fashion_lms_db
```

Important recovery notes:

- Rolling back the Worker does not automatically roll back D1 schema or data.
- If Cloudflare Access policy is misconfigured, fix the Access application in the Cloudflare dashboard.
- If `SUPERUSER_EMAILS` is wrong, update the secret and redeploy.

## LMS Milestone 1 Routes

Milestone 1 includes:

- `GET /api/me`
- `GET /`
- `GET /module/:moduleId`
- `GET /module/:moduleId/week/:weekId`
- `GET /module/:moduleId/week/:weekId/activity/:activityId`
- `GET /admin`

The `/admin` route is gated to superusers only.

## LMS Manual Cloudflare Setup Still Required

Milestone 1 code does not fully configure Cloudflare resources by itself. Manual setup still required:

- create the remote D1 database `fashion_lms_db`
- confirm the configured `database_id` in `wrangler.jsonc` matches the real remote D1 UUID
- configure the custom domain `fashion.slopcopy.com`
- configure Cloudflare Access for the whole hostname with Google as the identity provider
- set production environment variables, including `SUPERUSER_EMAILS`

Deployment-prep repo alignment already in place:

- `workers_dev` is disabled in `wrangler.jsonc`
- the repo now points at the configured remote D1 UUID for `fashion_lms_db`
- `.dev.vars` remains local-only and must not be committed or deployed

For LMS architecture and behavior requirements, keep using:

```text
docs/fashion-lms-requiremements-for-review-mode.md
```
