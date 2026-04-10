import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Pause, Play, Tag, TrendingUp, Inbox, X, Settings2, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const COLORS = ['#a855f7', '#f97316', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#6366f1', '#ef4444'];
const GOALS = [
  { value: 'leads', label: 'Lead Generation' },
  { value: 'sales', label: 'Sales Outreach' },
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'research', label: 'Market Research' },
  { value: 'other', label: 'Other' },
];

/* ─── Create Campaign Modal ─────────────────────────────────────────── */
function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '', goal: 'leads', color: '#a855f7' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Campaign name is required');
    setLoading(true);
    try {
      const res = await api.post('/campaigns', form);
      onCreate(res.data.campaign);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md card-gradient p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-4 transition-colors"
          style={{ color: '#334155' }} onMouseEnter={e => e.target.style.color = '#f1f5f9'}
          onMouseLeave={e => e.target.style.color = '#334155'}>
          <X size={18} />
        </button>
        <h2 className="text-xl font-bold text-white mb-6">New Campaign</h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Campaign Name *</label>
            <input className="input" placeholder="e.g. SaaS Founders Outreach" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Description</label>
            <textarea className="input resize-none" rows={2} placeholder="What's this campaign about?"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Goal</label>
            <select className="input" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}>
              {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ background: c, transform: form.color === c ? 'scale(1.25)' : 'scale(1)', boxShadow: form.color === c ? `0 0 10px ${c}80` : 'none' }} />
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : 'Create Campaign'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Manage Keywords Modal ─────────────────────────────────────────── */
function ManageKeywordsModal({ campaign, onClose, onUpdated }) {
  const [assigned, setAssigned] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(null); // keywordId being toggled

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allKwRes, campKwRes] = await Promise.all([
        api.get('/keywords'),
        api.get(`/campaigns/${campaign._id}/keywords`),
      ]);
      const campKws = campKwRes.data;
      const campIds = new Set(campKws.map(k => k._id));
      setAssigned(campKws);
      setAvailable(allKwRes.data.keywords.filter(k => !campIds.has(k._id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (kw) => {
    setWorking(kw._id);
    try {
      // If keyword already belongs to another campaign, unassign first
      if (kw.campaignId && kw.campaignId !== campaign._id) {
        await api.delete(`/campaigns/${kw.campaignId}/keywords/${kw._id}`);
      }
      await api.post(`/campaigns/${campaign._id}/keywords/${kw._id}`);
      setAssigned(prev => [...prev, { ...kw, campaignId: campaign._id }]);
      setAvailable(prev => prev.filter(k => k._id !== kw._id));
      onUpdated();
    } catch (err) { console.error(err); }
    finally { setWorking(null); }
  };

  const handleUnassign = async (kw) => {
    setWorking(kw._id);
    try {
      await api.delete(`/campaigns/${campaign._id}/keywords/${kw._id}`);
      setAvailable(prev => [...prev, { ...kw, campaignId: null }]);
      setAssigned(prev => prev.filter(k => k._id !== kw._id));
      onUpdated();
    } catch (err) { console.error(err); }
    finally { setWorking(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#12121f', border: '1px solid #1a1a2e', maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#1a1a2e' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: campaign.color + '20' }}>
              <Megaphone size={15} style={{ color: campaign.color }} />
            </div>
            <div>
              <h2 className="font-bold text-white">{campaign.name}</h2>
              <p className="text-xs" style={{ color: '#475569' }}>Manage keywords</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors"
            style={{ color: '#334155' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.color = '#334155'}>
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: campaign.color, borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              {/* Assigned keywords */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#334155' }}>
                  Assigned · {assigned.length}
                </h3>
                {assigned.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: '#334155' }}>
                    No keywords assigned yet. Add from below ↓
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assigned.map(kw => (
                      <div key={kw._id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={13} style={{ color: campaign.color }} />
                          <span className="text-sm text-white font-medium">"{kw.keyword}"</span>
                          <span className="text-xs" style={{ color: '#334155' }}>{kw.totalLeads || 0} leads</span>
                        </div>
                        <button
                          onClick={() => handleUnassign(kw)}
                          disabled={working === kw._id}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                          style={{ color: '#ef4444', opacity: working === kw._id ? 0.5 : 1 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          {working === kw._id ? <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: '#ef4444', borderTopColor: 'transparent' }} /> : <X size={12} />}
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available keywords */}
              {available.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#334155' }}>
                    Available to Add · {available.length}
                  </h3>
                  <div className="space-y-2">
                    {available.map(kw => (
                      <div key={kw._id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                        style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
                        <div className="flex items-center gap-2">
                          <Tag size={13} style={{ color: '#334155' }} />
                          <span className="text-sm" style={{ color: '#94a3b8' }}>"{kw.keyword}"</span>
                          <span className="text-xs" style={{ color: '#334155' }}>{kw.totalLeads || 0} leads</span>
                          {kw.campaignId && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
                              In another campaign
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAssign(kw)}
                          disabled={working === kw._id}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                          style={{ color: campaign.color, border: `1px solid ${campaign.color}40` }}
                          onMouseEnter={e => { e.currentTarget.style.background = campaign.color + '18'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                          {working === kw._id ? <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: campaign.color, borderTopColor: 'transparent' }} /> : <Plus size={12} />}
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assigned.length === 0 && available.length === 0 && (
                <div className="text-center py-8">
                  <Tag size={28} className="mx-auto mb-3" style={{ color: '#242440' }} />
                  <p className="text-sm" style={{ color: '#334155' }}>No keywords found.</p>
                  <p className="text-xs mt-1" style={{ color: '#242440' }}>Add keywords on the Keywords page first.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Campaign Card ─────────────────────────────────────────────────── */
function CampaignCard({ campaign, onDelete, onToggle, onManage }) {
  const { stats = {} } = campaign;

  return (
    <div className="card-gradient p-6 group flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: campaign.color + '20' }}>
            <Megaphone size={18} style={{ color: campaign.color }} />
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">{campaign.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 inline-block"
              style={{ background: campaign.color + '15', color: campaign.color, border: `1px solid ${campaign.color}30` }}>
              {GOALS.find(g => g.value === campaign.goal)?.label || campaign.goal}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onToggle(campaign)} title={campaign.status === 'active' ? 'Pause' : 'Activate'}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#334155' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.color = '#334155'}>
            {campaign.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={() => onDelete(campaign._id)} title="Delete"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#334155' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#334155'}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {campaign.description && (
        <p className="text-sm mb-4 leading-relaxed line-clamp-2" style={{ color: '#475569' }}>{campaign.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: Tag, value: stats.keywords ?? 0, label: 'Keywords' },
          { icon: Inbox, value: stats.totalLeads ?? 0, label: 'Leads' },
          { icon: TrendingUp, value: stats.highIntent ?? 0, label: 'High Intent' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="text-center rounded-xl py-3"
            style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
            <div className="text-xl font-black text-white">{value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#334155' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${campaign.status === 'active'
          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
          : 'text-slate-400 bg-slate-700/30 border border-slate-600/30'}`}>
          {campaign.status === 'active' ? '● Active' : '⏸ Paused'}
        </span>
        <div className="flex items-center gap-2">
          {stats.newLeads > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}>
              {stats.newLeads} new
            </span>
          )}
          <button
            onClick={() => onManage(campaign)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all"
            style={{ color: campaign.color, border: `1px solid ${campaign.color}35` }}
            onMouseEnter={e => e.currentTarget.style.background = campaign.color + '15'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Settings2 size={11} />
            Keywords
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [managing, setManaging] = useState(null); // campaign being managed

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCreate = (newCampaign) => {
    setCampaigns(prev => [{ ...newCampaign, stats: { keywords: 0, totalLeads: 0, newLeads: 0, highIntent: 0 } }, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign? Keywords will be unlinked but not deleted.')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      setCampaigns(prev => prev.filter(c => c._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      await api.patch(`/campaigns/${campaign._id}`, { status: newStatus });
      setCampaigns(prev => prev.map(c => c._id === campaign._id ? { ...c, status: newStatus } : c));
    } catch (err) { console.error(err); }
  };

  // Re-fetch just the one campaign's stats after keyword changes
  const handleKeywordsUpdated = async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data);
      // Keep managing open but update the campaign reference
      if (managing) {
        const updated = res.data.find(c => c._id === managing._id);
        if (updated) setManaging(updated);
      }
    } catch (err) { console.error(err); }
  };

  const active = campaigns.filter(c => c.status === 'active');
  const paused = campaigns.filter(c => c.status !== 'active');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            Organize keywords into goal-driven campaigns
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card-gradient p-16 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(168,85,247,0.2)' }}>
            <Megaphone size={32} style={{ color: '#a855f7' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Create your first campaign</h2>
          <p className="mb-8 max-w-md mx-auto" style={{ color: '#475569' }}>
            Group keywords by goal — whether it's lead gen, sales outreach, or market research. Track what drives results.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2 py-3 px-7">
            <Plus size={16} />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#334155' }}>
                Active · {active.length}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {active.map(c => (
                  <CampaignCard key={c._id} campaign={c}
                    onDelete={handleDelete} onToggle={handleToggle} onManage={setManaging} />
                ))}
              </div>
            </div>
          )}
          {paused.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#334155' }}>
                Paused · {paused.length}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paused.map(c => (
                  <CampaignCard key={c._id} campaign={c}
                    onDelete={handleDelete} onToggle={handleToggle} onManage={setManaging} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {managing && (
        <ManageKeywordsModal
          campaign={managing}
          onClose={() => setManaging(null)}
          onUpdated={handleKeywordsUpdated}
        />
      )}
    </div>
  );
}
