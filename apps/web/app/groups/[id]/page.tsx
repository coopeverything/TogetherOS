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

type TabType = 'feed' | 'forum' | 'members' | 'events' | 'proposals'

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
    { id: 'proposals', label: 'Proposals', icon: '📋' },
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
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <h2 className="text-sm font-semibold text-ink-900 mb-4">
                Members ({groupMembers.length})
              </h2>
              <MemberDirectory members={groupMembers} />
            </div>
          )}

          {activeTab === 'events' && (
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <div className="text-center py-6">
                <span className="text-sm mb-4 block">📅</span>
                <h3 className="text-sm font-medium text-ink-900 mb-2">Group Events</h3>
                <p className="text-ink-400 text-sm">
                  Event coordination coming soon
                </p>
              </div>
            </div>
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
