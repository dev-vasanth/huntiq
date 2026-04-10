import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.resend.com',
    port:   parseInt(process.env.EMAIL_PORT || '465'),
    secure: parseInt(process.env.EMAIL_PORT || '465') === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendVerificationEmail(email, verifyUrl) {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'HuntIQ <noreply@huntiq.io>';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#07070f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 16px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#f97316,#a855f7);display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:16px;">🎯</span>
        </div>
        <span style="color:white;font-size:20px;font-weight:700;">HuntIQ</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:#12121f;border:1px solid #1a1a2e;border-radius:16px;overflow:hidden;">
      <div style="height:3px;background:linear-gradient(90deg,#f97316,#a855f7);"></div>
      <div style="padding:32px;">
        <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 8px;">Verify your email</h1>
        <p style="color:#64748b;font-size:14px;margin:0 0 24px;line-height:1.6;">
          Welcome to HuntIQ! Click the button below to verify your email address and start finding Reddit leads.
          This link expires in <strong style="color:#f97316;">24 hours</strong>.
        </p>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${verifyUrl}" target="_blank"
            style="display:inline-block;background:linear-gradient(135deg,#f97316,#a855f7);
            color:white;font-weight:600;font-size:15px;padding:14px 36px;
            border-radius:10px;text-decoration:none;">
            Verify Email →
          </a>
        </div>
        <p style="color:#334155;font-size:12px;margin:0;text-align:center;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${verifyUrl}" style="color:#475569;word-break:break-all;">${verifyUrl}</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <p style="color:#1e293b;font-size:11px;text-align:center;margin-top:20px;">
      If you didn't create a HuntIQ account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Verify your HuntIQ email address',
    html,
  });
}

async function sendResetEmail(email, resetUrl) {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'HuntIQ <noreply@huntiq.io>';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#07070f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 16px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#f97316,#a855f7);display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:16px;">🎯</span>
        </div>
        <span style="color:white;font-size:20px;font-weight:700;">HuntIQ</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:#12121f;border:1px solid #1a1a2e;border-radius:16px;overflow:hidden;">
      <div style="height:3px;background:linear-gradient(90deg,#f97316,#a855f7);"></div>
      <div style="padding:32px;">
        <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 8px;">Reset your password</h1>
        <p style="color:#64748b;font-size:14px;margin:0 0 24px;line-height:1.6;">
          We received a request to reset the password for your HuntIQ account.
          Click the button below to set a new password. This link expires in <strong style="color:#f97316;">1 hour</strong>.
        </p>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${resetUrl}" target="_blank"
            style="display:inline-block;background:linear-gradient(135deg,#f97316,#a855f7);
            color:white;font-weight:600;font-size:15px;padding:14px 36px;
            border-radius:10px;text-decoration:none;">
            Reset Password →
          </a>
        </div>
        <p style="color:#334155;font-size:12px;margin:0;text-align:center;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color:#475569;word-break:break-all;">${resetUrl}</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <p style="color:#1e293b;font-size:11px;text-align:center;margin-top:20px;">
      If you didn't request a password reset, you can safely ignore this email.<br/>
      This email was sent from HuntIQ (huntiq.io). Your password will not be changed.
    </p>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Reset your HuntIQ password',
    html,
  });
}

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate email verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      emailVerifyToken: hashedToken,
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email/${rawToken}`;
    try {
      await sendVerificationEmail(user.email, verifyUrl);
    } catch (emailErr) {
      console.error('[Register] Failed to send verification email:', emailErr.message);
    }

    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, digestSettings } = req.body;
    const update = {};
    if (name) update.name = name;
    if (digestSettings) update.digestSettings = digestSettings;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate a secure random token
    const rawToken  = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken   = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl  = `${clientUrl}/reset-password/${rawToken}`;

    try {
      await sendResetEmail(user.email, resetUrl);
    } catch (emailErr) {
      // Roll back token if email fails
      user.passwordResetToken   = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('[ForgotPassword] Email send failed:', emailErr.message);
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
    }

    user.isVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email verified successfully.', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration
    if (!user || user.isVerified) {
      return res.json({ message: 'If that email exists and is unverified, a new link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.emailVerifyToken = hashedToken;
    user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email/${rawToken}`;

    try {
      await sendVerificationEmail(user.email, verifyUrl);
    } catch (emailErr) {
      console.error('[ResendVerification] Email failed:', emailErr.message);
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.json({ message: 'If that email exists and is unverified, a new link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the incoming raw token and compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: new Date() }, // not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    user.password             = password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
