import type { ActivityProgressRequest, D1DatabaseLike, LearnerActivityProgressRow } from "../types";

function nowIso(): string {
  return new Date().toISOString();
}

export async function getLearnerActivityProgress(
  db: D1DatabaseLike,
  userId: string,
  activityId: string
): Promise<LearnerActivityProgressRow | null> {
  return db
    .prepare("SELECT * FROM learner_activity_progress WHERE user_id = ? AND activity_id = ? LIMIT 1")
    .bind(userId, activityId)
    .first<LearnerActivityProgressRow>();
}

export async function upsertLearnerActivityProgress(
  db: D1DatabaseLike,
  userId: string,
  input: ActivityProgressRequest
): Promise<LearnerActivityProgressRow> {
  const timestamp = nowIso();
  const existing = await getLearnerActivityProgress(db, userId, input.activity_id);
  const firstOpenedAt = existing?.first_opened_at ?? (input.event === "view" ? timestamp : timestamp);
  const completedAt = input.status === "completed" ? timestamp : existing?.completed_at ?? null;

  if (!existing) {
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO learner_activity_progress (
          id, user_id, module_id, week_id, activity_id, status,
          first_opened_at, last_interacted_at, completed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        userId,
        input.module_id,
        input.week_id,
        input.activity_id,
        input.status,
        firstOpenedAt,
        timestamp,
        completedAt,
        timestamp,
        timestamp
      )
      .run();
  } else {
    await db
      .prepare(
        `UPDATE learner_activity_progress
          SET module_id = ?,
              week_id = ?,
              status = ?,
              first_opened_at = COALESCE(first_opened_at, ?),
              last_interacted_at = ?,
              completed_at = ?,
              updated_at = ?
          WHERE user_id = ? AND activity_id = ?`
      )
      .bind(
        input.module_id,
        input.week_id,
        input.status,
        firstOpenedAt,
        timestamp,
        completedAt,
        timestamp,
        userId,
        input.activity_id
      )
      .run();
  }

  const updated = await getLearnerActivityProgress(db, userId, input.activity_id);
  if (!updated) {
    throw new Error("Activity progress could not be reloaded after upsert.");
  }

  return updated;
}
