import axios from 'axios';
import Lead from '../models/Lead.js';
import Keyword from '../models/Keyword.js';
import { checkAndSendAlerts } from './alertService.js';

const INTENT_SIGNALS = [
  'looking for', 'recommend', 'recommendations', 'best', 'should i', 'which one',
  'anyone use', 'help me', 'need help', 'need a', 'want to', 'want a',
  'buying', 'buy', 'purchase', 'worth it', 'alternative', 'alternatives',
  'vs ', 'versus', 'comparison', 'compare', 'review', 'reviews',
  'tried', 'trying', 'anyone tried', 'suggestions', 'suggest',
  'how to', 'looking to', 'thinking about', 'considering',
];

const POSITIVE_WORDS = ['love', 'great', 'amazing', 'excellent', 'good', 'best', 'awesome', 'perfect', 'happy', 'recommend'];
const NEGATIVE_WORDS = ['hate', 'terrible', 'awful', 'bad', 'worst', 'horrible', 'disappointed', 'broken', 'useless', 'scam'];

function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach(w => { if (lower.includes(w)) score++; });
  NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) score--; });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

function detectIntentSignals(text) {
  const lower = text.toLowerCase();
  return INTENT_SIGNALS.filter(signal => lower.includes(signal));
}

function calculateIntentScore(post, detectedSignals) {
  let score = 0;

  // Signals weight (up to 40 points)
  score += Math.min(detectedSignals.length * 10, 40);

  // Engagement score (up to 30 points)
  const engagementScore = Math.log1p(post.ups + post.num_comments * 2) * 3;
  score += Math.min(engagementScore, 30);

  // Recency (up to 20 points) - posts within 24h get max
  const hoursOld = (Date.now() / 1000 - post.created_utc) / 3600;
  if (hoursOld < 2) score += 20;
  else if (hoursOld < 6) score += 15;
  else if (hoursOld < 12) score += 10;
  else if (hoursOld < 24) score += 5;

  // Question posts get bonus (up to 10 points)
  if (post.title.includes('?') || post.title.toLowerCase().startsWith('how') ||
      post.title.toLowerCase().startsWith('what') || post.title.toLowerCase().startsWith('which')) {
    score += 10;
  }

  return Math.min(Math.round(score), 100);
}

async function fetchRedditPosts(query, subreddits = []) {
  const headers = {
    'User-Agent': 'LeadRadar/1.0 (by /u/leadradar)',
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
      const detectedSignals = detectIntentSignals(text);
      const intentScore = calculateIntentScore(post, detectedSignals);
      const sentiment = analyzeSentiment(text);

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
      const keywords = await Keyword.find({ userId: user._id, isActive: true });
      for (const kw of keywords) {
        await scanKeyword(kw, user._id);
        await new Promise(r => setTimeout(r, 1000)); // Rate limiting
      }
    }
    console.log('Scheduled Reddit scan complete');
  } catch (err) {
    console.error('Scheduled scan error:', err.message);
  }
}
