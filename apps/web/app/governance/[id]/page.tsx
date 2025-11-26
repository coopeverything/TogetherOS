/**
 * Proposal Detail Page
 *
 * Displays full details of a single proposal
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
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
      alert(err.message || 'Failed to delete proposal')
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
      alert('You must be logged in to vote')
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
      alert(err.message || 'Failed to cast vote')
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
      alert('You must be logged in to rate')
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
      alert(err.message || 'Failed to submit rating')
      throw err
    } finally {
      setLoadingRating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error || 'Proposal not found'}</p>
          <Link
            href="/governance"
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium inline-block"
          >
            Back to Proposals
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/governance" className="hover:text-orange-600">
          Proposals
        </Link>
        <span className="mx-2">→</span>
        <span className="text-gray-900">{proposal.title}</span>
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
        <div className="mt-8">
          <ProposalAllocationWidget
            proposalId={id}
            proposalTitle={proposal.title}
          />
        </div>
      )}

      {/* Rating Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rating Display */}
        {ratingAggregate && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Ratings</h2>
            <ProposalRatingDisplay aggregate={ratingAggregate} />
          </div>
        )}

        {/* Rating Form */}
        {currentUserId && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vote on This Proposal</h2>
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
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Want to vote?</h3>
          <p className="text-blue-700 mb-4">Log in to participate in this decision</p>
          <Link
            href="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium inline-block"
          >
            Log In
          </Link>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8">
        <Link
          href="/governance"
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium inline-block"
        >
          ← Back to All Proposals
        </Link>
      </div>
    </div>
  )
}
