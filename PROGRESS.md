# HuntIQ — Project Progress & Context

## Project Overview
**Name:** HuntIQ (`huntiq.io`)
**Type:** Reddit Lead Intelligence SaaS
**Stack:** MongoDB + Express (ESM) + React 18/Vite + Node.js
**Location:** `/Users/vasanthakumar/Documents/new ai app/`

---

## Business Details
- **Pricing:** $19 Starter / $29 Pro launch price (was $49, raised after 50 users) — 7-day free trial
- **Payment:** Stripe (Checkout Sessions + Customer Portal + Webhooks) — TEST MODE active
- **Email:** Resend via Nodemailer SMTP (`noreply@huntiq.io`)
- **Target Users:** Founders, marketers, SaaS builders finding leads on Reddit
- **Domain:** huntiq.io (Namecheap)

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

**Note:** Starter replies are "copy & paste" only (no direct Reddit posting). Pro gets direct post + DM from app.

---

## ✅ Features Built (Complete)

1. **Reddit Scanning** — scans Reddit every 15 min, intent scoring, stores leads
2. **Lead Management** — save, dismiss, reply, filter by status/score/type
3. **AI Reply Drafting** — Claude/Anthropic powered, tone selector, manual fallback
4. **Campaigns** — group keywords, track campaign stats, manage keywords modal
5. **Keywords** — own/competitor types, campaign assignment, subreddit targeting
6. **Competitor Tracking** — mark keywords as competitor, leads tagged with keywordType
7. **Analytics** — Overview tab + Competitor Intel tab (sentiment, pain points, subreddits)
8. **Real-Time Lead Alerts** — email alerts on high-intent leads, 30min throttle, threshold slider
9. **Daily Digest Emails** — scheduled 8AM UTC, branded HuntIQ HTML email
10. **Conversations** — track DMs sent, monitor replies hourly, performance stats
11. **Billing** — Stripe $19/$29 plans, 7-day trial, Customer Portal, webhooks
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

### 3. Dashboard Improvements
- Top leads today
- Recent alerts
- Reply rate trend

---

## 📁 Project File Structure

```
/server
  index.js                    — main entry, mounts all routes
  /models
    User.js                   — plan, subscription, usage, alertSettings, passwordReset
                                isVerified, emailVerifyToken, emailVerifyExpires (NEW)
    Lead.js                   — keywordType (own/competitor), intentScore, sentiment
    Keyword.js                — type (own/competitor), campaignId, isActive
    Campaign.js               — name, color, userId
    Conversation.js           — redditUsername, ourMessage, replies[], status, responseTimeMs
  /routes
    auth.js                   — register, login, forgot-password, reset-password,
                                verify-email/:token, resend-verification (NEW)
    leads.js                  — CRUD, scan, keywordType filter, export (NEW)
    keywords.js               — CRUD, toggle, type update
    campaigns.js              — CRUD, keyword assignment
    reddit.js                 — OAuth, comment, message (auto-creates Conversation)
    billing.js                — status, checkout, portal, webhook
    alerts.js                 — settings GET/PUT, test POST
    conversations.js          — list, stats, create, close, delete, refresh
    analytics.js              — overview, leads-over-time, keywords, subreddits, sentiment, signals, competitor
    replies.js                — generate AI, manual, mark sent
    digest.js                 — settings, test
  /services
    redditService.js          — scanKeyword, scanAllUsers, checkAndSendAlerts
    alertService.js           — sendLeadAlert, checkAndSendAlerts
    emailService.js           — sendAllDailyDigests, sendDigestEmail (HuntIQ branded)
    conversationService.js    — checkConversationsForUser, checkAllUsersConversations
    schedulerService.js       — 15min scan, hourly inbox check, 8AM digest
  /middleware
    auth.js                   — JWT verification
    planLimits.js             — checkKeywordLimit, checkCampaignLimit, checkReplyLimit
  /config
    plans.js                  — PLANS object with limits for starter/pro

/client/src
  App.jsx                     — all routes incl. /verify-email, /verify-email/:token, /privacy, /terms
  /pages
    Landing.jsx               — pricing ($19 Starter / $29 Pro), launch badge, correct feature copy
    Login.jsx                 — HuntIQ branded
    Register.jsx              — redirects to /verify-email after signup
    ForgotPassword.jsx        — HuntIQ branded
    ResetPassword.jsx         — HuntIQ branded
    VerifyEmail.jsx           — check inbox state + auto-verify on token (NEW)
    Checkout.jsx              — correct prices ($19/$29), correct feature copy
    Dashboard.jsx             — triggers OnboardingWizard for first-time users
    Leads.jsx                 — list with filters + Export CSV button (NEW)
    Keywords.jsx              — own/competitor toggle, campaign dropdown, type selector
    Campaigns.jsx             — campaign cards, ManageKeywordsModal
    Analytics.jsx             — Overview tab + Competitor Intel tab
    Settings.jsx              — BillingSection, AlertsSection, Reddit, Profile, Security, Digest
    Conversations.jsx         — DM tracking, stats, thread view, status filters
    PrivacyPolicy.jsx         — /privacy (NEW)
    TermsOfService.jsx        — /terms (NEW)
  /components
    Sidebar.jsx               — HuntIQ logo (🎯 gradient icon), nav links
    LeadCard.jsx              — competitor badge, intent badge, sentiment dot
    ReplyModal.jsx            — AI/manual tabs, Post Comment, Send PM (Pro only)
    OnboardingWizard.jsx      — 3-step overlay modal for new users (NEW)
    UpgradeBanner.jsx         — orange banner for limit reached
    StatsCard.jsx             — reusable stat display card
    ProtectedRoute.jsx        — blocks unverified users → /verify-email (UPDATED)

/client/public
    favicon.svg               — HuntIQ crosshair icon, orange→purple gradient (NEW)
```

---

## ⚙️ Environment Variables (server/.env)

```env
PORT=3000
MONGODB_URI=mongodb+srv://...  ✅ Atlas connected
JWT_SECRET=...                 ⚠️  Use 64-char random hex in production
ANTHROPIC_API_KEY=...          ❌  Still placeholder — needed for AI replies

REDDIT_CLIENT_ID=...           ✅ Added
REDDIT_CLIENT_SECRET=...       ✅ Added
SERVER_URL=https://xxx.ngrok-free.app   (update to Railway URL for production)

EMAIL_HOST=smtp.resend.com     ✅
EMAIL_PORT=465                 ✅
EMAIL_USER=resend              ✅
EMAIL_PASS=re_xxx              ✅
EMAIL_FROM=HuntIQ <noreply@huntiq.io>  ✅

CLIENT_URL=http://localhost:5173  (update to https://huntiq.io for production)

STRIPE_SECRET_KEY=sk_test_...  ✅ Test mode
STRIPE_PUBLISHABLE_KEY=pk_test_... ✅ Test mode
STRIPE_WEBHOOK_SECRET=whsec_...   ✅ Test mode
STRIPE_PRICE_STARTER=price_... ✅ Test mode ($19)
STRIPE_PRICE_PRO=price_...     ✅ Test mode ($29)

# Client (client/.env)
VITE_API_URL=http://localhost:3000/api
```

---

## 🚀 Go-Live Checklist

### Done ✅
- [x] MongoDB Atlas URL connected
- [x] Resend email configured + huntiq.io domain
- [x] Reddit OAuth credentials added
- [x] Stripe test mode fully configured (keys + price IDs + webhook)
- [x] Full rebrand to HuntIQ
- [x] Favicon + page title + og tags
- [x] Privacy Policy + Terms of Service pages
- [x] Email verification on signup
- [x] CSV export
- [x] Onboarding wizard
- [x] Pricing aligned ($19/$29, server + landing + checkout all match)

### Pending ❌
- [ ] `ANTHROPIC_API_KEY` — get from console.anthropic.com
- [ ] `JWT_SECRET` — replace with 64-char random hex (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] Deploy backend to **Railway** + set all env vars
- [ ] Deploy frontend to **Vercel** + set `VITE_API_URL`
- [ ] Set `CLIENT_URL=https://huntiq.io` + `SERVER_URL=https://your-app.railway.app` on Railway
- [ ] Update Reddit OAuth redirect URI to Railway URL
- [ ] Switch Stripe to **live mode** (new keys + new price IDs)
- [ ] Add Stripe webhook pointing to Railway URL
- [ ] Verify Resend domain (huntiq.io DNS records)
- [ ] Run DB migration for existing users: `db.users.updateMany({ isVerified: { $exists: false } }, { $set: { isVerified: true } })`
- [ ] Smoke test full flow (register → verify → checkout → scan → export)

---

## 🛒 Infrastructure Decisions

| Service | Provider | Cost |
|---|---|---|
| Domain | Namecheap — huntiq.io | ~$35/yr |
| Frontend | Vercel | Free |
| Backend | Railway | $5/mo |
| Database | MongoDB Atlas | Free |
| Email sending | Resend | Free (3k/mo) |
| Email inbox | Forward to Gmail | Free |
| SSL | Auto (Vercel + Railway) | Free |
| Payments | Stripe | 2.9% + 30¢ |

---

## 🔑 Key Technical Decisions

- **ESM modules** throughout server (import/export not require)
- **Stripe lazy init** via Proxy pattern to fix ESM dotenv timing issue
- **Password reset tokens** — raw token in email, SHA-256 hash stored in DB
- **Email verify tokens** — same pattern as password reset, 24hr expiry
- **Competitor leads** — keywordType field on both Keyword and Lead models
- **Conversations** — auto-created when DM sent via ReplyModal → reddit.js route
- **Alerts throttle** — max 1 email per 30 minutes per user
- **Scheduler** — 15min Reddit scan, hourly inbox check, 8AM daily digest
- **CSV export** — server-side generation, respects all active filters, 5000 row cap
- **Onboarding** — tracked via localStorage key `huntiq_onboarded`, not DB
- **Pro price** — $29 launch price (update plans.js + Stripe price ID when raising to $49)

---

## 📝 How To Continue

Start a new session and say:
> "Read PROGRESS.md at /Users/vasanthakumar/Documents/new ai app/PROGRESS.md and continue building HuntIQ."

---

*Last updated: Session covering — email verification, onboarding wizard, CSV export, full HuntIQ rebrand, favicon, Privacy Policy, Terms of Service, pricing update ($29 Pro launch price), Stripe test mode setup, go-live checklist*
