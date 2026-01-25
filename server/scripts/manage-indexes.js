import mongoose from 'mongoose';
import { User } from '../models/user.js';
import { Auction } from '../models/auction.js';
import { Bid } from '../models/bid.js';
import { Presence } from '../models/presence.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auctions';

async function manageIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);

    // Drop all existing indexes (except _id)
    
    try {
      await User.collection.dropIndexes();
    } catch (err) {
      // Indexes already clean or error
    }

    try {
      await Auction.collection.dropIndexes();
    } catch (err) {
      // Indexes already clean or error
    }

    try {
      await Bid.collection.dropIndexes();
    } catch (err) {
      // Indexes already clean or error
    }

    try {
      await Presence.collection.dropIndexes();
    } catch (err) {
      // Indexes already clean or error
    }

    // Recreate indexes from schema definitions
    
    await User.createIndexes();
    
    await Auction.createIndexes();
    
    await Bid.createIndexes();
    
    await Presence.createIndexes();

    // List all indexes
    
    const userIndexes = await User.collection.listIndexes().toArray();
    
    const auctionIndexes = await Auction.collection.listIndexes().toArray();
    
    const bidIndexes = await Bid.collection.listIndexes().toArray();
    
    const presenceIndexes = await Presence.collection.listIndexes().toArray();
    
  } catch (error) {
    // Error managing indexes
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
manageIndexes();