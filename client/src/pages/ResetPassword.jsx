import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import api from '../utils/api';

function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains a number',     pass: /\d/.test(password) },
    { label: 'Contains a letter',     pass: /[a-zA-Z]/.test(password) },
  ];

  const score = checks.filter(c => c.pass).length;
  const colors = ['#ef4444', '#f97316', '#10b981'];
  const labels = ['Weak', 'Fair', 'Strong'];

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i < score ? colors[score - 1] : '#1a1a2e' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(c => (
            <span key={c.label} className="text-[11px] flex items-center gap-1"
              style={{ color: c.pass ? '#10b981' : '#334155' }}>
              {c.pass ? '✓' : '·'} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className="text-[11px] font-semibold" style={{ color: colors[score - 1] }}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const { token }                 = useParams();
  const navigate                  = useNavigate();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (password !== confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#07070f' }}>
      {/* Background glows */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(168,85,247,0.06)' }} />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.06)' }} />

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
          <h1 className="text-3xl font-bold text-white mb-2">Set new password</h1>
          <p className="text-sm" style={{ color: '#475569' }}>
            Choose a strong password for your account
          </p>
        </div>

        <div className="card-gradient p-8">
          {!done ? (
            <>
              {error && (
                <div className="flex items-center gap-2 rounded-xl p-3 mb-5 text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Min 6 characters"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#2e2e52' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConf ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className="input pr-10"
                      placeholder="Repeat your password"
                    />
                    <button type="button" onClick={() => setShowConf(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#2e2e52' }}>
                      {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirm && (
                    <p className="text-[11px] mt-1.5 flex items-center gap-1"
                      style={{ color: password === confirm ? '#10b981' : '#f87171' }}>
                      {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Resetting...</>
                    : <><ShieldCheck size={16} /> Reset Password</>
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
              <h2 className="text-lg font-bold text-white mb-2">Password reset!</h2>
              <p className="text-sm mb-4" style={{ color: '#64748b' }}>
                Your password has been updated successfully.
                Redirecting you to sign in…
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm">
                Sign In Now
              </Link>
            </div>
          )}

          {!done && (
            <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: '#1a1a2e' }}>
              <Link to="/login"
                className="text-sm transition-colors"
                style={{ color: '#475569' }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
