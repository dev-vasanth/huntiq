import express from 'express';
import DodoPayments from 'dodopayments';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import { PLANS, getPlanLimits } from '../config/plans.js';
import Keyword from '../models/Keyword.js';
import Campaign from '../models/Campaign.js';

const router = express.Router();

// Lazy Dodo init — reads env at request time
let _dodo;
const getDodo = () => {
  if (!_dodo) {
    _dodo = new DodoPayments({
      bearerToken: process.env.DODO_API_KEY,
      environment: process.env.DODO_ENVIRONMENT || 'live_mode',
    });
  }
  return _dodo;
};

// ─── GET /api/billing/status ────────────────────────────────────────────────
router.get('/status', auth, async (req, res) => {
  try {
    const user   = req.user;
    const limits = getPlanLimits(user.plan);

    const [kwCount, campCount] = await Promise.all([
      Keyword.countDocuments({ userId: user._id }),
      Campaign.countDocuments({ userId: user._id }),
    ]);

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
        keywords:         kwCount,
        campaigns:        campCount,
        leadsThisMonth:   user.usage?.leadsThisMonth  || 0,
        repliesThisMonth: user.usage?.repliesThisMonth || 0,
        resetAt:          user.usage?.resetAt || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/billing/checkout ─────────────────────────────────────────────
router.post('/checkout', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

    const productId = PLANS[plan].dodoProductId;
    if (!productId) return res.status(400).json({ message: `Dodo product ID for "${plan}" not configured. Add DODO_PRODUCT_${plan.toUpperCase()} to .env` });

    const user = req.user;

    const session = await getDodo().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.email,
        name:  user.name,
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: user._id.toString(),
          plan,
        },
      },
      metadata: {
        user_id: user._id.toString(),
        plan,
      },
      return_url: `${process.env.CLIENT_URL}/settings?billing=success&plan=${plan}`,
    });

    res.json({ url: session.checkout_url || session.url });
  } catch (err) {
    console.error('Dodo checkout error:', err);
    res.status(500).json({ message: err?.message || 'Checkout failed' });
  }
});

// ─── GET /api/billing/portal ─────────────────────────────────────────────────
router.get('/portal', auth, async (req, res) => {
  try {
    const customerId = req.user.subscription?.dodoCustomerId;
    if (!customerId) return res.status(400).json({ message: 'No active subscription found. Please subscribe first.' });

    const session = await getDodo().customers.customerPortal.create(customerId);
    res.json({ url: session.link });
  } catch (err) {
    console.error('Dodo portal error:', err);
    // Fallback to static portal URL
    const businessId = process.env.DODO_BUSINESS_ID;
    const env        = process.env.DODO_ENVIRONMENT || 'live_mode';
    const base       = env === 'test_mode' ? 'https://test.customer.dodopayments.com' : 'https://customer.dodopayments.com';
    res.json({ url: `${base}/login/${businessId}` });
  }
});

// ─── POST /api/billing/webhook ───────────────────────────────────────────────
// Dodo uses Standard Webhooks spec — MUST use raw body
export const handleWebhook = async (req, res) => {
  let payload;
  try {
    payload = await getDodo().webhooks.unwrap(
      req.body,
      {
        'webhook-id':        req.headers['webhook-id'],
        'webhook-signature': req.headers['webhook-signature'],
        'webhook-timestamp': req.headers['webhook-timestamp'],
      },
      process.env.DODO_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Dodo webhook verification failed:', err.message);
    return res.status(401).send('Invalid signature');
  }

  const eventType = payload.type;
  const data      = payload.data;
  const userId    = data?.metadata?.user_id || data?.subscription_data?.metadata?.user_id;
  const plan      = data?.metadata?.plan     || data?.subscription_data?.metadata?.plan || 'starter';

  console.log(`Dodo Webhook: ${eventType} for user ${userId}`);

  try {
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.active': {
        if (!userId) break;
        await User.findByIdAndUpdate(userId, {
          plan,
          'subscription.dodoSubscriptionId': data.subscription_id,
          'subscription.dodoCustomerId':     data.customer?.customer_id,
          'subscription.dodoProductId':      data.product_id,
          'subscription.status':             'trialing',
          'subscription.trialEndsAt':        data.trial_period_days
            ? new Date(Date.now() + data.trial_period_days * 24 * 60 * 60 * 1000) : null,
          'subscription.currentPeriodEnd':   data.next_billing_date
            ? new Date(data.next_billing_date) : null,
        });
        break;
      }

      case 'subscription.renewed': {
        if (!userId) break;
        await User.findByIdAndUpdate(userId, {
          plan,
          'subscription.status':           'active',
          'subscription.trialEndsAt':      null,
          'subscription.currentPeriodEnd': data.next_billing_date
            ? new Date(data.next_billing_date) : null,
        });
        break;
      }

      case 'subscription.on_hold': {
        if (!userId) break;
        await User.findByIdAndUpdate(userId, { 'subscription.status': 'past_due' });
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.failed':
      case 'subscription.expired': {
        if (!userId) break;
        await User.findByIdAndUpdate(userId, {
          plan: 'starter',
          'subscription.status':             'canceled',
          'subscription.dodoSubscriptionId': null,
        });
        break;
      }

      case 'payment.succeeded': {
        if (!userId) break;
        await User.findByIdAndUpdate(userId, { 'subscription.status': 'active' });
        break;
      }

      case 'payment.failed': {
        if (!userId) break;
        await User.findByIdAndUpdate(userId, { 'subscription.status': 'past_due' });
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
