import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/authorize';
const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const REDDIT_API_URL = 'https://oauth.reddit.com';
const SCOPES = 'identity submit privatemessages';

function getRedirectUri() {
  return `${process.env.SERVER_URL || 'http://localhost:3000'}/api/reddit/callback`;
}

function getBasicAuth() {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  return Buffer.from(`${id}:${secret}`).toString('base64');
}

async function refreshAccessToken(user) {
  const res = await axios.post(
    REDDIT_TOKEN_URL,
    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: user.redditAuth.refreshToken }),
    {
      headers: {
        Authorization: `Basic ${getBasicAuth()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LeadRadar/1.0',
      },
    }
  );
  const newToken = res.data.access_token;
  await User.findByIdAndUpdate(user._id, { 'redditAuth.accessToken': newToken });
  return newToken;
}

async function getValidToken(user) {
  // Try existing token first; refresh on 401 in caller
  return user.redditAuth.accessToken;
}

// GET /api/reddit/connect — redirect user to Reddit OAuth
router.get('/connect', auth, (req, res) => {
  const state = jwt.sign({ userId: req.user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '10m' });
  const params = new URLSearchParams({
    client_id: process.env.REDDIT_CLIENT_ID,
    response_type: 'code',
    state,
    redirect_uri: getRedirectUri(),
    duration: 'permanent',
    scope: SCOPES,
  });
  res.redirect(`${REDDIT_AUTH_URL}?${params}`);
});

// GET /api/reddit/callback — Reddit redirects here with code
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (error || !code || !state) {
    return res.redirect(`${clientUrl}/settings?reddit=error&msg=${error || 'missing_code'}`);
  }

  let userId;
  try {
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch {
    return res.redirect(`${clientUrl}/settings?reddit=error&msg=invalid_state`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await axios.post(
      REDDIT_TOKEN_URL,
      new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: getRedirectUri() }),
      {
        headers: {
          Authorization: `Basic ${getBasicAuth()}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'LeadRadar/1.0',
        },
      }
    );

    const { access_token, refresh_token } = tokenRes.data;

    // Get Reddit username
    const meRes = await axios.get(`${REDDIT_API_URL}/api/v1/me`, {
      headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'LeadRadar/1.0' },
    });

    await User.findByIdAndUpdate(userId, {
      'redditAuth.connected': true,
      'redditAuth.accessToken': access_token,
      'redditAuth.refreshToken': refresh_token,
      'redditAuth.username': meRes.data.name,
      'redditAuth.connectedAt': new Date(),
    });

    res.redirect(`${clientUrl}/settings?reddit=connected&username=${meRes.data.name}`);
  } catch (err) {
    console.error('Reddit OAuth error:', err.response?.data || err.message);
    res.redirect(`${clientUrl}/settings?reddit=error&msg=token_exchange_failed`);
  }
});

// DELETE /api/reddit/disconnect
router.delete('/disconnect', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      'redditAuth.connected': false,
      'redditAuth.accessToken': null,
      'redditAuth.refreshToken': null,
      'redditAuth.username': null,
    });
    res.json({ message: 'Reddit disconnected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reddit/status
router.get('/status', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    connected: user.redditAuth?.connected || false,
    username: user.redditAuth?.username || null,
    connectedAt: user.redditAuth?.connectedAt || null,
  });
});

// POST /api/reddit/comment — post a comment on a Reddit post
router.post('/comment', auth, async (req, res) => {
  const { thingId, text } = req.body; // thingId = t3_xxxxx (post fullname)
  if (!thingId || !text?.trim()) return res.status(400).json({ message: 'thingId and text are required' });

  const user = await User.findById(req.user._id);
  if (!user.redditAuth?.connected) return res.status(403).json({ message: 'Reddit not connected' });

  const post = async (token) => axios.post(
    `${REDDIT_API_URL}/api/comment`,
    new URLSearchParams({ api_type: 'json', thing_id: thingId, text }),
    { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'LeadRadar/1.0', 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  try {
    let token = await getValidToken(user);
    let response;
    try {
      response = await post(token);
    } catch (err) {
      if (err.response?.status === 401) {
        token = await refreshAccessToken(user);
        response = await post(token);
      } else throw err;
    }

    const data = response.data.json;
    if (data.errors?.length) {
      return res.status(400).json({ message: data.errors[0][1] || 'Reddit API error' });
    }

    const commentData = data.data?.things?.[0]?.data;
    res.json({ success: true, commentId: commentData?.id, permalink: commentData?.permalink });
  } catch (err) {
    console.error('Reddit comment error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || 'Failed to post comment' });
  }
});

// POST /api/reddit/message — send a private message
router.post('/message', auth, async (req, res) => {
  const { to, subject, text, leadId, leadTitle, leadSubreddit, leadPermalink } = req.body;
  if (!to || !subject?.trim() || !text?.trim()) return res.status(400).json({ message: 'to, subject, and text are required' });

  const user = await User.findById(req.user._id);
  if (!user.redditAuth?.connected) return res.status(403).json({ message: 'Reddit not connected' });

  const send = async (token) => axios.post(
    `${REDDIT_API_URL}/api/compose`,
    new URLSearchParams({ api_type: 'json', to, subject, text }),
    { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'LeadRadar/1.0', 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  try {
    let token = await getValidToken(user);
    let response;
    try {
      response = await send(token);
    } catch (err) {
      if (err.response?.status === 401) {
        token = await refreshAccessToken(user);
        response = await send(token);
      } else throw err;
    }

    const data = response.data.json;
    if (data.errors?.length) {
      return res.status(400).json({ message: data.errors[0][1] || 'Reddit API error' });
    }

    // Auto-create a Conversation record to track this DM thread
    let conversation = null;
    try {
      conversation = await Conversation.create({
        userId:        req.user._id,
        leadId:        leadId        || undefined,
        redditUsername: to,
        subject,
        ourMessage:    text,
        leadTitle:     leadTitle     || undefined,
        leadSubreddit: leadSubreddit || undefined,
        leadPermalink: leadPermalink || undefined,
      });
    } catch (convErr) {
      console.error('Conversation record creation failed:', convErr.message);
    }

    res.json({ success: true, conversationId: conversation?._id });
  } catch (err) {
    console.error('Reddit message error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || 'Failed to send message' });
  }
});

export default router;
