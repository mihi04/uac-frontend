import { useCallback, useEffect, useState } from "react";
import { fetchInvoicesPage, fetchQuotationsPage } from "../../../api/listsApi.js";
import { srmStyle as style } from "../srmStyles.js";
import { SectionHeader } from "../formPrimitives.jsx";

function formatInr(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(n));
}

function statusBadge(st, styleMap) {
  const s = (st || "").toLowerCase();
  if (s.includes("paid") || s.includes("approved") || s.includes("delivered")) return styleMap.badgeGreen;
  if (s.includes("cancel")) return styleMap.badgeRed;
  return styleMap.badge;
}

/**
 * @param {{
 *   shell: { kpi: object | null, loading: boolean, error: string | null, refresh: () => Promise<void> },
 *   reloadTablesKey?: number,
 * }} props
 */
export function DashboardScreen({ shell, reloadTablesKey = 0 }) {
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState(null);

  const loadTables = useCallback(async () => {
    setTablesLoading(true);
    setTablesError(null);
    const [q, inv] = await Promise.all([fetchQuotationsPage({ pageSize: 8 }), fetchInvoicesPage({ pageSize: 8 })]);
    if (q.ok) setQuotations(q.results);
    if (inv.ok) setInvoices(inv.results);
    const err =
      (!q.ok && (q.error?.detail || JSON.stringify(q.error))) ||
      (!inv.ok && (inv.error?.detail || JSON.stringify(inv.error))) ||
      null;
    if (err) setTablesError(typeof err === "string" ? err : "Failed to load lists");
    setTablesLoading(false);
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables, reloadTablesKey]);

  const kpi = shell.kpi;
  const statRows = kpi
    ? [
        { label: "Active shipments", val: String(kpi.shipments?.active ?? "—") },
        { label: "Shipment revenue (₹)", val: formatInr(kpi.shipments?.revenue) },
        { label: "Outstanding (₹)", val: formatInr(kpi.invoicing?.outstanding) },
        { label: "Cash collected (₹)", val: formatInr(kpi.cash_collected) },
      ]
    : [
        { label: "Active shipments", val: "—" },
        { label: "Shipment revenue (₹)", val: "—" },
        { label: "Outstanding (₹)", val: "—" },
        { label: "Cash collected (₹)", val: "—" },
      ];

  return (
    <div style={style.contentArea}>
      {shell.error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "8px 12px", marginBottom: 12, fontSize: 12, borderRadius: 2 }}>
          {shell.error}
        </div>
      )}
      {(shell.loading || tablesLoading) && (
        <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>Loading…</div>
      )}
      {tablesError && (
        <div style={{ background: "#fff8e6", color: "#856404", padding: "8px 12px", marginBottom: 12, fontSize: 12, borderRadius: 2 }}>
          {tablesError}
        </div>
      )}

      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        {statRows.map((s, i) => (
          <div key={i} style={style.statCard}>
            <div style={style.statVal}>{s.val}</div>
            <div style={style.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {kpi?.period && (
        <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>
          Period: {kpi.period.from} — {kpi.period.to}
        </div>
      )}

      <div style={style.section}>
        <SectionHeader title="Recent Quotations" />
        <table style={style.table}>
          <thead>
            <tr>
              {["Quotation #", "Customer", "Origin", "Destination", "Mode", "Amount (₹)", "Status"].map(h => (
                <th key={h} style={style.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotations.length === 0 && !tablesLoading && (
              <tr>
                <td colSpan={7} style={{ ...style.td, color: "#999" }}>
                  No quotations found.
                </td>
              </tr>
            )}
            {quotations.map(q => (
              <tr key={q.id}>
                <td style={style.td}>{q.quotation_number ?? q.id}</td>
                <td style={style.td}>{q.customer_name ?? "—"}</td>
                <td style={style.td}>{q.origin ?? "—"}</td>
                <td style={style.td}>{q.destination ?? "—"}</td>
                <td style={style.td}>{q.mode ?? "—"}</td>
                <td style={style.td}>₹{formatInr(q.total_amount)}</td>
                <td style={style.td}>
                  <span style={statusBadge(q.status, style)}>{q.status ?? "—"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={style.section}>
        <SectionHeader title="Recent Invoices" />
        <table style={style.table}>
          <thead>
            <tr>
              {["Invoice #", "Customer", "Total (₹)", "Paid (₹)", "Balance (₹)", "Status", "Due"].map(h => (
                <th key={h} style={style.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && !tablesLoading && (
              <tr>
                <td colSpan={7} style={{ ...style.td, color: "#999" }}>
                  No invoices found.
                </td>
              </tr>
            )}
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td style={style.td}>{inv.invoice_number ?? inv.id}</td>
                <td style={style.td}>{inv.customer_name ?? "—"}</td>
                <td style={style.td}>₹{formatInr(inv.total_amount)}</td>
                <td style={style.td}>₹{formatInr(inv.amount_paid)}</td>
                <td style={style.td}>₹{formatInr(inv.balance_due)}</td>
                <td style={style.td}>
                  <span style={statusBadge(inv.status, style)}>{inv.status ?? "—"}</span>
                </td>
                <td style={style.td}>{inv.due_date ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
