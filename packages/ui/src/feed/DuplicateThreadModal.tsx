// packages/ui/src/feed/DuplicateThreadModal.tsx
// Modal to prevent duplicate discussion threads (Phase 3: Bridge intelligence)

'use client'

import type { DiscussionThread } from '@togetheros/types'

export interface SimilarThread {
  thread: DiscussionThread
  similarity: number
  matchedKeywords: string[]
}

export interface DuplicateThreadModalProps {
  isOpen: boolean
  onClose: () => void
  similarThreads: SimilarThread[]
  onJoinThread: (threadId: string) => void
  onCreateNew: () => void
  proposedTitle: string
}

export function DuplicateThreadModal({
  isOpen,
  onClose,
  similarThreads,
  onJoinThread,
  onCreateNew,
  proposedTitle,
}: DuplicateThreadModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Similar Discussions Found</h2>
              <p className="text-sm text-gray-600 mt-1">
                Bridge found {similarThreads.length} similar discussion{similarThreads.length !== 1 ? 's' : ''}.
                Join an existing one or start a new discussion.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Your proposed discussion */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Your proposed discussion:</h3>
          <p className="text-gray-700">{proposedTitle}</p>
        </div>

        {/* Similar threads list */}
        <div className="px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Existing discussions:</h3>
          <div className="space-y-3">
            {similarThreads.map(({ thread, similarity, matchedKeywords }) => (
              <div
                key={thread.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{thread.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>💬 {thread.postCount} {thread.postCount === 1 ? 'post' : 'posts'}</span>
                      <span>👥 {thread.participantCount} {thread.participantCount === 1 ? 'participant' : 'participants'}</span>
                      <span className="text-xs text-gray-500">
                        Last activity: {new Date(thread.lastActivityAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div
                    className="ml-4 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
                    style={{
                      backgroundColor: similarity > 0.7
                        ? '#dcfce7'
                        : similarity > 0.4
                          ? '#fef3c7'
                          : '#fee2e2',
                      color: similarity > 0.7
                        ? '#166534'
                        : similarity > 0.4
                          ? '#92400e'
                          : '#991b1b',
                    }}
                  >
                    {Math.round(similarity * 100)}% similar
                  </div>
                </div>

                {matchedKeywords.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">Matched keywords: </span>
                    {matchedKeywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full mr-1 mb-1"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => onJoinThread(thread.id)}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Join This Discussion
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - option to create new anyway */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-600 text-xs">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Creating duplicate discussions fragments the conversation
                and makes it harder for the community to reach consensus. Consider joining an
                existing thread if your topic is covered.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Create New Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
