import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PERKS = [
  {
    icon: "M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-4 6l-6 4V8l6 4z",
    text: "Resume watching exactly where you left off",
  },
  {
    icon: "M12 2a15 15 0 0 1 10 14c0 4-1 6-2 6s-2-2-4-2-3 2-4 2-1-2-4-2-3 2-4 2-1-2-2-6A15 15 0 0 1 12 2zm-2 9h4a1 1 0 0 0 0-2h-4a1 1 0 0 0 0 2zm0 3h4a1 1 0 0 0 0-2h-4a1 1 0 0 0 0 2z",
    text: "Family-safe profiles with kid-proof age filters",
  },
  {
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 5l6 5-6 5V7z",
    text: "500+ Cameroonian films, anime & African stories",
  },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay" />
      <nav className="auth-nav">
        <Link to="/" className="landing-logo">
          Stream<span>Box</span>
        </Link>
        <Link to="/" className="auth-nav-back">
          ← Back to homepage
        </Link>
      </nav>

      <div className="auth-wrap">
        <div className="auth-brand">
          <div className="auth-flag-bar" />
          <h2>Welcome back to StreamBox.</h2>
          <p className="auth-brand-sub">
            Pick up the film you started in Douala, finish it in Buea. Your watchlist is waiting.
          </p>
          <ul className="auth-perks">
            {PERKS.map((p, i) => (
              <li key={i}>
                <span className="auth-perk-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={p.icon} />
                  </svg>
                </span>
                {p.text}
              </li>
            ))}
          </ul>
          <div className="auth-flag-bar" />
        </div>

        <div className="auth-panel">
          <div className="auth-form">
            <h2>Sign In</h2>
            <p className="auth-form-sub">Log in to keep streaming.</p>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
            <p className="auth-link">
              New to StreamBox? <Link to="/register">Get started free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;