const inrFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function inr(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return inrFmt.format(Number(n));
}

/**
 * @param {object | null | undefined} dash API body from GET reports/dashboard/
 * @returns {string[]}
 */
export function buildAlertsFromKpi(dash) {
  if (!dash || !dash.shipments) return [];
  const lines = [];
  const out = dash.invoicing?.outstanding;
  if (out > 0) lines.push(`Outstanding receivables: ${inr(out)}`);
  const active = dash.shipments.active;
  if (active > 0) lines.push(`${active} shipment(s) in active transit / port stages`);
  const margin = dash.shipments.profit_margin;
  const rev = dash.shipments.revenue;
  if (margin < 0 && rev > 0) lines.push(`Profit margin is negative (${margin}%) for the selected period`);
  if (dash.invoicing && dash.invoicing.total_invoiced === 0 && dash.period) {
    lines.push("No invoicing recorded in the selected period");
  }
  return lines;
}

/**
 * @param {Array<{ shipment_number?: string, id?: number, status?: string, customer_name?: string }>} shipments
 * @param {number} [max]
 * @returns {string[]}
 */
export function shipmentTasksFromList(shipments, max = 12) {
  return (shipments || []).slice(0, max).map(s => {
    const num = s.shipment_number || `#${s.id ?? "?"}`;
    const cust = s.customer_name || "";
    const st = (s.status || "?").replace(/_/g, " ");
    return `${num} — ${st}${cust ? ` (${cust})` : ""}`;
  });
}
