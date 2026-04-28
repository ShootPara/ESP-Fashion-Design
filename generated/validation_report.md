# Validation Report

- Status: **PASS**
- Generated at (UTC): 2026-04-28T22:08:18.176305+00:00

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
- m01w05-img-001 — A simple fashion figure or croquis wearing one clear garment, designed for quick review of garment language and preview of pose and view language. — assets/images/module-01/week-05/m01w05-img-001.png
- m01w05-img-002 — A neutral front-view fashion figure diagram with clear body-reference points for head, neck, shoulder, arm, elbow, hand, waist, hip, leg, knee, and foot. — assets/images/module-01/week-05/m01w05-img-002.png
- m01w05-img-003 — A concept board showing a fashion figure, a croquis or sketch, and clear examples of outline, silhouette, front view, side view, and pose differences. — assets/images/module-01/week-05/m01w05-img-003.png
- m01w05-img-004 — One front-view fashion figure with explicit visible point keys A-H for body-reference labeling. — assets/images/module-01/week-05/m01w05-img-004.png
- m01w05-img-005 — A reusable gallery with four clearly separated fashion figures for listening, reading, writing, and speaking. — assets/images/module-01/week-05/m01w05-img-005.png
- m01w05-aud-001 — A short Week 5 listening clip describing four fashion figures by pose, view, garment, and one visible detail. — assets/audio/module-01/week-05/m01w05-aud-001.mp3

## Validator Scope Notes
- The Phase 1 validator enforces required files, wrapper shapes, required fields, bilingual student-facing fields, ID patterns, controlled values, numeric minute fields, and cross-file references.
- The JSON Schema files document a fuller contract, but this script does not execute full JSON Schema validation because the Phase 1 toolchain is standard-library only.
- The validator checks currently present week folders under `content/`; it does not require future planned weeks listed in manifests to exist yet.

## Suggested Next Actions
- Continue expanding content one week at a time and keep the same validation workflow.
