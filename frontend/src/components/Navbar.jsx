import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const navLinkClass = (path) => `nav-link ${location.pathname === path ? "active" : ""}`;

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <Link to={user ? "/home" : "/"} className="navbar-logo">
          <span className="logo-stream">Stream</span>
          <span className="logo-box">Box</span>
        </Link>

        {user && (
          <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
            <Link to="/home" className={navLinkClass("/home")}>
              Home
            </Link>
            <Link to="/catalog" className={navLinkClass("/catalog")}>
              Catalog
            </Link>
            <Link to="/search" className={navLinkClass("/search")}>
              Browse
            </Link>
            <Link to="/watchlist" className={navLinkClass("/watchlist")}>
              My List
            </Link>
            <Link to="/history" className={navLinkClass("/history")}>
              History
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className={navLinkClass("/admin")}>
                Admin
              </Link>
            )}
          </nav>
        )}

        <div className="navbar-right">
          {user && (
            <form className="navbar-search" onSubmit={handleSearch}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Titles, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          )}

          {user && !user.premium?.active && (
            <Link to="/subscribe" className="navbar-premium">
              Go Premium
            </Link>
          )}

          {user && <span className={`age-badge ${user.ageGroup}`}>{user.ageGroup}</span>}

          {user && (
            <button
              className="navbar-avatar"
              onClick={() => navigate("/profile")}
              aria-label="Profile"
            >
              {user?.username?.[0]?.toUpperCase() || "U"}
            </button>
          )}

          {!user && (
            <div className="nav-auth">
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary nav-cta">
                Get Started
              </Link>
            </div>
          )}

          {user && (
            <button
              className={`menu-toggle ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;