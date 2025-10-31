'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { RoleAssignment, type GroupRole } from '@togetheros/ui/groups/RoleAssignment'
import type { GroupRoleType } from '@togetheros/types/groups'
import { InMemoryGroupRepo } from '../../../../../api/src/modules/groups/repos/InMemoryGroupRepo'
import { getFixtureGroups, getFixtureMembers } from '../../../../../api/src/modules/groups/fixtures'

export default function GroupSettingsPage() {
  const params = useParams()
  const id = params.id as string
  const [roles, setRoles] = useState<GroupRole[]>([
    {
      id: 'role-1',
      memberId: 'member-alice',
      role: 'admin',
      grantedAt: new Date('2024-06-15T10:00:00Z'),
    },
    {
      id: 'role-2',
      memberId: 'member-bob',
      role: 'coordinator',
      grantedAt: new Date('2024-07-01T14:00:00Z'),
    },
  ])

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
          <Link href="/groups" className="text-orange-600 hover:text-orange-700 font-medium">
            ← Back to Groups
          </Link>
        </div>
      </div>
    )
  }

  const groupMembers = group.members
    .map((memberId) => allMembers.find((m) => m.id === memberId))
    .filter((m) => m !== undefined)

  const handleAssignRole = async (memberId: string, role: GroupRoleType) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newRole: GroupRole = {
      id: `role-${Date.now()}`,
      memberId,
      role,
      grantedAt: new Date(),
    }

    setRoles([...roles, newRole])
  }

  const handleRevokeRole = async (roleId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setRoles(roles.filter((r) => r.id !== roleId))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Link */}
      <Link
        href={`/groups/${id}`}
        className="text-orange-600 hover:text-orange-700 text-sm font-medium mb-6 inline-block"
      >
        ← Back to {group.name}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Group Settings</h1>
        <p className="text-lg text-gray-600">
          Manage roles, permissions, and group configuration
        </p>
      </div>

      {/* Admin Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-blue-800 text-sm">
          <strong>Admin Access:</strong> Only group administrators can access this page
        </p>
      </div>

      {/* Role Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Role Management</h2>
        <RoleAssignment
          roles={roles}
          members={groupMembers}
          onAssignRole={handleAssignRole}
          onRevokeRole={handleRevokeRole}
          currentUserId="member-alice"
        />
      </div>

      {/* Group Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Group Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input
              type="text"
              value={group.name}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
            <input
              type="text"
              value={`@${group.handle}`}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-500">Handles cannot be changed after creation</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <input
              type="text"
              value={group.type.charAt(0).toUpperCase() + group.type.slice(1)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          {group.location && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={group.location}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={group.description || ''}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium">
            Save Changes
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-3">Danger Zone</h2>
        <p className="text-red-700 text-sm mb-4">
          Deleting a group is permanent and cannot be undone. All data, proposals, and history
          will be lost.
        </p>
        <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium">
          Delete Group
        </button>
      </div>
    </div>
  )
}
