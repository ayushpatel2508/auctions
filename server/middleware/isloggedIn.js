import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    // Get token from cookie or header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Access denied. No token provided."
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Invalid token. User not found."
      });
    }

    // Add user to request
    req.user = user;
    next();

  } catch (err) {
    console.error("❌ Auth middleware error:", err);
    res.status(401).json({
      success: false,
      msg: "Invalid token."
    });
  }
};