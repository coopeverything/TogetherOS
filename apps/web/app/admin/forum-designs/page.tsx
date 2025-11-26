'use client'

import { useState } from 'react'
import type { Topic } from '@togetheros/types/forum'
import { FocusMode, Timeline, CardDeck, DenseGrid, Garden } from '@togetheros/ui/forum'

// Mock data for demonstration
const mockTopics: Topic[] = [
  {
    id: '1',
    title: 'Establishing Community Gardens Initiative',
    slug: 'establishing-community-gardens-initiative',
    description: 'Proposal to create shared gardening spaces across neighborhoods to promote food security and community connection.',
    category: 'proposal',
    status: 'open',
    isPinned: true,
    postCount: 34,
    participantCount: 12,
    authorId: 'user-1',
    isLocked: false,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 30),
    tags: ['agriculture', 'community', 'sustainability'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    title: 'How do timebanking transactions work?',
    slug: 'how-do-timebanking-transactions-work',
    description: 'New member here - can someone explain how to exchange hours and what counts as valid work?',
    category: 'question',
    status: 'resolved',
    isPinned: false,
    postCount: 8,
    participantCount: 5,
    authorId: 'user-2',
    isLocked: false,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    tags: ['timebanking', 'help', 'newbie'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    title: 'Weekly Deliberation: Cooperative Childcare Program',
    slug: 'weekly-deliberation-cooperative-childcare-program',
    description: 'Discussing the formation of a parent-run childcare cooperative with rotating schedules and shared resources.',
    category: 'deliberation',
    status: 'open',
    isPinned: false,
    postCount: 21,
    participantCount: 9,
    authorId: 'user-3',
    isLocked: false,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    tags: ['childcare', 'cooperation', 'families'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '4',
    title: 'New Member Orientation - January',
    slug: 'new-member-orientation-january',
    description: 'Welcome! This thread is for January newcomers to introduce themselves and learn about our community.',
    category: 'general',
    status: 'open',
    isPinned: true,
    postCount: 15,
    participantCount: 15,
    authorId: 'user-4',
    isLocked: false,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60),
    tags: ['welcome', 'orientation', 'introductions'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: '5',
    title: '[ANNOUNCEMENT] Platform Update v2.3 - New Features',
    slug: 'announcement-platform-update-v23-new-features',
    description: 'We have released several improvements including better search, notification controls, and mobile optimization.',
    category: 'announcement',
    status: 'open',
    isPinned: false,
    postCount: 6,
    participantCount: 4,
    authorId: 'user-5',
    isLocked: false,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    tags: ['updates', 'features', 'changelog'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: '6',
    title: 'Expanding Tool Library Access Hours',
    slug: 'expanding-tool-library-access-hours',
    description: 'Should we extend the community tool library hours to weekends and evenings?',
    category: 'proposal',
    status: 'open',
    isPinned: false,
    postCount: 2,
    participantCount: 2,
    authorId: 'user-6',
    isLocked: false,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    tags: ['tools', 'hours', 'access'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
  {
    id: '7',
    title: 'Skill Share: Basic Home Repair Workshop',
    slug: 'skill-share-basic-home-repair-workshop',
    description: 'Join us for hands-on learning about plumbing, electrical, and carpentry basics. Bring your questions!',
    category: 'general',
    status: 'archived',
    isPinned: false,
    postCount: 12,
    participantCount: 8,
    authorId: 'user-7',
    isLocked: false,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    tags: ['education', 'skills', 'workshop'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
]

type VariantKey = 'focus' | 'timeline' | 'cards' | 'grid' | 'garden'

const variants = {
  focus: {
    name: 'Focus Mode',
    description: 'Zen deliberation with generous whitespace, reading-optimized for deep attention',
    philosophy: 'Perfect for careful consideration and thoughtful responses',
    component: FocusMode,
  },
  timeline: {
    name: 'Timeline',
    description: 'Living conversation stream with activity visualization',
    philosophy: 'See community pulse and active discussions at a glance',
    component: Timeline,
  },
  cards: {
    name: 'Card Deck',
    description: 'Kanban-style organization for managing multiple deliberations',
    philosophy: 'Flexible personal organization with drag-and-drop',
    component: CardDeck,
  },
  grid: {
    name: 'Dense Grid',
    description: 'Spreadsheet-like power user interface with keyboard shortcuts',
    philosophy: 'Maximum information density for data-driven decision makers',
    component: DenseGrid,
  },
  garden: {
    name: 'Garden',
    description: 'Organic growth visualization with warm, human-centered aesthetic',
    philosophy: 'Topics as living things cultivated through patient deliberation',
    component: Garden,
  },
}

export default function ForumDesignsPage() {
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('focus')
  const [showMockData, setShowMockData] = useState(true)

  const currentVariant = variants[selectedVariant]
  const VariantComponent = currentVariant.component

  const handleTopicClick = (id: string) => {
    console.log('Topic clicked:', id)
  }

  const handleCreateTopic = () => {
    console.log('Create topic clicked')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Controls */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Forum Design Variations
          </h1>

          {/* Variant Selector */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">Design:</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(variants) as VariantKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedVariant(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedVariant === key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {variants[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Variant Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-1">
              {currentVariant.name}
            </h2>
            <p className="text-sm text-blue-800 mb-2">
              {currentVariant.description}
            </p>
            <p className="text-xs text-blue-700 italic">
              {currentVariant.philosophy}
            </p>
          </div>

          {/* Data Toggle */}
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Data:</label>
            <button
              onClick={() => setShowMockData(!showMockData)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showMockData
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {showMockData ? 'Mock Data (7 topics)' : 'Live Data (coming soon)'}
            </button>
          </div>
        </div>
      </div>

      {/* Variant Display */}
      <div className="flex-1 overflow-hidden">
        {showMockData ? (
          <VariantComponent
            topics={mockTopics}
            onTopicClick={handleTopicClick}
            onCreateTopic={handleCreateTopic}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">
                Live data integration coming soon
              </p>
              <p className="text-sm text-gray-500">
                Enable mock data to preview the design
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
