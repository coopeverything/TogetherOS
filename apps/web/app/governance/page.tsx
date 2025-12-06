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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading proposals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-red-900 mb-2">Error Loading Proposals</h2>
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
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Governance & Proposals</h1>
            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-base font-medium rounded-full">
              API Complete
            </span>
          </div>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
          Create, deliberate, and decide on proposals using transparent, consent-based governance with minority protections.
        </p>
      </div>

      {/* What This Module Does */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">What This Module Does</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Core Features</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
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
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-base rounded-full">
                Collective Governance
              </span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-800 text-base rounded-full">
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

      {/* For Developers */}
      <div className="bg-bg-2 rounded-lg border border-border p-4 mt-8">
        <p className="text-ink-700 flex items-center gap-2">
          <span className="font-medium">For Developers:</span>
          <a
            href="https://github.com/coopeverything/TogetherOS/blob/yolo/docs/modules/governance.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-ink-900 hover:text-brand-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Module spec: Governance & Proposals
          </a>
        </p>
      </div>
    </div>
  )
}
