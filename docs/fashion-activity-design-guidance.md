# Activity Design Guidance for Fashion Design English

## 1. Purpose

This document defines how course activities should be designed for the Fashion Design English content project.

The main requirements document defines the overall content-production system. This document focuses specifically on activity design: what students do, how activities should work in a future app, what teachers need in order to mark work, and how feedback and correction should be supported.

Use this document as the source of truth for activity-level design decisions.

The current project is still content generation. This document does not ask Codex to build the app. It tells Codex how to write app-ready activity content so the future app can support the intended workflow without major redesign.

Conflict-resolution rule:

- `docs/fashion-course-content-requirements.md` controls file structure, canonical content format, schema and validator expectations, and phase boundaries.
- `docs/fashion-activity-design-guidance.md` controls activity-design quality, student interaction, app-readiness, teacher review needs, and revision workflow.
- If the current schema prevents this guidance from being followed, update the requirements, schema, and validator in a planned follow-up before generating more content.

## 2. Core Activity Design Principle

Every activity must be designed from the student interaction outward.

Before writing an activity, Codex should answer:

```text
What does the student do on the screen?
What does the student tap, drag, choose, type, read, listen to, or say?
What output is saved?
Who checks it: the app, the teacher, the student, or no one?
If the teacher checks it, what exactly does the teacher need to see?
If the teacher gives feedback, what does the student revise?
```

An activity is not complete if it only describes the learning goal. It must describe the student action and the expected platform behavior.

## 3. Future Use Context

The future course experience is expected to include:

- A student-facing app or app-like interface.
- A teacher-facing marking/review interface.
- Bilingual student-facing instructions with a language toggle.
- Structured activities students complete independently or semi-independently.
- Teacher-reviewed written work.
- Teacher-supported speaking practice.
- Feedback and correction cycles for free-form writing.
- Media-supported listening, reading, vocabulary, and visual-description tasks.

Speaking practice is with the teacher. Do not design recorded-audio submissions unless explicitly requested later.

Listening activities may use generated audio assets, but speaking activities should be teacher-led, teacher-observed, or teacher-supported rather than submitted as recordings.

## 4. Activity Design Standard

Each activity should be designed as one or more familiar task screens.

Preferred student actions:

- Choose one answer.
- Choose multiple answers.
- Match image to word.
- Match English to Portuguese support.
- Drag or tap to match.
- Listen and choose.
- Read and choose.
- Fill one blank.
- Complete a sentence frame.
- Order words into a sentence.
- Label an image.
- Type a short answer.
- Write a short controlled text.
- Correct one sentence.
- Save a revision.
- Practice saying a short scripted response with the teacher.

Avoid broad tasks such as:

- Reflect on your goals.
- Discuss your opinion.
- Write about your interests.
- Analyze the design.
- Describe the image.

Those can be valid learning goals, but they must be converted into concrete app actions.

For example:

```text
Bad:
Reflect on your fashion goals.

Better:
Choose one fashion area. Choose one English goal. Complete one sentence: I want English for ___.
```

```text
Bad:
Describe the garment.

Better:
Choose the garment type. Choose two adjectives. Complete: This garment is ___ and ___.
```

## 5. A2-First Design Rule

The course may serve mixed A2-B2 learners, but early activities and first encounters with new task types should be designed for A2 access.

For A2 learners:

- Start with recognition before production.
- Use images and word banks.
- Use sentence frames.
- Use short instructions.
- Use one task per screen when possible.
- Keep open writing short and scaffolded.
- Make the expected answer length explicit.
- Do not require abstract reflection as the main task.
- Do not require long free writing unless it is built from smaller steps.

For early Module 1 teacher-reviewed writing, do not use paragraph-length word counts as the base requirement. Do not set base requirements such as `50-80 words`, `60-90 words`, or `70-100 words` unless a later module or level explicitly justifies that shift.

Prefer:

- sentence frames
- structured text fields
- 4 to 6 required lines
- 1 optional challenge sentence only
- teacher checklist
- feedback prompts
- revision support where meaningful

A2 students can complete meaningful professional tasks when the task is scaffolded.

A2-appropriate outputs include:

- One selected option.
- One matched pair set.
- One missing word.
- One corrected sentence.
- Two to four sentence-frame completions.
- A short controlled profile built from sentence frames.
- A short teacher-supported oral introduction.

Outputs that are usually too demanding without support:

- Open paragraphs from scratch.
- Long personal reflections.
- Unguided design critiques.
- Broad opinion responses.
- Complex compare/contrast writing.
- Free speaking without sentence frames.

## 6. Mobile-First Activity Structure

Activities should be written so they can be rendered on a phone screen.

A good mobile activity has:

- A short title.
- One clear instruction.
- One primary action.
- Visible support when needed.
- A clear submit/check/save action.
- Short feedback.

If an activity has multiple parts, split them into clear screens or steps:

```text
Screen 1: Read the profile.
Screen 2: Choose the main idea.
Screen 3: Choose two details.
Screen 4: Save your answer.
```

Avoid placing too much text on one screen.

For student-facing activity writing, prefer:

```text
Choose one.
Match the words.
Listen and choose.
Complete the sentence.
Correct the sentence.
Save your answer.
```

Avoid:

```text
Students will demonstrate comprehension by reflecting on their personal learning goals and connecting the weekly rhythm to future professional communication outcomes.
```

That kind of language belongs in teacher notes or internal summaries, not student-facing task instructions.

## 7. Language Toggle Rule

The content files contain English and Portuguese student-facing fields. The future app should normally show one interface language at a time.

The student should not see all bilingual metadata side by side unless a specific activity intentionally uses bilingual comparison.

Recommended rendering approach:

- Interface language: Portuguese by default for support.
- Target language: English where the student is learning, choosing, completing, or producing English.
- Portuguese support: definitions, explanations, instructions, and optional hints.

For example, the app may show Portuguese instructions and English sentence frames:

```text
Complete uma frase em inglês.

I am interested in ____.
```

## 8. Activity Categories by Marking Need

Each activity should clearly fit one marking category.

### 8.1 Auto-Checkable Activities

These have objective answers.

Examples:

- Multiple choice.
- True/false.
- Matching.
- Fill one word from a word bank.
- Word ordering with one correct sequence.
- Image label matching.

These activities should include enough answer-key data for future auto-checking, when possible.

Content should provide:

- `response_type`
- options
- correct answer or answer key
- feedback text where useful
- whether the item is retryable

Even if a teacher later reviews results, the content should make the correct answer clear.

### 8.2 Teacher-Reviewed Written Activities

These produce free-form or semi-free text.

Examples:

- Short profile.
- Design description.
- Portfolio caption.
- Client message.
- Reflection sentence.
- Revised sentence.

These activities must include teacher-marking support.

Content should provide:

- exact expected output length
- required sentence frames or text structure
- target vocabulary
- target grammar
- completion criteria
- simple rubric or checklist
- common errors
- feedback prompts
- revision instructions

A teacher should be able to mark the work without inventing the rubric.

### 8.3 Teacher-Supported Speaking Activities

These are not recorded audio submissions.

Examples:

- Oral self-introduction.
- Pronunciation practice.
- Pair rehearsal.
- Teacher-led critique sentence practice.
- Short presentation rehearsal.

Content should provide:

- speaking frames
- pronunciation targets
- teacher observation checklist
- short expected spoken output
- common pronunciation or grammar issues
- feedback prompts

The future app may support these with a checklist, script, vocabulary card, or teacher notes, but the speaking itself happens with the teacher.

Speaking activities are teacher-observed. Do not design them around audio recording, upload, or automated speech scoring unless a future requirement explicitly changes that rule.

### 8.4 Not-Submitted Practice Activities

Some activities are practice only.

Examples:

- Vocabulary preview.
- Self-check review.
- Listening practice before a submitted item.

These still need clear completion criteria, but they may not require teacher marking.

## 9. Submission Types

Each activity should explicitly describe one of these submission types.

Recommended submission types:

```text
none
selection
matching
fill_blank
short_text
structured_text
corrected_sentence
teacher_observed_speaking
self_check
```

Definitions:

- `none`: no saved student output beyond completion.
- `selection`: saved choice or choices.
- `matching`: saved match set.
- `fill_blank`: saved missing word or phrase.
- `short_text`: one short typed answer.
- `structured_text`: multiple sentence-frame answers combined into a short text.
- `corrected_sentence`: original/corrected sentence pair or selected correction.
- `teacher_observed_speaking`: teacher records completion/feedback, not audio.
- `self_check`: student marks completion or compares with model.

Codex should make the submission type obvious in the activity input, expected output, assessment, and notes for app design.

The operational metadata must match the primary saved or scored output.

Examples:

- If `primary_interaction_type` is `image_match` and `submission_type` is `matching`, the main saved or scored output must be matching.
- If `primary_interaction_type` is `word_bank_fill_blank` and `submission_type` is `fill_blank`, the main saved or scored output must be fill-blank phrase completion.
- If every app-checked item is single-choice, do not label the activity `multiple_choice`.

Portuguese bridge items, category sort items, grammar choices, and follow-up fill-blank items can appear as secondary support inside a larger activity, but they must be described as secondary when the submission type remains `matching` or `fill_blank`.

## 10. Free-Form Writing and Correction Workflow

Free-form writing should be used carefully. It is valuable, but it creates teacher workload and requires feedback infrastructure.

Any activity that asks the student to write original text should support a correction cycle.

Recommended correction cycle:

```text
1. Student submits first answer.
2. Teacher reviews answer.
3. Teacher marks status.
4. Teacher selects or writes feedback.
5. Student sees feedback.
6. Student submits revision.
7. Teacher accepts, requests another revision, or closes the item.
```

The content should support this workflow even if the app does not exist yet.

### 10.1 Teacher Review Statuses

Recommended teacher review statuses:

```text
not_submitted
submitted
reviewed_ok
needs_revision
resubmitted
closed
```

### 10.2 Feedback Types

Teacher feedback should not be a blank comment box only. Content should help the teacher respond consistently.

Recommended feedback types:

```text
praise
grammar_correction
vocabulary_correction
spelling_correction
clarity_correction
task_completion
professional_tone
formatting
next_step
```

For each free-form writing activity, Codex should include likely feedback prompts and common errors.

Example:

```json
"common_errors": [
  "Missing be verb: I interested in sewing.",
  "Using Portuguese word order in an English sentence.",
  "Writing a broad goal without a Fashion Design connection."
]
```

### 10.3 Revision Design

A revision task should be specific. Do not simply say:

```text
Revise your answer.
```

Instead:

```text
Fix one sentence.
Add one missing word.
Choose the corrected version.
Rewrite your profile using the teacher's comment.
```

For A2 learners, prefer one correction target at a time.

## 11. Teacher Marking Requirements

If the teacher has to mark an activity, the activity must tell the teacher exactly what to look for.

Teacher marking data should include:

- submission type
- expected output length
- required elements
- optional challenge elements
- checklist criteria
- common errors
- feedback prompts
- whether revision is required
- whether partial completion is acceptable

A teacher-facing review screen should eventually be able to show:

```text
Student answer
Activity prompt
Expected output
Checklist
Common errors
Feedback shortcuts
Free comment box
Return for revision / Mark complete
```

Therefore the content should not rely on hidden teacher judgment.

## 12. Auto-Check Requirements

For objective items, include an answer key whenever possible.

Auto-checkable activities should include:

- clear options
- correct answer
- acceptable variants where needed
- feedback for wrong answers where useful
- retry policy if pedagogically relevant

Any `checked_by: app` activity must include enough answer data for future app checking:

- visible options
- `correct_answer` or `accepted_answers`
- image keys or point labels where relevant
- clear answer match to the prompt
- no hidden teacher judgment

Example item:

```json
{
  "response_type": "single_choice",
  "label_en": "What does Ana study?",
  "label_pt": "O que Ana estuda?",
  "options_en": ["Fashion Design", "Engineering", "Medicine"],
  "options_pt": ["Design de Moda", "Engenharia", "Medicina"],
  "correct_answer": "Fashion Design"
}
```

For fill-in-the-blank, include accepted answers:

```json
{
  "response_type": "word_bank_fill_blank",
  "sentence_frame_en": "I am interested in ___.",
  "word_bank": ["sketching", "sewing", "fabric"],
  "accepted_answers": ["sketching", "sewing", "fabric"]
}
```

## 13. Interaction Types

Codex should prefer these interaction types when designing activities.

### 13.1 `single_choice`

Use for one correct or one selected option.

Good for:

- Diagnostics.
- Main idea questions.
- Grammar choices.
- Error identification.

### 13.2 `multiple_choice`

Use when more than one answer may be selected.

Keep the number of choices small for A2 learners.

### 13.3 `true_false`

Use for simple reading/listening checks.

Avoid trick statements.

### 13.4 `image_match`

Use when students match images to words or concepts.

Always include asset IDs.

### 13.5 `translation_match`

Use when English target words need Portuguese support.

This should support learning, not replace English output.

### 13.6 `word_bank_fill_blank`

Use for controlled language production.

Good for A2.

### 13.7 `sentence_frame_completion`

Use for short writing with support.

Good for profiles, descriptions, goals, and captions.

### 13.8 `word_ordering`

Use for grammar practice.

Keep sentences short.

### 13.9 `read_and_choose`

Use for reading comprehension.

Questions should focus on main idea, specific detail, and evidence.

### 13.10 `listen_and_choose`

Use for listening comprehension.

Include replay support and transcript-after-attempt guidance.

The audio script must align exactly with every app-checked listening item. Question labels, options, correct answers, expected output, model response, and the `audio_prompts.json` script should all agree.

### 13.11 `short_text`

Use only when a one-sentence answer is expected.

### 13.12 `structured_text`

Use when students build a short text from multiple sentence frames.

### 13.13 `correction_task`

Use for editing and revision.

Show the incorrect sentence, ask the student to identify the issue, then choose or write the corrected version.

### 13.14 `teacher_observed_speaking`

Use for speaking tasks with the teacher.

Do not require audio recording unless a future requirement explicitly adds recorded speaking submissions.

## 14. Activity Output Rules

Every activity must have a specific expected output.

Good expected outputs:

```text
2 selected choices and 1 sentence-frame completion
4 multiple-choice answers
6 image-word matches and 3 fill-in-the-blank answers
4 sentence-frame completions saved as a profile
1 corrected sentence
3 spoken sentences observed by the teacher
```

Weak expected outputs:

```text
Students understand the course.
Students reflect on their goals.
Students discuss fashion interests.
Students practice vocabulary.
```

Those describe learning, not output.

## 15. Writing Activity Rules

Writing activities should be scaffolded by default.

For A2-B1 writing, prefer:

- sentence frames
- mini word banks
- examples
- required elements checklist
- maximum length
- one revision target

A writing activity should define:

```text
Minimum output
Challenge output
Required vocabulary or structures
Teacher marking criteria
Revision behavior
```

Example:

```text
Minimum: 4 simple sentences.
Challenge: Add 1 sentence about your portfolio goal.
Required: name, student identity, interest, English goal.
Teacher checks: all required elements present, sentence frames completed, basic clarity.
Revision: fix one sentence after feedback.
```

## 16. Speaking Activity Rules

Speaking is teacher-supported, not recorded audio submission.

Speaking activities should include:

- a short script or frames
- pronunciation targets
- expected number of sentences
- teacher observation checklist
- optional follow-up question
- support and challenge versions

Example output:

```text
The student says 3-4 short sentences:
My name is ___.
I am a Fashion Design student.
I like ___.
I want English for ___.
```

Teacher marks:

```text
completed / needs support / not completed
```

Teacher feedback may focus on:

- clarity
- pronunciation of target words
- use of sentence frames
- confidence/participation

Do not design the speaking activity around recording, uploading, or automated speech scoring unless explicitly requested later.

## 17. Listening Activity Rules

Listening activities should use audio assets and should remain controlled for A2 learners.

A listening activity should include:

- audio asset ID
- purpose for first listen
- purpose for second listen
- main idea question
- detail questions
- one optional fill-in-the-blank item
- transcript reveal guidance

Recommended flow:

```text
Listen once: choose the main idea.
Listen again: choose two details.
Listen again if needed: complete one missing word.
After you answer: show transcript.
```

Do not ask A2 students for open listening notes as the required output.

For the current phase, keep the transcript or script in `audio_prompts.json`. Do not create a separate transcript asset unless the schema and workflow later change to support one.

## 18. Reading Activity Rules

Reading activities should be short and task-focused.

A reading activity should include:

- short reading text or reference to text
- support image if useful
- main idea question
- detail questions
- evidence question when appropriate

Recommended flow:

```text
Read once: choose the main idea.
Read again: choose details.
Tap the sentence that helped you answer.
```

Do not require written comprehension answers unless the task is specifically a writing task.

For app-checked reading or visual tasks that use image boards, labels, or marked diagrams, use explicit visible keys such as image A/B/C or point A-H. `correct_answer` values must resolve clearly to those keys, and `image_prompts.json` plus `asset_manifest.json` notes should match the same point or key strategy used in `activities.json`.

## 19. Vocabulary Activity Rules

Vocabulary activities should move from recognition to controlled use.

Recommended flow:

```text
Match image to word.
Match English word to Portuguese support.
Complete short phrase using a word bank.
```

Vocabulary activities should include:

- target words
- images when concrete
- Portuguese support
- examples
- short use task

Do not create vocabulary lists without a student action.

## 20. Design and Visual-Literacy Activity Rules

Fashion Design English requires visual literacy, but visual analysis must be scaffolded.

For early learners, use:

- choose the garment type
- choose colors
- choose material words
- choose silhouette words
- complete one description frame

Example:

```text
Choose two words: loose / fitted / long / short.
Complete: The garment is ___ and ___.
```

For higher levels, later weeks may include:

- compare two designs
- explain a design choice
- critique a garment
- write a portfolio caption

But these should still be scaffolded by level.

## 21. Feedback System Implications

The content should make future feedback-system design possible.

For teacher-reviewed items, include enough information to support:

- teacher checklist marking
- quick feedback buttons
- free comment box
- returned-for-revision status
- student revision submission
- final accepted/closed status

A future feedback object might need:

```json
{
  "submission_id": "",
  "activity_id": "",
  "student_id": "",
  "submission_text": "",
  "teacher_status": "needs_revision",
  "feedback_tags": ["grammar_correction", "task_completion"],
  "teacher_comment": "Add the missing verb: I am interested in sewing.",
  "revision_prompt_en": "Fix one sentence and submit again.",
  "revision_prompt_pt": "Corrija uma frase e envie novamente.",
  "revision_text": "",
  "closed_at": ""
}
```

Codex is not building this object now, but activity content should provide the pieces needed for it.

## 22. Activity Data Recommendations

When the existing schema allows it, Codex should include richer interaction metadata in `input.items`.

Recommended item fields:

```json
{
  "response_type": "single_choice",
  "label_en": "",
  "label_pt": "",
  "options_en": [],
  "options_pt": [],
  "correct_answer": "",
  "accepted_answers": [],
  "asset_id": "",
  "sentence_frame_en": "",
  "sentence_frame_pt": "",
  "word_bank": [],
  "teacher_review_required": false,
  "revision_required": false
}
```

Do not force these fields if the schema rejects them. If the current schema is too narrow, report the limitation and propose a schema update separately.

For all new or rewritten activities going forward, the activity should also carry top-level operational metadata when the requirements and schema allow it:

- `primary_interaction_type`
- `submission_type`
- `checked_by`
- `teacher_review_required`
- `revision_supported`

## 23. App Design Notes Requirement

Each activity must include concrete `notes_for_app_design`.

Bad:

```text
This can be used in an app.
```

Better:

```text
Render as two single-choice chip groups and one short sentence-frame text field. Save the selected interest, selected English goal, and one completed English sentence. No teacher marking required unless the teacher wants to review onboarding responses.
```

Better:

```text
Render as audio player, three multiple-choice questions, and one word-bank fill-blank item. Allow replay. Reveal transcript only after first attempt. Auto-check selected answers.
```

Better:

```text
Render as a teacher-reviewed structured writing submission. Student completes four sentence frames. Teacher sees required-elements checklist, common errors, quick feedback tags, and return-for-revision button.
```

## 24. Teacher Workload Rule

Do not create unnecessary teacher-marked free-form work.

Teacher-marked activities should be meaningful and limited.

A typical week should include:

- several auto-checkable or self-checkable practice activities
- one meaningful teacher-reviewed writing output
- one teacher-supported speaking output
- optional micro-revision task

Avoid making every activity a teacher-marked writing task.

The teacher should not have to mark long, vague, or low-value responses.

## 25. Weekly Balance Guideline

A good app-ready week should usually include:

```text
1 onboarding/warmup or review activity
1 reading or visual input activity
1 listening activity when audio is useful
1 vocabulary or language-form activity
1 controlled production activity
1 correction/revision activity
1 teacher-supported speaking or applied communication activity
```

This is a guideline, not a rigid rule.

Each activity should have a clear purpose and a clear platform interaction.

## 26. Activity Review Checklist for Codex

Before reporting a week complete, Codex should check every activity:

```text
Can the student understand exactly what to do?
Is the action familiar from mobile learning apps?
Is the output specific and saved or checked?
Is the output realistic for the CEFR access level?
Is the task scaffolded before production?
Is teacher review required only when it adds value?
If teacher review is required, is the marking guidance clear?
If revision is expected, is the revision task specific?
Are media assets referenced correctly?
Are bilingual fields complete?
Are app design notes concrete?
```

If the answer to any of these is no, the activity needs revision.

Validation passing is necessary but not sufficient. Before a week becomes model-ready or commit-ready, a student-render review should also confirm:

- what the student sees first
- what the student taps, chooses, matches, types, listens to, reads, or says
- exact expected output
- checker path: app, teacher, student, or not submitted
- A2 suitability
- metadata/content alignment
- media use
- `notes_for_app_design` clarity

## 27. Red Flags

Codex should stop and revise if an activity contains:

- vague output such as “student reflects” without a concrete response
- broad open writing for A2 learners
- paragraph-length base writing requirements in early Module 1 weeks
- no clear submission type
- teacher-reviewed work with no marking checklist
- free text with no revision path
- speaking activity that assumes recorded audio
- student-facing instructions that sound like teacher notes
- too many tasks in one screen
- no answer key for objective items
- app-checked questions without explicit options or answers
- image-label tasks without explicit point keys
- metadata or output mismatch between interaction type, submission type, expected output, and actual item structure
- audio-answer mismatch between the listening script and app-checked items
- media references that do not resolve
- app design notes that do not name the interaction type
- vague `notes_for_app_design` that do not explain the actual future interaction

## 28. Execution Summary Additions

When Codex creates or rewrites activities, its execution summary should include:

```text
For each activity:
- activity ID
- title
- primary interaction type
- submission type
- who checks it: app / teacher / student / not submitted
- expected student output
- teacher review required: yes/no
- revision supported: yes/no
- media used
```

This summary is required because validation passing does not prove that the activity is pedagogically or operationally usable.

## 29. Suggested Repository Location

Save this document as:

```text
docs/fashion-activity-design-guidance.md
```

AGENTS.md and README.md should instruct Codex to read this document before creating or revising weekly activities.

The main requirements document remains the overall source of truth for the content system. This document is the activity-design source of truth.

