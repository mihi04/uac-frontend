import { useState } from "react";
import { loginStyle as style } from "./loginStyles.js";
import { LoginNavbar } from "./LoginNavbar.jsx";
import { LoginFooter } from "./LoginFooter.jsx";

export function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return;
    setSubmitted(true);
  }

  return (
    <div style={style.loginWrap}>
      <LoginNavbar />
      <div style={{ ...style.loginBody, justifyContent: "center", paddingTop: 20 }}>
        <div style={{ ...style.loginCard, width: "min(360px, 92vw)" }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#333", marginBottom: 8 }}>Forgot password</div>
          <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.45 }}>
            Enter your account email. If password reset is enabled for your organization, you will receive
            instructions (this app does not yet call a reset API).
          </p>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div style={style.loginFieldLabel}>Email Id</div>
              <input
                style={style.loginInput}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
              />
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" style={{ ...style.loginBtn, flex: 1, background: "#5a7a88" }} onClick={onBack}>
                  Back to login
                </button>
                <button type="submit" style={{ ...style.loginBtn, flex: 1 }}>
                  Submit
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: "#2e6e82", marginTop: 8 }}>
                If an account exists for <strong>{email}</strong>, password reset instructions would be sent when the
                backend endpoint is available.
              </p>
              <button type="button" style={{ ...style.loginBtn, width: "100%" }} onClick={onBack}>
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
      <LoginFooter />
    </div>
  );
}
