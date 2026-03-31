import { useState } from "react";
import { useAuth } from "./auth/AuthContext.jsx";
import { LoginLayout } from "./login/LoginLayout.jsx";
import { LoginForm } from "./login/LoginForm.jsx";
import { ForgotPasswordScreen } from "./login/ForgotPasswordScreen.jsx";
import { SmartRevenueApp } from "./SmartRevenueManagement.jsx";

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [authView, setAuthView] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  async function handleLogin(email, password) {
    setLoginError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (e) {
      setLoginError(e.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8edf1",
          fontFamily: "Segoe UI, sans-serif",
          color: "#1a2a33",
        }}
      >
        Loading…
      </div>
    );
  }

  if (user) {
    return <SmartRevenueApp user={user} onLogout={logout} />;
  }

  if (authView === "forgot") {
    return <ForgotPasswordScreen onBack={() => setAuthView("login")} />;
  }

  return (
    <LoginLayout>
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={() => setAuthView("forgot")}
        submitting={submitting}
        serverError={loginError}
      />
    </LoginLayout>
  );
}
