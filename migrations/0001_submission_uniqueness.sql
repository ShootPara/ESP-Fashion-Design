DELETE FROM learner_activity_submissions
WHERE rowid NOT IN (
  SELECT MIN(rowid)
  FROM learner_activity_submissions
  GROUP BY user_id, activity_id
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_user_activity_unique
  ON learner_activity_submissions(user_id, activity_id);
