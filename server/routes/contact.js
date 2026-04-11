import express from 'express';
import nodemailer from 'nodemailer';
import ContactSubmission from '../models/ContactSubmission.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const isFounder = (user) => user.email === process.env.FOUNDER_EMAIL;

// Public: submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await ContactSubmission.create({ name, email, subject, message });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.FOUNDER_EMAIL,
      subject: `[HuntIQ Contact] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#a855f7">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f4f4f4;padding:16px;border-radius:8px;white-space:pre-wrap">${message}</div>
          <p style="color:#888;font-size:12px;margin-top:24px">Submitted at ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get all contact submissions
router.get('/', auth, async (req, res) => {
  try {
    if (!isFounder(req.user)) return res.status(403).json({ message: 'Forbidden' });
    const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update status
router.patch('/:id', auth, async (req, res) => {
  try {
    if (!isFounder(req.user)) return res.status(403).json({ message: 'Forbidden' });
    const sub = await ContactSubmission.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    res.json({ submission: sub });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
