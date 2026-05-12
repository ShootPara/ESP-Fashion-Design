import type {
  ContentTestingCommentCategory,
  ContentTestingCommentContext,
  ContentTestingCommentDetail,
  ContentTestingCommentRow,
  ContentTestingCommentSeverity,
  ContentTestingCommentStatus,
  CreateContentTestingCommentRequest,
  D1DatabaseLike,
  UpdateContentTestingCommentRequest
} from "../types";

export const CONTENT_TESTING_COMMENT_CATEGORIES: ContentTestingCommentCategory[] = [
  "content_issue",
  "media_issue",
  "answer_key_issue",
  "rendering_issue",
  "instruction_confusing",
  "teacher_review_issue",
  "access_or_navigation_issue",
  "other"
];

export const CONTENT_TESTING_COMMENT_SEVERITIES: ContentTestingCommentSeverity[] = ["low", "medium", "high", "blocker"];

export const CONTENT_TESTING_COMMENT_STATUSES: ContentTestingCommentStatus[] = ["unread", "read", "in_progress", "completed"];

function nowIso() {
  return new Date().toISOString();
}

function parseContextJson(value: string): ContentTestingCommentContext {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as ContentTestingCommentContext) : { route_path: "" };
  } catch {
    return { route_path: "" };
  }
}

function toDetail(row: ContentTestingCommentRow): ContentTestingCommentDetail {
  return {
    id: row.id,
    user_id: row.user_id,
    user_email_snapshot: row.user_email_snapshot,
    user_display_name_snapshot: row.user_display_name_snapshot,
    module_id: row.module_id,
    week_id: row.week_id,
    activity_id: row.activity_id,
    screen_context: row.screen_context,
    category: row.category,
    severity: row.severity,
    status: row.status,
    comment_text: row.comment_text,
    created_at: row.created_at,
    updated_at: row.updated_at,
    context: parseContextJson(row.context_json)
  };
}

async function getCommentById(db: D1DatabaseLike, commentId: string): Promise<ContentTestingCommentRow | null> {
  return db.prepare("SELECT * FROM content_testing_comments WHERE id = ? LIMIT 1").bind(commentId).first<ContentTestingCommentRow>();
}

export async function createContentTestingComment(
  db: D1DatabaseLike,
  input: CreateContentTestingCommentRequest & {
    userId: string | null;
    userEmailSnapshot: string;
    userDisplayNameSnapshot: string;
  }
): Promise<ContentTestingCommentDetail> {
  const id = crypto.randomUUID();
  const timestamp = nowIso();

  await db
    .prepare(
      `INSERT INTO content_testing_comments (
        id, user_id, user_email_snapshot, user_display_name_snapshot,
        module_id, week_id, activity_id, screen_context,
        category, severity, status, comment_text, context_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unread', ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.userId,
      input.userEmailSnapshot,
      input.userDisplayNameSnapshot,
      input.module_id,
      input.week_id,
      input.activity_id,
      input.screen_context,
      input.category,
      input.severity,
      input.comment_text,
      JSON.stringify(input.context),
      timestamp,
      timestamp
    )
    .run();

  const created = await getCommentById(db, id);
  if (!created) {
    throw new Error("Comment could not be reloaded after create.");
  }

  return toDetail(created);
}

export async function listContentTestingComments(db: D1DatabaseLike): Promise<ContentTestingCommentDetail[]> {
  const result = await db
    .prepare("SELECT * FROM content_testing_comments ORDER BY created_at DESC")
    .all<ContentTestingCommentRow>();

  return result.results.map(toDetail);
}

export async function getContentTestingCommentDetail(
  db: D1DatabaseLike,
  commentId: string
): Promise<ContentTestingCommentDetail | null> {
  const row = await getCommentById(db, commentId);
  return row ? toDetail(row) : null;
}

export async function updateContentTestingComment(
  db: D1DatabaseLike,
  commentId: string,
  updates: UpdateContentTestingCommentRequest
): Promise<ContentTestingCommentDetail | null> {
  const existing = await getCommentById(db, commentId);
  if (!existing) {
    return null;
  }

  const timestamp = nowIso();
  await db
    .prepare(
      `UPDATE content_testing_comments
        SET category = ?,
            severity = ?,
            status = ?,
            updated_at = ?
      WHERE id = ?`
    )
    .bind(
      updates.category ?? existing.category,
      updates.severity ?? existing.severity,
      updates.status ?? existing.status,
      timestamp,
      commentId
    )
    .run();

  return getContentTestingCommentDetail(db, commentId);
}

export async function deleteContentTestingComment(db: D1DatabaseLike, commentId: string): Promise<boolean> {
  const existing = await getCommentById(db, commentId);
  if (!existing) {
    return false;
  }

  await db.prepare("DELETE FROM content_testing_comments WHERE id = ?").bind(commentId).run();
  return true;
}

export async function getContentTestingCommentCounts(db: D1DatabaseLike): Promise<{
  total: number;
  unread: number;
  in_progress: number;
  completed: number;
  high_or_blocker: number;
}> {
  const statusRows = await db
    .prepare("SELECT status, COUNT(*) AS count FROM content_testing_comments GROUP BY status")
    .all<{ status: ContentTestingCommentStatus; count: number }>();
  const severityRows = await db
    .prepare(
      "SELECT COUNT(*) AS count FROM content_testing_comments WHERE severity IN ('high', 'blocker')"
    )
    .first<{ count: number }>();

  const counts = {
    total: 0,
    unread: 0,
    in_progress: 0,
    completed: 0,
    high_or_blocker: Number(severityRows?.count ?? 0)
  };

  for (const row of statusRows.results) {
    const count = Number(row.count ?? 0);
    counts.total += count;
    if (row.status === "unread") {
      counts.unread = count;
    }
    if (row.status === "in_progress") {
      counts.in_progress = count;
    }
    if (row.status === "completed") {
      counts.completed = count;
    }
  }

  return counts;
}
