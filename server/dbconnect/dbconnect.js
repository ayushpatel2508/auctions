import mongoose from "mongoose";

export const connect = () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/auctions";
    
    // Configure mongoose options for production
    const options = {
      // Prevent duplicate index warnings in production
      autoIndex: process.env.AUTO_CREATE_INDEXES === 'true' || process.env.NODE_ENV !== 'production',
      // Connection pool settings
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Buffering settings
      bufferMaxEntries: 0,
      bufferCommands: false,
    };

    mongoose.connect(mongoUri, options);
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log("✅ MongoDB connected to:", mongoUri);
    });

    mongoose.connection.on('error', (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log("⚠️ MongoDB disconnected");
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log("🔒 MongoDB connection closed through app termination");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Problem connecting to database:", error.message);
    process.exit(1);
  }
};
