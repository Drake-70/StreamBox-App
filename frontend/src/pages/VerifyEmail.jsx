import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { setAuthToken } from "../services/api";
import AuthLayout from "../layouts/AuthLayout";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState(Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) return;
    const t = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [email]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      const newCode = [...code];
      newCode[idx] = "";
      setCode(newCode);
      return;
    }
    const newCode = [...code];
    newCode[idx] = val[val.length - 1];
    setCode(newCode);
    if (idx < 5 && val) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newCode = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) newCode[i] = pasted[i];
    setCode(newCode);
    const next = Math.min(pasted.length, 5);
    inputsRef.current[next]?.focus();
  };

  const getCodeString = () => code.join("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", { email, code: getCodeString() });
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
    setResendLoading(true);
    try {
      const res = await api.post("/auth/resend-verification", { email });
      setMessage(res.data.message || "Code resent");
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email || "your email"}. Enter it below to verify your account.`}
    >
      <form onSubmit={handleVerify} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="auth-input"
            placeholder="name@example.com"
          />
        </div>

        <div className="form-group">
          <label>Verification code</label>
          <div className="otp-row" onPaste={handlePaste}>
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                value={code[i]}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="otp-input"
                maxLength="1"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <button type="submit" disabled={loading || getCodeString().length < 6} className="btn btn-primary btn-block">
          {loading ? "Verifying..." : "Verify email"}
        </button>

        <div className="resend-wrap">
          <span>Didn't get a code?</span>
          <button type="button" onClick={handleResend} className="link-btn" disabled={resendLoading || countdown > 0}>
            {countdown > 0 ? `Resend in ${countdown}s` : resendLoading ? "Sending..." : "Resend code"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

export default VerifyEmail;