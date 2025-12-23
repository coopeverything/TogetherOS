'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GroupList } from '@togetheros/ui/groups'
import type { Group } from '@togetheros/types/groups'

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch groups from API
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups')
        if (response.ok) {
          const data = await response.json()
          setGroups(data.groups || [])
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-sm font-bold text-ink-900">Groups & Organizations</h1>
          <Link
            href="/groups/new"
            className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors font-medium"
          >
            Create Group
          </Link>
        </div>
        <p className="text-sm text-ink-700 max-w-3xl">
          Create and manage cooperative groups, organizations, and communities with transparent governance and shared resources.
        </p>
      </div>

      {/* What You Can Do */}
      <div className="bg-bg-1 rounded-lg border border-border p-4 mb-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <ul className="space-y-2 text-ink-700">
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Create and join cooperative groups
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Share resources (tools, spaces, skills, time)
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Organize events and track RSVPs
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                View membership directory
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Assign roles with term limits
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Create group proposals and decisions
              </li>
            </ul>
            <div className="mt-4 p-3 bg-joy-50 dark:bg-joy-900/20 rounded-md border border-joy-200 dark:border-joy-800">
              <p className="text-sm font-medium text-joy-800 dark:text-joy-200">Get Started</p>
              <p className="text-sm text-joy-700 dark:text-joy-300">Browse groups below and click one to see its resources, events, and members—or create your own group.</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-ink-900 mb-2">Cooperation Paths</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-accent-3-bg text-accent-3 text-sm rounded-full">
                Community Connection
              </span>
              <span className="px-3 py-1 bg-accent-1-bg text-accent-1 text-sm rounded-full">
                Collective Governance
              </span>
              <span className="px-3 py-1 bg-success-bg text-success text-sm rounded-full">
                Social Economy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Group List */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Browse Groups</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-bg-2 rounded-lg p-4 h-48" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="text-ink-400 text-center py-8">No groups found. Create one to get started!</p>
        ) : (
          <GroupList groups={groups} />
        )}
      </div>

    </div>
  )
}
