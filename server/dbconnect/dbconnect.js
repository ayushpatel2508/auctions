import mongoose from "mongoose";

export const connect = async () => {
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
      // Connection timeout
      connectTimeoutMS: 10000,
    };

    await mongoose.connect(mongoUri, options);

    // Handle connection events
    mongoose.connection.on("connected", () => {
      // MongoDB connected
    });

    mongoose.connection.on("error", (err) => {
      // MongoDB connection error
    });

    mongoose.connection.on("disconnected", () => {
      // MongoDB disconnected
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      // MongoDB connection closed through app termination
    });

  } catch (error) {
    // Problem connecting to database
    throw error; // Re-throw to handle in calling function
  }
};
