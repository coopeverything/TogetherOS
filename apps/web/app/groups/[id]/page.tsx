'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MemberDirectory, type Member } from '@togetheros/ui/groups/MemberDirectory'
import { InMemoryGroupRepo } from '../../../../api/src/modules/groups/repos/InMemoryGroupRepo'
import { getFixtureGroups, getFixtureMembers } from '../../../../api/src/modules/groups/fixtures'

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isMember, setIsMember] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  // Initialize repo with fixtures
  const repo = new InMemoryGroupRepo(getFixtureGroups())
  const allMembers = getFixtureMembers()

  // Find group
  const group = repo.getAll().find((g) => g.id === id)

  if (!group) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h1>
          <p className="text-gray-600 mb-6">The group you're looking for doesn't exist.</p>
          <Link
            href="/groups"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            ← Back to Groups
          </Link>
        </div>
      </div>
    )
  }

  // Get group members
  const groupMembers: Member[] = group.members
    .map((memberId) => allMembers.find((m) => m.id === memberId))
    .filter((m): m is Member => m !== undefined)

  const handleJoinLeave = async () => {
    setIsJoining(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsMember(!isMember)
    } catch (error) {
      console.error('Failed to join/leave group:', error)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Link */}
      <Link
        href="/groups"
        className="text-orange-600 hover:text-orange-700 text-sm font-medium mb-6 inline-block"
      >
        ← Back to Groups
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-orange-800 font-bold text-2xl">
                {group.name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{group.name}</h1>
              <p className="text-gray-600">@{group.handle}</p>
            </div>
          </div>

          {/* Join/Leave Button */}
          <button
            onClick={handleJoinLeave}
            disabled={isJoining}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isMember
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            } disabled:opacity-50`}
          >
            {isJoining ? 'Loading...' : isMember ? 'Leave Group' : 'Join Group'}
          </button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 items-center">
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
          </span>
          <span className="text-gray-600">{group.members.length} members</span>
          {group.location && <span className="text-gray-600">📍 {group.location}</span>}
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
          <p className="text-gray-700 leading-relaxed">{group.description}</p>
        </div>
      )}

      {/* Members */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Members ({groupMembers.length})
        </h2>
        <MemberDirectory members={groupMembers} />
      </div>

      {/* Proposals */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Group Proposals</p>
          <p className="text-gray-400 text-sm mt-2">
            Proposal component available - integrate with governance module
          </p>
        </div>
      </div>

      {/* Events */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Group Events</p>
          <p className="text-gray-400 text-sm mt-2">
            Event coordination component available
          </p>
        </div>
      </div>

      {/* Federation (for federated groups only) */}
      {group.type === 'federated' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Federation Status</p>
            <p className="text-gray-400 text-sm mt-2">
              Cross-instance connections and sync status
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
