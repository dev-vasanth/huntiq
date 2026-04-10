import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#07070f' }}>
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.06)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(168,85,247,0.06)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
              <span className="text-white text-lg">🎯</span>
            </div>
            <span className="font-bold text-xl text-white">HuntIQ</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
          <p className="text-sm" style={{ color: '#475569' }}>
            No worries — we'll send you a reset link
          </p>
        </div>

        <div className="card-gradient p-8">
          {!sent ? (
            <>
              {error && (
                <div className="flex items-center gap-2 rounded-xl p-3 mb-5 text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
                    : <><Mail size={16} /> Send Reset Link</>
                  }
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle size={28} style={{ color: '#10b981' }} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-sm mb-2" style={{ color: '#64748b' }}>
                If <strong style={{ color: '#94a3b8' }}>{email}</strong> is registered,
                you'll receive a reset link shortly.
              </p>
              <p className="text-xs mb-6" style={{ color: '#334155' }}>
                The link expires in <strong style={{ color: '#f97316' }}>1 hour</strong>.
                Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-sm transition-colors"
                style={{ color: '#475569' }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: '#1a1a2e' }}>
            <Link to="/login"
              className="inline-flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: '#475569' }}
              onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
