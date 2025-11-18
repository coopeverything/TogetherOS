/**
 * Timeline Variant - Living Conversation
 *
 * Philosophy: Activity feed with participation visualization
 * Perfect for seeing community pulse and active discussions
 */

'use client'

import type { Topic } from '@togetheros/types/forum'

interface TimelineProps {
  topics: Topic[]
  onTopicClick: (id: string) => void
  onCreateTopic: () => void
}

export function Timeline({ topics, onTopicClick, onCreateTopic }: TimelineProps) {
  const sortedTopics = [...topics].sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  )

  const categoryColors = {
    general: 'bg-gray-100 text-gray-700',
    proposal: 'bg-yellow-100 text-yellow-800',
    question: 'bg-blue-100 text-blue-800',
    deliberation: 'bg-purple-100 text-purple-800',
    announcement: 'bg-green-100 text-green-800',
  }

  const getActivityLevel = (topic: Topic) => {
    if (topic.postCount > 20) return { color: '#DC2626', label: 'Hot' }
    if (topic.postCount > 10) return { color: '#F59E0B', label: 'Active' }
    return { color: '#10B981', label: 'New' }
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Activity Timeline
            </h1>
            <button
              onClick={onCreateTopic}
              className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors"
            >
              New Topic
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            <button className="px-3 py-1.5 bg-[#E2E8F0] text-[#1E293B] rounded-md text-sm font-medium">
              All
            </button>
            <button className="px-3 py-1.5 text-[#64748B] rounded-md text-sm hover:bg-[#E2E8F0]">
              Active
            </button>
            <button className="px-3 py-1.5 text-[#64748B] rounded-md text-sm hover:bg-[#E2E8F0]">
              Following
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="relative">
          {/* Timeline Spine */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CBD5E1]" />

          {/* Timeline Items */}
          <div className="space-y-6">
            {sortedTopics.map((topic, index) => {
              const activity = getActivityLevel(topic)
              const timeAgo = Math.floor(
                (Date.now() - new Date(topic.lastActivityAt).getTime()) / (1000 * 60)
              )

              return (
                <div key={topic.id} className="relative pl-8">
                  {/* Activity Dot */}
                  <div
                    className="absolute left-[-6px] top-6 w-3 h-3 rounded-full border-4 border-[#F0F4F8]"
                    style={{ backgroundColor: activity.color }}
                  />

                  {/* Card */}
                  <button
                    onClick={() => onTopicClick(topic.id)}
                    className="w-full text-left bg-white rounded-lg border border-[#E2E8F0] p-6 hover:shadow-md transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[topic.category]}`}>
                          {topic.category}
                        </span>
                        {topic.isPinned && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                            Pinned
                          </span>
                        )}
                        <span
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: activity.color }}
                        >
                          {activity.label}
                        </span>
                      </div>
                      <span className="text-xs text-[#64748B] whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo / 60)}h ago`}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                      {topic.title}
                    </h3>

                    {/* Description */}
                    {topic.description && (
                      <p className="text-sm text-[#64748B] mb-4 line-clamp-2">
                        {topic.description}
                      </p>
                    )}

                    {/* Participation Bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((topic.postCount / 30) * 100, 100)}%`,
                            background: 'linear-gradient(to right, #F59E0B, #DC2626)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-[#64748B]">
                      <span>💬 {topic.postCount} posts</span>
                      <span>👥 {topic.participantCount} participants</span>
                      {topic.tags.length > 0 && (
                        <span>🏷️ {topic.tags.length} tags</span>
                      )}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-6 py-3 text-[#64748B] hover:text-[#1E293B] text-sm font-medium">
            Load more topics...
          </button>
        </div>
      </div>
    </div>
  )
}
