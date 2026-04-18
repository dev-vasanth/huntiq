import Lead from '../models/Lead.js';
import Keyword from '../models/Keyword.js';
import { scanKeyword } from '../services/redditService.js';

export const getLeads = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, status, keyword, subreddit,
      sortBy = 'createdAt', sortOrder = 'desc', minScore = 0, keywordType, since, campaignId
    } = req.query;

    const filter = { userId: req.user._id };
    if (status && status !== 'all') filter.status = status;
    if (keyword) filter.keywordText = { $regex: keyword, $options: 'i' };
    if (subreddit) filter.subreddit = { $regex: subreddit, $options: 'i' };
    if (parseInt(minScore) > 0) filter.intentScore = { $gte: parseInt(minScore) };
    if (keywordType && (keywordType === 'own' || keywordType === 'competitor')) filter.keywordType = keywordType;
    if (since) filter.createdAt = { $gte: new Date(since) };
    if (campaignId) {
      const campaignKeywords = await Keyword.find({ userId: req.user._id, campaignId }).select('_id');
      filter.keywordId = { $in: campaignKeywords.map(k => k._id) };
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Lead.countDocuments(filter),
    ]);

    res.json({
      leads,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, userId: req.user._id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ lead });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ lead });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    await Lead.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const testScan = async (req, res) => {
  try {
    const { fetchRedditPosts } = await import('../services/redditService.js');
    const keywords = await Keyword.find({ userId: req.user._id, isActive: true });
    if (!keywords.length) {
      return res.status(400).json({ message: 'No active keywords to scan' });
    }

    const results = [];
    for (const kw of keywords.slice(0, 3)) {
      const posts = await fetchRedditPosts(kw.keyword, kw.subreddits || []);
      results.push({
        keyword: kw.keyword,
        subreddits: kw.subreddits,
        rawPostsReturned: posts.length,
        posts: posts.slice(0, 5).map(p => ({
          title: p.title,
          subreddit: p.subreddit,
          upvotes: p.ups,
          url: `https://reddit.com${p.permalink}`,
          titleContainsKeyword: p.title.toLowerCase().includes(kw.keyword.toLowerCase()),
        })),
      });
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const scanNow = async (req, res) => {
  try {
    const keywords = await Keyword.find({ userId: req.user._id, isActive: true });
    if (!keywords.length) {
      return res.status(400).json({ message: 'No active keywords to scan' });
    }

    let totalNew = 0;
    for (const kw of keywords) {
      const newLeads = await scanKeyword(kw, req.user._id);
      totalNew += newLeads;
    }

    res.json({ message: `Scan complete. Found ${totalNew} new leads.`, newLeads: totalNew });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const exportLeads = async (req, res) => {
  try {
    const { status, keyword, minScore = 0, keywordType, sortBy = 'intentScore', sortOrder = 'desc' } = req.query;

    const filter = { userId: req.user._id };
    if (status && status !== 'all') filter.status = status;
    if (keyword) filter.keywordText = { $regex: keyword, $options: 'i' };
    if (parseInt(minScore) > 0) filter.intentScore = { $gte: parseInt(minScore) };
    if (keywordType && (keywordType === 'own' || keywordType === 'competitor')) filter.keywordType = keywordType;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // No pagination — export all matching leads (cap at 5000 to avoid abuse)
    const leads = await Lead.find(filter).sort(sort).limit(5000);

    const escape = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Title', 'Author', 'Subreddit', 'Intent Score', 'Status',
      'Keyword Type', 'Keyword', 'Upvotes', 'Comments', 'Reddit URL', 'Date Found',
    ];

    const rows = leads.map(l => [
      escape(l.title),
      escape(l.author),
      escape(l.subreddit),
      escape(l.intentScore),
      escape(l.status),
      escape(l.keywordType || 'own'),
      escape(l.keywordText),
      escape(l.upvotes),
      escape(l.numComments),
      escape(l.permalink),
      escape(l.createdAt ? new Date(l.createdAt).toISOString().split('T')[0] : ''),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `huntiq-leads-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLeadStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, newLeads, saved, replied, dismissed] = await Promise.all([
      Lead.countDocuments({ userId }),
      Lead.countDocuments({ userId, status: 'new' }),
      Lead.countDocuments({ userId, status: 'saved' }),
      Lead.countDocuments({ userId, status: 'replied' }),
      Lead.countDocuments({ userId, status: 'dismissed' }),
    ]);

    const avgScore = await Lead.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, avg: { $avg: '$intentScore' } } },
    ]);

    res.json({
      total, new: newLeads, saved, replied, dismissed,
      avgIntentScore: Math.round(avgScore[0]?.avg || 0),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
