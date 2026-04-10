import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Shown after clicking the link in the email: /verify-email/:token
function VerifyingToken({ token }) {
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(res => {
        updateUser(res.data.user);
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2500);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [token]);

  return (
    <div className="text-center">
      {status === 'verifying' && (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <Loader2 size={28} className="animate-spin" style={{ color: '#a855f7' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Verifying your email…</h2>
          <p className="text-sm" style={{ color: '#475569' }}>Just a moment</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <CheckCircle2 size={30} style={{ color: '#10b981' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Email verified!</h2>
          <p className="text-sm mb-5" style={{ color: '#475569' }}>Redirecting you to your dashboard…</p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
            Go to Dashboard →
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <XCircle size={30} style={{ color: '#f87171' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Link expired or invalid</h2>
          <p className="text-sm mb-5" style={{ color: '#475569' }}>{message}</p>
          <Link to="/verify-email" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
            Request a new link
          </Link>
        </>
      )}
    </div>
  );
}

// Shown after registration: /verify-email (no token)
function CheckInbox() {
  const { user } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (!user?.email) return;
    setError('');
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      setSent(true);
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend. Please try again.');
    }
  };

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.12),rgba(168,85,247,0.12))', border: '1px solid rgba(168,85,247,0.25)' }}>
        <Mail size={28} style={{ color: '#a855f7' }} />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
      <p className="text-sm mb-1" style={{ color: '#475569' }}>
        We sent a verification link to
      </p>
      {user?.email && (
        <p className="font-semibold text-sm mb-5" style={{ color: '#f97316' }}>{user.email}</p>
      )}
      <p className="text-sm mb-7 max-w-sm mx-auto" style={{ color: '#334155' }}>
        Click the link in the email to verify your account. The link expires in 24 hours.
      </p>

      {sent && (
        <div className="mb-4 p-3 rounded-xl text-sm"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
          New verification email sent!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleResend}
        disabled={cooldown > 0}
        className="flex items-center gap-2 mx-auto text-sm px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: '#12121f', border: '1px solid #1a1a2e', color: '#94a3b8' }}>
        <RefreshCw size={14} className={cooldown > 0 ? '' : 'group-hover:rotate-180 transition-transform'} />
        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
      </button>

      <p className="mt-8 text-xs" style={{ color: '#334155' }}>
        Wrong account?{' '}
        <Link to="/login" className="underline" style={{ color: '#475569' }}>Sign in with a different email</Link>
      </p>
    </div>
  );
}

export default function VerifyEmail() {
  const { token } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#07070f' }}>
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(168,85,247,0.07)' }} />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.07)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
              <span className="text-white text-lg">🎯</span>
            </div>
            <span className="font-bold text-xl text-white">HuntIQ</span>
          </Link>
        </div>

        <div className="card-gradient p-8">
          {token ? <VerifyingToken token={token} /> : <CheckInbox />}
        </div>
      </div>
    </div>
  );
}
