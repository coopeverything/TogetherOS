'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { RoleAssignment, type GroupRole } from '@togetheros/ui/groups/RoleAssignment'
import type { GroupRoleType, Group } from '@togetheros/types/groups'
import { getFixtureMembers } from '../../../../../api/src/modules/groups/fixtures'

interface CurrentUser {
  id: string
  name?: string
  email?: string
}

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [roles, setRoles] = useState<GroupRole[]>([])
  const [group, setGroup] = useState<Group | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState(false)

  // Editable fields
  const [editedLocation, setEditedLocation] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const allMembers = getFixtureMembers()

  // Fetch current user, group, and roles on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch current user
        const userRes = await fetch('/api/auth/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setCurrentUser(userData.user)
        } else {
          // Not logged in, redirect to groups
          router.push('/groups')
          return
        }

        // Fetch group
        const groupRes = await fetch(`/api/groups/${id}`)
        if (groupRes.ok) {
          const groupData = await groupRes.json()
          setGroup(groupData.group)
          // Initialize editable fields
          setEditedLocation(groupData.group.location || '')
          setEditedDescription(groupData.group.description || '')
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
  }, [id, router])

  // Check if user has permission to access settings
  useEffect(() => {
    if (!loading && group && currentUser) {
      const isAdmin = roles.some(r => r.memberId === currentUser.id && r.role === 'admin')
      const isCreator = group.creatorId === currentUser.id

      if (!isAdmin && !isCreator) {
        // No permission, redirect to group page
        router.push(`/groups/${id}`)
      }
    }
  }, [loading, group, currentUser, roles, id, router])

  // Track changes
  useEffect(() => {
    if (group) {
      const locationChanged = editedLocation !== (group.location || '')
      const descriptionChanged = editedDescription !== (group.description || '')
      setHasChanges(locationChanged || descriptionChanged)
    }
  }, [editedLocation, editedDescription, group])

  const handleSaveChanges = async () => {
    if (!hasChanges || saving) return

    setSaving(true)
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: editedLocation.trim() || undefined,
          description: editedDescription.trim() || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGroup(data.group)
        setHasChanges(false)
        alert('Group updated successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update group')
      }
    } catch (err) {
      console.error('Failed to save changes:', err)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleArchiveGroup = async () => {
    if (archiving) return

    const confirmed = confirm(
      'Are you sure you want to archive this group?\n\n' +
      'The group will be hidden but can be restored later by an administrator.'
    )

    if (!confirmed) return

    setArchiving(true)
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Group archived successfully')
        router.push('/groups')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to archive group')
      }
    } catch (err) {
      console.error('Failed to archive group:', err)
      alert('Failed to archive group. Please try again.')
    } finally {
      setArchiving(false)
    }
  }

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
            &larr; Back to Groups
          </Link>
        </div>
      </div>
    )
  }

  const groupMembers = group.members
    .map((memberId) => allMembers.find((m) => m.id === memberId))
    .filter((m) => m !== undefined)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Back Link */}
      <Link
        href={`/groups/${id}`}
        className="text-joy-600 hover:text-joy-700 text-sm font-medium mb-3 inline-block"
      >
        &larr; Back to {group.name}
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
          <strong>Admin Access:</strong> Only group administrators and the group creator can access this page
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
          currentUserId={currentUser?.id || ''}
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
              className="w-full px-3 py-2 border border-border rounded-md bg-bg-0 text-ink-400"
            />
            <p className="mt-1 text-xs text-ink-400">Group name cannot be changed after creation</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Handle</label>
            <input
              type="text"
              value={`@${group.handle}`}
              readOnly
              className="w-full px-3 py-2 border border-border rounded-md bg-bg-0 text-ink-400"
            />
            <p className="mt-1 text-xs text-ink-400">Handles cannot be changed after creation</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Type</label>
            <input
              type="text"
              value={group.type.charAt(0).toUpperCase() + group.type.slice(1)}
              readOnly
              className="w-full px-3 py-2 border border-border rounded-md bg-bg-0 text-ink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Location</label>
            <input
              type="text"
              value={editedLocation}
              onChange={(e) => setEditedLocation(e.target.value)}
              placeholder="Enter location (optional)"
              className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Enter group description (optional)"
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              hasChanges && !saving
                ? 'bg-joy-600 text-bg-1 hover:bg-joy-700'
                : 'bg-ink-200 text-ink-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {hasChanges && (
            <span className="ml-3 text-sm text-ink-500">You have unsaved changes</span>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-danger-bg border border-danger/30 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-danger mb-3">Danger Zone</h2>
        <p className="text-danger/80 text-sm mb-4">
          Archiving a group will hide it from all members. The group can be restored later by an administrator.
        </p>
        <button
          onClick={handleArchiveGroup}
          disabled={archiving}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            archiving
              ? 'bg-danger/50 text-bg-1 cursor-not-allowed'
              : 'bg-danger text-bg-1 hover:bg-danger/90'
          }`}
        >
          {archiving ? 'Archiving...' : 'Archive Group'}
        </button>
      </div>
    </div>
  )
}
