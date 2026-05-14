import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import type { CourseIndexModuleSummary, MeResponse, ModuleActivity, ModuleBundle, ModuleWeekBundle } from "../types";
import { summarizeWeekMedia } from "./assetPaths";
import { ActivityRenderer } from "./activityRenderers";
import { ContentTestingCommentPanel } from "./ContentTestingCommentPanel";
import { RouteErrorBoundary } from "./RouteErrorBoundary";
import { ReviewMetadataPanel } from "./reviewMetadata";
import { useActivityPersistence } from "./useActivityPersistence";
import { AdminDashboardPage } from "./admin/AdminDashboardPage";
import { AdminContentTestingCommentDetailPage } from "./admin/AdminContentTestingCommentDetailPage";
import { AdminContentTestingCommentsPage } from "./admin/AdminContentTestingCommentsPage";
import { AdminUserDetailPage } from "./admin/AdminUserDetailPage";
import { AdminUsersPage } from "./admin/AdminUsersPage";

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

function useModuleBundle(moduleSummary: CourseIndexModuleSummary | undefined) {
  const [bundle, setBundle] = useState<ModuleBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!moduleSummary) {
        setBundle(null);
        setError("");
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

function getWeekStats(week: ModuleWeekBundle) {
  const activities = week.activities.activities;
  const appChecked = activities.filter((activity) => activity.checked_by === "app").length;
  const teacherChecked = activities.filter((activity) => activity.checked_by === "teacher").length;
  const studentChecked = activities.filter((activity) => activity.checked_by === "student").length;
  const reviewRequired = activities.filter((activity) => activity.teacher_review_required).length;
  const media = summarizeWeekMedia(week);

  return {
    totalActivities: activities.length,
    appChecked,
    teacherChecked,
    studentChecked,
    reviewRequired,
    media
  };
}

function getModuleStats(bundle: ModuleBundle) {
  return bundle.weeks.reduce(
    (summary, week) => {
      const weekStats = getWeekStats(week);
      summary.totalActivities += weekStats.totalActivities;
      summary.appChecked += weekStats.appChecked;
      summary.teacherChecked += weekStats.teacherChecked;
      summary.studentChecked += weekStats.studentChecked;
      summary.reviewRequired += weekStats.reviewRequired;
      summary.media += weekStats.media.total;
      return summary;
    },
    {
      totalActivities: 0,
      appChecked: 0,
      teacherChecked: 0,
      studentChecked: 0,
      reviewRequired: 0,
      media: 0
    }
  );
}

function getDisplayTitle(activity: ModuleActivity) {
  return activity.student_facing?.en?.title || activity.title;
}

function getDisplaySummary(activity: ModuleActivity) {
  return activity.student_facing?.en?.summary || activity.summary;
}

function createReviewContext(input: {
  pathname: string;
  isTestMode: boolean;
  bundle: ModuleBundle;
  week?: ModuleWeekBundle;
  activity?: ModuleActivity;
}) {
  const { pathname, isTestMode, bundle, week, activity } = input;
  const assets = week
    ? (week.asset_manifest?.assets ?? [])
        .filter((asset) => (activity ? (activity.asset_refs ?? []).includes(asset.asset_id) : true))
        .map((asset) => ({
          asset_id: asset.asset_id,
          asset_type: asset.asset_type,
          status: asset.status,
          target_filename: asset.target_filename
        }))
    : [];

  return {
    route_path: pathname,
    module_title: bundle.title,
    module_number: bundle.module_number,
    week_title: week?.title,
    week_number: week?.week_number,
    activity_title: activity ? getDisplayTitle(activity) : undefined,
    activity_sequence_number: activity?.sequence_number,
    primary_interaction_type: activity?.primary_interaction_type,
    submission_type: activity?.submission_type,
    checked_by: activity?.checked_by,
    teacher_review_required: activity?.teacher_review_required,
    revision_supported: activity?.revision_supported,
    asset_refs: activity?.asset_refs ?? [],
    vocabulary_refs: activity?.vocabulary_refs ?? [],
    notes_for_app_design: activity?.notes_for_app_design,
    source_path: activity ? week?.source_paths.activities : week ? week.source_paths.week_root : bundle.source_paths.module_root,
    visible_asset_statuses: assets,
    is_test_mode: isTestMode
  };
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <section className="empty-state card-surface">
      <p className="eyebrow">Loading</p>
      <h2>{label}</h2>
    </section>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <section className="empty-state card-surface danger-surface">
      <p className="eyebrow">Load error</p>
      <h2>Something blocked this screen.</h2>
      <p>{message}</p>
    </section>
  );
}

function NotFoundPanel({ title }: { title: string }) {
  return (
    <section className="empty-state card-surface">
      <p className="eyebrow">Not found</p>
      <h2>{title}</h2>
      <p>The requested route is not available in the current generated shell.</p>
    </section>
  );
}

function HomePage({ me }: { me: MeResponse }) {
  return (
    <section className="stack-lg">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Fashion LMS</p>
          <h2>Module review and test shell</h2>
          <p>
            Module 1 is available for content verification, media checks, activity-flow review, and app-checkable answer testing.
          </p>
        </div>
        <div className="hero-panel__meta">
          <span className="status-chip neutral">{me.access.visible_modules.length} visible modules</span>
          <span className={`status-chip ${me.user.is_test_mode ? "warn" : "success"}`}>
            {me.user.is_test_mode ? "test mode active" : "normal mode"}
          </span>
        </div>
      </section>

      <section className="module-grid">
        {me.access.visible_modules.map((moduleSummary) => (
          <Link key={moduleSummary.module_id} to={`/module/${moduleSummary.module_id}`} className="module-card">
            <div className="module-card__header">
              <p className="eyebrow">Module {moduleSummary.module_number}</p>
              <span className="status-chip neutral">{moduleSummary.source_status}</span>
            </div>
            <h3>{moduleSummary.title}</h3>
            <p>{moduleSummary.description}</p>
            <div className="metric-row">
              <div>
                <strong>{moduleSummary.available_weeks.length}</strong>
                <span>weeks</span>
              </div>
              <div>
                <strong>{moduleSummary.available_weeks[moduleSummary.available_weeks.length - 1]?.week_number ?? 0}</strong>
                <span>latest week</span>
              </div>
            </div>
          </Link>
        ))}

        {me.access.visible_modules.length === 0 ? (
          <section className="empty-state card-surface">
            <h3>No visible modules</h3>
            <p>No generated modules are currently available for this user.</p>
          </section>
        ) : null}
      </section>
    </section>
  );
}

function ModulePage({ me }: { me: MeResponse }) {
  const location = useLocation();
  const { moduleId } = useParams();
  const moduleSummary = me.access.visible_modules.find((item) => item.module_id === moduleId);
  const { bundle, loading, error } = useModuleBundle(moduleSummary);

  if (!moduleSummary) {
    return <NotFoundPanel title="Module not available" />;
  }

  if (loading) {
    return <LoadingPanel label="Loading module bundle..." />;
  }

  if (error || !bundle) {
    return <ErrorPanel message={error || "Unable to load module bundle."} />;
  }

  const stats = getModuleStats(bundle);
  const showReview = me.user.is_test_mode || me.user.is_superuser;

  return (
    <section className="stack-lg">
      <section className="hero-panel">
        <div>
          <Link className="text-link" to="/">
            Back to modules
          </Link>
          <p className="eyebrow">Module {bundle.module_number}</p>
          <h2>{bundle.title}</h2>
          <p>{bundle.description}</p>
        </div>
        <div className="hero-panel__meta">
          <span className="status-chip neutral">{bundle.weeks.length} weeks</span>
          <span className="status-chip success">{stats.appChecked} app-checked</span>
          <span className="status-chip warn">{stats.teacherChecked} teacher-checked</span>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <strong>{stats.totalActivities}</strong>
          <span>activities</span>
        </div>
        <div className="stat-card">
          <strong>{stats.reviewRequired}</strong>
          <span>teacher review</span>
        </div>
        <div className="stat-card">
          <strong>{stats.media}</strong>
          <span>linked assets</span>
        </div>
        <div className="stat-card">
          <strong>{stats.studentChecked}</strong>
          <span>self-check/student</span>
        </div>
      </section>

      <section className="week-list card-surface">
        <div className="section-heading">
          <h3>All 14 weeks</h3>
          <span className="status-chip neutral">Module view</span>
        </div>
        {bundle.weeks.map((week) => {
          const weekStats = getWeekStats(week);
          return (
            <Link key={week.week_id} to={`/module/${bundle.module_id}/week/${week.week_id}`} className="week-row">
              <div className="week-row__title">
                <p className="eyebrow">Week {week.week_number}</p>
                <h4>{week.title}</h4>
                <p>{week.summary}</p>
              </div>
              <div className="week-row__meta">
                <span className="status-chip neutral">{weekStats.totalActivities} activities</span>
                <span className="status-chip success">{weekStats.appChecked} app</span>
                <span className="status-chip warn">{weekStats.teacherChecked} teacher</span>
                <span className="status-chip neutral">{weekStats.media.imageCount} images</span>
                <span className="status-chip neutral">{weekStats.media.audioCount} audio</span>
              </div>
            </Link>
          );
        })}
      </section>

      {showReview ? (
        <ContentTestingCommentPanel
          context={createReviewContext({
            pathname: location.pathname,
            isTestMode: me.user.is_test_mode,
            bundle
          })}
          moduleId={bundle.module_id}
          screenContext="module"
        />
      ) : null}
    </section>
  );
}

function WeekPage({ me }: { me: MeResponse }) {
  const location = useLocation();
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

  if (error || !bundle) {
    return <ErrorPanel message={error || "Unable to load week."} />;
  }

  if (!week) {
    return <NotFoundPanel title="Week not found" />;
  }

  const weekStats = getWeekStats(week);
  const showReview = me.user.is_test_mode || me.user.is_superuser;

  return (
    <section className="stack-lg">
      <section className="hero-panel">
        <div>
          <Link className="text-link" to={`/module/${bundle.module_id}`}>
            Back to module
          </Link>
          <p className="eyebrow">Week {week.week_number}</p>
          <h2>{week.title}</h2>
          <p>{week.summary}</p>
          <p className="muted">Essential question: {week.essential_question}</p>
        </div>
        <div className="hero-panel__meta">
          <span className="status-chip neutral">{weekStats.totalActivities} activities</span>
          <span className="status-chip success">{weekStats.appChecked} app-checked</span>
          <span className="status-chip warn">{weekStats.teacherChecked} teacher-checked</span>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <strong>{weekStats.media.imageCount}</strong>
          <span>images</span>
        </div>
        <div className="stat-card">
          <strong>{weekStats.media.audioCount}</strong>
          <span>audio</span>
        </div>
        <div className="stat-card">
          <strong>{weekStats.reviewRequired}</strong>
          <span>teacher review</span>
        </div>
        <div className="stat-card">
          <strong>{week.week_manifest.estimated_total_minutes ?? 0}</strong>
          <span>planned minutes</span>
        </div>
      </section>

      <section className="activity-list card-surface">
        <div className="section-heading">
          <h3>Activity sequence</h3>
          <span className="status-chip neutral">Week view</span>
        </div>
        {week.activities.activities.map((activity) => (
          <Link
            key={activity.activity_id}
            to={`/module/${bundle.module_id}/week/${week.week_id}/activity/${activity.activity_id}`}
            className="activity-row"
          >
            <div className="activity-row__main">
              <div className="activity-row__number">{activity.sequence_number}</div>
              <div>
                <h4>{getDisplayTitle(activity)}</h4>
                <p>{getDisplaySummary(activity)}</p>
              </div>
            </div>
            <div className="chip-wrap">
              <span className="status-chip neutral">{activity.primary_interaction_type}</span>
              <span className={`status-chip ${activity.checked_by === "app" ? "success" : activity.checked_by === "teacher" ? "warn" : "neutral"}`}>
                {activity.checked_by}
              </span>
              {activity.asset_refs?.length ? <span className="status-chip neutral">{activity.asset_refs.length} media</span> : null}
              {showReview && activity.teacher_review_required ? <span className="status-chip accent">review</span> : null}
            </div>
          </Link>
        ))}
      </section>

      {showReview ? (
        <ContentTestingCommentPanel
          context={createReviewContext({
            pathname: location.pathname,
            isTestMode: me.user.is_test_mode,
            bundle,
            week
          })}
          moduleId={bundle.module_id}
          screenContext="week"
          weekId={week.week_id}
        />
      ) : null}
    </section>
  );
}

function ActivityPage({ me }: { me: MeResponse }) {
  const location = useLocation();
  const { moduleId, weekId, activityId } = useParams();
  const moduleSummary = me.access.visible_modules.find((item) => item.module_id === moduleId);
  const { bundle, loading, error } = useModuleBundle(moduleSummary);
  const week = bundle?.weeks.find((item) => item.week_id === weekId);
  const activityIndex = week?.activities.activities.findIndex((item) => item.activity_id === activityId) ?? -1;
  const activity = activityIndex >= 0 && week ? week.activities.activities[activityIndex] : null;
  const [isJumpPanelOpen, setIsJumpPanelOpen] = useState(true);
  const persistence = useActivityPersistence({
    activity,
    moduleId: bundle?.module_id ?? "",
    weekId: week?.week_id ?? "",
    me
  });

  if (!moduleSummary) {
    return <NotFoundPanel title="Module not available" />;
  }

  if (loading) {
    return <LoadingPanel label="Loading activity..." />;
  }

  if (error || !bundle) {
    return <ErrorPanel message={error || "Unable to load activity."} />;
  }

  if (!week || !activity) {
    return <NotFoundPanel title="Activity not found" />;
  }

  const previous = activityIndex > 0 ? week.activities.activities[activityIndex - 1] : null;
  const next = activityIndex < week.activities.activities.length - 1 ? week.activities.activities[activityIndex + 1] : null;
  const showReviewPanel = me.user.is_test_mode || me.user.is_superuser;

  return (
    <RouteErrorBoundary
      fallbackMessage="Something on this activity page stopped the screen from rendering. Please go back to the week page or open another activity, then leave a review note if the problem happens again."
      fallbackTitle="This activity page hit an error."
    >
      <section className="stack-lg">
        <section className="activity-shell">
          <div className="activity-shell__main">
            <div className="activity-toolbar card-surface">
              <div className="activity-toolbar__paths">
                <Link className="text-link" to={`/module/${bundle.module_id}/week/${week.week_id}`}>
                  Back to week
                </Link>
                <span className="status-chip neutral">{activity.activity_id}</span>
              </div>
              <div className="question-actions">
                {previous ? (
                  <Link className="secondary-button link-button" to={`/module/${bundle.module_id}/week/${week.week_id}/activity/${previous.activity_id}`}>
                    Previous
                  </Link>
                ) : (
                  <span className="status-chip neutral">First activity</span>
                )}
                {next ? (
                  <Link className="primary-button link-button" to={`/module/${bundle.module_id}/week/${week.week_id}/activity/${next.activity_id}`}>
                    Next
                  </Link>
                ) : (
                  <span className="status-chip neutral">Last activity</span>
                )}
              </div>
            </div>

            <ActivityRenderer
              activity={activity}
              answer={persistence.answer}
              appCheckResult={persistence.appCheckResult}
              checkResponse={persistence.checkResponse}
              clearItemAnswer={persistence.clearItemAnswer}
              hasAnyResponse={persistence.hasAnyResponse}
              hasSavedResponse={persistence.hasSavedResponse}
              isAppCheckable={persistence.isAppCheckable}
              isReviewMode={me.user.is_test_mode}
              isSubmitting={persistence.isSubmitting}
              loadingState={persistence.loadingState}
              markComplete={persistence.markComplete}
              saveResponse={persistence.saveResponse}
              setItemAnswer={persistence.setItemAnswer}
              statusMessage={persistence.statusMessage}
              week={week}
            />
          </div>

          <aside className="activity-shell__side">
            <section className="card-surface side-panel">
              <div className="section-heading">
                <h3>Jump in this week</h3>
                <div className="chip-wrap">
                  <span className="status-chip neutral">{week.activities.activities.length} items</span>
                  <button
                    className="secondary-button side-panel__toggle"
                    onClick={() => setIsJumpPanelOpen((current) => !current)}
                    type="button"
                  >
                    {isJumpPanelOpen ? "Collapse" : "Expand"}
                  </button>
                </div>
              </div>
              {isJumpPanelOpen ? (
                <nav className="jump-list">
                  {week.activities.activities.map((candidate) => (
                    <Link
                      key={candidate.activity_id}
                      className={`jump-row${candidate.activity_id === activity.activity_id ? " is-current" : ""}`}
                      to={`/module/${bundle.module_id}/week/${week.week_id}/activity/${candidate.activity_id}`}
                    >
                      <span>{candidate.sequence_number}</span>
                      <div>
                        <strong>{getDisplayTitle(candidate)}</strong>
                        <p>{candidate.primary_interaction_type}</p>
                      </div>
                    </Link>
                  ))}
                </nav>
              ) : (
                <p className="review-note">Open this panel when you want to jump to another activity in the same week.</p>
              )}
            </section>

            {showReviewPanel ? <ReviewMetadataPanel activity={activity} week={week} /> : null}
            {showReviewPanel ? (
              <ContentTestingCommentPanel
                activityId={activity.activity_id}
                context={createReviewContext({
                  pathname: location.pathname,
                  isTestMode: me.user.is_test_mode,
                  bundle,
                  week,
                  activity
                })}
                moduleId={bundle.module_id}
                screenContext="activity"
                weekId={week.week_id}
              />
            ) : null}
          </aside>
        </section>
      </section>
    </RouteErrorBoundary>
  );
}

function NotFoundPage() {
  return <NotFoundPanel title="Page not found" />;
}

function TestModeBanner() {
  return (
    <section className="test-banner">
      <div>
        <p className="eyebrow">TEST MODE</p>
        <h2>Progress and submissions are not being saved.</h2>
      </div>
      <div className="test-banner__meta">
        <span>Free navigation and retry are enabled.</span>
        <span>Missing media is shown for review.</span>
      </div>
    </section>
  );
}

function Shell({ me }: { me: MeResponse }) {
  const location = useLocation();

  return (
    <div className="app-shell">
      {me.user.is_test_mode ? <TestModeBanner /> : null}
      <header className="app-header">
        <div>
          <p className="eyebrow">Fashion LMS</p>
          <h1>Module 1 rendering review</h1>
          <p className="muted">Review content, media, and answer behavior in the Worker-served shell.</p>
        </div>
        <div className="profile-card">
          <strong>{me.user.display_name || me.user.email}</strong>
          <span>{me.user.email}</span>
          <div className="chip-wrap">
            <span className="status-chip neutral">{me.user.role}</span>
            {me.user.is_test_mode ? <span className="status-chip warn">test mode</span> : null}
            {me.user.is_superuser ? <span className="status-chip accent">superuser</span> : null}
          </div>
        </div>
      </header>

      <nav className="top-nav">
        <Link className="top-nav__link" to="/">
          Modules
        </Link>
        {me.access.can_access_admin ? (
          <Link className="top-nav__link" to="/admin">
            Admin
          </Link>
        ) : null}
        <span className="top-nav__path">{location.pathname}</span>
      </nav>

      {!me.user.is_enabled ? (
        <section className="empty-state card-surface">
          <h2>Access disabled</h2>
          <p>Your login was recognized, but your LMS access is disabled.</p>
          <a className="text-link" href={me.support.login_help_url}>
            Problems logging in?
          </a>
        </section>
      ) : (
        <Routes>
          <Route path="/" element={<HomePage me={me} />} />
          <Route path="/module/:moduleId" element={<ModulePage me={me} />} />
          <Route path="/module/:moduleId/week/:weekId" element={<WeekPage me={me} />} />
          <Route path="/module/:moduleId/week/:weekId/activity/:activityId" element={<ActivityPage me={me} />} />
          <Route path="/admin" element={me.access.can_access_admin ? <AdminDashboardPage me={me} /> : <Navigate to="/" replace />} />
          <Route path="/admin/users" element={me.access.can_access_admin ? <AdminUsersPage /> : <Navigate to="/" replace />} />
          <Route
            path="/admin/content-testing-comments"
            element={me.access.can_access_admin ? <AdminContentTestingCommentsPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin/content-testing-comments/:commentId"
            element={me.access.can_access_admin ? <AdminContentTestingCommentDetailPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin/users/:userId"
            element={me.access.can_access_admin ? <AdminUserDetailPage /> : <Navigate to="/" replace />}
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
