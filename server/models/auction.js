import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  startingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  // Creator (just username for MVP)
  createdBy: {
    type: String,
    required: true,
  },
  // Highest bidder (just username for MVP)
  highestBidder: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["active", "ended"],
    default: "active",
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  endTime: {
    type: Date,
    required: true,
  },
  // Online users (just usernames for socket compatibility)
  onlineUsers: [{
    type: String, // usernames for socket events
  }],
  // Joined users (persistent - users who have ever joined this auction)
  joinedUsers: [{
    type: String, // usernames for tracking participation
  }],
  // Winner (just username for MVP)
  winner: {
    type: String,
    default: null,
  },
  finalPrice: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
auctionSchema.index({ roomId: 1 });
auctionSchema.index({ createdBy: 1 });
auctionSchema.index({ status: 1, endTime: 1 });

export const Auction = mongoose.model("Auction", auctionSchema);
