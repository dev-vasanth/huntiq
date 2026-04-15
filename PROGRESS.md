# HuntIQ — Project Progress & Context

## Project Overview
**Name:** HuntIQ (`huntiq.io`)
**Type:** Reddit Lead Intelligence SaaS
**Stack:** MongoDB + Express (ESM) + React 18/Vite + Node.js
**Location:** `/Users/vasanthakumar/Documents/new ai app/`
**Domain:** huntiq.io (BigRock — not Namecheap)
**Founder email:** vasanthbscit2016@gmail.com

---

## Business Details
- **Pricing:** $19 Starter / $29 Pro launch price (was $49, raised after 50 users) — 7-day free trial
- **Payment:** Dodo Payments (switched from Stripe → Lemon Squeezy → Razorpay → Dodo Payments)
- **Why Dodo:** Indian founder + global customers (USD) — Stripe hard to set up in India, Razorpay only supports INR subscriptions, Lemon Squeezy requires PAN
- **Email:** Resend via Nodemailer SMTP (`noreply@huntiq.io`) — DNS verified ✅
- **Business email:** `hello@huntiq.io` → forwards to `vasanthbscit2016@gmail.com` (BigRock email forwarding)
- **Target Users:** Founders, marketers, SaaS builders finding leads on Reddit

### Plan Limits (server/config/plans.js — single source of truth)
| Feature | Starter ($19) | Pro ($29 launch → $49) |
|---|---|---|
| Keywords | 5 | 25 |
| Leads/month | 500 | 2,000 |
| Replies/month | 50 | 500 |
| Campaigns | 1 | 10 |
| Reddit OAuth (post & DM) | ❌ | ✅ |
| Email Digest | ❌ | ✅ |
| Alerts | ✅ | ✅ |
| Competitor Tracking | ✅ | ✅ |
| AI Subreddit Suggestions | ❌ | ✅ |

**Note:** Starter replies are "copy & paste" only (no direct Reddit posting). Pro gets direct post + DM from app.

---

## ✅ Features Built (Complete)

1. **Reddit Scanning** — scans Reddit every 15 min, intent scoring, stores leads
2. **Lead Management** — save, dismiss, reply, filter by status/score/type
3. **AI Reply Drafting** — Claude Sonnet 4.6, tone selector, manual fallback
4. **Campaigns** — group keywords, track campaign stats, manage keywords modal
5. **Keywords** — own/competitor types, campaign assignment, subreddit targeting
6. **Competitor Tracking** — mark keywords as competitor, leads tagged with keywordType
7. **Analytics** — Overview tab + Competitor Intel tab (sentiment, pain points, subreddits)
8. **Real-Time Lead Alerts** — email alerts on high-intent leads, 30min throttle, threshold slider
9. **Daily Digest Emails** — scheduled 8AM UTC, branded HuntIQ HTML email
10. **Conversations** — track DMs sent, monitor replies hourly, performance stats
11. **Billing** — Dodo Payments $19/$29 plans, 7-day trial, Customer Portal, webhooks
12. **Reddit OAuth** — connect Reddit account, post comments, send DMs from app (Pro only)
13. **Plan Limits** — middleware enforces keyword/campaign/reply limits per plan
14. **Usage Tracking** — monthly usage bars in Settings, resets monthly
15. **Forgot Password / Reset** — secure token (SHA-256 hashed), 1hr expiry, branded email
16. **Alert Settings UI** — toggle, email, threshold slider, send test button
17. **Competitor Toggle** — keywords page has own/competitor badge, type selector in form
18. **Lead Type Filter** — leads page has All/Own/Competitor dropdown filter
19. **LeadCard Competitor Badge** — red "Competitor" badge on leads from competitor keywords
20. **ReplyModal Reddit Actions** — Post Comment + Send PM buttons when Reddit connected (Pro)
21. **Settings Page** — Billing, Reddit OAuth, Profile, Security, Digest, Alerts, Integrations
22. **Onboarding Wizard** — 3-step modal for first-time users (keyword → type → scan), skip option, stored in localStorage (`huntiq_onboarded`)
23. **Email Verification** — on signup, verify email before accessing app, resend with 60s cooldown, SHA-256 token
24. **CSV Export** — export leads with current filters applied, all fields, capped at 5000 rows, auto-download
25. **Full Rebrand** — LeadRadar → HuntIQ across all files, favicon SVG (crosshair gradient), page title, og tags
26. **Privacy Policy** — `/privacy` page, 11 sections, linked from footer
27. **Terms of Service** — `/terms` page, 14 sections, linked from footer
28. **Dashboard Improvements** — Today/Top Scoring tab toggle, Reply Rate stat, weekly trend bar chart, 5 stat cards
29. **AI Subreddit Suggestions** — Pro only, "AI Suggest" button in keyword form calls Claude Haiku, returns 5-7 relevant subreddits as clickable tags; Starter sees lock icon
30. **Reddit Scan Quality Fixes** — relevance check (keyword in title/body OR 2+ intent signals), min intent score 20, User-Agent updated to HuntIQ, `since` date filter added to leads API
31. **Contact Us** — `/contact` public page, stores in DB + emails founder, linked from landing footer
32. **Feature Requests** — `/feature-requests` in sidebar (all users), category picker, stores in DB + emails founder
33. **Admin View** — `/admin` page, only visible for founder email (`vasanthbscit2016@gmail.com`), two tabs: Contact Submissions & Feature Requests, status dropdowns, expand to read

---

## 🔄 Features Still To Build (Priority Order)

### 1. Reply Templates
- Save commonly used reply messages
- Select template in ReplyModal
- CRUD templates in Settings

### 2. Sidebar Unread Badges
- Show count of new leads since last visit
- Store lastVisitedAt on user
- Fetch unread count on app load

---

## 🚀 Deployment Status

### Done ✅
- [x] Frontend deployed to **Vercel** → `huntiq.io` live ✅
- [x] Backend deployed to **Railway** → `huntiq-production.up.railway.app`
- [x] `api.huntiq.io` subdomain setup (CNAME → Railway) — DNS propagating
- [x] `huntiq.io` A record → Vercel (216.198.79.1) ✅
- [x] `vercel.json` at repo root with SPA rewrites ✅
- [x] `railway.toml` with build + start commands ✅
- [x] Server binds to `0.0.0.0` for Railway ✅
- [x] MongoDB Atlas connected ✅
- [x] Resend email configured + huntiq.io DNS verified ✅

### Pending ❌
- [ ] Confirm `api.huntiq.io` is live → test `https://api.huntiq.io/api/health`
- [ ] Update Railway Variables: `CLIENT_URL=https://huntiq.io`, `SERVER_URL=https://api.huntiq.io`
- [ ] Update Vercel env var: `VITE_API_URL=https://api.huntiq.io/api` → redeploy
- [ ] Update Reddit OAuth redirect URI → `https://api.huntiq.io/api/reddit/callback`
- [ ] **Sign up on Dodo Payments** (dodopayments.com) → connect Indian bank account
- [ ] Create 2 products on Dodo: HuntIQ Starter ($19/mo) + HuntIQ Pro ($29/mo) with 7-day trial
- [ ] Add Dodo env vars to Railway (see below)
- [ ] Add Dodo webhook → `https://api.huntiq.io/api/billing/webhook`
- [ ] Run DB migration: `db.users.updateMany({ isVerified: { $exists: false } }, { $set: { isVerified: true } })`
- [ ] Smoke test full flow (register → verify → checkout → scan → export)

---

## 📁 Project File Structure

```
/server
  index.js                    — main entry, mounts all routes
  railway.toml                — Railway build/start config (repo root)
  vercel.json                 — Vercel SPA rewrites + build config (repo root)
  /models
    User.js                   — plan, subscription (dodoCustomerId/dodoSubscriptionId),
                                usage, alertSettings, passwordReset,
                                isVerified, emailVerifyToken, emailVerifyExpires
    Lead.js                   — keywordType (own/competitor), intentScore, sentiment
    Keyword.js                — type (own/competitor), campaignId, isActive
    Campaign.js               — name, color, userId
    Conversation.js           — redditUsername, ourMessage, replies[], status, responseTimeMs
    ContactSubmission.js      — name, email, subject, message, status (new/read/replied)
    FeatureRequest.js         — userId, title, description, category, status
  /routes
    auth.js                   — register, login, forgot-password, reset-password,
                                verify-email/:token, resend-verification
    leads.js                  — CRUD, scan, scan/test, keywordType filter, export, since filter
    keywords.js               — CRUD, toggle, type update, suggest-subreddits (Pro)
    campaigns.js              — CRUD, keyword assignment
    reddit.js                 — OAuth, comment, message (auto-creates Conversation)
    billing.js                — status, checkout, portal, webhook (Dodo Payments)
    alerts.js                 — settings GET/PUT, test POST
    conversations.js          — list, stats, create, close, delete, refresh
    analytics.js              — overview, leads-over-time, keywords, subreddits, sentiment, signals, competitor
    replies.js                — generate AI, manual, mark sent
    digest.js                 — settings, test
    contact.js                — POST (public), GET/PATCH (founder only)
    featureRequests.js        — POST (auth), GET/PATCH (founder only)
  /services
    redditService.js          — scanKeyword, scanAllUsers, fetchRedditPosts (exported)
    alertService.js           — sendLeadAlert, checkAndSendAlerts
    emailService.js           — sendAllDailyDigests, sendDigestEmail (HuntIQ branded)
    aiService.js              — generateReply (Sonnet 4.6), analyzeLeadBatch (Haiku), generateDigestSummary (Haiku)
    conversationService.js    — checkConversationsForUser, checkAllUsersConversations
    schedulerService.js       — 15min scan, hourly inbox check, 8AM digest
  /middleware
    auth.js                   — JWT verification
    planLimits.js             — checkKeywordLimit, checkCampaignLimit, checkReplyLimit
  /config
    plans.js                  — PLANS object with limits for starter/pro (uses dodoProductId getter)
  /scripts
    createRazorpayPlans.js    — unused (kept for reference), was for Razorpay USD plan creation

/client/src
  App.jsx                     — all routes incl. /contact, /feature-requests, /admin
  /pages
    Landing.jsx               — pricing ($19 Starter / $29 Pro), Contact link in footer
    Login.jsx                 — HuntIQ branded
    Register.jsx              — redirects to /verify-email after signup
    ForgotPassword.jsx        — HuntIQ branded
    ResetPassword.jsx         — HuntIQ branded
    VerifyEmail.jsx           — check inbox state + auto-verify on token
    Checkout.jsx              — "Secured by Dodo Payments" trust badge
    Dashboard.jsx             — Today/Top Scoring tabs, Reply Rate stat, weekly trend chart
    Leads.jsx                 — list with filters + Export CSV button
    Keywords.jsx              — own/competitor toggle, AI Suggest (Pro), campaign dropdown
    Campaigns.jsx             — campaign cards, ManageKeywordsModal
    Analytics.jsx             — Overview tab + Competitor Intel tab
    Settings.jsx              — BillingSection (no Anthropic Claude AI card), AlertsSection, Reddit, Profile, Security, Digest
    Conversations.jsx         — DM tracking, stats, thread view, status filters
    PrivacyPolicy.jsx         — /privacy
    TermsOfService.jsx        — /terms
    Contact.jsx               — /contact (public), name/email/subject/message form
    FeatureRequests.jsx       — /feature-requests (auth), category picker + form
    Admin.jsx                 — /admin (founder only), contact + feature request tabs
  /components
    Sidebar.jsx               — Feature Requests link, Admin link (founder only)
    LeadCard.jsx              — competitor badge, intent badge, sentiment dot
    ReplyModal.jsx            — AI/manual tabs, Post Comment, Send PM (Pro only)
    OnboardingWizard.jsx      — 3-step overlay modal for new users
    UpgradeBanner.jsx         — orange banner for limit reached
    StatsCard.jsx             — reusable stat display card
    ProtectedRoute.jsx        — blocks unverified users → /verify-email

/client/public
    favicon.svg               — HuntIQ crosshair icon, orange→purple gradient
```

---

## ⚙️ Environment Variables

### Railway (server) — set in Railway Variables dashboard
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...

ANTHROPIC_API_KEY=sk-ant-...

REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
SERVER_URL=https://api.huntiq.io
CLIENT_URL=https://huntiq.io

EMAIL_HOST=smtp.resend.com
EMAIL_PORT=465
EMAIL_USER=resend
EMAIL_PASS=re_xxx
EMAIL_FROM=HuntIQ <noreply@huntiq.io>

FOUNDER_EMAIL=vasanthbscit2016@gmail.com

# Dodo Payments (to be added after signup)
DODO_API_KEY=...
DODO_WEBHOOK_SECRET=...
DODO_ENVIRONMENT=live_mode
DODO_BUSINESS_ID=...            ← from Dodo dashboard
DODO_PRODUCT_STARTER=pdt_...    ← product ID for $19 plan
DODO_PRODUCT_PRO=pdt_...        ← product ID for $29 plan
```

### Vercel (client)
```env
VITE_API_URL=https://api.huntiq.io/api
```

### Local dev (server/.env)
```env
PORT=3000
VITE_API_URL=http://localhost:3000/api
# ... same as Railway but with localhost URLs
```

---

## 🛒 Infrastructure

| Service | Provider | Cost |
|---|---|---|
| Domain | BigRock — huntiq.io | ~$35/yr |
| Frontend | Vercel | Free |
| Backend | Railway | $5/mo |
| Database | MongoDB Atlas | Free |
| Email sending | Resend | Free (3k/mo) |
| Email inbox | hello@huntiq.io → Gmail forward | Free |
| SSL | Auto (Vercel + Railway) | Free |
| Payments | Dodo Payments | ~3% + 30¢ |

---

## 🔑 Key Technical Decisions

- **ESM modules** throughout server (import/export not require)
- **Lazy init pattern** — Dodo client reads env at request time (fixes ESM dotenv timing)
- **Password reset tokens** — raw token in email, SHA-256 hash stored in DB
- **Email verify tokens** — same pattern as password reset, 24hr expiry
- **Competitor leads** — keywordType field on both Keyword and Lead models
- **Conversations** — auto-created when DM sent via ReplyModal → reddit.js route
- **Alerts throttle** — max 1 email per 30 minutes per user
- **Scheduler** — 15min Reddit scan, hourly inbox check, 8AM daily digest
- **CSV export** — server-side generation, respects all active filters, 5000 row cap
- **Onboarding** — tracked via localStorage key `huntiq_onboarded`, not DB
- **Pro price** — $29 launch price (update plans.js + Dodo product ID when raising to $49)
- **AI models** — generateReply: claude-sonnet-4-6, analyzeLeadBatch + digestSummary: claude-haiku-4-5-20251001
- **AI Subreddit Suggest** — Pro only, POST /api/keywords/suggest-subreddits, Claude Haiku
- **Reddit scan quality** — unquoted search + relevance check (keyword in title/body OR 2+ intent signals) + min score 20
- **Admin access** — checked by FOUNDER_EMAIL env var on backend, user.email check on frontend
- **Test account** — testuser@huntiq.io / Test@1234 (Starter plan, verified)
- **Dodo webhook** — uses Standard Webhooks spec (webhook-id, webhook-signature, webhook-timestamp headers)
- **api.huntiq.io** → Railway backend; **huntiq.io** → Vercel frontend
- **dodopayments npm package** v2.27.0 used for SDK

---

## 📝 How To Continue

Start a new session and say:
> "Read PROGRESS.md at /Users/vasanthakumar/Documents/new ai app/PROGRESS.md and continue building HuntIQ."

---

*Last updated: Session covering — Deployment (Railway + Vercel), huntiq.io live on Vercel, api.huntiq.io subdomain for Railway backend, billing switched from Stripe → Dodo Payments (Indian founder + global USD subscriptions), dodopayments npm package v2.27.0, User model updated to dodoCustomerId/dodoSubscriptionId/dodoProductId, plans.js uses dodoProductId getter, Checkout.jsx updated to "Secured by Dodo Payments", removed Anthropic Claude AI card from Settings Integrations*
