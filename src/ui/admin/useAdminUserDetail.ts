import { useEffect, useState } from "react";
import type {
  AdminUserDetail,
  AdminUserDetailResponse,
  UpdateAdminUserModuleAccessRequest,
  UpdateAdminUserRequest
} from "../../types";

export function useAdminUserDetail(userId: string | undefined) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        setUser(null);
        setLoading(false);
        setError("User not found.");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`);
        const json = (await response.json()) as AdminUserDetailResponse | { error?: string };

        if (!response.ok || !("ok" in json)) {
          throw new Error("Unable to load user detail.");
        }

        if (!cancelled) {
          setUser(json.user);
          setError("");
          setStatusMessage("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load user detail.");
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
  }, [userId]);

  async function patchUserState(body: UpdateAdminUserRequest) {
    if (!userId) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const json = (await response.json()) as AdminUserDetailResponse | { error?: string };
      if (!response.ok || !("ok" in json)) {
        throw new Error(
          response.status === 409 ? "Root superusers cannot be disabled." : "Unable to update user state."
        );
      }

      setUser(json.user);
      setStatusMessage("User state updated.");
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update user state.");
    } finally {
      setSaving(false);
    }
  }

  async function patchModuleAccess(body: UpdateAdminUserModuleAccessRequest) {
    if (!userId) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/module-access`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const json = (await response.json()) as AdminUserDetailResponse | { error?: string };
      if (!response.ok || !("ok" in json)) {
        throw new Error("Unable to update module access.");
      }

      setUser(json.user);
      setStatusMessage("Module access updated.");
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update module access.");
    } finally {
      setSaving(false);
    }
  }

  return {
    user,
    loading,
    saving,
    error,
    statusMessage,
    patchUserState,
    patchModuleAccess
  };
}
