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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProposals() {
      try {
        setLoading(true)
        const response = await fetch('/api/proposals')

        if (!response.ok) {
          throw new Error(`Failed to fetch proposals: ${response.statusText}`)
        }

        const data = await response.json()
        setProposals(data.proposals || [])

        // In a real app, we'd fetch author names from user API
        // For now, use placeholder names
        const names: Record<string, string> = {}
        data.proposals?.forEach((p: Proposal) => {
          names[p.authorId] = `User ${p.authorId.slice(0, 8)}`
        })
        setAuthorNames(names)
      } catch (err: any) {
        console.error('Error fetching proposals:', err)
        setError(err.message || 'Failed to load proposals')
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
  }, [])

  const handleCreateProposal = () => {
    router.push('/governance/new')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading proposals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Proposals</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900">Governance & Proposals</h1>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              API Complete
            </span>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Create, deliberate, and decide on proposals using transparent, consent-based governance with minority protections.
        </p>
      </div>

      {/* What This Module Does */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">What This Module Does</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Core Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Create individual or group proposals
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Track proposal lifecycle (draft → research → voting → delivery)
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Evidence gathering and validation
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Multi-option deliberation
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Minority report protection
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Consent-based decision making
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Collective Governance
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
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

      {/* Technical Details */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">For Developers</h2>
        <p className="text-blue-800 mb-3">
          Module spec: <Link href="/docs/modules/governance" className="underline font-medium">docs/modules/governance.md</Link>
        </p>
        <div className="text-sm text-blue-700">
          <p><strong>Status:</strong> API complete (types, repos, handlers, routes) ✅</p>
          <p><strong>API Endpoints:</strong></p>
          <ul className="list-disc ml-6 mt-1">
            <li>GET /api/proposals - List with filters</li>
            <li>POST /api/proposals - Create proposal</li>
            <li>GET /api/proposals/[id] - Get by ID</li>
            <li>PUT /api/proposals/[id] - Update proposal</li>
            <li>DELETE /api/proposals/[id] - Delete proposal</li>
          </ul>
          <p className="mt-2"><strong>UI:</strong> Components created, integration in progress</p>
        </div>
      </div>
    </div>
  )
}
