import { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle, RefreshCw, Send, Clock, CheckCircle2, XCircle,
  Inbox, ChevronDown, ChevronUp, ExternalLink, Trash2, X, Activity,
  TrendingUp, Users, Timer,
} from 'lucide-react';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

const STATUS_TABS = [
  { value: 'all',      label: 'All',       color: null },
  { value: 'sent',     label: 'Awaiting',  color: '#f97316' },
  { value: 'replied',  label: 'Replied',   color: '#10b981' },
  { value: 'no_reply', label: 'No Reply',  color: '#ef4444' },
  { value: 'closed',   label: 'Closed',    color: '#475569' },
];

function StatusBadge({ status }) {
  const map = {
    sent:     { label: 'Awaiting Reply', color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)' },
    replied:  { label: 'Replied',        color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
    no_reply: { label: 'No Reply',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)' },
    closed:   { label: 'Closed',         color: '#475569', bg: 'rgba(71,85,105,0.15)',  border: 'rgba(71,85,105,0.3)'  },
  };
  const s = map[status] || map.sent;
  return (
    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + '18' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{label}</p>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: '#334155' }}>{sub}</p>}
      </div>
    </div>
  );
}

function ConversationCard({ conv, onClose, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-5 transition-all hover:border-slate-600">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
          {conv.redditUsername?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-white text-sm">u/{conv.redditUsername}</span>
            <StatusBadge status={conv.status} />
            {conv.leadSubreddit && (
              <span className="text-xs" style={{ color: '#a855f7' }}>r/{conv.leadSubreddit}</span>
            )}
            <span className="text-xs ml-auto" style={{ color: '#334155' }}>
              {formatDistanceToNow(new Date(conv.sentAt || conv.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Subject */}
          <p className="text-sm font-medium text-white mb-1 truncate">{conv.subject}</p>

          {/* Lead context */}
          {conv.leadTitle && (
            <p className="text-xs mb-2 truncate" style={{ color: '#475569' }}>
              Re: {conv.leadTitle}
            </p>
          )}

          {/* Our message preview */}
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: '#64748b' }}>
            {conv.ourMessage}
          </p>

          {/* Reply preview */}
          {conv.replies?.length > 0 && (
            <div className="mb-3 p-3 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={12} style={{ color: '#10b981' }} />
                <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
                  {conv.replies.length} reply{conv.replies.length > 1 ? 's' : ''} received
                </span>
                {conv.responseTimeMs && (
                  <span className="text-xs ml-auto" style={{ color: '#334155' }}>
                    responded in {conv.responseTimeMs < 3600000
                      ? `${Math.round(conv.responseTimeMs / 60000)}m`
                      : `${Math.round(conv.responseTimeMs / 3600000)}h`}
                  </span>
                )}
              </div>
              <p className="text-xs line-clamp-2" style={{ color: '#94a3b8' }}>
                {conv.replies[conv.replies.length - 1].body}
              </p>
            </div>
          )}

          {/* Expand thread */}
          {(conv.replies?.length > 0 || conv.ourMessage) && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-xs transition-colors mb-3"
              style={{ color: '#334155' }}
              onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseLeave={e => e.currentTarget.style.color = '#334155'}>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Hide thread' : 'View full thread'}
            </button>
          )}

          {/* Expanded thread */}
          {expanded && (
            <div className="space-y-3 mb-3 pl-3 border-l-2" style={{ borderColor: '#1a1a2e' }}>
              {/* Our message */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-semibold" style={{ color: '#a855f7' }}>You (sent)</span>
                  <span className="text-[11px]" style={{ color: '#242440' }}>
                    {formatDistanceToNow(new Date(conv.sentAt || conv.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed p-3 rounded-lg" style={{ background: '#0d0d1a', color: '#94a3b8' }}>
                  {conv.ourMessage}
                </p>
              </div>
              {/* Replies */}
              {conv.replies?.map((r, i) => (
                <div key={i}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-semibold" style={{ color: '#10b981' }}>
                      u/{r.author || conv.redditUsername}
                    </span>
                    <span className="text-[11px]" style={{ color: '#242440' }}>
                      {r.receivedAt ? formatDistanceToNow(new Date(r.receivedAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed p-3 rounded-lg"
                    style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', color: '#94a3b8' }}>
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {conv.leadPermalink && (
              <a href={conv.leadPermalink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: '#334155' }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#334155'}>
                <ExternalLink size={11} /> View post
              </a>
            )}
            <div className="flex-1" />
            {conv.status !== 'closed' && (
              <button onClick={() => onClose(conv._id)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{ color: '#475569', border: '1px solid #1a1a2e' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#242440'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#1a1a2e'; }}>
                <X size={11} /> Close
              </button>
            )}
            <button onClick={() => onDelete(conv._id)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: '#334155' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = 'transparent'; }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [convRes, statsRes] = await Promise.all([
        api.get('/conversations', { params: { status: statusFilter, limit: 20 } }),
        api.get('/conversations/stats'),
      ]);
      setConversations(convRes.data.conversations);
      setPagination(convRes.data.pagination);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.post('/conversations/refresh');
      showMsg('success', res.data.message);
      await fetchAll();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to refresh. Make sure Reddit is connected.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleClose = async (id) => {
    try {
      await api.patch(`/conversations/${id}/close`);
      setConversations(prev => prev.map(c => c._id === id ? { ...c, status: 'closed' } : c));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await api.delete(`/conversations/${id}`);
      setConversations(prev => prev.filter(c => c._id !== id));
      setStats(s => s ? { ...s, total: s.total - 1 } : s);
    } catch { /* ignore */ }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Conversations</h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            Track DMs you sent, monitor replies, measure performance · updated hourly
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="btn-primary flex items-center gap-2 text-sm">
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Checking...' : 'Check Inbox'}
        </button>
      </div>

      {/* Message banner */}
      {msg.text && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl text-sm"
          style={msg.type === 'success'
            ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }
            : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          {msg.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {msg.text}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Send}        label="DMs Sent"       value={stats.total}         color="#a855f7" />
          <StatCard icon={TrendingUp}  label="Reply Rate"     value={stats.replyRate != null ? `${stats.replyRate}%` : '—'} color="#10b981" />
          <StatCard icon={Timer}       label="Avg Response"   value={stats.avgResponseTime || '—'} color="#f97316"
            sub={stats.avgResponseTime ? 'to first reply' : 'no replies yet'} />
          <StatCard icon={XCircle}     label="No Reply"       value={stats.noReply}        color="#ef4444" />
        </div>
      )}

      {/* How it works (if no conversations yet) */}
      {!loading && conversations.length === 0 && statusFilter === 'all' && (
        <div className="card p-8 text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(168,85,247,0.2)' }}>
            <MessageCircle size={26} style={{ color: '#a855f7' }} />
          </div>
          <h3 className="font-semibold text-white mb-2">No conversations yet</h3>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#475569' }}>
            Send a DM from any lead using the <strong style={{ color: '#f97316' }}>Reply → Send PM</strong> button. Every DM is automatically tracked here.
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {[
              { icon: Send,        label: '1. Send PM',          desc: 'Use Reply modal on any lead',       color: '#a855f7' },
              { icon: Inbox,       label: '2. Auto-tracked',     desc: 'Conversation appears here',         color: '#f97316' },
              { icon: Activity,    label: '3. Monitor replies',  desc: 'Inbox checked every hour',          color: '#10b981' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="p-4 rounded-xl text-center" style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: color + '18' }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <p className="text-xs font-semibold text-white mb-0.5">{label}</p>
                <p className="text-[11px]" style={{ color: '#334155' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      {(conversations.length > 0 || statusFilter !== 'all') && (
        <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: '#12121f', border: '1px solid #1a1a2e' }}>
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={statusFilter === tab.value
                ? { background: tab.color || '#a855f7', color: 'white' }
                : { color: '#475569' }}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Conversation list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
        </div>
      ) : conversations.length === 0 ? (
        <div className="card p-12 text-center">
          <Inbox size={28} className="mx-auto mb-3" style={{ color: '#242440' }} />
          <p className="text-sm" style={{ color: '#475569' }}>No conversations with this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: '#334155' }}>
            {pagination.total} conversation{pagination.total !== 1 ? 's' : ''}
          </p>
          {conversations.map(conv => (
            <ConversationCard
              key={conv._id}
              conv={conv}
              onClose={handleClose}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Last checked note */}
      <p className="text-xs text-center mt-6" style={{ color: '#1e293b' }}>
        Inbox auto-checked every hour · Click <strong style={{ color: '#334155' }}>Check Inbox</strong> to refresh now
      </p>
    </div>
  );
}
