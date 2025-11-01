// Thread view component (minimal for Phase 2)
'use client'

import type { ThreadPost } from '@togetheros/types'

export interface ThreadViewProps {
  posts: ThreadPost[]
  authorNames: Record<string, string>
  onReply: (content: string, parentId?: string) => void
}

export function ThreadView({ posts, authorNames, onReply }: ThreadViewProps) {
  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post.id} className={`bg-white rounded-lg border p-4 ${post.parentId ? 'ml-8' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{authorNames[post.authorId] || 'Unknown'}</span>
            <span className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>
      ))}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          Phase 2: Thread replies coming soon. Full discussion UI in next iteration.
        </p>
      </div>
    </div>
  )
}
