# Validation Report

- Status: **PASS**
- Generated at (UTC): 2026-04-27T20:10:08.325418+00:00

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
- m01w03-img-001 — A clear adult-oriented garment overview board showing several common Week 3 garments for fast recognition, including a dress, jeans, hoodie, jacket, blouse, and blazer. — assets/images/module-01/week-03/m01w03-img-001.png
- m01w03-img-002 — A vocabulary board showing T-shirt, shirt, blouse, sweater, hoodie, and cardigan as separate adult-oriented garment visuals. — assets/images/module-01/week-03/m01w03-img-002.png
- m01w03-img-003 — A vocabulary board showing skirt, pants, shorts, jeans, dress, and jumpsuit as clear separate visuals. — assets/images/module-01/week-03/m01w03-img-003.png
- m01w03-img-004 — A vocabulary board showing jacket, coat, blazer, and one simple complete outfit or look as separate fashion-study visuals. — assets/images/module-01/week-03/m01w03-img-004.png
- m01w03-img-005 — One reading-support image board showing three clearly different garments that match the Week 3 short reading texts, such as a white shirt, blue dress, and black jeans. — assets/images/module-01/week-03/m01w03-img-005.png
- m01w03-img-006 — A reusable set of garment image cards or gallery visuals showing jacket, skirt, shorts, blouse, dress, jeans, and coat for listening, writing support, and live speaking. — assets/images/module-01/week-03/m01w03-img-006.png
- m01w03-aud-001 — A short teacher-style listening clip describing common garments, their category, and one or two features for beginner learners. — assets/audio/module-01/week-03/m01w03-aud-001.mp3

## Validator Scope Notes
- The Phase 1 validator enforces required files, wrapper shapes, required fields, bilingual student-facing fields, ID patterns, controlled values, numeric minute fields, and cross-file references.
- The JSON Schema files document a fuller contract, but this script does not execute full JSON Schema validation because the Phase 1 toolchain is standard-library only.
- The validator checks currently present week folders under `content/`; it does not require future planned weeks listed in manifests to exist yet.

## Suggested Next Actions
- Continue expanding content one week at a time and keep the same validation workflow.
