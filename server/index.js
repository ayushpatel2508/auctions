import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { connect } from "./dbconnect/dbconnect.js";

// Import models
import { Auction } from "./models/auction.js";
import { Bid } from "./models/bid.js";
import { User } from "./models/user.js";
import { Presence } from "./models/presence.js";

// Import routes
import authRoutes from "./routes/auth.js";
import auctionRoutes from "./routes/auction_route.js";
import userRoutes from "./routes/user_route.js";

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    origin: "https://auction-hub-*.vercel.app",
    origin: "https://auction-hub.vercel.app",
    origin: "https://auction-hub-eta.vercel.app",
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.SOCKET_CORS_ORIGIN ||
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to database
connect();

// Function to check and end expired auctions
const checkExpiredAuctions = async () => {
  try {
    const now = new Date();
    const expiredAuctions = await Auction.find({
      status: "active",
      endTime: { $lte: now },
    });

    for (const auction of expiredAuctions) {
      // End the auction
      auction.status = "ended";
      auction.winner = auction.highestBidder || null;
      auction.finalPrice = auction.currentBid;
      await auction.save();

      // Mark winning bid
      if (auction.highestBidder) {
        await Bid.updateOne(
          {
            roomId: auction.roomId,
            username: auction.highestBidder,
            amount: auction.currentBid,
          },
          { isWinning: true }
        );
      }

      // Clean up presence (mark all as left)
      await Presence.updateMany(
        { roomId: auction.roomId, leftAt: null },
        {
          status: "disconnected",
          leftAt: new Date(),
        }
      );

      // Get final auction stats
      const finalStats = {
        title: auction.title,
        createdBy: auction.createdBy,
        winner: auction.winner,
        finalPrice: auction.finalPrice,
        totalBids: await Bid.countDocuments({ roomId: auction.roomId }),
        startingPrice: auction.startingPrice,
        endedAt: new Date(),
        endedBy: "timer",
      };

      // Notify all users in the room that auction ended
      io.to(auction.roomId).emit("auction-ended", {
        roomId: auction.roomId,
        winner: auction.winner,
        finalPrice: auction.finalPrice,
        message: "Auction has ended due to time expiry",
        finalStats: finalStats,
        showWinner: true,
      });

      // console.log(`Auction ${auction.roomId} ended automatically`);
    }
  } catch (error) {
    console.error("Error checking expired auctions:", error);
  }
};

// Check for expired auctions every 30 seconds
setInterval(checkExpiredAuctions, 30000);

// Set up routes
app.use("/api/auth", authRoutes);
app.use("/api", auctionRoutes(io)); // Pass io instance to auction routes
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("Auction Server Running");
});

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

  // 1. JOIN AUCTION
  socket.on("join-auction", async (data) => {
    try {
      const { roomId, username } = data;

      // Check if user exists (no auto-creation)
      const user = await User.findOne({ username });

      if (!user) {
        // console.log("❌ User not found:", username);
        return socket.emit("error", "User not found. Please register first.");
      }

      const auction = await Auction.findOne({ roomId });

      if (!auction) {
        // console.log("❌ Auction not found:", roomId);
        return socket.emit("error", "Auction not found");
      }

      // Join socket room
      socket.join(roomId);

      // Clean up any existing presence records for this user in this room
      await Presence.deleteMany({
        username: username,
        roomId: roomId,
      });

      // Create new presence record
      await Presence.create({
        username: username,
        roomId: roomId,
        socketId: socket.id,
        status: "online",
      });

      // Update auction online users (remove duplicates)
      if (!auction.onlineUsers.includes(username)) {
        auction.onlineUsers.push(username);
      }

      // Update auction joined users (persistent)
      if (!auction.joinedUsers.includes(username)) {
        auction.joinedUsers.push(username);
      }

      await auction.save();

      // Emit to the user who joined
      socket.emit("auction-joined", `${username} joined successfully`);

      // Emit to ALL users in the room (including the joiner) - for updating the online users list
      io.to(roomId).emit("online-users-updated", {
        onlineUsers: auction.onlineUsers,
        onlineUsersCount: auction.onlineUsers.length,
      });

      // Emit ONLY to OTHER users in the room (excluding the joiner) - for the join notification
      socket.to(roomId).emit("user-joined-notification", {
        username: username,
        message: `${username} joined the auction`,
      });

      // console.log(
      //   `✅ User ${username} joined auction ${roomId}. Online users: ${auction.onlineUsers.length}`
      // );
    } 
    catch (err) {
      // console.log("Join auction error:", err);
      socket.emit("error", "Failed to join auction");
    }
  });

  // 2. PLACE BID
  socket.on("place-bid", async (data) => {
    try {
      const { roomId, username, bidAmount } = data;

      // Check if user exists (no auto-creation)
      const user = await User.findOne({ username });
      if (!user) {
        return socket.emit("error", "User not found. Please register first.");
      }

      const auction = await Auction.findOne({ roomId });

      if (!auction) {
        return socket.emit("error", "Auction not found");
      }

      if (auction.status === "ended") {
        return socket.emit("error", "Auction has ended");
      }

      if (bidAmount <= auction.currentBid) {
        return socket.emit("error", "Bid must be higher than current bid");
      }

      // Check if the user is trying to bid consecutively (same user as highest bidder)
      if (auction.highestBidder === username) {
        return socket.emit("consecutive-bid-error", {
          message:
            "You cannot place consecutive bids. Wait for another user to bid first.",
          currentBid: auction.currentBid,
          highestBidder: auction.highestBidder,
        });
      }

      // Update auction
      auction.currentBid = bidAmount;
      auction.highestBidder = username;
      await auction.save();

      // Mark previous bids as not winning
      await Bid.updateMany({ roomId: roomId }, { isWinning: false });

      // Save bid to DB
      await Bid.create({
        username: username,
        roomId: roomId,
        amount: bidAmount,
        socketId: socket.id,
        isWinning: true,
      });

      // Broadcast to all users in room
      const bidUpdateData = {
        highestBid: bidAmount,
        highestBidder: username,
      };

      io.to(roomId).emit("bid-update", bidUpdateData);
    } catch (err) {
      // console.log("Place bid error:", err);
      socket.emit("error", "Failed to place bid");
    }
  });

  // 3. LEAVE AUCTION
  socket.on("leave-auction", async (data) => {
    try {
      const { roomId, username, reason } = data;

      // Only process manual quits - ignore route changes and page unloads
      if (reason === "manual_quit") {
        // Update presence
        await Presence.updateOne(
          { socketId: socket.id },
          { status: "disconnected", leftAt: new Date() }
        );

        // Get updated auction data (API already removed user from online users)
        const auction = await Auction.findOne({ roomId });

        // Check if the user who left was the creator
        const isCreator = auction && auction.createdBy === username;

        // Send different notifications based on whether user is creator or not
        const notificationMessage = isCreator
          ? `👑 Auction creator ${username} has left the auction. The auction continues without them.`
          : `${username} has left the auction`;

        // Notify ONLY OTHER USERS (not the one who left) using socket.to()
        socket.to(roomId).emit("user-quit-auction", {
          username: username,
          message: notificationMessage,
          isCreator: isCreator,
          onlineUsers: auction ? auction.onlineUsers : [],
          onlineUsersCount: auction ? auction.onlineUsers.length : 0,
          showAlert: true,
        });

        socket.leave(roomId);
        // console.log(
          `User ${username} ${
            isCreator ? "(CREATOR)" : ""
          } left socket room ${roomId} (API already handled removal)`
        );
      } else {
        // For route changes and page unloads, just acknowledge but don't remove from online users
        // console.log(
          `User ${username} navigated away from auction ${roomId} but remains online`
        );
      }
    } catch (err) {
      // console.log("Error leaving auction:", err);
    }
  });

  // 4. DISCONNECT
  socket.on("disconnect", async () => {
    try {
      // Find the user's presence record to get username and roomId
      const presence = await Presence.findOne({ socketId: socket.id });

      if (presence && presence.status === "online") {
        const { username, roomId } = presence;

        // Update presence
        await Presence.updateOne(
          { socketId: socket.id },
          { status: "disconnected", leftAt: new Date() }
        );

        // Remove from auction online users
        await Auction.updateOne(
          { roomId: roomId },
          { $pull: { onlineUsers: username } }
        );

        // Get updated auction data
        const auction = await Auction.findOne({ roomId });

        // Notify ONLY OTHER USERS (not the one who disconnected) using socket.to()
        socket.to(roomId).emit("user-quit-auction", {
          username: username,
          message: `${username} has disconnected from the auction`,
          onlineUsers: auction ? auction.onlineUsers : [],
          onlineUsersCount: auction ? auction.onlineUsers.length : 0,
          showAlert: true,
        });

        // console.log(`User ${username} disconnected from auction ${roomId}`);
      }

      // console.log("User disconnected:", socket.id);
    } catch (err) {
      // console.log("Error on disconnect:", err);
    }
  });
});

server.listen(process.env.PORT || 5000, () => {
  // console.log("server live on port", process.env.PORT || 5000);
});
