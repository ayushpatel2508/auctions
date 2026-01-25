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
  res.json({ message: "Auth routes working!" });
});

// 1. REGISTER
router.post("/register", async (req, res) => {
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

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ 
        success: false,
        msg: "User already exists" 
      });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ 
        success: false,
        msg: "Username already taken" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        success: false,
        msg: "Server configuration error" 
      });
    }

    const token = jwt.sign(
      { 
        id: newUser._id,
        userId: newUser._id, 
        username: newUser.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // Set cookie with proper configuration (same as login)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

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
    res.status(500).json({ 
      success: false,
      msg: "Error in register", 
      error: err.message 
    });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });

    if (!exists) {
      return res.status(404).json({ msg: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, exists.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        success: false,
        msg: "Server configuration error" 
      });
    }

    const token = jwt.sign(
      { 
        id: exists._id,
        userId: exists._id, 
        username: exists.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // Set cookie with proper configuration
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

    const response = { success: true, username: exists.username };

    res.json(response);
  } catch (err) {
    res.status(500).json({ msg: "Error in login" });
  }
});

router.post("/logout", isLoggedIn, (req, res) => {
  // Clear cookie with same configuration as when it was set
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  
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
