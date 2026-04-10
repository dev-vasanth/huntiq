import express from 'express';
import auth from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import { checkConversationsForUser } from '../services/conversationService.js';
import User from '../models/User.js';

const router = express.Router();
router.use(auth);

// GET /api/conversations — list with filters
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };
    if (status && status !== 'all') filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [conversations, total] = await Promise.all([
      Conversation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Conversation.countDocuments(filter),
    ]);

    res.json({
      conversations,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/conversations/stats — performance metrics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, replied, noReply, withTime] = await Promise.all([
      Conversation.countDocuments({ userId }),
      Conversation.countDocuments({ userId, status: 'replied' }),
      Conversation.countDocuments({ userId, status: 'no_reply' }),
      Conversation.find({ userId, responseTimeMs: { $exists: true, $ne: null } }, 'responseTimeMs'),
    ]);

    const replyRate = total > 0 ? Math.round((replied / total) * 100) : 0;
    const avgResponseMs = withTime.length > 0
      ? withTime.reduce((sum, c) => sum + c.responseTimeMs, 0) / withTime.length
      : null;

    // Avg response time in human readable
    let avgResponseTime = null;
    if (avgResponseMs !== null) {
      const hours = avgResponseMs / 3600000;
      avgResponseTime = hours < 1
        ? `${Math.round(hours * 60)}m`
        : `${Math.round(hours)}h`;
    }

    res.json({ total, replied, noReply, replyRate, avgResponseTime });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/conversations — create a new conversation record (called after sending DM)
router.post('/', async (req, res) => {
  try {
    const { leadId, redditUsername, subject, ourMessage, leadTitle, leadSubreddit, leadPermalink } = req.body;
    if (!redditUsername || !subject || !ourMessage)
      return res.status(400).json({ message: 'redditUsername, subject, and ourMessage are required' });

    const conv = await Conversation.create({
      userId: req.user._id,
      leadId:       leadId       || undefined,
      redditUsername,
      subject,
      ourMessage,
      leadTitle:     leadTitle     || undefined,
      leadSubreddit: leadSubreddit || undefined,
      leadPermalink: leadPermalink || undefined,
    });

    res.status(201).json({ conversation: conv });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/conversations/:id/close
router.patch('/:id/close', async (req, res) => {
  try {
    const conv = await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'closed' },
      { new: true }
    );
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    res.json({ conversation: conv });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/conversations/:id
router.delete('/:id', async (req, res) => {
  try {
    const conv = await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/conversations/refresh — manually trigger inbox check
router.post('/refresh', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.redditAuth?.connected)
      return res.status(403).json({ message: 'Reddit not connected. Connect your Reddit account in Settings.' });

    await checkConversationsForUser(user);
    res.json({ message: 'Inbox checked. Replies updated.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
