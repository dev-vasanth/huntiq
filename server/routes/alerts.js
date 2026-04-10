import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import { sendLeadAlert } from '../services/alertService.js';
import Lead from '../models/Lead.js';

const router = express.Router();
router.use(auth);

// GET /api/alerts/settings
router.get('/settings', async (req, res) => {
  try {
    const user = req.user;
    res.json({
      enabled:   user.alertSettings?.enabled   ?? false,
      email:     user.alertSettings?.email     || user.email,
      threshold: user.alertSettings?.threshold ?? 70,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/alerts/settings
router.put('/settings', async (req, res) => {
  try {
    const { enabled, email, threshold } = req.body;
    const update = {};
    if (enabled   !== undefined) update['alertSettings.enabled']   = enabled;
    if (email     !== undefined) update['alertSettings.email']     = email;
    if (threshold !== undefined) update['alertSettings.threshold'] = Math.min(100, Math.max(1, Number(threshold)));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    );
    res.json({
      enabled:   user.alertSettings?.enabled,
      email:     user.alertSettings?.email || user.email,
      threshold: user.alertSettings?.threshold ?? 70,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/alerts/test — send a test alert with the most recent high-intent lead
router.post('/test', async (req, res) => {
  try {
    const user = req.user;
    const leads = await Lead.find({ userId: user._id, intentScore: { $gte: 50 } })
      .sort({ intentScore: -1 }).limit(2);

    if (!leads.length) {
      return res.status(400).json({ message: 'No leads found to use as test. Add keywords and wait for a scan.' });
    }

    await sendLeadAlert(user, leads);
    res.json({ message: `Test alert sent to ${user.alertSettings?.email || user.email}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
