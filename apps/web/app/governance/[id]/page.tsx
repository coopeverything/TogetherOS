/**
 * Proposal Detail Page
 *
 * Displays full details of a single proposal
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import {
  ProposalView,
  VoteInterface,
  ProposalRatingForm,
  ProposalRatingDisplay,
} from '@togetheros/ui/governance'
import { ProposalAllocationWidget } from '@/components/economy/ProposalAllocationWidget'
import type {
  Proposal,
  VoteType,
  VoteTally,
  ProposalRating,
  ProposalRatingAggregate,
  ClarityRating,
  ConstructivenessRating,
} from '@togetheros/types/governance'

export default function ProposalDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { addToast } = useToast()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Voting state
  const [currentVote, setCurrentVote] = useState<VoteType | null>(null)
  const [voteTally, setVoteTally] = useState<VoteTally | null>(null)
  const [loadingVote, setLoadingVote] = useState(false)

  // Rating state
  const [currentRating, setCurrentRating] = useState<ProposalRating | null>(null)
  const [ratingAggregate, setRatingAggregate] = useState<ProposalRatingAggregate | null>(null)
  const [loadingRating, setLoadingRating] = useState(false)

  const isAuthor = proposal && currentUserId ? proposal.authorId === currentUserId : false

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch current user (optional - don't require auth to view)
        const userResponse = await fetch('/api/profile')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setCurrentUserId(userData.user.id)
        }

        // Fetch proposal
        const response = await fetch(`/api/proposals/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Proposal not found')
          }
          throw new Error(`Failed to fetch proposal: ${response.statusText}`)
        }

        const data = await response.json()
        setProposal(data.proposal)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to load proposal')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleEdit = () => {
    // Navigate to edit page (would need to create this)
    router.push(`/governance/${id}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete proposal: ${response.statusText}`)
      }

      // Navigate back to list
      router.push('/governance')
    } catch (err: any) {
      console.error('Error deleting proposal:', err)
      addToast({
        title: 'Error',
        description: err.message || 'Failed to delete proposal',
        variant: 'danger',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Fetch voting data
  const fetchVoteData = async () => {
    if (!currentUserId) return

    try {
      // Fetch current user's vote
      const voteResponse = await fetch(`/api/proposals/${id}/votes/my-vote`)
      if (voteResponse.ok) {
        const { vote } = await voteResponse.json()
        setCurrentVote(vote?.voteType || null)
      }

      // Fetch vote tally
      const tallyResponse = await fetch(`/api/proposals/${id}/votes/tally`)
      if (tallyResponse.ok) {
        const { tally } = await tallyResponse.json()
        setVoteTally(tally)
      }
    } catch (err) {
      console.error('Error fetching vote data:', err)
    }
  }

  // Fetch votes when proposal and user are loaded
  useEffect(() => {
    if (proposal && currentUserId) {
      fetchVoteData()
    }
  }, [proposal, currentUserId, id])

  // Handle vote submission
  const handleVote = async (voteType: VoteType, reasoning?: string) => {
    if (!currentUserId) {
      addToast({
        title: 'Authentication Required',
        description: 'You must be logged in to vote',
        variant: 'warning',
      })
      return
    }

    try {
      setLoadingVote(true)

      const response = await fetch(`/api/proposals/${id}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, reasoning }),
      })

      if (!response.ok) {
        throw new Error(`Failed to cast vote: ${response.statusText}`)
      }

      // Refresh vote data
      await fetchVoteData()
    } catch (err: any) {
      console.error('Error casting vote:', err)
      addToast({
        title: 'Error',
        description: err.message || 'Failed to cast vote',
        variant: 'danger',
      })
      throw err
    } finally {
      setLoadingVote(false)
    }
  }

  // Fetch rating data
  const fetchRatingData = async () => {
    try {
      // Fetch current user's rating (if logged in)
      if (currentUserId) {
        const ratingResponse = await fetch(`/api/proposals/${id}/ratings/my-rating`)
        if (ratingResponse.ok) {
          const { rating } = await ratingResponse.json()
          setCurrentRating(rating)
        }
      }

      // Fetch rating aggregate (public)
      const aggregateResponse = await fetch(`/api/proposals/${id}/ratings/aggregate`)
      if (aggregateResponse.ok) {
        const { aggregate } = await aggregateResponse.json()
        setRatingAggregate(aggregate)
      }
    } catch (err) {
      console.error('Error fetching rating data:', err)
    }
  }

  // Fetch ratings when proposal is loaded
  useEffect(() => {
    if (proposal) {
      fetchRatingData()
    }
  }, [proposal, currentUserId, id])

  // Handle rating submission
  const handleRating = async (rating: {
    clarity: ClarityRating
    importance: number
    urgency: number
    isInnovative: boolean
    constructiveness: ConstructivenessRating
    feedback?: string
  }) => {
    if (!currentUserId) {
      addToast({
        title: 'Authentication Required',
        description: 'You must be logged in to rate',
        variant: 'warning',
      })
      return
    }

    try {
      setLoadingRating(true)

      const response = await fetch(`/api/proposals/${id}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rating),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit rating: ${response.statusText}`)
      }

      // Refresh rating data
      await fetchRatingData()
    } catch (err: any) {
      console.error('Error submitting rating:', err)
      addToast({
        title: 'Error',
        description: err.message || 'Failed to submit rating',
        variant: 'danger',
      })
      throw err
    } finally {
      setLoadingRating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm text-ink-700">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="bg-danger-bg border border-danger/30 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-danger mb-2">Error</h2>
          <p className="text-danger/80 mb-4">{error || 'Proposal not found'}</p>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="mb-3 text-sm text-ink-700">
        <Link href="/governance" className="hover:text-brand-600">
          Proposals
        </Link>
        <span className="mx-2">→</span>
        <span className="text-ink-900">{proposal.title}</span>
      </nav>

      {/* Proposal View */}
      <ProposalView
        proposal={proposal}
        authorName={`User ${proposal.authorId.slice(0, 8)}`}
        isAuthor={isAuthor}
        onEdit={isAuthor ? handleEdit : undefined}
        onDelete={isAuthor && !isDeleting ? handleDelete : undefined}
      />

      {/* Support Points Allocation Widget */}
      {currentUserId && (
        <div className="mt-4">
          <ProposalAllocationWidget
            proposalId={id}
            proposalTitle={proposal.title}
          />
        </div>
      )}

      {/* Rating Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rating Display */}
        {ratingAggregate && (
          <div className="bg-bg-1 rounded-lg border border-border p-4">
            <h2 className="text-sm font-bold text-ink-900 mb-3">Community Ratings</h2>
            <ProposalRatingDisplay aggregate={ratingAggregate} />
          </div>
        )}

        {/* Rating Form */}
        {currentUserId && (
          <div className="bg-bg-1 rounded-lg border border-border p-4">
            <h2 className="text-sm font-bold text-ink-900 mb-3">
              {currentRating ? 'Update Your Rating' : 'Rate This Proposal'}
            </h2>
            <ProposalRatingForm
              proposalId={id}
              currentRating={currentRating}
              onSubmit={handleRating}
              disabled={loadingRating}
            />
          </div>
        )}
      </div>

      {/* Voting Interface */}
      {currentUserId && voteTally && (
        <div className="mt-12 bg-bg-1 rounded-lg border border-border p-4">
          <h2 className="text-sm font-bold text-ink-900 mb-3">Vote on This Proposal</h2>
          <VoteInterface
            proposalId={id}
            currentVote={currentVote}
            tally={voteTally}
            onVote={handleVote}
            disabled={loadingVote}
          />
        </div>
      )}

      {/* Login prompt for non-logged-in users */}
      {!currentUserId && (
        <div className="mt-12 bg-info-bg border border-info/30 rounded-lg p-4 text-center">
          <h3 className="text-sm font-semibold text-info mb-2">Want to vote?</h3>
          <p className="text-info/80 mb-4">Log in to participate in this decision</p>
          <Link
            href="/login"
            className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-500 transition-colors font-medium inline-block"
          >
            Log In
          </Link>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-4">
        <Link
          href="/governance"
          className="px-4 py-2 bg-bg-2 text-ink-900 rounded-md hover:bg-bg-3 transition-colors font-medium inline-block"
        >
          &larr; Back to All Proposals
        </Link>
      </div>
    </div>
  )
}
