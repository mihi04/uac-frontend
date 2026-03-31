import { apiRequest, parseJsonOrEmpty } from "./client.js";

function unwrapResults(data) {
  if (data && Array.isArray(data.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

/**
 * @param {{ page?: number, pageSize?: number }} [opts]
 */
export async function fetchQuotationsPage(opts = {}) {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 10;
  const path = `quotations/?page=${page}&page_size=${pageSize}&ordering=-created_at`;
  const res = await apiRequest(path, { method: "GET" });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data, results: [] };
  return { ok: true, status: res.status, results: unwrapResults(data), raw: data };
}

/**
 * @param {{ page?: number, pageSize?: number }} [opts]
 */
export async function fetchInvoicesPage(opts = {}) {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 10;
  const path = `invoices/?page=${page}&page_size=${pageSize}&ordering=-invoice_date`;
  const res = await apiRequest(path, { method: "GET" });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data, results: [] };
  return { ok: true, status: res.status, results: unwrapResults(data), raw: data };
}

/** Matches backend KPI "active" shipment statuses */
export const ACTIVE_SHIPMENT_STATUSES = new Set(["in_transit", "on_vessel", "at_origin_port", "at_dest_port"]);

/**
 * @param {{ pageSize?: number }} [opts]
 */
export async function fetchShipmentsForTasks(opts = {}) {
  const pageSize = opts.pageSize ?? 120;
  const path = `shipments/?page=1&page_size=${pageSize}&ordering=-created_at`;
  const res = await apiRequest(path, { method: "GET" });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data, results: [] };
  const results = unwrapResults(data);
  const active = results.filter(s => ACTIVE_SHIPMENT_STATUSES.has(s.status));
  return { ok: true, status: res.status, results: active, raw: data };
}
