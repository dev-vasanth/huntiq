import Keyword from '../models/Keyword.js';
import Campaign from '../models/Campaign.js';
import { getPlanLimits } from '../config/plans.js';

// Reset monthly usage if we're in a new month
export const resetUsageIfNeeded = async (user) => {
  const now = new Date();
  const resetAt = user.usage?.resetAt ? new Date(user.usage.resetAt) : new Date(0);
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    user.usage.leadsThisMonth   = 0;
    user.usage.repliesThisMonth = 0;
    user.usage.resetAt          = now;
    await user.save();
  }
};

// Check keyword limit
export const checkKeywordLimit = async (req, res, next) => {
  try {
    const limits = getPlanLimits(req.user.plan);
    const count  = await Keyword.countDocuments({ userId: req.user._id });
    if (count >= limits.keywords) {
      return res.status(403).json({
        limitReached: true,
        message: `Your ${req.user.plan} plan allows ${limits.keywords} keywords. Upgrade to add more.`,
        limit: limits.keywords,
        current: count,
        upgradeRequired: true,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Check campaign limit
export const checkCampaignLimit = async (req, res, next) => {
  try {
    const limits = getPlanLimits(req.user.plan);
    const count  = await Campaign.countDocuments({ userId: req.user._id });
    if (count >= limits.campaigns) {
      return res.status(403).json({
        limitReached: true,
        message: `Your ${req.user.plan} plan allows ${limits.campaigns} campaign${limits.campaigns > 1 ? 's' : ''}. Upgrade to add more.`,
        limit: limits.campaigns,
        current: count,
        upgradeRequired: true,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Check AI reply limit
export const checkReplyLimit = async (req, res, next) => {
  try {
    await resetUsageIfNeeded(req.user);
    const limits  = getPlanLimits(req.user.plan);
    const current = req.user.usage?.repliesThisMonth || 0;
    if (current >= limits.repliesPerMonth) {
      return res.status(403).json({
        limitReached: true,
        message: `You've used all ${limits.repliesPerMonth} AI reply drafts this month. Upgrade or wait until next month.`,
        limit: limits.repliesPerMonth,
        current,
        upgradeRequired: req.user.plan === 'starter',
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Check Reddit OAuth access (Pro only)
export const checkRedditAccess = (req, res, next) => {
  const limits = getPlanLimits(req.user.plan);
  if (!limits.redditOAuth) {
    return res.status(403).json({
      limitReached: true,
      message: 'Reddit posting requires the Pro plan. Upgrade to connect your Reddit account.',
      upgradeRequired: true,
    });
  }
  next();
};

// Increment reply usage after successful generation
export const incrementReplyUsage = async (userId) => {
  const { default: User } = await import('../models/User.js');
  await User.findByIdAndUpdate(userId, { $inc: { 'usage.repliesThisMonth': 1 } });
};

// Increment lead usage
export const incrementLeadUsage = async (userId, count = 1) => {
  const { default: User } = await import('../models/User.js');
  await User.findByIdAndUpdate(userId, { $inc: { 'usage.leadsThisMonth': count } });
};
