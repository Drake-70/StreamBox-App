import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../layouts/AuthLayout";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (step !== 2) return;
    const t = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  const handleChangeOtp = (e, idx) => {
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

  const handleKeyDownOtp = (e, idx) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePasteOtp = (e) => {
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

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Reset code sent");
      setStep(2);
      setCountdown(60);
      setCode(Array(6).fill(""));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResendLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Reset code sent");
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend");
    } finally {
      setResendLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { email, code: getCodeString(), password });
      setMessage(res.data.message || "Password reset successful");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle={
        step === 1
          ? "Enter your email address and we'll send you a 6-digit code to reset your password."
          : step === 2
          ? "Enter the 6-digit code we sent to your email."
          : "Create a new password for your account."
      }
      footer={
        <div className="auth-switch">
          <Link to="/login">Back to Sign in</Link>
        </div>
      }
    >
      <div className="step-indicator">
        <span className={`step-dot ${step >= 1 ? "active" : ""}`} />
        <span className={`step-dot ${step >= 2 ? "active" : ""}`} />
        <span className={`step-dot ${step >= 3 ? "active" : ""}`} />
        <span>Step {step} of 3</span>
      </div>

      {step === 1 && (
        <form onSubmit={handleRequest} className="auth-form">
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
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? "Sending..." : "Send reset code"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(3);
          }}
          className="auth-form"
        >
          <div className="form-group">
            <label>Verification code</label>
            <div className="otp-row" onPaste={handlePasteOtp}>
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  value={code[i]}
                  onChange={(e) => handleChangeOtp(e, i)}
                  onKeyDown={(e) => handleKeyDownOtp(e, i)}
                  className="otp-input"
                  maxLength="1"
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <button type="submit" disabled={getCodeString().length < 6} className="btn btn-primary btn-block">
            Continue
          </button>
          <div className="resend-wrap">
            <span>Didn't get a code?</span>
            <button type="button" onClick={handleResend} className="link-btn" disabled={resendLoading || countdown > 0}>
              {countdown > 0 ? `Resend in ${countdown}s` : resendLoading ? "Sending..." : "Resend code"}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleReset} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword">New password</label>
            <div className="input-wrap">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                autoComplete="new-password"
                className="auth-input"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              autoComplete="new-password"
              className="auth-input"
              placeholder="Re-enter password"
            />
          </div>

          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;