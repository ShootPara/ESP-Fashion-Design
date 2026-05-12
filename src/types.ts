export interface AssetBinding {
  fetch(request: Request): Promise<Response>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatement;
}

export interface Env {
  ASSETS: AssetBinding;
  DB: D1DatabaseLike;
  SUPERUSER_EMAILS?: string;
  DEV_AUTH_EMAIL?: string;
  DEV_AUTH_NAME?: string;
}

export interface Identity {
  email: string;
  displayName: string;
  source: "access" | "dev_override";
}

export interface UserRow {
  id: string;
  email: string;
  display_name: string;
  role: "superuser" | "student";
  is_enabled: number;
  is_test_mode: number;
  is_root_superuser: number;
  first_login_at: string;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

export interface CourseIndexWeekSummary {
  week_id: string;
  week_number: number;
  title: string;
}

export interface CourseIndexModuleSummary {
  module_id: string;
  module_number: number;
  title: string;
  description: string;
  source_status: string;
  available_weeks: CourseIndexWeekSummary[];
  bundle_path: string;
}

export interface CourseIndexModuleCatalogEntry {
  module_id: string;
  module_number: number;
  title: string;
  description: string;
  source_status: string;
  planned_weeks: number;
  is_generated: boolean;
  available_weeks: CourseIndexWeekSummary[];
  bundle_path: string | null;
}

export interface CourseIndex {
  generated_at?: string;
  course_id: string;
  title: string;
  subtitle: string;
  description: string;
  total_modules: number;
  total_weeks: number;
  modules: CourseIndexModuleCatalogEntry[];
  available_modules: CourseIndexModuleSummary[];
}

export interface MeResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    display_name: string;
    role: "student" | "superuser";
    is_superuser: boolean;
    is_root_superuser: boolean;
    is_enabled: boolean;
    is_test_mode: boolean;
    first_login_at: string;
    last_login_at: string;
  };
  access: {
    can_access_admin: boolean;
    visible_modules: CourseIndexModuleSummary[];
  };
  support: {
    email: string;
    login_help_url: string;
  };
}

export interface AdminSummaryResponse {
  ok: true;
  summary: {
    total_users: number;
    enabled_users: number;
    disabled_users: number;
    test_mode_users: number;
    superusers: number;
    root_superusers: number;
    users_with_module_01: number;
  };
}

export interface AdminUserModuleAccessSummary {
  enabled_module_ids: string[];
  enabled_count: number;
  total_modules: number;
  generated_enabled_count: number;
  planned_enabled_count: number;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  display_name: string;
  first_login_at: string;
  last_login_at: string;
  role: "student" | "superuser";
  is_superuser: boolean;
  is_root_superuser: boolean;
  is_enabled: boolean;
  is_test_mode: boolean;
  module_access_summary: AdminUserModuleAccessSummary;
}

export interface AdminModuleAccessEntry extends CourseIndexModuleCatalogEntry {
  access_enabled: boolean;
}

export interface AdminUserDetail extends AdminUserSummary {
  module_access: AdminModuleAccessEntry[];
}

export interface AdminUsersListResponse {
  ok: true;
  users: AdminUserSummary[];
}

export interface AdminUserDetailResponse {
  ok: true;
  user: AdminUserDetail;
}

export interface UpdateAdminUserRequest {
  is_enabled?: boolean;
  is_test_mode?: boolean;
}

export interface UpdateAdminUserModuleAccessRequest {
  module_access: Array<{
    module_id: string;
    is_enabled: boolean;
  }>;
}

export interface LocalizedTextGroup {
  title?: string;
  summary?: string;
  instructions?: string;
  success_criteria?: string[];
  sentence_frames?: string[];
  word_bank_label?: string;
}

export interface LocalizedStudentFacing {
  en?: LocalizedTextGroup;
  pt?: LocalizedTextGroup;
}

export interface ActivityInputField {
  field_id: string;
  prompt_en: string;
  prompt_pt: string;
}

export interface ActivityInputItem {
  response_type?: string;
  label_en?: string;
  label_pt?: string;
  prompt_en?: string;
  prompt_pt?: string;
  options_en?: string[];
  options_pt?: string[];
  correct_answer?: string | boolean;
  correct_answers?: string[];
  accepted_answers?: string[];
  match_terms_en?: string[];
  match_terms_pt?: string[];
  matches?: Array<{
    image_key?: string;
    target_key?: string;
    term_en?: string;
    term_pt?: string;
    answer_en?: string;
    answer_pt?: string;
  }>;
  asset_ids?: string[];
  correct_matches?: Record<string, string>;
  pairs?: Array<{
    en?: string;
    pt?: string;
    term_en?: string;
    term_pt?: string;
  }>;
  category_targets?: string[];
  category_display_labels?: Array<{
    key: string;
    label_en: string;
    label_pt: string;
  }>;
  category_matches?: Array<{
    term_en: string;
    category: string;
  }>;
  terms_en?: string[];
  sentence_frame_en?: string;
  sentence_frame_pt?: string;
  word_bank?: string[];
  asset_id?: string;
  lines_en?: string[];
  lines_pt?: string[];
  correct_order?: string[];
  fields?: ActivityInputField[];
  checklist_items_en?: string[];
  checklist_items_pt?: string[];
}

export interface ActivityStep {
  step_number: number;
  title: string;
  student_action_en: string;
  student_action_pt: string;
  teacher_action: string;
  estimated_minutes: number;
  mode: string;
}

export interface ActivityExpectedOutput {
  mode: string;
  description_en: string;
  description_pt: string;
  length_or_format: string;
}

export interface ActivityAssessment {
  mode: string;
  completion_criteria_en?: string[];
  completion_criteria_pt?: string[];
  checklist_en?: string[];
  checklist_pt?: string[];
  rubric?: string[];
  model_response_en?: string;
  model_response_pt?: string;
  common_errors?: string[];
  feedback_prompts_en?: string[];
  feedback_prompts_pt?: string[];
}

export interface ModuleActivity {
  activity_id: string;
  week_id: string;
  sequence_number: number;
  title: string;
  activity_type: string;
  summary: string;
  student_facing?: LocalizedStudentFacing;
  teacher_instructions?: string;
  estimated_minutes: number;
  primary_interaction_type: string;
  submission_type: string;
  checked_by: "app" | "teacher" | "student" | "not_submitted";
  teacher_review_required: boolean;
  revision_supported: boolean;
  skill_focus?: string[];
  cefr_access_level?: string;
  cefr_target_level?: string;
  cefr_level?: string;
  vocabulary_refs?: string[];
  asset_refs?: string[];
  input?: {
    input_type?: string;
    prompt_en?: string;
    prompt_pt?: string;
    items?: ActivityInputItem[];
  };
  steps?: ActivityStep[];
  expected_output?: ActivityExpectedOutput;
  assessment?: ActivityAssessment;
  notes_for_app_design?: string;
}

export interface ModuleWeekAsset {
  asset_id: string;
  week_id: string;
  asset_type: "image" | "audio" | string;
  title: string;
  description: string;
  target_filename: string;
  status: string;
  used_by_activity_ids?: string[];
  generation_source?: string;
  notes?: string;
}

export interface ModuleWeekBundle {
  week_id: string;
  week_number: number;
  title: string;
  summary: string;
  essential_question: string;
  week_manifest: {
    week_id: string;
    estimated_total_minutes?: number;
    skill_focus?: string[];
  };
  activities: {
    week_id: string;
    activities: ModuleActivity[];
  };
  asset_manifest: {
    week_id: string;
    assets: ModuleWeekAsset[];
  };
  source_paths: Record<string, string>;
}

export interface ModuleBundle {
  module_id: string;
  module_number: number;
  title: string;
  description: string;
  weeks: ModuleWeekBundle[];
  source_paths: Record<string, string>;
}

export interface LearnerActivityProgressRow {
  id: string;
  user_id: string;
  module_id: string;
  week_id: string;
  activity_id: string;
  status: "not_started" | "in_progress" | "completed";
  first_opened_at: string | null;
  last_interacted_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearnerActivitySubmissionRow {
  id: string;
  user_id: string;
  module_id: string;
  week_id: string;
  activity_id: string;
  submission_type: string;
  answer_json: string;
  app_check_result_json: string | null;
  is_correct: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityAnswerItem {
  response_type: string;
  value: unknown;
}

export interface ActivityAnswerPayload {
  activity_id: string;
  items: Record<string, ActivityAnswerItem>;
}

export interface AppCheckItemResult {
  item_index: number;
  response_type: string;
  prompt_label: string;
  is_correct: boolean;
  expected?: string | string[] | Record<string, string>;
  received?: unknown;
}

export interface AppCheckResult {
  checked_at: string;
  is_correct: boolean;
  score: number;
  max_score: number;
  items: AppCheckItemResult[];
}

export interface ActivityStateResponse {
  ok: true;
  mode: "normal" | "test";
  persisted: boolean;
  progress: LearnerActivityProgressRow | null;
  submission: {
    id: string;
    submission_type: string;
    answer: ActivityAnswerPayload;
    app_check_result: AppCheckResult | null;
    is_correct: boolean | null;
    updated_at: string;
  } | null;
}

export interface ActivityProgressRequest {
  module_id: string;
  week_id: string;
  activity_id: string;
  status: "in_progress" | "completed";
  event: "view" | "save" | "check" | "mark_complete";
}

export interface ActivityProgressResponse {
  ok: true;
  mode: "normal" | "test";
  persisted: boolean;
  reason?: string;
  progress: LearnerActivityProgressRow | null;
}

export interface ActivitySubmissionRequest {
  module_id: string;
  week_id: string;
  activity_id: string;
  submission_type: string;
  answer: ActivityAnswerPayload;
  run_app_check: boolean;
  mark_completed: boolean;
}

export interface ActivitySubmissionResponse {
  ok: true;
  mode: "normal" | "test";
  persisted: boolean;
  reason?: string;
  progress: LearnerActivityProgressRow | null;
  submission: {
    id: string;
    submission_type: string;
    answer: ActivityAnswerPayload;
    app_check_result: AppCheckResult | null;
    is_correct: boolean | null;
    updated_at: string;
  } | null;
  app_check: AppCheckResult | null;
}

export type ContentTestingCommentCategory =
  | "content_issue"
  | "media_issue"
  | "answer_key_issue"
  | "rendering_issue"
  | "instruction_confusing"
  | "teacher_review_issue"
  | "access_or_navigation_issue"
  | "other";

export type ContentTestingCommentSeverity = "low" | "medium" | "high" | "blocker";

export type ContentTestingCommentStatus = "unread" | "read" | "in_progress" | "completed";

export type ContentTestingCommentScreenContext = "module" | "week" | "activity";

export interface ContentTestingCommentRow {
  id: string;
  user_id: string | null;
  user_email_snapshot: string;
  user_display_name_snapshot: string;
  module_id: string;
  week_id: string;
  activity_id: string;
  screen_context: ContentTestingCommentScreenContext;
  category: ContentTestingCommentCategory;
  severity: ContentTestingCommentSeverity;
  status: ContentTestingCommentStatus;
  comment_text: string;
  context_json: string;
  created_at: string;
  updated_at: string;
}

export interface ContentTestingCommentContext {
  route_path: string;
  module_title?: string;
  module_number?: number;
  week_title?: string;
  week_number?: number;
  activity_title?: string;
  activity_sequence_number?: number;
  primary_interaction_type?: string;
  submission_type?: string;
  checked_by?: string;
  teacher_review_required?: boolean;
  revision_supported?: boolean;
  asset_refs?: string[];
  vocabulary_refs?: string[];
  notes_for_app_design?: string;
  source_path?: string;
  visible_asset_statuses?: Array<{
    asset_id: string;
    asset_type: string;
    status: string;
    target_filename: string;
  }>;
  is_test_mode?: boolean;
}

export interface ContentTestingCommentSummary {
  id: string;
  user_email_snapshot: string;
  user_display_name_snapshot: string;
  module_id: string;
  week_id: string;
  activity_id: string;
  screen_context: ContentTestingCommentScreenContext;
  category: ContentTestingCommentCategory;
  severity: ContentTestingCommentSeverity;
  status: ContentTestingCommentStatus;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export interface ContentTestingCommentDetail extends ContentTestingCommentSummary {
  user_id: string | null;
  context: ContentTestingCommentContext;
}

export interface CreateContentTestingCommentRequest {
  module_id: string;
  week_id: string;
  activity_id: string;
  screen_context: ContentTestingCommentScreenContext;
  category: ContentTestingCommentCategory;
  severity: ContentTestingCommentSeverity;
  comment_text: string;
  context: ContentTestingCommentContext;
}

export interface UpdateContentTestingCommentRequest {
  status?: ContentTestingCommentStatus;
  category?: ContentTestingCommentCategory;
  severity?: ContentTestingCommentSeverity;
}

export interface ContentTestingCommentCreateResponse {
  ok: true;
  comment: ContentTestingCommentDetail;
}

export interface AdminContentTestingCommentsListResponse {
  ok: true;
  comments: ContentTestingCommentSummary[];
}

export interface AdminContentTestingCommentDetailResponse {
  ok: true;
  comment: ContentTestingCommentDetail;
}

export interface AdminContentTestingCommentDeleteResponse {
  ok: true;
  deleted_id: string;
}

export interface ReviewSummaryModuleFlags {
  module_id: string;
  module_title: string;
  total_weeks: number;
  total_activities: number;
  missing_or_non_generated_assets: number;
  broken_asset_references: number;
  teacher_review_required_activities: number;
  revision_supported_activities: number;
  speaking_activities: number;
  listening_activities: number;
  app_checkable_activities: number;
  not_submitted_activities: number;
  renderer_gap_activities: number;
}

export interface ReviewSummaryResponse {
  ok: true;
  summary: {
    comments: {
      total: number;
      unread: number;
      in_progress: number;
      completed: number;
      high_or_blocker: number;
    };
    quick_flags: {
      modules_scanned: number;
      total_activities: number;
      missing_or_non_generated_assets: number;
      broken_asset_references: number;
      teacher_review_required_activities: number;
      revision_supported_activities: number;
      speaking_activities: number;
      listening_activities: number;
      app_checkable_activities: number;
      not_submitted_activities: number;
      renderer_gap_activities: number;
    };
    modules: ReviewSummaryModuleFlags[];
  };
}
