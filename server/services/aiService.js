import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TONE_PROMPTS = {
  professional: 'Write in a professional, authoritative tone. Be concise and value-driven.',
  friendly: 'Write in a warm, friendly and approachable tone. Be personable and genuine.',
  casual: 'Write in a casual, conversational tone as if talking to a peer.',
  direct: 'Write in a direct, straight-to-the-point tone. No fluff, just value.',
};

export async function generateReply({ lead, tone = 'professional', context = '' }) {
  const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.professional;

  const systemPrompt = `You are an expert at crafting Reddit replies that provide genuine value and naturally introduce relevant products or services.
Your replies should:
1. Directly address the person's problem or question
2. Provide real, helpful information first
3. Naturally mention a solution or service if relevant (not spammy)
4. Sound human and authentic, not like a bot
5. Be appropriately concise for Reddit (typically 3-6 sentences)
6. Never start with "I" or seem overly promotional

${toneInstruction}`;

  const userPrompt = `Reddit post details:
Subreddit: r/${lead.subreddit}
Title: ${lead.title}
Post content: ${lead.body || '(no body text)'}
Intent signals detected: ${lead.intentSignals?.join(', ') || 'none'}
${context ? `Additional context about my product/service: ${context}` : ''}

Write a helpful Reddit reply that provides value and would naturally resonate with someone posting this. The reply should feel authentic and not salesy.`;

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    thinking: { type: 'adaptive' },
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const response = await stream.finalMessage();

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.text || 'Unable to generate reply. Please try again.';
}

export async function analyzeLeadBatch(leads) {
  if (!leads.length) return [];

  const prompt = `Analyze these Reddit posts and score their purchase/solution intent from 0-100.
Return ONLY a JSON array with objects: {"id": "post_id", "score": number, "signals": ["signal1", "signal2"]}

Posts:
${leads.map(l => `ID: ${l.id}\nTitle: ${l.title}\nBody: ${l.body?.slice(0, 200) || ''}`).join('\n---\n')}`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find(b => b.type === 'text')?.text || '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (err) {
    console.error('AI analysis error:', err.message);
    return [];
  }
}

export async function generateDigestSummary(leads) {
  if (!leads.length) return 'No new leads found today.';

  const prompt = `Summarize these ${leads.length} Reddit leads in 2-3 sentences. Focus on the most promising opportunities and patterns:

${leads.slice(0, 10).map(l => `- [Score: ${l.intentScore}] r/${l.subreddit}: "${l.title}"`).join('\n')}

Write a brief executive summary.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content.find(b => b.type === 'text')?.text || '';
  } catch (err) {
    return `Found ${leads.length} new leads today.`;
  }
}
