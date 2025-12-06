/**
 * Garden Variant - Organic Growth
 *
 * Philosophy: Topics as living things, warm community aesthetic
 * Perfect for deliberation as cultivation and patient growth
 */

'use client'

import { useState } from 'react'
import type { Topic } from '@togetheros/types/forum'

interface GardenProps {
  topics: Topic[]
  onTopicClick: (id: string) => void
  onCreateTopic: () => void
}

export function Garden({ topics, onTopicClick, onCreateTopic }: GardenProps) {
  const [filter, setFilter] = useState<string>('all')

  const categoryColors = {
    general: { bg: '#E8DCC0', border: '#C9B58A', text: '#6B5B3C' },
    proposal: { bg: '#FFE5CC', border: '#F5C896', text: '#8B6F3E' },
    question: { bg: '#D9E5F2', border: '#A8C8E8', text: '#3E5B8B' },
    deliberation: { bg: '#E6D9F2', border: '#C9A8E8', text: '#5B3E8B' },
    announcement: { bg: '#D9F2E6', border: '#A8E8C9', text: '#3E8B5B' },
  }

  const getGrowthStage = (topic: Topic) => {
    if (topic.postCount === 0) return { emoji: '🌱', label: 'Seedling', size: 'sm' }
    if (topic.postCount < 5) return { emoji: '🌿', label: 'Sprouting', size: 'md' }
    if (topic.postCount < 15) return { emoji: '🪴', label: 'Growing', size: 'lg' }
    if (topic.postCount < 30) return { emoji: '🌳', label: 'Flourishing', size: 'xl' }
    return { emoji: '🌸', label: 'Blooming', size: '2xl' }
  }

  const filteredTopics = topics.filter(t => {
    if (filter === 'all') return true
    if (filter === 'active') return t.status === 'open' && t.postCount > 0
    if (filter === 'new') return t.postCount === 0
    return t.category === filter
  })

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(to bottom, #FEF6E4 0%, #F3E5CF 100%)',
      fontFamily: 'Georgia, "Times New Roman", serif'
    }}>
      {/* Header */}
      <div className="border-b-2" style={{
        borderColor: '#C9B58A',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-[#6B5B3C]" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Community Garden
            </h1>
            <button
              onClick={onCreateTopic}
              className="px-6 py-3 bg-[#8B6F3E] text-white rounded-full text-lg font-medium hover:bg-[#6B5B3C] transition-all shadow-md hover:shadow-lg"
            >
              🌱 Plant a Topic
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'new', 'general', 'proposal', 'question', 'deliberation', 'announcement'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-full text-base font-medium capitalize transition-all"
                style={{
                  background: filter === f ? '#8B6F3E' : 'rgba(255, 255, 255, 0.8)',
                  color: filter === f ? 'white' : '#6B5B3C',
                  border: filter === f ? 'none' : '2px solid #C9B58A'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Garden Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => {
            const growth = getGrowthStage(topic)
            const colors = categoryColors[topic.category]
            const daysSinceActivity = Math.floor(
              (Date.now() - new Date(topic.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <button
                key={topic.id}
                onClick={() => onTopicClick(topic.id)}
                className="text-left rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden"
                style={{
                  background: colors.bg,
                  border: `3px solid ${colors.border}`,
                  borderRadius: '24px',
                }}
              >
                {/* Growth Stage Header */}
                <div className="p-4 border-b-2" style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-${growth.size}`}>{growth.emoji}</span>
                    <span className="text-sm font-medium px-3 py-1.5 rounded-full" style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      color: colors.text
                    }}>
                      {growth.label}
                    </span>
                  </div>
                  {topic.isPinned && (
                    <span className="inline-block px-3 py-1.5 bg-[#F5C896] text-[#8B6F3E] rounded-full text-sm font-medium">
                      📌 Pinned
                    </span>
                  )}
                </div>

                {/* Topic Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2" style={{ color: colors.text }}>
                    {topic.title}
                  </h3>

                  {topic.description && (
                    <p className="text-base mb-3 line-clamp-2 opacity-80" style={{ color: colors.text }}>
                      {topic.description}
                    </p>
                  )}

                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm px-3 py-1.5 rounded-full font-medium" style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      color: colors.text
                    }}>
                      {topic.category}
                    </span>
                    {topic.status !== 'open' && (
                      <span className="text-sm px-3 py-1.5 rounded-full font-medium" style={{
                        background: topic.status === 'resolved' ? '#A8E8C9' : '#E8DCC0',
                        color: '#3E8B5B'
                      }}>
                        {topic.status}
                      </span>
                    )}
                  </div>

                  {/* Garden Metrics */}
                  <div className="flex items-center justify-between text-base" style={{ color: colors.text }}>
                    <div className="flex items-center gap-4">
                      <span>💬 {topic.postCount}</span>
                      <span>👥 {topic.participantCount}</span>
                    </div>
                    <span className="text-sm opacity-70">
                      {daysSinceActivity === 0 ? 'Today' : `${daysSinceActivity}d ago`}
                    </span>
                  </div>

                  {/* Growth Visualization */}
                  <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((topic.postCount / 30) * 100, 100)}%`,
                        background: `linear-gradient(to right, ${colors.border}, #8B6F3E)`,
                      }}
                    />
                  </div>
                </div>

                {/* Tags */}
                {topic.tags.length > 0 && (
                  <div className="px-4 pb-4 flex flex-wrap gap-1">
                    {topic.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-sm px-3 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(255, 255, 255, 0.6)',
                          color: colors.text
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {topic.tags.length > 3 && (
                      <span className="text-sm px-3 py-0.5 opacity-60" style={{ color: colors.text }}>
                        +{topic.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-2xl text-[#6B5B3C] mb-2">No topics in this garden yet</p>
            <p className="text-base text-[#8B6F3E]">Plant the first seed to start growing your community</p>
          </div>
        )}
      </div>

      {/* Garden Stats Footer */}
      <div className="border-t-2" style={{ borderColor: '#C9B58A', background: 'rgba(255, 255, 255, 0.6)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-base text-[#6B5B3C]">
            <div className="flex items-center gap-6">
              <span>🌱 {topics.filter(t => t.postCount === 0).length} seedlings</span>
              <span>🌿 {topics.filter(t => t.postCount > 0 && t.postCount < 5).length} sprouting</span>
              <span>🪴 {topics.filter(t => t.postCount >= 5 && t.postCount < 15).length} growing</span>
              <span>🌳 {topics.filter(t => t.postCount >= 15 && t.postCount < 30).length} flourishing</span>
              <span>🌸 {topics.filter(t => t.postCount >= 30).length} blooming</span>
            </div>
            <span className="opacity-70">
              {filteredTopics.length} of {topics.length} topics shown
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
