import axios from 'axios';
import Lead from '../models/Lead.js';
import Keyword from '../models/Keyword.js';
import Campaign from '../models/Campaign.js';
import { checkAndSendAlerts } from './alertService.js';

// ── B2B Intent Signals ─────────────────────────────────────────────────────
const B2B_SIGNALS = [
  // Tool/software discovery
  'looking for a tool', 'need a tool', 'what tool', 'which tool',
  'looking for software', 'need software', 'what software',
  'looking for a platform', 'need a platform', 'what platform',
  'looking for a solution', 'need a solution',
  'recommend a tool', 'recommend software', 'recommend a platform',
  'best tool for', 'best software for', 'best platform for',
  'any tool', 'any software', 'any platform', 'any saas',
  // Evaluation & buying
  'we are evaluating', 'evaluating options', 'comparing tools',
  'shortlisted', 'short list', 'due diligence',
  'pricing', 'how much does', 'what does it cost', 'cost of',
  'free trial', 'demo', 'book a demo', 'request a demo',
  'enterprise plan', 'startup plan', 'team plan',
  // Pain & switching
  'switching from', 'moving away from', 'replacing', 'alternative to',
  'tired of', 'frustrated with', 'problem with', 'issue with',
  'our team needs', 'our company needs', 'my team needs',
  'we need', 'we want', 'we are looking',
  // ROI & results
  'increased revenue', 'save time', 'automate', 'scale',
  'worth the investment', 'roi', 'return on investment',
];

// ── B2C Intent Signals ─────────────────────────────────────────────────────
const B2C_SIGNALS = [
  // Purchase intent
  'want to buy', 'looking to buy', 'thinking of buying', 'should i buy',
  'worth buying', 'is it worth', 'worth it',
  'where to buy', 'best place to buy', 'how to get',
  'just bought', 'just purchased', 'thinking about getting',
  'anyone bought', 'has anyone tried', 'anyone use',
  // Recommendations
  'recommend', 'recommendations', 'suggest', 'suggestions',
  'what do you use', 'what do you recommend', 'what should i use',
  'looking for recommendations', 'need recommendations',
  'best for', 'which is better', 'which one should i',
  // Comparison
  'versus', 'comparison', 'compare', 'difference between',
  'pros and cons', 'pros cons',
  // Reviews
  'review', 'reviews', 'honest review', 'real review',
  'experience with', 'thoughts on', 'opinions on',
  'anyone have experience',
  // Discovery
  'looking for', 'need help finding', 'help me find',
  'any good', 'any decent', 'any reliable',
];

// ── General High-Intent Signals ────────────────────────────────────────────
const GENERAL_SIGNALS = [
  'need help', 'help me', 'how to', 'looking to',
  'considering', 'thinking about', 'planning to',
  'should i', 'which one', 'what is the best',
  'tried', 'trying', 'alternatives', 'alternative',
  'anyone know', 'does anyone', 'has anyone',
];

// ── Negative / Noise Filters ───────────────────────────────────────────────
const NOISE_SIGNALS = [
  'aitah', 'aita', 'tifu', 'eli5', 'relationship advice',
  'my boyfriend', 'my girlfriend', 'my husband', 'my wife',
  'my fiancé', 'my fiance', 'my ex', 'my crush',
  'reddit moment', 'meme', 'funny', 'lol', 'lmao',
  'unpopular opinion', 'hot take', 'change my mind',
];

export const ALL_INTENT_SIGNALS = [...new Set([...B2B_SIGNALS, ...B2C_SIGNALS, ...GENERAL_SIGNALS])];

const POSITIVE_WORDS = ['love', 'great', 'amazing', 'excellent', 'good', 'best', 'awesome', 'perfect', 'happy', 'recommend', 'fantastic', 'solid', 'reliable', 'helpful'];
const NEGATIVE_WORDS = ['hate', 'terrible', 'awful', 'bad', 'worst', 'horrible', 'disappointed', 'broken', 'useless', 'scam', 'trash', 'garbage', 'overpriced', 'buggy'];

export function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach(w => { if (lower.includes(w)) score++; });
  NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) score--; });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

export function detectIntentSignals(text) {
  const lower = text.toLowerCase();
  return ALL_INTENT_SIGNALS.filter(signal => lower.includes(signal));
}

export function isNoise(text) {
  const lower = text.toLowerCase();
  return NOISE_SIGNALS.some(signal => lower.includes(signal));
}

// ── Valid Conversation Check ───────────────────────────────────────────────
// Filters out mod posts, announcements, deleted content, spam cross-posts,
// link posts with no discussion, and self-promo without engagement.
function isValidConversation(post) {
  // Skip bot/deleted/mod authors
  const author = post.author || '';
  if (!author || author === '[deleted]' || author === 'AutoModerator') return false;

  // Skip stickied mod posts (weekly threads, announcements, rule posts)
  if (post.stickied) return false;

  // Skip posts marked as mod posts (distinguished)
  if (post.distinguished === 'moderator') return false;

  // Skip deleted/removed content
  const body = post.selftext || '';
  if (body === '[deleted]' || body === '[removed]') return false;

  // Skip heavily downvoted — likely spam or off-topic
  if ((post.score || post.ups || 0) < -5) return false;

  // Skip link posts (not self posts) with zero discussion — no conversation happening
  if (!post.is_self && (post.num_comments || 0) < 2) return false;

  // Self posts must have either a meaningful body OR a clear question/request in title
  // Catches spam posts, self-promo announcements, and "day 243 of posting" journals
  if (post.is_self) {
    const hasBody = body.trim().length > 75;
    const titleLower = post.title.toLowerCase();
    const isQuestion = post.title.includes('?');
    const isRequest = /^(how|what|which|where|any|looking|need|recommend|help|should|can|does|is there|are there)/i.test(post.title);
    const isSeeking = titleLower.includes('looking for') || titleLower.includes('need a') ||
                      titleLower.includes('want to') || titleLower.includes('help me');
    if (!hasBody && !isQuestion && !isRequest && !isSeeking) return false;
  }

  return true;
}

function calculateIntentScore(post, detectedSignals, keywordLower) {
  let score = 0;

  const titleLower = post.title.toLowerCase();
  const textLower = `${post.title} ${post.selftext || ''}`.toLowerCase();

  // Keyword in title = strong signal (up to 20 bonus points)
  if (titleLower.includes(keywordLower)) score += 20;
  else if (textLower.includes(keywordLower)) score += 10;

  // Intent signals weight (up to 35 points)
  score += Math.min(detectedSignals.length * 8, 35);

  // Engagement score (up to 25 points)
  const engagementScore = Math.log1p(post.ups + post.num_comments * 2) * 2.5;
  score += Math.min(engagementScore, 25);

  // Recency (up to 15 points) - posts within 24h get max
  const hoursOld = (Date.now() / 1000 - post.created_utc) / 3600;
  if (hoursOld < 2) score += 15;
  else if (hoursOld < 6) score += 10;
  else if (hoursOld < 12) score += 7;
  else if (hoursOld < 24) score += 3;

  // Question posts get bonus (up to 5 points)
  if (post.title.includes('?') || titleLower.startsWith('how') ||
      titleLower.startsWith('what') || titleLower.startsWith('which') ||
      titleLower.startsWith('any')) {
    score += 5;
  }

  return Math.min(Math.round(score), 100);
}

export async function fetchRedditPosts(query, subreddits = []) {
  const headers = {
    'User-Agent': 'HuntIQ/1.0 (by /u/huntiq)',
  };

  const results = [];

  try {
    if (subreddits.length > 0) {
      // Search in specific subreddits
      for (const sub of subreddits.slice(0, 5)) {
        const url = `https://www.reddit.com/r/${sub}/search.json`;
        const res = await axios.get(url, {
          params: { q: query, restrict_sr: 'on', sort: 'new', limit: 25, t: 'week' },
          headers,
          timeout: 10000,
        });
        if (res.data?.data?.children) {
          results.push(...res.data.data.children.map(c => c.data));
        }
        // Small delay to respect rate limits
        await new Promise(r => setTimeout(r, 500));
      }
    } else {
      // Global search
      const url = 'https://www.reddit.com/search.json';
      const res = await axios.get(url, {
        params: { q: query, sort: 'new', limit: 25, t: 'week' },
        headers,
        timeout: 10000,
      });
      if (res.data?.data?.children) {
        results.push(...res.data.data.children.map(c => c.data));
      }
    }
  } catch (err) {
    console.error(`Reddit API error for "${query}":`, err.message);
  }

  return results;
}

export async function scanKeyword(keyword, userId) {
  try {
    const posts = await fetchRedditPosts(keyword.keyword, keyword.subreddits);
    let newCount = 0;
    const newLeadIds = [];

    for (const post of posts) {
      // Skip if already exists
      const exists = await Lead.findOne({ userId, redditId: post.id });
      if (exists) continue;

      const text = `${post.title} ${post.selftext || ''}`;

      // Skip non-conversation posts: mod announcements, stickied, deleted, spam cross-posts
      if (!isValidConversation(post)) continue;

      // Skip noise posts (AITAH, TIFU, relationship drama, memes etc.)
      if (isNoise(text)) continue;

      const keywordLower = keyword.keyword.toLowerCase();
      const titleLower = post.title.toLowerCase();
      const textLower = text.toLowerCase();
      const keywordWords = keywordLower.split(' ').filter(w => w.length > 2);

      const detectedSignals = detectIntentSignals(text);
      const intentScore = calculateIntentScore(post, detectedSignals, keywordLower);
      const sentiment = analyzeSentiment(text);

      // Relevance: keyword MUST appear in title or body — intent signals alone are not enough
      const titlePhraseMatch = titleLower.includes(keywordLower);
      const bodyPhraseMatch = textLower.includes(keywordLower);
      // Word-by-word match only allowed in title (short, deliberate text)
      // Body word match removed — prevents "monitor subreddit" matching any post that
      // mentions "subreddit" and "monitor" spread across 2000 chars of unrelated content
      const meaningfulWords = keywordWords.filter(w => w.length > 3);
      const titleWordMatch = meaningfulWords.length >= 2 &&
        meaningfulWords.every(w => titleLower.includes(w));

      // Keyword must actually appear — full phrase in body, or all meaningful words in title
      const isRelevant = titlePhraseMatch || bodyPhraseMatch || titleWordMatch;
      if (!isRelevant) continue;

      // Require at least 2 intent signals AND minimum score of 40
      if (detectedSignals.length < 2 || intentScore < 40) continue;

      const lead = await Lead.create({
        userId,
        keywordId: keyword._id,
        keywordText: keyword.keyword,
        keywordType: keyword.type || 'own',
        redditId: post.id,
        title: post.title,
        body: (post.selftext || '').slice(0, 2000),
        url: post.url,
        permalink: `https://reddit.com${post.permalink}`,
        subreddit: post.subreddit,
        author: post.author,
        upvotes: post.ups || 0,
        numComments: post.num_comments || 0,
        redditCreatedAt: new Date(post.created_utc * 1000),
        intentScore,
        sentiment,
        intentSignals: detectedSignals,
        postType: post.is_self ? 'discussion' : 'link',
        hasBody: (post.selftext || '').trim().length > 75,
      });

      newLeadIds.push(lead._id);
      newCount++;
    }

    // Update keyword stats
    await Keyword.findByIdAndUpdate(keyword._id, {
      $inc: { totalLeads: newCount },
      lastScanned: new Date(),
    });

    // Fire real-time alerts for high-intent leads (non-blocking)
    if (newLeadIds.length > 0) {
      checkAndSendAlerts(userId, newLeadIds).catch(() => {});
    }

    return newCount;
  } catch (err) {
    console.error(`Error scanning keyword "${keyword.keyword}":`, err.message);
    return 0;
  }
}

export async function scanAllUsers() {
  try {
    const User = (await import('../models/User.js')).default;
    const users = await User.find({});

    for (const user of users) {
      // Get active campaigns for this user
      const activeCampaigns = await Campaign.find({ userId: user._id, status: 'active' }).select('_id');
      const activeCampaignIds = activeCampaigns.map(c => c._id.toString());

      // Only scan keywords that are:
      // 1. Active (isActive: true)
      // 2. Either not assigned to any campaign OR assigned to an active campaign
      const keywords = await Keyword.find({ userId: user._id, isActive: true });

      const eligibleKeywords = keywords.filter(kw => {
        if (!kw.campaignId) return true; // No campaign assigned — always scan
        return activeCampaignIds.includes(kw.campaignId.toString()); // Only scan if campaign is active
      });

      console.log(`[Scan] User ${user._id}: ${eligibleKeywords.length}/${keywords.length} keywords eligible (campaign filter applied)`);

      for (const kw of eligibleKeywords) {
        await scanKeyword(kw, user._id);
        await new Promise(r => setTimeout(r, 1000)); // Rate limiting
      }
    }
    console.log('Scheduled Reddit scan complete');
  } catch (err) {
    console.error('Scheduled scan error:', err.message);
  }
}
