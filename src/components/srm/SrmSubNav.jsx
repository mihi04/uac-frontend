import { srmStyle as style } from "./srmStyles.js";

export function SrmSubNav({
  menuOpen,
  setMenuOpen,
  adminOpen,
  setAdminOpen,
  menuItems,
  adminItems,
  onNavigate,
  onHome,
  onBack,
  onForward,
  canGoBack,
  canGoForward,
}) {
  return (
    <div style={style.subNav}>
      <span style={style.navItem} onClick={onHome}>
        Home
      </span>
      <span
        style={style.navItem}
        onClick={() => {
          setMenuOpen(o => !o);
          setAdminOpen(false);
        }}
      >
        Menu {menuOpen ? "▼" : "▶"}
      </span>
      {adminItems.length > 0 && (
        <span
          style={style.navItem}
          onClick={() => {
            setAdminOpen(o => !o);
            setMenuOpen(false);
          }}
        >
          Admin {adminOpen ? "▼" : "▶"}
        </span>
      )}
      <div style={style.subNavNavEnd}>
        <span
          style={{ ...style.navItem, ...(canGoBack ? {} : style.navItemDisabled) }}
          onClick={canGoBack ? onBack : undefined}
          role="button"
          tabIndex={canGoBack ? 0 : -1}
          title="Back"
          aria-label="Back"
        >
          ◀ Back
        </span>
        <span
          style={{ ...style.navItem, ...(canGoForward ? {} : style.navItemDisabled) }}
          onClick={canGoForward ? onForward : undefined}
          role="button"
          tabIndex={canGoForward ? 0 : -1}
          title="Forward"
          aria-label="Forward"
        >
          Forward ▶
        </span>
      </div>
      {menuOpen && (
        <div style={{ ...style.dropdown, left: 80 }}>
          {menuItems.map(item => (
            <div
              key={item.label}
              style={style.dropdownItem}
              onMouseEnter={e => {
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={e => {
                e.target.style.background = "";
              }}
              onClick={() => onNavigate(item.screen)}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
      {adminOpen && adminItems.length > 0 && (
        <div style={{ ...style.dropdown, left: 180 }}>
          {adminItems.map(item => (
            <div
              key={item.label}
              style={style.dropdownItem}
              onMouseEnter={e => {
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={e => {
                e.target.style.background = "";
              }}
              onClick={() => onNavigate(item.screen)}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
