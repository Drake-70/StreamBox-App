import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../layouts/AuthLayout";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    ageGroup: "adults",
    parentalPin: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", formData);
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showPin = formData.ageGroup !== "adults";

  return (
    <AuthLayout
      title="Create your StreamBox account"
      subtitle="Join StreamBox to watch Cameroonian films, anime & more."
      footer={
        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength="3"
            maxLength="30"
            autoComplete="username"
            className="auth-input"
            placeholder="Choose a username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
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
          <label htmlFor="ageGroup">Age group</label>
          <select
            id="ageGroup"
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleChange}
            className="auth-input"
          >
            <option value="adults">Adults (18+)</option>
            <option value="teens">Teens (13–17)</option>
            <option value="kids">Kids (under 13)</option>
          </select>
        </div>

        {showPin && (
          <div className="form-group">
            <label htmlFor="parentalPin">Parent PIN (4 digits)</label>
            <input
              id="parentalPin"
              type="text"
              inputMode="numeric"
              pattern="\\d{4}"
              maxLength="4"
              name="parentalPin"
              value={formData.parentalPin}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="1234"
            />
            <p className="helper-text">Parent PIN is required for kids/teens profiles.</p>
          </div>
        )}

        <p className="helper-text">
          By creating an account, you agree to our{" "}
          <Link to="/terms">Terms of Service</Link> and{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;