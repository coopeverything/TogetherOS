/**
 * Edit Proposal Page
 *
 * Form to edit an existing proposal
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ProposalForm } from '@togetheros/ui/governance'
import type { ProposalFormData } from '@togetheros/ui/governance'
import type { Proposal } from '@togetheros/types/governance'

export default function EditProposalPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch current user
        const userResponse = await fetch('/api/profile')
        if (userResponse.status === 401) {
          router.push(`/login?redirect=/governance/${id}/edit`)
          return
        }
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile')
        }
        const userData = await userResponse.json()
        setCurrentUserId(userData.user.id)

        // Fetch proposal
        const proposalResponse = await fetch(`/api/proposals/${id}`)
        if (!proposalResponse.ok) {
          if (proposalResponse.status === 404) {
            throw new Error('Proposal not found')
          }
          throw new Error('Failed to fetch proposal')
        }
        const proposalData = await proposalResponse.json()
        setProposal(proposalData.proposal)

        // Check if user is the author
        if (proposalData.proposal.authorId !== userData.user.id) {
          setError('You can only edit proposals you created')
          setLoading(false)
          return
        }

        // Fetch user's groups
        const groupsResponse = await fetch('/api/groups')
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setGroups(groupsData.groups || [])
        }
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, id])

  const handleSubmit = async (data: ProposalFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/proposals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          summary: data.summary,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update proposal')
      }

      // Navigate back to the proposal
      router.push(`/governance/${id}`)
    } catch (err: any) {
      console.error('Error updating proposal:', err)
      setError(err.message || 'Failed to update proposal')
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/governance/${id}`)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm text-ink-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !proposal) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="bg-danger-bg border border-danger/30 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-danger mb-2">Error</h2>
          <p className="text-danger/80 mb-4">{error}</p>
          <Link
            href="/governance"
            className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-500 transition-colors font-medium inline-block"
          >
            Back to Proposals
          </Link>
        </div>
      </div>
    )
  }

  if (!currentUserId || !proposal) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="bg-warning-bg border border-warning/30 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-warning mb-2">Authentication Required</h2>
          <p className="text-warning/80 mb-4">You must be logged in to edit proposals.</p>
          <button
            onClick={() => router.push(`/login?redirect=/governance/${id}/edit`)}
            className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-500 transition-colors font-medium"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  // Check author permissions
  if (proposal.authorId !== currentUserId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="bg-danger-bg border border-danger/30 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-danger mb-2">Access Denied</h2>
          <p className="text-danger/80 mb-4">You can only edit proposals you created.</p>
          <Link
            href={`/governance/${id}`}
            className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-500 transition-colors font-medium inline-block"
          >
            View Proposal
          </Link>
        </div>
      </div>
    )
  }

  const initialData: Partial<ProposalFormData> = {
    scopeType: proposal.scopeType,
    scopeId: proposal.scopeId,
    title: proposal.title,
    summary: proposal.summary,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-4">
        <nav className="mb-4 text-sm text-ink-700">
          <Link href="/governance" className="hover:text-brand-600">
            Proposals
          </Link>
          <span className="mx-2">&rarr;</span>
          <Link href={`/governance/${id}`} className="hover:text-brand-600">
            {proposal.title}
          </Link>
          <span className="mx-2">&rarr;</span>
          <span className="text-ink-900">Edit</span>
        </nav>
        <h1 className="text-sm font-bold text-ink-900 mb-2">Edit Proposal</h1>
        <p className="text-ink-700">
          Update your proposal details. Note: Scope type cannot be changed after creation.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-danger-bg border border-danger/30 rounded-lg p-4 mb-3">
          <p className="text-danger">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-bg-1 rounded-lg border border-border p-4">
        <ProposalForm
          initialData={initialData}
          currentUserId={currentUserId}
          groups={groups}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
