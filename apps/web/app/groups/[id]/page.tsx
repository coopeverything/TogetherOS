'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MemberDirectory, type Member } from '@togetheros/ui/groups/MemberDirectory'
import { LocalStorageGroupRepo } from '../../../lib/repos/LocalStorageGroupRepo'
import { getFixtureGroups, getFixtureMembers } from '../../../../api/src/modules/groups/fixtures'
import type { Group } from '@togetheros/types/groups'
import type { Post } from '@togetheros/types/feed'
import type { Topic } from '@togetheros/types/forum'
import type { Proposal } from '@togetheros/types/governance'
import type { GroupEvent, GroupResource, GroupEventType, GroupResourceType, GroupRole, GroupRoleType } from '@togetheros/types/groups'

type TabType = 'feed' | 'forum' | 'members' | 'events' | 'resources' | 'proposals' | 'roles'

export default function GroupDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [isMember, setIsMember] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('feed')

  // Feed state
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  // Forum state
  const [topics, setTopics] = useState<Topic[]>([])
  const [loadingTopics, setLoadingTopics] = useState(false)

  // Proposals state
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loadingProposals, setLoadingProposals] = useState(false)

  // Events state
  const [events, setEvents] = useState<GroupEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  // Resources state
  const [resources, setResources] = useState<GroupResource[]>([])
  const [loadingResources, setLoadingResources] = useState(false)

  // Roles state
  const [roles, setRoles] = useState<GroupRole[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Initialize repo with fixtures (loads from localStorage if available)
  const repo = new LocalStorageGroupRepo(getFixtureGroups())
  const allMembers = getFixtureMembers()

  // Find group
  const group = repo.getAll().find((g: Group) => g.id === id)

  // Fetch group feed posts
  useEffect(() => {
    if (activeTab === 'feed' && group) {
      fetchGroupPosts()
    }
  }, [activeTab, id])

  // Fetch group forum topics
  useEffect(() => {
    if (activeTab === 'forum' && group) {
      fetchGroupTopics()
    }
  }, [activeTab, id])

  // Fetch group proposals
  useEffect(() => {
    if (activeTab === 'proposals' && group) {
      fetchGroupProposals()
    }
  }, [activeTab, id])

  // Fetch group events
  useEffect(() => {
    if (activeTab === 'events' && group) {
      fetchGroupEvents()
    }
  }, [activeTab, id])

  // Fetch group resources
  useEffect(() => {
    if (activeTab === 'resources' && group) {
      fetchGroupResources()
    }
  }, [activeTab, id])

  // Fetch group roles
  useEffect(() => {
    if (activeTab === 'roles' && group) {
      fetchGroupRoles()
    }
  }, [activeTab, id])

  async function fetchGroupPosts() {
    setLoadingPosts(true)
    try {
      const response = await fetch(`/api/feed?groupId=${id}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (err) {
      console.error('Failed to fetch group posts:', err)
    } finally {
      setLoadingPosts(false)
    }
  }

  async function fetchGroupTopics() {
    setLoadingTopics(true)
    try {
      const response = await fetch(`/api/forum/topics?groupId=${id}`)
      if (response.ok) {
        const data = await response.json()
        setTopics(data.topics || [])
      }
    } catch (err) {
      console.error('Failed to fetch group topics:', err)
    } finally {
      setLoadingTopics(false)
    }
  }

  async function fetchGroupProposals() {
    setLoadingProposals(true)
    try {
      const response = await fetch(`/api/proposals?scopeType=group&scopeId=${id}`)
      if (response.ok) {
        const data = await response.json()
        setProposals(data.proposals || [])
      }
    } catch (err) {
      console.error('Failed to fetch group proposals:', err)
    } finally {
      setLoadingProposals(false)
    }
  }

  async function fetchGroupEvents() {
    setLoadingEvents(true)
    try {
      const response = await fetch(`/api/groups/${id}/events`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (err) {
      console.error('Failed to fetch group events:', err)
    } finally {
      setLoadingEvents(false)
    }
  }

  async function fetchGroupResources() {
    setLoadingResources(true)
    try {
      const response = await fetch(`/api/groups/${id}/resources`)
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources || [])
      }
    } catch (err) {
      console.error('Failed to fetch group resources:', err)
    } finally {
      setLoadingResources(false)
    }
  }

  async function fetchGroupRoles() {
    setLoadingRoles(true)
    try {
      const response = await fetch(`/api/groups/${id}/roles`)
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles || [])
      }
    } catch (err) {
      console.error('Failed to fetch group roles:', err)
    } finally {
      setLoadingRoles(false)
    }
  }

  if (!group) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="text-center">
          <h1 className="text-sm font-bold text-ink-900 mb-2">Group Not Found</h1>
          <p className="text-ink-700 mb-3">The group you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/groups"
            className="text-joy-600 hover:text-joy-700 font-medium"
          >
            ← Back to Groups
          </Link>
        </div>
      </div>
    )
  }

  // Get group members
  const groupMembers = group.members
    .map((memberId: string) => allMembers.find((m: Member) => m.id === memberId))
    .filter((m): m is Member => m !== undefined)

  const handleJoinLeave = async () => {
    setIsJoining(true)
    try {
      const method = isMember ? 'DELETE' : 'POST'
      const response = await fetch(`/api/groups/${id}/members`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        setIsMember(!isMember)
        // Refresh page data to update member list
        window.location.reload()
      } else {
        const data = await response.json()
        console.error('Failed to join/leave group:', data.error)
        alert(data.error || 'Failed to update membership')
      }
    } catch (error) {
      console.error('Failed to join/leave group:', error)
      alert('Failed to update membership')
    } finally {
      setIsJoining(false)
    }
  }

  // Calculate stats
  const groupStats = {
    postsThisWeek: posts.length,
    activeDiscussions: topics.filter(t => t.status === 'open').length,
    totalMembers: group.members.length,
  }

  // Get trending topics (most posts)
  const trendingTopics = topics
    .filter(t => t.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5)

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'feed', label: 'Feed', icon: '📰' },
    { id: 'forum', label: 'Forum', icon: '💬' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'resources', label: 'Resources', icon: '🧰' },
    { id: 'proposals', label: 'Proposals', icon: '📋' },
    { id: 'roles', label: 'Roles', icon: '👔' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-4">
      {/* Back Link */}
      <Link
        href="/groups"
        className="text-joy-600 hover:text-joy-700 text-sm font-medium mb-3 inline-block"
      >
        ← Back to Groups
      </Link>

      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-joy-bg rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-joy-700 font-bold text-sm">
                {group.name
                  .split(' ')
                  .map((word: string) => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-ink-900 mb-1">{group.name}</h1>
              <p className="text-ink-700">@{group.handle}</p>
              <div className="flex flex-wrap gap-3 items-center mt-2">
                <span className="px-2 py-0.5 bg-success-bg text-success text-xs font-medium rounded-full">
                  {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                </span>
                <span className="text-ink-700 text-sm">{group.members.length} members</span>
                {group.location && <span className="text-ink-700 text-sm">📍 {group.location}</span>}
              </div>
            </div>
          </div>

          {/* Join/Leave Button */}
          <button
            onClick={handleJoinLeave}
            disabled={isJoining}
            className={`px-5 py-2 rounded-md font-medium text-sm transition-colors ${
              isMember
                ? 'bg-bg-2 text-ink-700 hover:bg-bg-2'
                : 'bg-joy-600 text-bg-1 hover:bg-joy-700'
            } disabled:opacity-50`}
          >
            {isJoining ? 'Loading...' : isMember ? 'Leave Group' : 'Join Group'}
          </button>
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-ink-700 text-sm leading-relaxed max-w-3xl">
            {group.description}
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-3">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-joy-600 text-joy-600'
                  : 'border-transparent text-ink-400 hover:text-ink-700 hover:border-border'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Tab Content */}
        <div>
          {activeTab === 'feed' && (
            <GroupFeedTab
              posts={posts}
              loading={loadingPosts}
              groupId={id}
              groupName={group.name}
              onPostCreated={fetchGroupPosts}
            />
          )}

          {activeTab === 'forum' && (
            <GroupForumTab
              topics={topics}
              loading={loadingTopics}
              groupId={id}
              groupName={group.name}
              onTopicCreated={fetchGroupTopics}
            />
          )}

          {activeTab === 'members' && (
            <GroupMembersTab
              members={groupMembers}
              groupId={id}
              roles={roles}
              onMemberRemoved={() => window.location.reload()}
            />
          )}

          {activeTab === 'events' && (
            <GroupEventsTab
              events={events}
              loading={loadingEvents}
              groupId={id}
              groupName={group.name}
              onEventCreated={fetchGroupEvents}
            />
          )}

          {activeTab === 'resources' && (
            <GroupResourcesTab
              resources={resources}
              loading={loadingResources}
              groupId={id}
              groupName={group.name}
              onResourceCreated={fetchGroupResources}
            />
          )}

          {activeTab === 'proposals' && (
            <GroupProposalsTab
              proposals={proposals}
              loading={loadingProposals}
              groupId={id}
              groupName={group.name}
              onProposalCreated={fetchGroupProposals}
            />
          )}

          {activeTab === 'roles' && (
            <GroupRolesTab
              roles={roles}
              loading={loadingRoles}
              groupId={id}
              members={group.members}
              onRoleChanged={fetchGroupRoles}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-2">
          {/* Group Stats */}
          <div className="bg-bg-1 rounded-lg border border-border p-4">
            <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
              <span>📊</span> Group Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-700">Posts this week</span>
                <span className="font-medium text-ink-900">{groupStats.postsThisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-700">Active discussions</span>
                <span className="font-medium text-ink-900">{groupStats.activeDiscussions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-700">Total members</span>
                <span className="font-medium text-ink-900">{groupStats.totalMembers}</span>
              </div>
            </div>
          </div>

          {/* Trending in Group */}
          <div className="bg-bg-1 rounded-lg border border-border p-4">
            <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
              <span className="text-joy-600">🔥</span> Trending in Group
            </h3>
            {trendingTopics.length === 0 ? (
              <p className="text-sm text-ink-400">No trending topics yet</p>
            ) : (
              <div className="space-y-2">
                {trendingTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/forum/${topic.slug || topic.id}`}
                    className="block p-2 rounded hover:bg-bg-0 transition-colors"
                  >
                    <div className="text-sm font-medium text-ink-900 line-clamp-2">
                      {topic.title}
                    </div>
                    <div className="text-xs text-ink-400 mt-1">
                      {topic.postCount} posts
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Active Members */}
          <div className="bg-bg-1 rounded-lg border border-border p-4">
            <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
              <span>👥</span> Active Members
            </h3>
            <div className="flex flex-wrap gap-2">
              {groupMembers.slice(0, 8).map((member) => (
                <div
                  key={member.id}
                  className="w-8 h-8 bg-bg-2 rounded-full flex items-center justify-center text-xs font-medium text-ink-700"
                  title={member.displayName}
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
              ))}
              {groupMembers.length > 8 && (
                <div className="w-8 h-8 bg-joy-bg rounded-full flex items-center justify-center text-xs font-medium text-joy-700">
                  +{groupMembers.length - 8}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// Group Members Tab Component with Admin Actions
function GroupMembersTab({
  members,
  groupId,
  roles,
  onMemberRemoved,
}: {
  members: Member[]
  groupId: string
  roles: GroupRole[]
  onMemberRemoved: () => void
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<{ id: string; userId: string; requestedAt: string }[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  // Fetch current user and check if admin
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUserId(data.user.id)
          // Check if user is admin of this group
          const userRole = roles.find(r => r.memberId === data.user.id)
          setIsAdmin(userRole?.role === 'admin')
        }
      })
      .catch(console.error)
  }, [roles])

  // Fetch pending join requests (for admins)
  useEffect(() => {
    if (isAdmin) {
      fetchPendingRequests()
    }
  }, [isAdmin, groupId])

  async function fetchPendingRequests() {
    setLoadingRequests(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/join-requests`)
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.requests || [])
      }
    } catch (err) {
      console.error('Failed to fetch pending requests:', err)
    } finally {
      setLoadingRequests(false)
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      const response = await fetch(`/api/groups/${groupId}/members?memberId=${memberId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onMemberRemoved()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to remove member')
      }
    } catch (err) {
      console.error('Failed to remove member:', err)
      alert('Failed to remove member')
    }
  }

  async function handleApproveRequest(requestId: string) {
    try {
      const response = await fetch(`/api/groups/${groupId}/join-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'approve' }),
      })

      if (response.ok) {
        await fetchPendingRequests()
        onMemberRemoved() // Refresh to show new member
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to approve request')
      }
    } catch (err) {
      console.error('Failed to approve request:', err)
      alert('Failed to approve request')
    }
  }

  async function handleRejectRequest(requestId: string) {
    try {
      const response = await fetch(`/api/groups/${groupId}/join-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject' }),
      })

      if (response.ok) {
        await fetchPendingRequests()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to reject request')
      }
    } catch (err) {
      console.error('Failed to reject request:', err)
      alert('Failed to reject request')
    }
  }

  // Enrich members with their roles
  const membersWithRoles = members.map(member => {
    const memberRole = roles.find(r => r.memberId === member.id)
    return {
      ...member,
      role: memberRole?.role as 'admin' | 'coordinator' | 'member' | undefined,
    }
  })

  return (
    <div className="bg-bg-1 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-900">
          Members ({members.length})
        </h2>
        {isAdmin && (
          <span className="text-xs text-ink-400">
            👑 Admin View
          </span>
        )}
      </div>

      {/* Pending Join Requests (Admin Only) */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="mb-4 p-3 bg-joy-bg/30 rounded-lg border border-joy-200">
          <h3 className="text-sm font-medium text-ink-900 mb-3 flex items-center gap-2">
            <span>⏳</span> Pending Join Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between bg-bg-1 rounded-md p-2"
              >
                <div>
                  <p className="text-sm font-medium text-ink-900">
                    User {request.userId.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-ink-400">
                    Requested {formatTimeAgo(new Date(request.requestedAt))}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveRequest(request.id)}
                    className="px-3 py-1 text-xs font-medium text-success bg-success-bg rounded-md hover:bg-success/20"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="px-3 py-1 text-xs font-medium text-danger bg-danger-bg rounded-md hover:bg-danger/20"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingRequests && isAdmin && (
        <div className="mb-4 text-sm text-ink-400">Loading pending requests...</div>
      )}

      {/* Member Directory with Admin Actions */}
      <MemberDirectory
        members={membersWithRoles}
        isAdmin={isAdmin}
        currentUserId={currentUserId || undefined}
        onRemoveMember={handleRemoveMember}
      />

      {/* Admin Help Text */}
      {isAdmin && (
        <div className="mt-4 p-3 bg-bg-2 rounded-lg">
          <p className="text-xs text-ink-400">
            <strong>Admin:</strong> Hover over a member to see the remove option.
            You cannot remove other admins - revoke their role first from the Roles tab.
          </p>
        </div>
      )}
    </div>
  )
}

// Group Feed Tab Component
function GroupFeedTab({
  posts,
  loading,
  groupId,
  groupName,
  onPostCreated,
}: {
  posts: Post[]
  loading: boolean
  groupId: string
  groupName: string
  onPostCreated: () => void
}) {
  const [composerOpen, setComposerOpen] = useState(false)

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-1 rounded-lg border border-border p-4 animate-pulse">
            <div className="h-4 bg-bg-2 rounded w-1/4 mb-3"></div>
            <div className="h-4 bg-bg-2 rounded w-full mb-2"></div>
            <div className="h-4 bg-bg-2 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* New Post Button */}
      <div className="mb-4">
        <button
          onClick={() => setComposerOpen(true)}
          className="w-full bg-bg-1 rounded-lg border border-border p-4 text-left hover:border-joy-300 transition-colors"
        >
          <span className="text-ink-400">Share something with {groupName}...</span>
        </button>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-bg-1 rounded-lg border border-border p-4 text-center">
          <span className="text-sm mb-4 block">📝</span>
          <h3 className="text-sm font-medium text-ink-900 mb-2">No posts yet</h3>
          <p className="text-ink-400 text-sm mb-4">
            Be the first to share something with this group!
          </p>
          <button
            onClick={() => setComposerOpen(true)}
            className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-bg-1 rounded-lg border border-border p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-bg-2 rounded-full flex items-center justify-center text-sm font-medium text-ink-700">
                  {post.authorId.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-ink-900 text-sm">
                    User {post.authorId.slice(0, 8)}
                  </div>
                  <div className="text-xs text-ink-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {post.title && (
                <h3 className="font-semibold text-ink-900 mb-2">{post.title}</h3>
              )}
              {post.content && (
                <p className="text-ink-700 text-sm leading-relaxed">
                  {post.content}
                </p>
              )}
              {post.topics && post.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 bg-bg-2 text-ink-700 text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Simple Composer Modal */}
      {composerOpen && (
        <SimplePostComposer
          groupId={groupId}
          groupName={groupName}
          onClose={() => setComposerOpen(false)}
          onCreated={() => {
            setComposerOpen(false)
            onPostCreated()
          }}
        />
      )}
    </div>
  )
}

// Group Forum Tab Component
function GroupForumTab({
  topics,
  loading,
  groupId,
  groupName,
  onTopicCreated,
}: {
  topics: Topic[]
  loading: boolean
  groupId: string
  groupName: string
  onTopicCreated: () => void
}) {
  const [composerOpen, setComposerOpen] = useState(false)

  const categoryColors: Record<string, string> = {
    general: 'bg-bg-2 text-ink-900',
    proposal: 'bg-joy-bg text-joy-700',
    question: 'bg-info-bg text-info',
    deliberation: 'bg-accent-3-bg text-accent-3',
    announcement: 'bg-success-bg text-success',
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-1 rounded-lg border border-border p-4 animate-pulse">
            <div className="h-4 bg-bg-2 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-bg-2 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  // Separate pinned and regular topics
  const pinnedTopics = topics.filter(t => t.isPinned)
  const regularTopics = topics.filter(t => !t.isPinned)

  return (
    <div>
      {/* Header with New Topic button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-900">
          Group Discussions
        </h2>
        <button
          onClick={() => setComposerOpen(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
        >
          + New Topic
        </button>
      </div>

      {/* Topics List */}
      {topics.length === 0 ? (
        <div className="bg-bg-1 rounded-lg border border-border p-4 text-center">
          <span className="text-sm mb-4 block">💬</span>
          <h3 className="text-sm font-medium text-ink-900 mb-2">No discussions yet</h3>
          <p className="text-ink-400 text-sm mb-4">
            Start a conversation with your group!
          </p>
          <button
            onClick={() => setComposerOpen(true)}
            className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium"
          >
            Create Topic
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Pinned Topics */}
          {pinnedTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/forum/${topic.slug || topic.id}`}
              className="block bg-joy-bg/20 rounded-lg border border-joy-200 p-4 hover:border-joy-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-joy-600">📌</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-ink-900 line-clamp-1">
                    {topic.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ink-400">
                    <span className={`px-2 py-0.5 rounded-full ${categoryColors[topic.category] || categoryColors.general}`}>
                      {topic.category}
                    </span>
                    <span>{topic.postCount} replies</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Regular Topics */}
          {regularTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/forum/${topic.slug || topic.id}`}
              className="block bg-bg-1 rounded-lg border border-border p-4 hover:border-border transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-ink-400">💬</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-ink-900 line-clamp-1">
                    {topic.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ink-400">
                    <span className={`px-2 py-0.5 rounded-full ${categoryColors[topic.category] || categoryColors.general}`}>
                      {topic.category}
                    </span>
                    <span>{topic.postCount} replies</span>
                    <span>Last: {formatTimeAgo(new Date(topic.lastActivityAt))}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Simple Topic Composer Modal */}
      {composerOpen && (
        <SimpleTopicComposer
          groupId={groupId}
          groupName={groupName}
          onClose={() => setComposerOpen(false)}
          onCreated={() => {
            setComposerOpen(false)
            onTopicCreated()
          }}
        />
      )}
    </div>
  )
}

// Simple Post Composer Modal
function SimplePostComposer({
  groupId,
  groupName,
  onClose,
  onCreated,
}: {
  groupId: string
  groupName: string
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'native',
          title: title.trim() || undefined,
          content: content.trim(),
          groupId,
          topics: [],
        }),
      })

      if (response.ok) {
        onCreated()
      } else {
        alert('Failed to create post')
      }
    } catch (err) {
      console.error('Failed to create post:', err)
      alert('Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-1 rounded-lg max-w-lg w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink-900">
            Post to {groupName}
          </h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900"
          />
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
            className="w-full px-3 py-2 border border-border rounded-md mb-4 bg-bg-1 text-ink-900 resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-700 hover:bg-bg-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 disabled:opacity-50 text-sm font-medium"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Simple Topic Composer Modal
function SimpleTopicComposer({
  groupId,
  groupName,
  onClose,
  onCreated,
}: {
  groupId: string
  groupName: string
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('general')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          groupId,
        }),
      })

      if (response.ok) {
        onCreated()
      } else {
        alert('Failed to create topic')
      }
    } catch (err) {
      console.error('Failed to create topic:', err)
      alert('Failed to create topic')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-1 rounded-lg max-w-lg w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink-900">
            New Discussion in {groupName}
          </h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Topic title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900 resize-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md mb-4 bg-bg-1 text-ink-900"
          >
            <option value="general">💬 General</option>
            <option value="proposal">📋 Proposal</option>
            <option value="question">❓ Question</option>
            <option value="deliberation">🤔 Deliberation</option>
            <option value="announcement">📢 Announcement</option>
          </select>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-700 hover:bg-bg-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 disabled:opacity-50 text-sm font-medium"
            >
              {submitting ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Group Proposals Tab Component
function GroupProposalsTab({
  proposals,
  loading,
  groupId,
  groupName,
  onProposalCreated,
}: {
  proposals: Proposal[]
  loading: boolean
  groupId: string
  groupName: string
  onProposalCreated: () => void
}) {
  const statusColors: Record<string, string> = {
    draft: 'bg-bg-2 text-ink-700',
    research: 'bg-info-bg text-info',
    deliberation: 'bg-accent-3-bg text-accent-3',
    voting: 'bg-joy-bg text-joy-700',
    decided: 'bg-success-bg text-success',
    delivery: 'bg-brand-bg text-brand-700',
    reviewed: 'bg-success-bg text-success',
    archived: 'bg-bg-2 text-ink-400',
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-1 rounded-lg border border-border p-4 animate-pulse">
            <div className="h-4 bg-bg-2 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-bg-2 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header with New Proposal link */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-900">
          Group Proposals
        </h2>
        <Link
          href={`/governance/new?scopeType=group&scopeId=${groupId}`}
          className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium"
        >
          + New Proposal
        </Link>
      </div>

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <div className="bg-bg-1 rounded-lg border border-border p-4 text-center">
          <span className="text-sm mb-4 block">📋</span>
          <h3 className="text-sm font-medium text-ink-900 mb-2">No proposals yet</h3>
          <p className="text-ink-400 text-sm mb-4">
            Create the first proposal for {groupName}!
          </p>
          <Link
            href={`/governance/new?scopeType=group&scopeId=${groupId}`}
            className="inline-block px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium"
          >
            Create Proposal
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {proposals.map((proposal) => (
            <Link
              key={proposal.id}
              href={`/governance/${proposal.id}`}
              className="block bg-bg-1 rounded-lg border border-border p-4 hover:border-joy-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-ink-400">📋</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-ink-900 line-clamp-1">
                    {proposal.title}
                  </h3>
                  <p className="text-sm text-ink-700 line-clamp-2 mt-1">
                    {proposal.summary}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-ink-400">
                    <span className={`px-2 py-0.5 rounded-full ${statusColors[proposal.status] || statusColors.draft}`}>
                      {proposal.status}
                    </span>
                    <span>{formatTimeAgo(new Date(proposal.createdAt))}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function for time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// Group Events Tab Component
function GroupEventsTab({
  events,
  loading,
  groupId,
  groupName,
  onEventCreated,
}: {
  events: GroupEvent[]
  loading: boolean
  groupId: string
  groupName: string
  onEventCreated: () => void
}) {
  const [composerOpen, setComposerOpen] = useState(false)

  const eventTypeColors: Record<string, string> = {
    meeting: 'bg-info-bg text-info',
    workshop: 'bg-accent-3-bg text-accent-3',
    social: 'bg-joy-bg text-joy-700',
    action: 'bg-success-bg text-success',
    assembly: 'bg-brand-bg text-brand-700',
    deliberation: 'bg-accent-3-bg text-accent-3',
    other: 'bg-bg-2 text-ink-700',
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-1 rounded-lg border border-border p-4 animate-pulse">
            <div className="h-4 bg-bg-2 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-bg-2 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  // Separate upcoming and past events
  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.startsAt) >= now)
  const pastEvents = events.filter((e) => new Date(e.startsAt) < now)

  return (
    <div>
      {/* Header with New Event button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-900">Group Events</h2>
        <button
          onClick={() => setComposerOpen(true)}
          className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium"
        >
          + New Event
        </button>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="bg-bg-1 rounded-lg border border-border p-4 text-center">
          <span className="text-sm mb-4 block">📅</span>
          <h3 className="text-sm font-medium text-ink-900 mb-2">No events yet</h3>
          <p className="text-ink-400 text-sm mb-4">Schedule the first event for {groupName}!</p>
          <button
            onClick={() => setComposerOpen(true)}
            className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-ink-700 mb-2">Upcoming</h3>
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-bg-1 rounded-lg border border-border p-4 hover:border-joy-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-joy-bg rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs text-joy-700 font-medium">
                          {new Date(event.startsAt).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg text-joy-700 font-bold leading-none">
                          {new Date(event.startsAt).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-ink-900">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-ink-700 line-clamp-2 mt-1">
                            {event.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${eventTypeColors[event.eventType] || eventTypeColors.other}`}
                          >
                            {event.eventType}
                          </span>
                          <span className="text-xs text-ink-400">
                            {new Date(event.startsAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                          {event.location && (
                            <span className="text-xs text-ink-400">📍 {event.location}</span>
                          )}
                          {event.isVirtual && (
                            <span className="text-xs text-info">🌐 Virtual</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-ink-400 mb-2">Past Events</h3>
              <div className="space-y-2 opacity-70">
                {pastEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="bg-bg-1 rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-ink-400">
                        {new Date(event.startsAt).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-ink-700">{event.title}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${eventTypeColors[event.eventType] || eventTypeColors.other}`}
                      >
                        {event.eventType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Composer Modal */}
      {composerOpen && (
        <EventComposerModal
          groupId={groupId}
          groupName={groupName}
          onClose={() => setComposerOpen(false)}
          onCreated={() => {
            setComposerOpen(false)
            onEventCreated()
          }}
        />
      )}
    </div>
  )
}

// Event Composer Modal
function EventComposerModal({
  groupId,
  groupName,
  onClose,
  onCreated,
}: {
  groupId: string
  groupName: string
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<GroupEventType>('meeting')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [location, setLocation] = useState('')
  const [isVirtual, setIsVirtual] = useState(false)
  const [virtualLink, setVirtualLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startsAt) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          eventType,
          startsAt,
          endsAt: endsAt || undefined,
          location: location.trim() || undefined,
          isVirtual,
          virtualLink: virtualLink.trim() || undefined,
        }),
      })

      if (response.ok) {
        onCreated()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create event')
      }
    } catch (err) {
      console.error('Failed to create event:', err)
      alert('Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-1 rounded-lg max-w-lg w-full p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink-900">New Event for {groupName}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900 resize-none"
          />
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as GroupEventType)}
            className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900"
          >
            <option value="meeting">📋 Meeting</option>
            <option value="workshop">🎓 Workshop</option>
            <option value="social">🎉 Social</option>
            <option value="action">✊ Action</option>
            <option value="assembly">🏛️ Assembly</option>
            <option value="deliberation">🤔 Deliberation</option>
            <option value="other">📌 Other</option>
          </select>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm text-ink-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
              />
            </div>
            <div>
              <label className="block text-sm text-ink-700 mb-1">End Time (optional)</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900"
          />
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isVirtual}
              onChange={(e) => setIsVirtual(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-ink-700">Virtual event</span>
          </label>
          {isVirtual && (
            <input
              type="url"
              placeholder="Virtual meeting link"
              value={virtualLink}
              onChange={(e) => setVirtualLink(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900"
            />
          )}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-700 hover:bg-bg-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !startsAt}
              className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 disabled:opacity-50 text-sm font-medium"
            >
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Group Resources Tab Component
function GroupResourcesTab({
  resources,
  loading,
  groupId,
  groupName,
  onResourceCreated,
}: {
  resources: GroupResource[]
  loading: boolean
  groupId: string
  groupName: string
  onResourceCreated: () => void
}) {
  const [composerOpen, setComposerOpen] = useState(false)

  const resourceTypeIcons: Record<string, string> = {
    money: '💰',
    time: '⏱️',
    equipment: '🔧',
    space: '🏠',
    skill: '🎯',
    material: '📦',
  }

  const resourceTypeColors: Record<string, string> = {
    money: 'bg-success-bg text-success',
    time: 'bg-info-bg text-info',
    equipment: 'bg-accent-3-bg text-accent-3',
    space: 'bg-joy-bg text-joy-700',
    skill: 'bg-brand-bg text-brand-700',
    material: 'bg-bg-2 text-ink-700',
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-1 rounded-lg border border-border p-4 animate-pulse">
            <div className="h-4 bg-bg-2 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-bg-2 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  // Group resources by type
  const resourcesByType = resources.reduce(
    (acc, resource) => {
      const type = resource.resourceType
      if (!acc[type]) acc[type] = []
      acc[type].push(resource)
      return acc
    },
    {} as Record<string, GroupResource[]>
  )

  return (
    <div>
      {/* Header with Add Resource button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-900">Shared Resources</h2>
        <button
          onClick={() => setComposerOpen(true)}
          className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium"
        >
          + Add Resource
        </button>
      </div>

      {/* Resources List */}
      {resources.length === 0 ? (
        <div className="bg-bg-1 rounded-lg border border-border p-4 text-center">
          <span className="text-sm mb-4 block">🧰</span>
          <h3 className="text-sm font-medium text-ink-900 mb-2">No shared resources yet</h3>
          <p className="text-ink-400 text-sm mb-4">
            Add resources that {groupName} members can share and use together.
          </p>
          <button
            onClick={() => setComposerOpen(true)}
            className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium"
          >
            Add Resource
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(resourcesByType).map(([type, typeResources]) => (
            <div key={type}>
              <h3 className="text-sm font-medium text-ink-700 mb-2 flex items-center gap-2">
                <span>{resourceTypeIcons[type] || '📦'}</span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
                <span className="text-ink-400">({typeResources.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {typeResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-bg-1 rounded-lg border border-border p-3 hover:border-joy-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-ink-900">{resource.name}</h4>
                        {resource.description && (
                          <p className="text-sm text-ink-700 line-clamp-2 mt-1">
                            {resource.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${resourceTypeColors[resource.resourceType] || resourceTypeColors.material}`}
                          >
                            {resource.resourceType}
                          </span>
                          {resource.quantity > 0 && (
                            <span className="text-xs text-ink-400">
                              {resource.quantity} {resource.unit || 'units'}
                            </span>
                          )}
                          {resource.isAvailable ? (
                            <span className="text-xs text-success">✓ Available</span>
                          ) : (
                            <span className="text-xs text-ink-400">Not available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Composer Modal */}
      {composerOpen && (
        <ResourceComposerModal
          groupId={groupId}
          groupName={groupName}
          onClose={() => setComposerOpen(false)}
          onCreated={() => {
            setComposerOpen(false)
            onResourceCreated()
          }}
        />
      )}
    </div>
  )
}

// Resource Composer Modal
function ResourceComposerModal({
  groupId,
  groupName,
  onClose,
  onCreated,
}: {
  groupId: string
  groupName: string
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [resourceType, setResourceType] = useState<GroupResourceType>('equipment')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          resourceType,
          quantity: quantity ? parseFloat(quantity) : 0,
          unit: unit.trim() || undefined,
        }),
      })

      if (response.ok) {
        onCreated()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to add resource')
      }
    } catch (err) {
      console.error('Failed to add resource:', err)
      alert('Failed to add resource')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-1 rounded-lg max-w-lg w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink-900">Add Resource to {groupName}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Resource name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900 resize-none"
          />
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as GroupResourceType)}
            className="w-full px-3 py-2 border border-border rounded-md mb-3 bg-bg-1 text-ink-900"
          >
            <option value="money">💰 Money (Treasury)</option>
            <option value="time">⏱️ Time (Timebanking)</option>
            <option value="equipment">🔧 Equipment</option>
            <option value="space">🏠 Space</option>
            <option value="skill">🎯 Skill</option>
            <option value="material">📦 Material</option>
          </select>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm text-ink-700 mb-1">Quantity</label>
              <input
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
              />
            </div>
            <div>
              <label className="block text-sm text-ink-700 mb-1">Unit</label>
              <input
                type="text"
                placeholder="e.g., hours, USD, units"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-700 hover:bg-bg-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 disabled:opacity-50 text-sm font-medium"
            >
              {submitting ? 'Adding...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Roles Tab Component
 * Displays and manages group roles with accountability tracking
 */
function GroupRolesTab({
  roles,
  loading,
  groupId,
  members,
  onRoleChanged,
}: {
  roles: GroupRole[]
  loading: boolean
  groupId: string
  members: string[]
  onRoleChanged: () => void
}) {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigningRole, setAssigningRole] = useState(false)
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedRole, setSelectedRole] = useState<GroupRoleType>('member')
  const [expiresAt, setExpiresAt] = useState('')

  const roleColors: Record<GroupRoleType, string> = {
    admin: 'bg-danger-bg text-danger',
    coordinator: 'bg-joy-bg text-joy-700',
    member: 'bg-success-bg text-success',
  }

  const roleIcons: Record<GroupRoleType, string> = {
    admin: '👑',
    coordinator: '🎯',
    member: '👤',
  }

  async function handleAssignRole(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMember || !selectedRole) return

    setAssigningRole(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember,
          role: selectedRole,
          expiresAt: expiresAt || undefined,
          recallable: true,
        }),
      })

      if (response.ok) {
        setShowAssignModal(false)
        setSelectedMember('')
        setSelectedRole('member')
        setExpiresAt('')
        onRoleChanged()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to assign role')
      }
    } catch (err) {
      console.error('Failed to assign role:', err)
      alert('Failed to assign role')
    } finally {
      setAssigningRole(false)
    }
  }

  async function handleRevokeRole(roleId: string) {
    if (!confirm('Are you sure you want to revoke this role?')) return

    try {
      const response = await fetch(`/api/groups/${groupId}/roles?roleId=${roleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRoleChanged()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to revoke role')
      }
    } catch (err) {
      console.error('Failed to revoke role:', err)
      alert('Failed to revoke role')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-1 rounded-lg border border-border p-4 animate-pulse">
            <div className="h-4 bg-bg-2 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-bg-2 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  // Group roles by type for display
  const rolesByType = roles.reduce((acc, role) => {
    if (!acc[role.role]) acc[role.role] = []
    acc[role.role].push(role)
    return acc
  }, {} as Record<GroupRoleType, GroupRole[]>)

  return (
    <div>
      {/* Header with Assign Role button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-900">
          Group Roles & Accountability
        </h2>
        <button
          onClick={() => setShowAssignModal(true)}
          className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium"
        >
          + Assign Role
        </button>
      </div>

      {/* Role Legend */}
      <div className="bg-bg-1 rounded-lg border border-border p-3 mb-4">
        <h3 className="text-xs font-medium text-ink-400 mb-2 uppercase">Role Types</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">👑</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.admin}`}>Admin</span>
            <span className="text-xs text-ink-400">— Full group management</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.coordinator}`}>Coordinator</span>
            <span className="text-xs text-ink-400">— Event/project leadership</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">👤</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.member}`}>Member</span>
            <span className="text-xs text-ink-400">— Standard participation</span>
          </div>
        </div>
      </div>

      {/* Roles List */}
      {roles.length === 0 ? (
        <div className="bg-bg-1 rounded-lg border border-border p-4 text-center">
          <span className="text-sm mb-4 block">👔</span>
          <h3 className="text-sm font-medium text-ink-900 mb-2">No roles assigned yet</h3>
          <p className="text-ink-400 text-sm mb-4">
            Assign roles to members for transparent accountability and rotating leadership.
          </p>
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-block px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 transition-colors text-sm font-medium"
          >
            Assign First Role
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {(['admin', 'coordinator', 'member'] as GroupRoleType[]).map((roleType) => {
            const typeRoles = rolesByType[roleType] || []
            if (typeRoles.length === 0) return null

            return (
              <div key={roleType}>
                <h3 className="text-xs font-medium text-ink-400 mb-2 uppercase flex items-center gap-2">
                  <span>{roleIcons[roleType]}</span>
                  {roleType}s ({typeRoles.length})
                </h3>
                <div className="space-y-2">
                  {typeRoles.map((role) => (
                    <div
                      key={role.id}
                      className="bg-bg-1 rounded-lg border border-border p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[role.role]}`}>
                          {role.role}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-ink-900">
                            Member {role.memberId.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-ink-400">
                            Granted {new Date(role.grantedAt).toLocaleDateString()}
                            {role.expiresAt && (
                              <span className="ml-2 text-joy-600">
                                · Expires {new Date(role.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {role.recallable && (
                        <button
                          onClick={() => handleRevokeRole(role.id)}
                          className="text-xs text-danger hover:text-danger-700 font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-1 rounded-lg border border-border p-4 w-full max-w-md mx-4">
            <h3 className="text-sm font-semibold text-ink-900 mb-4">Assign Role</h3>
            <form onSubmit={handleAssignRole}>
              <div className="mb-3">
                <label className="block text-sm text-ink-700 mb-1">Member</label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
                  required
                >
                  <option value="">Select a member...</option>
                  {members.map((memberId) => (
                    <option key={memberId} value={memberId}>
                      Member {memberId.slice(0, 8)}...
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm text-ink-700 mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as GroupRoleType)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
                >
                  <option value="member">👤 Member</option>
                  <option value="coordinator">🎯 Coordinator</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-ink-700 mb-1">
                  Expires (optional - for term limits)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-ink-700 hover:bg-bg-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningRole || !selectedMember}
                  className="px-4 py-2 bg-joy-600 text-bg-1 rounded-md hover:bg-joy-700 disabled:opacity-50 text-sm font-medium"
                >
                  {assigningRole ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
