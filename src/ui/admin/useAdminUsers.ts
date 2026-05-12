import { useEffect, useState } from "react";
import type { AdminSummaryResponse, AdminUserSummary, AdminUsersListResponse } from "../../types";

export function useAdminSummary() {
  const [summary, setSummary] = useState<AdminSummaryResponse["summary"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/summary");
        const json = (await response.json()) as AdminSummaryResponse | { error?: string };

        if (!response.ok || !("ok" in json)) {
          throw new Error("Unable to load admin summary.");
        }

        if (!cancelled) {
          setSummary(json.summary);
          setError("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load admin summary.");
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

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/users");
        const json = (await response.json()) as AdminUsersListResponse | { error?: string };

        if (!response.ok || !("ok" in json)) {
          throw new Error("Unable to load users.");
        }

        if (!cancelled) {
          setUsers(json.users);
          setError("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load users.");
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

  return { users, loading, error };
}
