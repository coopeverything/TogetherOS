'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-9xl font-bold text-red-600">500</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-900">
          Something Went Wrong
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          We encountered an unexpected error. Our team has been notified and we're working on it.
        </p>

        {error.digest && (
          <p className="mt-2 text-sm text-gray-500 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-md hover:bg-gray-200 transition-colors"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Still having trouble?{' '}
            <Link href="/bridge" className="text-orange-600 hover:text-orange-700 font-medium">
              Contact Support via Bridge
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
