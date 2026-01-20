import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.js"; // Fixed: Added .js extension
import { isLoggedIn } from "../middleware/isloggedIn.js";

// Ensure environment variables are loaded
dotenv.config();

const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
  console.log("🧪 Test route hit!");
  res.json({ message: "Auth routes working!" });
});

// 1. REGISTER
router.post("/register", async (req, res) => {
  console.log("🔥 REGISTER ROUTE HIT!");
  console.log("📥 Request body:", req.body);

  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ 
        success: false,
        msg: "All fields are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        msg: "Password must be at least 6 characters" 
      });
    }

    console.log("🔍 Checking if user exists with email:", email);
    const exists = await User.findOne({ email });
    if (exists) {
      console.log("❌ User already exists with email:", email);
      return res.status(400).json({ 
        success: false,
        msg: "User already exists" 
      });
    }

    console.log("🔍 Checking if username is taken:", username);
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      console.log("❌ Username already taken:", username);
      return res.status(400).json({ 
        success: false,
        msg: "Username already taken" 
      });
    }

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("💾 Creating new user...");
    const newUser = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    console.log("✅ User created successfully:", {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email
    });

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not defined in environment variables!");
      return res.status(500).json({ 
        success: false,
        msg: "Server configuration error" 
      });
    }

    // 🔍 Debug: Log user info
    console.log("🔐 User registering:", {
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
    });

    const token = jwt.sign(
      { 
        id: newUser._id,
        userId: newUser._id, 
        username: newUser.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // 🔍 Debug: Log generated token
    console.log("🎫 Generated token:", token.substring(0, 50) + "...");

    // 🔑 Set cookie with proper configuration (same as login)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

    console.log("🍪 Cookie set successfully!");

    res.status(201).json({
      success: true,
      msg: "User registered successfully",
      username: newUser.username, // Same field as login response
      user: { 
        id: newUser._id,
        username: newUser.username, 
        email: newUser.email 
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ 
      success: false,
      msg: "Error in register", 
      error: err.message 
    });
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
      id: exists._id,
      username: exists.username,
      email: exists.email,
    });

    const isMatch = await bcrypt.compare(password, exists.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for user:", email);
      return res.status(400).json({ msg: "Wrong password" });
    }

    console.log("✅ Password match! Generating token...");

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not defined in environment variables!");
      return res.status(500).json({ 
        success: false,
        msg: "Server configuration error" 
      });
    }

    // 🔍 Debug: Log user info
    console.log("🔐 User logging in:", {
      userId: exists._id,
      username: exists.username,
      email: exists.email,
    });

    const token = jwt.sign(
      { 
        id: exists._id,
        userId: exists._id, 
        username: exists.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // 🔍 Debug: Log generated token
    console.log("🎫 Generated token:", token.substring(0, 50) + "...");

    // 🔑 Set cookie with proper configuration
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
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
  console.log("🚪 LOGOUT ROUTE HIT!");
  
  // Clear cookie with same configuration as when it was set
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  
  console.log("🍪 Cookie cleared successfully!");
  res.json({ success: true, msg: "logged out success" });
});

// Verify token endpoint - check if user is still authenticated
router.get("/verify", isLoggedIn, (req, res) => {
  // If middleware passes, token is valid
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

export default router;
