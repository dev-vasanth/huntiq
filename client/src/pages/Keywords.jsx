import { useState, useEffect, useRef } from 'react';
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight, X, AlertCircle, CheckCircle2, Megaphone, ChevronDown, Crosshair, Sparkles, Lock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const POPULAR_SUBREDDITS = [
  'entrepreneur', 'startups', 'SaaS', 'smallbusiness', 'marketing',
  'webdev', 'learnprogramming', 'digitalnomad', 'ecommerce', 'growmybusiness',
];

const DEFAULT_SIGNALS = [
  'looking for', 'recommend', 'best', 'alternative', 'should i buy',
  'anyone tried', 'help me find', 'review', 'worth it', 'comparison',
];

function CampaignDropdown({ keyword, campaigns, onAssign }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = campaigns.find(c => c._id === keyword.campaignId);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all"
        style={current
          ? { background: current.color + '18', color: current.color, border: `1px solid ${current.color}35` }
          : { background: '#1a1a2e', color: '#475569', border: '1px solid #242440' }}>
        <Megaphone size={10} />
        {current ? current.name : 'No Campaign'}
        <ChevronDown size={10} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 min-w-44 rounded-xl overflow-hidden shadow-xl"
          style={{ background: '#12121f', border: '1px solid #1a1a2e' }}>
          {/* Unassign option */}
          {current && (
            <button
              onClick={() => { onAssign(keyword._id, null); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-slate-700/40"
              style={{ color: '#64748b' }}>
              <X size={11} /> Remove from campaign
            </button>
          )}
          {campaigns.length === 0 && (
            <div className="px-3 py-3 text-xs" style={{ color: '#475569' }}>No campaigns yet</div>
          )}
          {campaigns.map(c => (
            <button
              key={c._id}
              onClick={() => { onAssign(keyword._id, c._id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-slate-700/40"
              style={{ color: c._id === keyword.campaignId ? c.color : '#cbd5e1' }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
              {c.name}
              {c._id === keyword.campaignId && <CheckCircle2 size={11} className="ml-auto" style={{ color: c.color }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function KeywordForm({ onAdd, campaigns }) {
  const { user } = useAuth();
  const isPro = user?.plan === 'pro';
  const [keyword, setKeyword] = useState('');
  const [subreddits, setSubreddits] = useState([]);
  const [subInput, setSubInput] = useState('');
  const [signals, setSignals] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [type, setType] = useState('own');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const addSub = () => {
    const s = subInput.trim().replace(/^r\//, '');
    if (s && !subreddits.includes(s)) setSubreddits(prev => [...prev, s]);
    setSubInput('');
  };

  const handleSuggest = async () => {
    if (!keyword.trim() || !isPro) return;
    setSuggesting(true);
    setAiSuggestions([]);
    try {
      const res = await api.post('/keywords/suggest-subreddits', { keyword: keyword.trim() });
      setAiSuggestions(res.data.subreddits || []);
    } catch (err) {
      console.error('Suggest failed', err);
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setError('');
    setLoading(true);
    try {
      await onAdd({ keyword: keyword.trim(), subreddits, intentSignals: signals, campaignId: campaignId || undefined, type });
      setKeyword('');
      setSubreddits([]);
      setSignals([]);
      setCampaignId('');
      setType('own');
      setExpanded(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add keyword');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 mb-6">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Plus size={16} className="text-violet-400" />
        Add Keyword to Monitor
      </h3>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="flex gap-3 mb-4">
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="input flex-1"
            placeholder='e.g. "CRM software" or "email marketing tool"'
            required
          />
          <button type="button" onClick={() => setExpanded(!expanded)} className="btn-secondary text-sm px-3">
            {expanded ? 'Less' : 'Advanced'}
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Plus size={15} />
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>

        {expanded && (
          <div className="space-y-4 pt-3 border-t border-slate-700">
            {/* Keyword type */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">
                Keyword Type
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'own', label: '🏷️ Own Brand', desc: 'Track mentions of your product/brand' },
                  { value: 'competitor', label: '🎯 Competitor', desc: 'Monitor a competitor\'s name/product' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className="flex-1 p-3 rounded-xl text-left transition-all"
                    style={type === opt.value
                      ? opt.value === 'competitor'
                        ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }
                        : { background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7' }
                      : { background: '#0d0d1a', border: '1px solid #1a1a2e', color: '#475569' }}>
                    <div className="text-xs font-semibold mb-0.5">{opt.label}</div>
                    <div className="text-xs opacity-70">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign assignment */}
            {campaigns.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">
                  Assign to Campaign <span className="text-slate-600">(optional)</span>
                </label>
                <select
                  value={campaignId}
                  onChange={e => setCampaignId(e.target.value)}
                  className="input text-sm">
                  <option value="">No Campaign</option>
                  {campaigns.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Subreddits */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-400">
                  Monitor specific subreddits <span className="text-slate-600">(leave empty for all of Reddit)</span>
                </label>
                {isPro ? (
                  <button
                    type="button"
                    onClick={handleSuggest}
                    disabled={suggesting || !keyword.trim()}
                    className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(249,115,22,0.15))', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7' }}>
                    <Sparkles size={11} className={suggesting ? 'animate-pulse' : ''} />
                    {suggesting ? 'Suggesting...' : 'AI Suggest'}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg cursor-not-allowed"
                    style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', color: '#475569' }}
                    title="Upgrade to Pro to use AI subreddit suggestions">
                    <Lock size={11} />
                    AI Suggest — Pro
                  </div>
                )}
              </div>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
                  <p className="text-xs mb-2 flex items-center gap-1" style={{ color: '#a855f7' }}>
                    <Sparkles size={11} /> AI suggested for "{keyword}"
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiSuggestions.map(s => (
                      <button key={s} type="button"
                        onClick={() => !subreddits.includes(s) && setSubreddits(p => [...p, s])}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${subreddits.includes(s) ? 'bg-violet-500/20 border-violet-500/30 text-violet-300' : 'border-violet-500/30 text-violet-400 hover:bg-violet-500/10'}`}
                        style={{ background: subreddits.includes(s) ? undefined : 'rgba(168,85,247,0.05)' }}>
                        {subreddits.includes(s) ? '✓ ' : '+ '}r/{s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">r/</span>
                  <input
                    value={subInput}
                    onChange={e => setSubInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } }}
                    className="input pl-7 text-sm"
                    placeholder="subredditname"
                  />
                </div>
                <button type="button" onClick={addSub} className="btn-secondary text-sm px-3">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {subreddits.map(s => (
                  <span key={s} className="flex items-center gap-1 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-1 text-xs">
                    r/{s}
                    <button type="button" onClick={() => setSubreddits(p => p.filter(x => x !== s))}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {POPULAR_SUBREDDITS.filter(s => !aiSuggestions.includes(s)).map(s => (
                  <button key={s} type="button"
                    onClick={() => !subreddits.includes(s) && setSubreddits(p => [...p, s])}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-all ${subreddits.includes(s) ? 'bg-violet-500/20 border-violet-500/30 text-violet-300' : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Intent signals */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Intent signals to boost score</label>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SIGNALS.map(s => (
                  <button key={s} type="button"
                    onClick={() => setSignals(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${signals.includes(s) ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default function Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [kwRes, campRes] = await Promise.all([
        api.get('/keywords'),
        api.get('/campaigns'),
      ]);
      setKeywords(kwRes.data.keywords);
      setCampaigns(campRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (data) => {
    const res = await api.post('/keywords', data);
    setKeywords(prev => [res.data.keyword, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this keyword and all its leads?')) return;
    await api.delete(`/keywords/${id}`);
    setKeywords(prev => prev.filter(k => k._id !== id));
  };

  const handleToggle = async (id) => {
    const res = await api.patch(`/keywords/${id}/toggle`);
    setKeywords(prev => prev.map(k => k._id === id ? res.data.keyword : k));
  };

  const handleTypeToggle = async (kw) => {
    const newType = kw.type === 'competitor' ? 'own' : 'competitor';
    try {
      const res = await api.put(`/keywords/${kw._id}`, { type: newType });
      setKeywords(prev => prev.map(k => k._id === kw._id ? res.data.keyword : k));
    } catch (err) {
      console.error('Failed to update keyword type', err);
    }
  };

  const handleAssignCampaign = async (keywordId, campaignId) => {
    try {
      if (campaignId) {
        // Find which campaign this keyword currently belongs to (if any) and unassign first
        const kw = keywords.find(k => k._id === keywordId);
        if (kw?.campaignId && kw.campaignId !== campaignId) {
          await api.delete(`/campaigns/${kw.campaignId}/keywords/${keywordId}`);
        }
        await api.post(`/campaigns/${campaignId}/keywords/${keywordId}`);
        setKeywords(prev => prev.map(k => k._id === keywordId ? { ...k, campaignId } : k));
      } else {
        const kw = keywords.find(k => k._id === keywordId);
        if (kw?.campaignId) {
          await api.delete(`/campaigns/${kw.campaignId}/keywords/${keywordId}`);
          setKeywords(prev => prev.map(k => k._id === keywordId ? { ...k, campaignId: null } : k));
        }
      }
    } catch (err) {
      console.error('Failed to update campaign assignment', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Keywords</h1>
        <p className="text-slate-400 text-sm mt-1">Track keywords across Reddit to find high-intent leads</p>
      </div>

      <KeywordForm onAdd={handleAdd} campaigns={campaigns} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : keywords.length === 0 ? (
        <div className="card p-16 text-center">
          <Tag size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="font-medium text-white mb-1">No keywords yet</p>
          <p className="text-sm text-slate-400">Add your first keyword above to start monitoring Reddit.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">{keywords.length} keyword{keywords.length !== 1 ? 's' : ''} monitored</p>
          {keywords.map(kw => (
            <div key={kw._id} className="card p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-white">"{kw.keyword}"</span>
                    <span className={`badge ${kw.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-700/50 text-slate-500 border-slate-600'}`}>
                      {kw.isActive ? 'Active' : 'Paused'}
                    </span>
                    {/* Competitor / Own type toggle */}
                    <button
                      onClick={() => handleTypeToggle(kw)}
                      title={kw.type === 'competitor' ? 'Competitor keyword — click to set as own brand' : 'Own keyword — click to track as competitor'}
                      className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border transition-all"
                      style={kw.type === 'competitor'
                        ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }
                        : { background: 'rgba(100,116,139,0.1)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }}>
                      <Crosshair size={10} />
                      {kw.type === 'competitor' ? 'Competitor' : 'Own'}
                    </button>
                    <CampaignDropdown keyword={kw} campaigns={campaigns} onAssign={handleAssignCampaign} />
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-violet-400" />
                      {kw.totalLeads || 0} leads found
                    </span>
                    {kw.lastScanned && (
                      <span>Last scanned {formatDistanceToNow(new Date(kw.lastScanned), { addSuffix: true })}</span>
                    )}
                  </div>

                  {kw.subreddits?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {kw.subreddits.map(s => (
                        <span key={s} className="text-xs bg-slate-700/50 border border-slate-600 text-slate-400 px-2 py-0.5 rounded-full">
                          r/{s}
                        </span>
                      ))}
                    </div>
                  )}

                  {kw.intentSignals?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {kw.intentSignals.slice(0, 5).map(s => (
                        <span key={s} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400/70 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleToggle(kw._id)} className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all">
                    {kw.isActive ? <ToggleRight size={20} className="text-violet-400" /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => handleDelete(kw._id)} className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
