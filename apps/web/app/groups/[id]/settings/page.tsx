'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { RoleAssignment, type GroupRole } from '@togetheros/ui/groups/RoleAssignment'
import type { GroupRoleType, Group } from '@togetheros/types/groups'
import { getFixtureMembers } from '../../../../../api/src/modules/groups/fixtures'

export default function GroupSettingsPage() {
  const params = useParams()
  const id = params.id as string
  const [roles, setRoles] = useState<GroupRole[]>([])
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)

  const allMembers = getFixtureMembers()

  // Fetch group and roles on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch group
        const groupRes = await fetch(`/api/groups/${id}`)
        if (groupRes.ok) {
          const groupData = await groupRes.json()
          setGroup(groupData.group)
        }

        // Fetch roles
        const rolesRes = await fetch(`/api/groups/${id}/roles`)
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json()
          setRoles(rolesData.roles || [])
        }
      } catch (err) {
        console.error('Failed to fetch group data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-ink-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="text-center">
          <h1 className="text-sm font-bold text-ink-900 mb-2">Group Not Found</h1>
          <p className="text-ink-700 mb-3">The group you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/groups" className="text-joy-600 hover:text-joy-700 font-medium">
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
    try {
      const response = await fetch(`/api/groups/${id}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role }),
      })

      if (response.ok) {
        const data = await response.json()
        setRoles([...roles, data.role])
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to assign role')
      }
    } catch (err) {
      console.error('Failed to assign role:', err)
      alert('Failed to assign role')
    }
  }

  const handleRevokeRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/groups/${id}/roles?roleId=${roleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setRoles(roles.filter((r) => r.id !== roleId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to revoke role')
      }
    } catch (err) {
      console.error('Failed to revoke role:', err)
      alert('Failed to revoke role')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Back Link */}
      <Link
        href={`/groups/${id}`}
        className="text-joy-600 hover:text-joy-700 text-sm font-medium mb-3 inline-block"
      >
        ← Back to {group.name}
      </Link>

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-sm font-bold text-ink-900 mb-2">Group Settings</h1>
        <p className="text-sm text-ink-700">
          Manage roles, permissions, and group configuration
        </p>
      </div>

      {/* Admin Notice */}
      <div className="bg-info-bg border border-info/30 rounded-lg p-4 mb-4">
        <p className="text-info text-sm">
          <strong>Admin Access:</strong> Only group administrators can access this page
        </p>
      </div>

      {/* Role Management */}
      <div className="bg-bg-1 rounded-lg border border-border p-4 mb-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Role Management</h2>
        <RoleAssignment
          roles={roles}
          members={groupMembers}
          onAssignRole={handleAssignRole}
          onRevokeRole={handleRevokeRole}
          currentUserId="member-alice"
        />
      </div>

      {/* Group Info */}
      <div className="bg-bg-1 rounded-lg border border-border p-4 mb-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Group Information</h2>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Group Name</label>
            <input
              type="text"
              value={group.name}
              readOnly
              className="w-full px-3 py-2 border border-border rounded-md bg-bg-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Handle</label>
            <input
              type="text"
              value={`@${group.handle}`}
              readOnly
              className="w-full px-3 py-2 border border-border rounded-md bg-bg-0"
            />
            <p className="mt-1 text-xs text-ink-400">Handles cannot be changed after creation</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Type</label>
            <input
              type="text"
              value={group.type.charAt(0).toUpperCase() + group.type.slice(1)}
              readOnly
              className="w-full px-3 py-2 border border-border rounded-md bg-bg-0"
            />
          </div>
          {group.location && (
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Location</label>
              <input
                type="text"
                value={group.location}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
            <textarea
              value={group.description || ''}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors font-medium">
            Save Changes
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-danger-bg border border-danger/30 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-danger mb-3">Danger Zone</h2>
        <p className="text-danger/80 text-sm mb-4">
          Deleting a group is permanent and cannot be undone. All data, proposals, and history
          will be lost.
        </p>
        <button className="px-4 py-2 bg-danger text-bg-1 rounded-md hover:bg-danger/90 transition-colors font-medium">
          Delete Group
        </button>
      </div>
    </div>
  )
}
