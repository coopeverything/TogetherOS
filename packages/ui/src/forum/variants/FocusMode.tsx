/**
 * Focus Mode Variant - Zen Deliberation
 *
 * Philosophy: Generous whitespace, progressive disclosure, reading-optimized
 * Perfect for deep attention and careful deliberation
 */

'use client'

import { useState } from 'react'
import type { Topic } from '@togetheros/types/forum'

interface FocusModeProps {
  topics: Topic[]
  onTopicClick: (id: string) => void
  onCreateTopic: () => void
}

export function FocusMode({ topics, onTopicClick, onCreateTopic }: FocusModeProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [readingMode, setReadingMode] = useState(false)
  const [fontSize, setFontSize] = useState(16)

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    setReadingMode(false)
  }

  const categoryColors = {
    general: 'bg-gray-100 text-gray-800 border-gray-300',
    proposal: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    question: 'bg-blue-50 text-blue-900 border-blue-200',
    deliberation: 'bg-purple-50 text-purple-900 border-purple-200',
    announcement: 'bg-green-50 text-green-900 border-green-200',
  }

  return (
    <div className="flex h-screen bg-[#FAFAF9]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Left Panel - Topic List */}
      {!readingMode && (
        <div className="w-60 border-r border-[#E5E5E2] bg-white overflow-y-auto">
          <div className="p-6 border-b border-[#E5E5E2]">
            <h2 className="text-sm font-semibold text-[#6B6B68] uppercase tracking-wide mb-4">
              Topics
            </h2>
            <button
              onClick={onCreateTopic}
              className="w-full px-4 py-2 bg-[#EA580C] text-white rounded-lg text-sm font-medium hover:bg-[#C2410C] transition-colors"
            >
              New Topic
            </button>
          </div>

          <div className="p-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-all ${
                  selectedTopic?.id === topic.id
                    ? 'bg-[#FED7AA] shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {topic.isPinned && <span className="text-orange-500 text-xs">📌</span>}
                  <h3 className="text-sm font-medium text-[#1A1A19] line-clamp-2 flex-1">
                    {topic.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B6B68]">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${categoryColors[topic.category]}`}>
                    {topic.category}
                  </span>
                  <span>{topic.postCount} posts</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Center Panel - Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedTopic ? (
          <div className={`mx-auto px-12 py-16 ${readingMode ? 'max-w-[680px]' : 'max-w-[720px]'}`}>
            {/* Topic Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${categoryColors[selectedTopic.category]}`}>
                  {selectedTopic.category}
                </span>
                {selectedTopic.isPinned && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    Pinned
                  </span>
                )}
                <span className="text-sm text-[#6B6B68] ml-auto font-mono">
                  {selectedTopic.status}
                </span>
              </div>

              <h1
                className="font-serif text-4xl font-bold text-[#1A1A19] leading-tight mb-6"
                style={{ fontSize: `${fontSize * 2.5}px` }}
              >
                {selectedTopic.title}
              </h1>

              {selectedTopic.description && (
                <p
                  className="text-[#6B6B68] leading-relaxed"
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
                >
                  {selectedTopic.description}
                </p>
              )}

              {selectedTopic.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {selectedTopic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#E5E5E2] text-[#1A1A19] rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="border-t border-[#E5E5E2] pt-6 flex items-center gap-6 text-sm text-[#6B6B68]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">💬</span>
                <span>{selectedTopic.postCount} posts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">👥</span>
                <span>{selectedTopic.participantCount} participants</span>
              </div>
              <div className="flex items-center gap-2 ml-auto font-mono text-xs">
                Last activity: {new Date(selectedTopic.lastActivityAt).toLocaleDateString()}
              </div>
            </div>

            {/* Content Placeholder */}
            <div className="mt-12 space-y-6">
              <div className="p-6 bg-white rounded-lg border border-[#E5E5E2]">
                <p className="text-[#6B6B68]" style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}>
                  This is where the topic content and discussion would appear. In Focus Mode,
                  content is optimized for reading with generous whitespace and comfortable
                  typography.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-[#6B6B68]">
            <div className="text-center">
              <p className="text-lg mb-4">Select a topic to begin</p>
              <p className="text-sm">Use the left panel to browse topics</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Context & Tools */}
      {!readingMode && selectedTopic && (
        <div className="w-80 border-l border-[#E5E5E2] bg-white p-6 overflow-y-auto">
          {/* Reading Controls */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-[#6B6B68] uppercase tracking-wide mb-3">
              Reading Settings
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setReadingMode(!readingMode)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                {readingMode ? 'Exit' : 'Enter'} Reading Mode
              </button>

              <div>
                <label className="text-xs text-[#6B6B68] mb-1 block">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-[#6B6B68] uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-[#EA580C] text-white rounded-lg text-sm hover:bg-[#C2410C] transition-colors">
                Reply
              </button>
              <button className="w-full px-4 py-2 border border-[#E5E5E2] rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Subscribe
              </button>
              <button className="w-full px-4 py-2 border border-[#E5E5E2] rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Share
              </button>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h3 className="text-xs font-semibold text-[#6B6B68] uppercase tracking-wide mb-3">
              Participants
            </h3>
            <p className="text-sm text-[#6B6B68]">
              {selectedTopic.participantCount} people are participating in this discussion
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-8 pt-8 border-t border-[#E5E5E2]">
            <h3 className="text-xs font-semibold text-[#6B6B68] uppercase tracking-wide mb-3">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2 text-xs text-[#6B6B68] font-mono">
              <div className="flex justify-between">
                <span>j / k</span>
                <span>Next / Previous</span>
              </div>
              <div className="flex justify-between">
                <span>r</span>
                <span>Reply</span>
              </div>
              <div className="flex justify-between">
                <span>?</span>
                <span>Help</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
