import { useState } from 'react';
import { X, ArrowRight, CheckCircle2, Loader2, Radar, Tag, Crosshair, Zap } from 'lucide-react';
import api from '../utils/api';

const POPULAR_SUBREDDITS = [
  'entrepreneur', 'startups', 'SaaS', 'smallbusiness', 'marketing',
  'webdev', 'digitalnomad', 'ecommerce', 'growmybusiness', 'indiehackers',
];

function StepIndicator({ current }) {
  const steps = ['Add Keyword', 'Keyword Type', 'First Scan'];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={idx} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                style={done
                  ? { background: '#10b981', color: 'white' }
                  : active
                    ? { background: 'linear-gradient(135deg,#f97316,#a855f7)', color: 'white' }
                    : { background: '#1a1a2e', color: '#475569', border: '1px solid #242440' }}>
                {done ? <CheckCircle2 size={14} /> : idx}
              </div>
              <span className="text-xs font-medium truncate hidden sm:block"
                style={{ color: active ? '#f1f5f9' : done ? '#10b981' : '#475569' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2" style={{ background: done ? '#10b981' : '#1a1a2e' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Step 1: Keyword + subreddits
function Step1({ data, onChange }) {
  const [subInput, setSubInput] = useState('');

  const addSub = (s) => {
    const clean = s.trim().replace(/^r\//, '');
    if (clean && !data.subreddits.includes(clean)) {
      onChange({ subreddits: [...data.subreddits, clean] });
    }
    setSubInput('');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(168,85,247,0.15))', border: '1px solid rgba(168,85,247,0.2)' }}>
          <Tag size={20} style={{ color: '#a855f7' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">What do you want to monitor?</h2>
          <p className="text-sm" style={{ color: '#475569' }}>Enter a keyword or phrase people might use on Reddit</p>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>Keyword or phrase</label>
        <input
          value={data.keyword}
          onChange={e => onChange({ keyword: e.target.value })}
          className="input w-full text-base"
          placeholder='e.g. "CRM software", "email marketing tool"'
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>
          Target subreddits <span style={{ color: '#334155' }}>(optional — leave empty to scan all of Reddit)</span>
        </label>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#475569' }}>r/</span>
            <input
              value={subInput}
              onChange={e => setSubInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSub(subInput); } }}
              className="input w-full pl-7 text-sm"
              placeholder="subredditname"
            />
          </div>
          <button type="button" onClick={() => addSub(subInput)} className="btn-secondary text-sm px-3">Add</button>
        </div>

        {data.subreddits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {data.subreddits.map(s => (
              <span key={s} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                r/{s}
                <button type="button" onClick={() => onChange({ subreddits: data.subreddits.filter(x => x !== s) })}
                  className="ml-0.5 opacity-60 hover:opacity-100">×</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SUBREDDITS.map(s => (
            <button key={s} type="button"
              onClick={() => !data.subreddits.includes(s) && onChange({ subreddits: [...data.subreddits, s] })}
              className="text-xs px-2.5 py-1 rounded-full border transition-all"
              style={data.subreddits.includes(s)
                ? { background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }
                : { background: '#0d0d1a', color: '#475569', border: '1px solid #1a1a2e' }}>
              r/{s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 2: keyword type
function Step2({ data, onChange }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(168,85,247,0.15))', border: '1px solid rgba(168,85,247,0.2)' }}>
          <Crosshair size={20} style={{ color: '#f97316' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">What type of keyword is this?</h2>
          <p className="text-sm" style={{ color: '#475569' }}>This helps HuntIQ tag and filter leads correctly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[
          {
            value: 'own',
            icon: '🏷️',
            label: 'My Brand / Product',
            desc: 'Track when people mention your product, brand, or service. Great for support and reputation monitoring.',
            activeStyle: { background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc' },
          },
          {
            value: 'competitor',
            icon: '🎯',
            label: 'Competitor',
            desc: "Monitor a competitor's name or product. Leads appear as competitor opportunities you can engage with.",
            activeStyle: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' },
          },
        ].map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ type: opt.value })}
            className="p-4 rounded-2xl text-left transition-all"
            style={data.type === opt.value
              ? opt.activeStyle
              : { background: '#0d0d1a', border: '1px solid #1a1a2e', color: '#475569' }}>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-xl">{opt.icon}</span>
              <span className="font-semibold text-white text-sm">{opt.label}</span>
              {data.type === opt.value && (
                <CheckCircle2 size={15} className="ml-auto" style={{ color: opt.value === 'competitor' ? '#f87171' : '#c084fc' }} />
              )}
            </div>
            <p className="text-xs leading-relaxed ml-9" style={{ color: '#64748b' }}>{opt.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-5 p-3 rounded-xl text-xs" style={{ background: '#0d0d1a', border: '1px solid #1a1a2e', color: '#475569' }}>
        💡 You can change this any time from the Keywords page.
      </div>
    </div>
  );
}

// Step 3: scan + results
function Step3({ keyword, scanResult, scanning }) {
  return (
    <div className="text-center py-4">
      <div className="flex items-center gap-3 mb-8 text-left">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,182,212,0.15))', border: '1px solid rgba(16,185,129,0.2)' }}>
          <Zap size={20} style={{ color: '#10b981' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Running your first scan</h2>
          <p className="text-sm" style={{ color: '#475569' }}>Searching Reddit for "{keyword}"…</p>
        </div>
      </div>

      {scanning ? (
        <div className="py-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.1),rgba(168,85,247,0.1))', border: '1px solid rgba(168,85,247,0.2)' }}>
            <Radar size={26} className="animate-pulse" style={{ color: '#a855f7' }} />
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
            <Loader2 size={14} className="animate-spin" />
            Scanning Reddit…
          </div>
          <p className="text-xs" style={{ color: '#334155' }}>This usually takes 5–15 seconds</p>
        </div>
      ) : scanResult ? (
        <div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <CheckCircle2 size={30} style={{ color: '#10b981' }} />
          </div>
          <p className="text-white font-bold text-xl mb-1">
            {scanResult.count > 0 ? `${scanResult.count} lead${scanResult.count !== 1 ? 's' : ''} found!` : 'Scan complete!'}
          </p>
          <p className="text-sm mb-6" style={{ color: '#475569' }}>
            {scanResult.count > 0
              ? 'HuntIQ will keep scanning every 15 minutes automatically.'
              : 'No leads right now — HuntIQ will keep scanning automatically every 15 minutes.'}
          </p>
          <div className="grid grid-cols-3 gap-3 text-left">
            {[
              { label: 'Auto-scans', value: 'Every 15min', color: '#a855f7' },
              { label: 'Leads found', value: scanResult.count, color: '#10b981' },
              { label: 'Status', value: 'Active', color: '#06b6d4' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-xl text-center"
                style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>
                <div className="text-lg font-bold" style={{ color }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ keyword: '', subreddits: [], type: 'own' });
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (partial) => setData(prev => ({ ...prev, ...partial }));

  const handleSkip = () => {
    localStorage.setItem('huntiq_onboarded', '1');
    onComplete();
  };

  const handleNext = async () => {
    setError('');

    if (step === 1) {
      if (!data.keyword.trim()) { setError('Please enter a keyword to monitor.'); return; }
      setStep(2);
    } else if (step === 2) {
      // Save keyword then move to step 3 and scan
      setSaving(true);
      try {
        await api.post('/keywords', {
          keyword: data.keyword.trim(),
          subreddits: data.subreddits,
          type: data.type,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to save keyword.');
        setSaving(false);
        return;
      }
      setSaving(false);
      setStep(3);
      // Auto-run scan
      setScanning(true);
      try {
        const res = await api.post('/leads/scan');
        setScanResult({ count: res.data.count ?? 0, message: res.data.message });
      } catch {
        setScanResult({ count: 0, message: 'Scan complete.' });
      } finally {
        setScanning(false);
      }
    } else if (step === 3) {
      localStorage.setItem('huntiq_onboarded', '1');
      onComplete();
    }
  };

  const canNext = step === 1 ? data.keyword.trim().length > 0 : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,7,15,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}>

        {/* Top bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg,#f97316,#a855f7)' }} />

        <div className="p-6 sm:p-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="font-bold text-white text-sm">HuntIQ Setup</span>
            </div>
            <button onClick={handleSkip}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#475569', background: '#12121f', border: '1px solid #1a1a2e' }}>
              <X size={12} /> Skip setup
            </button>
          </div>

          <StepIndicator current={step} />

          {/* Step content */}
          {step === 1 && <Step1 data={data} onChange={update} />}
          {step === 2 && <Step2 data={data} onChange={update} />}
          {step === 3 && <Step3 keyword={data.keyword} scanResult={scanResult} scanning={scanning} />}

          {error && (
            <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-7 pt-5" style={{ borderTop: '1px solid #1a1a2e' }}>
            <span className="text-xs" style={{ color: '#334155' }}>Step {step} of 3</span>
            <button
              onClick={handleNext}
              disabled={!canNext || scanning || saving}
              className="btn-primary flex items-center gap-2 py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> :
               scanning ? <><Loader2 size={14} className="animate-spin" /> Scanning…</> :
               step === 3 ? (scanResult ? 'Go to Dashboard →' : 'Skip') :
               <>{step === 2 ? 'Save & Scan' : 'Next'} <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
