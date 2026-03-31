import { LoginNavbar } from "./LoginNavbar.jsx";
import { LoginHero } from "./LoginHero.jsx";
import { LoginFooter } from "./LoginFooter.jsx";
import { loginStyle as style } from "./loginStyles.js";

export function LoginLayout({ children }) {
  return (
    <div style={style.loginWrap}>
      <LoginNavbar />
      <div style={style.loginBody}>
        <LoginHero />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      </div>
      <LoginFooter />
    </div>
  );
}
