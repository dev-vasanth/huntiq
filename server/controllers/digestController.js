import User from '../models/User.js';
import { sendDigestEmail } from '../services/emailService.js';

export const getDigestSettings = async (req, res) => {
  res.json({ digestSettings: req.user.digestSettings });
};

export const updateDigestSettings = async (req, res) => {
  try {
    const { enabled, email, time, timezone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { digestSettings: { enabled, email, time, timezone } },
      { new: true }
    );
    res.json({ digestSettings: user.digestSettings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendTestDigest = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    await sendDigestEmail(req.user._id, email);
    res.json({ message: 'Test digest sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
