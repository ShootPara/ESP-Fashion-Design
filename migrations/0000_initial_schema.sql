CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('superuser', 'student')),
  is_enabled INTEGER NOT NULL DEFAULT 1 CHECK (is_enabled IN (0, 1)),
  is_test_mode INTEGER NOT NULL DEFAULT 0 CHECK (is_test_mode IN (0, 1)),
  is_root_superuser INTEGER NOT NULL DEFAULT 0 CHECK (is_root_superuser IN (0, 1)),
  first_login_at TEXT NOT NULL,
  last_login_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_module_access (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 0 CHECK (is_enabled IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, module_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learner_activity_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  week_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  first_opened_at TEXT,
  last_interacted_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, activity_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learner_activity_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  week_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  submission_type TEXT NOT NULL,
  answer_json TEXT NOT NULL,
  app_check_result_json TEXT,
  is_correct INTEGER CHECK (is_correct IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content_testing_comments (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email_snapshot TEXT NOT NULL,
  user_display_name_snapshot TEXT NOT NULL DEFAULT '',
  module_id TEXT NOT NULL DEFAULT '',
  week_id TEXT NOT NULL DEFAULT '',
  activity_id TEXT NOT NULL DEFAULT '',
  screen_context TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (
    category IN (
      'content_issue',
      'media_issue',
      'answer_key_issue',
      'rendering_issue',
      'instruction_confusing',
      'teacher_review_issue',
      'access_or_navigation_issue',
      'other'
    )
  ),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'blocker')),
  status TEXT NOT NULL CHECK (status IN ('unread', 'read', 'in_progress', 'completed')),
  comment_text TEXT NOT NULL,
  context_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_role_state
  ON users(role, is_enabled, is_test_mode);

CREATE INDEX IF NOT EXISTS idx_user_module_access_lookup
  ON user_module_access(user_id, module_id);

CREATE INDEX IF NOT EXISTS idx_progress_user_week
  ON learner_activity_progress(user_id, week_id);

CREATE INDEX IF NOT EXISTS idx_submissions_user_activity_created
  ON learner_activity_submissions(user_id, activity_id, created_at);

CREATE INDEX IF NOT EXISTS idx_comments_status_context
  ON content_testing_comments(status, severity, module_id, week_id, activity_id);
