import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { track } from "../services/analytics";
import { useAuth } from "../context/AuthContext";

const PLANS = [
  {
    id: "monthly",
    months: 1,
    label: "Monthly",
    price: 2000,
    period: "/month",
    badge: null,
    perMonth: 2000,
  },
  {
    id: "quarterly",
    months: 3,
    label: "Quarterly",
    price: 5400,
    period: "/3 months",
    badge: "Save 10%",
    perMonth: 1800,
  },
  {
    id: "biannual",
    months: 6,
    label: "Biannual",
    price: 10800,
    period: "/6 months",
    badge: "Save 10%",
    perMonth: 1800,
  },
  {
    id: "yearly",
    months: 12,
    label: "Yearly",
    price: 19200,
    period: "/year",
    badge: "Best Value • Save 20%",
    perMonth: 1600,
  },
];

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
  const [selected, setSelected] = useState(PLANS[0]);

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
    setLoading(true);
    try {
      track("subscribe_intent", { category: "premium", months: selected.months, plan: selected.id });
      window.CMO?.startFunnel?.("subscribe");
      window.CMO?.stepFunnel?.("subscribe", "intent");
      const res = await api.post("/payment/subscribe", {
        phone: formatPhone(phone),
        months: selected.months,
      });
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
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async (reference) => {
    for (let i = 0; i < 50; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await api.get(`/payment/status/${reference}`);
        if (res.data.status === "SUCCESSFUL") {
          setPolling(false);
          track("subscribe_success", { category: "premium", months: selected.months });
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
  const daysLeft = premium?.expiresAt
    ? Math.max(0, Math.ceil((new Date(premium.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="subscribe-page">
      <div className="subscribe-hero">
        <h1>
          Upgrade to <span className="premium-tag">StreamBox Premium</span>
        </h1>
        <p>
          Unlimited Cameroonian premieres, ad-free viewing, and early access — pay securely with MTN or Orange Mobile Money.
        </p>
      </div>

      {premium?.active && (
        <div className="premium-active-box">
          <strong>You are a Premium member.</strong>{" "}
          <span>
            Valid until {formatDate(premium.expiresAt)}
            {daysLeft !== null && daysLeft <= 7 && ` • ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
          </span>
        </div>
      )}

      <div className="subscribe-grid">
        <div className="subscribe-card">
          <h2>Choose your plan</h2>
          <div className="plan-row">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`plan-option ${selected.id === p.id ? "plan-option-active" : ""}`}
                onClick={() => setSelected(p)}
              >
                {p.badge && <span className="plan-badge">{p.badge}</span>}
                <div className="plan-option-title">{p.label}</div>
                <div className="plan-option-price">{p.price.toLocaleString()} XAF</div>
                <div className="plan-option-sub">{p.period}</div>
                <div className="plan-option-permonth">{p.perMonth.toLocaleString()} XAF / mo</div>
              </button>
            ))}
          </div>

          <div className="plan-summary">
            <div>
              <span className="plan-summary-label">Total due</span>
              <span className="plan-summary-value">{selected.price.toLocaleString()} XAF</span>
            </div>
            <div>
              <span className="plan-summary-label">Billing</span>
              <span className="plan-summary-value">{selected.months === 1 ? "Monthly" : `${selected.months} months`}</span>
            </div>
            <div>
              <span className="plan-summary-label">Effective</span>
              <span className="plan-summary-value">{selected.perMonth.toLocaleString()} XAF/mo</span>
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

            <button className="btn btn-primary btn-block" type="submit" disabled={polling || !phone || loading}>
              {polling ? "Waiting for approval..." : loading ? "Initiating..." : `Pay ${selected.price.toLocaleString()} XAF`}
            </button>
          </form>

          {ussd && (
            <div className="ussd-box">
              <div className="ussd-label">USSD to approve</div>
              <div className="ussd-code">{ussd}</div>
              <button type="button" className="link-btn" onClick={copyUssd}>
                Copy USSD
              </button>
              <p className="helper-text">Approve the prompt on your phone to complete payment.</p>
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
          <h2>Why go Premium</h2>
          <ul className="benefits-list">
            <li>✓ Unlimited access to the full catalogue</li>
            <li>✓ Ad-free viewing experience</li>
            <li>✓ Early access to new Cameroonian releases</li>
            <li>✓ Watch on phone, tablet or laptop</li>
            <li>✓ Secure MTN/Orange Mobile Money payments</li>
            <li>✓ Cancel anytime — no hidden fees</li>
          </ul>

          <div className="supported">
            <span>Supported networks</span>
            <div className="supported-logos">
              <span>MTN Mobile Money</span>
              <span>Orange Money</span>
            </div>
          </div>

          <div className="trust-note">
            <p>Pay securely in XAF. Subscriptions renew at the end of your billing period. You can cancel anytime.</p>
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