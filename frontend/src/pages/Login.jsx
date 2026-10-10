import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token } = res.data;
      setAuthToken(token);
      localStorage.setItem("streambox_token", token);
      await login();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to StreamBox"
      subtitle="Welcome back. Sign in to continue watching."
      footer={
        <div className="auth-switch">
          New to StreamBox? <Link to="/register">Create an account</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
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
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="auth-input"
              placeholder="Enter your password"
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

        <div className="auth-row">
          <div />
          <Link to="/forgot-password" className="auth-link-text">
            Forgot password?
          </Link>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;