# Validation Report

- Status: **PASS**
- Generated at (UTC): 2026-04-28T22:58:54.193202+00:00

## Files Checked
- `AGENTS.md`
- `README.md`
- `content/course/course_manifest.json`
- `content/course/modules/module-01/module_manifest.json`
- `content/course/modules/module-01/week-01/activities.json`
- `content/course/modules/module-01/week-01/asset_manifest.json`
- `content/course/modules/module-01/week-01/audio_prompts.json`
- `content/course/modules/module-01/week-01/image_prompts.json`
- `content/course/modules/module-01/week-01/lesson_plan.md`
- `content/course/modules/module-01/week-01/teacher_notes.md`
- `content/course/modules/module-01/week-01/vocabulary.json`
- `content/course/modules/module-01/week-01/week_manifest.json`
- `content/course/modules/module-01/week-02/activities.json`
- `content/course/modules/module-01/week-02/asset_manifest.json`
- `content/course/modules/module-01/week-02/audio_prompts.json`
- `content/course/modules/module-01/week-02/image_prompts.json`
- `content/course/modules/module-01/week-02/lesson_plan.md`
- `content/course/modules/module-01/week-02/teacher_notes.md`
- `content/course/modules/module-01/week-02/vocabulary.json`
- `content/course/modules/module-01/week-02/week_manifest.json`
- `content/course/modules/module-01/week-03/activities.json`
- `content/course/modules/module-01/week-03/asset_manifest.json`
- `content/course/modules/module-01/week-03/audio_prompts.json`
- `content/course/modules/module-01/week-03/image_prompts.json`
- `content/course/modules/module-01/week-03/lesson_plan.md`
- `content/course/modules/module-01/week-03/teacher_notes.md`
- `content/course/modules/module-01/week-03/vocabulary.json`
- `content/course/modules/module-01/week-03/week_manifest.json`
- `content/course/modules/module-01/week-04/activities.json`
- `content/course/modules/module-01/week-04/asset_manifest.json`
- `content/course/modules/module-01/week-04/audio_prompts.json`
- `content/course/modules/module-01/week-04/image_prompts.json`
- `content/course/modules/module-01/week-04/lesson_plan.md`
- `content/course/modules/module-01/week-04/teacher_notes.md`
- `content/course/modules/module-01/week-04/vocabulary.json`
- `content/course/modules/module-01/week-04/week_manifest.json`
- `content/course/modules/module-01/week-05/activities.json`
- `content/course/modules/module-01/week-05/asset_manifest.json`
- `content/course/modules/module-01/week-05/audio_prompts.json`
- `content/course/modules/module-01/week-05/image_prompts.json`
- `content/course/modules/module-01/week-05/lesson_plan.md`
- `content/course/modules/module-01/week-05/teacher_notes.md`
- `content/course/modules/module-01/week-05/vocabulary.json`
- `content/course/modules/module-01/week-05/week_manifest.json`
- `docs/fashion-course-content-requirements.md`
- `schemas/activities.schema.json`
- `schemas/asset_manifest.schema.json`
- `schemas/audio_prompts.schema.json`
- `schemas/course_manifest.schema.json`
- `schemas/image_prompts.schema.json`
- `schemas/module_manifest.schema.json`
- `schemas/vocabulary.schema.json`
- `schemas/week_manifest.schema.json`
- `tools/validate_content.py`

## Errors
- None.

## Warnings
- None.

## Missing Assets
- None.

## Validator Scope Notes
- The Phase 1 validator enforces required files, wrapper shapes, required fields, bilingual student-facing fields, ID patterns, controlled values, numeric minute fields, and cross-file references.
- The JSON Schema files document a fuller contract, but this script does not execute full JSON Schema validation because the Phase 1 toolchain is standard-library only.
- The validator checks currently present week folders under `content/`; it does not require future planned weeks listed in manifests to exist yet.

## Suggested Next Actions
- Continue expanding content one week at a time and keep the same validation workflow.
