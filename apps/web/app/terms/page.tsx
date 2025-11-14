/**
 * Terms of Service Page
 *
 * Legal terms and conditions for using TogetherOS platform.
 */

import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - TogetherOS',
  description: 'Terms and conditions for using the TogetherOS platform.',
}

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

      <p className="text-sm text-gray-600 mb-8">
        Last updated: November 13, 2025
      </p>

      {/* Introduction */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
        <p className="text-gray-700 mb-4">
          Welcome to TogetherOS. By accessing or using our platform, you agree to be bound
          by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
          please do not use TogetherOS.
        </p>
        <p className="text-gray-700">
          TogetherOS is a cooperation-first platform designed to help communities self-organize
          through transparent governance, collaborative tools, and shared resources.
        </p>
      </section>

      {/* Acceptance of Terms */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">
          By creating an account, posting content, or otherwise using TogetherOS, you agree to:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Comply with these Terms of Service</li>
          <li>Comply with our <Link href="/privacy" className="text-orange-600 hover:text-orange-700 underline">Privacy Policy</Link></li>
          <li>Use TogetherOS in a lawful and respectful manner</li>
          <li>Be at least 13 years of age</li>
        </ul>
      </section>

      {/* User Accounts */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
        <p className="text-gray-700 mb-4">
          To access certain features of TogetherOS, you must create an account. You are
          responsible for:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized use</li>
          <li>Providing accurate and current information</li>
        </ul>
        <p className="text-gray-700">
          We reserve the right to suspend or terminate accounts that violate these Terms.
        </p>
      </section>

      {/* User Content and Ownership */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Content and Ownership</h2>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Content</h3>
        <p className="text-gray-700 mb-4">
          You retain all ownership rights to content you create on TogetherOS (posts,
          comments, proposals, etc.). By posting content, you grant TogetherOS a
          non-exclusive, worldwide, royalty-free license to:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Display your content on the platform</li>
          <li>Store and backup your content</li>
          <li>Allow other users to view and interact with your content per your privacy settings</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Social Media Imports</h3>
        <p className="text-gray-700 mb-4">
          When you import social media content (Instagram, TikTok, Twitter, etc.):
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>You represent that you have the right to share that content</li>
          <li>You understand that TogetherOS fetches publicly available preview metadata only</li>
          <li>The original content remains on the source platform under its terms</li>
          <li>You are responsible for compliance with the source platform&apos;s terms of service</li>
        </ul>
      </section>

      {/* Acceptable Use */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptable Use</h2>
        <p className="text-gray-700 mb-4">
          You agree NOT to use TogetherOS to:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Post harmful, abusive, harassing, or discriminatory content</li>
          <li>Spam, phish, or engage in fraudulent activity</li>
          <li>Distribute malware or engage in hacking</li>
          <li>Impersonate others or provide false information</li>
          <li>Scrape or harvest data without permission</li>
          <li>Interfere with platform functionality or security</li>
        </ul>
      </section>

      {/* Community Guidelines */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Community Guidelines</h2>
        <p className="text-gray-700 mb-4">
          TogetherOS is built on cooperation and mutual respect. We expect users to:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Engage in good faith discussions</li>
          <li>Respect diverse perspectives and experiences</li>
          <li>Contribute constructively to the community</li>
          <li>Report violations of these Terms or community guidelines</li>
          <li>Participate in consent-based governance processes</li>
        </ul>
      </section>

      {/* Intellectual Property */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
        <p className="text-gray-700 mb-4">
          TogetherOS platform code, design, trademarks, and documentation are owned by
          TogetherOS or licensed to us. You may not:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Copy, modify, or distribute platform code without permission</li>
          <li>Use TogetherOS trademarks without authorization</li>
          <li>Remove or alter copyright notices</li>
        </ul>
        <p className="text-gray-700">
          Note: TogetherOS is committed to open source. See our{' '}
          <a
            href="https://github.com/coopeverything/TogetherOS"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 underline"
          >
            GitHub repository
          </a>{' '}
          for licensing details.
        </p>
      </section>

      {/* Third-Party Services */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
        <p className="text-gray-700 mb-4">
          TogetherOS integrates with third-party services (social media platforms for
          link previews). We are not responsible for:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Third-party service availability or reliability</li>
          <li>Third-party terms of service or privacy policies</li>
          <li>Content hosted on third-party platforms</li>
          <li>Changes or discontinuation of third-party services</li>
        </ul>
      </section>

      {/* Disclaimer of Warranties */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer of Warranties</h2>
        <p className="text-gray-700 mb-4">
          TogetherOS is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without
          warranties of any kind, either express or implied, including but not limited to:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Warranties of merchantability or fitness for a particular purpose</li>
          <li>Warranties of uninterrupted or error-free service</li>
          <li>Warranties of data accuracy or completeness</li>
          <li>Warranties of security or privacy protection (though we strive for both)</li>
        </ul>
      </section>

      {/* Limitation of Liability */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          To the maximum extent permitted by law, TogetherOS and its contributors shall
          not be liable for:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Indirect, incidental, special, or consequential damages</li>
          <li>Loss of profits, data, or goodwill</li>
          <li>Service interruptions or errors</li>
          <li>User-generated content or third-party actions</li>
          <li>Unauthorized access to your account</li>
        </ul>
        <p className="text-gray-700">
          Our total liability shall not exceed $100 USD or the amount you paid to use
          TogetherOS in the past 12 months (currently $0, as TogetherOS is free).
        </p>
      </section>

      {/* Indemnification */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Indemnification</h2>
        <p className="text-gray-700 mb-4">
          You agree to indemnify and hold harmless TogetherOS, its contributors, and
          affiliates from any claims, damages, or expenses arising from:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Your violation of these Terms</li>
          <li>Your violation of any law or third-party rights</li>
          <li>Your content or use of the platform</li>
          <li>Unauthorized access to your account due to your negligence</li>
        </ul>
      </section>

      {/* Dispute Resolution */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
        <p className="text-gray-700 mb-4">
          If you have a dispute with TogetherOS:
        </p>
        <ol className="list-decimal pl-6 mb-4 text-gray-700">
          <li className="mb-2">
            <strong>Contact us first:</strong> Email{' '}
            <a
              href="mailto:privacy@coopeverything.org"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              privacy@coopeverything.org
            </a>{' '}
            to resolve the issue informally
          </li>
          <li className="mb-2">
            <strong>Mediation:</strong> If informal resolution fails, we encourage mediation
          </li>
          <li className="mb-2">
            <strong>Arbitration:</strong> Disputes shall be resolved through binding arbitration
            in accordance with the rules of the American Arbitration Association
          </li>
        </ol>
        <p className="text-gray-700">
          You waive the right to participate in class action lawsuits against TogetherOS.
        </p>
      </section>

      {/* Termination */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
        <p className="text-gray-700 mb-4">
          We may suspend or terminate your account if you:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Violate these Terms</li>
          <li>Engage in harmful or illegal activity</li>
          <li>Fail to respond to our communications about violations</li>
        </ul>
        <p className="text-gray-700 mb-4">
          You may terminate your account at any time by requesting account deletion
          (see our <Link href="/privacy" className="text-orange-600 hover:text-orange-700 underline">Privacy Policy</Link> for details).
        </p>
        <p className="text-gray-700">
          Upon termination, your right to use TogetherOS immediately ceases, but these
          Terms shall continue to apply to prior use.
        </p>
      </section>

      {/* Changes to Terms */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to These Terms</h2>
        <p className="text-gray-700 mb-4">
          We may update these Terms from time to time. When we make material changes:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>We will update the &quot;Last updated&quot; date at the top of this page</li>
          <li>We will notify users via email or platform announcement</li>
          <li>We will provide 30 days notice before changes take effect</li>
        </ul>
        <p className="text-gray-700">
          Your continued use of TogetherOS after changes take effect constitutes acceptance
          of the updated Terms.
        </p>
      </section>

      {/* Governing Law */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
        <p className="text-gray-700 mb-4">
          These Terms shall be governed by and construed in accordance with the laws of
          the United States, without regard to conflict of law principles.
        </p>
      </section>

      {/* Severability */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Severability</h2>
        <p className="text-gray-700 mb-4">
          If any provision of these Terms is found to be invalid or unenforceable, the
          remaining provisions shall continue in full force and effect.
        </p>
      </section>

      {/* Entire Agreement */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Entire Agreement</h2>
        <p className="text-gray-700 mb-4">
          These Terms, together with our Privacy Policy, constitute the entire agreement
          between you and TogetherOS regarding use of the platform.
        </p>
      </section>

      {/* Contact Us */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
        <p className="text-gray-700 mb-4">
          If you have questions about these Terms, please contact us:
        </p>
        <ul className="list-none pl-0 mb-4 text-gray-700">
          <li className="mb-2">
            <strong>Email:</strong>{' '}
            <a
              href="mailto:privacy@coopeverything.org"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              privacy@coopeverything.org
            </a>
          </li>
          <li className="mb-2">
            <strong>GitHub:</strong>{' '}
            <a
              href="https://github.com/coopeverything/TogetherOS/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              github.com/coopeverything/TogetherOS/issues
            </a>
          </li>
        </ul>
      </section>

      {/* Footer Links */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Related: <Link href="/privacy" className="text-orange-600 hover:text-orange-700 underline">Privacy Policy</Link>
        </p>
      </div>
    </main>
  )
}
