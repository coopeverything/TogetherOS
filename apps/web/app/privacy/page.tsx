/**
 * Privacy Policy Page
 *
 * Comprehensive privacy policy for TogetherOS, including META-compliant
 * data deletion disclosures for oEmbed app approval.
 */

import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - TogetherOS',
  description: 'How TogetherOS collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      <h1 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>

      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
        Last updated: November 13, 2025
      </p>

      {/* Introduction */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Introduction</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          TogetherOS is a cooperation-first platform designed to help communities self-organize
          through transparent governance, collaborative tools, and shared resources. This Privacy
          Policy explains how we collect, use, store, and protect your personal information.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          We are committed to privacy-first practices: minimal data collection, no tracking
          pixels, no third-party analytics, and user control over your information.
        </p>
      </section>

      {/* Data We Collect */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Data We Collect</h2>

        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">1. User-Created Posts</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          When you create posts on TogetherOS, we collect and store:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>Post title (optional, maximum 200 characters)</li>
          <li>Post content (markdown format, maximum 5000 characters)</li>
          <li>Topic tags (1-5 per post)</li>
          <li>Creation and update timestamps</li>
          <li>Your TogetherOS user ID</li>
          <li>Optional group association (if post is scoped to a group)</li>
          <li>Post status (active, archived, flagged, or hidden)</li>
        </ul>

        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">2. Social Media Imports</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          When you import a social media post URL (Instagram, TikTok, Twitter, Facebook,
          YouTube, or LinkedIn), we collect and cache:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>The source URL you provided</li>
          <li>Preview metadata: title, description, thumbnail image URL</li>
          <li>Original author&apos;s public username or handle (from the social media platform)</li>
          <li>Platform identifier (e.g., &quot;instagram&quot;, &quot;tiktok&quot;)</li>
          <li>Timestamp when the preview was fetched</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <strong>What we DO NOT collect:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>Your social media account credentials</li>
          <li>Your social media profile data</li>
          <li>Social media followers or following lists</li>
          <li>Private social media messages</li>
          <li>Social media post analytics (likes, comments, shares)</li>
          <li>Raw HTML content from social media posts</li>
        </ul>

        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">3. Technical Data</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          For security and abuse prevention, we temporarily process:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>
            <strong>IP addresses:</strong> Used only for rate limiting (30 requests per hour).
            Stored in memory for 1 hour maximum, then automatically discarded. Never persisted
            to our database.
          </li>
          <li>
            <strong>Request headers:</strong> User-Agent header sent to social media platforms
            to identify TogetherOS when fetching previews.
          </li>
        </ul>
      </section>

      {/* How We Use Your Data */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">How We Use Your Data</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We use the collected data for the following purposes:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>Display your posts in the community feed</li>
          <li>Generate link previews for social media URLs you import</li>
          <li>Enable discussions and community features around your posts</li>
          <li>Prevent abuse through rate limiting (30 requests/hour per IP)</li>
          <li>Improve platform functionality and user experience</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>We do NOT:</strong> Use your data for advertising, sell your data to third
          parties, or track your activity across other websites.
        </p>
      </section>

      {/* Third-Party Data Sharing */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Third-Party Data Sharing</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          When you import a social media URL, TogetherOS fetches publicly available metadata
          from that platform (Instagram, TikTok, Twitter, Facebook, YouTube, or LinkedIn).
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <strong>What the social media platform sees:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>TogetherOS server IP address</li>
          <li>User-Agent header identifying TogetherOS</li>
          <li>The specific URL you chose to import</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <strong>What we DO NOT share:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>Your TogetherOS account information</li>
          <li>Your email address or profile data</li>
          <li>Any other posts or activity on TogetherOS</li>
        </ul>

        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Instagram-Specific Disclosures</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          When you import an Instagram post URL:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>
            TogetherOS fetches publicly available metadata using Open Graph tags
            (title, description, thumbnail image)
          </li>
          <li>We do NOT use Instagram&apos;s API or collect non-public data</li>
          <li>You do NOT grant TogetherOS access to your Instagram account</li>
          <li>TogetherOS does NOT require Instagram login</li>
          <li>
            The original Instagram post remains on Instagram - we only display a preview
            card with a link
          </li>
          <li>
            If the original Instagram post is deleted, the cached preview may remain until
            you delete your TogetherOS post
          </li>
        </ul>
      </section>

      {/* Your Rights */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          You have the following rights regarding your data:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Access:</strong> View all your posts at any time through your profile
          </li>
          <li>
            <strong>Edit:</strong> Update or modify your posts through the post editor
          </li>
          <li>
            <strong>Delete:</strong> Delete individual posts at any time through the post menu
          </li>
          <li>
            <strong>Export:</strong> Request a copy of your data (planned feature - contact us)
          </li>
          <li>
            <strong>Account Deletion:</strong> Request full account deletion (see Data Deletion section below)
          </li>
        </ul>
      </section>

      {/* Data Deletion */}
      <section className="mb-4 bg-orange-50 border-l-4 border-orange-500 p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Data Deletion</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <strong>How to delete your data:</strong>
        </p>
        <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li className="mb-2">
            <strong>Individual Posts:</strong> You can delete any of your posts at any time
            by clicking the delete button on the post. This immediately removes the post and
            all associated metadata from our database.
          </li>
          <li className="mb-2">
            <strong>Full Account Deletion:</strong> To delete your entire account and all
            associated data, please email{' '}
            <a
              href="mailto:privacy@coopeverything.org"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              privacy@coopeverything.org
            </a>{' '}
            with the subject line &quot;Account Deletion Request&quot;. Include your username
            and registered email address.
          </li>
        </ol>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <strong>What gets deleted:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>All your posts (native posts and social media imports)</li>
          <li>All cached social media preview metadata</li>
          <li>Your profile information</li>
          <li>Your account credentials</li>
          <li>All associated timestamps and metadata</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <strong>Deletion timeline:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>Account deletion requests are processed within 30 days</li>
          <li>You will receive email confirmation when deletion is complete</li>
          <li>Deletion is permanent and cannot be undone</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Note:</strong> Deleted posts may remain in backup systems for up to 30 days
          before being permanently purged.
        </p>
      </section>

      {/* Data Security */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Data Security</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We implement industry-standard security measures to protect your data:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>
            <strong>HTTPS-only:</strong> All connections to TogetherOS are encrypted using TLS
          </li>
          <li>
            <strong>SSRF protection:</strong> Multi-layer validation prevents server-side
            request forgery attacks when fetching social media previews
          </li>
          <li>
            <strong>Rate limiting:</strong> 30 requests per hour per IP address to prevent
            abuse
          </li>
          <li>
            <strong>Domain allowlisting:</strong> Only approved social media platforms can be
            accessed for preview fetching
          </li>
          <li>
            <strong>Internal network blocking:</strong> Prevents access to private networks
            and localhost
          </li>
          <li>
            <strong>Cascade deletion:</strong> When your account is deleted, all associated
            data is automatically removed
          </li>
        </ul>
      </section>

      {/* Data Retention */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Data Retention</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We retain your data as follows:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Posts:</strong> Stored indefinitely until you delete them or request
            account deletion
          </li>
          <li>
            <strong>Deleted accounts:</strong> 30-day grace period before permanent deletion
            from all systems including backups
          </li>
          <li>
            <strong>Rate limit data (IP addresses):</strong> 1 hour in-memory storage only,
            then automatically discarded
          </li>
          <li>
            <strong>Social media preview cache:</strong> Stored indefinitely with the post,
            deleted when post is deleted
          </li>
        </ul>
      </section>

      {/* Cookies and Tracking */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Cookies and Tracking</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          TogetherOS uses minimal cookies:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Authentication cookies:</strong> Required for login functionality (session management)
          </li>
          <li>
            <strong>No tracking cookies:</strong> We do NOT use Google Analytics, Facebook Pixel,
            or any third-party tracking services
          </li>
          <li>
            <strong>No advertising cookies:</strong> We do NOT serve ads or use advertising networks
          </li>
        </ul>
      </section>

      {/* Children's Privacy */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Children&apos;s Privacy</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          TogetherOS is not directed to children under 13 years of age. We do not knowingly
          collect personal information from children under 13. If you believe a child under 13
          has provided us with personal information, please contact us at{' '}
          <a
            href="mailto:privacy@coopeverything.org"
            className="text-orange-600 hover:text-orange-700 underline"
          >
            privacy@coopeverything.org
          </a>{' '}
          and we will delete the information immediately.
        </p>
      </section>

      {/* International Users */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">International Users</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          TogetherOS is hosted in the United States. If you access TogetherOS from outside
          the United States, please be aware that your information may be transferred to,
          stored, and processed in the United States. By using TogetherOS, you consent to
          the transfer of your information to the United States.
        </p>
      </section>

      {/* Changes to This Policy */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Changes to This Policy</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We may update this Privacy Policy from time to time. When we make material changes,
          we will:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
          <li>Update the &quot;Last updated&quot; date at the top of this page</li>
          <li>Notify users via email or platform announcement</li>
          <li>Provide 30 days notice before changes take effect</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          Your continued use of TogetherOS after changes take effect constitutes acceptance
          of the updated policy.
        </p>
      </section>

      {/* Contact Us */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          If you have questions about this Privacy Policy or how we handle your data, please contact us:
        </p>
        <ul className="list-none pl-0 mb-4 text-gray-700 dark:text-gray-300">
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
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Related: <Link href="/terms" className="text-orange-600 hover:text-orange-700 underline">Terms of Service</Link>
        </p>
      </div>
    </main>
  )
}
