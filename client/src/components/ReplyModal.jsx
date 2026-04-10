import { useState, useEffect } from 'react';
import { X, Sparkles, Send, Copy, Check, Loader2, ExternalLink, MessageSquare, Mail } from 'lucide-react';
import api from '../utils/api';

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'direct', label: 'Direct' },
];

export default function ReplyModal({ lead, onClose, onReplied }) {
  const [tab, setTab] = useState('ai'); // 'ai' | 'manual'
  const [tone, setTone] = useState('professional');
  const [context, setContext] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [aiContent, setAiContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [redditConnected, setRedditConnected] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [sendingPm, setSendingPm] = useState(false);
  const [redditSuccess, setRedditSuccess] = useState('');

  useEffect(() => {
    api.get('/reddit/status')
      .then(res => setRedditConnected(res.data.connected))
      .catch(() => {});
  }, []);

  const generateAI = async () => {
    setError('');
    setGenerating(true);
    try {
      const res = await api.post('/replies/generate', { leadId: lead._id, tone, context });
      setAiContent(res.data.reply.content);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate reply. Check your API key.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    const content = tab === 'ai' ? aiContent : manualContent;
    if (!content.trim()) return;

    setSaving(true);
    try {
      let reply;
      if (tab === 'ai' && aiContent) {
        // Save and mark as sent
        const saveRes = await api.post('/replies/generate', { leadId: lead._id, tone, context });
        reply = saveRes.data.reply;
      } else {
        const saveRes = await api.post('/replies/manual', { leadId: lead._id, content, tone });
        reply = saveRes.data.reply;
      }
      await api.patch(`/replies/${reply._id}/sent`);
      onReplied();
      onClose();
    } catch (err) {
      setError('Failed to save reply.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    const content = tab === 'ai' ? aiContent : manualContent;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostComment = async () => {
    const content = tab === 'ai' ? aiContent : manualContent;
    if (!content.trim() || !lead.redditId) return;
    setError('');
    setRedditSuccess('');
    setPostingComment(true);
    try {
      await api.post('/reddit/comment', { thingId: `t3_${lead.redditId}`, text: content });
      setRedditSuccess('Comment posted to Reddit!');
      setTimeout(() => setRedditSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment to Reddit.');
    } finally {
      setPostingComment(false);
    }
  };

  const handleSendPm = async () => {
    const content = tab === 'ai' ? aiContent : manualContent;
    if (!content.trim() || !lead.author) return;
    setError('');
    setRedditSuccess('');
    setSendingPm(true);
    try {
      await api.post('/reddit/message', {
        to:            lead.author,
        subject:       `Re: ${lead.title}`.slice(0, 100),
        text:          content,
        leadId:        lead._id,
        leadTitle:     lead.title,
        leadSubreddit: lead.subreddit,
        leadPermalink: lead.permalink,
      });
      setRedditSuccess(`PM sent to u/${lead.author}! Tracked in Conversations.`);
      setTimeout(() => setRedditSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send PM.');
    } finally {
      setSendingPm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div>
            <h2 className="font-semibold text-white">Draft Reply</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">{lead.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={lead.permalink} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-all">
              <ExternalLink size={15} />
            </a>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-all">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Lead context */}
        <div className="mx-5 mt-4 p-3 bg-slate-700/40 rounded-lg border border-slate-600/50 text-sm text-slate-400 line-clamp-3">
          {lead.body || lead.title}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mx-5 mt-4 p-1 bg-slate-700/50 rounded-lg">
          <button
            onClick={() => setTab('ai')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${tab === 'ai' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            <Sparkles size={14} />
            AI Draft
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === 'manual' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            Write Manually
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>
          )}

          {/* Tone selector */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">Tone</label>
            <div className="flex gap-2">
              {TONES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tone === t.value ? 'bg-violet-600/30 text-violet-300 border border-violet-500/50' : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'ai' ? (
            <>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">
                  Your product/service context <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  className="input text-sm"
                  placeholder="e.g. I run a CRM for startups called Acme..."
                />
              </div>

              <button
                onClick={generateAI}
                disabled={generating}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {generating ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : <><Sparkles size={15} /> Generate Reply</>}
              </button>

              {aiContent && (
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">Generated Reply</label>
                  <textarea
                    value={aiContent}
                    onChange={e => setAiContent(e.target.value)}
                    rows={6}
                    className="input text-sm resize-none leading-relaxed"
                  />
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Your Reply</label>
              <textarea
                value={manualContent}
                onChange={e => setManualContent(e.target.value)}
                rows={8}
                className="input text-sm resize-none leading-relaxed"
                placeholder="Write your reply here..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-700 space-y-3">
          {redditSuccess && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-emerald-400 text-sm">
              <Check size={14} /> {redditSuccess}
            </div>
          )}
          {redditConnected && (aiContent || manualContent) && (
            <div className="flex gap-2">
              <button
                onClick={handlePostComment}
                disabled={postingComment || !lead.redditId}
                title={!lead.redditId ? 'No Reddit post ID available' : ''}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-orange-500/10 border border-orange-500/30 text-orange-300 hover:bg-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {postingComment ? <Loader2 size={13} className="animate-spin" /> : <MessageSquare size={13} />}
                Post Comment
              </button>
              <button
                onClick={handleSendPm}
                disabled={sendingPm || !lead.author}
                title={!lead.author ? 'No author available' : `Send PM to u/${lead.author}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {sendingPm ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                Send PM{lead.author ? ` to u/${lead.author}` : ''}
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <div className="flex-1" />
            {(aiContent || manualContent) && (
              <button onClick={handleCopy} className="btn-ghost flex items-center gap-1.5 text-sm">
                {copied ? <><Check size={14} className="text-emerald-400" /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={saving || (!aiContent && !manualContent)}
              className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Mark as Replied
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
