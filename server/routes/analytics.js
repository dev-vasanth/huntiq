import express from 'express';
import { getOverview, getLeadsOverTime, getKeywordPerformance, getSubredditBreakdown, getSentimentBreakdown, getIntentSignals, getCompetitorInsights } from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);
router.get('/overview', getOverview);
router.get('/leads-over-time', getLeadsOverTime);
router.get('/keywords', getKeywordPerformance);
router.get('/subreddits', getSubredditBreakdown);
router.get('/sentiment', getSentimentBreakdown);
router.get('/signals', getIntentSignals);
router.get('/competitor', getCompetitorInsights);

export default router;
