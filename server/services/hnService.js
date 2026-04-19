import axios from 'axios';
import Lead from '../models/Lead.js';
import Keyword from '../models/Keyword.js';
import Campaign from '../models/Campaign.js';
import { analyzeSentiment, detectIntentSignals, isNoise } from './redditService.js';
import { checkAndSendAlerts } from './alertService.js';

const HN_BASE = 'https://hn.algolia.com/api/v1/search';

// ── Strip HTML tags from HN content (HN returns HTML in story_text/comment_text) ─
function stripHtml(str = '') {
  return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Validity check for HN hits ─────────────────────────────────────────────
function isValidHNHit(hit, type) {
  // Must have an author
  if (!hit.author || hit.author === 'null') return false;

  // Skip job postings
  if (hit._tags?.includes('job')) return false;

  if (type === 'story') {
    if (!hit.title) return false;
    // Skip stories with no upvotes at all (likely brand new spam)
    if ((hit.points || 0) < 1) return false;
  } else {
    // Comments must have actual text (> 30 chars after stripping HTML)
    const text = stripHtml(hit.comment_text || '');
    if (text.length < 30) return false;
  }

  return true;
}

// ── Intent score for HN posts ──────────────────────────────────────────────
function calculateHNScore(hit, type, detectedSignals, keywordLower) {
  let score = 0;

  const title = type === 'story'
    ? (hit.title || '')
    : `Comment on: ${hit.story_title || 'HN thread'}`;
  const body = type === 'story'
    ? stripHtml(hit.story_text || '')
    : stripHtml(hit.comment_text || '');

  const titleLower = title.toLowerCase();
  const fullText = `${title} ${body}`.toLowerCase();

  // Keyword presence (up to 20 points)
  if (titleLower.includes(keywordLower)) score += 20;
  else if (fullText.includes(keywordLower)) score += 10;

  // Intent signals (up to 35 points)
  score += Math.min(detectedSignals.length * 8, 35);

  // Engagement (up to 20 points)
  const points = hit.points || 0;
  const comments = hit.num_comments || 0;
  score += Math.min(Math.log1p(points + comments * 2) * 2.5, 20);

  // Recency (up to 15 points)
  const hoursOld = (Date.now() / 1000 - (hit.created_at_i || 0)) / 3600;
  if (hoursOld < 2) score += 15;
  else if (hoursOld < 6) score += 10;
  else if (hoursOld < 12) score += 7;
  else if (hoursOld < 24) score += 3;

  // Ask HN bonus — person is explicitly seeking help/recommendations
  if (hit._tags?.includes('ask_hn') || titleLower.startsWith('ask hn:')) score += 10;

  // Question or request in title
  if (title.includes('?') || /^(how|what|which|where|any|looking|need|recommend|best|help)/i.test(title)) {
    score += 5;
  }

  return Math.min(Math.round(score), 100);
}

// ── Fetch HN posts (stories + comments) for a keyword ─────────────────────
export async function fetchHNPosts(query) {
  const weekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 3600;
  const results = [];

  try {
    const [storyRes, commentRes] = await Promise.all([
      axios.get(HN_BASE, {
        params: { query, tags: 'story', hitsPerPage: 20, numericFilters: `created_at_i>${weekAgo}` },
        timeout: 10000,
      }),
      axios.get(HN_BASE, {
        params: { query, tags: 'comment', hitsPerPage: 20, numericFilters: `created_at_i>${weekAgo}` },
        timeout: 10000,
      }),
    ]);

    if (storyRes.data?.hits) {
      results.push(...storyRes.data.hits.map(h => ({ ...h, _type: 'story' })));
    }
    if (commentRes.data?.hits) {
      results.push(...commentRes.data.hits.map(h => ({ ...h, _type: 'comment' })));
    }
  } catch (err) {
    console.error(`HN API error for "${query}":`, err.message);
  }

  return results;
}

// ── Scan a single keyword on HN ────────────────────────────────────────────
export async function scanKeywordHN(keyword, userId) {
  try {
    const hits = await fetchHNPosts(keyword.keyword);
    let newCount = 0;
    const newLeadIds = [];

    for (const hit of hits) {
      const type = hit._type;
      const hnId = String(hit.objectID);

      // Skip if already stored
      const exists = await Lead.findOne({ userId, redditId: hnId, source: 'hackernews' });
      if (exists) continue;

      // Validity gate
      if (!isValidHNHit(hit, type)) continue;

      const title = type === 'story'
        ? (hit.title || '')
        : `Comment on: ${hit.story_title || 'HN thread'}`;
      const body = type === 'story'
        ? stripHtml(hit.story_text || '').slice(0, 2000)
        : stripHtml(hit.comment_text || '').slice(0, 2000);
      const text = `${title} ${body}`;

      // Noise gate
      if (isNoise(text)) continue;

      const keywordLower = keyword.keyword.toLowerCase();
      const titleLower = title.toLowerCase();
      const textLower = text.toLowerCase();
      const keywordWords = keywordLower.split(' ').filter(w => w.length > 3);

      const detectedSignals = detectIntentSignals(text);
      const intentScore = calculateHNScore(hit, type, detectedSignals, keywordLower);
      const sentiment = analyzeSentiment(text);

      // Relevance gate — keyword must appear in title or full text
      const titlePhraseMatch = titleLower.includes(keywordLower);
      const bodyPhraseMatch = textLower.includes(keywordLower);
      const meaningfulWords = keywordWords.filter(w => w.length > 3);
      const titleWordMatch = meaningfulWords.length >= 2 &&
        meaningfulWords.every(w => titleLower.includes(w));

      const isRelevant = titlePhraseMatch || bodyPhraseMatch || titleWordMatch;
      if (!isRelevant) continue;

      // Quality gate
      if (detectedSignals.length < 2 || intentScore < 40) continue;

      // Build permalink
      const permalink = type === 'story'
        ? `https://news.ycombinator.com/item?id=${hnId}`
        : `https://news.ycombinator.com/item?id=${hit.story_id}#${hnId}`;

      // Community label for display (reuse subreddit field)
      const community = hit._tags?.includes('ask_hn') ? 'ask_hn'
        : hit._tags?.includes('show_hn') ? 'show_hn'
        : 'hackernews';

      const lead = await Lead.create({
        userId,
        keywordId: keyword._id,
        keywordText: keyword.keyword,
        keywordType: keyword.type || 'own',
        redditId: hnId,          // reused as generic sourcePostId
        source: 'hackernews',
        title,
        body,
        url: permalink,
        permalink,
        subreddit: community,    // ask_hn / show_hn / hackernews
        author: hit.author,
        upvotes: hit.points || 0,
        numComments: hit.num_comments || 0,
        redditCreatedAt: new Date((hit.created_at_i || 0) * 1000),
        intentScore,
        sentiment,
        intentSignals: detectedSignals,
        postType: type === 'comment' ? 'comment' : 'discussion',
        hasBody: body.trim().length > 75,
      });

      newLeadIds.push(lead._id);
      newCount++;
    }

    await Keyword.findByIdAndUpdate(keyword._id, {
      $inc: { totalLeads: newCount },
    });

    if (newLeadIds.length > 0) {
      checkAndSendAlerts(userId, newLeadIds).catch(() => {});
    }

    return newCount;
  } catch (err) {
    console.error(`HN scan error for "${keyword.keyword}":`, err.message);
    return 0;
  }
}

// ── Scan all users' keywords on HN ─────────────────────────────────────────
export async function scanAllUsersHN() {
  try {
    const User = (await import('../models/User.js')).default;
    const users = await User.find({});

    for (const user of users) {
      const activeCampaigns = await Campaign.find({ userId: user._id, status: 'active' }).select('_id');
      const activeCampaignIds = activeCampaigns.map(c => c._id.toString());

      const keywords = await Keyword.find({ userId: user._id, isActive: true });
      const eligibleKeywords = keywords.filter(kw => {
        if (!kw.campaignId) return true;
        return activeCampaignIds.includes(kw.campaignId.toString());
      });

      console.log(`[HN Scan] User ${user._id}: ${eligibleKeywords.length} keywords`);

      for (const kw of eligibleKeywords) {
        await scanKeywordHN(kw, user._id);
        await new Promise(r => setTimeout(r, 500)); // be gentle with HN API
      }
    }
    console.log('[HN Scan] Complete');
  } catch (err) {
    console.error('[HN Scan] Error:', err.message);
  }
}
