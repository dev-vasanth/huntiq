import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Globe, Tag, Activity, Crosshair, AlertTriangle, TrendingDown, Users } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../utils/api';
import StatsCard from '../components/StatsCard';

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

function CompetitorTab({ data }) {
  if (!data) return <div className="flex justify-center py-16 text-slate-500 text-sm">Loading...</div>;

  const sentimentColors = { positive: '#10b981', neutral: '#64748b', negative: '#ef4444' };

  // Build own vs competitor summary
  const ownRow    = data.summary?.find(r => r._id === 'own')        || { count: 0, avgScore: 0 };
  const compRow   = data.summary?.find(r => r._id === 'competitor') || { count: 0, avgScore: 0 };
  const hasData   = compRow.count > 0;

  if (!hasData) {
    return (
      <div className="card p-16 text-center">
        <Crosshair size={36} className="mx-auto mb-4" style={{ color: '#334155' }} />
        <p className="font-semibold text-white mb-2">No competitor data yet</p>
        <p className="text-sm mb-4" style={{ color: '#475569' }}>
          Mark keywords as <strong style={{ color: '#f87171' }}>Competitor</strong> on the Keywords page to start tracking rival mentions on Reddit.
        </p>
        <a href="/keywords"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl btn-primary">
          Go to Keywords →
        </a>
      </div>
    );
  }

  const totalSentiment = (data.sentimentBreakdown || []).reduce((a, b) => a + b.count, 0);
  const negRow = data.sentimentBreakdown?.find(r => r._id === 'negative') || { count: 0 };
  const negPct = totalSentiment > 0 ? Math.round((negRow.count / totalSentiment) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Competitor Mentions', value: compRow.count, icon: Crosshair, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
          { label: 'Own Brand Leads', value: ownRow.count, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Avg Intent Score', value: Math.round(compRow.avgScore || 0), icon: Activity, color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
          { label: 'Negative Sentiment', value: `${negPct}%`, icon: AlertTriangle, color: '#f87171', bg: 'rgba(239,68,68,0.06)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor keywords breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-1">Competitor Keywords</h3>
          <p className="text-xs mb-4" style={{ color: '#475569' }}>Mentions per competitor keyword · negative vs positive split</p>
          {data.topKeywords?.length > 0 ? (
            <div className="space-y-3">
              {data.topKeywords.map(kw => {
                const total = kw.count || 1;
                const negPct = Math.round((kw.negative / total) * 100);
                const posPct = Math.round((kw.positive / total) * 100);
                return (
                  <div key={kw._id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-white">"{kw._id}"</span>
                      <div className="flex items-center gap-2" style={{ color: '#64748b' }}>
                        <span style={{ color: '#f87171' }}>↓{negPct}% neg</span>
                        <span style={{ color: '#10b981' }}>↑{posPct}% pos</span>
                        <span className="font-semibold text-white">{kw.count}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a2e' }}>
                      <div className="h-full rounded-full" style={{ width: `${negPct}%`, background: '#ef4444' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">No data yet</div>
          )}
        </div>

        {/* Sentiment breakdown for competitor leads */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-1">Sentiment on Competitor Posts</h3>
          <p className="text-xs mb-4" style={{ color: '#475569' }}>How Reddit users feel about your competitors</p>
          {data.sentimentBreakdown?.length > 0 ? (
            <div className="space-y-3">
              {data.sentimentBreakdown.map(s => {
                const pct = totalSentiment > 0 ? Math.round((s.count / totalSentiment) * 100) : 0;
                const color = sentimentColors[s._id] || '#64748b';
                const emoji = s._id === 'negative' ? '😤' : s._id === 'positive' ? '😊' : '😐';
                return (
                  <div key={s._id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="capitalize flex items-center gap-1.5" style={{ color }}>
                        {emoji} {s._id}
                      </span>
                      <span className="font-semibold" style={{ color: '#94a3b8' }}>{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1a1a2e' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
              {negPct >= 40 && (
                <div className="mt-3 p-3 rounded-xl flex items-start gap-2"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <AlertTriangle size={14} style={{ color: '#f87171', marginTop: 1, shrink: 0 }} />
                  <p className="text-xs" style={{ color: '#f87171' }}>
                    High negative sentiment ({negPct}%) — competitors have unhappy users. Now's your chance to offer a better solution.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">No data yet</div>
          )}
        </div>

        {/* Top subreddits for competitor leads */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-1">Where Competitors Are Discussed</h3>
          <p className="text-xs mb-4" style={{ color: '#475569' }}>Top subreddits mentioning your competitors</p>
          {data.topSubreddits?.length > 0 ? (
            <div className="space-y-2">
              {data.topSubreddits.map((sub, i) => {
                const max = data.topSubreddits[0]?.count || 1;
                const pct = Math.round((sub.count / max) * 100);
                return (
                  <div key={sub._id} className="flex items-center gap-3">
                    <span className="text-xs w-4 text-right" style={{ color: '#334155' }}>{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-white font-medium">r/{sub._id}</span>
                        <span style={{ color: '#64748b' }}>{sub.count} posts</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a2e' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#ef4444' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">No data yet</div>
          )}
        </div>

        {/* Competitor pain points (intent signals) */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-1">Competitor Pain Points</h3>
          <p className="text-xs mb-4" style={{ color: '#475569' }}>What users are asking / complaining about</p>
          {data.topSignals?.length > 0 ? (
            <div className="space-y-2">
              {data.topSignals.map((s, i) => {
                const max = data.topSignals[0]?.count || 1;
                const pct = Math.round((s.count / max) * 100);
                return (
                  <div key={s._id} className="flex items-center gap-3">
                    <span className="text-xs w-4 text-right" style={{ color: '#334155' }}>{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span style={{ color: '#fb923c' }}>⚡ {s._id}</span>
                        <span style={{ color: '#64748b' }}>{s.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a2e' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#f97316' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">No signals found</div>
          )}
        </div>
      </div>

      {/* Opportunity insight banner */}
      {compRow.count > 0 && (
        <div className="p-4 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.18)' }}>
          <TrendingDown size={18} style={{ color: '#f97316', marginTop: 2, flexShrink: 0 }} />
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Opportunity detected</p>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              HuntIQ found <strong style={{ color: '#f97316' }}>{compRow.count} Reddit posts</strong> mentioning your competitors.
              Filter your leads by <strong style={{ color: '#f97316' }}>Competitor</strong> keyword type to find users actively looking for an alternative — these are your warmest prospects.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [leadsOverTime, setLeadsOverTime] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [subreddits, setSubreddits] = useState([]);
  const [sentiment, setSentiment] = useState([]);
  const [signals, setSignals] = useState([]);
  const [competitor, setCompetitor] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ov, lot, kw, sub, sent, sig, comp] = await Promise.all([
          api.get('/analytics/overview'),
          api.get(`/analytics/leads-over-time?days=${days}`),
          api.get('/analytics/keywords'),
          api.get('/analytics/subreddits'),
          api.get('/analytics/sentiment'),
          api.get('/analytics/signals'),
          api.get('/analytics/competitor'),
        ]);
        setOverview(ov.data);
        setLeadsOverTime(lot.data.data.map(d => ({ date: d._id, leads: d.count, score: Math.round(d.avgScore) })));
        setKeywords(kw.data.data.map(d => ({ name: d._id, leads: d.count, score: Math.round(d.avgScore), replied: d.replied })));
        setSubreddits(sub.data.data.map(d => ({ name: `r/${d._id}`, value: d.count, score: Math.round(d.avgScore) })));
        setSentiment(sent.data.data.map(d => ({ name: d._id, value: d.count })));
        setSignals(sig.data.data.map(d => ({ name: d._id, count: d.count })));
        setCompetitor(comp.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [days]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sentimentColors = { positive: '#10b981', neutral: '#64748b', negative: '#ef4444' };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Track your lead intelligence performance</p>
        </div>
        <select
          value={days}
          onChange={e => setDays(parseInt(e.target.value))}
          className="input w-32 text-sm">
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: '#12121f', border: '1px solid #1a1a2e' }}>
        {[
          { key: 'overview', label: 'Overview', icon: BarChart2 },
          { key: 'competitor', label: 'Competitor Intel', icon: Crosshair },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === key
              ? { background: 'linear-gradient(135deg, #f97316, #a855f7)', color: 'white' }
              : { color: '#475569' }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <>
          {overview && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatsCard label="Total Leads" value={overview.totalLeads} icon={BarChart2} color="text-violet-400" bg="bg-violet-500/10" />
              <StatsCard label="This Week" value={overview.leadsThisWeek} icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-500/10" />
              <StatsCard label="Reply Rate" value={overview.replyRate} icon={Activity} color="text-amber-400" bg="bg-amber-500/10" suffix="%" />
              <StatsCard label="Avg Intent Score" value={overview.avgIntentScore} icon={Tag} color="text-blue-400" bg="bg-blue-500/10" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Leads over time */}
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-semibold text-white mb-4">Leads Over Time</h3>
              {leadsOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={leadsOverTime}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="leads" stroke="#7c3aed" fill="url(#colorLeads)" strokeWidth={2} name="Leads" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
              )}
            </div>

            {/* Keyword performance */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">Keyword Performance</h3>
              {keywords.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={keywords} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="leads" fill="#7c3aed" radius={[0, 4, 4, 0]} name="Leads" />
                    <Bar dataKey="replied" fill="#10b981" radius={[0, 4, 4, 0]} name="Replied" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
              )}
            </div>

            {/* Subreddit breakdown */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">Subreddit Breakdown</h3>
              {subreddits.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={subreddits} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {subreddits.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">Sentiment Distribution</h3>
              {sentiment.length > 0 ? (
                <div className="space-y-3">
                  {sentiment.map(s => {
                    const total = sentiment.reduce((a, b) => a + b.value, 0);
                    const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                    const color = sentimentColors[s.name] || '#64748b';
                    return (
                      <div key={s.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="capitalize" style={{ color }}>{s.name}</span>
                          <span className="text-slate-400">{s.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-slate-500 text-sm">No data yet</div>
              )}
            </div>

            {/* Top intent signals */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">Top Intent Signals</h3>
              {signals.length > 0 ? (
                <div className="space-y-2">
                  {signals.slice(0, 8).map((s, i) => {
                    const max = signals[0]?.count || 1;
                    const pct = Math.round((s.count / max) * 100);
                    return (
                      <div key={s.name} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-4 text-right">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-violet-400">🎯 {s.name}</span>
                            <span className="text-slate-400">{s.count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-slate-500 text-sm">No data yet</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── COMPETITOR INTEL TAB ── */}
      {tab === 'competitor' && (
        <CompetitorTab data={competitor} />
      )}
    </div>
  );
}
