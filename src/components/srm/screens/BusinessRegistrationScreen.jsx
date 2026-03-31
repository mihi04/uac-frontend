import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { COLORS } from "../../../theme.js";
import {
  addCustomerAddress,
  addCustomerContact,
  createCustomer,
  getCustomer,
  patchCustomerAddress,
  patchCustomerContact,
  updateCustomer,
  uploadCustomerDocument,
} from "../../../api/customersApi.js";
import { Field, SectionHeader, SelectField, TextareaField } from "../formPrimitives.jsx";
import { srmStyle as style } from "../srmStyles.js";

/** Reference screenshots (Smart Revenue Management — Business Registration): `public/ui-reference/` */

const NATURE_OF_BUSINESS = [
  { value: "importer", label: "Importer" },
  { value: "exporter", label: "Exporter" },
  { value: "trader", label: "Trader" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "freight_broker", label: "Freight broker" },
  { value: "other", label: "Other" },
];

const LEGAL_STRUCTURE = [
  { value: "", label: "— Select —" },
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "pvt_ltd", label: "Private Limited" },
  { value: "llp", label: "LLP" },
  { value: "other", label: "Other" },
];

const PAYMENT_TERMS = [
  { value: "0", label: "Advance" },
  { value: "7", label: "7 days credit" },
  { value: "15", label: "15 days credit" },
  { value: "30", label: "30 days credit" },
  { value: "60", label: "60 days credit" },
];

const SHIPMENT_MODES = [
  { value: "", label: "— Select —" },
  { value: "Air", label: "Air" },
  { value: "Sea", label: "Sea" },
  { value: "Road", label: "Road" },
  { value: "Multimodal", label: "Multimodal" },
];

const emptyForm = () => ({
  legalName: "",
  bizName: "",
  legalStructure: "",
  natureOfBusiness: "trader",
  industry: "",
  companyRegNo: "",
  addr1: "",
  addr2: "",
  addr3: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  postal: "",
  billSameAsRegistered: true,
  billLine: "",
  billCity: "",
  billState: "",
  billCountry: "India",
  billPin: "",
  shipSameAsRegistered: true,
  shipLine: "",
  shipCity: "",
  shipState: "",
  shipCountry: "India",
  shipPin: "",
  pan: "",
  gst: "",
  iec: "",
  msme: "",
  contactName: "",
  designation: "",
  phone: "",
  email: "",
  altName: "",
  altPhone: "",
  altEmail: "",
  website: "",
  paymentTermsDays: "30",
  creditLimit: "",
  account: "",
  ifsc: "",
  bankName: "",
  branch: "",
  shipmentType: "",
  tradeRoutes: "",
  cargoMachinery: false,
  cargoChemicals: false,
  cargoTextiles: false,
  cargoElectronics: false,
  avgVolume: "",
  termTnc: false,
  termPayment: false,
  termLiability: false,
});

function formatApiError(err) {
  if (!err || typeof err !== "object") return "Request failed.";
  if (typeof err.detail === "string") return err.detail;
  if (Array.isArray(err.detail)) return err.detail.map(d => (typeof d === "string" ? d : d.msg || JSON.stringify(d))).join("; ");
  const parts = [];
  for (const [k, v] of Object.entries(err)) {
    if (k === "detail") continue;
    const msg = Array.isArray(v) ? v.join(", ") : String(v);
    parts.push(`${k}: ${msg}`);
  }
  return parts.length ? parts.join("; ") : "Request failed.";
}

function buildNotes(form) {
  const parts = [];
  if (form.legalName?.trim() && form.legalName.trim() !== (form.bizName || "").trim()) {
    parts.push(`Legal name: ${form.legalName.trim()}`);
  }
  return parts.join("\n");
}

function joinAddressLines(form) {
  const lines = [form.addr1, form.addr2, form.addr3].map(s => (s || "").trim()).filter(Boolean);
  if (form.district?.trim()) lines.push(`District: ${form.district.trim()}`);
  return lines.join("\n") || "—";
}

function buildShipmentPreferences(form) {
  const cargo = [];
  if (form.cargoMachinery) cargo.push("Machinery");
  if (form.cargoChemicals) cargo.push("Chemicals");
  if (form.cargoTextiles) cargo.push("Textiles");
  if (form.cargoElectronics) cargo.push("Electronics");
  const parts = [];
  if (form.shipmentType?.trim()) parts.push(`Shipment type: ${form.shipmentType.trim()}`);
  if (form.tradeRoutes?.trim()) parts.push(`Trade routes: ${form.tradeRoutes.trim()}`);
  if (cargo.length) parts.push(`Typical cargo: ${cargo.join(", ")}`);
  if (form.avgVolume?.trim()) parts.push(`Average volume: ${form.avgVolume.trim()}`);
  return parts.join("\n");
}

function parseShipmentPreferences(text) {
  const out = {
    shipmentType: "",
    tradeRoutes: "",
    cargoMachinery: false,
    cargoChemicals: false,
    cargoTextiles: false,
    cargoElectronics: false,
    avgVolume: "",
  };
  if (!text) return out;
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (t.startsWith("Shipment type:")) out.shipmentType = t.replace(/^Shipment type:\s*/i, "").trim();
    else if (t.startsWith("Trade routes:")) out.tradeRoutes = t.replace(/^Trade routes:\s*/i, "").trim();
    else if (t.startsWith("Typical cargo:")) {
      const c = t.replace(/^Typical cargo:\s*/i, "").toLowerCase();
      if (c.includes("machinery")) out.cargoMachinery = true;
      if (c.includes("chemical")) out.cargoChemicals = true;
      if (c.includes("textile")) out.cargoTextiles = true;
      if (c.includes("electronic")) out.cargoElectronics = true;
    } else if (t.startsWith("Average volume:")) out.avgVolume = t.replace(/^Average volume:\s*/i, "").trim();
  }
  return out;
}

function splitAddressLines(addressLine) {
  const lines = (addressLine || "").split("\n").map(s => s.trim());
  return {
    l1: lines[0] || "",
    l2: lines[1] || "",
    l3: lines[2] || "",
  };
}

function pickAddress(addresses, types) {
  if (!addresses?.length) return null;
  for (const t of types) {
    const a = addresses.find(x => x.address_type === t);
    if (a) return a;
  }
  return null;
}

function mapCustomerToForm(data) {
  const f = emptyForm();
  f.bizName = data.company_name || "";
  f.legalName = data.company_name || "";
  f.natureOfBusiness = data.business_type || "trader";
  f.legalStructure = data.legal_structure || "";
  f.industry = data.industry || "";
  f.companyRegNo = data.company_registration_number || "";
  f.msme = data.msme_registration || "";
  f.gst = data.gst || "";
  f.pan = data.pan || "";
  f.iec = data.iec || "";
  f.website = data.website || "";
  f.creditLimit = data.credit_limit != null ? String(data.credit_limit) : "";
  f.paymentTermsDays = data.credit_days != null ? String(data.credit_days) : "30";
  f.account = data.bank_account_number || "";
  f.ifsc = data.bank_ifsc || "";
  f.bankName = data.bank_name || "";
  f.branch = data.bank_branch || "";
  f.termTnc = !!data.terms_accepted;
  f.termPayment = !!data.terms_accepted;
  f.termLiability = !!data.terms_accepted;

  const sp = parseShipmentPreferences(data.shipment_preferences || "");
  Object.assign(f, sp);

  const reg = pickAddress(data.addresses, ["registered", "both"]);
  if (reg) {
    const sl = splitAddressLines(reg.address_line);
    f.addr1 = sl.l1;
    f.addr2 = sl.l2;
    f.addr3 = sl.l3;
    f.city = reg.city || "";
    f.state = reg.state || "";
    f.country = reg.country || "India";
    f.postal = reg.pin_code || "";
  }

  const bill = pickAddress(data.addresses, ["billing"]);
  const ship = pickAddress(data.addresses, ["shipping"]);
  if (bill) {
    f.billSameAsRegistered = false;
    f.billLine = (bill.address_line || "").trim();
    f.billCity = bill.city || "";
    f.billState = bill.state || "";
    f.billCountry = bill.country || "India";
    f.billPin = bill.pin_code || "";
  }
  if (ship) {
    f.shipSameAsRegistered = false;
    f.shipLine = (ship.address_line || "").trim();
    f.shipCity = ship.city || "";
    f.shipState = ship.state || "";
    f.shipCountry = ship.country || "India";
    f.shipPin = ship.pin_code || "";
  }

  const contacts = [...(data.contacts || [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const primary = contacts.find(c => c.is_primary) || contacts[0];
  const alt = contacts.find(c => !c.is_primary);
  if (primary) {
    f.contactName = primary.name || "";
    f.designation = primary.designation || "";
    f.phone = primary.phone || "";
    f.email = primary.email || "";
    if (primary.name && primary.name !== data.company_name) f.legalName = primary.name;
  }
  if (alt) {
    f.altName = alt.name || "";
    f.altPhone = alt.phone || "";
    f.altEmail = alt.email || "";
  }

  return f;
}

function extractIdsFromCustomer(data) {
  const reg = pickAddress(data.addresses, ["registered", "both"]);
  const bill = pickAddress(data.addresses, ["billing"]);
  const ship = pickAddress(data.addresses, ["shipping"]);
  const contacts = [...(data.contacts || [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const primary = contacts.find(c => c.is_primary) || contacts[0];
  const alt = contacts.find(c => !c.is_primary);
  return {
    primaryContactId: primary?.id ?? null,
    altContactId: alt?.id ?? null,
    addrRegId: reg?.id ?? null,
    addrBillId: bill?.id ?? null,
    addrShipId: ship?.id ?? null,
    registeredAt: data.created_at || null,
  };
}

function checkboxRowStyle(checked) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    fontSize: 12,
    color: checked ? COLORS.text : "#666",
    cursor: "pointer",
    userSelect: "none",
  };
}

export const BusinessRegistrationScreen = forwardRef(function BusinessRegistrationScreen(_props, ref) {
  const [form, setForm] = useState(emptyForm);
  const [customerId, setCustomerId] = useState(null);
  const [primaryContactId, setPrimaryContactId] = useState(null);
  const [altContactId, setAltContactId] = useState(null);
  const [addrRegId, setAddrRegId] = useState(null);
  const [addrBillId, setAddrBillId] = useState(null);
  const [addrShipId, setAddrShipId] = useState(null);
  const [registeredAt, setRegisteredAt] = useState(null);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [kycFiles, setKycFiles] = useState({
    gst_certificate: null,
    pan_copy: null,
    iec_certificate: null,
    address_proof: null,
    authorized_signatory_id: null,
  });
  const [kycKey, setKycKey] = useState(0);

  const [saveError, setSaveError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const logoInputRef = useRef(null);

  const set = useCallback(k => v => setForm(prev => ({ ...prev, [k]: v })), []);
  const setKyc = useCallback((key, file) => {
    setKycFiles(prev => ({ ...prev, [key]: file }));
  }, []);

  const clear = useCallback(() => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setForm(emptyForm());
    setCustomerId(null);
    setPrimaryContactId(null);
    setAltContactId(null);
    setAddrRegId(null);
    setAddrBillId(null);
    setAddrShipId(null);
    setRegisteredAt(null);
    setLogoFile(null);
    setLogoPreview(null);
    setFileInputKey(k => k + 1);
    setKycFiles({
      gst_certificate: null,
      pan_copy: null,
      iec_certificate: null,
      address_proof: null,
      authorized_signatory_id: null,
    });
    setKycKey(k => k + 1);
    setSaveError(null);
    setSaveMessage(null);
  }, [logoPreview]);

  const loadCustomer = useCallback(async () => {
    if (!customerId) {
      setSaveError("Save a customer first, or create one to obtain an ID for refresh.");
      return;
    }
    setBusy(true);
    setSaveError(null);
    setSaveMessage(null);
    const res = await getCustomer(customerId);
    setBusy(false);
    if (!res.ok) {
      setSaveError(formatApiError(res.error));
      return;
    }
    const ids = extractIdsFromCustomer(res.data);
    setForm(mapCustomerToForm(res.data));
    setPrimaryContactId(ids.primaryContactId);
    setAltContactId(ids.altContactId);
    setAddrRegId(ids.addrRegId);
    setAddrBillId(ids.addrBillId);
    setAddrShipId(ids.addrShipId);
    setRegisteredAt(ids.registeredAt);
    setSaveMessage("Loaded from server.");
  }, [customerId]);

  const buildCustomerPayload = useCallback(() => {
    const company_name = (form.bizName || "").trim() || (form.legalName || "").trim() || "Unnamed Company";
    const gst = (form.gst || "").trim();
    const pan = (form.pan || "").trim();
    const iec = (form.iec || "").trim();
    const creditDays = Number.parseInt(form.paymentTermsDays, 10);
    const creditLimitNum = (form.creditLimit || "").trim();
    const termsAccepted = !!(form.termTnc && form.termPayment && form.termLiability);

    const payload = {
      company_name,
      business_type: form.natureOfBusiness || "trader",
      legal_structure: (form.legalStructure || "").trim() || null,
      industry: (form.industry || "").trim(),
      company_registration_number: (form.companyRegNo || "").trim(),
      msme_registration: (form.msme || "").trim(),
      website: (form.website || "").trim(),
      notes: buildNotes(form),
      status: "prospect",
      credit_limit: creditLimitNum === "" ? "0.00" : creditLimitNum,
      credit_days: Number.isFinite(creditDays) ? creditDays : 30,
      shipment_preferences: buildShipmentPreferences(form),
      terms_accepted: termsAccepted,
      bank_account_number: (form.account || "").trim(),
      bank_ifsc: (form.ifsc || "").trim().toUpperCase(),
      bank_name: (form.bankName || "").trim(),
      bank_branch: (form.branch || "").trim(),
    };
    if (gst) payload.gst = gst;
    else payload.gst = null;
    if (pan) payload.pan = pan;
    if (iec) payload.iec = iec;
    return payload;
  }, [form]);

  const billingPayload = useCallback(() => {
    if (form.billSameAsRegistered) {
      return {
        address_type: "billing",
        address_line: joinAddressLines(form),
        city: (form.city || "").trim() || "—",
        state: (form.state || "").trim() || "—",
        country: (form.country || "").trim() || "India",
        pin_code: (form.postal || "").trim() || "000000",
        is_default: false,
      };
    }
    return {
      address_type: "billing",
      address_line: (form.billLine || "").trim() || "—",
      city: (form.billCity || "").trim() || "—",
      state: (form.billState || "").trim() || "—",
      country: (form.billCountry || "").trim() || "India",
      pin_code: (form.billPin || "").trim() || "000000",
      is_default: false,
    };
  }, [form]);

  const shippingPayload = useCallback(() => {
    if (form.shipSameAsRegistered) {
      return {
        address_type: "shipping",
        address_line: joinAddressLines(form),
        city: (form.city || "").trim() || "—",
        state: (form.state || "").trim() || "—",
        country: (form.country || "").trim() || "India",
        pin_code: (form.postal || "").trim() || "000000",
        is_default: false,
      };
    }
    return {
      address_type: "shipping",
      address_line: (form.shipLine || "").trim() || "—",
      city: (form.shipCity || "").trim() || "—",
      state: (form.shipState || "").trim() || "—",
      country: (form.shipCountry || "").trim() || "India",
      pin_code: (form.shipPin || "").trim() || "000000",
      is_default: false,
    };
  }, [form]);

  const registeredPayload = useCallback(
    () => ({
      address_type: "registered",
      address_line: joinAddressLines(form),
      city: (form.city || "").trim() || "—",
      state: (form.state || "").trim() || "—",
      country: (form.country || "").trim() || "India",
      pin_code: (form.postal || "").trim() || "000000",
      is_default: true,
    }),
    [form]
  );

  const uploadPendingDocs = useCallback(async id => {
    const uploads = [];
    for (const [docType, file] of Object.entries(kycFiles)) {
      if (file) uploads.push(uploadCustomerDocument(id, file, docType));
    }
    if (logoFile) uploads.push(uploadCustomerDocument(id, logoFile, "other"));
    for (const p of uploads) {
      const docRes = await p;
      if (!docRes.ok) return docRes;
    }
    return { ok: true };
  }, [kycFiles, logoFile]);

  const save = useCallback(async () => {
    setBusy(true);
    setSaveError(null);
    setSaveMessage(null);

    const payload = buildCustomerPayload();
    const reg = registeredPayload();
    const bill = billingPayload();
    const ship = shippingPayload();

    const contactName = (form.contactName || "").trim() || payload.company_name;
    const primaryContactBody = {
      name: contactName,
      designation: (form.designation || "").trim(),
      phone: (form.phone || "").trim(),
      email: (form.email || "").trim(),
      is_primary: true,
    };

    if (customerId) {
      const patchRes = await updateCustomer(customerId, payload);
      if (!patchRes.ok) {
        setBusy(false);
        setSaveError(formatApiError(patchRes.error));
        return;
      }

      if (primaryContactId) {
        const cRes = await patchCustomerContact(customerId, primaryContactId, primaryContactBody);
        if (!cRes.ok) {
          setBusy(false);
          setSaveError(`Updated company #${customerId} but primary contact failed: ${formatApiError(cRes.error)}`);
          return;
        }
      } else {
        const cRes = await addCustomerContact(customerId, primaryContactBody);
        if (!cRes.ok) {
          setBusy(false);
          setSaveError(formatApiError(cRes.error));
          return;
        }
        setPrimaryContactId(cRes.data?.id ?? null);
      }

      const altBody = {
        name: (form.altName || "").trim() || "Alternate contact",
        designation: "",
        phone: (form.altPhone || "").trim(),
        email: (form.altEmail || "").trim(),
        is_primary: false,
      };
      if ((form.altName || "").trim() || (form.altPhone || "").trim() || (form.altEmail || "").trim()) {
        if (altContactId) {
          const aRes = await patchCustomerContact(customerId, altContactId, altBody);
          if (!aRes.ok) {
            setBusy(false);
            setSaveError(`Alternate contact update failed: ${formatApiError(aRes.error)}`);
            return;
          }
        } else {
          const aRes = await addCustomerContact(customerId, altBody);
          if (!aRes.ok) {
            setBusy(false);
            setSaveError(`Alternate contact failed: ${formatApiError(aRes.error)}`);
            return;
          }
          setAltContactId(aRes.data?.id ?? null);
        }
      }

      const syncAddr = async (id, body) => {
        if (id) return patchCustomerAddress(customerId, id, body);
        return addCustomerAddress(customerId, body);
      };
      const ar = await syncAddr(addrRegId, reg);
      if (!ar.ok) {
        setBusy(false);
        setSaveError(`Address (registered): ${formatApiError(ar.error)}`);
        return;
      }
      if (!addrRegId && ar.data?.id) setAddrRegId(ar.data.id);

      const ab = await syncAddr(addrBillId, bill);
      if (!ab.ok) {
        setBusy(false);
        setSaveError(`Address (billing): ${formatApiError(ab.error)}`);
        return;
      }
      if (!addrBillId && ab.data?.id) setAddrBillId(ab.data.id);

      const as = await syncAddr(addrShipId, ship);
      if (!as.ok) {
        setBusy(false);
        setSaveError(`Address (shipping): ${formatApiError(as.error)}`);
        return;
      }
      if (!addrShipId && as.data?.id) setAddrShipId(as.data.id);

      const docRes = await uploadPendingDocs(customerId);
      if (!docRes.ok) {
        setBusy(false);
        setSaveError(`Updated #${customerId} but a document upload failed: ${formatApiError(docRes.error)}`);
        return;
      }
      setLogoFile(null);
      setKycFiles({
        gst_certificate: null,
        pan_copy: null,
        iec_certificate: null,
        address_proof: null,
        authorized_signatory_id: null,
      });
      setKycKey(k => k + 1);
      setBusy(false);
      setSaveMessage(`Updated company #${customerId}.`);
      return;
    }

    const custRes = await createCustomer(payload);
    if (!custRes.ok) {
      setBusy(false);
      setSaveError(formatApiError(custRes.error));
      return;
    }
    const id = custRes.data?.id;
    if (!id) {
      setBusy(false);
      setSaveError("Created customer but no id in response.");
      return;
    }
    setCustomerId(id);

    const conRes = await addCustomerContact(id, primaryContactBody);
    if (!conRes.ok) {
      setBusy(false);
      setSaveError(`Customer saved (#${id}) but contact failed: ${formatApiError(conRes.error)}`);
      return;
    }
    setPrimaryContactId(conRes.data?.id ?? null);

    if ((form.altName || "").trim() || (form.altPhone || "").trim() || (form.altEmail || "").trim()) {
      const aRes = await addCustomerContact(id, {
        name: (form.altName || "").trim(),
        designation: "",
        phone: (form.altPhone || "").trim(),
        email: (form.altEmail || "").trim(),
        is_primary: false,
      });
      if (!aRes.ok) {
        setBusy(false);
        setSaveError(`Customer saved (#${id}) but alternate contact failed: ${formatApiError(aRes.error)}`);
        return;
      }
      setAltContactId(aRes.data?.id ?? null);
    }

    for (const body of [reg, bill, ship]) {
      const addrRes = await addCustomerAddress(id, body);
      if (!addrRes.ok) {
        setBusy(false);
        setSaveError(`Customer saved (#${id}) but an address failed: ${formatApiError(addrRes.error)}`);
        return;
      }
      const aid = addrRes.data?.id;
      if (body.address_type === "registered") setAddrRegId(aid);
      if (body.address_type === "billing") setAddrBillId(aid);
      if (body.address_type === "shipping") setAddrShipId(aid);
    }

    const docRes = await uploadPendingDocs(id);
    if (!docRes.ok) {
      setBusy(false);
      setSaveError(`Saved company #${id} but a document upload failed: ${formatApiError(docRes.error)}`);
      return;
    }
    setLogoFile(null);
    setKycFiles({
      gst_certificate: null,
      pan_copy: null,
      iec_certificate: null,
      address_proof: null,
      authorized_signatory_id: null,
    });
    setKycKey(k => k + 1);
    setBusy(false);
    setSaveMessage(`Saved company #${id}.`);
  }, [
    form,
    customerId,
    primaryContactId,
    altContactId,
    addrRegId,
    addrBillId,
    addrShipId,
    buildCustomerPayload,
    registeredPayload,
    billingPayload,
    shippingPayload,
    uploadPendingDocs,
  ]);

  useImperativeHandle(ref, () => ({ clear, refresh: loadCustomer, save }), [clear, loadCustomer, save]);

  const kycRow = (label, docKey) => (
    <div style={{ ...style.formRow, alignItems: "center" }}>
      <span style={style.label}>{label}</span>
      <input
        key={`${kycKey}-${docKey}`}
        type="file"
        accept=".pdf,image/*"
        style={{ fontSize: 12 }}
        onChange={e => setKyc(docKey, e.target.files?.[0] || null)}
      />
    </div>
  );

  return (
    <div style={style.contentArea}>
      {saveError && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "8px 12px", marginBottom: 12, fontSize: 12, borderRadius: 2 }}>
          {saveError}
        </div>
      )}
      {saveMessage && (
        <div style={{ background: "#e8f5e9", color: "#2e7d32", padding: "8px 12px", marginBottom: 12, fontSize: 12, borderRadius: 2 }}>
          {saveMessage}
        </div>
      )}
      {busy && <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Working…</div>}
      {customerId != null && (
        <div style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>
          Customer ID: {customerId}
          {registeredAt ? ` · Registered: ${new Date(registeredAt).toLocaleString()}` : ""} · UI reference:{" "}
          <a href="/ui-reference/business-reg-name-address.png" target="_blank" rel="noreferrer" style={{ color: COLORS.link }}>
            name &amp; address
          </a>
          {" · "}
          <a href="/ui-reference/business-reg-identity-contact.png" target="_blank" rel="noreferrer" style={{ color: COLORS.link }}>
            identity
          </a>
          {" · "}
          <a href="/ui-reference/business-reg-bank.png" target="_blank" rel="noreferrer" style={{ color: COLORS.link }}>
            bank
          </a>
        </div>
      )}

      <div style={style.section}>
        <SectionHeader title="Basic company information" />
        <Field label="Legal Name" value={form.legalName} onChange={set("legalName")} />
        <Field label="Company / Business Name" value={form.bizName} onChange={set("bizName")} />
        <SelectField label="Legal structure" value={form.legalStructure} onChange={set("legalStructure")} options={LEGAL_STRUCTURE} width={260} />
        <SelectField label="Nature of business" value={form.natureOfBusiness} onChange={set("natureOfBusiness")} options={NATURE_OF_BUSINESS} width={260} />
        <Field label="Industry / nature (text)" value={form.industry} onChange={set("industry")} width={360} />
        <Field label="Company registration no." value={form.companyRegNo} onChange={set("companyRegNo")} width={320} />
      </div>

      <div style={style.section}>
        <SectionHeader title="Registered office address" />
        <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
          <div>
            <Field label="Address 1" value={form.addr1} onChange={set("addr1")} />
            <Field label="Address 2" value={form.addr2} onChange={set("addr2")} />
            <Field label="Address 3" value={form.addr3} onChange={set("addr3")} />
            <Field label="City" value={form.city} onChange={set("city")} />
            <Field label="District" value={form.district} onChange={set("district")} />
            <div style={style.formRow}>
              <span style={style.label}>State</span>
              <input style={{ ...style.input, width: 220 }} value={form.state} onChange={e => set("state")(e.target.value)} />
              <span style={{ marginLeft: 6, cursor: "pointer", color: COLORS.link }} title="Lookup (placeholder)">
                🔍
              </span>
            </div>
            <Field label="Country" value={form.country} onChange={set("country")} width={200} />
            <div style={style.formRow}>
              <span style={style.label}>PIN code</span>
              <input style={{ ...style.input, width: 120 }} value={form.postal} onChange={e => set("postal")(e.target.value)} maxLength={12} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 8 }}>
            <div
              style={style.uploadBox}
              onClick={() => logoInputRef.current?.click()}
              onKeyDown={e => e.key === "Enter" && logoInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="logo" style={{ maxWidth: 160, maxHeight: 120, objectFit: "contain" }} />
              ) : (
                <>
                  <span style={style.uploadLabel}>Click to Upload</span>
                  <span style={style.uploadSub}>PNG / JPG</span>
                </>
              )}
              <input
                key={fileInputKey}
                ref={logoInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (logoPreview) URL.revokeObjectURL(logoPreview);
                  setLogoFile(f);
                  setLogoPreview(URL.createObjectURL(f));
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Company Logo</div>
          </div>
        </div>
      </div>

      <div style={style.section}>
        <SectionHeader title="Billing address" />
        <label style={checkboxRowStyle(form.billSameAsRegistered)}>
          <input type="checkbox" checked={form.billSameAsRegistered} onChange={e => set("billSameAsRegistered")(e.target.checked)} />
          Same as registered office
        </label>
        {!form.billSameAsRegistered && (
          <>
            <TextareaField label="Address" value={form.billLine} onChange={set("billLine")} rows={3} width={400} />
            <Field label="City" value={form.billCity} onChange={set("billCity")} />
            <Field label="State" value={form.billState} onChange={set("billState")} />
            <Field label="Country" value={form.billCountry} onChange={set("billCountry")} width={200} />
            <Field label="PIN code" value={form.billPin} onChange={set("billPin")} width={120} />
          </>
        )}
      </div>

      <div style={style.section}>
        <SectionHeader title="Shipping / warehouse address" />
        <label style={checkboxRowStyle(form.shipSameAsRegistered)}>
          <input type="checkbox" checked={form.shipSameAsRegistered} onChange={e => set("shipSameAsRegistered")(e.target.checked)} />
          Same as registered office
        </label>
        {!form.shipSameAsRegistered && (
          <>
            <TextareaField label="Address" value={form.shipLine} onChange={set("shipLine")} rows={3} width={400} />
            <Field label="City" value={form.shipCity} onChange={set("shipCity")} />
            <Field label="State" value={form.shipState} onChange={set("shipState")} />
            <Field label="Country" value={form.shipCountry} onChange={set("shipCountry")} width={200} />
            <Field label="PIN code" value={form.shipPin} onChange={set("shipPin")} width={120} />
          </>
        )}
      </div>

      <div style={style.section}>
        <SectionHeader title="Identity" />
        <Field label="GSTIN" value={form.gst} onChange={set("gst")} placeholder="27ABCDE1234F1Z5" />
        <Field label="PAN" value={form.pan} onChange={set("pan")} placeholder="ABCDE1234F" />
        <Field label="IEC code" value={form.iec} onChange={set("iec")} />
        <Field label="MSME registration" value={form.msme} onChange={set("msme")} />
      </div>

      <div style={style.section}>
        <SectionHeader title="Contact person" />
        <Field label="Contact name" value={form.contactName} onChange={set("contactName")} />
        <Field label="Designation" value={form.designation} onChange={set("designation")} />
        <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="10-digit number" />
        <Field label="Email" type="email" value={form.email} onChange={set("email")} />
        <Field label="Alternate contact name" value={form.altName} onChange={set("altName")} />
        <Field label="Alternate phone" value={form.altPhone} onChange={set("altPhone")} />
        <Field label="Alternate email" type="email" value={form.altEmail} onChange={set("altEmail")} />
        <Field label="Website" value={form.website} onChange={set("website")} placeholder="https://" width={320} />
      </div>

      <div style={style.section}>
        <SectionHeader title="Financial details" />
        <SelectField label="Payment terms" value={form.paymentTermsDays} onChange={set("paymentTermsDays")} options={PAYMENT_TERMS} width={220} />
        <Field label="Credit limit" value={form.creditLimit} onChange={set("creditLimit")} placeholder="0.00" width={140} />
      </div>

      <div style={style.section}>
        <SectionHeader title="Bank details" />
        <Field label="Account number" value={form.account} onChange={set("account")} />
        <Field label="IFSC code" value={form.ifsc} onChange={set("ifsc")} placeholder="HDFC0001234" />
        <Field label="Bank name" value={form.bankName} onChange={set("bankName")} />
        <Field label="Branch" value={form.branch} onChange={set("branch")} />
      </div>

      <div style={style.section}>
        <SectionHeader title="Shipment preferences" />
        <SelectField label="Typical mode" value={form.shipmentType} onChange={set("shipmentType")} options={SHIPMENT_MODES} width={200} />
        <TextareaField label="Regular trade routes" value={form.tradeRoutes} onChange={set("tradeRoutes")} placeholder="e.g. India → UAE, India → Indonesia" rows={2} width={400} />
        <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 600, color: COLORS.text }}>Typical cargo</div>
        <label style={checkboxRowStyle(form.cargoMachinery)}>
          <input type="checkbox" checked={form.cargoMachinery} onChange={e => set("cargoMachinery")(e.target.checked)} />
          Machinery
        </label>
        <label style={checkboxRowStyle(form.cargoChemicals)}>
          <input type="checkbox" checked={form.cargoChemicals} onChange={e => set("cargoChemicals")(e.target.checked)} />
          Chemicals
        </label>
        <label style={checkboxRowStyle(form.cargoTextiles)}>
          <input type="checkbox" checked={form.cargoTextiles} onChange={e => set("cargoTextiles")(e.target.checked)} />
          Textiles
        </label>
        <label style={checkboxRowStyle(form.cargoElectronics)}>
          <input type="checkbox" checked={form.cargoElectronics} onChange={e => set("cargoElectronics")(e.target.checked)} />
          Electronics
        </label>
        <Field label="Average shipment volume" value={form.avgVolume} onChange={set("avgVolume")} placeholder="e.g. 2–5 TEU / month" width={360} />
      </div>

      <div style={style.section}>
        <SectionHeader title="KYC documents (upload)" />
        {kycRow("GST certificate", "gst_certificate")}
        {kycRow("PAN card", "pan_copy")}
        {kycRow("IEC certificate", "iec_certificate")}
        {kycRow("Address proof", "address_proof")}
        {kycRow("Authorized signatory ID", "authorized_signatory_id")}
      </div>

      <div style={style.section}>
        <SectionHeader title="Agreement / terms" />
        <label style={checkboxRowStyle(form.termTnc)}>
          <input type="checkbox" checked={form.termTnc} onChange={e => set("termTnc")(e.target.checked)} />
          Terms &amp; conditions accepted
        </label>
        <label style={checkboxRowStyle(form.termPayment)}>
          <input type="checkbox" checked={form.termPayment} onChange={e => set("termPayment")(e.target.checked)} />
          Payment policy accepted
        </label>
        <label style={checkboxRowStyle(form.termLiability)}>
          <input type="checkbox" checked={form.termLiability} onChange={e => set("termLiability")(e.target.checked)} />
          Liability &amp; insurance terms accepted
        </label>
        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>All three must be checked to record terms acceptance on save.</div>
      </div>
    </div>
  );
});
