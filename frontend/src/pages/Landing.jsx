import React from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "M12 3l7 2v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V5l7-2z",
    title: "Cameroonian Cinema",
    desc: "Stream the best films from Cameroon — from Yaoundé to Douala, Buea to Bamenda.",
  },
  {
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 5l6 5-6 5V7z",
    title: "Anime Collection",
    desc: "Curated anime series and movies for every age group, dubbed and subbed.",
  },
  {
    icon: "M12 2l7 3.5V11c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V5.5L12 2zM8 12l3 3 5-6",
    title: "Age-Group Filtering",
    desc: "Safe content for kids, teens, and adults — automatically filtered by age group.",
  },
  {
    icon: "M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-4 6l-6 4V8l6 4z",
    title: "Watch Anywhere",
    desc: "Phone, tablet, laptop, or TV — pick up on any device with your StreamBox account.",
  },
  {
    icon: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM17 12a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2z",
    title: "Smart Payments",
    desc: "Pay with Orange Money, MTN Mobile Money, or card — in Francs CFA, your way.",
  },
  {
    icon: "M12 2a15 15 0 0 1 10 14c0 4-1 6-2 6s-2-2-4-2-3 2-4 2-1-2-4-2-3 2-4 2-1-2-2-6A15 15 0 0 1 12 2z",
    title: "African Stories",
    desc: "Celebrate the richness of Cameroonian culture, folklore, and storytelling.",
  },
];

const CATEGORIES = [
  { label: "Cameroonian Movies", color: "#008751" },
  { label: "Anime", color: "#CE1126" },
  { label: "Documentaries", color: "#FCD116" },
  { label: "Series", color: "#008751" },
  { label: "Short Films", color: "#CE1126" },
];

const STEPS = [
  {
    n: "01",
    title: "Create a free account",
    desc: "Sign up in under a minute, pick a profile, and tell us the age group it belongs to.",
  },
  {
    n: "02",
    title: "Pick your age group",
    desc: "Kids, teens, or adults. The catalogue filters itself and your kids only ever see what's right for them.",
  },
  {
    n: "03",
    title: "Start streaming",
    desc: "Watch on any device. Save to your watchlist, resume where you left off, and upgrade to Premium anytime.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "0 FCFA",
    period: "forever",
    tagline: "Everything you need to get started.",
    features: [
      "Full access to the free catalogue",
      "Kids, teens & adults profiles",
      "Watchlist + resume playback",
      "Family-safe age filters",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Premium",
    price: "2 000 FCFA",
    period: "per month",
    tagline: "The whole of Cameroon's cinema, unlocked.",
    features: [
      "Everything in Free",
      "Unlimited full catalogue access",
      "Early access to new releases",
      "Pay by Orange Money / MTN Money",
      "Cancel anytime",
    ],
    cta: "Go Premium",
    highlight: true,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Finally our family can watch local Cameroonian films without worrying about what the kids will stumble into. The age filter is a game-changer.",
    name: "Mireille N.",
    role: "Mom of three, Douala",
  },
  {
    quote:
      "The anime selection is fresh and dubbed. I pay with MTN Money in seconds — no card needed.",
    name: "Cédric A.",
    role: "Student, Yaoundé",
  },
  {
    quote:
      "From Bamenda documentaries to Douala dramas — StreamBox really feels like home on screen.",
    name: "Nana T.",
    role: "Filmmaker, Buea",
  },
];

const FAQS = [
  {
    q: "What devices can I watch on?",
    a: "Any device with a browser — phone, tablet, laptop, or smart TV. Sign in on one, pick up where you left off on another.",
  },
  {
    q: "How do I pay for Premium?",
    a: "Premium is 2,000 FCFA/month and you can pay by Orange Money, MTN Mobile Money, or card — right from the app. No contract, cancel anytime.",
  },
  {
    q: "How does the age filtering work?",
    a: "Each profile picks an age group (kids, teens, or adults). The catalogue and search results are filtered automatically, and changing a kids/teens profile requires a parent PIN.",
  },
  {
    q: "Is there really Cameroonian content?",
    a: "Yes — that's the heart of StreamBox. Feature films, series, documentaries, and short films from across Cameroon, alongside curated international anime.",
  },
  {
    q: "Can I cancel Premium anytime?",
    a: "Absolutely. Your Premium stays active until the end of the paid month, then reverts to Free automatically. No hidden fees.",
  },
];

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
];

function Landing() {
  return (
    <div className="landing">
      {/* ===== NAVBAR ===== */}
      <nav className="landing-nav">
        <Link to="/" className="landing-logo">
          Stream<span>Box</span>
        </Link>
        <div className="landing-nav-menu">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="landing-nav-link">
              {l.label}
            </a>
          ))}
        </div>
        <div className="landing-nav-right">
          <Link to="/login" className="landing-nav-link">
            Sign In
          </Link>
          <Link to="/register" className="landing-cta-btn">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="landing-hero" id="top">
        <div className="landing-hero-pattern" />
        <div className="landing-hero-content">
          <div className="landing-flag-bar" />
          <div className="hero-eyebrow">
            🇨🇲 Built for Cameroon · Streaming the world
          </div>
          <h1>
            Cameroon's Home for
            <br />
            <span className="hero-highlight">Movies</span> &{" "}
            <span className="hero-highlight-alt">Anime</span>
          </h1>
          <p className="landing-hero-sub">
            StreamBox brings you the finest Cameroonian cinema, captivating anime, and
            African stories — all filtered by age group for the whole family.
          </p>
          <div className="landing-hero-actions">
            <Link to="/register" className="landing-btn-primary">
              Start Watching Free
            </Link>
            <a href="#pricing" className="landing-btn-secondary">
              See Pricing
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>500+</strong>
              <span>films & series</span>
            </div>
            <div className="hero-stat">
              <strong>3</strong>
              <span>age-group profiles</span>
            </div>
            <div className="hero-stat">
              <strong>Mobile Money</strong>
              <span>Orange · MTN · Card</span>
            </div>
            <div className="hero-stat">
              <strong>2 000 FCFA</strong>
              <span>premium / month</span>
            </div>
          </div>
        </div>
        <div className="landing-hero-mosaic">
          <div className="mosaic-tile" style={{ background: "#008751" }} />
          <div className="mosaic-tile" style={{ background: "#CE1126" }} />
          <div className="mosaic-tile" style={{ background: "#FCD116" }} />
          <div className="mosaic-tile" style={{ background: "#008751" }} />
          <div className="mosaic-tile" style={{ background: "#CE1126" }} />
          <div className="mosaic-tile" style={{ background: "#FCD116" }} />
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="landing-how" id="how">
        <h2 className="section-title">
          How <span className="cm-title">StreamBox</span> Works
        </h2>
        <p className="section-sub">Three steps between you and Cameroon's best stories.</p>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.n} className="step-card">
              <div className="step-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="landing-features" id="features">
        <h2 className="section-title">
          Why <span className="cm-title">StreamBox</span>?
        </h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="landing-categories" id="categories">
        <h2 className="section-title">
          Explore <span className="cm-title">Categories</span>
        </h2>
        <div className="categories-strip">
          {CATEGORIES.map((cat, i) => (
            <div key={i} className="category-pill" style={{ borderColor: cat.color, color: cat.color }}>
              <span className="cat-dot" style={{ background: cat.color }} />
              {cat.label}
            </div>
          ))}
        </div>
      </section>

      {/* ===== AGE GROUPS ===== */}
      <section className="landing-age-section" id="age">
        <h2 className="section-title">
          Content for <span className="cm-title">Every Age</span>
        </h2>
        <div className="age-cards">
          <div className="age-card age-card-kids">
            <div className="age-card-badge">KIDS</div>
            <h3>Under 13</h3>
            <p>Safe, fun, and educational content for the little ones. Family-friendly Cameroonian stories and anime adventures.</p>
          </div>
          <div className="age-card age-card-teens">
            <div className="age-card-badge">TEENS</div>
            <h3>13 - 17</h3>
            <p>Exciting anime, coming-of-age stories, and Cameroon's vibrant youth culture captured on screen.</p>
          </div>
          <div className="age-card age-card-adults">
            <div className="age-card-badge">ADULTS</div>
            <h3>18+</h3>
            <p>The full catalogue. Thrillers, dramas, documentaries — all of Cameroon's cinematic brilliance.</p>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="landing-pricing" id="pricing">
        <h2 className="section-title">
          Simple, <span className="cm-title">Honest Pricing</span>
        </h2>
        <p className="section-sub">Start free. Go Premium when you're ready — pay the Cameroonian way.</p>
        <div className="plans-grid">
          {PLANS.map((p) => (
            <div key={p.name} className={`plan-card${p.highlight ? " plan-card-hot" : ""}`}>
              {p.highlight && <div className="plan-badge">Most popular</div>}
              <h3>{p.name}</h3>
              <div className="plan-price">
                {p.price}
                <span>{p.period}</span>
              </div>
              <p className="plan-tagline">{p.tagline}</p>
              <ul className="plan-features">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link to="/register" className={p.highlight ? "landing-btn-primary plan-cta" : "landing-btn-secondary plan-cta"}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="landing-testimonials" id="testimonials">
        <h2 className="section-title">
          Loved by <span className="cm-title">Families</span> Across Cameroon
        </h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-quote">“</div>
              <p>{t.quote}</p>
              <div className="testimonial-author">
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="landing-faq" id="faq">
        <h2 className="section-title">
          Frequently Asked <span className="cm-title">Questions</span>
        </h2>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <details key={i} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ===== CTA BAND ===== */}
      <section className="landing-cta-band" id="get-started">
        <div className="cta-band-inner">
          <h2>Your next favourite film is one click away.</h2>
          <p>Join thousands of Cameroonian families streaming homegrown stories today.</p>
          <Link to="/register" className="landing-btn-primary">
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer" id="contact">
        <div className="footer-pattern" />
        <div className="footer-columns">
          <div className="footer-col footer-col-about">
            <div className="footer-logo">
              Stream<span>Box</span>
            </div>
            <p className="footer-tagline">The Heart of Cameroonian Streaming</p>
            <p className="footer-note">
              Films, anime, and African stories for the whole family — streamed with pride from Cameroon.
            </p>
            <div className="footer-flag" />
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <div className="footer-links footer-links-col">
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#pricing">Pricing</a>
              <Link to="/register">Sign Up</Link>
              <Link to="/login">Sign In</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <div className="footer-links footer-links-col">
              <a href="#testimonials">Reviews</a>
              <a href="#faq">FAQ</a>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Get in touch</h4>
            <div className="footer-links footer-links-col">
              <span className="footer-contact">📍 Douala · Yaoundé · Buea</span>
              <span className="footer-contact">✉️ hello@streambox.cm</span>
              <span className="footer-contact">📞 +237 6 00 00 00 00</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} StreamBox. Made with love in Cameroon. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;