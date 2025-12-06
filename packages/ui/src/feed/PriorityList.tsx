// packages/ui/src/feed/PriorityList.tsx
// Personal priority list with drag-to-reorder and weight sliders (Phase 4)

'use client'

import { useState } from 'react'
import type { Priority } from '@togetheros/types'

export interface PriorityListProps {
  priorities: Priority[]
  onUpdatePriority: (topic: string, rank: number, weight: number) => void
  onRemovePriority: (topic: string) => void
  onAddPriority?: (topic: string) => void
  availableTopics?: string[]
}

export function PriorityList({
  priorities,
  onUpdatePriority,
  onRemovePriority,
  onAddPriority,
  availableTopics = [],
}: PriorityListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showAddTopic, setShowAddTopic] = useState(false)
  const [newTopic, setNewTopic] = useState('')

  // Sort by rank
  const sortedPriorities = [...priorities].sort((a, b) => a.rank - b.rank)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      return
    }

    const draggedPriority = sortedPriorities[draggedIndex]

    // Reorder: remove from old position, insert at new position
    const reordered = [...sortedPriorities]
    reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, draggedPriority)

    // Update ranks
    reordered.forEach((priority, index) => {
      onUpdatePriority(priority.topic, index + 1, priority.weight)
    })

    setDraggedIndex(null)
  }

  const handleWeightChange = (topic: string, weight: number) => {
    const priority = priorities.find(p => p.topic === topic)
    if (priority) {
      onUpdatePriority(topic, priority.rank, weight)
    }
  }

  const handleAddTopic = () => {
    if (newTopic.trim() && onAddPriority) {
      onAddPriority(newTopic.trim())
      setNewTopic('')
      setShowAddTopic(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Your Priorities</h2>
          <p className="text-sm text-gray-600 mt-1">
            Drag to reorder. Adjust sliders to show how much you care (1-10).
          </p>
        </div>
        {onAddPriority && (
          <button
            onClick={() => setShowAddTopic(!showAddTopic)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            + Add Topic
          </button>
        )}
      </div>

      {/* Add topic form */}
      {showAddTopic && onAddPriority && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Add a topic to prioritize</h3>
          {availableTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {availableTopics
                .filter(topic => !priorities.some(p => p.topic === topic))
                .map(topic => (
                  <button
                    key={topic}
                    onClick={() => {
                      onAddPriority(topic)
                      setShowAddTopic(false)
                    }}
                    className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
            </div>
          ) : null}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
              placeholder="Or enter a custom topic"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleAddTopic}
              disabled={!newTopic.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Priority list */}
      {sortedPriorities.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-600">
            You have not prioritized any topics yet.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Add topics to show what matters most to you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPriorities.map((priority, index) => (
            <div
              key={priority.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              className={`bg-white dark:bg-gray-800 border rounded-lg p-4 cursor-move hover:shadow-md transition-all ${
                draggedIndex === index ? 'opacity-50 border-orange-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Drag handle */}
                <div className="flex-shrink-0 mt-1">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                </div>

                {/* Rank badge */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{priority.topic}</h3>

                  {/* Weight slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">How much do you care?</span>
                      <span className="font-medium text-gray-900 dark:text-white">{priority.weight}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={priority.weight}
                      onChange={e => handleWeightChange(priority.topic, parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>A little</span>
                      <span>Somewhat</span>
                      <span>A lot</span>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemovePriority(priority.topic)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🔒 Your priorities are private</h3>
        <p className="text-sm text-gray-700">
          Only you can see your personal priority list. Only anonymous aggregate statistics
          (like "45% of community prioritizes housing") are public.
        </p>
      </div>
    </div>
  )
}
