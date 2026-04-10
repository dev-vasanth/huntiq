import express from 'express';
import Campaign from '../models/Campaign.js';
import Keyword from '../models/Keyword.js';
import Lead from '../models/Lead.js';
import auth from '../middleware/auth.js';
import { checkCampaignLimit } from '../middleware/planLimits.js';

const router = express.Router();
router.use(auth);

// GET all campaigns with stats
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user._id }).sort('-createdAt');

    const withStats = await Promise.all(campaigns.map(async (c) => {
      const keywords = await Keyword.find({ userId: req.user._id, campaignId: c._id });
      const keywordIds = keywords.map(k => k._id);
      const totalLeads = await Lead.countDocuments({ userId: req.user._id, keywordId: { $in: keywordIds } });
      const newLeads = await Lead.countDocuments({ userId: req.user._id, keywordId: { $in: keywordIds }, status: 'new' });
      const highIntent = await Lead.countDocuments({ userId: req.user._id, keywordId: { $in: keywordIds }, intentScore: { $gte: 70 } });

      return {
        ...c.toObject(),
        stats: { keywords: keywords.length, totalLeads, newLeads, highIntent },
      };
    }));

    res.json(withStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create campaign
router.post('/', checkCampaignLimit, async (req, res) => {
  try {
    const { name, description, goal, color } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Campaign name is required' });

    const campaign = await Campaign.create({
      userId: req.user._id, name: name.trim(), description, goal, color,
    });
    res.status(201).json({ campaign });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update campaign
router.patch('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    // Unlink keywords from this campaign
    await Keyword.updateMany({ campaignId: req.params.id, userId: req.user._id }, { $unset: { campaignId: 1 } });
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET keywords for a campaign
router.get('/:id/keywords', async (req, res) => {
  try {
    const keywords = await Keyword.find({ userId: req.user._id, campaignId: req.params.id });
    res.json(keywords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST assign keyword to campaign
router.post('/:id/keywords/:keywordId', async (req, res) => {
  try {
    const keyword = await Keyword.findOneAndUpdate(
      { _id: req.params.keywordId, userId: req.user._id },
      { campaignId: req.params.id },
      { new: true }
    );
    if (!keyword) return res.status(404).json({ message: 'Keyword not found' });
    res.json({ keyword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE remove keyword from campaign
router.delete('/:id/keywords/:keywordId', async (req, res) => {
  try {
    const keyword = await Keyword.findOneAndUpdate(
      { _id: req.params.keywordId, userId: req.user._id, campaignId: req.params.id },
      { $unset: { campaignId: 1 } },
      { new: true }
    );
    if (!keyword) return res.status(404).json({ message: 'Keyword not found' });
    res.json({ keyword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
