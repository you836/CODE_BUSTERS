import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDefaultDemoUser } from './services/dbAdapter.js';
import authRoutes from './routes/authRoutes.js';
import questRoutes from './routes/questRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();

// Connect to Database (with intelligent local persistence fallback)
connectDB().then(() => {
  seedDefaultDemoUser();
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/ai', aiRoutes);

// Welcome & Health Check
const statusHandler = (req, res) => {
  res.json({
    status: 'online',
    realm: 'Life RPG Backend Engine',
    time: new Date().toISOString(),
    message: 'The realm gates are open and awaiting heroes.',
  });
};

app.get('/', statusHandler);
app.get('/api', statusHandler);
app.get('/api/health', statusHandler);
app.get('/health', statusHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'The dungeon corridor you seek does not exist (404).' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled realm error:', err.stack);
  res.status(500).json({
    message: 'An unexpected tremor shook the realm.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
