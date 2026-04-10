import express from 'express';
import { getReplies, generateAIReply, saveManualReply, markReplySent, deleteReply } from '../controllers/replyController.js';
import auth from '../middleware/auth.js';
import { checkReplyLimit, incrementReplyUsage } from '../middleware/planLimits.js';

const router = express.Router();

// Middleware to increment usage after successful AI reply
const trackReplyUsage = async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (res.statusCode < 400) {
      await incrementReplyUsage(req.user._id).catch(() => {});
    }
    return originalJson(data);
  };
  next();
};

router.use(auth);
router.get('/:leadId', getReplies);
router.post('/generate', checkReplyLimit, trackReplyUsage, generateAIReply);
router.post('/manual', saveManualReply);
router.patch('/:id/sent', markReplySent);
router.delete('/:id', deleteReply);

export default router;
