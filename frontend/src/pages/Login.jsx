import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-card">
          <h2 className="auth-title">Sign In</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="auth-input" />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? "Signing in..." : "Sign In"}</button>
          </form>
          <div className="auth-link">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <div className="auth-link">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;