import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { track } from "../services/analytics";
import { useAuth } from "../context/AuthContext";

function Subscribe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState(2000);
  const [premium, setPremium] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  const [ussd, setUssd] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const loadStatus = async () => {
    try {
      const res = await api.get("/payment/me");
      setPremium(res.data.premium);
      setPricePerMonth(res.data.pricePerMonth || 2000);
      setPayments(res.data.payments || []);
    } catch (e) {}
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    let t;
    if (polling) {
      t = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(t);
  }, [polling]);

  const formatPhone = (v) => {
    let s = v.replace(/[^0-9+]/g, "");
    if (s.startsWith("+237")) s = "237" + s.slice(4).replace(/^0+/, "");
    if (s.startsWith("237") && s.length > 3) s = "237" + s.slice(3).replace(/^0+/, "");
    if (!s.startsWith("237") && /^\d{9}$/.test(s)) s = "237" + s;
    return s;
  };

  const startPayment = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setUssd("");
    try {
      track("subscribe_intent", { category: "premium" });
      window.CMO?.startFunnel?.("subscribe");
      window.CMO?.stepFunnel?.("subscribe", "intent");
      const res = await api.post("/payment/subscribe", { phone: formatPhone(phone), months: 1 });
      window.CMO?.stepFunnel?.("subscribe", "initiated");
      window.CMO?.identify?.(phone);
      setPaymentRef(res.data.payment.reference);
      setUssd(res.data.payment.ussdCode || "");
      setMessage(
        res.data.message ||
          "Check your phone and approve the Mobile Money prompt to complete payment."
      );
      setPolling(true);
      await pollStatus(res.data.payment.reference);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start payment.");
    }
  };

  const pollStatus = async (reference) => {
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      try {
        const res = await api.get(`/payment/status/${reference}`);
        if (res.data.status === "SUCCESSFUL") {
          setPolling(false);
          track("subscribe_success", { category: "premium" });
          window.CMO?.stepFunnel?.("subscribe", "paid");
          window.CMO?.completeFunnel?.("subscribe");
          setMessage("Payment successful! Premium is now active.");
          setPremium((prev) => ({ ...prev, active: true }));
          await loadStatus();
          return;
        }
        if (res.data.status === "FAILED") {
          setPolling(false);
          setError("Payment failed. Please try again.");
          return;
        }
      } catch (e) {}
    }
    setPolling(false);
    setMessage("Still waiting for approval. Check your phone or retry.");
  };

  const copyUssd = async () => {
    if (!ussd) return;
    try {
      await navigator.clipboard.writeText(ussd);
    } catch (e) {}
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <div className="subscribe-page">
      <div className="subscribe-hero">
        <h1>
          Upgrade to <span className="premium-tag">StreamBox Premium</span>
        </h1>
        <p>
          Unlock unlimited access to Cameroonian premieres, premium movies, and ad-free viewing with MTN/Orange Mobile Money.
        </p>
      </div>

      {premium?.active && (
        <div className="premium-active-box">
          <strong>You are a Premium member.</strong>{" "}
          <span>Valid until {formatDate(premium.expiresAt)}.</span>
        </div>
      )}

      <div className="subscribe-grid">
        <div className="subscribe-card">
          <h2>Choose Plan</h2>
          <div className="plan-row">
            <div className="plan-option plan-option-active">
              <div className="plan-option-title">Monthly</div>
              <div className="plan-option-price">{pricePerMonth} XAF</div>
              <div className="plan-option-sub">/month</div>
            </div>
          </div>

          <form className="subscribe-form" onSubmit={startPayment}>
            <label htmlFor="phone">MTN / Orange Mobile Money number</label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="2376XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={polling}
              required
            />
            <p className="helper-text">Format: 237 followed by your 9-digit number (or enter 6XXXXXXXX).</p>

            <button className="btn btn-primary btn-block" type="submit" disabled={polling || !phone}>
              {polling ? "Waiting for approval..." : "Pay with Mobile Money"}
            </button>
          </form>

          {ussd && (
            <div className="ussd-box">
              <div className="ussd-label">USSD to approve</div>
              <div className="ussd-code">{ussd}</div>
              <button type="button" className="link-btn" onClick={copyUssd}>
                Copy USSD
              </button>
            </div>
          )}

          {polling && (
            <div className="poll-info">
              <div className="poll-bar" />
              <p>Waiting for Mobile Money approval... ({elapsed}s)</p>
            </div>
          )}

          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
        </div>

        <div className="subscribe-card">
          <h2>Premium Benefits</h2>
          <ul className="benefits-list">
            <li>✓ Unlimited access to premium catalogue</li>
            <li>✓ Ad-free viewing experience</li>
            <li>✓ Early access to new Cameroonian releases</li>
            <li>✓ Watch on any device</li>
            <li>✓ Secure Mobile Money payments</li>
            <li>✓ Cancel anytime</li>
          </ul>

          <div className="supported">
            <span>Supported:</span>
            <div className="supported-logos">
              <span>MTN</span>
              <span>Orange</span>
            </div>
          </div>
        </div>
      </div>

      <div className="payments-history">
        <h2>Payment History</h2>
        {payments.length === 0 ? (
          <p className="muted">No payments yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{formatDate(p.createdAt)}</td>
                    <td className="ref-cell">{p.reference}</td>
                    <td>{p.amount} XAF</td>
                    <td>
                      <span className={`pay-status ${p.status?.toLowerCase()}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="subscribe-actions">
        <Link to="/" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Subscribe;