require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");

const authRoutes = require("./routes/auth");
const contentRoutes = require("./routes/content");
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");
const ratingRoutes = require("./routes/ratings");
const analyticsRoutes = require("./routes/analytics");
const contentSync = require("./services/contentSync");
const { expireSubscriptions } = require("./services/subscriptionExpiry");

const app = express();

app.use(helmet());

// CORS origin is env-driven so the same build works in dev (localhost) and
// after deployment to a real domain. Comma-separated list supported.
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || corsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);
// Handle preflight for all routes
app.options("*", cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// Public health endpoint for Render's health check. Must stay cheap, unauthed
// and outside the rate limiter so platform probes are never throttled.
app.get("/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.status(200).json({
    status: "ok",
    mongo: states[mongoose.connection.readyState] || "unknown",
    uptime: Math.round(process.uptime()),
  });
});

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

mongoose.connection.on("disconnected", () => {
  console.error("[mongo] Connection disconnected — waiting for mongoose reconnect");
});
mongoose.connection.on("error", (err) => {
  console.error("[mongo] Connection error:", err.message);
});

// Bind the port immediately so Render's health check can pass during cold
// starts and while MongoDB is still connecting/reconnecting (the Camtel egress
// IP is dynamic, so transient Atlas network/whitelist blips are expected).
app.listen(PORT, () => console.log(`StreamBox server running on port ${PORT}`));

let cronsStarted = false;
function startCrons() {
  if (cronsStarted) return;
  cronsStarted = true;

  // Daily content refresh: fetch fresh Cameroonian videos from YouTube and
  // grow the catalog (adds new titles, keeps existing). Runs at 03:00 daily.
  cron.schedule(
    process.env.SYNC_CRON || "0 3 * * *",
    async () => {
      console.log("[sync] Daily content refresh started");
      try {
        const report = await contentSync.syncAll();
        console.log(`[sync] Done. Added ${report.totalAdded} new titles.`);
      } catch (err) {
        console.error("[sync] Daily refresh failed:", err.message);
      }
    },
    { timezone: process.env.SYNC_TIMEZONE || "Africa/Douala" }
  );
  console.log(`[sync] Scheduled daily refresh at ${process.env.SYNC_CRON || "03:00"} (${process.env.SYNC_TIMEZONE || "Africa/Douala"})`);

  // Auto-downgrade premiums whose subscription has expired. Runs hourly.
  const runExpiry = async () => {
    try {
      const n = await expireSubscriptions();
      if (n > 0) console.log(`[expiry] Downgraded ${n} expired premium subscription(s).`);
    } catch (err) {
      console.error("[expiry] Subscription expiry check failed:", err.message);
    }
  };
  cron.schedule(process.env.EXPIRY_CRON || "0 * * * *", runExpiry, {
    timezone: process.env.SYNC_TIMEZONE || "Africa/Douala",
  });
  runExpiry();
  console.log("[expiry] Scheduled hourly premium-expiry check");
}

// Never exit on Mongo failure: keep retrying with a 5s backoff. The HTTP server
// stays up (so health checks pass) and the app recovers as soon as Atlas
// accepts the connection again.
(async () => {
  for (let attempt = 1; ; attempt++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected");
      startCrons();
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
})();
