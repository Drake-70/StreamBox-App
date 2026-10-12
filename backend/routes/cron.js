const express = require("express");
const crypto = require("crypto");
const contentSync = require("../services/contentSync");
const { expireSubscriptions } = require("../services/subscriptionExpiry");

const router = express.Router();

// Constant-time comparison so the secret can't be recovered via timing.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Accept the secret via `x-cron-secret: <secret>` or `Authorization: Bearer <secret>`.
// Headers (not query strings) so the secret never lands in access logs.
function providedSecret(req) {
  const header = req.get("x-cron-secret");
  if (header) return header;
  const auth = req.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return "";
}

// POST /api/cron/run?job=sync|expiry|all   (default: all)
// Lets an external scheduler (or a Render Cron Job) trigger the maintenance
// work even when the free-tier instance would otherwise be asleep.
router.all("/run", async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return res.status(503).json({ message: "Cron endpoint is not configured (set CRON_SECRET)." });
  }
  if (!safeEqual(providedSecret(req), secret)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const job = (req.body && req.body.job) || req.query.job || "all";
  const result = {};

  if (job === "all" || job === "sync") {
    try {
      const report = await contentSync.syncAll();
      result.sync = { ok: true, added: report.totalAdded };
      console.log(`[cron] Manual sync done. Added ${report.totalAdded} new titles.`);
    } catch (err) {
      result.sync = { ok: false, error: err.message };
      console.error("[cron] Manual sync failed:", err.message);
    }
  }

  if (job === "all" || job === "expiry") {
    try {
      const n = await expireSubscriptions();
      result.expiry = { ok: true, downgraded: n };
      if (n > 0) console.log(`[cron] Manual expiry: downgraded ${n} subscription(s).`);
    } catch (err) {
      result.expiry = { ok: false, error: err.message };
      console.error("[cron] Manual expiry failed:", err.message);
    }
  }

  if (Object.keys(result).length === 0) {
    return res.status(400).json({ message: "Unknown job. Use sync, expiry or all.", job });
  }

  const ok = Object.values(result).every((r) => r.ok);
  res.status(ok ? 200 : 500).json({ ok, job, result, at: new Date().toISOString() });
});

module.exports = router;
