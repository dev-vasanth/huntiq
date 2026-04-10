import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight, AlertCircle, Shield, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const PLANS = {
  starter: {
    name: 'Starter',
    price: 19,
    description: 'For solopreneurs & freelancers',
    color: '#64748b',
    features: [
      '5 keywords monitored',
      '500 leads / month',
      '50 AI reply drafts / month (copy & paste)',
      '1 campaign',
      'Intent scoring & alerts',
      'Competitor tracking',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    description: 'For serious lead generation',
    color: '#a855f7',
    features: [
      '25 keywords monitored',
      '2,000 leads / month',
      '500 AI reply drafts / month',
      '10 campaigns',
      'Post & DM directly from HuntIQ',
      'Daily email digest',
      'Full analytics + priority support',
    ],
  },
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();

  const planKey = searchParams.get('plan') || 'starter';
  const canceled = searchParams.get('canceled') === '1';
  const plan    = PLANS[planKey] || PLANS.starter;

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(canceled ? 'Checkout was canceled. You can try again whenever you\'re ready.' : '');

  // If not logged in, redirect to register with plan param
  useEffect(() => {
    if (!user) navigate(`/register?plan=${planKey}`);
  }, [user]);

  const handleCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/billing/checkout', { plan: planKey });
      window.location.href = res.data.url; // redirect to Stripe Checkout
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  if (!user) return null;

  const isPro = planKey === 'pro';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#07070f' }}>
      {/* Background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(168,85,247,0.06)' }} />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.06)' }} />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
              <span className="text-white">🎯</span>
            </div>
            <span className="font-bold text-lg text-white">HuntIQ</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Start your 7-day free trial</h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>No charge until your trial ends</p>
        </div>

        {/* Plan card */}
        <div className={`rounded-2xl overflow-hidden mb-5`}
          style={{
            background: isPro ? 'linear-gradient(145deg, #150f1e, #0f0a16)' : '#12121f',
            border: `1px solid ${isPro ? 'rgba(168,85,247,0.35)' : '#1a1a2e'}`,
          }}>
          {isPro && (
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #f97316, #a855f7)' }} />
          )}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-white">{plan.name} Plan</span>
                  {isPro && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: '#475569' }}>{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">${plan.price}</div>
                <div className="text-xs" style={{ color: '#475569' }}>/month</div>
              </div>
            </div>

            <ul className="space-y-2.5">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#94a3b8' }}>
                  <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trial timeline */}
        <div className="rounded-xl p-4 mb-5 flex items-start gap-3"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'rgba(16,185,129,0.2)' }}>
            <CheckCircle size={12} className="text-emerald-400" />
          </div>
          <div className="text-sm" style={{ color: '#94a3b8' }}>
            <span className="font-semibold text-white">7 days free</span> — full access, no charge.
            After your trial, you'll be billed <span className="text-white font-semibold">${plan.price}/month</span>.
            Cancel anytime before day 7 and you won't be charged.
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl p-3 mb-4 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mb-4">
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> Redirecting to Stripe...</>
            : <><ArrowRight size={18} /> Start Free Trial — ${plan.price}/mo after 7 days</>
          }
        </button>

        {/* Want to switch plan? */}
        <div className="flex items-center justify-center gap-4 text-sm" style={{ color: '#334155' }}>
          {planKey === 'starter'
            ? <Link to="/checkout?plan=pro" className="hover:text-purple-400 transition-colors">Switch to Pro ($49/mo) →</Link>
            : <Link to="/checkout?plan=starter" className="hover:text-slate-300 transition-colors">Switch to Starter ($19/mo) →</Link>
          }
          <span>·</span>
          <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Skip for now</Link>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { icon: Shield, text: 'Secured by Stripe' },
            { icon: X, text: 'Cancel anytime' },
            { icon: CheckCircle, text: '7-day free trial' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: '#2e2e52' }}>
              <Icon size={12} />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
