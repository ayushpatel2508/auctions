import mongoose from "mongoose";

const presenceSchema = new mongoose.Schema({
  // Username for socket events
  username: {
    type: String,
    required: true
  },
  // Room ID for socket events
  roomId: {
    type: String,
    required: true
  },
  socketId: {
    type: String,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'typing', 'disconnected'],
    default: 'online'
  },
  leftAt: {
    type: Date,
    default: null
  }
});

// Indexes for fast lookups
presenceSchema.index({ roomId: 1, status: 1 }); // Find online users in a room
presenceSchema.index({ socketId: 1 }, { unique: true }); // Unique socket lookup
presenceSchema.index({ username: 1, roomId: 1 }); // User presence in specific room
presenceSchema.index({ status: 1, lastActive: -1 }); // Cleanup old disconnected records

export const Presence = mongoose.model('Presence', presenceSchema);
