/**
 * Proposal Detail Page
 *
 * Displays full details of a single proposal
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ProposalView } from '@togetheros/ui/governance'
import type { Proposal } from '@togetheros/types/governance'

export default function ProposalDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // In a real app, get from session/auth
  const currentUserId = 'current-user-id'
  const isAuthor = proposal?.authorId === currentUserId

  useEffect(() => {
    async function fetchProposal() {
      try {
        setLoading(true)
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
        console.error('Error fetching proposal:', err)
        setError(err.message || 'Failed to load proposal')
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
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
