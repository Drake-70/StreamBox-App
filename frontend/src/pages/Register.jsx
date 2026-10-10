import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", ageGroup: "adults", parentalPin: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", formData);
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const showPin = formData.ageGroup !== "adults";

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-card">
          <h2 className="auth-title">Create Account</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required className="auth-input" minLength="3" maxLength="30" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="auth-input" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="auth-input" minLength="6" />
            </div>
            <div className="form-group">
              <label>Age Group</label>
              <select name="ageGroup" value={formData.ageGroup} onChange={handleChange} className="auth-input">
                <option value="adults">Adults (18+)</option>
                <option value="teens">Teens (13-17)</option>
                <option value="kids">Kids (under 13)</option>
              </select>
            </div>
            {showPin && (
              <div className="form-group">
                <label>Parent PIN (4 digits)</label>
                <input type="text" name="parentalPin" maxLength="4" pattern="\d{4}" value={formData.parentalPin} onChange={handleChange} required className="auth-input" placeholder="1234" />
              </div>
            )}
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? "Creating..." : "Sign Up"}</button>
          </form>
          <div className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;