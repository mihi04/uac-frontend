/**
 * Legacy single-file demo. The runnable app lives under `src/` (Vite). From `frontend/`, run: npm install && npm run dev
 */
import { useState } from "react";

// ─── THEME COLORS (matching PDF exactly) ───────────────────────────────────
// Header: #1a3a4a (dark navy-teal)
// Sub-nav: #1e4d5c
// Sidebar panels bg: #dce9f0
// Buttons: #2e6e82
// Table header: #1e5068
// Body bg: #e8eef2
// Input border: #999
// ────────────────────────────────────────────────────────────────────────────

const COLORS = {
  headerBg: "#162d3a",
  subNavBg: "#1e4457",
  dropdownBg: "#1e5068",
  sidebarPanelBg: "#d8e8f0",
  bodyBg: "#e8edf1",
  btnBg: "#2e6e82",
  btnHover: "#245a6c",
  tableHeader: "#1e5068",
  inputBorder: "#aaa",
  sectionLine: "#2e6e82",
  text: "#1a2a33",
  textLight: "#fff",
  textMuted: "#555",
  link: "#1a6080",
};

const style = {
  // Layout
  app: { fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, color: COLORS.text, minHeight: "100vh", display: "flex", flexDirection: "column", background: COLORS.bodyBg },
  // Top header
  header: { background: COLORS.headerBg, color: "#fff", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontWeight: "800", fontSize: 20, letterSpacing: 0.5, color: "#fff" },
  headerRight: { display: "flex", gap: 20, alignItems: "center", fontSize: 13 },
  headerLink: { color: "#cde", cursor: "pointer", textDecoration: "none" },
  headerUser: { display: "flex", alignItems: "center", gap: 6, color: "#cde", cursor: "pointer" },
  // Sub nav
  subNav: { background: COLORS.subNavBg, display: "flex", alignItems: "center", padding: "0 16px", minHeight: 38, position: "relative" },
  navItem: { color: "#cde", padding: "10px 16px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 4, userSelect: "none" },
  navItemHover: { background: "rgba(255,255,255,0.08)" },
  dropdown: { position: "absolute", top: 38, left: 0, background: COLORS.dropdownBg, minWidth: 210, zIndex: 100, boxShadow: "2px 4px 12px rgba(0,0,0,0.3)" },
  dropdownItem: { padding: "9px 18px", color: "#d8eef8", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13 },
  // Main layout
  mainLayout: { display: "flex", flex: 1, minHeight: 0 },
  content: { flex: 1, padding: "0 0 0 0", display: "flex", flexDirection: "column", overflow: "auto" },
  // Page bar
  pageBar: { background: COLORS.bodyBg, borderBottom: "2px solid #bbd0dc", padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  pageTitle: { fontWeight: "600", fontSize: 14, color: COLORS.text },
  pageActions: { display: "flex", gap: 6 },
  btn: { background: COLORS.btnBg, color: "#fff", border: "none", borderRadius: 2, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 },
  btnOutline: { background: "transparent", color: COLORS.btnBg, border: `1px solid ${COLORS.btnBg}`, borderRadius: 2, padding: "4px 12px", cursor: "pointer", fontSize: 12 },
  // Content area
  contentArea: { padding: "16px 20px", flex: 1 },
  // Section
  section: { marginBottom: 12 },
  sectionHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${COLORS.sectionLine}` },
  sectionTitle: { fontWeight: "600", fontSize: 13, color: COLORS.text },
  // Form row
  formRow: { display: "flex", alignItems: "center", marginBottom: 8, gap: 0 },
  label: { width: 160, minWidth: 140, fontSize: 12, color: COLORS.text, paddingRight: 10 },
  input: { border: `1px solid ${COLORS.inputBorder}`, borderRadius: 2, padding: "5px 8px", fontSize: 12, width: 280, outline: "none", background: "#fff", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)" },
  inputSm: { border: `1px solid ${COLORS.inputBorder}`, borderRadius: 2, padding: "5px 8px", fontSize: 12, width: 160, outline: "none", background: "#fff" },
  select: { border: `1px solid ${COLORS.inputBorder}`, borderRadius: 2, padding: "5px 8px", fontSize: 12, width: 200, background: "#fff", outline: "none" },
  // Upload box
  uploadBox: { border: `1px solid ${COLORS.inputBorder}`, width: 180, height: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#fff", borderRadius: 2 },
  uploadLabel: { color: COLORS.link, fontSize: 12, textDecoration: "underline", marginBottom: 6 },
  uploadSub: { fontSize: 11, color: "#888" },
  // Table
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { background: COLORS.tableHeader, color: "#fff", padding: "8px 14px", textAlign: "center", fontWeight: 600 },
  td: { padding: "7px 14px", borderBottom: "1px solid #dce4e8", textAlign: "center", color: COLORS.text, background: "#f0f5f8" },
  // Right sidebar
  sidebar: { width: 230, minWidth: 200, background: "#e0ecf4", borderLeft: "1px solid #c8dbe8", display: "flex", flexDirection: "column", padding: "0" },
  sidePanel: { background: COLORS.sidebarPanelBg, borderBottom: "1px solid #b8cdd8", padding: "10px 14px", minHeight: 80 },
  sidePanelTitle: { fontWeight: "700", fontSize: 13, color: COLORS.text, marginBottom: 6 },
  // Login
  loginWrap: { background: "linear-gradient(135deg, #162d3a 0%, #1e5068 60%, #2e7ea0 100%)", minHeight: "100vh", display: "flex", flexDirection: "column" },
  loginHeader: { padding: "18px 30px" },
  loginTitle: { fontWeight: "900", fontSize: 30, color: "#fff", marginBottom: 4 },
  loginNav: { display: "flex", gap: 30, marginBottom: 10 },
  loginNavLink: { color: "#cde", fontSize: 13, cursor: "pointer", textDecoration: "underline" },
  loginBody: { flex: 1, display: "flex", padding: "0 30px 30px 30px", gap: 20 },
  loginHero: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  loginHeroBg: { width: "100%", height: 340, background: "linear-gradient(120deg, rgba(30,80,104,0.7) 0%, rgba(46,126,160,0.4) 100%)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  loginCard: { background: "#fff", borderRadius: 14, padding: "32px 28px", width: 280, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", gap: 14 },
  loginFieldLabel: { fontSize: 13, color: "#333", marginBottom: 4, fontWeight: 500 },
  loginInput: { border: "1.5px solid #aaa", borderRadius: 3, padding: "8px 10px", fontSize: 13, width: "100%", outline: "none", boxSizing: "border-box" },
  loginBtn: { background: COLORS.btnBg, color: "#fff", border: "none", borderRadius: 4, padding: "10px", fontSize: 14, cursor: "pointer", fontWeight: 600, marginTop: 4 },
  loginLink: { color: COLORS.link, fontSize: 13, textAlign: "center", cursor: "pointer", textDecoration: "underline" },
  loginFooter: { textAlign: "center", color: "#a8c8d8", fontSize: 12, padding: "10px 0 16px 0" },
  // Quotation table
  chargesTable: { width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 8 },
  chargesTh: { background: COLORS.tableHeader, color: "#fff", padding: "7px 10px", textAlign: "left", fontWeight: 600 },
  chargesTd: { padding: "6px 10px", borderBottom: "1px solid #dce4e8", background: "#f8fafb" },
  // Dashboard stats
  statCard: { background: "#fff", borderRadius: 4, padding: "14px 18px", flex: 1, boxShadow: "0 1px 4px rgba(0,0,0,0.10)", borderLeft: "4px solid " + COLORS.btnBg },
  statVal: { fontSize: 22, fontWeight: "800", color: COLORS.btnBg },
  statLabel: { fontSize: 11, color: "#666", marginTop: 2 },
  // Pill badge
  badge: { display: "inline-block", background: COLORS.btnBg, color: "#fff", borderRadius: 10, padding: "1px 9px", fontSize: 11 },
  badgeGreen: { display: "inline-block", background: "#2e8a5a", color: "#fff", borderRadius: 10, padding: "1px 9px", fontSize: 11 },
  badgeRed: { display: "inline-block", background: "#c0392b", color: "#fff", borderRadius: 10, padding: "1px 9px", fontSize: 11 },
};

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────
const SAMPLE_USERS = [
  { id: 1, name: "Rahul Sharma", email: "rahul@srm.com", empNo: "EMP001", status: "Active" },
  { id: 2, name: "Priya Mehta", email: "priya@srm.com", empNo: "EMP002", status: "Active" },
  { id: 3, name: "Amit Patel", email: "amit@srm.com", empNo: "EMP003", status: "Inactive" },
];
const SAMPLE_GROUPS = [
  { id: 1, code: "SALES", desc: "Sales & Marketing", status: "Active", total: 5 },
  { id: 2, code: "FIN", desc: "Finance Team", status: "Active", total: 3 },
  { id: 3, code: "OPS", desc: "Operations", status: "Active", total: 7 },
];
const SAMPLE_CUSTOMERS = [
  { id: 101, name: "XYZ Logistics Pvt Ltd", gst: "27ABCDE1234F1Z5", city: "Mumbai", status: "Active" },
  { id: 102, name: "Global Trade Corp", gst: "07XYZGH5678K2A1", city: "Delhi", status: "Active" },
];
const SAMPLE_QUOTATIONS = [
  { id: "QT-5001", customer: "XYZ Logistics", origin: "Mumbai", dest: "Dubai", mode: "Sea", amount: 59000, status: "Pending" },
  { id: "QT-5002", customer: "Global Trade", origin: "Delhi", dest: "Singapore", mode: "Air", amount: 120000, status: "Approved" },
];
const SAMPLE_INVOICES = [
  { id: "INV-9001", customer: "XYZ Logistics", amount: 59000, gst: 10620, total: 69620, status: "Unpaid", due: "2026-04-15" },
  { id: "INV-9002", customer: "Global Trade", amount: 120000, gst: 21600, total: 141600, status: "Paid", due: "2026-03-30" },
];
const SAMPLE_PAYMENTS = [
  { id: "PAY-001", invoice: "INV-9002", customer: "Global Trade", amount: 141600, method: "NEFT", ref: "TXN98765", date: "2026-03-25", status: "Cleared" },
];
const ALERTS = ["Invoice INV-9001 overdue by 3 days", "Shipment SH-2001 delayed at Mumbai port", "New quotation QT-5003 pending approval"];
const TASKS = ["Approve quotation QT-5002", "Review customer XYZ documents", "Generate invoice for SH-2003"];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function PageBar({ title, actions = [] }) {
  return (
    <div style={style.pageBar}>
      <span style={style.pageTitle}>{title}</span>
      <div style={style.pageActions}>
        {actions.map((a, i) => (
          <button key={i} style={style.btn} onClick={a.onClick}>{a.label}</button>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={style.sectionHeader}>
      <span style={style.sectionTitle}>{title}</span>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, width = 280, placeholder = "" }) {
  return (
    <div style={style.formRow}>
      <span style={style.label}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...style.input, width }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options = [], width = 200 }) {
  return (
    <div style={style.formRow}>
      <span style={style.label}>{label}</span>
      <select value={value} onChange={e => onChange && onChange(e.target.value)} style={{ ...style.select, width }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Sidebar({ bookmarks = [], onRemoveBookmark }) {
  const [hoveredBookmarkIndex, setHoveredBookmarkIndex] = useState(null);

  return (
    <div style={style.sidebar}>
      <div style={style.sidePanel}>
        <div style={style.sidePanelTitle}>Alerts</div>
        {ALERTS.map((a, i) => (
          <div key={i} style={{ fontSize: 11, color: "#c0392b", marginBottom: 5, paddingLeft: 6, borderLeft: "3px solid #c0392b" }}>{a}</div>
        ))}
      </div>
      <div style={style.sidePanel}>
        <div style={style.sidePanelTitle}>Current Tasks</div>
        {TASKS.map((t, i) => (
          <div key={i} style={{ fontSize: 11, color: "#1a4a5e", marginBottom: 5, paddingLeft: 6, borderLeft: "3px solid " + COLORS.btnBg }}>{t}</div>
        ))}
      </div>
      <div style={{ ...style.sidePanel, flex: 1 }}>
        <div style={style.sidePanelTitle}>Bookmarks</div>
        {bookmarks.map((b, i) => (
          <div
            key={i}
            style={{ fontSize: 11, color: COLORS.link, marginBottom: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}
            onMouseEnter={() => setHoveredBookmarkIndex(i)}
            onMouseLeave={() => setHoveredBookmarkIndex(null)}
          >
            <span>📌 {b}</span>
            <button
              onClick={() => onRemoveBookmark && onRemoveBookmark(i)}
              style={{
                border: "none",
                background: "transparent",
                color: "#c0392b",
                cursor: "pointer",
                fontSize: 12,
                padding: "0 2px",
                visibility: hoveredBookmarkIndex === i ? "visible" : "hidden",
              }}
              aria-label={`Remove bookmark ${b}`}
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function handleLogin() {
    if (!email || !password) { setErr("Please enter email and password."); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) { setErr("Invalid email format."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setErr("");
    onLogin({ email, role: "Admin", name: "Admin User" });
  }

  return (
    <div style={style.loginWrap}>
      <div style={style.loginHeader}>
        <div style={style.loginTitle}>Smart Revenue Management</div>
        <div style={style.loginNav}>
          {["About", "Blogs", "Privacy", "Terms", "Help", "Contact"].map(l => (
            <span key={l} style={style.loginNavLink}>{l}</span>
          ))}
        </div>
      </div>
      <div style={style.loginBody}>
        {/* Hero */}
        <div style={style.loginHero}>
          <div style={style.loginHeroBg}>
            {/* Finance SVG illustration */}
            <svg viewBox="0 0 500 300" width="90%" height="90%" style={{ opacity: 0.7 }}>
              <defs>
                <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ecdc4" />
                  <stop offset="100%" stopColor="#1e5068" />
                </linearGradient>
              </defs>
              {/* Bars */}
              {[80, 130, 100, 170, 140, 200, 160].map((h, i) => (
                <rect key={i} x={40 + i * 60} y={260 - h} width={36} height={h} fill="url(#barG)" rx={3} opacity={0.85} />
              ))}
              {/* Line chart overlay */}
              <polyline points="58,180 118,130 178,155 238,85 298,110 358,55 418,80" fill="none" stroke="#f0c040" strokeWidth={2.5} strokeLinejoin="round" />
              <polyline points="58,220 118,200 178,210 238,170 298,185 358,155 418,165" fill="none" stroke="#e88" strokeWidth={2} strokeLinejoin="round" strokeDasharray="6,3" />
              {/* Coin stacks hint */}
              <ellipse cx={440} cy={250} rx={25} ry={8} fill="#4ecdc4" opacity={0.5} />
              <rect x={415} y={200} width={50} height={50} rx={4} fill="#1e7090" opacity={0.3} />
            </svg>
          </div>
        </div>
        {/* Card */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={style.loginCard}>
            <div>
              <div style={style.loginFieldLabel}>Email Id</div>
              <input style={style.loginInput} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
            </div>
            <div>
              <div style={style.loginFieldLabel}>Password</div>
              <input style={style.loginInput} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
            </div>
            {err && <div style={{ color: "#c0392b", fontSize: 12 }}>{err}</div>}
            <button style={style.loginBtn} onClick={handleLogin}>Login</button>
            <div style={style.loginLink}>Forgot Password?</div>
          </div>
        </div>
      </div>
      <div style={style.loginFooter}>© 2026, XYZ Corporation Pvt. Ltd. All Rights Reserved.</div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div style={style.contentArea}>
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Customers", val: "124" },
          { label: "Pending Shipments", val: "18" },
          { label: "Outstanding (₹)", val: "12,40,000" },
          { label: "Invoices This Month", val: "47" },
        ].map((s, i) => (
          <div key={i} style={style.statCard}>
            <div style={style.statVal}>{s.val}</div>
            <div style={style.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Recent Quotations */}
      <div style={style.section}>
        <SectionHeader title="Recent Quotations" />
        <table style={style.table}>
          <thead>
            <tr>{["Quotation ID", "Customer", "Origin", "Destination", "Mode", "Amount (₹)", "Status"].map(h => <th key={h} style={style.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {SAMPLE_QUOTATIONS.map(q => (
              <tr key={q.id}>
                <td style={style.td}>{q.id}</td>
                <td style={style.td}>{q.customer}</td>
                <td style={style.td}>{q.origin}</td>
                <td style={style.td}>{q.dest}</td>
                <td style={style.td}>{q.mode}</td>
                <td style={style.td}>₹{q.amount.toLocaleString()}</td>
                <td style={style.td}><span style={q.status === "Approved" ? style.badgeGreen : style.badge}>{q.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Recent Invoices */}
      <div style={style.section}>
        <SectionHeader title="Recent Invoices" />
        <table style={style.table}>
          <thead>
            <tr>{["Invoice ID", "Customer", "Amount (₹)", "GST (₹)", "Total (₹)", "Status", "Due Date"].map(h => <th key={h} style={style.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {SAMPLE_INVOICES.map(inv => (
              <tr key={inv.id}>
                <td style={style.td}>{inv.id}</td>
                <td style={style.td}>{inv.customer}</td>
                <td style={style.td}>₹{inv.amount.toLocaleString()}</td>
                <td style={style.td}>₹{inv.gst.toLocaleString()}</td>
                <td style={style.td}>₹{inv.total.toLocaleString()}</td>
                <td style={style.td}><span style={inv.status === "Paid" ? style.badgeGreen : style.badgeRed}>{inv.status}</span></td>
                <td style={style.td}>{inv.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BusinessRegistrationScreen() {
  const [form, setForm] = useState({ name: "", legalName: "", bizName: "", addr1: "", addr2: "", addr3: "", city: "", district: "", state: "", postal: "", pan: "", gst: "", iec: "", msme: "", phone: "", email: "", website: "", ifsc: "", account: "", bankName: "", branch: "" });
  const [logo, setLogo] = useState(null);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={style.contentArea}>
      {/* Section: Name */}
      <div style={style.section}>
        <SectionHeader title="Name" />
        <Field label="Legal Name" value={form.legalName} onChange={set("legalName")} />
        <Field label="Business Name" value={form.bizName} onChange={set("bizName")} />
      </div>
      {/* Section: Address */}
      <div style={style.section}>
        <SectionHeader title="Address" />
        <div style={{ display: "flex", gap: 30 }}>
          <div>
            <Field label="Address 1" value={form.addr1} onChange={set("addr1")} />
            <Field label="Address 2" value={form.addr2} onChange={set("addr2")} />
            <Field label="Address 3" value={form.addr3} onChange={set("addr3")} />
            <Field label="City" value={form.city} onChange={set("city")} />
            <Field label="District" value={form.district} onChange={set("district")} />
            <div style={style.formRow}>
              <span style={style.label}>State</span>
              <input style={{ ...style.input, width: 220 }} value={form.state} onChange={e => set("state")(e.target.value)} />
              <span style={{ marginLeft: 6, cursor: "pointer", color: COLORS.link }}>🔍</span>
            </div>
            <div style={style.formRow}>
              <span style={style.label}>Postal</span>
              <input style={{ ...style.input, width: 120 }} value={form.postal} onChange={e => set("postal")(e.target.value)} maxLength={6} />
            </div>
          </div>
          {/* Logo upload */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 8 }}>
            <div style={style.uploadBox} onClick={() => document.getElementById("logoUpload").click()}>
              {logo ? <img src={logo} alt="logo" style={{ maxWidth: 160, maxHeight: 120, objectFit: "contain" }} /> : <>
                <span style={style.uploadLabel}>Click to Upload</span>
                <span style={style.uploadSub}>PNG / JPG</span>
              </>}
              <input id="logoUpload" type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) setLogo(URL.createObjectURL(f)); }} />
            </div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Company Logo</div>
          </div>
        </div>
      </div>
      {/* Section: Identity */}
      <div style={style.section}>
        <SectionHeader title="Identity" />
        <Field label="GST Number" value={form.gst} onChange={set("gst")} placeholder="27ABCDE1234F1Z5" />
        <Field label="PAN Number" value={form.pan} onChange={set("pan")} placeholder="ABCDE1234F" />
        <Field label="IEC Code" value={form.iec} onChange={set("iec")} />
        <Field label="MSME Reg." value={form.msme} onChange={set("msme")} />
      </div>
      {/* Section: Contact */}
      <div style={style.section}>
        <SectionHeader title="Contact Details" />
        <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="10-digit number" />
        <Field label="Email" type="email" value={form.email} onChange={set("email")} />
        <Field label="Website" value={form.website} onChange={set("website")} placeholder="https://" />
      </div>
      {/* Section: Bank */}
      <div style={style.section}>
        <SectionHeader title="Bank Details" />
        <Field label="Account Number" value={form.account} onChange={set("account")} />
        <Field label="IFSC Code" value={form.ifsc} onChange={set("ifsc")} placeholder="HDFC0001234" />
        <Field label="Bank Name" value={form.bankName} onChange={set("bankName")} />
        <Field label="Branch" value={form.branch} onChange={set("branch")} />
      </div>
    </div>
  );
}

function CustomerRegistrationScreen() {
  const [step, setStep] = useState(0);
  const steps = ["Company Info", "Address", "Tax", "Contacts", "Financial", "Documents"];
  const [form, setForm] = useState({ companyName: "", bizType: "Pvt Ltd", gst: "", pan: "", addr: "", city: "", state: "", postal: "", credit: "", contacts: [{ name: "", phone: "", email: "" }] });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  function addContact() { setForm(f => ({ ...f, contacts: [...f.contacts, { name: "", phone: "", email: "" }] })); }
  function removeContact(i) { setForm(f => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) })); }
  function setContact(i, k, v) { setForm(f => { const c = [...f.contacts]; c[i] = { ...c[i], [k]: v }; return { ...f, contacts: c }; }); }

  return (
    <div style={style.contentArea}>
      {/* Stepper */}
      <div style={{ display: "flex", gap: 0, marginBottom: 18 }}>
        {steps.map((s, i) => (
          <div key={s} onClick={() => setStep(i)} style={{ padding: "7px 16px", background: i === step ? COLORS.btnBg : "#c8dbe8", color: i === step ? "#fff" : COLORS.text, cursor: "pointer", borderRight: "1px solid #a8c8d8", fontSize: 12, fontWeight: i === step ? 700 : 400 }}>{i + 1}. {s}</div>
        ))}
      </div>
      {step === 0 && (
        <div style={style.section}>
          <SectionHeader title="Company Information" />
          <Field label="Company Name" value={form.companyName} onChange={set("companyName")} />
          <SelectField label="Business Type" value={form.bizType} onChange={set("bizType")} options={["Pvt Ltd", "Ltd", "LLP", "Proprietorship", "Partnership"]} />
        </div>
      )}
      {step === 1 && (
        <div style={style.section}>
          <SectionHeader title="Address" />
          <Field label="Address" value={form.addr} onChange={set("addr")} />
          <Field label="City" value={form.city} onChange={set("city")} />
          <Field label="State" value={form.state} onChange={set("state")} />
          <Field label="Postal Code" value={form.postal} onChange={set("postal")} />
        </div>
      )}
      {step === 2 && (
        <div style={style.section}>
          <SectionHeader title="Tax Details" />
          <Field label="GST Number" value={form.gst} onChange={set("gst")} placeholder="27ABCDE1234F1Z5" />
          <Field label="PAN Number" value={form.pan} onChange={set("pan")} placeholder="ABCDE1234F" />
        </div>
      )}
      {step === 3 && (
        <div style={style.section}>
          <SectionHeader title="Contacts" />
          {form.contacts.map((c, i) => (
            <div key={i} style={{ background: "#f0f7fb", padding: "10px 14px", marginBottom: 10, borderRadius: 3, border: "1px solid #cce0ec" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 12 }}>Contact {i + 1}</span>
                {i > 0 && <button onClick={() => removeContact(i)} style={{ ...style.btn, background: "#c0392b", fontSize: 11 }}>Remove</button>}
              </div>
              <Field label="Name" value={c.name} onChange={v => setContact(i, "name", v)} />
              <Field label="Phone" value={c.phone} onChange={v => setContact(i, "phone", v)} />
              <Field label="Email" value={c.email} onChange={v => setContact(i, "email", v)} />
            </div>
          ))}
          <button style={{ ...style.btn, fontSize: 12 }} onClick={addContact}>+ Add Contact</button>
        </div>
      )}
      {step === 4 && (
        <div style={style.section}>
          <SectionHeader title="Financial Details" />
          <Field label="Credit Limit (₹)" value={form.credit} onChange={set("credit")} placeholder="e.g. 100000" />
          <SelectField label="Payment Terms" value="30 Days" options={["Immediate", "15 Days", "30 Days", "45 Days", "60 Days"]} />
        </div>
      )}
      {step === 5 && (
        <div style={style.section}>
          <SectionHeader title="Documents" />
          {["GST Certificate", "PAN Card", "MSME Certificate", "Bank Statement"].map(doc => (
            <div key={doc} style={{ ...style.formRow, marginBottom: 10 }}>
              <span style={style.label}>{doc}</span>
              <button style={{ ...style.btn, fontSize: 11 }}>Upload</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {step > 0 && <button style={style.btn} onClick={() => setStep(s => s - 1)}>← Previous</button>}
        {step < steps.length - 1 && <button style={style.btn} onClick={() => setStep(s => s + 1)}>Next →</button>}
        {step === steps.length - 1 && <button style={{ ...style.btn, background: "#2e8a5a" }}>✓ Save Customer</button>}
      </div>
    </div>
  );
}

function QuotationScreen() {
  const [charges, setCharges] = useState([{ type: "Freight", amount: 20000 }, { type: "Handling", amount: 5000 }]);
  const [gstPct, setGstPct] = useState(18);
  const [customer, setCustomer] = useState("XYZ Logistics Pvt Ltd");
  const [origin, setOrigin] = useState("Mumbai");
  const [dest, setDest] = useState("Dubai");
  const [mode, setMode] = useState("Sea");
  const [commodity, setCommodity] = useState("Electronics");
  const [weight, setWeight] = useState("1000");

  const subtotal = charges.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const gstAmt = Math.round(subtotal * gstPct / 100);
  const total = subtotal + gstAmt;

  function addCharge() { setCharges(c => [...c, { type: "", amount: 0 }]); }
  function removeCharge(i) { setCharges(c => c.filter((_, idx) => idx !== i)); }
  function setCharge(i, k, v) { setCharges(c => { const n = [...c]; n[i] = { ...n[i], [k]: v }; return n; }); }

  return (
    <div style={style.contentArea}>
      <div style={style.section}>
        <SectionHeader title="Customer & Shipment Details" />
        <div style={{ display: "flex", gap: 40 }}>
          <div>
            <Field label="Customer" value={customer} onChange={setCustomer} />
            <Field label="Origin" value={origin} onChange={setOrigin} />
            <Field label="Destination" value={dest} onChange={setDest} />
            <SelectField label="Mode" value={mode} onChange={setMode} options={["Sea", "Air", "Road", "Rail"]} />
          </div>
          <div>
            <Field label="Commodity" value={commodity} onChange={setCommodity} />
            <Field label="Weight (kg)" value={weight} onChange={setWeight} />
            <div style={style.formRow}>
              <span style={style.label}>GST %</span>
              <input style={{ ...style.input, width: 80 }} value={gstPct} onChange={e => setGstPct(e.target.value)} type="number" />
            </div>
          </div>
        </div>
      </div>
      <div style={style.section}>
        <SectionHeader title="Charges" />
        <table style={style.chargesTable}>
          <thead>
            <tr>
              <th style={style.chargesTh}>Charge Type</th>
              <th style={style.chargesTh}>Amount (₹)</th>
              <th style={style.chargesTh}>Action</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((c, i) => (
              <tr key={i}>
                <td style={style.chargesTd}><input style={{ ...style.input, width: 200 }} value={c.type} onChange={e => setCharge(i, "type", e.target.value)} /></td>
                <td style={style.chargesTd}><input style={{ ...style.input, width: 140 }} type="number" value={c.amount} onChange={e => setCharge(i, "amount", e.target.value)} /></td>
                <td style={style.chargesTd}><button style={{ ...style.btn, background: "#c0392b", fontSize: 11 }} onClick={() => removeCharge(i)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button style={{ ...style.btn, marginTop: 8, fontSize: 12 }} onClick={addCharge}>+ Add Charge</button>
      </div>
      {/* Totals */}
      <div style={{ background: "#f0f7fb", border: "1px solid #c0dcea", borderRadius: 4, padding: "14px 20px", maxWidth: 360, marginLeft: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12 }}>Subtotal</span><span style={{ fontSize: 12 }}>₹{subtotal.toLocaleString()}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12 }}>GST ({gstPct}%)</span><span style={{ fontSize: 12 }}>₹{gstAmt.toLocaleString()}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #aac", paddingTop: 8 }}><span style={{ fontSize: 14, fontWeight: 700 }}>Total</span><span style={{ fontSize: 14, fontWeight: 700, color: COLORS.btnBg }}>₹{total.toLocaleString()}</span></div>
      </div>
    </div>
  );
}

function InvoiceScreen() {
  return (
    <div style={style.contentArea}>
      <div style={style.section}>
        <SectionHeader title="Invoice List" />
        <table style={style.table}>
          <thead>
            <tr>{["Invoice ID", "Customer", "Amount (₹)", "GST (₹)", "Total (₹)", "Status", "Due Date", "Action"].map(h => <th key={h} style={style.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {SAMPLE_INVOICES.map(inv => (
              <tr key={inv.id}>
                <td style={style.td}>{inv.id}</td>
                <td style={style.td}>{inv.customer}</td>
                <td style={style.td}>₹{inv.amount.toLocaleString()}</td>
                <td style={style.td}>₹{inv.gst.toLocaleString()}</td>
                <td style={style.td}>₹{inv.total.toLocaleString()}</td>
                <td style={style.td}><span style={inv.status === "Paid" ? style.badgeGreen : style.badgeRed}>{inv.status}</span></td>
                <td style={style.td}>{inv.due}</td>
                <td style={style.td}><button style={{ ...style.btn, fontSize: 11 }}>Download PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={style.section}>
        <SectionHeader title="Payments Received" />
        <table style={style.table}>
          <thead>
            <tr>{["Payment ID", "Invoice", "Customer", "Amount (₹)", "Method", "Reference", "Date", "Status"].map(h => <th key={h} style={style.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {SAMPLE_PAYMENTS.map(p => (
              <tr key={p.id}>
                <td style={style.td}>{p.id}</td>
                <td style={style.td}>{p.invoice}</td>
                <td style={style.td}>{p.customer}</td>
                <td style={style.td}>₹{p.amount.toLocaleString()}</td>
                <td style={style.td}>{p.method}</td>
                <td style={style.td}>{p.ref}</td>
                <td style={style.td}>{p.date}</td>
                <td style={style.td}><span style={style.badgeGreen}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Record payment form */}
      <div style={style.section}>
        <SectionHeader title="Record New Payment" />
        <Field label="Customer" value="" placeholder="Select customer" />
        <Field label="Invoice ID" value="" placeholder="Select invoice" />
        <Field label="Amount (₹)" value="" placeholder="Payment amount" />
        <SelectField label="Payment Method" value="NEFT" options={["NEFT", "RTGS", "UPI", "Cheque", "Cash"]} />
        <Field label="Reference Number" value="" placeholder="Transaction reference" />
        <button style={{ ...style.btn, marginTop: 8, background: "#2e8a5a" }}>✓ Record Payment</button>
      </div>
    </div>
  );
}

function UsersSearchScreen({ onAdd }) {
  const [uname, setUname] = useState("");
  const [email, setEmail] = useState("");
  const [empNo, setEmpNo] = useState("");
  const [group, setGroup] = useState("All");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  function handleSearch() {
    setSearched(true);
    setResults(SAMPLE_USERS.filter(u =>
      (!uname || u.name.toLowerCase().includes(uname.toLowerCase())) &&
      (!email || u.email.toLowerCase().includes(email.toLowerCase())) &&
      (!empNo || u.empNo.includes(empNo))
    ));
  }

  return (
    <div style={style.contentArea}>
      <div style={{ background: "#f0f5f8", border: "1px solid #c8dbe8", borderRadius: 3, padding: "14px 18px", marginBottom: 14 }}>
        <Field label="User Name" value={uname} onChange={setUname} />
        <Field label="Email Id" value={email} onChange={setEmail} />
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={style.formRow}>
            <span style={style.label}>Employee Number</span>
            <input style={{ ...style.input, width: 160 }} value={empNo} onChange={e => setEmpNo(e.target.value)} />
          </div>
          <div style={style.formRow}>
            <span style={{ ...style.label, width: 90 }}>User Groups</span>
            <select style={{ ...style.select, width: 160 }} value={group} onChange={e => setGroup(e.target.value)}>
              {["All", "Sales & Marketing", "Finance", "Operations"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <button style={style.btn} onClick={handleSearch}>Search</button>
        </div>
      </div>
      <table style={style.table}>
        <thead><tr>{["User Name", "Email Id", "Employee Number", "Status"].map(h => <th key={h} style={style.th}>{h}</th>)}</tr></thead>
        <tbody>
          {searched && results.length === 0 && <tr><td colSpan={4} style={{ ...style.td, color: "#999" }}>No results found.</td></tr>}
          {results.map(u => (
            <tr key={u.id} style={{ cursor: "pointer" }}>
              <td style={style.td}>{u.name}</td>
              <td style={style.td}>{u.email}</td>
              <td style={style.td}>{u.empNo}</td>
              <td style={style.td}><span style={u.status === "Active" ? style.badgeGreen : style.badgeRed}>{u.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersAddScreen() {
  const [form, setForm] = useState({ name: "", email: "", empNo: "", phone: "", status: "Active", homepage: "Quotation", gender: "Male" });
  const [groups, setGroups] = useState([{ group: "Sales & Marketing" }]);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={style.contentArea}>
      <div style={style.section}>
        <SectionHeader title="User Details" />
        <div style={{ display: "flex", gap: 40 }}>
          <div>
            <Field label="User Name" value={form.name} onChange={set("name")} />
            <Field label="Email Id" value={form.email} onChange={set("email")} />
            <Field label="Employee Number" value={form.empNo} onChange={set("empNo")} width={160} />
            <Field label="Phone Number" value={form.phone} onChange={set("phone")} width={160} />
            <SelectField label="User Status" value={form.status} onChange={set("status")} options={["Active", "Inactive"]} width={140} />
          </div>
          <div>
            <div style={style.formRow}>
              <span style={style.label}>Homepage</span>
              <input style={{ ...style.input, width: 160 }} value={form.homepage} onChange={e => set("homepage")(e.target.value)} />
              <span style={{ marginLeft: 6, cursor: "pointer" }}>🔍</span>
            </div>
            <SelectField label="Gender" value={form.gender} onChange={set("gender")} options={["Male", "Female", "Other"]} width={140} />
          </div>
        </div>
      </div>
      <div style={style.section}>
        <SectionHeader title="Access Details – User Groups" />
        {groups.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ color: "#2e8a5a", cursor: "pointer", fontSize: 18 }} onClick={() => setGroups(gs => [...gs, { group: "Sales & Marketing" }])}>+</span>
            <span style={{ color: "#c0392b", cursor: "pointer", fontSize: 16 }} onClick={() => setGroups(gs => gs.filter((_, idx) => idx !== i))}>🗑</span>
            <select style={style.select} value={g.group} onChange={e => setGroups(gs => { const n = [...gs]; n[i] = { group: e.target.value }; return n; })}>
              {["Sales & Marketing", "Finance", "Operations", "Admin"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserGroupSearchScreen() {
  const [ugName, setUgName] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("Active");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  function handleSearch() {
    setSearched(true);
    setResults(SAMPLE_GROUPS.filter(g =>
      (!ugName || g.code.toLowerCase().includes(ugName.toLowerCase()) || g.desc.toLowerCase().includes(ugName.toLowerCase())) &&
      (!desc || g.desc.toLowerCase().includes(desc.toLowerCase())) &&
      (status === "All" || g.status === status)
    ));
  }

  return (
    <div style={style.contentArea}>
      <div style={{ background: "#f0f5f8", border: "1px solid #c8dbe8", borderRadius: 3, padding: "14px 18px", marginBottom: 14 }}>
        <Field label="User Group" value={ugName} onChange={setUgName} />
        <Field label="Description" value={desc} onChange={setDesc} />
        <SelectField label="Status" value={status} onChange={setStatus} options={["Active", "Inactive", "All"]} width={140} />
        <div style={{ textAlign: "center", marginTop: 6 }}><button style={style.btn} onClick={handleSearch}>Search</button></div>
      </div>
      <table style={style.table}>
        <thead><tr>{["User Group", "Description", "Status", "Total Users"].map(h => <th key={h} style={style.th}>{h}</th>)}</tr></thead>
        <tbody>
          {searched && results.length === 0 && <tr><td colSpan={4} style={{ ...style.td, color: "#999" }}>No results found.</td></tr>}
          {results.map(g => (
            <tr key={g.id}>
              <td style={style.td}>{g.desc}</td>
              <td style={style.td}>{g.code}</td>
              <td style={style.td}><span style={g.status === "Active" ? style.badgeGreen : style.badgeRed}>{g.status}</span></td>
              <td style={style.td}>{g.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserGroupAddScreen() {
  const [form, setForm] = useState({ code: "", desc: "", status: "Active" });
  const [screens, setScreens] = useState([{ screen: "Quotation", read: true, add: true, del: true }]);
  const [users, setUsers] = useState([{ user: "ABC, DEF" }]);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={style.contentArea}>
      <div style={style.section}>
        <SectionHeader title="User Group Details" />
        <Field label="User Group Code" value={form.code} onChange={set("code")} />
        <Field label="Description" value={form.desc} onChange={set("desc")} />
        <SelectField label="User Group Status" value={form.status} onChange={set("status")} options={["Active", "Inactive"]} width={140} />
      </div>
      <div style={style.section}>
        <SectionHeader title="Access Details – Screens" />
        {screens.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ color: "#2e8a5a", cursor: "pointer", fontSize: 18 }} onClick={() => setScreens(ss => [...ss, { screen: "Quotation", read: true, add: false, del: false }])}>+</span>
            <span style={{ color: "#c0392b", cursor: "pointer" }} onClick={() => setScreens(ss => ss.filter((_, idx) => idx !== i))}>🗑</span>
            <select style={{ ...style.select, width: 160 }} value={s.screen} onChange={e => setScreens(ss => { const n = [...ss]; n[i] = { ...n[i], screen: e.target.value }; return n; })}>
              {["Quotation", "Invoice", "Payment", "Customer", "Reports", "Business Registration"].map(o => <option key={o}>{o}</option>)}
            </select>
            {[["Read", "read"], ["Add", "add"], ["Delete", "del"]].map(([label, key]) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <input type="checkbox" checked={s[key]} onChange={e => setScreens(ss => { const n = [...ss]; n[i] = { ...n[i], [key]: e.target.checked }; return n; })} />
                {label}
              </label>
            ))}
          </div>
        ))}
      </div>
      <div style={style.section}>
        <SectionHeader title="User Group – Users" />
        {users.map((u, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ color: "#2e8a5a", cursor: "pointer", fontSize: 18 }} onClick={() => setUsers(us => [...us, { user: "" }])}>+</span>
            <span style={{ color: "#c0392b", cursor: "pointer" }} onClick={() => setUsers(us => us.filter((_, idx) => idx !== i))}>🗑</span>
            <select style={style.select} value={u.user} onChange={e => setUsers(us => { const n = [...us]; n[i] = { user: e.target.value }; return n; })}>
              {SAMPLE_USERS.map(su => <option key={su.id}>{su.name}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { label: "Customer Registration", screen: "customer-reg" },
  { label: "Pricing", screen: "pricing" },
  { label: "Quotation", screen: "quotation" },
  { label: "Billing", screen: "invoice" },
  { label: "Delinquency", screen: "delinquency" },
  { label: "Payments", screen: "invoice" },
  { label: "Tasks", screen: "dashboard" },
  { label: "Reports", screen: "reports" },
  { label: "Accounting", screen: "accounting" },
  { label: "Business Registration", screen: "business-reg" },
];

const ADMIN_ITEMS = [
  { label: "Approval Profile", screen: "admin" },
  { label: "Adjustment Type", screen: "admin" },
  { label: "Bill Message", screen: "admin" },
  { label: "Charge Type", screen: "admin" },
  { label: "Country", screen: "admin" },
  { label: "Currency", screen: "admin" },
  { label: "Customer Type", screen: "admin" },
  { label: "Calender", screen: "admin" },
  { label: "Letter Template", screen: "admin" },
  { label: "Tax Type", screen: "admin" },
  { label: "Users", screen: "users-search" },
  { label: "User Group", screen: "usergroup-search" },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState(["Business Registration", "Quotation"]);

  if (!user) return <LoginScreen onLogin={u => { setUser(u); setScreen("dashboard"); }} />;

  const SCREEN_TITLES = {
    "dashboard": "Home",
    "business-reg": "Business Registration",
    "customer-reg": "Customer Registration",
    "quotation": "Quotation",
    "invoice": "Billing / Invoice & Payments",
    "users-search": "Users",
    "users-add": "Users – Add",
    "usergroup-search": "User Group",
    "usergroup-add": "User Group – Add",
    "admin": "Admin",
    "reports": "Reports",
  };

  const title = SCREEN_TITLES[screen] || screen;

  const pageActions = {
    "dashboard": [],
    "business-reg": [
      { label: "Bookmark", onClick: () => { if (!bookmarks.includes("Business Registration")) setBookmarks(b => [...b, "Business Registration"]); } },
      { label: "Clear", onClick: () => {} },
      { label: "Save", onClick: () => alert("Saved!") },
      { label: "Refresh", onClick: () => {} },
    ],
    "customer-reg": [
      { label: "Bookmark", onClick: () => {} },
      { label: "Clear", onClick: () => {} },
      { label: "Save", onClick: () => alert("Saved!") },
      { label: "Refresh", onClick: () => {} },
    ],
    "quotation": [
      { label: "Bookmark", onClick: () => {} },
      { label: "Clear", onClick: () => {} },
      { label: "Save", onClick: () => alert("Quotation saved!") },
      { label: "Refresh", onClick: () => {} },
    ],
    "invoice": [
      { label: "Bookmark", onClick: () => {} },
      { label: "Refresh", onClick: () => {} },
    ],
    "users-search": [
      { label: "Bookmark", onClick: () => {} },
      { label: "Clear", onClick: () => {} },
      { label: "Add", onClick: () => setScreen("users-add") },
      { label: "Refresh", onClick: () => {} },
    ],
    "users-add": [
      { label: "Bookmark", onClick: () => {} },
      { label: "Clear", onClick: () => {} },
      { label: "Save", onClick: () => alert("User saved!") },
      { label: "Refresh", onClick: () => {} },
    ],
    "usergroup-search": [
      { label: "Bookmark", onClick: () => {} },
      { label: "Clear", onClick: () => {} },
      { label: "Add", onClick: () => setScreen("usergroup-add") },
      { label: "Refresh", onClick: () => {} },
    ],
    "usergroup-add": [
      { label: "Bookmark", onClick: () => {} },
      { label: "Clear", onClick: () => {} },
      { label: "Save", onClick: () => alert("Group saved!") },
      { label: "Refresh", onClick: () => {} },
    ],
  };

  function navigate(s) {
    setScreen(s);
    setMenuOpen(false);
    setAdminOpen(false);
  }

  function removeBookmark(indexToRemove) {
    setBookmarks((currentBookmarks) => currentBookmarks.filter((_, i) => i !== indexToRemove));
  }

  return (
    <div style={style.app}>
      {/* TOP HEADER */}
      <div style={style.header}>
        <span style={style.headerTitle} onClick={() => navigate("dashboard")}>Smart Revenue Management</span>
        <div style={style.headerRight}>
          <span style={style.headerLink}>About</span>
          <span style={style.headerLink}>Help</span>
          <span style={style.headerUser}>👤 {user.name} ⏻</span>
        </div>
      </div>

      {/* SUB-NAV */}
      <div style={style.subNav}>
        <span style={style.navItem} onClick={() => navigate("dashboard")}>Home</span>
        <span style={style.navItem} onClick={() => { setMenuOpen(o => !o); setAdminOpen(false); }}>
          Menu {menuOpen ? "▼" : "▶"}
        </span>
        <span style={style.navItem} onClick={() => { setAdminOpen(o => !o); setMenuOpen(false); }}>
          Admin {adminOpen ? "▼" : "▶"}
        </span>
        {/* Menu dropdown */}
        {menuOpen && (
          <div style={{ ...style.dropdown, left: 80 }}>
            {MENU_ITEMS.map(item => (
              <div key={item.label} style={style.dropdownItem}
                onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.target.style.background = ""}
                onClick={() => navigate(item.screen)}>
                {item.label}
              </div>
            ))}
          </div>
        )}
        {/* Admin dropdown */}
        {adminOpen && (
          <div style={{ ...style.dropdown, left: 180 }}>
            {ADMIN_ITEMS.map(item => (
              <div key={item.label} style={style.dropdownItem}
                onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.target.style.background = ""}
                onClick={() => navigate(item.screen)}>
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN LAYOUT */}
      <div style={style.mainLayout} onClick={() => { if (menuOpen || adminOpen) { setMenuOpen(false); setAdminOpen(false); } }}>
        <div style={style.content}>
          <PageBar title={title} actions={pageActions[screen] || []} />
          {screen === "dashboard" && <DashboardScreen />}
          {screen === "business-reg" && <BusinessRegistrationScreen />}
          {screen === "customer-reg" && <CustomerRegistrationScreen />}
          {screen === "quotation" && <QuotationScreen />}
          {screen === "invoice" && <InvoiceScreen />}
          {screen === "users-search" && <UsersSearchScreen onAdd={() => navigate("users-add")} />}
          {screen === "users-add" && <UsersAddScreen />}
          {screen === "usergroup-search" && <UserGroupSearchScreen />}
          {screen === "usergroup-add" && <UserGroupAddScreen />}
          {(screen === "admin" || screen === "reports" || screen === "pricing" || screen === "delinquency" || screen === "accounting") && (
            <div style={{ padding: 30, color: "#888" }}>🚧 {title} — Coming Soon</div>
          )}
        </div>
        <Sidebar bookmarks={bookmarks} onRemoveBookmark={removeBookmark} />
      </div>
    </div>
  );
}
