import express from "express";
import { User } from "../models/user.js";
import { Auction } from "../models/auction.js";
import { Bid } from "../models/bid.js";
import { isLoggedIn } from "../middleware/isloggedIn.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// ========== USER ROUTES ==========

// GET /api/users/profile - Get user profile
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Error fetching profile" });
  }
});

// GET /api/users/my-auctions - Get user's created auctions
router.get("/users/my-auctions", isLoggedIn, async (req, res) => {
  try {
    const auctions = await Auction.find({ createdBy: req.user.username });

    res.json({ success: true, auctions });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Error fetching auctions" });
  }
});

// GET /api/users/joined-auctions - Get auctions user has joined (active + past month)
router.get("/users/joined-auctions", isLoggedIn, async (req, res) => {
  try {
    // Calculate date for last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Find auctions where user is in joinedUsers array (persistent participation)
    const joinedAuctions = await Auction.find({
      joinedUsers: req.user.username,  // User is in joinedUsers array
      createdBy: { $ne: req.user.username }, // Exclude auctions created by user
      $or: [
        { status: "active" }, // Include all active auctions
        { 
          status: "ended", // Include ended auctions from last month
          createdAt: { $gte: oneMonthAgo }
        }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, auctions: joinedAuctions });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Error fetching joined auctions" });
  }
});

// GET /api/users/my-bids - Get user's bid history
router.get("/users/my-bids", isLoggedIn, async (req, res) => {
  try {
    const bids = await Bid.find({ username: req.user.username });

    res.json({ success: true, bids });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Error fetching bids" });
  }
});

// GET /api/users/won-auctions - Get auctions user won
router.get("/users/won-auctions", isLoggedIn, async (req, res) => {
  try {
    const wonAuctions = await Auction.find({ winner: req.user.username });

    res.json({ success: true, wonAuctions });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Error fetching won auctions" });
  }
});

// ========== ADMIN ROUTES ==========

// GET /api/admin/users - List all users
router.get("/admin/users", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json({ success: true, users });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Error fetching users" });
  }
});

// PUT /api/admin/users/:id/role - Update user role
router.put("/admin/users/:id/role", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Error updating role" });
  }
});

// GET /api/admin/stats - Get system stats
router.get("/admin/stats", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAuctions = await Auction.countDocuments();
    const totalBids = await Bid.countDocuments();

    res.json({
      success: true,
      stats: { totalUsers, totalAuctions, totalBids }
    });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Error fetching stats" });
  }
});

export default router;