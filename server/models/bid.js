import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  // Username for socket events
  username: {
    type: String,
    required: true,
  },
  // Room ID for socket events
  roomId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  isWinning: {
    type: Boolean,
    default: false,
  },
  placedAt: {
    type: Date,
    default: Date.now,
  },
  socketId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for fast queries
bidSchema.index({ roomId: 1, placedAt: -1 });  // Bid history by roomId
bidSchema.index({ username: 1, placedAt: -1 }); // User's bid history

export const Bid = mongoose.model("Bid", bidSchema);
