import type {
  ActivityAnswerPayload,
  AppCheckResult,
  D1DatabaseLike,
  LearnerActivitySubmissionRow
} from "../types";

function nowIso(): string {
  return new Date().toISOString();
}

export async function getLearnerActivitySubmission(
  db: D1DatabaseLike,
  userId: string,
  activityId: string
): Promise<LearnerActivitySubmissionRow | null> {
  return db
    .prepare("SELECT * FROM learner_activity_submissions WHERE user_id = ? AND activity_id = ? LIMIT 1")
    .bind(userId, activityId)
    .first<LearnerActivitySubmissionRow>();
}

export async function upsertLearnerActivitySubmission(
  db: D1DatabaseLike,
  input: {
    userId: string;
    moduleId: string;
    weekId: string;
    activityId: string;
    submissionType: string;
    answer: ActivityAnswerPayload;
    appCheckResult: AppCheckResult | null;
  }
): Promise<LearnerActivitySubmissionRow> {
  const timestamp = nowIso();
  const existing = await getLearnerActivitySubmission(db, input.userId, input.activityId);
  const id = existing?.id ?? crypto.randomUUID();
  const answerJson = JSON.stringify(input.answer);
  const appCheckResultJson = input.appCheckResult ? JSON.stringify(input.appCheckResult) : null;
  const isCorrect = input.appCheckResult ? (input.appCheckResult.is_correct ? 1 : 0) : null;

  await db
    .prepare(
      `INSERT INTO learner_activity_submissions (
        id, user_id, module_id, week_id, activity_id, submission_type,
        answer_json, app_check_result_json, is_correct, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, activity_id) DO UPDATE SET
        module_id = excluded.module_id,
        week_id = excluded.week_id,
        submission_type = excluded.submission_type,
        answer_json = excluded.answer_json,
        app_check_result_json = excluded.app_check_result_json,
        is_correct = excluded.is_correct,
        updated_at = excluded.updated_at`
    )
    .bind(
      id,
      input.userId,
      input.moduleId,
      input.weekId,
      input.activityId,
      input.submissionType,
      answerJson,
      appCheckResultJson,
      isCorrect,
      existing?.created_at ?? timestamp,
      timestamp
    )
    .run();

  const updated = await getLearnerActivitySubmission(db, input.userId, input.activityId);
  if (!updated) {
    throw new Error("Activity submission could not be reloaded after upsert.");
  }

  return updated;
}
