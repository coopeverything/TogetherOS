/**
 * SimilarProposalsModal Component
 *
 * Displays similar proposals detected during proposal creation.
 * Shows similarity scores and requires clarification for high similarity (>85%).
 */

'use client'

import { ProposalCard } from './ProposalCard'

export interface SimilarProposal {
  id: string
  title: string
  summary: string
  scopeType: 'individual' | 'group'
  scopeId: string
  authorId: string
  status: string
  similarity: number
  createdAt: Date
}

export interface SimilarProposalsModalProps {
  /** List of similar proposals */
  similarProposals: SimilarProposal[]

  /** Whether high similarity requires clarification (>85%) */
  requiresClarification: boolean

  /** Highest similarity score */
  highestSimilarity: number

  /** Callback when user decides to proceed anyway */
  onProceed: () => void

  /** Callback when user decides to go back and edit */
  onGoBack: () => void

  /** Whether the modal is open */
  isOpen: boolean
}

export function SimilarProposalsModal({
  similarProposals,
  requiresClarification,
  highestSimilarity,
  onProceed,
  onGoBack,
  isOpen,
}: SimilarProposalsModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Similar Proposals Found
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                We found {similarProposals.length} similar{' '}
                {similarProposals.length === 1 ? 'proposal' : 'proposals'} with
                up to {Math.round(highestSimilarity * 100)}% similarity.
              </p>
            </div>
          </div>

          {/* Warning Banner */}
          {requiresClarification && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-yellow-600 mt-0.5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    High Similarity Detected
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your proposal is very similar to existing proposals. Please
                    clarify how your proposal differs or consider supporting an
                    existing proposal instead.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Proposals List */}
        <div className="px-6 py-4 space-y-4">
          {similarProposals.map((proposal) => (
            <div key={proposal.id} className="relative">
              {/* Similarity Badge */}
              <div className="absolute -top-2 -right-2 z-10">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    proposal.similarity > 0.85
                      ? 'bg-red-100 text-red-800'
                      : proposal.similarity > 0.75
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {Math.round(proposal.similarity * 100)}% similar
                </span>
              </div>

              <ProposalCard
                proposal={{
                  id: proposal.id,
                  title: proposal.title,
                  summary: proposal.summary,
                  scopeType: proposal.scopeType,
                  scopeId: proposal.scopeId,
                  authorId: proposal.authorId,
                  status: proposal.status as any,
                  createdAt: new Date(proposal.createdAt),
                  updatedAt: new Date(proposal.createdAt),
                  description: '',
                  evidence: [],
                  options: [],
                  positions: [],
                  deliberationOpenedAt: null,
                  votingOpenedAt: null,
                  decidedAt: null,
                  deliveryStartedAt: null,
                  reviewedAt: null,
                  archivedAt: null,
                  metadata: {},
                  deletedAt: null,
                }}
                clickable={true}
              />
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {requiresClarification
              ? 'Please review and clarify your proposal'
              : 'You can proceed or go back to edit'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onGoBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go Back & Edit
            </button>
            <button
              onClick={onProceed}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                requiresClarification
                  ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
            >
              {requiresClarification
                ? 'Proceed Anyway'
                : 'Continue With Proposal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
