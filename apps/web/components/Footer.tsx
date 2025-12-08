import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-bg-2 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider mb-4">
              About
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/manifesto" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Manifesto
                </Link>
              </li>
              <li>
                <Link href="/cooperation-paths" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Cooperation Paths
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider mb-4">
              Learn
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/wiki" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Wiki
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Glossary
                </Link>
              </li>
              <li>
                <Link href="/modules" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Modules
                </Link>
              </li>
              <li>
                <Link href="/docs/contributors/GETTING_STARTED" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Contributing
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider mb-4">
              Community
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/coopeverything/TogetherOS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-700 hover:text-joy-600 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/forum" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Forum
                </Link>
              </li>
              <li>
                <Link href="/groups" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Groups
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider mb-4">
              Tools
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/bridge" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Bridge Assistant
                </Link>
              </li>
              <li>
                <Link href="/admin/design" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Design System
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-ink-700 hover:text-joy-600 transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-ink-400 text-sm">
                © {currentYear} Coopeverything. Powered by TogetherOS.
              </p>
              <div className="flex space-x-4 text-sm">
                <Link href="/privacy" className="text-ink-400 hover:text-joy-600 transition-colors">
                  Privacy
                </Link>
                <span className="text-border">|</span>
                <Link href="/terms" className="text-ink-400 hover:text-joy-600 transition-colors">
                  Terms
                </Link>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a
                href="https://github.com/coopeverything/TogetherOS"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-400 hover:text-ink-700 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
