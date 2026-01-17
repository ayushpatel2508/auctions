import mongoose from "mongoose";

export const connect = () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/auctions";
    mongoose.connect(mongoUri);
    console.log("db connected to:", mongoUri);
  } catch (error) {
    console.log("problem in connection db:", error.message);
  }
};
