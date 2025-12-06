import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              About
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/manifesto" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Manifesto
                </Link>
              </li>
              <li>
                <Link href="/cooperation-paths" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Cooperation Paths
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Learn
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/wiki" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Wiki
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Glossary
                </Link>
              </li>
              <li>
                <Link href="/modules" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Modules
                </Link>
              </li>
              <li>
                <Link href="/docs/contributors/GETTING_STARTED" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Contributing
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Community
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/coopeverything/TogetherOS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/forum" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Forum
                </Link>
              </li>
              <li>
                <Link href="/groups" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Groups
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Tools
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/bridge" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Bridge Assistant
                </Link>
              </li>
              <li>
                <Link href="/admin/design" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Design System
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm">
                © {currentYear} Coopeverything. Powered by TogetherOS.
              </p>
              <div className="flex space-x-4 text-sm">
                <Link href="/privacy" className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Privacy
                </Link>
                <span className="text-gray-300 dark:text-gray-600 dark:text-gray-400 dark:text-gray-500">|</span>
                <Link href="/terms" className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                  Terms
                </Link>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a
                href="https://github.com/coopeverything/TogetherOS"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
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
