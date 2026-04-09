import { useState } from "react";
import { COLORS } from "../../theme.js";
import { srmStyle as style } from "./srmStyles.js";

export function SrmSidebar({ alerts = [], tasks = [], bookmarks = [], onBookmarkNavigate, onBookmarkRemove, emptyHint }) {
  const [hoveredBookmarkIndex, setHoveredBookmarkIndex] = useState(null);

  return (
    <div style={style.sidebar}>
      <div style={style.sidePanel}>
        <div style={style.sidePanelTitle}>Alerts</div>
        {alerts.length === 0 && <div style={{ fontSize: 11, color: "#888" }}>{emptyHint || "No alerts."}</div>}
        {alerts.map((a, i) => (
          <div key={i} style={{ fontSize: 11, color: "#c0392b", marginBottom: 5, paddingLeft: 6, borderLeft: "3px solid #c0392b" }}>
            {a}
          </div>
        ))}
      </div>
      <div style={style.sidePanel}>
        <div style={style.sidePanelTitle}>Current Tasks</div>
        {tasks.length === 0 && <div style={{ fontSize: 11, color: "#888" }}>No active shipments in view.</div>}
        {tasks.map((t, i) => (
          <div
            key={i}
            style={{ fontSize: 11, color: "#1a4a5e", marginBottom: 5, paddingLeft: 6, borderLeft: "3px solid " + COLORS.btnBg }}
          >
            {t}
          </div>
        ))}
      </div>
      <div style={{ ...style.sidePanel, flex: 1 }}>
        <div style={style.sidePanelTitle}>Bookmarks</div>
        {bookmarks.length === 0 && <div style={{ fontSize: 11, color: "#888" }}>Use Bookmark on a page to add.</div>}
        {bookmarks.map((b, i) => (
          <div
            key={`${b.screen}-${i}`}
            style={{ fontSize: 11, color: COLORS.link, marginBottom: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}
            onClick={() => onBookmarkNavigate?.(b.screen)}
            onKeyDown={e => e.key === "Enter" && onBookmarkNavigate?.(b.screen)}
            onMouseEnter={() => setHoveredBookmarkIndex(i)}
            onMouseLeave={() => setHoveredBookmarkIndex(null)}
            role="button"
            tabIndex={0}
          >
            <span>📌 {b.label}</span>
            <button
              type="button"
              aria-label={`Remove bookmark ${b.label}`}
              onClick={e => {
                e.stopPropagation();
                onBookmarkRemove?.(i);
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "#c0392b",
                cursor: "pointer",
                fontSize: 12,
                padding: "0 2px",
                visibility: hoveredBookmarkIndex === i ? "visible" : "hidden",
              }}
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
