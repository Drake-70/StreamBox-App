import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Reset code sent");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { email, code, password });
      setMessage(res.data.message || "Password reset successful");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-card">
          <h2 className="auth-title">Forgot Password</h2>
          {step === 1 ? (
            <form onSubmit={handleRequest} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" />
              </div>
              {error && <div className="error">{error}</div>}
              {message && <div className="success">{message}</div>}
              <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? "Sending..." : "Send Reset Code"}</button>
              <div className="auth-link">
                <Link to="/login">Back to Login</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" />
              </div>
              <div className="form-group">
                <label>6-digit Code</label>
                <input type="text" maxLength="6" pattern="\d{6}" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required className="auth-input" placeholder="123456" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="auth-input" minLength="6" />
              </div>
              {error && <div className="error">{error}</div>}
              {message && <div className="success">{message}</div>}
              <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? "Resetting..." : "Reset Password"}</button>
              <div className="auth-link">
                <Link to="/login">Back to Login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;