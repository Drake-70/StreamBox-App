const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, ageGroup, parentalPin } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    const group = ageGroup || "adults";

    if (group !== "adults" && !parentalPin) {
      return res.status(400).json({
        message: `A parent PIN is required to create a ${group} profile. Please set a 4-digit PIN.`,
      });
    }
    if (parentalPin && !/^\d{4}$/.test(String(parentalPin))) {
      return res.status(400).json({ message: "Parent PIN must be 4 digits" });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const code = generateCode();
    const user = await User.create({
      username,
      email,
      password,
      ageGroup: group,
      emailVerified: false,
      verificationCode: code,
      verificationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verificationAttempts: 0,
    });

    if (parentalPin) {
      await user.setParentalPin(parentalPin);
      await user.save();
    }

    res.status(201).json({
      message: "Registration successful. Please verify your email with the 6-digit code.",
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }
    if (!user.verificationCode || !user.verificationCodeExpiresAt) {
      return res.status(400).json({ message: "No verification code found. Please request a new one." });
    }
    if (new Date() > user.verificationCodeExpiresAt) {
      user.verificationCode = null;
      user.verificationCodeExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Verification code expired" });
    }
    if (user.verificationAttempts >= 5) {
      return res.status(400).json({ message: "Too many attempts. Please request a new code." });
    }
    if (user.verificationCode !== String(code)) {
      user.verificationAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid code" });
    }
    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;
    user.verificationAttempts = 0;
    await user.save();
    res.json({ message: "Email verified successfully", token: generateToken(user._id), user: { _id: user._id, email: user.email, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.emailVerified) return res.status(400).json({ message: "Email already verified" });
    const code = generateCode();
    user.verificationCode = code;
    user.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationAttempts = 0;
    await user.save();
    res.json({ message: "Verification code sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      if (!user.emailVerified) {
        return res.status(403).json({ message: "Please verify your email first" });
      }
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        ageGroup: user.ageGroup,
        avatar: user.avatar,
        parentalControl: { enabled: user.hasParentalPin() },
        premium: { active: user.premium?.active || false },
        role: user.role || "user",
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "If account exists, reset code sent" });
    const code = generateCode();
    user.resetCode = code;
    user.resetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.resetAttempts = 0;
    await user.save();
    res.json({ message: "Reset code sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) return res.status(400).json({ message: "All fields required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.resetCode || !user.resetCodeExpiresAt) return res.status(400).json({ message: "No reset code found" });
    if (new Date() > user.resetCodeExpiresAt) {
      user.resetCode = null;
      user.resetCodeExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Reset code expired" });
    }
    if (user.resetAttempts >= 5) return res.status(400).json({ message: "Too many attempts" });
    if (user.resetCode !== String(code)) {
      user.resetAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid code" });
    }
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    user.password = password;
    user.resetCode = null;
    user.resetCodeExpiresAt = null;
    user.resetAttempts = 0;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;