import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ background: '#07070f' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(7,7,15,0.9)', borderColor: '#1a1a2e', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
              <span className="text-white text-xs">🎯</span>
            </div>
            <span className="font-bold text-white">HuntIQ</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: '#475569' }}>
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs mb-5 border"
            style={{ background: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
            Legal
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Privacy Policy</h1>
          <p style={{ color: '#475569' }}>Last updated: April 9, 2025</p>
        </div>

        <div className="p-6 rounded-2xl mb-10 text-sm leading-relaxed"
          style={{ background: '#0d0d1a', border: '1px solid #1a1a2e', color: '#64748b' }}>
          This Privacy Policy explains how HuntIQ ("we", "us", or "our") collects, uses, and protects your information when you use our service at <strong style={{ color: '#94a3b8' }}>huntiq.io</strong>. By using HuntIQ, you agree to the terms in this policy.
        </div>

        <Section title="1. Information We Collect">
          <p><strong style={{ color: '#e2e8f0' }}>Account information:</strong> When you register, we collect your name, email address, and password (hashed and salted — never stored in plain text).</p>
          <p><strong style={{ color: '#e2e8f0' }}>Payment information:</strong> We use Stripe to process payments. We never store your credit card number or payment details on our servers. Stripe's privacy policy applies to payment data.</p>
          <p><strong style={{ color: '#e2e8f0' }}>Usage data:</strong> We collect information about how you use HuntIQ — features accessed, keywords monitored, leads viewed, and replies sent — to improve the service and enforce plan limits.</p>
          <p><strong style={{ color: '#e2e8f0' }}>Reddit OAuth data:</strong> If you connect your Reddit account, we store your Reddit username and access tokens (encrypted) to post comments and send messages on your behalf. We only request permissions you explicitly grant.</p>
          <p><strong style={{ color: '#e2e8f0' }}>Reddit content:</strong> We scan publicly available Reddit posts and comments matching your keywords. This data is stored to power your lead feed.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Provide, operate, and improve HuntIQ</li>
            <li>Send transactional emails (verification, password reset, billing receipts, daily digests, lead alerts)</li>
            <li>Process payments and manage subscriptions via Stripe</li>
            <li>Enforce plan limits and monitor usage</li>
            <li>Respond to support inquiries</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-3">We do <strong style={{ color: '#e2e8f0' }}>not</strong> sell your personal data to third parties. We do not use your data for advertising.</p>
        </Section>

        <Section title="3. Data Storage and Security">
          <p>Your data is stored on MongoDB Atlas (cloud database) and processed on Railway (cloud server). Both providers operate with industry-standard security practices.</p>
          <p>Passwords are hashed using bcrypt with a salt factor of 12. Password reset and email verification tokens are SHA-256 hashed before storage. Reddit access tokens are stored encrypted.</p>
          <p>While we implement reasonable security measures, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
        </Section>

        <Section title="4. Third-Party Services">
          <p>HuntIQ integrates with the following third-party services, each governed by their own privacy policies:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong style={{ color: '#e2e8f0' }}>Stripe</strong> — Payment processing</li>
            <li><strong style={{ color: '#e2e8f0' }}>Resend</strong> — Transactional email delivery</li>
            <li><strong style={{ color: '#e2e8f0' }}>Reddit API</strong> — Scanning public posts and OAuth authentication</li>
            <li><strong style={{ color: '#e2e8f0' }}>Anthropic Claude</strong> — AI reply generation (post content may be sent to Anthropic's API)</li>
            <li><strong style={{ color: '#e2e8f0' }}>MongoDB Atlas</strong> — Database hosting</li>
            <li><strong style={{ color: '#e2e8f0' }}>Railway</strong> — Backend hosting</li>
            <li><strong style={{ color: '#e2e8f0' }}>Vercel</strong> — Frontend hosting</li>
          </ul>
        </Section>

        <Section title="5. Email Communications">
          <p>By registering, you agree to receive transactional emails necessary to operate the service (account verification, password reset, billing). These cannot be opted out of while you have an active account.</p>
          <p>Optional emails (daily digest, lead alerts) can be disabled at any time from your Settings page.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>We retain your data for as long as your account is active. If you cancel and do not reactivate your account within 90 days, we may delete your data permanently.</p>
          <p>Reddit lead data is retained for up to 12 months. You can delete individual leads from your account at any time.</p>
        </Section>

        <Section title="7. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Disconnect your Reddit account at any time from Settings</li>
            <li>Export your lead data (CSV export feature)</li>
          </ul>
          <p className="mt-3">To exercise these rights, contact us at <strong style={{ color: '#f97316' }}>privacy@huntiq.io</strong>.</p>
        </Section>

        <Section title="8. Cookies">
          <p>HuntIQ uses browser localStorage to store your session token and user preferences. We do not use tracking cookies or third-party analytics cookies.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>HuntIQ is not intended for users under the age of 16. We do not knowingly collect personal information from children. If you believe a child has created an account, contact us immediately.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform. Continued use of HuntIQ after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="11. Contact Us">
          <p>If you have questions about this Privacy Policy, please contact us:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Email: <strong style={{ color: '#f97316' }}>privacy@huntiq.io</strong></li>
            <li>Website: <strong style={{ color: '#94a3b8' }}>huntiq.io</strong></li>
          </ul>
        </Section>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-6" style={{ borderColor: '#1a1a2e', background: '#0a0a12' }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#334155' }}>© 2025 HuntIQ. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="text-sm transition-colors" style={{ color: '#475569' }}>Privacy Policy</Link>
            <Link to="/terms" className="text-sm transition-colors" style={{ color: '#475569' }}>Terms of Service</Link>
            <Link to="/" className="text-sm transition-colors" style={{ color: '#475569' }}>Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
