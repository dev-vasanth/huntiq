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

export default function TermsOfService() {
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
          <h1 className="text-4xl font-black text-white mb-3">Terms of Service</h1>
          <p style={{ color: '#475569' }}>Last updated: April 9, 2025</p>
        </div>

        <div className="p-6 rounded-2xl mb-10 text-sm leading-relaxed"
          style={{ background: '#0d0d1a', border: '1px solid #1a1a2e', color: '#64748b' }}>
          Please read these Terms of Service carefully before using HuntIQ. By accessing or using HuntIQ at <strong style={{ color: '#94a3b8' }}>huntiq.io</strong>, you agree to be bound by these terms. If you do not agree, do not use the service.
        </div>

        <Section title="1. Description of Service">
          <p>HuntIQ is a Reddit lead intelligence platform that monitors Reddit for posts matching user-defined keywords, scores them for purchase intent, and assists users in drafting and sending replies. The service is operated by HuntIQ ("we", "us", "our").</p>
        </Section>

        <Section title="2. Account Registration">
          <p>You must provide accurate and complete information when registering. You are responsible for maintaining the security of your account credentials.</p>
          <p>You must verify your email address to access the platform. One account per person is permitted. You may not share your account or credentials with others.</p>
          <p>You must be at least 16 years old to use HuntIQ. By registering, you confirm you meet this requirement.</p>
        </Section>

        <Section title="3. Free Trial and Billing">
          <p><strong style={{ color: '#e2e8f0' }}>Free Trial:</strong> New accounts receive a 7-day free trial with full access to your chosen plan's features. A valid payment method is required to start the trial.</p>
          <p><strong style={{ color: '#e2e8f0' }}>Auto-charge:</strong> After the trial ends, your payment method will be charged automatically at the plan rate ($19/month for Starter, $49/month for Pro) unless you cancel before the trial ends.</p>
          <p><strong style={{ color: '#e2e8f0' }}>Cancellation:</strong> You may cancel your subscription at any time from the Billing section in Settings. Cancellation takes effect at the end of the current billing period — you retain access until then.</p>
          <p><strong style={{ color: '#e2e8f0' }}>Refunds:</strong> We do not offer refunds for partial billing periods. If you believe you were charged in error, contact us within 7 days at <strong style={{ color: '#f97316' }}>billing@huntiq.io</strong>.</p>
          <p><strong style={{ color: '#e2e8f0' }}>Price changes:</strong> We reserve the right to change pricing. We will notify existing subscribers at least 30 days in advance of any price change.</p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree to use HuntIQ only for lawful purposes. You must not:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Spam, harass, or send unsolicited messages to Reddit users</li>
            <li>Use the platform to collect data about individuals without legitimate business purpose</li>
            <li>Violate Reddit's Terms of Service or API rules while using HuntIQ</li>
            <li>Attempt to reverse-engineer, scrape, or extract HuntIQ's proprietary data or algorithms</li>
            <li>Use multiple accounts to circumvent plan limits or trial restrictions</li>
            <li>Resell, sublicense, or otherwise distribute access to HuntIQ</li>
            <li>Use the service for any illegal activity</li>
          </ul>
          <p className="mt-3">We reserve the right to terminate accounts that violate these terms without notice or refund.</p>
        </Section>

        <Section title="5. Plan Limits">
          <p>Each plan includes defined limits on keywords, leads, AI replies, and campaigns (see the pricing page for details). These limits reset monthly. Exceeding a limit will prevent further usage of that feature until the next reset or an upgrade.</p>
          <p>We reserve the right to adjust plan limits with 30 days' notice to existing subscribers.</p>
        </Section>

        <Section title="6. Reddit Integration">
          <p>HuntIQ scans publicly available Reddit content via the Reddit API. By using HuntIQ, you acknowledge that Reddit content is governed by Reddit's terms and that HuntIQ does not control the availability or accuracy of that content.</p>
          <p>If you connect your Reddit account via OAuth, you authorise HuntIQ to post comments and send private messages on your behalf, solely as directed by you within the platform. You are solely responsible for all content posted or sent using your Reddit account.</p>
          <p>Misuse of Reddit's platform through HuntIQ (spamming, brigading, harassment) is a violation of these Terms and may result in immediate account termination.</p>
        </Section>

        <Section title="7. AI-Generated Content">
          <p>HuntIQ uses Anthropic's Claude AI to generate reply suggestions. AI-generated content is provided as a starting point — you are responsible for reviewing, editing, and approving any content before sending it.</p>
          <p>We make no warranties about the accuracy, appropriateness, or effectiveness of AI-generated suggestions. You assume full responsibility for any content you send.</p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>HuntIQ and its original content, features, and design are owned by HuntIQ and are protected by applicable intellectual property laws.</p>
          <p>You retain ownership of any content you create (keywords, reply drafts, campaign names). By using HuntIQ, you grant us a limited licence to process and display your content solely to provide the service.</p>
        </Section>

        <Section title="9. Disclaimers">
          <p>HuntIQ is provided "as is" without warranties of any kind. We do not warrant that the service will be uninterrupted, error-free, or that any particular leads will result in business outcomes.</p>
          <p>Reddit data is sourced from Reddit's public API. We cannot guarantee its completeness, accuracy, or timeliness. Reddit may change or restrict API access at any time, which may affect service functionality.</p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>To the maximum extent permitted by law, HuntIQ shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, including but not limited to lost profits, lost data, or business interruption.</p>
          <p>Our total liability for any claim arising under these terms shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
        </Section>

        <Section title="11. Termination">
          <p>We may suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or for any other reason with reasonable notice (except in cases of serious violations, which may result in immediate termination without refund).</p>
          <p>You may delete your account at any time by contacting us. Upon deletion, your data will be removed within 90 days.</p>
        </Section>

        <Section title="12. Changes to Terms">
          <p>We may update these Terms of Service periodically. We will notify you of material changes via email at least 14 days before they take effect. Continued use after the effective date constitutes acceptance of the updated terms.</p>
        </Section>

        <Section title="13. Governing Law">
          <p>These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in India.</p>
        </Section>

        <Section title="14. Contact Us">
          <p>If you have questions about these Terms, please contact us:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Email: <strong style={{ color: '#f97316' }}>legal@huntiq.io</strong></li>
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
