# Fashion Design English LMS — Module Review/Test Mode Requirements

## 1. Purpose

This document defines the first requirements draft for the Fashion Design English LMS with built-in review and testing capabilities.

The key design decision is that we will **not** build a separate disposable Module 1 verification app. Instead, the production LMS will include a durable review/test mode that can be used now to verify Module 1 and later to verify Modules 2–8 as they are created.

The immediate implementation goal is to support Module 1 verification while building toward the final app architecture.

## 2. Project Context

Repository:

```text
ShootPara/ESP-Fashion-Design
```

Canonical content source:

```text
content/course/course_manifest.json
content/course/modules/module-01/module_manifest.json
content/course/modules/module-01/week-XX/
assets/images/module-01/week-XX/
assets/audio/module-01/week-XX/
```

Module 1 is currently considered content-complete:

- Weeks 1–14 exist.
- All weeks are seeded.
- Media status is generated.
- Validation passes.
- Missing assets are none.

The LMS should consume the canonical content files rather than requiring a separate rewritten copy of Module 1.

## 3. High-Level Product Shape

The app has three major user experiences:

1. **Student Mode**
   - Normal learner-facing course experience.
   - Shows only modules enabled for the current user.
   - Tracks real progress and submissions when not in test mode.
   - Saves student answers for submitted activities.
   - Checks app-checkable answers and stores simple check results.

2. **Test Mode**
   - A special override mode set per user by a superuser.
   - Lets the user freely access modules, weeks, and activities for review/testing.
   - Allows moving backward and forward freely.
   - Shows answer feedback for app-checkable activities.
   - Does not save normal learner progress statistics or learner submissions.
   - Allows users to submit free-text content testing comments.

3. **Admin Mode**
   - Accessible only to configured superusers.
   - Provides user management.
   - Provides module access management.
   - Provides content testing data review.
   - Provides review/status dashboards and quick flags.

## 4. Authentication and Access Control

### 4.0 Deployment Identity Constants

Initial deployment constants:

```text
App/Worker name: fashion-lms
Hostname: fashion.slopcopy.com
Cloudflare route/custom domain: fashion.slopcopy.com
D1 database name: fashion_lms_db
D1 binding name: DB
Superuser allowlist variable: SUPERUSER_EMAILS
Support email: unopenedparachute@gmail.com
```

The Worker configuration should include the route/custom-domain binding for:

```text
fashion.slopcopy.com
```

### 4.0A Single Worker Project Layout

Decision: use a **single Worker-centered project layout** for the first implementation.

Do not split the first implementation into a separate `apps/web` frontend project plus a separate `worker` backend project.

Recommended repo layout for the LMS implementation:

```text
src/                         Worker backend, API routing, auth helpers, D1 access
src/ui/                      React/Vite/TypeScript app source served by the Worker
public/                      static assets copied into the Worker assets bundle
public/app-content/          generated app-consumable content bundles
migrations/                  D1 migrations
tools/                       content bundle builder and repo utility scripts
wrangler.jsonc               Worker, assets, route/custom-domain, D1 bindings
package.json                 scripts for build, content bundle generation, dev, deploy
```

The exact file names can be refined during implementation, but the architecture should remain one Cloudflare Worker app with one deployment path, one Access gate, one D1 binding, and one custom domain.

### 4.1 Identity Provider

The entire LMS will be gated by **Cloudflare Zero Trust / Cloudflare Access** with Google as the identity provider.

All users authenticate with their Google account before reaching the app. There is no separate in-app Google OAuth flow for the first implementation.

Because the whole hostname is gated by Cloudflare Access, unauthenticated users may see a Cloudflare Access login page before the Worker can render app UI. The Access login experience should be configured, where possible, to make Google login the clear path into the LMS.

### 4.1A Logged-Out / Login Support Experience

Desired logged-out experience:

- show a clear page or Access login experience for `fashion-lms`
- provide a clickable Google login path
- provide a **Problems logging in?** support link

Support link target:

```text
mailto:unopenedparachute@gmail.com?subject=Fashion%20LMS%20login%20problem
```

If Cloudflare Access intercepts unauthenticated requests before the Worker, the custom login/support copy should be handled through Cloudflare Access configuration as much as Cloudflare allows. The Worker should also show the same support link on any access-disabled, identity-error, or post-login problem screen.

Identity problem screens should not expose internal configuration details. They should simply explain that the app could not confirm the user's login and provide the support email link.

### 4.2 User Identity

On login, the app should receive the authenticated user identity from Cloudflare Access-provided identity data.

First-pass implementation decision:

- In production, identity must come only from Cloudflare Access-provided headers or Access token data.
- The app must never trust a client-provided email address, query parameter, local storage value, or request body field as identity.
- For the first pass, the Worker may read Access identity headers when present.
- The auth helper should be structured so Access JWT verification can be added later without rewriting route handlers.
- If Access identity is missing in production, fail closed and show an identity/access problem screen with the support email link.

Local development:

- Local dev may use a clearly named dev identity override such as `DEV_AUTH_EMAIL` and optional `DEV_AUTH_NAME`.
- Dev identity override must be disabled or ignored in production.
- Any dev override should be obvious in code and documentation.

The app must capture at minimum:

- email address
- display name, if available
- first login timestamp
- last login timestamp
- enabled/disabled access state
- test mode state

The user's email address and name should appear in the database and on the admin screen.

### 4.3 Superusers

Cloudflare Access gates entry to the whole LMS. After that, app-level authorization controls privileges.

First-pass role model: **superuser + student only**.

Admin access is limited to explicitly configured superusers. Superusers act as administrators, review managers, and teacher/testing workflow operators for the first implementation.

Initial superusers:

```text
unopenedparachute@gmail.com
brianreambrazil@gmail.com
```

Decision: use both an environment-variable allowlist and D1 role/status data.

The environment-variable allowlist is the hard root authority for superuser access. Initial example:

```text
SUPERUSER_EMAILS=unopenedparachute@gmail.com,brianreambrazil@gmail.com
```

D1 should also store user role/status data for admin display, auditing, and future flexibility. However, the database must not be able to remove or demote a root superuser who is still present in `SUPERUSER_EMAILS`.

Only superusers can access `/admin` and admin APIs.

### 4.4 Normal Users

Normal users can go to the app main page and authenticate with Google through Cloudflare Access.

After Access authentication succeeds, the app should create or update their user record in the database.

Normal users do not automatically receive access to all modules. Module access is controlled in the admin user management area.

### 4.5 Disabled Users

A superuser can disable a user.

Disabled users should not be able to use the course experience, except possibly to see a simple access-disabled message after login.

## 4A. Privacy, Public Exposure, and Communication Boundaries

### 4A.1 No Public-Facing Student Interaction

Students must never interact with the LMS in any public-facing way.

The LMS must not include:

- public student profiles
- public usernames
- public user pages
- student directories visible to other students
- social feeds
- discussion boards
- forums
- group chats
- peer-to-peer direct messages
- student-to-student commenting
- student-to-student file sharing

Student identity information exists for authentication, admin management, teacher workflow, and database records only. It is not a public or social feature.

### 4A.2 Student-to-Teacher Communication Only

The only permitted learner communication path is student-to-teacher communication.

Future messaging or feedback features may support:

- a student sending work or questions to the teacher
- the teacher sending feedback to the student
- the teacher returning work for revision

The app must not introduce student-to-student communication unless a future requirements document explicitly reverses this decision.

### 4A.3 No Chat Moderation Burden

The system should avoid features that create a general chat or community-moderation burden.

Managing student-to-student chats, public comments, or social interaction is out of scope and intentionally excluded.

## 5. User Management Requirements

### 5.1 Admin User List

The admin screen must include a user management area.

The user list should show:

- email
- display name
- first login
- last login
- enabled/disabled state
- test mode state
- module access summary

### 5.2 User Profile / User Detail Screen

A superuser can open a user's profile.

The user profile should allow superusers to:

- enable or disable the user
- turn module access on or off for that user
- place the user in test mode
- remove the user from test mode
- inspect basic user metadata

### 5.3 Module Access Management

For each user, a superuser can turn module access on or off.

At minimum, support:

- Module 1 enabled/disabled
- future Modules 2–8 enabled/disabled when content exists

The system should be designed so adding future modules does not require redesigning user access logic.

### 5.4 Test Mode Override

Each user profile must include a **test mode** switch.

When test mode is enabled for a user:

- test mode overrides all normal module access switches
- the user can access modules for testing/review
- the user can switch modules freely
- the user can move freely between weeks and activities
- normal answer/progress statistics are not kept
- answers can still be checked and shown as correct/incorrect for review purposes
- content testing comments can be submitted

Test mode should be obvious in the student interface so the user knows they are not in a normal tracked learner session.

## 6. Student Mode Requirements

### 6.1 Main Student Page

After login, users land on the main app/student screen.

The main screen should show available modules.

For normal users:

- show only modules enabled for that user
- prevent access to disabled modules
- save activity progress
- save submitted answers where the activity has a saved response
- check app-checkable answers and display correct/incorrect feedback
- store simple app-check results without building full analytics or grading dashboards yet

For test-mode users:

- show only modules present in the generated app-content bundle
- do not show empty placeholder modules merely because they are listed in `course_manifest.json`
- allow switching freely among available generated modules
- allow free navigation across weeks and activities within generated modules
- do not record normal learner progress stats

### 6.2 Module View

A module page should show:

- module title
- module description
- week list
- completion/progress status in normal mode
- review/test indicators in test mode

### 6.3 Week View

A week page should show:

- week title
- summary
- essential question
- activity list
- media availability indicators
- review flags in test mode

### 6.4 Activity View

Each activity should render from canonical activity data.

Supported Module 1 activity interactions include, but are not limited to:

- single choice
- multiple choice where present
- matching
- image matching
- translation matching
- word-bank fill blank
- sentence-frame completion
- correction task
- read and choose
- listen and choose
- structured text
- teacher-observed speaking
- self-check

The app should render enough of each activity to determine whether the content works as a course experience.

In normal student mode, submitted answers should be saved when the activity has a real saved response. App-checkable activities should be checked and should show correct/incorrect feedback. Teacher-reviewed and self-check activities may save the submitted response and status foundation, but full teacher feedback workflow is not required in the first pass.

### 6.5 Language Display

The app should support the bilingual content model.

Preferred initial behavior:

- Portuguese interface/support text available to the learner.
- English target-language content remains visible where it is the learning object.
- A language toggle may be included if practical.

The app should avoid showing raw bilingual metadata side by side unless the activity intentionally uses bilingual comparison.

### 6.6 Media Display

The student/test experience must support:

- image display from `assets/images/...`
- audio playback from `assets/audio/...`
- visible missing-media errors in review/test contexts

Media should load from the same repo-style target paths used by the content manifests.

## 7. Test Mode Requirements

### 7.1 Purpose

Test mode exists to review content, media, activity flow, answer checking, teacher-review metadata, and student-facing rendering without affecting normal student progress data.

Test mode is used for Module 1 verification and future module review.

### 7.2 Navigation

In test mode, users can:

- switch freely among modules present in the generated app-content bundle
- open any available week in those generated modules
- open any activity in those generated modules
- go forward and backward between activities
- restart or retry activities without creating learner stats

Test mode overrides user module-access switches, but it does not override content existence. A module appears in test mode only when the build-generated app-content bundle includes that module.

### 7.3 Answer Checking

In test mode, app-checkable activities should still show answer behavior.

When a tester answers an app-checkable item:

- the app displays whether the answer is correct or incorrect
- the app may show the correct answer after checking
- no normal learner score/stat record is created

### 7.4 Structured Text and Teacher-Reviewed Items

For teacher-reviewed writing or speaking tasks, test mode should show the review scaffolding that would support the teacher workflow.

This includes:

- expected output
- checklist
- common errors
- feedback prompts
- revision support
- teacher observation guidance for speaking

The tester may enter sample text to verify rendering, but this should not become normal learner progress.

### 7.5 Test Mode Banner

The app should display a clear banner when the current user is in test mode.

Example:

```text
TEST MODE — progress and scores are not being saved.
```

## 8. Review Section Requirements

### 8.1 Review Dashboard

The app should include a review section available in test/admin contexts.

The review dashboard should show quick flags such as:

- missing media
- broken asset references
- activities with teacher review required
- activities with revision supported
- speaking activities
- listening activities
- app-checkable activities
- activities with no saved output
- activity metadata/rendering concerns if detectable

Some flags can be generated automatically from content files. Others may be submitted manually as testing comments.

### 8.2 Activity-Level Review Panel

In test mode, each activity should include a review panel or expandable review area.

This panel should show useful reviewer metadata, such as:

- activity ID
- primary interaction type
- submission type
- checked by
- teacher review required
- revision supported
- asset refs
- vocabulary refs
- notes for app design
- expected output

### 8.3 Free-Text Testing Comments

Test-mode users must be able to submit free-text comments with lightweight triage metadata.

Comments should be available from relevant review screens, ideally with context automatically attached.

A comment submission should include:

- date/time submitted
- user email
- user display name, if available
- module ID
- week ID, if available
- activity ID, if available
- current screen/context
- comment text
- category
- severity
- status
- raw contextual data useful for debugging/review

Initial comment categories:

```text
content_issue
media_issue
answer_key_issue
rendering_issue
instruction_confusing
teacher_review_issue
access_or_navigation_issue
other
```

Initial severity values:

```text
low
medium
high
blocker
```

Initial status values:

```text
unread
read
in_progress
completed
```

The comment box remains the primary input. Category and severity may be required select fields with sensible defaults, or optional fields if implementation simplicity requires it.

These comments go into a separate database/table used for content testing data.

## 9. Content Testing Data Admin Requirements

### 9.1 Admin Screen

Admin must include a screen called something like:

```text
Content Testing Data
```

This screen is visible only to superusers.

### 9.2 Comment List

The Content Testing Data screen should show submitted testing comments.

The list should show:

- submitted date/time
- submitter email
- submitter name
- module/week/activity context
- category
- severity
- status
- comment preview

### 9.3 Comment Detail

A superuser can open a submitted testing comment to see:

- full comment text
- all captured context data
- submitter identity
- submission timestamp
- category
- severity
- current status

### 9.4 Comment Status Workflow

A superuser can mark each testing comment as:

- unread
- read
- in progress
- completed

A superuser can also edit category/severity if the tester chose the wrong triage value.

A superuser can also delete a testing comment.

### 9.5 Delete Behavior

Decision: testing comments use **hard delete**.

When a superuser deletes a testing comment, the record is permanently removed from the database.

There is no soft-delete archive for deleted testing comments in the first implementation.

## 10. Data Storage Requirements

### 10.1 Database

Use Cloudflare D1 from the beginning.

D1 is used for:

- authenticated user records
- user access controls
- test mode switches
- minimal normal learner progress/submission foundations
- content testing comments

Course content itself is not imported into D1 for the first implementation. Course content is loaded through the build-generated content bundle.

### 10.1A Database Migrations

Database schema changes should be managed with D1 migrations from the start.

The repo should include a migrations directory, likely:

```text
migrations/
```

Implementation docs should include commands for applying migrations locally and remotely, using the project’s actual D1 database binding and database name once created.

Expected workflow:

```text
wrangler d1 migrations apply <DB_NAME> --local
wrangler d1 migrations apply <DB_NAME> --remote
```

The first implementation should create an initial migration for the baseline tables rather than creating schema manually through ad hoc SQL commands.

Schema changes are acceptable during development, but they must be captured as migrations.

### 10.2 Core Tables — Initial Draft

The database should support at least these data areas:

#### users

Stores authenticated users.

Likely fields:

- id
- email
- display_name
- role
- enabled
- test_mode_enabled
- is_env_superuser_snapshot
- first_login_at
- last_login_at
- created_at
- updated_at

The `role` field supports app display and future flexibility. For the first implementation, supported roles are:

```text
superuser
student
```

The environment allowlist remains the root authority for superuser access. A broader teacher role may be introduced later, but it is intentionally out of scope for the first pass.

#### user_module_access

Stores per-user module access switches.

Likely fields:

- id
- user_id
- module_id
- enabled
- created_at
- updated_at

#### learner_activity_progress

Stores minimal normal-mode learner progress at the activity level.

This table is a foundation only; it is not intended to become a full grading or analytics system in the first implementation.

Likely fields:

- id
- user_id
- module_id
- week_id
- activity_id
- status
- last_seen_at
- completed_at
- created_at
- updated_at

Allowed status values may begin with:

```text
not_started
in_progress
completed
```

Test mode must not write normal learner progress rows.

#### learner_activity_submissions

Stores minimal normal-mode learner submissions when an activity has a saved response.

This table is a foundation for later teacher review, feedback, grading, and revision workflows, but the first implementation should keep it simple.

Likely fields:

- id
- user_id
- module_id
- week_id
- activity_id
- submission_type
- response_json
- checked_by
- app_check_result
- submitted_at
- created_at
- updated_at

`response_json` may store selected answers, match sets, fill-blank values, or structured text depending on the activity type.

`app_check_result` may store simple JSON for first-pass checking, such as:

```json
{
  "is_correct": true,
  "checked_at": "2026-05-11T00:00:00.000Z",
  "item_results": []
}
```

The first implementation may support only simple app-check results. Full scoring analytics, gradebook behavior, weighted scoring, and teacher feedback workflows are out of scope for the first implementation.

Test mode must not write normal learner submission rows.

#### content_testing_comments

Stores testing/review comments.

Likely fields:

- id
- submitted_at
- user_id
- user_email_snapshot
- user_display_name_snapshot
- module_id
- week_id
- activity_id
- screen_context
- comment_text
- category
- severity
- context_json
- status
- created_at
- updated_at

Allowed category values:

```text
content_issue
media_issue
answer_key_issue
rendering_issue
instruction_confusing
teacher_review_issue
access_or_navigation_issue
other
```

Allowed severity values:

```text
low
medium
high
blocker
```

Allowed status values:

```text
unread
read
in_progress
completed
```

Future tables may support richer attempts, teacher feedback, grading, revision history, and reporting. Those richer workflows do not need to be fully implemented in the first pass, but the initial migration should include the minimal progress/submission foundation above so the production LMS has somewhere to grow.

## 11. Content Loading Requirements

### 11.1 Source of Truth

The canonical course files under `content/` remain the source of truth.

The app should not require hand-copying content into a different authoring format.

### 11.2 Loading Strategy

Decision: use a **minimal build-generated content bundle**.

The canonical files under `content/` remain the source of truth. During build or prebuild, a content build script reads the canonical course files and emits app-consumable JSON bundles for the React LMS to load.

Preferred generated outputs:

```text
public/app-content/course-index.json
public/app-content/modules/module-01.json
public/app-content/modules/module-02.json
...
```

The generated bundle should preserve source identifiers and enough path/context metadata to make rendered screens easy to trace back to the canonical files.

The first implementation may generate only Module 1, but the build pipeline must be shaped so later modules can be added without changing the app architecture.

The app should not load every raw week file directly at runtime, and content should not be imported into D1 for the first implementation.

### 11.3 Future Content Growth

The app should be designed to handle Modules 1–8 and 112 total weeks.

Do not hardcode Module 1 in a way that prevents later modules from working.

It is acceptable for the first implementation milestone to only generate and render Module 1, provided the content build script and app loader clearly support adding future modules.

Future module support should require adding canonical module/week content and rerunning the build step, not rewriting LMS screens.

## 12. Admin Requirements

### 12.1 Admin Access

Admin routes are available only to superusers.

Suggested route:

```text
/admin
```

The admin route is served under:

```text
https://fashion.slopcopy.com/admin
```

### 12.2 Admin Sections

Initial admin sections:

1. Dashboard
2. User Management
3. Content Testing Data
4. Content/Review Dashboard

### 12.3 Admin Dashboard

The dashboard should show:

- total users
- active users
- disabled users
- test-mode users
- modules available
- unread content testing comments
- in-progress content testing comments
- high/blocker severity content testing comments

### 12.4 User Management

See Section 5.

### 12.5 Content Testing Data

See Section 9.

### 12.6 Content/Review Dashboard

The content/review dashboard should summarize module/week/activity health.

Useful initial indicators:

- content loaded successfully
- media loaded successfully
- missing media
- broken refs
- app-checkable count
- teacher-reviewed count
- speaking count
- listening count
- testing comments by module/week/activity

## 13. Non-Goals for the First Implementation Pass

The first implementation pass should not attempt to finish the entire LMS.

Out of scope for the first pass:

- production-grade grading system
- full teacher workflow
- separate teacher role or teacher-permission model
- full learner progress analytics
- certificates
- payments
- public marketing site
- classroom rostering imports
- automated speech scoring
- AI-generated feedback
- complex reporting dashboards
- mobile app store deployment
- public student profiles
- usernames as social/display identities
- discussion boards
- forums
- group chat
- peer-to-peer student messaging
- student-to-student commenting or social features

The first pass should focus on login, user records, module access/test mode, D1 migrations, minimal progress/submission foundations, Module 1 rendering, answer checking, review panels, testing comments, and admin visibility.

## 14. Suggested Initial Routes

Authenticated student routes:

```text
/
/app
/app/modules/:moduleId
/app/modules/:moduleId/weeks/:weekId
/app/modules/:moduleId/weeks/:weekId/activities/:activityId
```

Admin routes:

```text
/admin
/admin/users
/admin/users/:userId
/admin/content-testing
/admin/content-testing/:commentId
/admin/review
```

API routes, names to be finalized:

```text
/api/me
/api/modules
/api/modules/:moduleId
/api/users
/api/users/:userId
/api/users/:userId/module-access
/api/content-testing-comments
/api/content-testing-comments/:commentId
/api/admin/review-summary
```

## 15. Acceptance Criteria — First Working Version

A first working version should satisfy these criteria:

1. A Google-authenticated user can open the app.
2. The app creates or updates a user record with email/name/login timestamps.
3. Only configured superusers can access admin screens.
4. Superusers can see users in admin.
5. Superusers can enable/disable a user.
6. Superusers can turn test mode on/off for a user.
7. Superusers can enable/disable Module 1 access for a user.
8. A normal enabled user sees only enabled modules.
9. A disabled user cannot use course content.
10. A test-mode user can access Module 1 freely when Module 1 is present in the generated app-content bundle.
11. A test-mode user can move across generated modules, weeks, and activities freely, but cannot open modules that are only planned and not present in the generated app-content bundle.
12. Module 1 activities render from the build-generated content bundle produced from canonical content files.
13. Module 1 images and audio render from canonical asset paths preserved in the generated bundle.
14. App-checkable activities can show correct/incorrect feedback in test mode.
15. App-checkable activities can show correct/incorrect feedback in normal student mode.
16. Normal student mode saves submitted answers for activities with saved responses.
17. Normal student mode stores minimal activity progress and simple app-check results.
18. Teacher-reviewed activities show expected output/checklist/common errors/feedback prompts where present.
19. Test-mode users can submit free-text content testing comments.
20. Testing comments include user, timestamp, module/week/activity context, comment text, category, severity, status, and context data.
21. Superusers can view content testing comments in admin.
22. Superusers can mark testing comments as read, in progress, or completed.
23. Superusers can permanently delete testing comments.
24. The app does not save normal learner answer stats or learner submissions for test-mode activity checks.
25. The repo includes D1 migrations from the beginning.
26. The initial migration creates baseline tables for users, module access, content testing comments, and minimal normal-mode learner progress/submission foundations.
27. Migrations can be applied locally and remotely using documented Wrangler commands.
28. Production identity comes only from Cloudflare Access-provided identity data.
29. The app fails closed if production Access identity is missing.
30. Local development may use a clearly named dev identity override, but production must ignore it.

## 16. Open Decisions

The following decisions should be made before implementation:

0. Access identity handling:
   - Decision: production identity comes only from Cloudflare Access-provided identity data.
   - First pass may read Access identity headers.
   - Auth helpers should be structured so Access JWT verification can be added later.
   - Do not trust client-provided email values.
   - Local dev may use `DEV_AUTH_EMAIL` / `DEV_AUTH_NAME`, but production must ignore dev overrides.

1. Deployment shape:
   - Decision: use a single Cloudflare Worker serving the React app/static assets, API routes, and D1-backed data operations.
   - Worker/app name: `fashion-lms`.
   - Hostname/custom domain: `fashion.slopcopy.com`.
   - D1 database name: `fashion_lms_db`.
   - D1 binding name: `DB`.
   - Do not split the first implementation into Cloudflare Pages plus a separate API Worker.

2. Content loading:
   - Decision: use a minimal build-generated content bundle.
   - Canonical `content/` files remain the source of truth.
   - The build step emits app-consumable JSON under `public/app-content/` or an equivalent Worker assets path.
   - Do not import course content into D1 for the first implementation.

3. Testing comment deletion:
   - Decision: hard delete. Deleted testing comments are permanently removed from D1.

4. Test mode scope:
   - Decision: test mode shows only modules present in the generated app-content bundle.
   - Test mode does not show every planned module from `course_manifest.json`.
   - Test mode overrides user access switches, but not content existence.

5. Normal student progress:
   - Decision: create minimal progress/submission foundation tables now.
   - Normal student mode should save submitted answers where an activity has a saved response.
   - Normal student mode should check app-checkable activities and store simple correct/incorrect results.
   - Do not build the full grading, analytics, gradebook, or teacher feedback system in the first implementation.
   - Use D1 migrations from the beginning.
   - Test mode must not write normal learner progress or submission rows.

6. Teacher role:
   - Decision: superuser + student only for the first pass.
   - Superusers handle admin, review, and teacher/testing workflow operations initially.
   - Do not introduce a separate teacher role or teacher-permission model until a later requirements pass.

7. Admin superuser source of truth:
   - Decision: use both.
   - The whole LMS is gated by Cloudflare Access.
   - Admin privileges are enforced inside the app after Access identity is established.
   - `SUPERUSER_EMAILS` is the hard root authority.
   - D1 stores role/status data for display, auditing, and future flexibility.
   - A database role cannot remove admin access from a user still present in `SUPERUSER_EMAILS`.

8. Content testing comment triage:
   - Decision: use free-text comments plus lightweight category, severity, and status fields.
   - Keep the free-text comment as the main user input.
   - Use categories for sorting/testing workflow, not for complex ticketing.

## 17. Recommended Implementation Strategy

Recommended first implementation strategy:

1. Build the app as the real LMS shell, not a separate verifier.
2. Gate the entire LMS at `fashion.slopcopy.com` with Cloudflare Zero Trust / Cloudflare Access using Google authentication.
3. Use a single Cloudflare Worker named `fashion-lms` to serve the React app/static assets, API routes, and D1-backed data operations.
4. Read authenticated identity from Cloudflare Access-provided identity data, with a local-dev-only identity override for development.
5. Use D1 app-level authorization for enabled/disabled users, module access, test mode, and display roles after Access identity is established.
6. Use `SUPERUSER_EMAILS` as the root authority for superuser/admin access, with D1 role/status data as a supporting layer.
7. Store users, access switches, minimal normal learner progress/submission foundations, and content testing comments in D1.
8. Generate a minimal app-consumable content bundle from the canonical `content/` files during build/prebuild, starting with Module 1.
9. Build student/test rendering around Module 1 activity types.
10. In normal student mode, save submitted answers and simple app-check results for activities with saved responses.
11. Build admin user management and content testing data screens.
12. Exclude public-facing student profiles, usernames, social features, discussion boards, group chat, and student-to-student messaging.
13. Use hard delete for deleted content testing comments.
14. Include D1 migrations from the beginning and create the baseline schema through migrations.
15. Use only superuser and student roles in the first implementation.
16. Delay a separate teacher role, full production grading, analytics, gradebook behavior, and teacher feedback workflows until the review/test path is working.

This gives us a working review system for Module 1 now and prevents maintaining a separate verification app that would be thrown away later.

## 18. Immediate Next Step

The next working document should be an implementation-oriented requirements version with:

- exact Cloudflare architecture choice for `fashion-lms` at `fashion.slopcopy.com`
- build-generated content bundle contract
- D1 migration plan and database schema draft
- route/API contract
- first milestone breakdown
- Codex implementation prompt
- acceptance tests

