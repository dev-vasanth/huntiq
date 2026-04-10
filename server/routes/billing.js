import express from 'express';
import Stripe from 'stripe';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import { PLANS, getPlanLimits } from '../config/plans.js';
import Keyword from '../models/Keyword.js';
import Campaign from '../models/Campaign.js';

const router = express.Router();

// Lazy Stripe init — dotenv runs before any request hits, so this is safe
let _stripe;
const getStripe = () => {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
};
const stripe = new Proxy({}, { get: (_, prop) => getStripe()[prop] });

// ─── GET /api/billing/status ────────────────────────────────────────────────
// Returns plan, subscription status, trial info, and usage
router.get('/status', auth, async (req, res) => {
  try {
    const user   = req.user;
    const limits = getPlanLimits(user.plan);

    // Count current usage from DB (keywords / campaigns are real-time)
    const [kwCount, campCount] = await Promise.all([
      Keyword.countDocuments({ userId: user._id }),
      Campaign.countDocuments({ userId: user._id }),
    ]);

    // Calculate trial days remaining
    let trialDaysLeft = null;
    if (user.subscription?.status === 'trialing' && user.subscription?.trialEndsAt) {
      const diff = new Date(user.subscription.trialEndsAt) - new Date();
      trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    res.json({
      plan:               user.plan,
      subscriptionStatus: user.subscription?.status || 'none',
      trialEndsAt:        user.subscription?.trialEndsAt || null,
      currentPeriodEnd:   user.subscription?.currentPeriodEnd || null,
      trialDaysLeft,
      limits,
      usage: {
        keywords:        kwCount,
        campaigns:       campCount,
        leadsThisMonth:  user.usage?.leadsThisMonth  || 0,
        repliesThisMonth: user.usage?.repliesThisMonth || 0,
        resetAt:         user.usage?.resetAt || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/billing/checkout ─────────────────────────────────────────────
// Creates a Stripe Checkout session with 7-day trial
router.post('/checkout', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

    const priceId = PLANS[plan].stripePriceId;
    if (!priceId) return res.status(400).json({ message: `Stripe price ID for "${plan}" not configured. Add STRIPE_PRICE_${plan.toUpperCase()} to .env` });

    const user = req.user;

    // Create or reuse Stripe customer
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name:  user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { 'subscription.stripeCustomerId': customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer:            customerId,
      payment_method_types: ['card'],
      mode:                'subscription',
      line_items: [{
        price:    priceId,
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: user._id.toString(), plan },
      },
      success_url: `${process.env.CLIENT_URL}/settings?billing=success&plan=${plan}`,
      cancel_url:  `${process.env.CLIENT_URL}/checkout?canceled=1`,
      metadata: { userId: user._id.toString(), plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/billing/portal ─────────────────────────────────────────────────
// Opens Stripe Customer Portal for managing subscription / card
router.get('/portal', auth, async (req, res) => {
  try {
    const customerId = req.user.subscription?.stripeCustomerId;
    if (!customerId) return res.status(400).json({ message: 'No billing account found. Please subscribe first.' });

    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${process.env.CLIENT_URL}/settings?billing=portal_return`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/billing/webhook ───────────────────────────────────────────────
// Handles Stripe events — MUST use raw body (mounted separately in index.js)
export const handleWebhook = async (req, res) => {
  const sig     = req.headers['stripe-signature'];
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const data = event.data.object;

    switch (event.type) {
      // Trial started / subscription created
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const userId = data.metadata?.userId;
        if (!userId) break;

        const plan = data.metadata?.plan || 'starter';
        await User.findByIdAndUpdate(userId, {
          plan,
          'subscription.stripeSubscriptionId': data.id,
          'subscription.stripePriceId':        data.items.data[0]?.price?.id,
          'subscription.status':               data.status,
          'subscription.trialEndsAt':          data.trial_end ? new Date(data.trial_end * 1000) : null,
          'subscription.currentPeriodEnd':     new Date(data.current_period_end * 1000),
        });
        console.log(`Subscription ${event.type} for user ${userId}: ${data.status}`);
        break;
      }

      // Payment succeeded → ensure active
      case 'invoice.payment_succeeded': {
        const subId = data.subscription;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await User.findByIdAndUpdate(userId, {
          'subscription.status':           'active',
          'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
        });
        break;
      }

      // Payment failed → mark past_due
      case 'invoice.payment_failed': {
        const subId = data.subscription;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await User.findByIdAndUpdate(userId, { 'subscription.status': 'past_due' });
        console.log(`Payment failed for user ${userId}`);
        break;
      }

      // Subscription canceled → downgrade to starter / none
      case 'customer.subscription.deleted': {
        const userId = data.metadata?.userId;
        if (!userId) break;
        await User.findByIdAndUpdate(userId, {
          plan: 'starter',
          'subscription.status':               'canceled',
          'subscription.stripeSubscriptionId': null,
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ message: err.message });
  }
};

export default router;
