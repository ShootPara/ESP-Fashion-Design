# Validation Report

- Status: **PASS**
- Generated at (UTC): 2026-04-29T21:09:04.813414+00:00

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
- `content/course/modules/module-01/week-07/activities.json`
- `content/course/modules/module-01/week-07/asset_manifest.json`
- `content/course/modules/module-01/week-07/audio_prompts.json`
- `content/course/modules/module-01/week-07/image_prompts.json`
- `content/course/modules/module-01/week-07/lesson_plan.md`
- `content/course/modules/module-01/week-07/teacher_notes.md`
- `content/course/modules/module-01/week-07/vocabulary.json`
- `content/course/modules/module-01/week-07/week_manifest.json`
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
- m01w07-img-001 — A compact opener board with garments and swatches that clearly suggest different materials so students can bridge from visual description to fabric description. — assets/images/module-01/week-07/m01w07-img-001.png
- m01w07-img-002 — One combined board showing common fabric and material examples with visible keys for the main Week 7 materials-matching task. — assets/images/module-01/week-07/m01w07-img-002.png
- m01w07-img-003 — A combined board showing clear keyed examples of fabric texture, surface, weight, movement, and visibility. — assets/images/module-01/week-07/m01w07-img-003.png
- m01w07-img-004 — A reading gallery with three clearly separated swatches for matching short fabric descriptions to image A, image B, and image C. — assets/images/module-01/week-07/m01w07-img-004.png
- m01w07-img-005 — A reusable gallery with four clearly separated fabric swatches for listening, writing, and speaking. — assets/images/module-01/week-07/m01w07-img-005.png
- m01w07-aud-001 — A short Week 7 listening clip describing four fabrics by color, feel, look, weight, and garment use. — assets/audio/module-01/week-07/m01w07-aud-001.mp3

## Validator Scope Notes
- The Phase 1 validator enforces required files, wrapper shapes, required fields, bilingual student-facing fields, ID patterns, controlled values, numeric minute fields, and cross-file references.
- The JSON Schema files document a fuller contract, but this script does not execute full JSON Schema validation because the Phase 1 toolchain is standard-library only.
- The validator checks currently present week folders under `content/`; it does not require future planned weeks listed in manifests to exist yet.

## Suggested Next Actions
- Continue expanding content one week at a time and keep the same validation workflow.
