import { srmStyle as style } from "./srmStyles.js";

export function SrmHeader({ user, onLogout, onTitleClick }) {
  return (
    <div style={style.header}>
      <span style={style.headerTitle} onClick={onTitleClick} onKeyDown={e => e.key === "Enter" && onTitleClick?.()} role="button" tabIndex={0}>
        Smart Revenue Management
      </span>
      <div style={style.headerRight}>
        <span style={style.headerLink}>About</span>
        <span style={style.headerLink}>Help</span>
        <span
          style={style.headerUser}
          onClick={onLogout}
          onKeyDown={e => e.key === "Enter" && onLogout()}
          role="button"
          tabIndex={0}
          title="Sign out"
        >
          👤 {user.name}
          {user.group ? ` · ${user.group}` : ""} · {user.role || "—"} ⏻
        </span>
      </div>
    </div>
  );
}
