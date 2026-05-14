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
          throw new Error("We could not load the review notes.");
        }

        if (!cancelled) {
          setComments(json.comments);
          setError("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "We could not load the review notes.");
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
          throw new Error("We could not load this review note.");
        }

        if (!cancelled) {
          setComment(json.comment);
          setError("");
          setStatusMessage("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "We could not load this review note.");
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
        throw new Error("We could not update this note.");
      }

      setComment(json.comment);
      setStatusMessage("Review note updated.");
      setError("");
      return json.comment;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not update this note.");
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
        throw new Error("We could not delete this note.");
      }

      setStatusMessage("Review note deleted.");
      setError("");
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not delete this note.");
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
