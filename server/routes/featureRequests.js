import express from 'express';
import nodemailer from 'nodemailer';
import FeatureRequest from '../models/FeatureRequest.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const isFounder = (user) => user.email === process.env.FOUNDER_EMAIL;

const CATEGORY_LABELS = {
  feature: 'New Feature',
  ui: 'UI/UX',
  integration: 'Integration',
  bug: 'Bug Report',
  other: 'Other',
};

// Submit a feature request (logged-in users)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const fr = await FeatureRequest.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userPlan: req.user.plan,
      title,
      description,
      category: category || 'feature',
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.FOUNDER_EMAIL,
      subject: `[HuntIQ Feature Request] ${title}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#f97316">New Feature Request</h2>
          <p><strong>From:</strong> ${req.user.name} &lt;${req.user.email}&gt; (${req.user.plan} plan)</p>
          <p><strong>Category:</strong> ${CATEGORY_LABELS[category] || 'Other'}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Description:</strong></p>
          <div style="background:#f4f4f4;padding:16px;border-radius:8px;white-space:pre-wrap">${description}</div>
          <p style="color:#888;font-size:12px;margin-top:24px">Submitted at ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    res.status(201).json({ featureRequest: fr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get all feature requests
router.get('/', auth, async (req, res) => {
  try {
    if (!isFounder(req.user)) return res.status(403).json({ message: 'Forbidden' });
    const requests = await FeatureRequest.find().sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update status
router.patch('/:id', auth, async (req, res) => {
  try {
    if (!isFounder(req.user)) return res.status(403).json({ message: 'Forbidden' });
    const fr = await FeatureRequest.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    res.json({ featureRequest: fr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
