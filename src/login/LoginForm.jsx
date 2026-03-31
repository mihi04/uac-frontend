import { useState } from "react";
import { loginStyle as style } from "./loginStyles.js";

export function LoginForm({ onSubmit, onForgotPassword, submitting, serverError = "" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setErr("Please enter email and password.");
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setErr("Invalid email format.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    setErr("");
    onSubmit(email.trim(), password);
  }

  return (
    <form onSubmit={handleSubmit} style={style.loginCard} noValidate>
      <div>
        <div style={style.loginFieldLabel}>Email Id</div>
        <input
          style={style.loginInput}
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={submitting}
        />
      </div>
      <div>
        <div style={style.loginFieldLabel}>Password</div>
        <input
          style={style.loginInput}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          disabled={submitting}
        />
      </div>
      {(err || serverError) && (
        <div style={{ color: "#c0392b", fontSize: 12 }}>{err || serverError}</div>
      )}
      <button
        type="submit"
        style={{ ...style.loginBtn, ...(submitting ? style.loginBtnDisabled : {}) }}
        disabled={submitting}
      >
        {submitting ? "Signing in…" : "Login"}
      </button>
      <button
        type="button"
        style={{ ...style.loginLink, background: "none", border: "none", padding: 0, width: "100%" }}
        onClick={onForgotPassword}
      >
        Forgot Password?
      </button>
    </form>
  );
}
