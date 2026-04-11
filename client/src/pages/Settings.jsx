import { useState, useEffect } from 'react';
import { User, Mail, Bell, BellRing, Shield, CheckCircle, AlertCircle, Loader2, Send, ExternalLink, LogIn, LogOut, Zap, CreditCard, ArrowRight, Tag, MessageSquare, Megaphone } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

// ─── Billing Section ─────────────────────────────────────────────────────────
function BillingSection({ searchParams, setSearchParams }) {
  const navigate = useNavigate();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBilling();
    const billingParam = searchParams.get('billing');
    if (billingParam === 'success') {
      setMsg({ type: 'success', text: 'Subscription activated! Welcome aboard 🎉' });
      setSearchParams({});
    } else if (billingParam === 'portal_return') {
      setMsg({ type: 'success', text: 'Billing settings updated.' });
      setSearchParams({});
    }
  }, []);

  const fetchBilling = async () => {
    try {
      const res = await api.get('/billing/status');
      setBilling(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await api.get('/billing/portal');
      window.location.href = res.data.url;
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not open billing portal.' });
      setPortalLoading(false);
    }
  };

  const UsageBar = ({ label, icon: Icon, current, limit, color = '#a855f7' }) => {
    const pct = Math.min(100, Math.round((current / limit) * 100));
    const isWarning = pct >= 80;
    const barColor = pct >= 100 ? '#ef4444' : isWarning ? '#f97316' : color;
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#94a3b8' }}>
            <Icon size={13} style={{ color }} />
            {label}
          </div>
          <span className="text-xs font-semibold" style={{ color: pct >= 100 ? '#ef4444' : '#64748b' }}>
            {current} / {limit}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a2e' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
    </div>
  );

  const isPro = billing?.plan === 'pro';
  const status = billing?.subscriptionStatus || 'none';
  const statusColors = {
    trialing: { bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.2)', label: 'Trial' },
    active:   { bg: 'rgba(168,85,247,0.1)', color: '#a855f7', border: 'rgba(168,85,247,0.2)', label: 'Active' },
    past_due: { bg: 'rgba(239,68,68,0.1)',  color: '#f87171', border: 'rgba(239,68,68,0.2)',  label: 'Past Due' },
    canceled: { bg: 'rgba(100,116,139,0.1)',color: '#94a3b8', border: 'rgba(100,116,139,0.2)',label: 'Canceled' },
    none:     { bg: 'rgba(100,116,139,0.1)',color: '#94a3b8', border: 'rgba(100,116,139,0.2)',label: 'No Plan' },
  };
  const statusStyle = statusColors[status] || statusColors.none;

  return (
    <div className="card-gradient p-6 mb-5">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: '#1a1a2e' }}>
        <CreditCard size={17} style={{ color: '#f97316' }} />
        <h2 className="font-semibold text-white">Billing & Plan</h2>
      </div>

      {msg.text && (
        <div className="flex items-center gap-2 rounded-xl p-3 text-sm mb-4"
          style={msg.type === 'success'
            ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }
            : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          {msg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {msg.text}
        </div>
      )}

      {/* Plan header */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-xl" style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-white capitalize">{billing?.plan || 'Starter'} Plan</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
              {statusStyle.label}
            </span>
          </div>
          {status === 'trialing' && billing?.trialDaysLeft !== null && (
            <p className="text-sm" style={{ color: '#f97316' }}>
              ⏳ {billing.trialDaysLeft} day{billing.trialDaysLeft !== 1 ? 's' : ''} left in trial
            </p>
          )}
          {status === 'active' && billing?.currentPeriodEnd && (
            <p className="text-sm" style={{ color: '#475569' }}>
              Next billing: {new Date(billing.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          {status === 'past_due' && (
            <p className="text-sm" style={{ color: '#f87171' }}>
              ⚠️ Payment failed — update your card to restore access
            </p>
          )}
          {status === 'none' && (
            <p className="text-sm" style={{ color: '#475569' }}>No active subscription</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {(status === 'trialing' || status === 'active' || status === 'past_due') && (
            <button onClick={handlePortal} disabled={portalLoading}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all"
              style={{ background: '#1a1a2e', color: '#94a3b8', border: '1px solid #242440' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
              {portalLoading ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />}
              Manage Billing
            </button>
          )}
          {!isPro && (
            <button onClick={() => navigate('/checkout?plan=pro')}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all btn-primary">
              <Zap size={12} />
              Upgrade to Pro
            </button>
          )}
          {(status === 'none' || status === 'canceled') && (
            <button onClick={() => navigate(`/checkout?plan=${billing?.plan || 'starter'}`)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
              style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>
              <ArrowRight size={12} />
              Start Trial
            </button>
          )}
        </div>
      </div>

      {/* Usage */}
      {billing?.usage && billing?.limits && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#334155' }}>This Month's Usage</p>
          <div className="space-y-4">
            <UsageBar label="Keywords" icon={Tag} current={billing.usage.keywords} limit={billing.limits.keywords} color="#a855f7" />
            <UsageBar label="Leads found" icon={Zap} current={billing.usage.leadsThisMonth} limit={billing.limits.leadsPerMonth} color="#f97316" />
            <UsageBar label="AI Reply drafts" icon={MessageSquare} current={billing.usage.repliesThisMonth} limit={billing.limits.repliesPerMonth} color="#06b6d4" />
            <UsageBar label="Campaigns" icon={Megaphone} current={billing.usage.campaigns} limit={billing.limits.campaigns} color="#10b981" />
          </div>
          {billing.usage.resetAt && (
            <p className="text-xs mt-4" style={{ color: '#334155' }}>
              Usage resets on {new Date(new Date(billing.usage.resetAt).setMonth(new Date(billing.usage.resetAt).getMonth() + 1)).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children, accentColor = '#a855f7' }) {
  return (
    <div className="card-gradient p-6 mb-5">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: '#1a1a2e' }}>
        <Icon size={17} style={{ color: accentColor }} />
        <h2 className="font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Alert({ type, msg }) {
  if (!msg) return null;
  const isSuccess = type === 'success';
  return (
    <div className="flex items-center gap-2 rounded-xl p-3 text-sm mb-4"
      style={isSuccess
        ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }
        : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
      {isSuccess ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button type="button" onClick={onChange}
      className="relative w-12 h-6 rounded-full transition-all duration-200 shrink-0"
      style={{ background: enabled ? 'linear-gradient(135deg, #f97316, #a855f7)' : '#1a1a2e' }}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>{label}</label>
      <input className="input" {...props} />
    </div>
  );
}

// ─── Lead Alerts Section ──────────────────────────────────────────────────────
function AlertsSection({ userEmail }) {
  const [settings, setSettings] = useState({ enabled: false, email: '', threshold: 70 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/alerts/settings')
      .then(res => setSettings({ ...res.data, email: res.data.email || userEmail || '' }))
      .catch(() => setSettings(s => ({ ...s, email: userEmail || '' })))
      .finally(() => setLoading(false));
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/alerts/settings', settings);
      setSettings(s => ({ ...s, ...res.data }));
      showMsg('success', 'Alert settings saved.');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await api.post('/alerts/test');
      showMsg('success', res.data.message || 'Test alert sent!');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'No leads found for test. Add keywords and run a scan first.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) return null;

  return (
    <Section title="Real-Time Lead Alerts" icon={BellRing} accentColor="#f97316">
      {msg.text && (
        <div className="flex items-center gap-2 rounded-xl p-3 text-sm mb-4"
          style={msg.type === 'success'
            ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }
            : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          {msg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {msg.text}
        </div>
      )}

      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl mb-4"
        style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
        <div>
          <div className="font-medium text-white text-sm">Enable Real-Time Alerts</div>
          <div className="text-xs mt-0.5" style={{ color: '#334155' }}>
            Get instant email when high-intent leads are found on Reddit
          </div>
        </div>
        <Toggle enabled={settings.enabled} onChange={() => setSettings(s => ({ ...s, enabled: !s.enabled }))} />
      </div>

      {settings.enabled && (
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Alert Email</label>
            <input
              className="input"
              type="email"
              value={settings.email}
              onChange={e => setSettings(s => ({ ...s, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </div>

          {/* Threshold slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                Minimum Intent Score
              </label>
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' }}>
                {settings.threshold}+
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={95}
              step={5}
              value={settings.threshold}
              onChange={e => setSettings(s => ({ ...s, threshold: parseInt(e.target.value) }))}
              className="w-full accent-orange-500"
              style={{ accentColor: '#f97316' }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: '#334155' }}>
              <span>30 (more alerts)</span>
              <span>95 (only top leads)</span>
            </div>
            <p className="text-xs mt-2" style={{ color: '#475569' }}>
              Only leads with an intent score of <strong style={{ color: '#f97316' }}>{settings.threshold}+</strong> will trigger an alert. Max 1 email per 30 minutes.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 justify-end pt-4">
        {settings.enabled && (
          <button type="button" onClick={handleTest} disabled={testing}
            className="btn-secondary flex items-center gap-2 text-sm">
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send Test
          </button>
        )}
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2">
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save Settings
        </button>
      </div>
    </Section>
  );
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Profile
  const [profile, setProfile] = useState({ name: user?.name || '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', msg: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passMsg, setPassMsg] = useState({ type: '', msg: '' });
  const [passLoading, setPassLoading] = useState(false);

  // Digest
  const [digest, setDigest] = useState({
    enabled: user?.digestSettings?.enabled || false,
    email: user?.digestSettings?.email || user?.email || '',
    time: user?.digestSettings?.time || '08:00',
    timezone: user?.digestSettings?.timezone || 'UTC',
  });
  const [digestMsg, setDigestMsg] = useState({ type: '', msg: '' });
  const [digestLoading, setDigestLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  // Reddit connection
  const [redditStatus, setRedditStatus] = useState({ connected: false, username: null, connectedAt: null });
  const [redditLoading, setRedditLoading] = useState(true);
  const [redditMsg, setRedditMsg] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchRedditStatus();
    // Handle OAuth callback params
    const reddit = searchParams.get('reddit');
    const username = searchParams.get('username');
    const msg = searchParams.get('msg');
    if (reddit === 'connected') {
      setRedditMsg({ type: 'success', msg: `Successfully connected as u/${username}!` });
      setSearchParams({});
      fetchRedditStatus();
    } else if (reddit === 'error') {
      setRedditMsg({ type: 'error', msg: `Connection failed: ${msg || 'unknown error'}` });
      setSearchParams({});
    }
  }, []);

  const fetchRedditStatus = async () => {
    try {
      const res = await api.get('/reddit/status');
      setRedditStatus(res.data);
    } catch {
      /* ignore */
    } finally {
      setRedditLoading(false);
    }
  };

  const handleRedditConnect = () => {
    // Redirect to backend OAuth initiation (carries JWT in redirect)
    const token = localStorage.getItem('token');
    window.location.href = `/api/reddit/connect?token=${token}`;
  };

  const handleRedditDisconnect = async () => {
    if (!confirm('Disconnect your Reddit account?')) return;
    try {
      await api.delete('/reddit/disconnect');
      setRedditStatus({ connected: false, username: null });
      setRedditMsg({ type: 'success', msg: 'Reddit account disconnected.' });
    } catch {
      setRedditMsg({ type: 'error', msg: 'Failed to disconnect.' });
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', msg: '' });
    try {
      const res = await api.put('/auth/profile', { name: profile.name });
      updateUser(res.data.user);
      setProfileMsg({ type: 'success', msg: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', msg: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm)
      return setPassMsg({ type: 'error', msg: 'New passwords do not match.' });
    if (passwords.newPassword.length < 6)
      return setPassMsg({ type: 'error', msg: 'Password must be at least 6 characters.' });
    setPassLoading(true);
    setPassMsg({ type: '', msg: '' });
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPassMsg({ type: 'success', msg: 'Password changed successfully.' });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPassMsg({ type: 'error', msg: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleDigestSave = async (e) => {
    e.preventDefault();
    setDigestLoading(true);
    setDigestMsg({ type: '', msg: '' });
    try {
      await api.put('/digest/settings', digest);
      setDigestMsg({ type: 'success', msg: 'Digest settings saved.' });
    } catch {
      setDigestMsg({ type: 'error', msg: 'Failed to save digest settings.' });
    } finally {
      setDigestLoading(false);
    }
  };

  const handleTestDigest = async () => {
    setTestLoading(true);
    try {
      await api.post('/digest/test', { email: digest.email });
      setDigestMsg({ type: 'success', msg: `Test digest sent to ${digest.email}` });
    } catch (err) {
      setDigestMsg({ type: 'error', msg: err.response?.data?.message || 'Failed to send test.' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>Manage your account and preferences</p>
      </div>

      {/* Billing — top of page */}
      <BillingSection searchParams={searchParams} setSearchParams={setSearchParams} />

      {/* Reddit Connection */}
      <Section title="Reddit Account" icon={Zap} accentColor="#f97316">
        <Alert {...redditMsg} />
        {redditLoading ? (
          <div className="flex items-center gap-2 py-2" style={{ color: '#334155' }}>
            <Loader2 size={14} className="animate-spin" />
            <span className="text-sm">Checking connection...</span>
          </div>
        ) : redditStatus.connected ? (
          <div className="space-y-4">
            {/* Connected card */}
            <div className="rounded-xl p-4 flex items-center gap-4"
              style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
                <span className="text-white font-bold text-sm">
                  {redditStatus.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">u/{redditStatus.username}</div>
                <div className="text-xs mt-0.5" style={{ color: '#475569' }}>
                  Connected {redditStatus.connectedAt ? new Date(redditStatus.connectedAt).toLocaleDateString() : ''}
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                ● Connected
              </span>
            </div>

            {/* Capabilities */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Post Comments', desc: 'Reply directly on Reddit posts', icon: '💬' },
                { label: 'Send Private Messages', desc: 'DM Reddit users from HuntIQ', icon: '✉️' },
              ].map(({ label, desc, icon }) => (
                <div key={label} className="rounded-xl p-3 flex items-start gap-3"
                  style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
                  <span className="text-lg shrink-0">{icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#334155' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <a href="https://www.reddit.com" target="_blank" rel="noopener noreferrer"
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: '#334155' }}>
                <ExternalLink size={11} /> Open Reddit
              </a>
              <button onClick={handleRedditDisconnect}
                className="flex items-center gap-2 text-sm py-2 px-4 rounded-xl transition-all"
                style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)' }}>
                <LogOut size={14} />
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
              Connect your Reddit account to post comments and send private messages directly from HuntIQ — no copy-pasting required.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-2">
              {[
                { label: 'Post Comments', desc: 'Reply on posts in one click', icon: '💬' },
                { label: 'Send DMs', desc: 'Message users privately', icon: '✉️' },
              ].map(({ label, desc, icon }) => (
                <div key={label} className="rounded-xl p-3 flex items-start gap-3"
                  style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
                  <span className="text-lg">{icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#334155' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleRedditConnect}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              <LogIn size={16} />
              Connect Reddit Account
            </button>
            <p className="text-xs text-center" style={{ color: '#242440' }}>
              Requires a Reddit app. Set <code className="text-xs px-1 py-0.5 rounded" style={{ background: '#12121f', color: '#f97316' }}>REDDIT_CLIENT_ID</code> and <code className="text-xs px-1 py-0.5 rounded" style={{ background: '#12121f', color: '#f97316' }}>REDDIT_CLIENT_SECRET</code> in server/.env
            </p>
          </div>
        )}
      </Section>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <Alert {...profileMsg} />
        <form onSubmit={handleProfileSave} className="space-y-4">
          <InputField label="Full Name" value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Email</label>
            <input value={user?.email} className="input opacity-50 cursor-not-allowed" disabled />
            <p className="text-xs mt-1" style={{ color: '#242440' }}>Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Plan</label>
            <span className="text-xs font-bold px-3 py-1 rounded-full capitalize"
              style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>
              {user?.plan || 'free'}
            </span>
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={profileLoading} className="btn-primary flex items-center gap-2">
              {profileLoading && <Loader2 size={14} className="animate-spin" />}
              Save Profile
            </button>
          </div>
        </form>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Shield} accentColor="#06b6d4">
        <Alert {...passMsg} />
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <InputField label="Current Password" type="password" value={passwords.currentPassword}
            onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
          <InputField label="New Password" type="password" value={passwords.newPassword}
            onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required />
          <InputField label="Confirm New Password" type="password" value={passwords.confirm}
            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} required />
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={passLoading} className="btn-primary flex items-center gap-2">
              {passLoading && <Loader2 size={14} className="animate-spin" />}
              Change Password
            </button>
          </div>
        </form>
      </Section>

      {/* Daily Digest */}
      <Section title="Daily Digest Email" icon={Bell} accentColor="#10b981">
        <Alert {...digestMsg} />
        <form onSubmit={handleDigestSave} className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
            <div>
              <div className="font-medium text-white text-sm">Enable Daily Digest</div>
              <div className="text-xs mt-0.5" style={{ color: '#334155' }}>Receive a daily email with your top leads and AI summary</div>
            </div>
            <Toggle enabled={digest.enabled} onChange={() => setDigest(d => ({ ...d, enabled: !d.enabled }))} />
          </div>

          {digest.enabled && (
            <>
              <InputField label="Recipient Email" type="email" value={digest.email}
                onChange={e => setDigest(d => ({ ...d, email: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Send Time" type="time" value={digest.time}
                  onChange={e => setDigest(d => ({ ...d, time: e.target.value }))} />
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Timezone</label>
                  <select value={digest.timezone} onChange={e => setDigest(d => ({ ...d, timezone: e.target.value }))} className="input">
                    {[['UTC','UTC'],['America/New_York','Eastern (ET)'],['America/Chicago','Central (CT)'],
                      ['America/Los_Angeles','Pacific (PT)'],['Europe/London','London (GMT)'],
                      ['Europe/Paris','Paris (CET)'],['Asia/Kolkata','India (IST)'],
                      ['Asia/Tokyo','Tokyo (JST)'],['Australia/Sydney','Sydney (AEST)']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 justify-end pt-1">
            {digest.enabled && (
              <button type="button" onClick={handleTestDigest} disabled={testLoading}
                className="btn-secondary flex items-center gap-2 text-sm">
                {testLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send Test
              </button>
            )}
            <button type="submit" disabled={digestLoading} className="btn-primary flex items-center gap-2">
              {digestLoading && <Loader2 size={14} className="animate-spin" />}
              Save Settings
            </button>
          </div>
        </form>
      </Section>

      {/* Lead Alerts */}
      <AlertsSection userEmail={user?.email} />

      {/* Integrations */}
      <Section title="Integrations" icon={Mail} accentColor="#f59e0b">
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium text-white text-sm">Reddit API (Scan)</div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                ● Active
              </span>
            </div>
            <p className="text-xs" style={{ color: '#334155' }}>Public Reddit API for scanning posts. Runs every 15 minutes.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
