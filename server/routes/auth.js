import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js"; // Fixed: Added .js extension
import { isLoggedIn } from "../middleware/isloggedIn.js";

const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
  console.log("🧪 Test route hit!");
  res.json({ message: "Auth routes working!" });
});

// 1. REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body; // Removed ()

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    // 🔑 IMPORTANT: await the hash!
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    res.status(201).json({
      success: true,
      user: { username: newUser.username, email: newUser.email },
    });
  } catch (err) {
    res.status(500).json({ msg: "Error in register", error: err.message });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  console.log("🔥 LOGIN ROUTE HIT!");
  console.log("📥 Request body:", req.body);

  try {
    const { email, password } = req.body;

    console.log("🔍 Looking for user with email:", email);
    const exists = await User.findOne({ email });

    if (!exists) {
      console.log("❌ User not found with email:", email);
      return res.status(404).json({ msg: "User does not exist" });
    }

    console.log("✅ User found:", {
    //   id: exists._id,
    //   username: exists.username,
    //   email: exists.email,
    // });

    const isMatch = await bcrypt.compare(password, exists.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for user:", email);
      return res.status(400).json({ msg: "Wrong password" });
    }

    console.log("✅ Password match! Generating token...");

    // 🔍 Debug: Log user info
    console.log("🔐 User logging in:", {
    //   userId: exists._id,
    //   username: exists.username,
    //   email: exists.email,
    // });

    const token = jwt.sign({ id: exists._id }, process.env.JWT_SECRET || "SECRET_123", {
      expiresIn: "1d",
    });

    // 🔍 Debug: Log generated token
    console.log("🎫 Generated token:", token.substring(0, 50) + "...");

    // 🔑 Set cookie with explicit domain and path
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      domain: "localhost", // Explicit domain
      path: "/", // Explicit path
      sameSite: "lax", // Help with cross-origin issues
    });

    console.log("🍪 Cookie set successfully!");

    const response = { success: true, username: exists.username };
    console.log("📤 Sending response:", response);

    res.json(response);
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ msg: "Error in login" });
  }
});

router.post("/logout", isLoggedIn, (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "logged out success" });
});

// Verify token endpoint - check if user is still authenticated
router.get("/verify", isLoggedIn, (req, res) => {
  // If middleware passes, token is valid
  res.json({ 
    success: true, 
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

export default router;
