import Keyword from '../models/Keyword.js';
import Lead from '../models/Lead.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const getKeywords = async (req, res) => {
  try {
    const keywords = await Keyword.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ keywords });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createKeyword = async (req, res) => {
  try {
    const { keyword, subreddits, intentSignals, campaignId, type } = req.body;
    if (!keyword) return res.status(400).json({ message: 'Keyword is required' });

    const existing = await Keyword.findOne({ userId: req.user._id, keyword: keyword.trim() });
    if (existing) return res.status(400).json({ message: 'Keyword already exists' });

    const kw = await Keyword.create({
      userId: req.user._id,
      keyword: keyword.trim(),
      subreddits: subreddits || [],
      intentSignals: intentSignals || [],
      type: type === 'competitor' ? 'competitor' : 'own',
      ...(campaignId ? { campaignId } : {}),
    });
    res.status(201).json({ keyword: kw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const kw = await Keyword.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!kw) return res.status(404).json({ message: 'Keyword not found' });
    res.json({ keyword: kw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const kw = await Keyword.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!kw) return res.status(404).json({ message: 'Keyword not found' });
    await Lead.deleteMany({ keywordId: id, userId: req.user._id });
    res.json({ message: 'Keyword deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const suggestSubreddits = async (req, res) => {
  try {
    if (req.user.plan !== 'pro') {
      return res.status(403).json({ message: 'Pro plan required' });
    }
    const { keyword } = req.body;
    if (!keyword?.trim()) return res.status(400).json({ message: 'Keyword is required' });

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Suggest 5-7 Reddit subreddits to monitor for the keyword: "${keyword}"

Return ONLY a JSON array of subreddit names without the r/ prefix. No explanation.
Example: ["SaaS", "entrepreneur", "startups", "marketing"]`,
      }],
    });

    const text = response.content.find(b => b.type === 'text')?.text || '[]';
    const match = text.match(/\[[\s\S]*?\]/);
    const subreddits = match ? JSON.parse(match[0]) : [];
    res.json({ subreddits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleKeyword = async (req, res) => {
  try {
    const kw = await Keyword.findOne({ _id: req.params.id, userId: req.user._id });
    if (!kw) return res.status(404).json({ message: 'Keyword not found' });
    kw.isActive = !kw.isActive;
    await kw.save();
    res.json({ keyword: kw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
