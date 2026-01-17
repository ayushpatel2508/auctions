import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // From socket events: username (used in all socket communications)
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    // For authentication
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // Socket ID for real-time tracking
    socketId: {
      type: String,
      default: null,
    },
    // Online status (updated when user connects/disconnects)
    isOnline: {
      type: Boolean,
      default: false,
    },
    // Current room they're in (if any)
    currentRoom: {
      type: String,
      default: null,
    },
    // Last activity timestamp
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    // Track typing status
    isTyping: {
      type: Boolean,
      default: false,
    },
    // Authentication tokens (for sessions)
    refreshToken: {
      type: String,
      default: null,
    },
    // Account verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Rooms they've joined (history)
    joinedRooms: [
      {
        roomId: String,
        joinedAt: Date,
        leftAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
// Note: username and email already have unique indexes from schema definition
userSchema.index({ socketId: 1 }); // Fast socket lookup
userSchema.index({ isOnline: 1, lastSeen: -1 }); // Find online users
userSchema.index({ currentRoom: 1 }); // Users in specific room
userSchema.index({ "joinedRooms.roomId": 1 }); // User's room history

export const User = mongoose.model("User", userSchema);
