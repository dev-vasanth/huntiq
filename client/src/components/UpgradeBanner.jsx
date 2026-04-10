import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, X, ArrowRight } from 'lucide-react';

const MESSAGES = {
  keywords:  (plan) => `You've reached your ${plan === 'starter' ? '5' : '25'} keyword limit.`,
  campaigns: (plan) => `You've reached your ${plan === 'starter' ? '1' : '10'} campaign limit.`,
  replies:   (plan) => `You've used all your AI reply drafts this month.`,
  reddit:    ()     => `Reddit posting requires the Pro plan.`,
};

const UPGRADES = {
  starter: { to: 'pro',  label: 'Upgrade to Pro — $49/mo', plan: 'pro' },
};

export default function UpgradeBanner({ type = 'keywords', plan = 'starter', onDismiss }) {
  const navigate = useNavigate();
  const message  = MESSAGES[type]?.(plan) || 'You\'ve reached your plan limit.';
  const upgrade  = UPGRADES[plan];

  return (
    <div className="flex items-start gap-3 rounded-xl p-4 text-sm"
      style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(249,115,22,0.15)' }}>
        <Zap size={14} style={{ color: '#f97316' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white mb-0.5">{message}</p>
        {upgrade && (
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            Upgrade your plan to unlock more capacity and keep growing.
          </p>
        )}
        {upgrade && (
          <button
            onClick={() => navigate(`/checkout?plan=${upgrade.plan}`)}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(249,115,22,0.15)'}>
            <ArrowRight size={12} />
            {upgrade.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="transition-colors shrink-0"
          style={{ color: '#334155' }}
          onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.color = '#334155'}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}
