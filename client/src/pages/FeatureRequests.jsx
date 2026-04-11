import { useState } from 'react';
import { Lightbulb, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const CATEGORIES = [
  { value: 'feature', label: '✨ New Feature', desc: 'Something new you want added' },
  { value: 'ui', label: '🎨 UI/UX', desc: 'Design or usability improvements' },
  { value: 'integration', label: '🔗 Integration', desc: 'Connect with other tools' },
  { value: 'bug', label: '🐛 Bug Report', desc: 'Something not working right' },
  { value: 'other', label: '💬 Other', desc: 'Anything else' },
];

export default function FeatureRequests() {
  const [form, setForm] = useState({ title: '', description: '', category: 'feature' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/feature-requests', form);
      setSuccess(true);
      setForm({ title: '', description: '', category: 'feature' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <Lightbulb size={18} style={{ color: '#f97316' }} />
          </div>
          <h1 className="text-2xl font-bold text-white">Feature Requests</h1>
        </div>
        <p className="text-sm" style={{ color: '#475569' }}>
          Have an idea to make HuntIQ better? We'd love to hear it — every request is reviewed by our team.
        </p>
      </div>

      {success && (
        <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle2 size={18} style={{ color: '#10b981' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#10b981' }}>Request submitted!</p>
            <p className="text-xs" style={{ color: '#475569' }}>Thanks for helping us improve HuntIQ.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={18} style={{ color: '#f87171' }} />
          <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
        </div>
      )}

      <div className="card-gradient p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>Category</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, category: cat.value }))}
                  className="p-3 rounded-xl text-left transition-all"
                  style={form.category === cat.value
                    ? { background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }
                    : { background: '#0d0d1a', border: '1px solid #1a1a2e', color: '#475569' }}>
                  <div className="text-xs font-semibold">{cat.label}</div>
                  <div className="text-xs opacity-60 mt-0.5">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              Title <span style={{ color: '#334155' }}>(short summary)</span>
            </label>
            <input
              className="input w-full"
              placeholder='e.g. "Export leads to Google Sheets"'
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              Description <span style={{ color: '#334155' }}>(more detail helps us build it faster)</span>
            </label>
            <textarea
              className="input w-full resize-none"
              rows={5}
              placeholder="Describe what you'd like and why it would be useful..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <Send size={15} />
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
