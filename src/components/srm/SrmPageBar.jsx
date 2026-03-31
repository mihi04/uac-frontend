import { srmStyle as style } from "./srmStyles.js";

export function SrmPageBar({ title, actions = [] }) {
  return (
    <div style={style.pageBar}>
      <span style={style.pageTitle}>{title}</span>
      <div style={style.pageActions}>
        {actions.map((a, i) => (
          <button key={i} type="button" style={style.btn} onClick={a.onClick}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
