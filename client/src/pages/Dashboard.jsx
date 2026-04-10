import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Tag, BarChart2, Zap, ArrowRight, RefreshCw, TrendingUp, Radar, MessageSquare, Megaphone, Reply } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LeadCard from '../components/LeadCard';
import ReplyModal from '../components/ReplyModal';
import OnboardingWizard from '../components/OnboardingWizard';

function StatCard({ label, value, icon: Icon, gradient, suffix = '' }) {
  return (
    <div className="card-gradient p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: '#475569' }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: gradient + '20' }}>
          <Icon size={16} style={{ color: gradient }} />
        </div>
      </div>
      <div className="text-3xl font-black text-white">{value ?? '—'}{suffix}</div>
    </div>
  );
}

function WeeklyTrend({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card-gradient p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white text-sm">Leads This Week</h2>
        <TrendingUp size={15} style={{ color: '#a855f7' }} />
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {data.map((d, i) => {
          const height = Math.max((d.count / max) * 100, 4);
          const date = new Date(d._id + 'T12:00:00');
          const dayLabel = days[date.getDay()];
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-sm transition-all"
                style={{
                  height: `${height}%`,
                  background: 'linear-gradient(180deg, #a855f7, #f97316)',
                  minHeight: 3,
                }} />
              <span className="text-xs" style={{ color: '#334155', fontSize: 9 }}>{dayLabel}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs" style={{ color: '#475569' }}>
        {data.reduce((s, d) => s + d.count, 0)} leads in the last 7 days
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [todayLeads, setTodayLeads] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [leadsTab, setLeadsTab] = useState('today');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [scanMsg, setScanMsg] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchData = async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [statsRes, leadsRes, todayRes, overviewRes, trendRes] = await Promise.all([
        api.get('/leads/stats'),
        api.get('/leads?limit=5&sortBy=intentScore&sortOrder=desc'),
        api.get(`/leads?limit=5&sortBy=intentScore&sortOrder=desc&since=${todayStart.toISOString()}`),
        api.get('/analytics/overview'),
        api.get('/analytics/leads-over-time?days=7'),
      ]);
      setStats(statsRes.data);
      setRecentLeads(leadsRes.data.leads);
      setTodayLeads(todayRes.data.leads);
      setOverview(overviewRes.data);
      setWeeklyTrend(trendRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && stats?.total === 0 && !localStorage.getItem('huntiq_onboarded')) {
      setShowOnboarding(true);
    }
  }, [loading, stats]);

  const handleScan = async () => {
    setScanning(true);
    setScanMsg('');
    try {
      const res = await api.post('/leads/scan');
      setScanMsg(res.data.message);
      fetchData();
    } catch (err) {
      setScanMsg(err.response?.data?.message || 'Scan failed. Add keywords first.');
    } finally {
      setScanning(false);
    }
  };

  const handleStatus = async (id, status) => {
    await api.patch(`/leads/${id}/status`, { status });
    setRecentLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
    setTodayLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const noKeywords = stats?.total === 0;
  const displayLeads = leadsTab === 'today' ? todayLeads : recentLeads;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>Here's your Reddit lead intelligence overview</p>
        </div>
        <button onClick={handleScan} disabled={scanning} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
          <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
          {scanning ? 'Scanning...' : 'Scan Now'}
        </button>
      </div>

      {scanMsg && (
        <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2"
          style={scanMsg.includes('failed') || scanMsg.includes('Add')
            ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }
            : { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
          {scanMsg}
        </div>
      )}

      {/* Empty state */}
      {noKeywords && (
        <div className="card-gradient p-14 text-center mb-7">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(168,85,247,0.2)' }}>
            <Radar size={28} style={{ color: '#a855f7' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Start monitoring Reddit</h2>
          <p className="mb-7 max-w-md mx-auto" style={{ color: '#475569' }}>
            Add keywords to monitor and HuntIQ will automatically scan Reddit for high-intent leads.
          </p>
          <Link to="/keywords" className="btn-primary inline-flex items-center gap-2 py-2.5 px-6">
            Add Your First Keyword <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-7">
          <StatCard label="Total Leads" value={stats.total} icon={Inbox} gradient="#a855f7" />
          <StatCard label="Today's Leads" value={todayLeads.length > 0 ? (overview?.leadsThisWeek ?? stats.new) : 0} icon={Zap} gradient="#f97316" />
          <StatCard label="New Leads" value={stats.new} icon={Radar} gradient="#06b6d4" />
          <StatCard label="Replied" value={stats.replied} icon={MessageSquare} gradient="#10b981" />
          <StatCard label="Reply Rate" value={overview?.replyRate ?? 0} icon={Reply} gradient="#f59e0b" suffix="%" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            {/* Tab toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => setLeadsTab('today')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={leadsTab === 'today'
                  ? { background: 'linear-gradient(135deg, #f97316, #a855f7)', color: '#fff' }
                  : { color: '#475569' }}>
                Today {todayLeads.length > 0 && <span className="ml-1 text-xs opacity-70">({todayLeads.length})</span>}
              </button>
              <button
                onClick={() => setLeadsTab('top')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={leadsTab === 'top'
                  ? { background: 'linear-gradient(135deg, #f97316, #a855f7)', color: '#fff' }
                  : { color: '#475569' }}>
                Top Scoring
              </button>
            </div>
            <Link to="/leads" className="text-sm flex items-center gap-1 font-medium"
              style={{ color: '#f97316' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {displayLeads.length === 0 ? (
            <div className="card-gradient p-10 text-center">
              <Inbox size={28} className="mx-auto mb-3 opacity-30" style={{ color: '#475569' }} />
              <p className="text-sm" style={{ color: '#334155' }}>
                {leadsTab === 'today' ? 'No leads found today. Run a scan to get started.' : 'No leads yet. Run a scan to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayLeads.map(lead => (
                <LeadCard key={lead._id} lead={lead} onReply={setSelectedLead} onStatus={handleStatus} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Weekly trend */}
          <WeeklyTrend data={weeklyTrend} />

          {/* Quick actions */}
          <div>
            <h2 className="font-semibold text-white mb-3 text-sm">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/leads', icon: Inbox, label: 'View All Leads', desc: `${stats?.new || 0} new leads`, color: '#a855f7' },
                { to: '/campaigns', icon: Megaphone, label: 'Campaigns', desc: 'Manage your campaigns', color: '#f97316' },
                { to: '/keywords', icon: Tag, label: 'Keywords', desc: 'Add & configure keywords', color: '#06b6d4' },
                { to: '/analytics', icon: BarChart2, label: 'Analytics', desc: 'View trends & insights', color: '#10b981' },
              ].map(({ to, icon: Icon, label, desc, color }) => (
                <Link key={to} to={to} className="card-gradient p-4 flex items-center gap-3 group hover:scale-[1.01] transition-transform">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: color + '18' }}>
                    <Icon size={17} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white">{label}</div>
                    <div className="text-xs" style={{ color: '#334155' }}>{desc}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: '#242440' }} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedLead && (
        <ReplyModal lead={selectedLead} onClose={() => setSelectedLead(null)}
          onReplied={() => { fetchData(); setSelectedLead(null); }} />
      )}

      {showOnboarding && (
        <OnboardingWizard onComplete={() => { setShowOnboarding(false); fetchData(); }} />
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
