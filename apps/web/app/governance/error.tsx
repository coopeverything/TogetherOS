/**
 * Error Boundary for Governance Pages
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GovernanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Governance page error:', error)
  }, [error])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-red-900 mb-4">Something went wrong</h2>
        <p className="text-red-700 mb-6">
          {error.message || 'An unexpected error occurred while loading the governance page.'}
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <Link
            href="/governance"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:bg-gray-600 transition-colors font-medium inline-block"
          >
            Back to Proposals
          </Link>
        </div>
      </div>
    </div>
  )
}
