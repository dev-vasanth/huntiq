import { Link } from 'react-router-dom';
import { Zap, Mail, BarChart2, MessageSquare, Search, CheckCircle, ArrowRight, Star, Megaphone, TrendingUp } from 'lucide-react';

const FEATURES = [
  { icon: Search, title: 'Multi-Platform Monitoring', desc: 'Track any keyword across Reddit and Hacker News. More sources coming — one place to catch every buyer signal.', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  { icon: Zap, title: 'AI Intent Scoring', desc: 'Every lead scored 0–100 based on signals, engagement, and recency. Focus only on your hottest opportunities.', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { icon: MessageSquare, title: 'AI Reply Drafter', desc: 'Powered by Claude AI. Generate authentic, context-aware replies in any tone — professional, friendly, or direct.', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { icon: Megaphone, title: 'Campaigns', desc: 'Group keywords into campaigns with goals. Track performance per campaign and know exactly what drives results.', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { icon: Mail, title: 'Daily Digest Email', desc: 'A beautifully formatted email every morning with your top leads, AI-generated summary, and key insights.', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Track lead volume, keyword performance, source breakdown, and sentiment trends over time.', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Add Keywords', desc: 'Enter keywords that signal purchase intent for your product. Organize them into campaigns.', icon: Search },
  { step: '02', title: 'We Scan Everywhere', desc: 'HuntIQ scans Reddit & Hacker News continuously, AI-scoring every matching post for buying intent.', icon: TrendingUp },
  { step: '03', title: 'Review Leads', desc: 'Browse intent-scored leads from all sources, filter by score or platform, spot the hottest opportunities first.', icon: TrendingUp },
  { step: '04', title: 'Draft & Reply', desc: 'Use AI to craft authentic replies or write your own. Track what converts and replicate it.', icon: MessageSquare },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'SaaS Founder', text: 'Found 3 enterprise clients in the first week just by monitoring the right subreddits. HuntIQ is a cheat code.', stars: 5 },
  { name: 'Marcus T.', role: 'Growth Lead', text: 'The AI reply drafter saves me 2+ hours every day. The replies feel completely human and authentic.', stars: 5 },
  { name: 'Priya M.', role: 'Indie Hacker', text: 'Finally a tool that understands Reddit culture. The intent scoring is incredibly accurate.', stars: 5 },
];

const STATS = [
  { value: '50K+', label: 'Leads Discovered' },
  { value: '3.2x', label: 'Higher Reply Rate' },
  { value: '2+', label: 'Platforms Monitored' },
  { value: '94%', label: 'Intent Accuracy' },
];

export default function Landing() {
  return (
    <div className="min-h-screen text-slate-100 overflow-hidden" style={{ background: '#07070f' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(7,7,15,0.85)', borderColor: '#1a1a2e', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
              <span className="text-white text-sm">🎯</span>
            </div>
            <span className="font-bold text-lg text-white">HuntIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm transition-colors" style={{ color: '#475569' }}
              onMouseEnter={e => e.target.style.color='#f1f5f9'} onMouseLeave={e => e.target.style.color='#475569'}>Features</a>
            <a href="#how-it-works" className="text-sm transition-colors" style={{ color: '#475569' }}
              onMouseEnter={e => e.target.style.color='#f1f5f9'} onMouseLeave={e => e.target.style.color='#475569'}>How it works</a>
            <a href="#pricing" className="text-sm transition-colors" style={{ color: '#475569' }}
              onMouseEnter={e => e.target.style.color='#f1f5f9'} onMouseLeave={e => e.target.style.color='#475569'}>Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium transition-colors" style={{ color: '#94a3b8' }}>Log in</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-28 px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-32 left-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(249,115,22,0.08)' }} />
        <div className="absolute top-32 right-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(168,85,247,0.08)' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8 border"
            style={{ background: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
            <Zap size={13} />
            <span>AI-Powered Multi-Platform Lead Intelligence</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Find customers{' '}
            <span className="text-gradient">actively searching</span>
            <br />for what you sell
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
            HuntIQ scans Reddit, Hacker News, and more — 24/7 — for people actively seeking solutions like yours.
            Score their intent, draft AI replies, and convert conversations into customers.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-7 py-3.5 glow-brand">
              Start 7-Day Free Trial
              <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-7 py-3.5">
              Sign In
            </Link>
          </div>

          {/* Trust */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: '#334155' }}>
            {['No credit card required', 'Setup in 2 minutes', 'Cancel anytime'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-emerald-500" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* UI Mockup */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-2xl blur-3xl pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(168,85,247,0.12))', transform: 'scale(0.95)', zIndex: 0 }} />
          <div className="relative z-10 rounded-2xl overflow-hidden border"
            style={{ background: '#0d0d1a', borderColor: 'rgba(168,85,247,0.2)', boxShadow: '0 25px 80px rgba(0,0,0,0.7)' }}>
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: '#0a0a12', borderColor: '#1a1a2e' }}>
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <div className="flex-1 mx-4 h-6 rounded-lg flex items-center px-3" style={{ background: '#1a1a2e' }}>
                <span className="text-xs" style={{ color: '#2e2e52' }}>app.huntiq.io/leads</span>
              </div>
            </div>
            {/* App content */}
            <div className="p-5">
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[['142', 'Total Leads', '#f97316'], ['38', 'High Intent', '#a855f7'], ['67%', 'Reply Rate', '#06b6d4'], ['84', 'Avg Score', '#10b981']].map(([v, l, c]) => (
                  <div key={l} className="rounded-xl p-3 text-center" style={{ background: '#12121f', border: '1px solid #1a1a2e' }}>
                    <div className="text-2xl font-bold" style={{ color: c }}>{v}</div>
                    <div className="text-xs mt-1" style={{ color: '#334155' }}>{l}</div>
                  </div>
                ))}
              </div>
              {/* Lead rows */}
              <div className="space-y-2">
                {[
                  { score: 94, color: '#10b981', bg: 'rgba(16,185,129,0.12)', sub: 'r/entrepreneur', subColor: '#a855f7', tag: 'High Intent', tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', title: 'Looking for a Reddit monitoring tool — any recommendations?' },
                  { score: 91, color: '#10b981', bg: 'rgba(16,185,129,0.12)', sub: 'Ask HN', subColor: '#ff6600', tag: 'High Intent', tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', title: 'Ask HN: What do you use to find customers on Reddit or forums?' },
                  { score: 78, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', sub: 'r/SaaS', subColor: '#a855f7', tag: 'Medium Intent', tagColor: '#a855f7', tagBg: 'rgba(168,85,247,0.1)', title: 'Switching from F5Bot — need something smarter with intent scoring' },
                ].map((lead, i) => (
                  <div key={i} className="rounded-xl p-3.5 flex items-center gap-3"
                    style={{ background: '#12121f', border: '1px solid #1a1a2e' }}>
                    <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                      style={{ background: lead.bg, color: lead.color }}>
                      {lead.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs mb-0.5 font-semibold" style={{ color: lead.subColor }}>{lead.sub}</div>
                      <div className="text-sm text-slate-300 truncate">{lead.title}</div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: lead.tagBg, color: lead.tagColor, border: `1px solid ${lead.tagColor}33` }}>
                      {lead.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y py-12 px-6" style={{ borderColor: '#1a1a2e', background: '#0a0a12' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-black text-gradient mb-1">{value}</div>
              <div className="text-sm" style={{ color: '#475569' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#f97316' }}>How it works</p>
            <h2 className="text-4xl font-bold mb-4">From setup to first lead in 5 minutes</h2>
            <p style={{ color: '#475569' }}>Everything automated — you just show up and reply.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #f97316, #a855f7, transparent)' }} />
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 relative z-10"
                  style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <item.icon size={22} style={{ color: i % 2 === 0 ? '#f97316' : '#a855f7' }} />
                  <span className="text-xs font-bold mt-1" style={{ color: '#334155' }}>{item.step}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6" style={{ background: '#0a0a12' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#a855f7' }}>Features</p>
            <h2 className="text-4xl font-bold mb-4">Everything you need to find and convert high-intent leads</h2>
            <p className="max-w-xl mx-auto" style={{ color: '#475569' }}>
              A complete toolkit for discovering, qualifying, and engaging with buyers across Reddit, Hacker News, and beyond.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="card-gradient p-6 group hover:scale-[1.02] transition-transform duration-200 cursor-default">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.bg }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">Loved by founders & growth teams</h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#f59e0b" style={{ color: '#f59e0b' }} />)}
              <span className="ml-2 text-sm" style={{ color: '#475569' }}>4.9 / 5 from 150+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card-gradient p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />)}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#94a3b8' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">{t.name}</div>
                    <div className="text-xs" style={{ color: '#334155' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6" style={{ background: '#0a0a12' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#f97316' }}>Pricing</p>
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p style={{ color: '#475569' }}>7-day free trial on every plan. No credit card surprises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="card-gradient p-8 flex flex-col">
              <div className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#475569' }}>Starter</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-black text-white">$19</span>
                <span className="text-sm mb-2" style={{ color: '#475569' }}>/month</span>
              </div>
              <p className="text-sm mb-2" style={{ color: '#334155' }}>For solopreneurs & freelancers</p>
              <div className="text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-7 self-start"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                ✦ 7-day free trial
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '5 keywords monitored',
                  '500 leads / month',
                  '50 AI reply drafts / month (copy & paste)',
                  '1 campaign',
                  'Intent scoring & alerts',
                  'Competitor tracking',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#94a3b8' }}>
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register?plan=starter" className="btn-secondary w-full text-center block py-3">
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="relative p-8 rounded-2xl overflow-hidden flex flex-col"
              style={{ background: 'linear-gradient(145deg, #150f1e, #0f0a16)', border: '1px solid rgba(168,85,247,0.4)' }}>
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: 'linear-gradient(90deg, #f97316, #a855f7)' }} />
              <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>
                Most Popular
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider mb-3 text-gradient">Pro</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-black text-white">$29</span>
                <span className="text-sm mb-2" style={{ color: '#475569' }}>/month</span>
                <span className="text-sm mb-2 ml-1 line-through" style={{ color: '#334155' }}>$49</span>
              </div>
              <p className="text-sm mb-2" style={{ color: '#334155' }}>For serious lead generation</p>
              <div className="flex flex-wrap gap-2 mb-7">
                <div className="text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                  ✦ 7-day free trial
                </div>
                <div className="text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
                  style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}>
                  🚀 Launch price · First 50 users
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '25 keywords monitored',
                  '2,000 leads / month',
                  '500 AI reply drafts / month',
                  '10 campaigns',
                  'Post & DM directly from HuntIQ',
                  'Daily email digest',
                  'Full analytics',
                  'Priority support',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#94a3b8' }}>
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register?plan=pro" className="btn-primary w-full text-center block py-3 glow-brand">
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Trust line */}
          <p className="text-center text-sm mt-10" style={{ color: '#334155' }}>
            Credit card required to start trial · Auto-charges after 7 days · Cancel anytime before trial ends
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-black mb-5">Start finding leads <span className="text-gradient">today</span></h2>
          <p className="text-lg mb-10" style={{ color: '#475569' }}>
            Join hundreds of founders who use HuntIQ to turn online conversations into customers — across Reddit, Hacker News, and more.
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-9 py-4 glow-brand">
            Get Started Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-6" style={{ borderColor: '#1a1a2e', background: '#0a0a12' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
              <span className="text-white text-xs">🎯</span>
            </div>
            <span className="font-bold text-sm text-white">HuntIQ</span>
          </div>
          <p className="text-sm" style={{ color: '#1a1a2e' }}>© 2025 HuntIQ. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="text-sm transition-colors" style={{ color: '#334155' }}>Privacy</Link>
            <Link to="/terms" className="text-sm transition-colors" style={{ color: '#334155' }}>Terms</Link>
            <Link to="/contact" className="text-sm transition-colors" style={{ color: '#334155' }}>Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
