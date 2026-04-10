import axios from 'axios';

const REDDIT_API_URL = 'https://oauth.reddit.com';
const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';

function getBasicAuth() {
  const id     = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  return Buffer.from(`${id}:${secret}`).toString('base64');
}

async function refreshToken(user) {
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
  // Lazy-import to avoid circular deps
  const User = (await import('../models/User.js')).default;
  await User.findByIdAndUpdate(user._id, { 'redditAuth.accessToken': newToken });
  return newToken;
}

async function fetchInbox(token) {
  const res = await axios.get(`${REDDIT_API_URL}/message/inbox`, {
    params: { limit: 100, mark: false },
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'LeadRadar/1.0' },
    timeout: 10000,
  });
  return res.data?.data?.children?.map(c => c.data) || [];
}

// Check Reddit inbox for replies to our DMs and update Conversation records
export async function checkConversationsForUser(user) {
  if (!user.redditAuth?.connected || !user.redditAuth?.accessToken) return;

  const Conversation = (await import('../models/Conversation.js')).default;

  // Only check conversations that are in 'sent' state (not yet replied / closed)
  const openConvs = await Conversation.find({ userId: user._id, status: 'sent' });
  if (!openConvs.length) return;

  let messages;
  try {
    let token = user.redditAuth.accessToken;
    try {
      messages = await fetchInbox(token);
    } catch (err) {
      if (err.response?.status === 401) {
        token = await refreshToken(user);
        messages = await fetchInbox(token);
      } else throw err;
    }
  } catch (err) {
    console.error(`[Conversations] Inbox fetch failed for user ${user._id}:`, err.message);
    return;
  }

  const now = new Date();

  for (const conv of openConvs) {
    // Match inbox messages: author == conv.redditUsername AND subject roughly matches
    const relevantMsgs = messages.filter(m =>
      m.author?.toLowerCase() === conv.redditUsername.toLowerCase() &&
      m.subject?.toLowerCase().includes(conv.subject.toLowerCase().slice(0, 20)) &&
      m.dest?.toLowerCase() === user.redditAuth.username?.toLowerCase()
    );

    if (!relevantMsgs.length) {
      // Mark no_reply if message is older than 72 hours
      const ageHours = (now - new Date(conv.sentAt)) / 3600000;
      if (ageHours > 72) {
        await Conversation.findByIdAndUpdate(conv._id, { status: 'no_reply', lastCheckedAt: now });
      } else {
        await Conversation.findByIdAndUpdate(conv._id, { lastCheckedAt: now });
      }
      continue;
    }

    // Build reply entries (avoid duplicates by redditMessageId)
    const existingIds = new Set(conv.replies.map(r => r.redditMessageId));
    const newReplies = [];

    for (const msg of relevantMsgs) {
      if (!existingIds.has(msg.id)) {
        newReplies.push({
          body:            msg.body || '',
          author:          msg.author,
          redditMessageId: msg.id,
          receivedAt:      msg.created_utc ? new Date(msg.created_utc * 1000) : now,
        });
      }
    }

    if (newReplies.length > 0) {
      // Calculate response time from sentAt to earliest new reply
      const earliest = newReplies.reduce((a, b) =>
        new Date(a.receivedAt) < new Date(b.receivedAt) ? a : b
      );
      const responseTimeMs = conv.replies.length === 0
        ? new Date(earliest.receivedAt) - new Date(conv.sentAt)
        : conv.responseTimeMs;

      await Conversation.findByIdAndUpdate(conv._id, {
        $push:  { replies: { $each: newReplies } },
        status: 'replied',
        responseTimeMs,
        lastCheckedAt: now,
      });

      console.log(`[Conversations] ${newReplies.length} new reply(ies) for conv ${conv._id} from u/${conv.redditUsername}`);
    } else {
      await Conversation.findByIdAndUpdate(conv._id, { lastCheckedAt: now });
    }
  }
}

// Called by scheduler — checks all users with connected Reddit
export async function checkAllUsersConversations() {
  try {
    const User = (await import('../models/User.js')).default;
    const users = await User.find({ 'redditAuth.connected': true });
    for (const user of users) {
      await checkConversationsForUser(user).catch(err =>
        console.error(`[Conversations] Error for user ${user._id}:`, err.message)
      );
      // Small delay to respect Reddit rate limits
      await new Promise(r => setTimeout(r, 1000));
    }
    console.log(`[Conversations] Inbox check complete for ${users.length} user(s)`);
  } catch (err) {
    console.error('[Conversations] checkAllUsers error:', err.message);
  }
}
