import { loginStyle as style } from "./loginStyles.js";

const LINKS = ["About", "Blogs", "Privacy", "Terms", "Help", "Contact"];

export function LoginNavbar() {
  return (
    <div style={style.loginHeader}>
      <div style={style.loginTitle}>Smart Revenue Management</div>
      <nav style={style.loginNav} aria-label="Footer links">
        {LINKS.map((l) => (
          <span key={l} style={style.loginNavLink} role="link" tabIndex={0}>
            {l}
          </span>
        ))}
      </nav>
    </div>
  );
}
