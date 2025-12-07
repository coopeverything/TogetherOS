/**
 * RoleAssignment Component
 *
 * Interface for assigning and managing group roles
 */

'use client'

import { useState } from 'react'
import type { GroupRoleType } from '@togetheros/types/groups'
import type { Member } from './MemberDirectory'

export interface GroupRole {
  id: string
  memberId: string
  role: GroupRoleType
  grantedAt: Date
  expiresAt?: Date
}

export interface RoleAssignmentProps {
  /** Current roles */
  roles: GroupRole[]

  /** Available members */
  members: Member[]

  /** Callback when role is assigned */
  onAssignRole?: (memberId: string, role: GroupRoleType) => Promise<void>

  /** Callback when role is revoked */
  onRevokeRole?: (roleId: string) => Promise<void>

  /** Current user ID (for permission checks) */
  currentUserId?: string

  /** Optional CSS class name */
  className?: string
}

function getRoleBadgeColor(role: GroupRoleType): string {
  switch (role) {
    case 'admin':
      return 'bg-danger-bg text-danger'
    case 'coordinator':
      return 'bg-accent-3-bg text-accent-3'
    case 'member':
      return 'bg-bg-2 text-ink-700'
  }
}

export function RoleAssignment({
  roles,
  members,
  onAssignRole,
  onRevokeRole,
  currentUserId,
  className = '',
}: RoleAssignmentProps) {
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedRole, setSelectedRole] = useState<GroupRoleType>('member')
  const [isAssigning, setIsAssigning] = useState(false)

  const handleAssign = async () => {
    if (!selectedMember || !onAssignRole) return

    setIsAssigning(true)
    try {
      await onAssignRole(selectedMember, selectedRole)
      setSelectedMember('')
      setSelectedRole('member')
    } catch (error) {
      console.error('Failed to assign role:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRevoke = async (roleId: string) => {
    if (!onRevokeRole) return

    try {
      await onRevokeRole(roleId)
    } catch (error) {
      console.error('Failed to revoke role:', error)
    }
  }

  // Get member details for roles
  const rolesWithMembers = roles.map((role) => ({
    ...role,
    member: members.find((m) => m.id === role.memberId),
  }))

  return (
    <div className={className}>
      {/* Add Role Form */}
      <div className="bg-bg-2 rounded-lg border border-border p-4 mb-3">
        <h3 className="text-sm font-semibold text-ink-900 mb-4">Assign Role</h3>
        <div className="flex gap-3">
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-bg-1 text-ink-900"
            disabled={isAssigning}
          >
            <option value="">Select member...</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName} (@{member.handle})
              </option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as GroupRoleType)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-bg-1 text-ink-900"
            disabled={isAssigning}
          >
            <option value="member">Member</option>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleAssign}
            disabled={!selectedMember || isAssigning}
            className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 disabled:bg-ink-400 transition-colors font-medium"
          >
            {isAssigning ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>

      {/* Current Roles */}
      <div>
        <h3 className="text-sm font-semibold text-ink-900 mb-4">Current Roles</h3>
        {rolesWithMembers.length === 0 ? (
          <p className="text-ink-400 text-center py-4">No roles assigned yet</p>
        ) : (
          <div className="space-y-3">
            {rolesWithMembers.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between bg-bg-1 rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-1-bg rounded-full flex items-center justify-center">
                    <span className="text-accent-1 font-bold text-sm">
                      {role.member?.displayName
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">{role.member?.displayName}</p>
                    <p className="text-sm text-ink-400">@{role.member?.handle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleBadgeColor(role.role)}`}>
                    {role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                  </span>
                  {onRevokeRole && role.memberId !== currentUserId && (
                    <button
                      onClick={() => handleRevoke(role.id)}
                      className="text-sm text-danger hover:opacity-80 font-medium"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
