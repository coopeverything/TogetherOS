/**
 * Card Deck Variant - Flexible Organization
 *
 * Philosophy: Kanban-style personal organization
 * Perfect for managing multiple deliberations
 */

'use client'

import { useState } from 'react'
import type { Topic } from '@togetheros/types/forum'

interface CardDeckProps {
  topics: Topic[]
  onTopicClick: (id: string) => void
  onCreateTopic: () => void
}

export function CardDeck({ topics, onTopicClick, onCreateTopic }: CardDeckProps) {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())

  const categoryColors = {
    general: 'border-l-gray-400',
    proposal: 'border-l-yellow-500',
    question: 'border-l-blue-500',
    deliberation: 'border-l-purple-500',
    announcement: 'border-l-green-500',
  }

  // Organize topics by status
  const columns = [
    { id: 'open', title: 'Open', topics: topics.filter(t => t.status === 'open') },
    { id: 'active', title: 'Active', topics: topics.filter(t => t.postCount > 5 && t.status === 'open') },
    { id: 'resolved', title: 'Resolved', topics: topics.filter(t => t.status === 'resolved') },
    { id: 'archived', title: 'Archived', topics: topics.filter(t => t.status === 'archived') },
  ]

  const toggleCardSelection = (id: string) => {
    const newSelected = new Set(selectedCards)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCards(newSelected)
  }

  return (
    <div className="h-screen bg-[#F7F7F5] flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Card Deck</h1>
          <div className="flex items-center gap-4">
            {selectedCards.size > 0 && (
              <span className="text-base text-gray-600">
                {selectedCards.size} selected
              </span>
            )}
            <button
              onClick={onCreateTopic}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
            >
              + New Card
            </button>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-[280px] flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm uppercase tracking-wide font-semibold text-gray-600">
                  {column.title}
                </h2>
                <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1.5 rounded-full">
                  {column.topics.length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex-1 overflow-y-auto space-y-3 bg-white dark:bg-gray-800/50 rounded-lg p-2">
                {column.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => onTopicClick(topic.id)}
                    onDoubleClick={() => toggleCardSelection(topic.id)}
                    className={`w-full text-left bg-[#FEFEFE] rounded-lg border-l-4 ${categoryColors[topic.category]} shadow-sm hover:shadow-md transition-all p-4 ${
                      selectedCards.has(topic.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">
                        {topic.title}
                      </h3>
                      {topic.isPinned && (
                        <span className="text-orange-500 text-sm ml-2">📌</span>
                      )}
                    </div>

                    {/* Card Metadata */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-gray-600">
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                          {topic.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>💬 {topic.postCount}</span>
                        <span>👥 {topic.participantCount}</span>
                      </div>

                      {/* Activity Sparkline */}
                      <div className="h-6 flex items-end gap-0.5">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const height = Math.random() * 100
                          return (
                            <div
                              key={i}
                              className="flex-1 bg-blue-200 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </button>
                ))}

                {column.topics.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-base">
                    No {column.title.toLowerCase()} topics
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      {selectedCards.size > 0 && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <span className="text-base font-medium text-gray-700">
            {selectedCards.size} card{selectedCards.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5.5 text-base border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:bg-gray-900">
              Archive
            </button>
            <button className="px-3 py-1.5.5 text-base border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:bg-gray-900">
              Move to...
            </button>
            <button
              onClick={() => setSelectedCards(new Set())}
              className="px-3 py-1.5.5 text-base text-gray-600 hover:text-gray-900 dark:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
