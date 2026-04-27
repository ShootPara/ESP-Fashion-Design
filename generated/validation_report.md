# Validation Report

- Status: **PASS**
- Generated at (UTC): 2026-04-27T21:53:56.961001+00:00

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
- m01w04-img-001 — An overview board with several adult-oriented garments from Week 3 categories, each showing clear visible details such as buttons, pockets, collars, sleeves, waistbands, or zippers for quick review and detail noticing. — assets/images/module-01/week-04/m01w04-img-001.png
- m01w04-img-002 — A close-up educational vocabulary board showing collar, neckline, sleeve, cuff, shoulder, pocket, and button as separate detail visuals. — assets/images/module-01/week-04/m01w04-img-002.png
- m01w04-img-003 — A close-up educational vocabulary board showing zipper, waistband, hem, seam, pleat, dart, and lining as separate detail visuals. — assets/images/module-01/week-04/m01w04-img-003.png
- m01w04-img-004 — One clear shirt or jacket image with visible point markers for collar, sleeve, buttons, pocket, zipper, hem, front, and seam. — assets/images/module-01/week-04/m01w04-img-004.png
- m01w04-img-005 — A reusable card or gallery set showing four garments with clearly visible details: a white shirt with buttons, a black jacket with zipper and pockets, a blue skirt with waistband and pleats, and a red dress with neckline and back zipper. — assets/images/module-01/week-04/m01w04-img-005.png
- m01w04-aud-001 — A short teacher-style audio clip with four garment descriptions that exactly match the Week 4 listening answer key. — assets/audio/module-01/week-04/m01w04-aud-001.mp3

## Validator Scope Notes
- The Phase 1 validator enforces required files, wrapper shapes, required fields, bilingual student-facing fields, ID patterns, controlled values, numeric minute fields, and cross-file references.
- The JSON Schema files document a fuller contract, but this script does not execute full JSON Schema validation because the Phase 1 toolchain is standard-library only.
- The validator checks currently present week folders under `content/`; it does not require future planned weeks listed in manifests to exist yet.

## Suggested Next Actions
- Continue expanding content one week at a time and keep the same validation workflow.
