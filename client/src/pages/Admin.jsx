import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lightbulb, Clock, CheckCircle2, Eye, RotateCcw, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const FOUNDER_EMAIL = 'vasanthbscit2016@gmail.com';

const STATUS_COLORS = {
  new:       { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)',  color: '#f97316' },
  read:      { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)', color: '#64748b' },
  replied:   { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  color: '#10b981' },
  reviewing: { bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)',   color: '#06b6d4' },
  planned:   { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)',  color: '#a855f7' },
  completed: { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  color: '#10b981' },
  declined:  { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   color: '#f87171' },
};

const CONTACT_STATUSES = ['new', 'read', 'replied'];
const FR_STATUSES = ['new', 'reviewing', 'planned', 'completed', 'declined'];

const CATEGORY_LABELS = {
  feature: '✨ New Feature', ui: '🎨 UI/UX', integration: '🔗 Integration',
  bug: '🐛 Bug Report', other: '💬 Other',
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.new;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full capitalize"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {status}
    </span>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('contacts');
  const [contacts, setContacts] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (user && user.email !== FOUNDER_EMAIL) {
      navigate('/dashboard');
    }
  }, [user]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cRes, fRes] = await Promise.all([
          api.get('/contact'),
          api.get('/feature-requests'),
        ]);
        setContacts(cRes.data.submissions);
        setFeatures(fRes.data.requests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email === FOUNDER_EMAIL) fetchAll();
  }, [user]);

  const updateContactStatus = async (id, status) => {
    await api.patch(`/contact/${id}`, { status });
    setContacts(prev => prev.map(c => c._id === id ? { ...c, status } : c));
  };

  const updateFRStatus = async (id, status) => {
    await api.patch(`/feature-requests/${id}`, { status });
    setFeatures(prev => prev.map(f => f._id === id ? { ...f, status } : f));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const newContacts = contacts.filter(c => c.status === 'new').length;
  const newFeatures = features.filter(f => f.status === 'new').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin</h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>Contact submissions & feature requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'contacts', label: 'Contact Submissions', icon: Mail, count: newContacts },
          { key: 'features', label: 'Feature Requests', icon: Lightbulb, count: newFeatures },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={tab === t.key
              ? { background: 'linear-gradient(135deg, #f97316, #a855f7)', color: '#fff' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#475569' }}>
            <t.icon size={14} />
            {t.label}
            {t.count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contact Submissions */}
      {tab === 'contacts' && (
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="card-gradient p-12 text-center">
              <Mail size={28} className="mx-auto mb-3 opacity-30" style={{ color: '#475569' }} />
              <p className="text-sm" style={{ color: '#334155' }}>No contact submissions yet.</p>
            </div>
          ) : contacts.map(c => (
            <div key={c._id} className="card-gradient p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-white text-sm">{c.subject}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs mb-2" style={{ color: '#475569' }}>
                    {c.name} · {c.email} · {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </p>
                  {expanded === c._id && (
                    <p className="text-sm mt-2 p-3 rounded-lg whitespace-pre-wrap"
                      style={{ background: 'rgba(255,255,255,0.03)', color: '#94a3b8' }}>
                      {c.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setExpanded(expanded === c._id ? null : c._id)}
                    className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                    style={{ color: '#475569' }}>
                    <Eye size={14} />
                  </button>
                  <select
                    value={c.status}
                    onChange={e => updateContactStatus(c._id, e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border"
                    style={{ background: '#0d0d1a', border: '1px solid #1a1a2e', color: '#94a3b8' }}>
                    {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature Requests */}
      {tab === 'features' && (
        <div className="space-y-3">
          {features.length === 0 ? (
            <div className="card-gradient p-12 text-center">
              <Lightbulb size={28} className="mx-auto mb-3 opacity-30" style={{ color: '#475569' }} />
              <p className="text-sm" style={{ color: '#334155' }}>No feature requests yet.</p>
            </div>
          ) : features.map(f => (
            <div key={f._id} className="card-gradient p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-white text-sm">{f.title}</span>
                    <StatusBadge status={f.status} />
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(100,116,139,0.12)', border: '1px solid rgba(100,116,139,0.2)', color: '#64748b' }}>
                      {CATEGORY_LABELS[f.category] || f.category}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: '#475569' }}>
                    {f.userName} · {f.userEmail} · {f.userPlan} plan · {formatDistanceToNow(new Date(f.createdAt), { addSuffix: true })}
                  </p>
                  {expanded === f._id && (
                    <p className="text-sm mt-2 p-3 rounded-lg whitespace-pre-wrap"
                      style={{ background: 'rgba(255,255,255,0.03)', color: '#94a3b8' }}>
                      {f.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setExpanded(expanded === f._id ? null : f._id)}
                    className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                    style={{ color: '#475569' }}>
                    <Eye size={14} />
                  </button>
                  <select
                    value={f.status}
                    onChange={e => updateFRStatus(f._id, e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border"
                    style={{ background: '#0d0d1a', border: '1px solid #1a1a2e', color: '#94a3b8' }}>
                    {FR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
