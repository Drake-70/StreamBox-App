import React from "react";
import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            Stream<span>Box</span>
          </Link>
        </div>
        <div className="auth-card">
          {title && <h1 className="auth-title">{title}</h1>}
          {subtitle && <p className="auth-sub">{subtitle}</p>}
          {children}
        </div>
        {footer && <div className="auth-footer-note">{footer}</div>}
      </div>
    </div>
  );
}

export default AuthLayout;