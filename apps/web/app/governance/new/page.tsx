/**
 * Create Proposal Page
 *
 * Form to create a new proposal
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProposalForm } from '@togetheros/ui/governance'
import type { ProposalFormData } from '@togetheros/ui/governance'

export default function NewProposalPage() {
  const router = useRouter()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch current user
        const userResponse = await fetch('/api/profile')
        if (userResponse.status === 401) {
          router.push('/login?redirect=/governance/new')
          return
        }
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile')
        }
        const userData = await userResponse.json()
        setCurrentUserId(userData.user.id)

        // Fetch user's groups
        const groupsResponse = await fetch('/api/groups')
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          // Filter to groups user is a member of (for now, show all)
          setGroups(groupsData.groups || [])
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err)
        setError(err.message || 'Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleSubmit = async (data: ProposalFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scopeType: data.scopeType,
          scopeId: data.scopeId,
          title: data.title,
          summary: data.summary,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create proposal')
      }

      const result = await response.json()
      const proposalId = result.proposal.id

      // Navigate to the new proposal
      router.push(`/governance/${proposalId}`)
    } catch (err: any) {
      console.error('Error creating proposal:', err)
      setError(err.message || 'Failed to create proposal')
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/governance')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 dark:text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">Authentication Required</h2>
          <p className="text-yellow-700 mb-4">You must be logged in to create proposals.</p>
          <button
            onClick={() => router.push('/login?redirect=/governance/new')}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
          <Link href="/governance" className="hover:text-orange-600">
            Proposals
          </Link>
          <span className="mx-2">→</span>
          <span className="text-gray-900 dark:text-white">Create New Proposal</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Proposal</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Start with a clear title and summary. You can add evidence, options, and other details later.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <ProposalForm
          currentUserId={currentUserId}
          groups={groups}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Tips for Good Proposals</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span><strong>Be specific:</strong> Clear, concrete proposals are easier to evaluate and implement</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span><strong>Explain the why:</strong> Help others understand the problem you're solving</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span><strong>Consider impacts:</strong> Think about who this affects and how</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span><strong>Start small:</strong> You can always expand and refine as you gather feedback</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
