import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

const SUBJECTS = [
  'General Inquiry',
  'Billing & Subscription',
  'Technical Issue',
  'Feature Question',
  'Partnership',
  'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/contact', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#07070f' }}>
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm mb-6" style={{ color: '#475569' }}>
            <ArrowLeft size={14} /> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
              <span className="text-white text-base">🎯</span>
            </div>
            <span className="font-bold text-white text-lg">HuntIQ</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Contact Us</h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>We typically respond within 24 hours.</p>
        </div>

        {success ? (
          <div className="card-gradient p-10 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle2 size={28} style={{ color: '#10b981' }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Message sent!</h2>
            <p className="text-sm mb-6" style={{ color: '#475569' }}>
              We've received your message and will get back to you soon.
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2 py-2.5 px-6">
              Back to home
            </Link>
          </div>
        ) : (
          <div className="card-gradient p-6">
            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Name</label>
                  <input
                    className="input w-full"
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Email</label>
                  <input
                    type="email"
                    className="input w-full"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Subject</label>
                <select
                  className="input w-full"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  required>
                  <option value="">Select a subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Message</label>
                <textarea
                  className="input w-full resize-none"
                  rows={5}
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                <Send size={15} />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
