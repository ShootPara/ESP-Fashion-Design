import { useState } from "react";
import type {
  ContentTestingCommentCategory,
  ContentTestingCommentContext,
  ContentTestingCommentCreateResponse,
  ContentTestingCommentDetail,
  ContentTestingCommentScreenContext,
  ContentTestingCommentSeverity
} from "../types";

export const CONTENT_TESTING_COMMENT_CATEGORY_OPTIONS: ContentTestingCommentCategory[] = [
  "content_issue",
  "media_issue",
  "answer_key_issue",
  "rendering_issue",
  "instruction_confusing",
  "teacher_review_issue",
  "access_or_navigation_issue",
  "other"
];

export const CONTENT_TESTING_COMMENT_SEVERITY_OPTIONS: ContentTestingCommentSeverity[] = ["low", "medium", "high", "blocker"];

export function useContentTestingCommentForm(input: {
  moduleId: string;
  weekId?: string;
  activityId?: string;
  screenContext: ContentTestingCommentScreenContext;
  context: ContentTestingCommentContext;
}) {
  const [commentText, setCommentText] = useState("");
  const [category, setCategory] = useState<ContentTestingCommentCategory>("other");
  const [severity, setSeverity] = useState<ContentTestingCommentSeverity>("medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [latestComment, setLatestComment] = useState<ContentTestingCommentDetail | null>(null);

  async function submit() {
    if (!commentText.trim()) {
      setError("Please add a note before you submit.");
      return null;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/content-testing-comments", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          module_id: input.moduleId,
          week_id: input.weekId ?? "",
          activity_id: input.activityId ?? "",
          screen_context: input.screenContext,
          category,
          severity,
          comment_text: commentText,
          context: input.context
        })
      });

      const json = (await response.json()) as ContentTestingCommentCreateResponse | { error?: string };
      if (!response.ok || !("ok" in json)) {
        throw new Error("We could not save your note just now.");
      }

      setLatestComment(json.comment);
      setCommentText("");
      setCategory("other");
      setSeverity("medium");
      setError("");
      setStatusMessage("Thanks - your note was saved.");
      return json.comment;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not save your note just now.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  return {
    category,
    commentText,
    error,
    latestComment,
    saving,
    severity,
    statusMessage,
    setCategory,
    setCommentText,
    setSeverity,
    submit
  };
}
