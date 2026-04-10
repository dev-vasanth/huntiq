import nodemailer from 'nodemailer';
import Lead from '../models/Lead.js';
import { generateDigestSummary } from './aiService.js';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.resend.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: parseInt(process.env.EMAIL_PORT || '465') === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function getScoreColor(score) {
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#6b7280';
}

function getScoreBadge(score) {
  if (score >= 70) return 'High Intent';
  if (score >= 40) return 'Medium Intent';
  return 'Low Intent';
}

export async function sendDigestEmail(userId, recipientEmail) {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const leads = await Lead.find({
    userId,
    createdAt: { $gte: yesterday },
  }).sort({ intentScore: -1 }).limit(20);

  const summary = await generateDigestSummary(leads);

  const highIntent = leads.filter(l => l.intentScore >= 70);
  const mediumIntent = leads.filter(l => l.intentScore >= 40 && l.intentScore < 70);

  const leadsHtml = leads.slice(0, 10).map(lead => `
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 12px 16px;">
        <div style="font-weight: 600; color: #f1f5f9; margin-bottom: 4px;">
          <a href="${lead.permalink}" style="color: #a78bfa; text-decoration: none;">${lead.title}</a>
        </div>
        <div style="font-size: 12px; color: #64748b;">r/${lead.subreddit} · ${lead.upvotes} upvotes · ${lead.numComments} comments</div>
        ${lead.intentSignals?.length ? `<div style="font-size: 11px; color: #7c3aed; margin-top: 4px;">🎯 ${lead.intentSignals.slice(0, 3).join(' · ')}</div>` : ''}
      </td>
      <td style="padding: 12px 16px; text-align: center; white-space: nowrap;">
        <span style="background: ${getScoreColor(lead.intentScore)}20; color: ${getScoreColor(lead.intentScore)}; border: 1px solid ${getScoreColor(lead.intentScore)}40; border-radius: 6px; padding: 4px 8px; font-size: 12px; font-weight: 700;">
          ${lead.intentScore}
        </span>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${getScoreBadge(lead.intentScore)}</div>
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 24px 16px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-flex; align-items: center; gap: 8px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 12px 24px;">
        <span style="font-size: 20px;">🎯</span>
        <span style="font-size: 20px; font-weight: 700; color: #a78bfa;">HuntIQ</span>
      </div>
      <div style="color: #64748b; font-size: 13px; margin-top: 12px;">Daily Digest · ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>

    <!-- Stats -->
    <div style="display: flex; gap: 12px; margin-bottom: 24px;">
      <div style="flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #a78bfa;">${leads.length}</div>
        <div style="font-size: 12px; color: #64748b;">Total Leads</div>
      </div>
      <div style="flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #10b981;">${highIntent.length}</div>
        <div style="font-size: 12px; color: #64748b;">High Intent</div>
      </div>
      <div style="flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${mediumIntent.length}</div>
        <div style="font-size: 12px; color: #64748b;">Medium Intent</div>
      </div>
    </div>

    <!-- AI Summary -->
    <div style="background: linear-gradient(135deg, #7c3aed20, #2563eb20); border: 1px solid #7c3aed40; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 600; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">🤖 AI Summary</div>
      <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">${summary}</div>
    </div>

    <!-- Leads Table -->
    ${leads.length > 0 ? `
    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <div style="padding: 16px; border-bottom: 1px solid #334155;">
        <div style="font-weight: 600; color: #f1f5f9;">Top Leads Today</div>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        ${leadsHtml}
      </table>
    </div>
    ` : `
    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 32px; margin-bottom: 12px;">😴</div>
      <div style="color: #94a3b8;">No new leads in the last 24 hours.</div>
      <div style="color: #64748b; font-size: 12px; margin-top: 8px;">Try adding more keywords to monitor.</div>
    </div>
    `}

    <!-- Footer -->
    <div style="text-align: center; color: #475569; font-size: 12px;">
      <p>You're receiving this because you enabled daily digest in HuntIQ.</p>
      <p style="margin-top: 4px;">Manage your preferences in <a href="#" style="color: #a78bfa;">Settings</a></p>
    </div>
  </div>
</body>
</html>`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'HuntIQ <noreply@huntiq.io>',
    to: recipientEmail,
    subject: `🎯 HuntIQ Daily Digest — ${leads.length} new leads today`,
    html,
  });
}

export async function sendAllDailyDigests() {
  const User = (await import('../models/User.js')).default;
  const users = await User.find({ 'digestSettings.enabled': true });

  for (const user of users) {
    try {
      const email = user.digestSettings.email || user.email;
      await sendDigestEmail(user._id, email);
      console.log(`Digest sent to ${email}`);
    } catch (err) {
      console.error(`Failed to send digest to ${user.email}:`, err.message);
    }
  }
}
