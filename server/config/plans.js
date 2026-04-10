// Central plan limits config — single source of truth
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 19,
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
    limits: {
      keywords:        5,
      leadsPerMonth:   500,
      repliesPerMonth: 50,
      campaigns:       1,
      redditOAuth:     false,
      emailDigest:     false,
      fullAnalytics:   false,
      alertsEnabled:   true,
      competitorTracking: true,
    },
  },
  pro: {
    name: 'Pro',
    price: 29,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    limits: {
      keywords:        25,
      leadsPerMonth:   2000,
      repliesPerMonth: 500,
      campaigns:       10,
      redditOAuth:     true,
      emailDigest:     true,
      fullAnalytics:   true,
      alertsEnabled:   true,
      competitorTracking: true,
    },
  },
};

export const getPlanLimits = (plan) => PLANS[plan]?.limits || PLANS.starter.limits;
