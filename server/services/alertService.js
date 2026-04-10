import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function scoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#6b7280';
}

function scoreBadge(score) {
  if (score >= 80) return '🔥 Very High Intent';
  if (score >= 60) return '⚡ High Intent';
  return '📌 Medium Intent';
}

// Send a real-time alert for one or more new high-intent leads
export async function sendLeadAlert(user, leads) {
  if (!leads?.length) return;

  const recipientEmail = user.alertSettings?.email || user.email;
  const transporter    = createTransporter();
  const from           = process.env.EMAIL_FROM || 'LeadRadar <noreply@leadradar.com>';

  const leadRows = leads.slice(0, 5).map(lead => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #1a1a2e; vertical-align:top;">
        <div style="margin-bottom:6px;">
          <span style="background:${scoreColor(lead.intentScore)}22; color:${scoreColor(lead.intentScore)};
            border:1px solid ${scoreColor(lead.intentScore)}44; border-radius:20px;
            padding:2px 10px; font-size:11px; font-weight:600;">
            ${scoreBadge(lead.intentScore)} · ${lead.intentScore}
          </span>
        </div>
        <a href="${lead.permalink}" target="_blank"
          style="color:#f1f5f9; font-weight:600; font-size:14px; text-decoration:none; line-height:1.4;">
          ${lead.title}
        </a>
        <div style="color:#64748b; font-size:12px; margin-top:4px;">
          r/${lead.subreddit} · u/${lead.author || 'unknown'} · ${lead.upvotes} upvotes
        </div>
        ${lead.body ? `<div style="color:#94a3b8; font-size:13px; margin-top:6px; line-height:1.5;">
          ${lead.body.slice(0, 150)}${lead.body.length > 150 ? '...' : ''}
        </div>` : ''}
        <a href="${lead.permalink}" target="_blank"
          style="display:inline-block; margin-top:8px; color:#a855f7; font-size:12px; text-decoration:none;">
          View on Reddit →
        </a>
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#07070f; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center; margin-bottom:32px;">
      <div style="display:inline-flex; align-items:center; gap:10px; margin-bottom:8px;">
        <div style="width:36px; height:36px; border-radius:10px;
          background:linear-gradient(135deg,#f97316,#a855f7);
          display:inline-flex; align-items:center; justify-content:center;">
          <span style="color:white; font-size:18px;">⚡</span>
        </div>
        <span style="color:white; font-size:20px; font-weight:700;">LeadRadar</span>
      </div>
    </div>

    <!-- Alert card -->
    <div style="background:#12121f; border:1px solid #1a1a2e; border-radius:16px; overflow:hidden; margin-bottom:24px;">
      <!-- Top bar -->
      <div style="height:3px; background:linear-gradient(90deg,#f97316,#a855f7);"></div>
      <div style="padding:24px 24px 0;">
        <h1 style="color:white; font-size:20px; font-weight:700; margin:0 0 4px;">
          🎯 ${leads.length} High-Intent Lead${leads.length > 1 ? 's' : ''} Found
        </h1>
        <p style="color:#64748b; font-size:14px; margin:0 0 20px;">
          LeadRadar just spotted ${leads.length > 1 ? 'these posts' : 'this post'} on Reddit that match${leads.length === 1 ? 'es' : ''} your keywords with a strong buying signal.
        </p>
      </div>

      <!-- Leads table -->
      <div style="padding:0 24px 24px;">
        <table style="width:100%; border-collapse:collapse;">
          ${leadRows}
        </table>
        ${leads.length > 5 ? `
        <p style="color:#475569; font-size:12px; margin:12px 0 0; text-align:center;">
          +${leads.length - 5} more lead${leads.length - 5 > 1 ? 's' : ''} waiting in your dashboard
        </p>` : ''}
      </div>

      <!-- CTA -->
      <div style="padding:20px 24px; background:#0d0d1a; border-top:1px solid #1a1a2e; text-align:center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/leads"
          style="display:inline-block; background:linear-gradient(135deg,#f97316,#a855f7);
          color:white; font-weight:600; font-size:14px; padding:12px 32px;
          border-radius:10px; text-decoration:none;">
          View Leads & Reply →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <p style="color:#1e293b; font-size:11px; text-align:center; margin:0;">
      You're receiving this because you enabled lead alerts in LeadRadar.
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/settings"
        style="color:#334155; text-decoration:underline;">Manage alerts</a>
    </p>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from,
      to:      recipientEmail,
      subject: `⚡ ${leads.length} high-intent lead${leads.length > 1 ? 's' : ''} found on Reddit`,
      html,
    });
    console.log(`[Alert] Sent to ${recipientEmail}: ${leads.length} leads`);
  } catch (err) {
    console.error('[Alert] Email failed:', err.message);
  }
}

// Called after each scan batch — finds new high-intent leads and alerts user
export async function checkAndSendAlerts(userId, newLeadIds) {
  if (!newLeadIds?.length) return;

  try {
    const User = (await import('../models/User.js')).default;
    const Lead = (await import('../models/Lead.js')).default;

    const user = await User.findById(userId);
    if (!user?.alertSettings?.enabled) return;

    const threshold = user.alertSettings?.threshold ?? 70;

    // Only alert for leads above threshold that were just created
    const highIntentLeads = await Lead.find({
      _id:         { $in: newLeadIds },
      userId,
      intentScore: { $gte: threshold },
    }).sort({ intentScore: -1 });

    if (!highIntentLeads.length) return;

    // Throttle: max 1 alert per 30 minutes per user
    const now = new Date();
    const lastAlert = user.alertSettings?.lastAlertedAt;
    if (lastAlert && (now - new Date(lastAlert)) < 30 * 60 * 1000) {
      console.log(`[Alert] Throttled for user ${userId} (last alert < 30 min ago)`);
      return;
    }

    await sendLeadAlert(user, highIntentLeads);

    // Update lastAlertedAt
    await User.findByIdAndUpdate(userId, { 'alertSettings.lastAlertedAt': now });
  } catch (err) {
    console.error('[Alert] checkAndSendAlerts error:', err.message);
  }
}
