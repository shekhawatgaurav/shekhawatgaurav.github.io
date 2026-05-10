import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { loginAdmin } from "../../firebase/auth";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/common/Loader";

function Login() {
  const { isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberEmail, setRememberEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_saved_email") || "";
    const remember = localStorage.getItem("admin_remember_email");

    if (remember !== "false") {
      setRememberEmail(true);
      setEmail(savedEmail);
    } else {
      setRememberEmail(false);
    }
  }, []);

  if (loading) {
    return <Loader text="Checking admin session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function isValidEmail(value = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function getLoginErrorMessage(err) {
    const code = err?.code || "";

    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }

    if (
      code === "auth/user-not-found" ||
      code === "auth/wrong-password" ||
      code === "auth/invalid-credential"
    ) {
      return "Invalid email or password.";
    }

    if (code === "auth/too-many-requests") {
      return "Too many failed login attempts. Please try again later.";
    }

    if (code === "auth/network-request-failed") {
      return "Network error. Please check your internet connection.";
    }

    return "Invalid login details or admin access not allowed.";
  }

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      await loginAdmin(cleanEmail, password);

      if (rememberEmail) {
        localStorage.setItem("admin_saved_email", cleanEmail);
        localStorage.setItem("admin_remember_email", "true");
      } else {
        localStorage.removeItem("admin_saved_email");
        localStorage.setItem("admin_remember_email", "false");
      }
    } catch (err) {
      console.error(err);
      setError(getLoginErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <ShieldCheck size={28} />
        </div>

        <h1>Admin Login</h1>
        <p>Login to manage Scratch Pixel rewards, users and withdrawals.</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            autoComplete="email"
            disabled={isSubmitting}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            autoComplete="current-password"
            disabled={isSubmitting}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="form-row checkbox-row" style={{ marginBottom: 12 }}>
            <label>
              <input
                type="checkbox"
                checked={rememberEmail}
                disabled={isSubmitting}
                onChange={(e) => setRememberEmail(e.target.checked)}
              />
              Remember email on this device
            </label>
          </div>

          <button type="submit" disabled={isSubmitting}>
            <LockKeyhole size={18} />
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <Link to="/forgot-password" className="auth-link">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}

export default Login;