import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-orange-600">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-900">
          Page Not Found
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-md hover:bg-gray-200 transition-colors"
          >
            Dashboard
          </Link>
        </div>
        <div className="mt-8">
          <p className="text-sm text-gray-500">
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
