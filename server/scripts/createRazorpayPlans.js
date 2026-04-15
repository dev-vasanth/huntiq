// One-time script to create Razorpay plans in USD
// Run: node scripts/createRazorpayPlans.js

import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPlans() {
  try {
    console.log('Creating HuntIQ Starter plan ($19/month USD)...');
    const starter = await razorpay.plans.create({
      period:   'monthly',
      interval: 1,
      item: {
        name:        'HuntIQ Starter',
        amount:      1900,   // $19.00 in cents
        currency:    'USD',
        description: 'HuntIQ Starter Plan — 5 keywords, 500 leads/month',
      },
    });
    console.log('✅ Starter Plan ID:', starter.id);

    console.log('\nCreating HuntIQ Pro plan ($29/month USD)...');
    const pro = await razorpay.plans.create({
      period:   'monthly',
      interval: 1,
      item: {
        name:        'HuntIQ Pro',
        amount:      2900,   // $29.00 in cents
        currency:    'USD',
        description: 'HuntIQ Pro Plan — 25 keywords, 2000 leads/month',
      },
    });
    console.log('✅ Pro Plan ID:', pro.id);

    console.log('\n─────────────────────────────────────');
    console.log('Add these to your Railway Variables:');
    console.log(`RAZORPAY_PLAN_STARTER=${starter.id}`);
    console.log(`RAZORPAY_PLAN_PRO=${pro.id}`);
    console.log('─────────────────────────────────────');
  } catch (err) {
    console.error('❌ Error:', err?.error?.description || err.message);
  }
}

createPlans();
