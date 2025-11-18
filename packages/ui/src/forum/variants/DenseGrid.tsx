/**
 * Dense Grid Variant - Power User
 *
 * Philosophy: Maximum information density, keyboard-first
 * Perfect for data-driven decision makers
 */

'use client'

import { useState } from 'react'
import type { Topic } from '@togetheros/types/forum'

interface DenseGridProps {
  topics: Topic[]
  onTopicClick: (id: string) => void
  onCreateTopic: () => void
}

type SortField = 'title' | 'category' | 'status' | 'posts' | 'participants' | 'activity'
type SortDirection = 'asc' | 'desc'

export function DenseGrid({ topics, onTopicClick, onCreateTopic }: DenseGridProps) {
  const [sortField, setSortField] = useState<SortField>('activity')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filter, setFilter] = useState('')
  const [showCommandPalette, setShowCommandPalette] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedTopics = [...topics]
    .filter(t =>
      filter === '' ||
      t.title.toLowerCase().includes(filter.toLowerCase()) ||
      t.category.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1
      switch (sortField) {
        case 'title':
          return multiplier * a.title.localeCompare(b.title)
        case 'category':
          return multiplier * a.category.localeCompare(b.category)
        case 'status':
          return multiplier * a.status.localeCompare(b.status)
        case 'posts':
          return multiplier * (a.postCount - b.postCount)
        case 'participants':
          return multiplier * (a.participantCount - b.participantCount)
        case 'activity':
          return multiplier * (new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime())
        default:
          return 0
      }
    })

  const Column = ({ field, children, width }: { field: SortField; children: React.ReactNode; width: string }) => (
    <th
      className="text-left p-2 border-b border-[#2A2A2A] cursor-pointer hover:bg-[#2A2A2A] transition-colors"
      style={{ width, fontFamily: '"Cascadia Code", "Fira Code", monospace' }}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1 text-xs text-[#A3A3A3]">
        {children}
        {sortField === field && (
          <span className="text-[#FACC15]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  )

  return (
    <div className="h-screen bg-[#1A1A1A] text-[#E5E5E5] flex flex-col" style={{ fontFamily: '"Cascadia Code", "Fira Code", monospace' }}>
      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center pt-32 z-50" onClick={() => setShowCommandPalette(false)}>
          <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg w-[600px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              placeholder="Type a command..."
              className="w-full px-4 py-3 bg-transparent text-[#E5E5E5] text-sm focus:outline-none"
              autoFocus
            />
            <div className="border-t border-[#2A2A2A] p-2 text-xs text-[#A3A3A3] space-y-1">
              <div className="hover:bg-[#2A2A2A] px-2 py-1 rounded cursor-pointer">New Topic</div>
              <div className="hover:bg-[#2A2A2A] px-2 py-1 rounded cursor-pointer">Filter by Category</div>
              <div className="hover:bg-[#2A2A2A] px-2 py-1 rounded cursor-pointer">Sort by Activity</div>
              <div className="hover:bg-[#2A2A2A] px-2 py-1 rounded cursor-pointer">Export to CSV</div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-[#1F1F1F] border-b border-[#2A2A2A] px-4 py-2 flex items-center gap-4 flex-shrink-0">
        <span className="text-xs font-bold text-[#A3A3A3]">FORUM.GRID</span>
        <input
          type="text"
          placeholder="Filter topics... (Ctrl+F)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 max-w-xs px-3 py-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-xs text-[#E5E5E5] focus:outline-none focus:border-[#FACC15]"
        />
        <button
          onClick={() => setShowCommandPalette(true)}
          className="px-3 py-1 bg-[#2A2A2A] hover:bg-[#333333] rounded text-xs text-[#A3A3A3] flex items-center gap-2"
        >
          <span>⌘K</span>
          <span>Commands</span>
        </button>
        <button
          onClick={onCreateTopic}
          className="px-3 py-1 bg-[#22C55E] hover:bg-[#16A34A] rounded text-xs text-black font-bold"
        >
          NEW
        </button>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#1F1F1F] z-10">
            <tr>
              <Column field="title" width="35%">TITLE</Column>
              <Column field="category" width="12%">CATEGORY</Column>
              <Column field="status" width="10%">STATUS</Column>
              <Column field="posts" width="8%">POSTS</Column>
              <Column field="participants" width="10%">PARTS</Column>
              <Column field="activity" width="15%">LAST ACTIVITY</Column>
              <th className="text-left p-2 border-b border-[#2A2A2A] text-xs text-[#A3A3A3]" style={{ width: '10%' }}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTopics.map((topic, index) => {
              const statusColor = {
                open: '#22C55E',
                resolved: '#61AFEF',
                archived: '#6B6B6B',
                locked: '#EF4444',
              }[topic.status]

              return (
                <tr
                  key={topic.id}
                  className={`border-b border-[#2A2A2A] hover:bg-[#1F1F1F] cursor-pointer transition-colors ${
                    index % 2 === 1 ? 'bg-[#1F1F1F]' : ''
                  }`}
                  onClick={() => onTopicClick(topic.id)}
                  style={{ height: '28px' }}
                >
                  <td className="p-2 text-[#E5E5E5]">
                    <div className="flex items-center gap-2">
                      {topic.isPinned && <span className="text-[#F59E0B]">📌</span>}
                      <span className="truncate">{topic.title}</span>
                    </div>
                  </td>
                  <td className="p-2 text-[#98C379]">{topic.category}</td>
                  <td className="p-2">
                    <span style={{ color: statusColor }}>{topic.status}</span>
                  </td>
                  <td className="p-2 text-[#A3A3A3] text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {topic.postCount}
                  </td>
                  <td className="p-2 text-[#A3A3A3] text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {topic.participantCount}
                  </td>
                  <td className="p-2 text-[#A3A3A3]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(topic.lastActivityAt).toLocaleString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <button className="px-2 py-0.5 bg-[#2A2A2A] hover:bg-[#333333] rounded text-[10px]">
                        →
                      </button>
                      <button className="px-2 py-0.5 bg-[#2A2A2A] hover:bg-[#333333] rounded text-[10px]">
                        ⋮
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="bg-[#1F1F1F] border-t border-[#2A2A2A] px-4 py-1 flex items-center justify-between text-[10px] text-[#A3A3A3] flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>
            {sortedTopics.length} / {topics.length} topics
          </span>
          {filter && <span className="text-[#FACC15]">Filter active: "{filter}"</span>}
        </div>
        <div className="flex items-center gap-3">
          <span>⌘K: Commands</span>
          <span>j/k: Navigate</span>
          <span>?: Help</span>
        </div>
      </div>
    </div>
  )
}
