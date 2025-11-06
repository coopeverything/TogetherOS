/**
 * Create Proposal Page
 *
 * Form to create a new proposal
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProposalForm } from '@togetheros/ui/governance'
import type { ProposalFormData } from '@togetheros/ui/governance'

export default function NewProposalPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // In a real app, get from session/auth
  const currentUserId = 'current-user-id'

  // In a real app, fetch user's groups from API
  const groups = [
    { id: 'group-1', name: 'Cooperative Technology Working Group' },
    { id: 'group-2', name: 'Community Wellbeing Circle' },
    { id: 'group-3', name: 'Social Economy Collective' },
  ]

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 text-sm text-gray-600">
          <Link href="/governance" className="hover:text-orange-600">
            Proposals
          </Link>
          <span className="mx-2">→</span>
          <span className="text-gray-900">Create New Proposal</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Proposal</h1>
        <p className="text-gray-600">
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
