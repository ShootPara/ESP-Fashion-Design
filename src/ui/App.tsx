import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";

interface VisibleModule {
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

interface MeResponse {
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
    visible_modules: VisibleModule[];
  };
  support: {
    email: string;
    login_help_url: string;
  };
}

interface ModuleBundleWeek {
  week_id: string;
  week_number: number;
  title: string;
  summary: string;
  essential_question: string;
  activities: {
    activities: Array<{
      activity_id: string;
      title: string;
      summary: string;
      student_facing?: {
        en?: {
          title?: string;
          summary?: string;
          instructions?: string;
        };
      };
    }>;
  };
}

interface ModuleBundle {
  module_id: string;
  title: string;
  description: string;
  weeks: ModuleBundleWeek[];
}

function useMe() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch("/api/me");
        const json = (await response.json()) as MeResponse | { message?: string };

        if (!response.ok) {
          throw new Error("message" in json && json.message ? json.message : "Unable to load session.");
        }

        if (!cancelled) {
          setData(json as MeResponse);
          setError("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load session.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading };
}

function useModuleBundle(moduleSummary: VisibleModule | undefined) {
  const [bundle, setBundle] = useState<ModuleBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!moduleSummary) {
        setBundle(null);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(moduleSummary.bundle_path);
        const json = (await response.json()) as ModuleBundle;

        if (!response.ok) {
          throw new Error("Unable to load module bundle.");
        }

        if (!cancelled) {
          setBundle(json);
          setError("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load module bundle.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [moduleSummary]);

  return { bundle, loading, error };
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <section className="panel">
      <p>{label}</p>
    </section>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <section className="panel danger">
      <h2>Load error</h2>
      <p>{message}</p>
    </section>
  );
}

function NotFoundPanel({ title }: { title: string }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <p>The requested route is not available in the current generated shell.</p>
    </section>
  );
}

function HomePage({ me }: { me: MeResponse }) {
  return (
    <section className="stack">
      <div className="panel">
        <h2>Available Modules</h2>
        <p>Milestone 1 shows the generated module shell and week/activity navigation, without full activity rendering yet.</p>
      </div>
      <div className="card-grid">
        {me.access.visible_modules.map((moduleSummary) => (
          <Link key={moduleSummary.module_id} to={`/module/${moduleSummary.module_id}`} className="card">
            <p className="eyebrow">Module {moduleSummary.module_number}</p>
            <h3>{moduleSummary.title}</h3>
            <p>{moduleSummary.description}</p>
            <div className="meta-row">
              <span>{moduleSummary.available_weeks.length} weeks</span>
              <span>{moduleSummary.source_status}</span>
            </div>
          </Link>
        ))}
        {me.access.visible_modules.length === 0 ? (
          <div className="panel">
            <h3>No visible modules</h3>
            <p>No generated modules are currently available for this user in normal mode.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ModulePage({ me }: { me: MeResponse }) {
  const { moduleId } = useParams();
  const moduleSummary = me.access.visible_modules.find((item) => item.module_id === moduleId);
  const { bundle, loading, error } = useModuleBundle(moduleSummary);

  if (!moduleSummary) {
    return <NotFoundPanel title="Module not available" />;
  }

  return (
    <section className="stack">
      <div className="panel">
        <Link to="/">Back to modules</Link>
        <p className="eyebrow">Module {moduleSummary.module_number}</p>
        <h2>{moduleSummary.title}</h2>
        <p>{moduleSummary.description}</p>
      </div>
      {loading ? <LoadingPanel label="Loading module bundle..." /> : null}
      {error ? <ErrorPanel message={error} /> : null}
      {bundle ? (
        <div className="card-grid">
          {bundle.weeks.map((week) => (
            <Link key={week.week_id} to={`/module/${moduleSummary.module_id}/week/${week.week_id}`} className="card">
              <p className="eyebrow">Week {week.week_number}</p>
              <h3>{week.title}</h3>
              <p>{week.summary}</p>
              <div className="meta-row">
                <span>{week.activities.activities.length} activities</span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function WeekPage({ me }: { me: MeResponse }) {
  const { moduleId, weekId } = useParams();
  const moduleSummary = me.access.visible_modules.find((item) => item.module_id === moduleId);
  const { bundle, loading, error } = useModuleBundle(moduleSummary);
  const week = bundle?.weeks.find((item) => item.week_id === weekId);

  if (!moduleSummary) {
    return <NotFoundPanel title="Module not available" />;
  }

  if (loading) {
    return <LoadingPanel label="Loading week..." />;
  }

  if (error) {
    return <ErrorPanel message={error} />;
  }

  if (!week) {
    return <NotFoundPanel title="Week not found" />;
  }

  return (
    <section className="stack">
      <div className="panel">
        <Link to={`/module/${moduleSummary.module_id}`}>Back to module</Link>
        <p className="eyebrow">Week {week.week_number}</p>
        <h2>{week.title}</h2>
        <p>{week.summary}</p>
        <p className="muted">Essential question: {week.essential_question}</p>
      </div>
      <div className="list-panel">
        <h3>Activities</h3>
        {week.activities.activities.map((activity, index) => (
          <Link
            key={activity.activity_id}
            to={`/module/${moduleSummary.module_id}/week/${week.week_id}/activity/${activity.activity_id}`}
            className="list-row"
          >
            <span>{index + 1}.</span>
            <div>
              <strong>{activity.student_facing?.en?.title || activity.title}</strong>
              <p>{activity.student_facing?.en?.summary || activity.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ActivityPage({ me }: { me: MeResponse }) {
  const { moduleId, weekId, activityId } = useParams();
  const moduleSummary = me.access.visible_modules.find((item) => item.module_id === moduleId);
  const { bundle, loading, error } = useModuleBundle(moduleSummary);
  const week = bundle?.weeks.find((item) => item.week_id === weekId);
  const activityIndex = week?.activities.activities.findIndex((item) => item.activity_id === activityId) ?? -1;
  const activity = activityIndex >= 0 && week ? week.activities.activities[activityIndex] : null;

  if (!moduleSummary) {
    return <NotFoundPanel title="Module not available" />;
  }

  if (loading) {
    return <LoadingPanel label="Loading activity..." />;
  }

  if (error) {
    return <ErrorPanel message={error} />;
  }

  if (!week || !activity) {
    return <NotFoundPanel title="Activity not found" />;
  }

  const previous = activityIndex > 0 ? week.activities.activities[activityIndex - 1] : null;
  const next = activityIndex < week.activities.activities.length - 1 ? week.activities.activities[activityIndex + 1] : null;

  return (
    <section className="stack">
      <div className="panel">
        <Link to={`/module/${moduleSummary.module_id}/week/${week.week_id}`}>Back to week</Link>
        <p className="eyebrow">{activity.activity_id}</p>
        <h2>{activity.student_facing?.en?.title || activity.title}</h2>
        <p>{activity.student_facing?.en?.summary || activity.summary}</p>
      </div>
      <div className="panel">
        <h3>Student-facing instructions</h3>
        <p>{activity.student_facing?.en?.instructions || "No Milestone 1 renderer yet."}</p>
        <p className="muted">
          This page is intentionally a navigation and metadata skeleton for Milestone 1. Full activity renderers start in Milestone 2.
        </p>
      </div>
      <div className="meta-grid">
        <div className="panel">
          <h3>Skeleton metadata</h3>
          <ul>
            <li>Internal title: {activity.title}</li>
            <li>Activity ID: {activity.activity_id}</li>
          </ul>
        </div>
        <div className="panel">
          <h3>Navigation</h3>
          <div className="action-row">
            {previous ? (
              <Link to={`/module/${moduleSummary.module_id}/week/${week.week_id}/activity/${previous.activity_id}`}>
                Previous activity
              </Link>
            ) : (
              <span className="muted">First activity</span>
            )}
            {next ? (
              <Link to={`/module/${moduleSummary.module_id}/week/${week.week_id}/activity/${next.activity_id}`}>
                Next activity
              </Link>
            ) : (
              <span className="muted">Last activity</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminPage({ me }: { me: MeResponse }) {
  return (
    <section className="stack">
      <div className="panel">
        <h2>Admin Shell</h2>
        <p>This Milestone 1 route confirms the superuser gate is wired.</p>
        <p className="muted">Signed in as {me.user.email}</p>
      </div>
      <div className="panel">
        <h3>Not yet implemented</h3>
        <ul>
          <li>User management UI</li>
          <li>Module access toggles</li>
          <li>Test mode management</li>
          <li>Content testing comment triage</li>
        </ul>
      </div>
    </section>
  );
}

function NotFoundPage() {
  return <NotFoundPanel title="Page not found" />;
}

function Shell({ me }: { me: MeResponse }) {
  const location = useLocation();

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Fashion LMS</p>
          <h1>Milestone 1 Shell</h1>
        </div>
        <div className="user-card">
          <div>{me.user.display_name || me.user.email}</div>
          <div className="muted">{me.user.email}</div>
          <div className="pill-row">
            <span className="pill">{me.user.role}</span>
            {me.user.is_test_mode ? <span className="pill warn">test mode</span> : null}
          </div>
        </div>
      </header>
      <nav className="primary-nav">
        <Link to="/">Modules</Link>
        {me.access.can_access_admin ? <Link to="/admin">Admin</Link> : null}
        <span className="muted path">{location.pathname}</span>
      </nav>
      {!me.user.is_enabled ? (
        <section className="panel">
          <h2>Access disabled</h2>
          <p>Your login was recognized, but your LMS access is disabled.</p>
          <a href={me.support.login_help_url}>Problems logging in?</a>
        </section>
      ) : (
        <Routes>
          <Route path="/" element={<HomePage me={me} />} />
          <Route path="/module/:moduleId" element={<ModulePage me={me} />} />
          <Route path="/module/:moduleId/week/:weekId" element={<WeekPage me={me} />} />
          <Route path="/module/:moduleId/week/:weekId/activity/:activityId" element={<ActivityPage me={me} />} />
          <Route
            path="/admin"
            element={me.access.can_access_admin ? <AdminPage me={me} /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </div>
  );
}

export function App() {
  const { data, error, loading } = useMe();

  if (loading) {
    return <LoadingPanel label="Loading LMS shell..." />;
  }

  if (error || !data) {
    return <ErrorPanel message={error || "Session data is unavailable."} />;
  }

  return <Shell me={data} />;
}
