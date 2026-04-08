import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useReducer, useRef, useState } from "react";
import { COLORS } from "./theme.js";
import { canAccessAdminMenu, filterMenuItems } from "./auth/rbac.js";
import { fetchDashboard } from "./api/dashboardApi.js";
import { fetchShipmentsForTasks } from "./api/listsApi.js";
import { SrmLayout } from "./components/srm/SrmLayout.jsx";
import { srmStyle as style } from "./components/srm/srmStyles.js";
import { Field, SectionHeader, SelectField } from "./components/srm/formPrimitives.jsx";
import { buildAlertsFromKpi, shipmentTasksFromList } from "./components/srm/buildShellInsights.js";
import { loadBookmarksFromStorage, saveBookmarksToStorage } from "./components/srm/bookmarksStorage.js";
import {
  createUser, listUserGroups, listUsers, listScreens,
  createGroup, updateGroup, getGroup, getMyPermissions,
} from "./api/usersApi.js";
import { DashboardScreen } from "./components/srm/screens/DashboardScreen.jsx";
import { BusinessRegistrationScreen } from "./components/srm/screens/BusinessRegistrationScreen.jsx";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatApiError(err) {
  if (!err || typeof err !== "object") return "Request failed.";
  const payload = err.errors !== undefined ? err.errors : err;
  if (typeof payload === "string") return payload;
  if (typeof payload.detail === "string") return payload.detail;
  const parts = [];
  for (const [k, v] of Object.entries(payload)) {
    if (k === "detail") continue;
    if (Array.isArray(v) && v.length) parts.push(`${k}: ${v[0]}`);
    else if (typeof v === "string" && v) parts.push(`${k}: ${v}`);
  }
  return parts.length ? parts.join("; ") : "Request failed.";
}

// ── Sample data for screens not yet API-backed ──────────────────────────────

const SAMPLE_INVOICES = [
  { id: "INV-9001", customer: "XYZ Logistics", amount: 59000, gst: 10620, total: 69620, status: "Unpaid", due: "2026-04-15" },
  { id: "INV-9002", customer: "Global Trade", amount: 120000, gst: 21600, total: 141600, status: "Paid", due: "2026-03-30" },
];
const SAMPLE_PAYMENTS = [
  { id: "PAY-001", invoice: "INV-9002", customer: "Global Trade", amount: 141600, method: "NEFT", ref: "TXN98765", date: "2026-03-25", status: "Cleared" },
];

// ── Legacy screens (Customer Registration, Quotation, Invoice) ──────────────

function CustomerRegistrationScreen() {
  const [step, setStep] = useState(0);
  const steps = ["Company Info", "Address", "Tax", "Contacts", "Financial", "Documents"];
  const [form, setForm] = useState({
    companyName: "", bizType: "Pvt Ltd", gst: "", pan: "", addr: "", city: "", state: "", postal: "", credit: "",
    contacts: [{ name: "", phone: "", email: "" }],
  });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  function addContact() { setForm(f => ({ ...f, contacts: [...f.contacts, { name: "", phone: "", email: "" }] })); }
  function removeContact(i) { setForm(f => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) })); }
  function setContact(i, k, v) {
    setForm(f => { const c = [...f.contacts]; c[i] = { ...c[i], [k]: v }; return { ...f, contacts: c }; });
  }
  return (
    <div style={style.contentArea}>
      <div style={{ display: "flex", gap: 0, marginBottom: 18 }}>
        {steps.map((s, i) => (
          <div key={s} onClick={() => setStep(i)} style={{ padding: "7px 16px", background: i === step ? COLORS.btnBg : "#c8dbe8", color: i === step ? "#fff" : COLORS.text, cursor: "pointer", borderRight: "1px solid #a8c8d8", fontSize: 12, fontWeight: i === step ? 700 : 400 }}>
            {i + 1}. {s}
          </div>
        ))}
      </div>
      {step === 0 && (<div style={style.section}><SectionHeader title="Company Information" /><Field label="Company Name" value={form.companyName} onChange={set("companyName")} /><SelectField label="Business Type" value={form.bizType} onChange={set("bizType")} options={["Pvt Ltd", "Ltd", "LLP", "Proprietorship", "Partnership"]} /></div>)}
      {step === 1 && (<div style={style.section}><SectionHeader title="Address" /><Field label="Address" value={form.addr} onChange={set("addr")} /><Field label="City" value={form.city} onChange={set("city")} /><Field label="State" value={form.state} onChange={set("state")} /><Field label="Postal Code" value={form.postal} onChange={set("postal")} /></div>)}
      {step === 2 && (<div style={style.section}><SectionHeader title="Tax Details" /><Field label="GST Number" value={form.gst} onChange={set("gst")} placeholder="27ABCDE1234F1Z5" /><Field label="PAN Number" value={form.pan} onChange={set("pan")} placeholder="ABCDE1234F" /></div>)}
      {step === 3 && (<div style={style.section}><SectionHeader title="Contacts" />{form.contacts.map((c, i) => (<div key={i} style={{ background: "#f0f7fb", padding: "10px 14px", marginBottom: 10, borderRadius: 3, border: "1px solid #cce0ec" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontWeight: 600, fontSize: 12 }}>Contact {i + 1}</span>{i > 0 && (<button type="button" onClick={() => removeContact(i)} style={{ ...style.btn, background: "#c0392b", fontSize: 11 }}>Remove</button>)}</div><Field label="Name" value={c.name} onChange={v => setContact(i, "name", v)} /><Field label="Phone" value={c.phone} onChange={v => setContact(i, "phone", v)} /><Field label="Email" value={c.email} onChange={v => setContact(i, "email", v)} /></div>))}<button type="button" style={{ ...style.btn, fontSize: 12 }} onClick={addContact}>+ Add Contact</button></div>)}
      {step === 4 && (<div style={style.section}><SectionHeader title="Financial Details" /><Field label="Credit Limit" value={form.credit} onChange={set("credit")} placeholder="e.g. 100000" /><SelectField label="Payment Terms" value="30 Days" onChange={() => {}} options={["Immediate", "15 Days", "30 Days", "45 Days", "60 Days"]} /></div>)}
      {step === 5 && (<div style={style.section}><SectionHeader title="Documents" />{["GST Certificate", "PAN Card", "MSME Certificate", "Bank Statement"].map(doc => (<div key={doc} style={{ ...style.formRow, marginBottom: 10 }}><span style={style.label}>{doc}</span><button type="button" style={{ ...style.btn, fontSize: 11 }}>Upload</button></div>))}</div>)}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {step > 0 && <button type="button" style={style.btn} onClick={() => setStep(s => s - 1)}>Previous</button>}
        {step < steps.length - 1 && <button type="button" style={style.btn} onClick={() => setStep(s => s + 1)}>Next</button>}
        {step === steps.length - 1 && <button type="button" style={{ ...style.btn, background: "#2e8a5a" }}>Save Customer</button>}
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
  const gstAmt = Math.round((subtotal * gstPct) / 100);
  const total = subtotal + gstAmt;
  function addCharge() { setCharges(c => [...c, { type: "", amount: 0 }]); }
  function removeCharge(i) { setCharges(c => c.filter((_, idx) => idx !== i)); }
  function setCharge(i, k, v) { setCharges(c => { const n = [...c]; n[i] = { ...n[i], [k]: v }; return n; }); }
  return (
    <div style={style.contentArea}>
      <div style={style.section}>
        <SectionHeader title="Customer & Shipment Details" />
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div><Field label="Customer" value={customer} onChange={setCustomer} /><Field label="Origin" value={origin} onChange={setOrigin} /><Field label="Destination" value={dest} onChange={setDest} /><SelectField label="Mode" value={mode} onChange={setMode} options={["Sea", "Air", "Road", "Rail"]} /></div>
          <div><Field label="Commodity" value={commodity} onChange={setCommodity} /><Field label="Weight (kg)" value={weight} onChange={setWeight} /><div style={style.formRow}><span style={style.label}>GST %</span><input style={{ ...style.input, width: 80 }} value={gstPct} onChange={e => setGstPct(Number(e.target.value))} type="number" /></div></div>
        </div>
      </div>
      <div style={style.section}>
        <SectionHeader title="Charges" />
        <table style={style.chargesTable}><thead><tr><th style={style.chargesTh}>Charge Type</th><th style={style.chargesTh}>Amount</th><th style={style.chargesTh}>Action</th></tr></thead><tbody>{charges.map((c, i) => (<tr key={i}><td style={style.chargesTd}><input style={{ ...style.input, width: 200 }} value={c.type} onChange={e => setCharge(i, "type", e.target.value)} /></td><td style={style.chargesTd}><input style={{ ...style.input, width: 140 }} type="number" value={c.amount} onChange={e => setCharge(i, "amount", e.target.value)} /></td><td style={style.chargesTd}><button type="button" style={{ ...style.btn, background: "#c0392b", fontSize: 11 }} onClick={() => removeCharge(i)}>Remove</button></td></tr>))}</tbody></table>
        <button type="button" style={{ ...style.btn, marginTop: 8, fontSize: 12 }} onClick={addCharge}>+ Add Charge</button>
      </div>
      <div style={{ background: "#f0f7fb", border: "1px solid #c0dcea", borderRadius: 4, padding: "14px 20px", maxWidth: 360, marginLeft: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12 }}>Subtotal</span><span style={{ fontSize: 12 }}>{subtotal.toLocaleString()}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12 }}>GST ({gstPct}%)</span><span style={{ fontSize: 12 }}>{gstAmt.toLocaleString()}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #aac", paddingTop: 8 }}><span style={{ fontSize: 14, fontWeight: 700 }}>Total</span><span style={{ fontSize: 14, fontWeight: 700, color: COLORS.btnBg }}>{total.toLocaleString()}</span></div>
      </div>
    </div>
  );
}

function InvoiceScreen() {
  return (
    <div style={style.contentArea}>
      <div style={style.section}>
        <SectionHeader title="Invoice List" />
        <table style={style.table}><thead><tr>{["Invoice ID", "Customer", "Amount", "GST", "Total", "Status", "Due Date", "Action"].map(h => <th key={h} style={style.th}>{h}</th>)}</tr></thead><tbody>{SAMPLE_INVOICES.map(inv => (<tr key={inv.id}><td style={style.td}>{inv.id}</td><td style={style.td}>{inv.customer}</td><td style={style.td}>{inv.amount.toLocaleString()}</td><td style={style.td}>{inv.gst.toLocaleString()}</td><td style={style.td}>{inv.total.toLocaleString()}</td><td style={style.td}><span style={inv.status === "Paid" ? style.badgeGreen : style.badgeRed}>{inv.status}</span></td><td style={style.td}>{inv.due}</td><td style={style.td}><button type="button" style={{ ...style.btn, fontSize: 11 }}>Download PDF</button></td></tr>))}</tbody></table>
      </div>
      <div style={style.section}>
        <SectionHeader title="Payments Received" />
        <table style={style.table}><thead><tr>{["Payment ID", "Invoice", "Customer", "Amount", "Method", "Reference", "Date", "Status"].map(h => <th key={h} style={style.th}>{h}</th>)}</tr></thead><tbody>{SAMPLE_PAYMENTS.map(p => (<tr key={p.id}><td style={style.td}>{p.id}</td><td style={style.td}>{p.invoice}</td><td style={style.td}>{p.customer}</td><td style={style.td}>{p.amount.toLocaleString()}</td><td style={style.td}>{p.method}</td><td style={style.td}>{p.ref}</td><td style={style.td}>{p.date}</td><td style={style.td}><span style={style.badgeGreen}>{p.status}</span></td></tr>))}</tbody></table>
      </div>
      <div style={style.section}>
        <SectionHeader title="Record New Payment" />
        <Field label="Customer" value="" placeholder="Select customer" />
        <Field label="Invoice ID" value="" placeholder="Select invoice" />
        <Field label="Amount" value="" placeholder="Payment amount" />
        <SelectField label="Payment Method" value="NEFT" onChange={() => {}} options={["NEFT", "RTGS", "UPI", "Cheque", "Cash"]} />
        <Field label="Reference Number" value="" placeholder="Transaction reference" />
        <button type="button" style={{ ...style.btn, marginTop: 8, background: "#2e8a5a" }}>Record Payment</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RBAC-enabled screens
// ═══════════════════════════════════════════════════════════════════════════════

// ── Users – Search ───────────────────────────────────────────────────────────
function UsersSearchScreen() {
  const [uname, setUname] = useState("");
  const [email, setEmail] = useState("");
  const [empNo, setEmpNo] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [groupRows, setGroupRows] = useState([]);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let c = false;
    (async () => { const r = await listUserGroups(); if (!c && r.ok) setGroupRows(r.groups); })();
    return () => { c = true; };
  }, []);

  async function handleSearch() {
    setSearched(true);
    setSearching(true);
    const term = [uname, email, empNo].map(s => (s || "").trim()).find(Boolean) || "";
    const params = { search: term || undefined, pageSize: 200 };
    if (groupFilter !== "all") params.group = groupFilter;
    const res = await listUsers(params);
    let rows = [];
    if (res.ok) {
      rows = res.results.map(u => ({
        id: u.id, name: u.name, email: u.email,
        empNo: u.employee_id ?? "",
        status: u.is_active ? "Active" : "Inactive",
        groups: u.group_names?.join(", ") || "—",
      }));
      if (uname.trim()) rows = rows.filter(u => u.name.toLowerCase().includes(uname.trim().toLowerCase()));
      if (email.trim()) rows = rows.filter(u => u.email.toLowerCase().includes(email.trim().toLowerCase()));
      if (empNo.trim()) rows = rows.filter(u => String(u.empNo).includes(empNo.trim()));
    }
    setResults(rows);
    setSearching(false);
    if (!res.ok) alert(formatApiError(res.error));
  }

  const groupSelectOptions = [{ value: "all", label: "All" }, ...groupRows.map(g => ({ value: String(g.id), label: g.name }))];

  return (
    <div style={style.contentArea}>
      <div style={{ background: "#f0f5f8", border: "1px solid #c8dbe8", borderRadius: 3, padding: "14px 18px", marginBottom: 14 }}>
        <Field label="User Name" value={uname} onChange={setUname} />
        <Field label="Email Id" value={email} onChange={setEmail} />
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={style.formRow}>
            <span style={style.label}>Employee Number</span>
            <input style={{ ...style.input, width: 160 }} value={empNo} onChange={e => setEmpNo(e.target.value)} />
          </div>
          <div style={style.formRow}>
            <span style={{ ...style.label, width: 90 }}>User Groups</span>
            <select style={{ ...style.select, width: 180 }} value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
              {groupSelectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <button type="button" style={style.btn} onClick={handleSearch} disabled={searching}>
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
      </div>
      <table style={style.table}>
        <thead><tr>{["User Name", "Email Id", "Employee Number", "Groups", "Status"].map(h => <th key={h} style={style.th}>{h}</th>)}</tr></thead>
        <tbody>
          {searched && results.length === 0 && <tr><td colSpan={5} style={{ ...style.td, color: "#999" }}>No results found.</td></tr>}
          {results.map(u => (
            <tr key={u.id} style={{ cursor: "pointer" }}>
              <td style={style.td}>{u.name}</td>
              <td style={style.td}>{u.email}</td>
              <td style={style.td}>{u.empNo}</td>
              <td style={style.td}>{u.groups}</td>
              <td style={style.td}><span style={u.status === "Active" ? style.badgeGreen : style.badgeRed}>{u.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Users – Add ──────────────────────────────────────────────────────────────
const UsersAddScreen = forwardRef(function UsersAddScreen(_props, ref) {
  const [form, setForm] = useState({
    name: "", email: "", empNo: "", phone: "",
    password: "", confirmPassword: "",
    status: "Active", homepage: "dashboard", gender: "Male",
  });
  const [groupRows, setGroupRows] = useState([]);
  const [groups, setGroups] = useState([{ groupId: "" }]);
  const [busy, setBusy] = useState(false);
  const [groupsFetchDone, setGroupsFetchDone] = useState(false);
  const formRef = useRef(form);
  const groupsRef = useRef(groups);
  const cleanSnapRef = useRef("");
  const baselineReadyRef = useRef(false);
  formRef.current = form;
  groupsRef.current = groups;
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const snap = () => JSON.stringify({ form: formRef.current, groups: groupsRef.current });

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const r = await listUserGroups();
        if (c) return;
        if (r.ok && r.groups.length) {
          setGroupRows(r.groups);
          setGroups(gs => {
            if (gs[0]?.groupId) return gs;
            return [{ groupId: String(r.groups[0].id) }];
          });
        }
      } finally {
        if (!c) setGroupsFetchDone(true);
      }
    })();
    return () => { c = true; };
  }, []);

  useEffect(() => {
    if (!groupsFetchDone || baselineReadyRef.current) return;
    cleanSnapRef.current = snap();
    baselineReadyRef.current = true;
  }, [groupsFetchDone, form, groups]);

  useImperativeHandle(ref, () => ({
    isDirty() {
      if (!baselineReadyRef.current) return false;
      return snap() !== cleanSnapRef.current;
    },
    markClean() {
      cleanSnapRef.current = snap();
      baselineReadyRef.current = true;
    },
    async submit() {
      if (!form.name.trim() || !form.email.trim()) { alert("User name and email are required."); return; }
      if (form.password.length < 8) { alert("Password must be at least 8 characters."); return; }
      if (form.password !== form.confirmPassword) { alert("Passwords do not match."); return; }

      const group_ids = groups
        .map(g => Number(String(g.groupId).trim()))
        .filter(n => Number.isFinite(n) && n > 0);
      const primaryGroup = group_ids[0] || null;

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: (form.phone || "").trim(),
        employee_id: (form.empNo || "").trim() || null,
        password: form.password,
        confirm_password: form.confirmPassword,
        group: primaryGroup,
        group_ids,
        gender: form.gender.toLowerCase(),
        homepage: form.homepage,
        status: form.status === "Active" ? "active" : "inactive",
        is_active: form.status === "Active",
      };

      setBusy(true);
      const r = await createUser(payload);
      setBusy(false);
      if (r.ok) {
        alert("User saved!");
        queueMicrotask(() => {
          cleanSnapRef.current = snap();
        });
        return;
      }
      alert(formatApiError(r.data));
    },
    clear() {
      setForm({ name: "", email: "", empNo: "", phone: "", password: "", confirmPassword: "", status: "Active", homepage: "dashboard", gender: "Male" });
      setGroups([{ groupId: groupRows[0] ? String(groupRows[0].id) : "" }]);
      queueMicrotask(() => {
        cleanSnapRef.current = snap();
      });
    },
  }), [form, groups, groupRows]);

  const groupOptions = groupRows.length > 0 ? groupRows : [{ id: "", name: "(Loading…)" }];

  return (
    <div style={style.contentArea}>
      {busy && <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Saving…</div>}
      <div style={style.section}>
        <SectionHeader title="User Details" />
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div>
            <Field label="User Name" value={form.name} onChange={set("name")} />
            <Field label="Email Id" value={form.email} onChange={set("email")} />
            <Field label="Employee Number" value={form.empNo} onChange={set("empNo")} width={160} />
            <Field label="Phone Number" value={form.phone} onChange={set("phone")} width={160} />
            <div style={style.formRow}>
              <span style={style.label}>Password</span>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ ...style.input, width: 280 }} autoComplete="new-password" />
            </div>
            <div style={style.formRow}>
              <span style={style.label}>Confirm password</span>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} style={{ ...style.input, width: 280 }} autoComplete="new-password" />
            </div>
            <SelectField label="User Status" value={form.status} onChange={set("status")} options={["Active", "Inactive"]} width={140} />
          </div>
          <div>
            <SelectField label="Homepage" value={form.homepage} onChange={set("homepage")} options={[
              { value: "dashboard", label: "Dashboard" },
              { value: "quotation", label: "Quotation" },
              { value: "invoice", label: "Invoice" },
              { value: "business-reg", label: "Business Registration" },
              { value: "reports", label: "Reports" },
            ]} width={180} />
            <SelectField label="Gender" value={form.gender} onChange={set("gender")} options={["Male", "Female", "Other"]} width={140} />
          </div>
        </div>
      </div>
      <div style={style.section}>
        <SectionHeader title="Access Details – User Groups" />
        {groups.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ color: "#2e8a5a", cursor: "pointer", fontSize: 18 }} onClick={() => setGroups(gs => [...gs, { groupId: "" }])}>+</span>
            <span style={{ color: "#c0392b", cursor: "pointer", fontSize: 16 }} onClick={() => setGroups(gs => gs.length > 1 ? gs.filter((_, idx) => idx !== i) : gs)}>🗑</span>
            <select style={style.select} value={g.groupId} onChange={e => setGroups(gs => { const n = [...gs]; n[i] = { groupId: e.target.value }; return n; })}>
              <option value="">— None —</option>
              {groupOptions.filter(gg => gg.id !== "").map(gg => <option key={gg.id} value={String(gg.id)}>{gg.name}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
});
UsersAddScreen.displayName = "UsersAddScreen";

// ── User Group – Search ──────────────────────────────────────────────────────
function UserGroupSearchScreen() {
  const [ugName, setUgName] = useState("");
  const [desc, setDesc] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    setSearched(true);
    setSearching(true);
    const search = [ugName, desc].map(s => (s || "").trim()).find(Boolean) || "";
    const params = { search: search || undefined, pageSize: 200 };
    if (statusFilter === "Active") params.status = "true";
    else if (statusFilter === "Inactive") params.status = "false";
    const res = await listUserGroups(params);
    let rows = [];
    if (res.ok) {
      rows = res.groups.map(g => ({
        id: g.id, name: g.name, code: g.code || "", description: g.description || "",
        status: g.status ? "Active" : "Inactive", total: g.total_users ?? 0,
      }));
      if (ugName.trim()) rows = rows.filter(g => g.name.toLowerCase().includes(ugName.trim().toLowerCase()) || g.code.toLowerCase().includes(ugName.trim().toLowerCase()));
      if (desc.trim()) rows = rows.filter(g => g.description.toLowerCase().includes(desc.trim().toLowerCase()));
    }
    setResults(rows);
    setSearching(false);
    if (!res.ok) alert(formatApiError(res.error));
  }

  return (
    <div style={style.contentArea}>
      <div style={{ background: "#f0f5f8", border: "1px solid #c8dbe8", borderRadius: 3, padding: "14px 18px", marginBottom: 14 }}>
        <Field label="User Group" value={ugName} onChange={setUgName} />
        <Field label="Description" value={desc} onChange={setDesc} />
        <SelectField label="Status" value={statusFilter} onChange={setStatusFilter} options={["All", "Active", "Inactive"]} width={140} />
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <button type="button" style={style.btn} onClick={handleSearch} disabled={searching}>
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
      </div>
      <table style={style.table}>
        <thead><tr>{["User Group", "Description", "Status", "Total Users"].map(h => <th key={h} style={style.th}>{h}</th>)}</tr></thead>
        <tbody>
          {searched && results.length === 0 && <tr><td colSpan={4} style={{ ...style.td, color: "#999" }}>No results found.</td></tr>}
          {results.map(g => (
            <tr key={g.id}>
              <td style={style.td}>{g.name}</td>
              <td style={style.td}>{g.description}</td>
              <td style={style.td}><span style={g.status === "Active" ? style.badgeGreen : style.badgeRed}>{g.status}</span></td>
              <td style={style.td}>{g.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── User Group – Add ─────────────────────────────────────────────────────────
const PERM_ACTIONS = [
  { key: "can_view", label: "Read" },
  { key: "can_add", label: "Add" },
  { key: "can_edit", label: "Edit" },
  { key: "can_delete", label: "Delete" },
  { key: "can_approve", label: "Approve" },
  { key: "can_reject", label: "Reject" },
  { key: "can_export", label: "Export" },
  { key: "can_print", label: "Print" },
];

const UserGroupAddScreen = forwardRef(function UserGroupAddScreen(_props, ref) {
  const [form, setForm] = useState({ name: "", code: "", desc: "", status: "Active" });
  const [screenRows, setScreenRows] = useState([]);
  const [permRows, setPermRows] = useState([]);
  const [userRows, setUserRows] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [memberIds, setMemberIds] = useState([]);
  const [busy, setBusy] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);
  const [saveErr, setSaveErr] = useState(null);
  const [listsLoaded, setListsLoaded] = useState(false);
  const formRef = useRef(form);
  const permRowsRef = useRef(permRows);
  const memberIdsRef = useRef(memberIds);
  const groupIdRef = useRef(groupId);
  const cleanSnapRef = useRef("");
  const baselineReadyRef = useRef(false);
  formRef.current = form;
  permRowsRef.current = permRows;
  memberIdsRef.current = memberIds;
  groupIdRef.current = groupId;
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const snap = () =>
    JSON.stringify({
      form: formRef.current,
      permRows: permRowsRef.current,
      memberIds: memberIdsRef.current,
      groupId: groupIdRef.current,
    });

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [sr, ur] = await Promise.all([listScreens(), listUsers({ pageSize: 500 })]);
        if (c) return;
        if (sr.ok) {
          setScreenRows(sr.screens);
          setPermRows(sr.screens.map(s => ({
            screen: s.id, screen_code: s.code, screen_name: s.name,
            can_view: false, can_add: false, can_edit: false, can_delete: false,
            can_approve: false, can_reject: false, can_export: false, can_print: false,
          })));
        }
        if (ur.ok) setAllUsers(ur.results.map(u => ({ id: u.id, name: u.name, email: u.email })));
      } finally {
        if (!c) setListsLoaded(true);
      }
    })();
    return () => { c = true; };
  }, []);

  useEffect(() => {
    if (!listsLoaded || baselineReadyRef.current) return;
    cleanSnapRef.current = snap();
    baselineReadyRef.current = true;
  }, [listsLoaded, form, permRows, memberIds, groupId]);

  function togglePerm(idx, key) {
    setPermRows(prev => {
      const n = [...prev];
      n[idx] = { ...n[idx], [key]: !n[idx][key] };
      return n;
    });
  }

  function addMember() { setMemberIds(prev => [...prev, ""]); }
  function removeMember(idx) { setMemberIds(prev => prev.filter((_, i) => i !== idx)); }
  function setMember(idx, val) { setMemberIds(prev => { const n = [...prev]; n[idx] = val; return n; }); }

  useImperativeHandle(ref, () => ({
    isDirty() {
      if (!baselineReadyRef.current) return false;
      return snap() !== cleanSnapRef.current;
    },
    markClean() {
      cleanSnapRef.current = snap();
      baselineReadyRef.current = true;
    },
    async save() {
      if (!form.name.trim()) { alert("User Group name is required."); return; }
      setBusy(true);
      setSaveMsg(null);
      setSaveErr(null);
      const screen_permissions = permRows
        .filter(p => p.can_view || p.can_add || p.can_edit || p.can_delete || p.can_approve || p.can_reject || p.can_export || p.can_print)
        .map(p => ({
          screen: p.screen,
          can_view: p.can_view, can_add: p.can_add, can_edit: p.can_edit,
          can_delete: p.can_delete, can_approve: p.can_approve, can_reject: p.can_reject,
          can_export: p.can_export, can_print: p.can_print,
        }));
      const member_ids = memberIds.map(Number).filter(n => Number.isFinite(n) && n > 0);
      const payload = {
        name: form.name.trim(),
        code: (form.code || "").trim() || null,
        description: (form.desc || "").trim(),
        status: form.status === "Active",
        screen_permissions,
        member_ids,
      };
      let r;
      if (groupId) {
        r = await updateGroup(groupId, payload);
      } else {
        r = await createGroup(payload);
      }
      setBusy(false);
      if (r.ok) {
        const id = r.data?.id || groupId;
        setGroupId(id);
        setSaveMsg(`Group #${id} saved.`);
        queueMicrotask(() => {
          groupIdRef.current = id;
          cleanSnapRef.current = snap();
        });
      } else {
        setSaveErr(formatApiError(r.data));
      }
    },
    clear() {
      setForm({ name: "", code: "", desc: "", status: "Active" });
      setPermRows(screenRows.map(s => ({
        screen: s.id, screen_code: s.code, screen_name: s.name,
        can_view: false, can_add: false, can_edit: false, can_delete: false,
        can_approve: false, can_reject: false, can_export: false, can_print: false,
      })));
      setMemberIds([]);
      setGroupId(null);
      setSaveMsg(null);
      setSaveErr(null);
      queueMicrotask(() => {
        cleanSnapRef.current = snap();
      });
    },
    async refresh() {
      if (!groupId) return;
      setBusy(true);
      const r = await getGroup(groupId);
      setBusy(false);
      if (!r.ok) { setSaveErr(formatApiError(r.data)); return; }
      const d = r.data;
      setForm({ name: d.name || "", code: d.code || "", desc: d.description || "", status: d.status ? "Active" : "Inactive" });
      const sp = d.screen_permissions || [];
      setPermRows(screenRows.map(s => {
        const p = sp.find(x => x.screen === s.id);
        return {
          screen: s.id, screen_code: s.code, screen_name: s.name,
          can_view: p?.can_view ?? false, can_add: p?.can_add ?? false,
          can_edit: p?.can_edit ?? false, can_delete: p?.can_delete ?? false,
          can_approve: p?.can_approve ?? false, can_reject: p?.can_reject ?? false,
          can_export: p?.can_export ?? false, can_print: p?.can_print ?? false,
        };
      }));
      const mems = (d.members || []).map(m => String(m.user_id));
      setMemberIds(mems);
      setSaveMsg("Loaded from server.");
      queueMicrotask(() => {
        cleanSnapRef.current = snap();
      });
    },
  }), [form, permRows, memberIds, groupId, screenRows]);

  return (
    <div style={style.contentArea}>
      {saveErr && <div style={{ background: "#fdecea", color: "#c0392b", padding: "8px 12px", marginBottom: 12, fontSize: 12, borderRadius: 2 }}>{saveErr}</div>}
      {saveMsg && <div style={{ background: "#e8f5e9", color: "#2e7d32", padding: "8px 12px", marginBottom: 12, fontSize: 12, borderRadius: 2 }}>{saveMsg}</div>}
      {busy && <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Working…</div>}

      <div style={style.section}>
        <SectionHeader title="User Group Details" />
        <Field label="User Group Code" value={form.code} onChange={set("code")} />
        <Field label="Name" value={form.name} onChange={set("name")} />
        <Field label="Description" value={form.desc} onChange={set("desc")} width={400} />
        <SelectField label="User Group Status" value={form.status} onChange={set("status")} options={["Active", "Inactive"]} width={140} />
      </div>

      <div style={style.section}>
        <SectionHeader title="Access Details – Screens" />
        <div style={{ overflowX: "auto" }}>
          <table style={{ ...style.table, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ ...style.th, textAlign: "left", minWidth: 180 }}>Screen</th>
                {PERM_ACTIONS.map(a => <th key={a.key} style={{ ...style.th, width: 60, textAlign: "center" }}>{a.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {permRows.map((p, i) => (
                <tr key={p.screen}>
                  <td style={{ ...style.td, textAlign: "left", fontWeight: 500 }}>{p.screen_name}</td>
                  {PERM_ACTIONS.map(a => (
                    <td key={a.key} style={{ ...style.td, textAlign: "center" }}>
                      <input type="checkbox" checked={!!p[a.key]} onChange={() => togglePerm(i, a.key)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={style.section}>
        <SectionHeader title="User Group – Users" />
        {memberIds.map((mid, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ color: "#2e8a5a", cursor: "pointer", fontSize: 18 }} onClick={addMember}>+</span>
            <span style={{ color: "#c0392b", cursor: "pointer", fontSize: 16 }} onClick={() => removeMember(i)}>🗑</span>
            <select style={{ ...style.select, width: 260 }} value={mid} onChange={e => setMember(i, e.target.value)}>
              <option value="">— Select user —</option>
              {allUsers.map(u => <option key={u.id} value={String(u.id)}>{u.name} ({u.email})</option>)}
            </select>
          </div>
        ))}
        {memberIds.length === 0 && (
          <button type="button" style={{ ...style.btn, fontSize: 12 }} onClick={addMember}>+ Add user to group</button>
        )}
      </div>
    </div>
  );
});
UserGroupAddScreen.displayName = "UserGroupAddScreen";

// ═══════════════════════════════════════════════════════════════════════════════
// Nav & Main App
// ═══════════════════════════════════════════════════════════════════════════════

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

const SCREEN_TITLES = {
  dashboard: "Home",
  "business-reg": "Business Registration",
  "customer-reg": "Customer Registration",
  quotation: "Quotation",
  invoice: "Billing / Invoice & Payments",
  "users-search": "Users",
  "users-add": "Users – Add",
  "usergroup-search": "User Group",
  "usergroup-add": "User Group – Add",
  admin: "Admin",
  reports: "Reports",
  pricing: "Pricing",
  delinquency: "Delinquency",
  accounting: "Accounting",
};

function formatShellError(err) {
  if (!err) return "Failed to load dashboard.";
  if (typeof err.detail === "string") return err.detail;
  if (Array.isArray(err.detail) && err.detail[0]) return typeof err.detail[0] === "string" ? err.detail[0] : JSON.stringify(err.detail[0]);
  return "Failed to load dashboard.";
}

const NAV_INITIAL = { history: ["dashboard"], index: 0 };

function navReducer(state, action) {
  const { history, index } = state;
  const current = history[index];
  switch (action.type) {
    case "push": {
      if (action.screen === current) return state;
      const h = [...history.slice(0, index + 1), action.screen];
      return { history: h, index: h.length - 1 };
    }
    case "back":
      return index <= 0 ? state : { ...state, index: index - 1 };
    case "forward":
      return index >= history.length - 1 ? state : { ...state, index: index + 1 };
    default:
      return state;
  }
}

export function SmartRevenueApp({ user, onLogout }) {
  const [{ history: navHistory, index: navIndex }, dispatchNav] = useReducer(navReducer, NAV_INITIAL);
  const screen = navHistory[navIndex];
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => loadBookmarksFromStorage());
  const [kpi, setKpi] = useState(null);
  const [shellLoading, setShellLoading] = useState(true);
  const [shellError, setShellError] = useState(null);
  const [sidebarAlerts, setSidebarAlerts] = useState([]);
  const [sidebarTasks, setSidebarTasks] = useState([]);
  const [dashboardReloadKey, setDashboardReloadKey] = useState(0);
  const bizRegRef = useRef(null);
  const usersAddRef = useRef(null);
  const groupAddRef = useRef(null);

  useEffect(() => { saveBookmarksToStorage(bookmarks); }, [bookmarks]);

  const refreshShellData = useCallback(async () => {
    setShellLoading(true);
    setShellError(null);
    const [d, s] = await Promise.all([fetchDashboard(), fetchShipmentsForTasks({ pageSize: 150 })]);
    if (!d.ok) { setShellError(formatShellError(d.error)); setKpi(null); setSidebarAlerts([]); }
    else { setKpi(d.data); setSidebarAlerts(buildAlertsFromKpi(d.data)); }
    if (s.ok) setSidebarTasks(shipmentTasksFromList(s.results));
    else setSidebarTasks([]);
    setShellLoading(false);
  }, []);

  useEffect(() => { refreshShellData(); }, [refreshShellData]);

  const confirmLeaveIfNeeded = useCallback(() => {
    const map = { "users-add": usersAddRef, "usergroup-add": groupAddRef, "business-reg": bizRegRef };
    const r = map[screen];
    try {
      if (r?.current?.isDirty?.()) {
        return window.confirm("You have unsaved changes. Leave without saving?");
      }
    } catch {
      /* ignore */
    }
    return true;
  }, [screen]);

  const navigate = useCallback(
    next => {
      setMenuOpen(false);
      setAdminOpen(false);
      if (next === screen) return;
      if (!confirmLeaveIfNeeded()) return;
      dispatchNav({ type: "push", screen: next });
    },
    [screen, confirmLeaveIfNeeded]
  );

  const goBack = useCallback(() => {
    if (navIndex <= 0) return;
    if (!confirmLeaveIfNeeded()) return;
    dispatchNav({ type: "back" });
  }, [navIndex, confirmLeaveIfNeeded]);

  const goForward = useCallback(() => {
    if (navIndex >= navHistory.length - 1) return;
    if (!confirmLeaveIfNeeded()) return;
    dispatchNav({ type: "forward" });
  }, [navIndex, navHistory.length, confirmLeaveIfNeeded]);

  const handleLogoutRequest = useCallback(() => {
    if (!confirmLeaveIfNeeded()) return;
    onLogout();
  }, [onLogout, confirmLeaveIfNeeded]);

  const canGoBack = navIndex > 0;
  const canGoForward = navIndex < navHistory.length - 1;

  const addBookmark = useCallback(sc => {
    const label = SCREEN_TITLES[sc] || sc;
    setBookmarks(prev => prev.some(b => b.screen === sc) ? prev : [...prev, { label, screen: sc }]);
  }, []);

  const menuItems = useMemo(() => filterMenuItems(user, MENU_ITEMS), [user]);
  const adminItems = useMemo(() => (canAccessAdminMenu(user) ? ADMIN_ITEMS : []), [user]);
  const title = SCREEN_TITLES[screen] || screen;

  const shell = useMemo(() => ({ kpi, loading: shellLoading, error: shellError, refresh: refreshShellData }), [kpi, shellLoading, shellError, refreshShellData]);

  const pageActions = useMemo(() => {
    const dashRefresh = { label: "Refresh", onClick: async () => { await refreshShellData(); setDashboardReloadKey(k => k + 1); } };
    return {
      dashboard: [dashRefresh],
      "business-reg": [
        { label: "Bookmark", onClick: () => addBookmark("business-reg") },
        { label: "Clear", onClick: () => bizRegRef.current?.clear() },
        { label: "Save", onClick: () => bizRegRef.current?.save() },
        { label: "Refresh", onClick: () => bizRegRef.current?.refresh() },
      ],
      "customer-reg": [
        { label: "Bookmark", onClick: () => addBookmark("customer-reg") },
        { label: "Clear", onClick: () => {} },
        { label: "Save", onClick: () => alert("Saved!") },
        { label: "Refresh", onClick: () => {} },
      ],
      quotation: [
        { label: "Bookmark", onClick: () => addBookmark("quotation") },
        { label: "Clear", onClick: () => {} },
        { label: "Save", onClick: () => alert("Quotation saved!") },
        { label: "Refresh", onClick: () => {} },
      ],
      invoice: [
        { label: "Bookmark", onClick: () => addBookmark("invoice") },
        { label: "Refresh", onClick: () => {} },
      ],
      "users-search": [
        { label: "Bookmark", onClick: () => addBookmark("users-search") },
        { label: "Clear", onClick: () => {} },
        { label: "Add", onClick: () => navigate("users-add") },
        { label: "Refresh", onClick: () => {} },
      ],
      "users-add": [
        { label: "Bookmark", onClick: () => addBookmark("users-add") },
        { label: "Clear", onClick: () => usersAddRef.current?.clear() },
        { label: "Save", onClick: () => void usersAddRef.current?.submit() },
        { label: "Refresh", onClick: () => {} },
      ],
      "usergroup-search": [
        { label: "Bookmark", onClick: () => addBookmark("usergroup-search") },
        { label: "Clear", onClick: () => {} },
        { label: "Add", onClick: () => navigate("usergroup-add") },
        { label: "Refresh", onClick: () => {} },
      ],
      "usergroup-add": [
        { label: "Bookmark", onClick: () => addBookmark("usergroup-add") },
        { label: "Clear", onClick: () => groupAddRef.current?.clear() },
        { label: "Save", onClick: () => void groupAddRef.current?.save() },
        { label: "Refresh", onClick: () => void groupAddRef.current?.refresh() },
      ],
    };
  }, [addBookmark, navigate, refreshShellData]);

  return (
    <SrmLayout
      user={user}
      onLogout={handleLogoutRequest}
      navigate={navigate}
      goBack={goBack}
      goForward={goForward}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      adminOpen={adminOpen}
      setAdminOpen={setAdminOpen}
      menuItems={menuItems}
      adminItems={adminItems}
      pageTitle={title}
      pageActions={pageActions[screen] || []}
      sidebarAlerts={sidebarAlerts}
      sidebarTasks={sidebarTasks}
      bookmarks={bookmarks}
    >
      {screen === "dashboard" && <DashboardScreen shell={shell} reloadTablesKey={dashboardReloadKey} />}
      {screen === "business-reg" && <BusinessRegistrationScreen ref={bizRegRef} />}
      {screen === "customer-reg" && <CustomerRegistrationScreen />}
      {screen === "quotation" && <QuotationScreen />}
      {screen === "invoice" && <InvoiceScreen />}
      {screen === "users-search" && <UsersSearchScreen />}
      {screen === "users-add" && <UsersAddScreen ref={usersAddRef} />}
      {screen === "usergroup-search" && <UserGroupSearchScreen />}
      {screen === "usergroup-add" && <UserGroupAddScreen ref={groupAddRef} />}
      {(screen === "admin" || screen === "reports" || screen === "pricing" || screen === "delinquency" || screen === "accounting") && (
        <div style={{ padding: 30, color: "#888" }}>{title} — Coming Soon</div>
      )}
    </SrmLayout>
  );
}
