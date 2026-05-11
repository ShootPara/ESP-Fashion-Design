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

export interface CourseIndexModuleSummary {
  module_id: string;
  module_number: number;
  title: string;
  description: string;
  source_status: string;
  available_weeks: Array<{
    week_id: string;
    week_number: number;
    title: string;
  }>;
  bundle_path: string;
}

export interface CourseIndex {
  course_id: string;
  title: string;
  subtitle: string;
  description: string;
  total_modules: number;
  total_weeks: number;
  available_modules: CourseIndexModuleSummary[];
}
