# Validation Report

- Status: **PASS**
- Generated at (UTC): 2026-04-29T18:46:10.167805+00:00

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
- `content/course/modules/module-01/week-06/activities.json`
- `content/course/modules/module-01/week-06/asset_manifest.json`
- `content/course/modules/module-01/week-06/audio_prompts.json`
- `content/course/modules/module-01/week-06/image_prompts.json`
- `content/course/modules/module-01/week-06/lesson_plan.md`
- `content/course/modules/module-01/week-06/teacher_notes.md`
- `content/course/modules/module-01/week-06/vocabulary.json`
- `content/course/modules/module-01/week-06/week_manifest.json`
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
- m01w06-img-001 — A compact opener board with 3 to 4 clearly different fashion looks that make color, silhouette, and first visual impression easy to notice. — assets/images/module-01/week-06/m01w06-img-001.png
- m01w06-img-002 — One combined board showing basic color swatches and keyed palette examples for warm, cool, neutral, bright, soft, and monochrome. — assets/images/module-01/week-06/m01w06-img-002.png
- m01w06-img-003 — A combined board showing clear keyed examples of line direction, line shape, and garment silhouette comparisons. — assets/images/module-01/week-06/m01w06-img-003.png
- m01w06-img-004 — A reading gallery with three clearly separated looks for matching short visual descriptions to image A, image B, and image C. — assets/images/module-01/week-06/m01w06-img-004.png
- m01w06-img-005 — A reusable gallery with four clearly separated fashion looks for listening, writing, and speaking. — assets/images/module-01/week-06/m01w06-img-005.png
- m01w06-aud-001 — A short Week 6 listening clip describing four looks by palette, color, silhouette, line, and overall impression. — assets/audio/module-01/week-06/m01w06-aud-001.mp3

## Validator Scope Notes
- The Phase 1 validator enforces required files, wrapper shapes, required fields, bilingual student-facing fields, ID patterns, controlled values, numeric minute fields, and cross-file references.
- The JSON Schema files document a fuller contract, but this script does not execute full JSON Schema validation because the Phase 1 toolchain is standard-library only.
- The validator checks currently present week folders under `content/`; it does not require future planned weeks listed in manifests to exist yet.

## Suggested Next Actions
- Continue expanding content one week at a time and keep the same validation workflow.
