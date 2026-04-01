const DEFAULT_BASE = "https://uac-backend-production.up.railway.app:4502/api/v1";

export const STORAGE_ACCESS = "srm_access_token";
export const STORAGE_REFRESH = "srm_refresh_token";

export function getApiBase() {
  return (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
}

export function getStoredTokens() {
  return {
    access: localStorage.getItem(STORAGE_ACCESS),
    refresh: localStorage.getItem(STORAGE_REFRESH),
  };
}

export function setStoredTokens(access, refresh) {
  if (access) localStorage.setItem(STORAGE_ACCESS, access);
  if (refresh) localStorage.setItem(STORAGE_REFRESH, refresh);
}

export function clearStoredTokens() {
  localStorage.removeItem(STORAGE_ACCESS);
  localStorage.removeItem(STORAGE_REFRESH);
}

let refreshPromise = null;

async function doRefresh() {
  const { refresh } = getStoredTokens();
  if (!refresh) return null;
  const base = getApiBase();
  const res = await fetch(`${base}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const access = data.access_token ?? data.access;
  const newRefresh = data.refresh_token ?? data.refresh ?? refresh;
  if (access) setStoredTokens(access, newRefresh || undefined);
  return access;
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * @param {string} path - path relative to API base (e.g. "auth/me/")
 * @param {RequestInit & { json?: object, skipAuth?: boolean, _retry?: boolean }} options
 */
export async function apiRequest(path, options = {}) {
  const { json, skipAuth, headers: extraHeaders, _retry = false, ...rest } = options;
  const base = getApiBase();
  const url = path.startsWith("http") ? path : `${base}/${path.replace(/^\//, "")}`;

  const headers = new Headers(extraHeaders);
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (!skipAuth) {
    const { access } = getStoredTokens();
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }

  const init = {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  };

  let res = await fetch(url, init);

  if (res.status === 401 && !skipAuth && !_retry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      return apiRequest(path, { ...options, _retry: true });
    }
  }

  return res;
}

export async function parseJsonOrEmpty(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}
