import { apiRequest, parseJsonOrEmpty } from "./client.js";

function unwrapResults(data) {
  if (data && Array.isArray(data.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

// ── Users ────────────────────────────────────────────────────────────────────
export async function listUsers(params = {}) {
  const q = new URLSearchParams();
  q.set("page_size", String(params.pageSize ?? 200));
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.group) q.set("group", String(params.group));
  if (params.status) q.set("status", params.status);
  if (params.is_active !== undefined) q.set("is_active", String(params.is_active));
  const res = await apiRequest(`users/?${q}`);
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, error: data, results: [] };
  return { ok: true, results: unwrapResults(data) };
}

export async function createUser(body) {
  const res = await apiRequest("users/", { method: "POST", json: body });
  const data = await parseJsonOrEmpty(res);
  return { ok: res.ok, status: res.status, data };
}

export async function updateUser(id, body) {
  const res = await apiRequest(`users/${id}/`, { method: "PATCH", json: body });
  const data = await parseJsonOrEmpty(res);
  return { ok: res.ok, status: res.status, data };
}

export async function getUser(id) {
  const res = await apiRequest(`users/${id}/`, { method: "GET" });
  const data = await parseJsonOrEmpty(res);
  return { ok: res.ok, data };
}

export async function getMyPermissions() {
  const res = await apiRequest("users/me/permissions/");
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, error: data, permissions: [] };
  return { ok: true, permissions: Array.isArray(data) ? data : [] };
}

export async function getUserPermissions(id) {
  const res = await apiRequest(`users/${id}/permissions/`);
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, error: data, permissions: [] };
  return { ok: true, permissions: Array.isArray(data) ? data : [] };
}

// ── User Groups ──────────────────────────────────────────────────────────────
export async function listUserGroups(params = {}) {
  const q = new URLSearchParams();
  q.set("page_size", String(params.pageSize ?? 200));
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.status !== undefined) q.set("status", String(params.status));
  const res = await apiRequest(`users/groups/?${q}`);
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, error: data, groups: [] };
  return { ok: true, groups: unwrapResults(data) };
}

export async function getGroup(id) {
  const res = await apiRequest(`users/groups/${id}/`, { method: "GET" });
  const data = await parseJsonOrEmpty(res);
  return { ok: res.ok, data };
}

export async function createGroup(body) {
  const res = await apiRequest("users/groups/", { method: "POST", json: body });
  const data = await parseJsonOrEmpty(res);
  return { ok: res.ok, status: res.status, data };
}

export async function updateGroup(id, body) {
  const res = await apiRequest(`users/groups/${id}/`, { method: "PATCH", json: body });
  const data = await parseJsonOrEmpty(res);
  return { ok: res.ok, status: res.status, data };
}

export async function cloneGroup(id, body) {
  const res = await apiRequest(`users/groups/${id}/clone/`, { method: "POST", json: body });
  const data = await parseJsonOrEmpty(res);
  return { ok: res.ok, status: res.status, data };
}

// ── Screens ──────────────────────────────────────────────────────────────────
export async function listScreens() {
  const res = await apiRequest("users/screens/?page_size=200");
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, error: data, screens: [] };
  return { ok: true, screens: unwrapResults(data) };
}
