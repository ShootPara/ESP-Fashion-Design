# Validation Report

- Status: **PASS**
- Generated at (UTC): 2026-04-27T17:00:28.631022+00:00

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
- m01w02-img-001 — A clear adult-oriented Fashion Design studio scene with a table, sketchbook, ruler, measuring tape, fabric, pins, thread, pattern paper, and a visible sewing machine nearby. — assets/images/module-01/week-02/m01w02-img-001.png
- m01w02-img-002 — A simple educational board showing scissors, ruler, measuring tape, pencil, and eraser as separate labeled visual units without text embedded in the image. — assets/images/module-01/week-02/m01w02-img-002.png
- m01w02-img-003 — A clean vocabulary board showing needle, thread, pins, and a sewing machine as distinct visual targets. — assets/images/module-01/week-02/m01w02-img-003.png
- m01w02-img-004 — A visual board showing mannequin, sketchbook, pattern paper, and fabric swatch in a clean educational arrangement. — assets/images/module-01/week-02/m01w02-img-004.png
- m01w02-img-007 — A simple flashcard-style set of the most important Week 2 tools for live naming and speaking support. — assets/images/module-01/week-02/m01w02-img-007.png
- m01w02-aud-001 — A short teacher-style studio instruction recording about taking tools, placing fabric, drawing a line, measuring, folding, pinning, and checking work. — assets/audio/module-01/week-02/m01w02-aud-001.mp3

## Validator Scope Notes
- The Phase 1 validator enforces required files, wrapper shapes, required fields, bilingual student-facing fields, ID patterns, controlled values, numeric minute fields, and cross-file references.
- The JSON Schema files document a fuller contract, but this script does not execute full JSON Schema validation because the Phase 1 toolchain is standard-library only.
- The validator checks currently present week folders under `content/`; it does not require future planned weeks listed in manifests to exist yet.

## Suggested Next Actions
- Continue expanding content one week at a time and keep the same validation workflow.
