import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  apiRequest,
  clearStoredTokens,
  getStoredTokens,
  parseJsonOrEmpty,
  setStoredTokens,
} from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const res = await apiRequest("auth/me/");
    if (!res.ok) {
      setUser(null);
      return false;
    }
    const data = await parseJsonOrEmpty(res);
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role ?? null,
      group: data.group ?? null,
      is_staff: !!data.is_staff,
      is_superuser: !!data.is_superuser,
    });
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { access } = getStoredTokens();
      if (!access) {
        if (!cancelled) setLoading(false);
        return;
      }
      const ok = await fetchMe();
      if (!ok) clearStoredTokens();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMe]);

  const login = useCallback(
    async (email, password) => {
      const res = await apiRequest("auth/login/", {
        method: "POST",
        skipAuth: true,
        json: { email, password },
      });
      const data = await parseJsonOrEmpty(res);
      if (!res.ok) {
        let msg = "Login failed.";
        if (typeof data.detail === "string") msg = data.detail;
        else if (Array.isArray(data.non_field_errors)) msg = data.non_field_errors[0];
        else {
          const err = data.email?.[0] || data.password?.[0];
          if (err) msg = err;
        }
        throw new Error(msg);
      }
      setStoredTokens(data.access_token, data.refresh_token);
      await fetchMe();
    },
    [fetchMe]
  );

  const logout = useCallback(async () => {
    const { refresh } = getStoredTokens();
    if (refresh) {
      await apiRequest("auth/logout/", {
        method: "POST",
        json: { refresh_token: refresh },
      });
    }
    clearStoredTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshProfile: fetchMe,
      isAuthenticated: !!user,
    }),
    [user, loading, login, logout, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
