import { apiRequest, parseJsonOrEmpty } from "./client.js";

/**
 * @param {{ fromDate?: string, toDate?: string }} [opts] YYYY-MM-DD
 * @returns {Promise<{ ok: boolean, data?: object, status: number, error?: object }>}
 */
export async function fetchDashboard(opts = {}) {
  const q = new URLSearchParams();
  if (opts.fromDate) q.set("from_date", opts.fromDate);
  if (opts.toDate) q.set("to_date", opts.toDate);
  const qs = q.toString();
  const path = `reports/dashboard/${qs ? `?${qs}` : ""}`;
  const res = await apiRequest(path, { method: "GET" });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data };
  return { ok: true, status: res.status, data };
}
