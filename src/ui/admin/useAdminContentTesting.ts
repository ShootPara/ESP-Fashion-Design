import { useEffect, useState } from "react";
import type {
  AdminContentTestingCommentDeleteResponse,
  AdminContentTestingCommentDetailResponse,
  AdminContentTestingCommentsListResponse,
  ContentTestingCommentDetail,
  ContentTestingCommentSummary,
  ReviewSummaryResponse,
  UpdateContentTestingCommentRequest
} from "../../types";

export function useAdminReviewSummary() {
  const [summary, setSummary] = useState<ReviewSummaryResponse["summary"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/review-summary");
        const json = (await response.json()) as ReviewSummaryResponse | { error?: string };

        if (!response.ok || !("ok" in json)) {
          throw new Error("Unable to load review summary.");
        }

        if (!cancelled) {
          setSummary(json.summary);
          setError("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load review summary.");
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

  return { summary, loading, error };
}

export function useAdminContentTestingComments() {
  const [comments, setComments] = useState<ContentTestingCommentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/content-testing-comments");
        const json = (await response.json()) as AdminContentTestingCommentsListResponse | { error?: string };

        if (!response.ok || !("ok" in json)) {
          throw new Error("Unable to load content testing comments.");
        }

        if (!cancelled) {
          setComments(json.comments);
          setError("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load content testing comments.");
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

  return { comments, loading, error };
}

export function useAdminContentTestingCommentDetail(commentId: string | undefined) {
  const [comment, setComment] = useState<ContentTestingCommentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!commentId) {
        setComment(null);
        setLoading(false);
        setError("Comment not found.");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/content-testing-comments/${encodeURIComponent(commentId)}`);
        const json = (await response.json()) as AdminContentTestingCommentDetailResponse | { error?: string };

        if (!response.ok || !("ok" in json)) {
          throw new Error("Unable to load content testing comment detail.");
        }

        if (!cancelled) {
          setComment(json.comment);
          setError("");
          setStatusMessage("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load content testing comment detail.");
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
  }, [commentId]);

  async function patchComment(body: UpdateContentTestingCommentRequest) {
    if (!commentId) {
      return null;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/content-testing-comments/${encodeURIComponent(commentId)}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const json = (await response.json()) as AdminContentTestingCommentDetailResponse | { error?: string };
      if (!response.ok || !("ok" in json)) {
        throw new Error("Unable to update content testing comment.");
      }

      setComment(json.comment);
      setStatusMessage("Content testing comment updated.");
      setError("");
      return json.comment;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update content testing comment.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function deleteComment() {
    if (!commentId) {
      return false;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/content-testing-comments/${encodeURIComponent(commentId)}`, {
        method: "DELETE"
      });

      const json = (await response.json()) as AdminContentTestingCommentDeleteResponse | { error?: string };
      if (!response.ok || !("ok" in json)) {
        throw new Error("Unable to delete content testing comment.");
      }

      setStatusMessage("Content testing comment deleted.");
      setError("");
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete content testing comment.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    comment,
    loading,
    saving,
    error,
    statusMessage,
    patchComment,
    deleteComment
  };
}
