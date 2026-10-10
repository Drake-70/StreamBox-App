import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { setAuthToken } from "../services/api";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", { email, code });
      if (res.data.token) {
        setAuthToken(res.data.token);
        localStorage.setItem("streambox_token", res.data.token);
      }
      setMessage(res.data.message || "Email verified");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    try {
      const res = await api.post("/auth/resend-verification", { email });
      setMessage(res.data.message || "Code resent");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-card">
          <h2 className="auth-title">Verify your email</h2>
          <p className="auth-sub">Enter the 6-digit code sent to {email}</p>
          <form onSubmit={handleVerify} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" />
            </div>
            <div className="form-group">
              <label>Verification Code</label>
              <input type="text" maxLength="6" pattern="\d{6}" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required className="auth-input" placeholder="123456" />
            </div>
            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? "Verifying..." : "Verify"}</button>
          </form>
          <div className="auth-link" style={{ marginTop: 16 }}>
            <button type="button" onClick={handleResend} className="link-btn">Resend code</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;