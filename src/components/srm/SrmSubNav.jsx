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
