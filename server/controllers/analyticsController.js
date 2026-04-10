import Lead from '../models/Lead.js';
import Keyword from '../models/Keyword.js';

export const getOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalLeads,
      leadsThisWeek,
      leadsThisMonth,
      repliedLeads,
      avgScore,
      keywords,
    ] = await Promise.all([
      Lead.countDocuments({ userId }),
      Lead.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
      Lead.countDocuments({ userId, createdAt: { $gte: thirtyDaysAgo } }),
      Lead.countDocuments({ userId, status: 'replied' }),
      Lead.aggregate([
        { $match: { userId } },
        { $group: { _id: null, avg: { $avg: '$intentScore' } } },
      ]),
      Keyword.countDocuments({ userId, isActive: true }),
    ]);

    const replyRate = totalLeads > 0 ? Math.round((repliedLeads / totalLeads) * 100) : 0;

    res.json({
      totalLeads,
      leadsThisWeek,
      leadsThisMonth,
      repliedLeads,
      replyRate,
      avgIntentScore: Math.round(avgScore[0]?.avg || 0),
      activeKeywords: keywords,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLeadsOverTime = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const data = await Lead.aggregate([
      { $match: { userId: req.user._id, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$intentScore' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getKeywordPerformance = async (req, res) => {
  try {
    const data = await Lead.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$keywordText',
          count: { $sum: 1 },
          avgScore: { $avg: '$intentScore' },
          replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubredditBreakdown = async (req, res) => {
  try {
    const data = await Lead.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$subreddit',
          count: { $sum: 1 },
          avgScore: { $avg: '$intentScore' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSentimentBreakdown = async (req, res) => {
  try {
    const data = await Lead.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getIntentSignals = async (req, res) => {
  try {
    const data = await Lead.aggregate([
      { $match: { userId: req.user._id } },
      { $unwind: '$intentSignals' },
      {
        $group: {
          _id: '$intentSignals',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCompetitorInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    const [summary, topKeywords, sentimentBreakdown, topSubreddits, topSignals] = await Promise.all([
      // Own vs competitor lead counts
      Lead.aggregate([
        { $match: { userId } },
        { $group: { _id: '$keywordType', count: { $sum: 1 }, avgScore: { $avg: '$intentScore' } } },
      ]),
      // Competitor keywords with lead counts + negative sentiment
      Lead.aggregate([
        { $match: { userId, keywordType: 'competitor' } },
        {
          $group: {
            _id: '$keywordText',
            count: { $sum: 1 },
            avgScore: { $avg: '$intentScore' },
            negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } },
            positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      // Sentiment breakdown for competitor leads
      Lead.aggregate([
        { $match: { userId, keywordType: 'competitor' } },
        { $group: { _id: '$sentiment', count: { $sum: 1 } } },
      ]),
      // Top subreddits for competitor leads
      Lead.aggregate([
        { $match: { userId, keywordType: 'competitor' } },
        { $group: { _id: '$subreddit', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      // Top intent signals for competitor leads (complaints / pain points)
      Lead.aggregate([
        { $match: { userId, keywordType: 'competitor' } },
        { $unwind: '$intentSignals' },
        { $group: { _id: '$intentSignals', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    res.json({ summary, topKeywords, sentimentBreakdown, topSubreddits, topSignals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
