import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isConnectedToMongo = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/life-rpg';
  const isCloudEnv = Boolean(process.env.RENDER || process.env.VERCEL || process.env.NODE_ENV === 'production');
  const isLocalHostUri = uri.includes('127.0.0.1') || uri.includes('localhost');

  if (isCloudEnv && isLocalHostUri) {
    isConnectedToMongo = false;
    console.log('🛡️  [Life RPG] Cloud environment detected without MongoDB Atlas URI.');
    console.log('✨ Auto-engaging Life RPG Persistent Storage engine!');
    return;
  }

  console.log('⚔️  [Life RPG] Attempting database connection...');

  try {
    // Attempt Mongoose connection with a quick 2-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnectedToMongo = true;
    console.log(`🛡️  [Life RPG] Connected to MongoDB Atlas / Local Database: ${mongoose.connection.host}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.log('📜 [Life RPG Note for Beginners]:');
    console.log('   No active local/remote MongoDB service was detected.');
    console.log('   ✨ Auto-engaging Life RPG Local Persistent Storage (server/data/db.json)!');
    console.log('   Your quests, items, gold, and XP will be saved safely without requiring any DB installation.');
  }

  // Ensure data directory exists for local persistence
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}
