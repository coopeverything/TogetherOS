import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-orange-600">404</h1>
        <h2 className="mt-4 text-sm font-semibold text-ink-900">
          Page Not Found
        </h2>
        <p className="mt-4 text-sm text-ink-700 dark:text-ink-400 dark:text-ink-400 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="mt-4 flex gap-4 justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-bg-2 dark:bg-bg-1 text-ink-900 font-medium rounded-md hover:bg-bg-2 transition-colors"
          >
            Dashboard
          </Link>
        </div>
        <div className="mt-4">
          <p className="text-sm text-ink-400 dark:text-ink-400 dark:text-ink-400">
            Need help?{' '}
            <Link href="/bridge" className="text-orange-600 hover:text-orange-700 font-medium">
              Ask Bridge Assistant
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
