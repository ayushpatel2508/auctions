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
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop all existing indexes (except _id)
    console.log('\n🗑️ Dropping existing indexes...');
    
    try {
      await User.collection.dropIndexes();
      console.log('✅ Dropped User indexes');
    } catch (err) {
      console.log('⚠️ User indexes already clean or error:', err.message);
    }

    try {
      await Auction.collection.dropIndexes();
      console.log('✅ Dropped Auction indexes');
    } catch (err) {
      console.log('⚠️ Auction indexes already clean or error:', err.message);
    }

    try {
      await Bid.collection.dropIndexes();
      console.log('✅ Dropped Bid indexes');
    } catch (err) {
      console.log('⚠️ Bid indexes already clean or error:', err.message);
    }

    try {
      await Presence.collection.dropIndexes();
      console.log('✅ Dropped Presence indexes');
    } catch (err) {
      console.log('⚠️ Presence indexes already clean or error:', err.message);
    }

    // Recreate indexes from schema definitions
    console.log('\n🔨 Creating new indexes...');
    
    await User.createIndexes();
    console.log('✅ Created User indexes');
    
    await Auction.createIndexes();
    console.log('✅ Created Auction indexes');
    
    await Bid.createIndexes();
    console.log('✅ Created Bid indexes');
    
    await Presence.createIndexes();
    console.log('✅ Created Presence indexes');

    // List all indexes
    console.log('\n📋 Current indexes:');
    
    const userIndexes = await User.collection.listIndexes().toArray();
    console.log('User indexes:', userIndexes.map(i => i.name));
    
    const auctionIndexes = await Auction.collection.listIndexes().toArray();
    console.log('Auction indexes:', auctionIndexes.map(i => i.name));
    
    const bidIndexes = await Bid.collection.listIndexes().toArray();
    console.log('Bid indexes:', bidIndexes.map(i => i.name));
    
    const presenceIndexes = await Presence.collection.listIndexes().toArray();
    console.log('Presence indexes:', presenceIndexes.map(i => i.name));

    console.log('\n✅ Index management completed successfully!');
    
  } catch (error) {
    console.error('❌ Error managing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');

  }
}

// Run the script
manageIndexes();