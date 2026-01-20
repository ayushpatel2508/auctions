import express from "express";
import { Auction } from "../models/auction.js";
import { User } from "../models/user.js";
import { Bid } from "../models/bid.js";
import { Presence } from "../models/presence.js";
import { isLoggedIn } from "../middleware/isloggedIn.js";
import { isAdmin } from "../middleware/isAdmin.js";

// Export a function that accepts io instance
export default function(io) {
  const router = express.Router();

// CREATE AUCTION
router.post("/auction/create", isLoggedIn, async (req, res) => {
  try {
    const { title, description, startingPrice, duration } = req.body;

    // Generate roomId
    const roomId = `room_${req.user.username}_${Date.now()}`;

    // Check if roomId exists (unlikely but safe)
    const exists = await Auction.findOne({ roomId });
    if (exists) {
      return res
        .status(400)
        .json({ msg: `Auction with roomId ${roomId} already exists` });
    }

    const newAuction = await Auction.create({
      roomId,
      title,
      description: description || "",
      startingPrice: Number(startingPrice),
      currentBid: Number(startingPrice),
      duration: Number(duration),
      endTime: new Date(Date.now() + duration * 60 * 1000),
      // Use username for simplified schema
      createdBy: req.user.username,
      status: "active",
    });

    res.status(201).json({
      success: true,
      msg: "Auction created successfully",
      auction: newAuction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Failed to create auction",
      error: err.message,
    });
  }
});

// GET ALL AUCTIONS
router.get("/auctions", async (req, res) => {
  try {
    // Fetch both active and ended auctions
    const auctions = await Auction.find({ 
      status: { $in: ["active", "ended"] } 
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      totalAuctions: auctions.length,
      auctions: auctions.map((auction) => ({
        ...auction.toObject(),
        timeRemaining: auction.endTime - Date.now(),
        isActive: auction.status === "active",
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching auctions",
      error: err.message,
    });
  }
});

// GET SINGLE AUCTION WITH BID HISTORY
router.get("/auction/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Get bid history (no populate needed, username is directly in bid)
    const bids = await Bid.find({ roomId }).sort({ placedAt: -1 }).limit(50);

    // Get online users (no populate needed, username is directly in presence)
    const onlineUsers = await Presence.find({
      roomId,
      status: "online",
      leftAt: null,
    });

    res.json({
      success: true,
      auction: {
        ...auction.toObject(),
        timeRemaining: auction.endTime - Date.now(),
        isActive: auction.status === "active",
        bidHistory: bids,
        onlineUsers: onlineUsers.map((p) => p.username),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching auction",
      error: err.message,
    });
  }
});

// GET BID HISTORY FOR AUCTION
router.get("/auction/:roomId/bids", async (req, res) => {
  try {
    const { roomId } = req.params;

    // Check if auction exists
    const auction = await Auction.findOne({ roomId });
    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Get bid history sorted by most recent first
    const bids = await Bid.find({ roomId }).sort({ placedAt: -1 }).limit(50);

    res.json(bids);
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching bid history",
      error: err.message,
    });
  }
});

// QUIT AUCTION (User leaves auction permanently)
router.post("/auction/:roomId/quit", isLoggedIn, async (req, res) => {
  try {
    const { roomId } = req.params;
    const username = req.user.username;

    console.log(`🔥 QUIT AUCTION API - User: ${username}, Room: ${roomId}`);

    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      console.log(`❌ Auction not found: ${roomId}`);
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    console.log(`🔥 Auction found. Creator: ${auction.createdBy}, Current user: ${username}`);
    console.log(`🔥 Is creator: ${auction.createdBy === username}`);

    const isCreator = auction.createdBy === username;

    console.log(`🔥 Online users before: ${auction.onlineUsers}`);

    // Remove user from both onlineUsers and joinedUsers
    auction.onlineUsers = auction.onlineUsers.filter(user => user !== username);
    auction.joinedUsers = auction.joinedUsers.filter(user => user !== username);
    
    console.log(`🔥 Online users after: ${auction.onlineUsers}`);
    
    await auction.save();

    // Clean up presence records
    await Presence.updateMany(
      { roomId: roomId, username: username },
      { 
        status: "disconnected", 
        leftAt: new Date() 
      }
    );

    console.log(`✅ User ${username} successfully quit auction ${roomId}`);

    // Send different notifications based on whether user is creator or not
    const notificationMessage = isCreator 
      ? `👑 Auction creator ${username} has left the auction. The auction continues without them.`
      : `${username} has left the auction`;

    // Emit to socket for real-time notification to other users
    // This will be handled by the socket event in the main server file

    res.json({
      success: true,
      msg: "Successfully quit the auction",
      isCreator: isCreator,
      notificationMessage: notificationMessage,
      auction: {
        roomId: auction.roomId,
        title: auction.title,
        onlineUsersCount: auction.onlineUsers.length,
        joinedUsersCount: auction.joinedUsers.length
      }
    });

  } catch (err) {
    console.error(`❌ Error in quit auction API:`, err);
    res.status(500).json({
      success: false,
      msg: "Error quitting auction",
      error: err.message,
    });
  }
});

// DELETE AUCTION
router.delete("/auction/:roomId", isLoggedIn, async (req, res) => {
  try {
    const { roomId } = req.params;

    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Check if user is the creator
    if (auction.createdBy !== req.user.username) {
      return res.status(403).json({
        success: false,
        msg: "Only auction creator can delete",
      });
    }

    // Get final auction stats before deletion
    const finalStats = {
      title: auction.title,
      createdBy: auction.createdBy,
      highestBid: auction.currentBid,
      highestBidder: auction.highestBidder,
      totalBids: await Bid.countDocuments({ roomId }),
      startingPrice: auction.startingPrice,
      deletedAt: new Date()
    };

    // Notify all users in the auction room that auction was deleted
    io.to(roomId).emit("auction-deleted", {
      roomId: roomId,
      message: `Auction "${auction.title}" has been deleted by the creator`,
      finalStats: finalStats,
      redirectTo: "/auctions"
    });

    // Clean up presence records
    await Presence.updateMany(
      { roomId: roomId },
      { 
        status: "disconnected", 
        leftAt: new Date() 
      }
    );

    // Delete related data
    await Bid.deleteMany({ roomId });
    await Presence.deleteMany({ roomId });
    await Auction.deleteOne({ roomId });

    res.json({
      success: true,
      msg: "Auction and related data deleted successfully",
      finalStats: finalStats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error deleting auction",
      error: err.message,
    });
  }
});

// GET USER'S AUCTIONS
router.get("/user/auctions", isLoggedIn, async (req, res) => {
  try {
    //auction joined by user
    const userAuctions_created = await Auction.find({
      createdBy: req.user.username,
    }).sort({ createdAt: -1 });
    //auction not created by user just joine
    const userAuctions_joined = await Auction.find({
      createdBy: { $ne: req.user.username },
    }).select("title onlineUsers");
    console.log(userAuctions_joined.onlineUsers);
    // Option 2: Check manually after fetch
const allAuctionsNotCreated = await Auction.find({
  createdBy: { $ne: req.user.username }
}).select("title onlineUsers");

const userJoinedAuctions = allAuctionsNotCreated.filter(auction =>
  auction.onlineUsers.includes(req.user.username)
);

console.log('User joined auctions:', userJoinedAuctions);
    res.json({
      success: true,
      totalAuctions: userAuctions_created.length,
      auctions: userAuctions_created,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching user auctions",
      error: err.message,
    });
  }
});
// END AUCTION MANUALLY (Admin/Creator)
router.post("/auction/:roomId/end", isLoggedIn, async (req, res) => {
  try {
    const { roomId } = req.params;

    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Check if user is the creator
    if (auction.createdBy !== req.user.username) {
      return res.status(403).json({
        success: false,
        msg: "Only auction creator can end auction",
      });
    }

    if (auction.status === "ended") {
      return res.status(400).json({
        success: false,
        msg: "Auction already ended",
      });
    }

    // End the auction
    auction.status = "ended";
    auction.winner = auction.highestBidder;
    auction.finalPrice = auction.currentBid;

    await auction.save();

    // Mark winning bid
    if (auction.highestBidder) {
      await Bid.updateOne(
        {
          roomId: roomId,
          username: auction.highestBidder,
          amount: auction.currentBid,
        },
        { isWinning: true }
      );
    }

    // Get final auction stats
    const finalStats = {
      title: auction.title,
      createdBy: auction.createdBy,
      winner: auction.winner,
      finalPrice: auction.finalPrice,
      totalBids: await Bid.countDocuments({ roomId }),
      startingPrice: auction.startingPrice,
      endedAt: new Date(),
      endedBy: "creator"
    };

    // Notify all users in the room that auction ended
    io.to(roomId).emit("auction-ended", {
      roomId: roomId,
      winner: auction.winner,
      finalPrice: auction.finalPrice,
      message: "Auction has been ended by the creator",
      finalStats: finalStats,
      showWinner: true
    });

    // Clean up presence (mark all as left)
    await Presence.updateMany(
      { roomId: roomId, leftAt: null },
      {
        status: "disconnected",
        leftAt: new Date(),
      }
    );

    res.json({
      success: true,
      msg: "Auction ended successfully",
      auction: {
        roomId: auction.roomId,
        winner: auction.winner || "No winner",
        finalPrice: auction.finalPrice,
        status: auction.status,
      },
      finalStats: finalStats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error ending auction",
      error: err.message,
    });
  }
});

  return router;
}
