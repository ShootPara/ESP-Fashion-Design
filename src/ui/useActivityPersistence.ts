import { useEffect, useMemo, useState } from "react";
import { evaluateActivitySubmission, hasRealSavedResponse } from "../activity/checking";
import type {
  ActivityAnswerPayload,
  ActivityProgressResponse,
  ActivityStateResponse,
  ActivitySubmissionResponse,
  AppCheckResult,
  MeResponse,
  ModuleActivity
} from "../types";

function createEmptyAnswer(activity: ModuleActivity): ActivityAnswerPayload {
  return {
    activity_id: activity.activity_id,
    items: {}
  };
}

export function useActivityPersistence(args: {
  activity: ModuleActivity;
  moduleId: string;
  weekId: string;
  me: MeResponse;
}) {
  const { activity, moduleId, weekId, me } = args;
  const isTestMode = me.user.is_test_mode;
  const isAppCheckable = activity.checked_by === "app";
  const hasSavedResponse = hasRealSavedResponse(activity);
  const [answer, setAnswer] = useState<ActivityAnswerPayload>(() => createEmptyAnswer(activity));
  const [appCheckResult, setAppCheckResult] = useState<AppCheckResult | null>(null);
  const [loadingState, setLoadingState] = useState(!isTestMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setAnswer(createEmptyAnswer(activity));
    setAppCheckResult(null);
    setStatusMessage("");
  }, [activity.activity_id]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (isTestMode || !me.user.is_enabled) {
        setLoadingState(false);
        return;
      }

      try {
        setLoadingState(true);
        const stateResponse = await fetch(
          `/api/activity-state?module_id=${encodeURIComponent(moduleId)}&week_id=${encodeURIComponent(weekId)}&activity_id=${encodeURIComponent(activity.activity_id)}`
        );

        if (!stateResponse.ok) {
          throw new Error("Unable to load saved activity state.");
        }

        const stateJson = (await stateResponse.json()) as ActivityStateResponse;

        if (!cancelled) {
          if (stateJson.submission?.answer) {
            setAnswer(stateJson.submission.answer);
          }
          setAppCheckResult(stateJson.submission?.app_check_result ?? null);
        }

        const progressResponse = await fetch("/api/progress/activity", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            module_id: moduleId,
            week_id: weekId,
            activity_id: activity.activity_id,
            status: "in_progress",
            event: "view"
          })
        });

        if (!progressResponse.ok) {
          throw new Error("Unable to record activity view.");
        }
      } catch (caught) {
        if (!cancelled) {
          setStatusMessage(caught instanceof Error ? caught.message : "Unable to load activity state.");
        }
      } finally {
        if (!cancelled) {
          setLoadingState(false);
        }
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [activity.activity_id, isTestMode, me.user.is_enabled, moduleId, weekId]);

  function setItemAnswer(itemIndex: number, responseType: string, value: unknown) {
    setAnswer((current) => ({
      activity_id: current.activity_id,
      items: {
        ...current.items,
        [String(itemIndex)]: {
          response_type: responseType,
          value
        }
      }
    }));
    setAppCheckResult(null);
    setStatusMessage("");
  }

  function clearItemAnswer(itemIndex: number) {
    setAnswer((current) => {
      const nextItems = { ...current.items };
      delete nextItems[String(itemIndex)];
      return {
        activity_id: current.activity_id,
        items: nextItems
      };
    });
    setAppCheckResult(null);
    setStatusMessage("");
  }

  async function saveResponse() {
    if (isTestMode || !hasSavedResponse) {
      setStatusMessage(isTestMode ? "Test mode keeps answers local only." : "This activity has no saved response.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submissions/activity", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          module_id: moduleId,
          week_id: weekId,
          activity_id: activity.activity_id,
          submission_type: activity.submission_type,
          answer,
          run_app_check: false,
          mark_completed: true
        })
      });

      if (!response.ok) {
        throw new Error("Unable to save response.");
      }

      const json = (await response.json()) as ActivitySubmissionResponse;
      setAppCheckResult(json.app_check);
      setStatusMessage(json.persisted ? "Response saved." : "Response kept local only.");
    } catch (caught) {
      setStatusMessage(caught instanceof Error ? caught.message : "Unable to save response.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function checkResponse() {
    if (!isAppCheckable) {
      return;
    }

    if (isTestMode) {
      const localResult = evaluateActivitySubmission(activity, answer);
      setAppCheckResult(localResult);
      setStatusMessage(localResult ? "Checked locally in test mode." : "No checkable answers in this activity.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submissions/activity", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          module_id: moduleId,
          week_id: weekId,
          activity_id: activity.activity_id,
          submission_type: activity.submission_type,
          answer,
          run_app_check: true,
          mark_completed: true
        })
      });

      if (!response.ok) {
        throw new Error("Unable to check response.");
      }

      const json = (await response.json()) as ActivitySubmissionResponse;
      setAppCheckResult(json.app_check);
      setStatusMessage(json.persisted ? "Answer checked and saved." : "Checked without saving.");
    } catch (caught) {
      setStatusMessage(caught instanceof Error ? caught.message : "Unable to check response.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function markComplete() {
    if (isTestMode) {
      setStatusMessage("Test mode does not save completion.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/progress/activity", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          module_id: moduleId,
          week_id: weekId,
          activity_id: activity.activity_id,
          status: "completed",
          event: "mark_complete"
        })
      });

      if (!response.ok) {
        throw new Error("Unable to mark activity complete.");
      }

      const json = (await response.json()) as ActivityProgressResponse;
      setStatusMessage(json.persisted ? "Activity marked complete." : "Completion kept local only.");
    } catch (caught) {
      setStatusMessage(caught instanceof Error ? caught.message : "Unable to mark activity complete.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasAnyResponse = useMemo(() => Object.keys(answer.items).length > 0, [answer.items]);

  return {
    answer,
    appCheckResult,
    clearItemAnswer,
    hasAnyResponse,
    hasSavedResponse,
    isAppCheckable,
    isSubmitting,
    loadingState,
    markComplete,
    saveResponse,
    setItemAnswer,
    statusMessage,
    checkResponse
  };
}
