import mongoose from "mongoose";

export const connect = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    await mongoose.connect(mongoUri, options);

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected to:", mongoUri);
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔒 MongoDB connection closed through app termination");
    });
  } catch (error) {
    console.error("❌ Problem connecting to database:", error.message);
  }
};
