import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import keywordRoutes from './routes/keywords.js';
import leadRoutes from './routes/leads.js';
import replyRoutes from './routes/replies.js';
import analyticsRoutes from './routes/analytics.js';
import digestRoutes from './routes/digest.js';
import campaignRoutes from './routes/campaigns.js';
import redditRoutes from './routes/reddit.js';
import billingRoutes, { handleWebhook } from './routes/billing.js';
import alertRoutes from './routes/alerts.js';
import conversationRoutes from './routes/conversations.js';
import contactRoutes from './routes/contact.js';
import featureRequestRoutes from './routes/featureRequests.js';
import { startScheduler } from './services/schedulerService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Lemon Squeezy webhook MUST receive raw body for signature verification ────
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/digest', digestRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/reddit', redditRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/feature-requests', featureRequestRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lead-radar')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      startScheduler();
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
