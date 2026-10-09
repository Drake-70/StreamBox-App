import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PERKS = [
  {
    icon: "M12 2a15 15 0 0 1 10 14c0 4-1 6-2 6s-2-2-4-2-3 2-4 2-1-2-4-2-3 2-4 2-1-2-2-6A15 15 0 0 1 12 2zm-2 9h4a1 1 0 0 0 0-2h-4a1 1 0 0 0 0 2zm0 3h4a1 1 0 0 0 0-2h-4a1 1 0 0 0 0 2z",
    text: "Free forever plan — no payment details needed",
  },
  {
    icon: "M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-4 6l-6 4V8l6 4z",
    text: "Watch on phone, tablet, laptop, or TV",
  },
  {
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 5l6 5-6 5V7z",
    text: "Upgrade to Premium with Orange Money or MTN Money",
  },
];

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageGroup, setAgeGroup] = useState("kids");
  const [parentalPin, setParentalPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const pinRequired = ageGroup !== "adults";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (pinRequired && !/^\d{4}$/.test(parentalPin)) {
      setError("A 4-digit parent PIN is required for a kids/teens profile.");
      return;
    }
    if (parentalPin && !/^\d{4}$/.test(parentalPin)) {
      setError("Parent PIN must be 4 digits.");
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password, ageGroup, parentalPin || undefined);
      window.CMO?.startFunnel?.("signup");
      window.CMO?.stepFunnel?.("signup", "submitted");
      window.CMO?.completeFunnel?.("signup");
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          <h2>Join Cameroon's home for film & anime.</h2>
          <p className="auth-brand-sub">
            One free account, four family profiles, and the whole of Cameroonian cinema
            at your fingertips.
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
            <h2>Sign Up</h2>
            <p className="auth-form-sub">Free forever. No card required.</p>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                />
              </div>
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
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
                  <option value="kids">Kids (Under 13)</option>
                  <option value="teens">Teens (13-17)</option>
                  <option value="adults">Adults (18+)</option>
                </select>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="\d{4}"
                  placeholder={
                    pinRequired
                      ? "4-digit Parent PIN (required)"
                      : "4-digit Parent PIN (optional, recommended)"
                  }
                  value={parentalPin}
                  onChange={(e) => setParentalPin(e.target.value.replace(/\D/g, ""))}
                />
                <small
                  style={{
                    display: "block",
                    color: "#999",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {pinRequired
                    ? "A parent PIN protects this profile. It is required to change the age-group filter."
                    : "Setting a parent PIN will require it to change the age-group filter later."}
                </small>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>
            <p className="auth-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;