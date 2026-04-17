import { apiRequest, parseJsonOrEmpty } from "./client.js";

function unwrapResults(data) {
  if (data && Array.isArray(data.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

export async function listCustomers(params = {}) {
  const q = new URLSearchParams();
  q.set("page_size", String(params.pageSize ?? 200));
  if (params.search?.trim()) q.set("search", params.search.trim());
  const res = await apiRequest(`customers/?${q}`);
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, error: data, results: [] };
  return { ok: true, results: unwrapResults(data) };
}

export async function createCustomer(body) {
  const res = await apiRequest("customers/", { method: "POST", json: body });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data };
  return { ok: true, status: res.status, data };
}

export async function getCustomer(id) {
  const res = await apiRequest(`customers/${id}/`, { method: "GET" });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data };
  return { ok: true, status: res.status, data };
}

export async function updateCustomer(id, body) {
  const res = await apiRequest(`customers/${id}/`, { method: "PATCH", json: body });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data };
  return { ok: true, status: res.status, data };
}

export async function addCustomerContact(customerId, body) {
  const res = await apiRequest(`customers/${customerId}/contacts/`, { method: "POST", json: body });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data };
  return { ok: true, status: res.status, data };
}

export async function addCustomerAddress(customerId, body) {
  const res = await apiRequest(`customers/${customerId}/addresses/`, { method: "POST", json: body });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data };
  return { ok: true, status: res.status, data };
}

export async function patchCustomerContact(customerId, contactId, body) {
  const res = await apiRequest(`customers/${customerId}/contacts/${contactId}/`, { method: "PATCH", json: body });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data };
  return { ok: true, status: res.status, data };
}

export async function patchCustomerAddress(customerId, addressId, body) {
  const res = await apiRequest(`customers/${customerId}/addresses/${addressId}/`, { method: "PATCH", json: body });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data };
  return { ok: true, status: res.status, data };
}

/**
 * @param {number|string} customerId
 * @param {File} file
 * @param {string} [documentType]
 */
export async function uploadCustomerDocument(customerId, file, documentType = "other") {
  const form = new FormData();
  form.append("file", file);
  form.append("document_type", documentType);
  const res = await apiRequest(`customers/${customerId}/documents/`, {
    method: "POST",
    body: form,
  });
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) return { ok: false, status: res.status, error: data };
  return { ok: true, status: res.status, data };
}
