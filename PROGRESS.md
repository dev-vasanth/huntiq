# HuntIQ — Project Progress & Context

## Project Overview
**Name:** HuntIQ (`huntiq.io`)
**Type:** Multi-Platform Lead Intelligence SaaS (Reddit + Hacker News + more coming)
**Stack:** MongoDB + Express (ESM) + React 18/Vite + Node.js
**Location:** `/Users/vasanthakumar/Documents/new ai app/`
**GitHub:** `https://github.com/dev-vasanth/huntiq` (branch: `main`)
**Domain:** huntiq.io (BigRock)
**Founder email:** vasanthbscit2016@gmail.com

---

## Business Details
- **Pricing:** $19 Starter / $29 Pro launch price — 7-day free trial
- **Payment:** Dodo Payments (dodopayments npm v2.27.0)
- **Email:** Resend via Nodemailer SMTP (`noreply@huntiq.io`) — DNS verified ✅
- **Business email:** `hello@huntiq.io` → forwards to `vasanthbscit2016@gmail.com`
- **Target Users:** SaaS founders, marketers finding leads on Reddit & HN

### Plan Limits (`server/config/plans.js` — single source of truth)
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

---

## ✅ Features Built (Complete)

### Core
1. **Reddit Scanning** — scans Reddit every 15 min, intent scoring, stores leads
2. **Hacker News Scanning** — scans HN Algolia API every 30 min (stories + comments), same pipeline
3. **Lead Management** — save, dismiss, reply, filter by status/score/type/source/campaign
4. **AI Reply Drafting** — Claude Sonnet 4.6, tone selector, manual fallback
5. **Campaigns** — group keywords, track stats, paused campaigns skip scanning
6. **Keywords** — own/competitor types, campaign assignment, subreddit targeting
7. **Competitor Tracking** — mark keywords as competitor, leads tagged with keywordType
8. **Analytics** — Overview + Competitor Intel tabs
9. **Real-Time Lead Alerts** — email alerts on high-intent leads, 30min throttle
10. **Daily Digest Emails** — 8AM UTC, branded HTML email
11. **Conversations** — track DMs sent, monitor replies hourly
12. **Billing** — Dodo Payments $19/$29 plans, 7-day trial, Customer Portal, webhooks
13. **Reddit OAuth** — connect Reddit, post comments, send DMs (Pro only)
14. **Plan Limits** — middleware enforces keyword/campaign/reply limits
15. **Usage Tracking** — monthly usage bars in Settings, resets monthly
16. **Forgot Password / Reset** — secure SHA-256 token, 1hr expiry
17. **Email Verification** — on signup, verify before accessing app
18. **CSV Export** — export leads with active filters, all fields, 5000 row cap
19. **Onboarding Wizard** — 3-step modal for first-time users
20. **Admin Panel** — `/admin` page, founder-only, contact + feature request tabs
21. **Contact / Feature Requests** — public + auth pages, stored in DB + email to founder
22. **AI Subreddit Suggestions** — Pro only, Claude Haiku, 5-7 relevant subreddits
23. **Campaign Filter on Leads page** — filter leads by campaign dropdown

### Lead Quality (done this session)
24. **isValidConversation() gate** — blocks AutoModerator, stickied/mod posts, deleted content, link posts with no discussion, self posts with no body/question
25. **Noise filter** — AITAH, TIFU, relationship drama, memes blocked
26. **Removed "or " and "vs " signals** — were firing on 67% of posts (pure noise)
27. **Raised min score 25 → 40, min signals 1 → 2**
28. **Removed bodyWordMatch** — body requires full phrase match, not word-by-word (was matching Minecraft/hockey posts for "monitor subreddit")
29. **Campaign status filter in scan** — paused/completed campaign keywords skipped
30. **Keyword cleanup** — deleted 4 bad generic keywords, added subreddit restrictions to all 17 remaining
31. **postType field** — 'discussion' / 'link' / 'comment' stored and shown in UI
32. **Source badge on LeadCard** — orange Y for HN (Ask HN / Show HN), violet r/ for Reddit
33. **Source filter on Leads page** — All Sources / Reddit / Hacker News dropdown
34. **MongoDB index fix** — dropped old `{userId, redditId}` unique index, kept `{userId, source, redditId}`, backfilled `source: 'reddit'` on existing leads

### Landing Page (updated this session)
35. **Multi-platform messaging** — removed all Reddit-only references, now mentions Reddit + HN
36. **Mockup updated** — shows Ask HN lead alongside Reddit leads
37. **Stats updated** — "2+ Platforms Monitored" instead of "15min scan interval"

---

## 🔄 Next To Build (Priority Order)

### 🔴 High Priority
1. **Quora as 3rd source** ← NEXT TO BUILD
   - Scrape Quora search results for keywords (no official API, use SerpAPI free tier or direct scraping)
   - Map to same lead pipeline (title, body, author, score, signals)
   - Add `source: 'quora'` to Lead model enum
   - Show green "Quora" badge on LeadCard
   - Add "Quora" option to source filter dropdown
   - File to create: `server/services/quoraService.js`
   - Scrape URL pattern: `https://www.quora.com/search?q=KEYWORD&type=question`
   - Or use SerpAPI: `https://serpapi.com/search.json?engine=quora&q=KEYWORD` (100 free searches/mo)

2. **Reply Templates**
   - Save commonly used reply messages
   - Select template in ReplyModal
   - CRUD templates in Settings

3. **Weekly Email Digest**
   - Monday morning: "You have X new leads this week, Y are high intent"
   - Keeps users active without logging in

### 🟡 Medium Priority
4. **Slack Alerts** — push 70+ score leads to Slack channel instantly
5. **Score Explanation** — show why a post scored X/100 (keyword in title +20, 3 signals +24, etc.)
6. **Free Public Tool** — "Enter keyword → see live Reddit + HN posts" — no signup needed, drives organic signups

### 🟢 Growth
7. **Product Hunt Relaunch** — stronger story now with multi-platform monitoring

---

## 🚀 Deployment Status

### Live ✅
- Frontend → **Vercel** → `huntiq.io`
- Backend → **Railway** → `huntiq-production.up.railway.app`
- `api.huntiq.io` → CNAME → Railway ✅
- MongoDB Atlas connected ✅
- Resend email DNS verified ✅
- Dodo Payments → test mode working, live mode on Railway

### Railway Environment Variables (already set)
```env
PORT=3000
MONGODB_URI=mongodb+srv://huntiq_admin:huntiq_2026@cluster0.97duklf.mongodb.net/...
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
DODO_API_KEY=...
DODO_WEBHOOK_SECRET=...
DODO_ENVIRONMENT=live_mode
DODO_BUSINESS_ID=bus_0NceDZODkGjz7FhhPHqmp
DODO_PRODUCT_STARTER=pdt_0NceDvB4kiffW4sWY1qC2
DODO_PRODUCT_PRO=pdt_0NceE7xac7FpjlL2tSvSJ
```

### Vercel Environment Variables
```env
VITE_API_URL=https://api.huntiq.io/api
```

---

## 📁 Key File Structure

```
/server
  index.js                    — main entry, mounts all routes
  /models
    User.js                   — plan, subscription, usage, alertSettings, passwordReset, isVerified
    Lead.js                   — source (reddit|hackernews), postType, hasBody, keywordType, intentScore
    Keyword.js                — type (own/competitor), campaignId, isActive, subreddits[]
    Campaign.js               — name, color, userId, status (active/paused/completed)
    Conversation.js           — redditUsername, ourMessage, replies[], status
    ContactSubmission.js      — name, email, subject, message, status
    FeatureRequest.js         — userId, title, description, category, status
  /routes
    auth.js                   — register, login, forgot-password, reset-password, verify-email
    leads.js                  — CRUD, scan (Reddit+HN), export, source/campaign/keyword filters
    keywords.js               — CRUD, toggle, suggest-subreddits (Pro)
    campaigns.js              — CRUD, keyword assignment
    reddit.js                 — OAuth, comment, message
    billing.js                — status, checkout, portal, webhook (Dodo Payments)
    alerts.js, conversations.js, analytics.js, replies.js, digest.js
    contact.js, featureRequests.js
  /services
    redditService.js          — scanKeyword, scanAllUsers, fetchRedditPosts
                                exports: analyzeSentiment, detectIntentSignals, isNoise, ALL_INTENT_SIGNALS
    hnService.js              — scanKeywordHN, scanAllUsersHN, fetchHNPosts
                                imports shared utils from redditService.js
    alertService.js           — sendLeadAlert, checkAndSendAlerts
    emailService.js           — sendAllDailyDigests, sendDigestEmail
    aiService.js              — generateReply (Sonnet 4.6), analyzeLeadBatch (Haiku)
    conversationService.js    — checkConversationsForUser, checkAllUsersConversations
    schedulerService.js       — 15min Reddit scan, 30min HN scan (offset 5min), hourly inbox, 8AM digest
  /middleware
    auth.js, planLimits.js
  /config
    plans.js                  — PLANS object, limits, dodoProductId getter

/client/src
  App.jsx                     — all routes
  /pages
    Landing.jsx               — multi-platform messaging (Reddit + HN), updated mockup + stats
    Leads.jsx                 — source filter (All/Reddit/HN), campaign filter
    Dashboard.jsx, Keywords.jsx, Campaigns.jsx, Analytics.jsx
    Settings.jsx, Conversations.jsx, Admin.jsx
    Contact.jsx, FeatureRequests.jsx
    Login.jsx, Register.jsx, ForgotPassword.jsx, ResetPassword.jsx, VerifyEmail.jsx
    PrivacyPolicy.jsx, TermsOfService.jsx, Checkout.jsx
  /components
    LeadCard.jsx              — SourceBadge (HN orange Y / Reddit violet r/), postType pill
    Sidebar.jsx               — Admin link (founder email only)
    ReplyModal.jsx, OnboardingWizard.jsx, UpgradeBanner.jsx, StatsCard.jsx, ProtectedRoute.jsx
```

---

## 🔑 Lead Quality Pipeline (current)

Every post scanned goes through these gates IN ORDER:

```
1. isValidConversation()
   ✗ AutoModerator / [deleted] author → skip
   ✗ Stickied or mod post → skip
   ✗ selftext = [deleted] or [removed] → skip
   ✗ score < -5 → skip
   ✗ link post with < 2 comments → skip
   ✗ self post with no body AND no question/request in title → skip

2. isNoise()
   ✗ AITAH, TIFU, relationship drama, memes → skip

3. Relevance check
   ✓ Full keyword phrase in title → pass
   ✓ Full keyword phrase in body → pass
   ✓ All meaningful words (>3 chars) in title → pass
   ✗ Otherwise → skip

4. Signal check
   ✗ Fewer than 2 intent signals → skip

5. Score check
   ✗ intentScore < 40 → skip

6. ✅ Store as Lead
```

**Active keywords:** 17 total, all with subreddit restrictions (SaaS, startups, entrepreneur, marketing, etc.)

**Removed signals:** `"or "` and `"vs "` — were firing on 67% of posts

---

## 🔑 Key Technical Decisions

- **ESM modules** throughout server (import/export not require)
- **Lazy init pattern** — Dodo client reads env at request time
- **Shared scoring utils** — `analyzeSentiment`, `detectIntentSignals`, `isNoise`, `ALL_INTENT_SIGNALS` exported from redditService.js, imported by hnService.js
- **HN source** — uses HN Algolia API (free, no key), searches stories + comments
- **HN objectID stored in `redditId` field** — no schema change needed, IDs don't collide (HN = numeric, Reddit = base36)
- **Unique index** — `{userId, source, redditId}` — allows same post ID across different platforms
- **MongoDB backfill** — existing leads got `source: 'reddit'` on session 2
- **Campaign scan filter** — only active campaigns' keywords get scanned
- **bodyWordMatch removed** — body requires full phrase, title allows word-by-word (short & deliberate)
- **Admin access** — FOUNDER_EMAIL env var on backend, email check on frontend Sidebar
- **Test account** — testuser@huntiq.io / Test@1234 (Starter plan, verified)

---

## 📝 How To Continue

Start a new session and say:
> "Read PROGRESS.md at /Users/vasanthakumar/Documents/new ai app/PROGRESS.md and continue building HuntIQ."

**Next task:** Build Quora as 3rd lead source (`server/services/quoraService.js`)
- Same pipeline as hnService.js
- Scrape Quora search for each keyword
- Add `source: 'quora'` to Lead model enum
- Add Quora badge to LeadCard (green)
- Add Quora option to source filter in Leads.jsx

---

*Last updated: Session 2 — Lead quality fixes (noise signals, bodyWordMatch, min score 40), Hacker News added as 2nd source, MongoDB index fix, landing page multi-platform update, keyword cleanup (17 keywords all with subreddit filters), campaign scan filter for paused campaigns*
