import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

import { resetAdminPassword } from "../../firebase/auth";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function isValidEmail(value = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function getResetErrorMessage(err) {
    const code = err?.code || "";

    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }

    if (code === "auth/user-not-found") {
      return "No admin account found with this email.";
    }

    if (code === "auth/too-many-requests") {
      return "Too many requests. Please try again later.";
    }

    if (code === "auth/network-request-failed") {
      return "Network error. Please check your internet connection.";
    }

    return "Unable to send password reset link.";
  }

  async function handleReset(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your admin email address.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await resetAdminPassword(cleanEmail);

      setMessage("Password reset link sent. Please check your email inbox.");
    } catch (err) {
      console.error(err);
      setError(getResetErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Mail size={28} />
        </div>

        <h1>Reset Password</h1>
        <p>Enter your admin email and we will send a reset link.</p>

        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleReset}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            autoComplete="email"
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            <Mail size={18} />
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link to="/login" className="auth-link">
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;