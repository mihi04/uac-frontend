import { srmStyle as style } from "./srmStyles.js";

export function SectionHeader({ title }) {
  return (
    <div style={style.sectionHeader}>
      <span style={style.sectionTitle}>{title}</span>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange, width = 280, placeholder = "" }) {
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

export function SelectField({ label, value, onChange, options = [], width = 200 }) {
  return (
    <div style={style.formRow}>
      <span style={style.label}>{label}</span>
      <select value={value} onChange={e => onChange && onChange(e.target.value)} style={{ ...style.select, width }}>
        {options.map(o => {
          const v = typeof o === "object" && o !== null ? o.value : o;
          const lbl = typeof o === "object" && o !== null ? o.label : o;
          return (
            <option key={String(v)} value={v}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function TextareaField({ label, value, onChange, width = 400, rows = 3, placeholder = "" }) {
  return (
    <div style={{ ...style.formRow, alignItems: "flex-start" }}>
      <span style={{ ...style.label, paddingTop: 8 }}>{label}</span>
      <textarea
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          ...style.input,
          width,
          minHeight: rows * 22,
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}
