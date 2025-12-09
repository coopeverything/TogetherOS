/**
 * Governance List Page
 *
 * Displays all proposals with filtering options
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProposalList } from '@togetheros/ui/governance'
import type { Proposal } from '@togetheros/types/governance'

export default function GovernancePage() {
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch current user (optional - don't require auth to view list)
        const userResponse = await fetch('/api/profile')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setCurrentUserId(userData.user.id)
        }

        // Fetch proposals
        const response = await fetch('/api/proposals')

        if (!response.ok) {
          throw new Error(`Failed to fetch proposals: ${response.statusText}`)
        }

        const data = await response.json()
        setProposals(data.proposals || [])

        // TODO: Fetch author names from user API
        // For now, use placeholder names
        const names: Record<string, string> = {}
        data.proposals?.forEach((p: Proposal) => {
          names[p.authorId] = `User ${p.authorId.slice(0, 8)}`
        })
        setAuthorNames(names)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to load proposals')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateProposal = () => {
    if (!currentUserId) {
      router.push('/login?redirect=/governance/new')
    } else {
      router.push('/governance/new')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm text-ink-400">Loading proposals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="bg-danger-bg border border-danger/30 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-danger mb-2">Error Loading Proposals</h2>
          <p className="text-danger">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-sm font-bold text-ink-900">Governance & Proposals</h1>
        </div>
        <p className="text-sm text-ink-700 max-w-3xl">
          Create, deliberate, and decide on proposals using transparent, consent-based governance with minority protections.
        </p>
      </div>

      {/* What This Module Does */}
      <div className="bg-bg-1 rounded-lg border border-border p-4 mb-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">What This Module Does</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-ink-900 mb-2">Core Features</h3>
            <ul className="space-y-2 text-ink-700">
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Create individual or group proposals
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Track proposal lifecycle (draft → research → voting → delivery)
              </li>
              <li className="flex items-start">
                <span className="text-accent-3 mr-2">•</span>
                Evidence gathering and validation
              </li>
              <li className="flex items-start">
                <span className="text-accent-3 mr-2">•</span>
                Multi-option deliberation
              </li>
              <li className="flex items-start">
                <span className="text-accent-3 mr-2">•</span>
                Minority report protection
              </li>
              <li className="flex items-start">
                <span className="text-accent-3 mr-2">•</span>
                Consent-based decision making
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-ink-900 mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-accent-1-bg text-accent-1 text-sm rounded-full">
                Collective Governance
              </span>
              <span className="px-3 py-1 bg-accent-2-bg text-accent-2 text-sm rounded-full">
                Community Connection
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal List */}
      <ProposalList
        proposals={proposals}
        authorNames={authorNames}
        showCreateButton={true}
        onCreateProposal={handleCreateProposal}
      />

    </div>
  )
}
