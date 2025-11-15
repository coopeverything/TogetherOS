/**
 * Dashboard Test Page
 *
 * Comprehensive test/demo page showing proposed dashboard layout:
 * - 3-column responsive grid (left sidebar, central feed, right sidebar)
 * - Compact oval summary metrics
 * - All proposed modules with sample data
 * - Expandable Bridge chat
 *
 * URL: /dashboard-test
 */

'use client'

import { useState } from 'react'
import {
  SampleBadge,
  SampleContainer,
  CompactMetrics,
  CollapsibleModule,
  BridgeChatWidget,
} from '@togetheros/ui/dashboard'

export default function DashboardTestPage() {
  const [feedFilter, setFeedFilter] = useState<string>('all')
  const [topicFilter, setTopicFilter] = useState<string>('')

  // Sample metrics data
  const metrics = [
    { icon: '👥', value: '1,247', label: 'Active Members' },
    { icon: '📋', value: '23', label: 'Open Proposals' },
    { icon: '🗳️', value: '5', label: 'Active Votes' },
    { icon: '🤲', value: '89', label: 'Mutual Aid Requests' },
    { icon: '📅', value: '3', label: 'Events This Week' },
    { icon: '✨', value: '5/8', label: 'Your Paths' },
  ]

  // Sample groups data
  const userGroups = [
    { id: '1', name: 'Seattle Local', newPosts: 3, upcomingEvents: 1, activeVotes: 0 },
    { id: '2', name: 'Tech Co-op Network', newPosts: 12, upcomingEvents: 0, activeVotes: 1 },
    { id: '3', name: 'Climate Action PDX', newPosts: 0, upcomingEvents: 0, activeVotes: 0 },
  ]

  // Sample priorities
  const priorities = [
    { topic: 'Housing', rank: 1, weight: 9 },
    { topic: 'Climate', rank: 2, weight: 8 },
    { topic: 'Education', rank: 3, weight: 6 },
    { topic: 'Economy', rank: 4, weight: 5 },
    { topic: 'Wellbeing', rank: 5, weight: 4 },
  ]

  // Sample cooperation paths
  const cooperationPaths = [
    { id: 'education', emoji: '📚', name: 'Education' },
    { id: 'technology', emoji: '💻', name: 'Technology' },
    { id: 'governance', emoji: '🏛️', name: 'Governance' },
    { id: 'planet', emoji: '🌍', name: 'Planet' },
  ]

  // Sample community sentiment
  const communityFocus = [
    { topic: 'Housing', percentage: 67 },
    { topic: 'Climate', percentage: 45 },
    { topic: 'Healthcare', percentage: 32 },
  ]

  // Sample events
  const upcomingEvents = [
    {
      id: '1',
      title: 'Community Garden Meeting',
      date: 'Tomorrow, 6:00 PM',
      location: 'Seattle',
      distance: '2 miles',
      attendees: 12,
    },
    {
      id: '2',
      title: 'Tech Co-op Gathering',
      date: 'Fri Dec 1, 7:00 PM',
      location: 'Portland',
      distance: '120 miles',
      attendees: 47,
    },
    {
      id: '3',
      title: 'Climate March',
      date: 'Sat Dec 2, 10:00 AM',
      location: 'National',
      distance: 'Online',
      attendees: 234,
    },
  ]

  // Sample suggested groups
  const suggestedGroups = [
    { id: '1', name: 'Affordable Housing Alliance', location: 'Seattle', members: 89, match: 90 },
    { id: '2', name: 'Climate Action PDX', location: 'Portland', members: 124, match: 85 },
    { id: '3', name: 'Tech Co-ops Network', location: 'National', members: 567, match: 78 },
  ]

  // Sample posts
  const feedPosts = [
    {
      id: '1',
      type: 'post',
      author: 'Alice',
      time: '2 hours ago',
      topic: 'Housing',
      title: 'Affordable housing crisis in Seattle',
      summary: 'We need to address the growing housing affordability crisis...',
      reactions: { care: 23, insightful: 12, agree: 18, act: 8 },
      discussionCount: 5,
    },
    {
      id: '2',
      type: 'proposal',
      title: 'Weekly Farmers Market',
      status: 'Voting',
      daysLeft: 2,
      participationRate: 67,
      summary: 'Partner with local farms to establish weekly farmers market...',
    },
    {
      id: '3',
      type: 'event',
      title: 'Community Garden Meeting',
      date: 'Tomorrow, 6:00 PM',
      location: 'Seattle',
      attendees: 12,
      host: 'Seattle Local',
      summary: 'Join us to plan spring planting...',
    },
    {
      id: '4',
      type: 'post',
      author: 'Bob',
      time: 'Yesterday',
      topic: 'Climate',
      title: 'Local climate action ideas',
      summary: 'Here are some practical ways we can reduce our carbon footprint...',
      reactions: { care: 45, insightful: 8, agree: 32, act: 15 },
      discussionCount: 12,
      isImported: true,
      platform: 'Instagram',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Test</h1>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive demo of proposed dashboard layout
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                Profile
              </button>
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                Logout
              </button>
            </div>
          </div>

          {/* Compact Summary Metrics */}
          <CompactMetrics metrics={metrics} />
        </div>
      </header>

      {/* Main Content - 3 Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT SIDEBAR (1 column) */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Your Groups */}
            <SampleContainer>
              <CollapsibleModule title="Your Groups">
                <div className="space-y-3">
                  {userGroups.map((group) => (
                    <div
                      key={group.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="font-medium text-gray-900">{group.name}</div>
                      <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                        {group.newPosts > 0 && <div>🔔 {group.newPosts} new posts</div>}
                        {group.upcomingEvents > 0 && <div>📅 Event tomorrow</div>}
                        {group.activeVotes > 0 && <div>🗳️ Vote ending soon</div>}
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium mt-2">
                    Browse All Groups →
                  </button>
                </div>
              </CollapsibleModule>
            </SampleContainer>

            {/* Your Activity */}
            <SampleContainer>
              <CollapsibleModule title="Your Activity">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posts this week:</span>
                    <span className="font-medium text-gray-900">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reactions:</span>
                    <span className="font-medium text-gray-900">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discussions:</span>
                    <span className="font-medium text-gray-900">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Votes cast:</span>
                    <span className="font-medium text-gray-900">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Events attended:</span>
                    <span className="font-medium text-gray-900">1</span>
                  </div>
                </div>
              </CollapsibleModule>
            </SampleContainer>

            {/* Your Priorities */}
            <SampleContainer>
              <CollapsibleModule title="Your Top Priorities">
                <div className="space-y-2">
                  {priorities.map((priority) => (
                    <div key={priority.rank} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">
                        {priority.rank}. {priority.topic}
                      </span>
                      <span className="text-gray-600">({priority.weight}/10)</span>
                    </div>
                  ))}
                  <button className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium mt-3">
                    Manage Priorities →
                  </button>
                </div>
              </CollapsibleModule>
            </SampleContainer>

            {/* Your Paths */}
            <SampleContainer>
              <CollapsibleModule title="Your Paths">
                <div className="space-y-2">
                  {cooperationPaths.map((path) => (
                    <div key={path.id} className="flex items-center gap-2 text-sm">
                      <span className="text-base">{path.emoji}</span>
                      <span className="text-gray-900">{path.name}</span>
                    </div>
                  ))}
                  <button className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium mt-3">
                    + Add more paths
                  </button>
                </div>
              </CollapsibleModule>
            </SampleContainer>

            {/* Community Sentiment */}
            <SampleContainer>
              <CollapsibleModule title="Community Focus">
                <div className="space-y-3">
                  {communityFocus.map((item) => (
                    <div key={item.topic}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-900">{item.topic}</span>
                        <span className="text-gray-600">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium mt-3">
                    View Full Map →
                  </button>
                </div>
              </CollapsibleModule>
            </SampleContainer>
          </aside>

          {/* CENTRAL FEED (2 columns) */}
          <main className="lg:col-span-2 space-y-6">
            {/* Feed Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Feed</h2>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  + Create Post
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {['all', 'for-you', 'events', 'governance', 'trending'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFeedFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      feedFilter === filter
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed Posts */}
            <div className="space-y-4">
              {feedPosts.map((post) => {
                if (post.type === 'post') {
                  return (
                    <SampleContainer key={post.id}>
                      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>by {post.author}</span>
                              <span>•</span>
                              <span>{post.time}</span>
                              <span>•</span>
                              <span className="capitalize">{post.topic}</span>
                              {post.isImported && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600">{post.platform}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">{post.summary}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>❤️ {post.reactions?.care}</span>
                          <span>💡 {post.reactions?.insightful}</span>
                          <span>✓ {post.reactions?.agree}</span>
                          <span>⚡ {post.reactions?.act}</span>
                          <button className="text-blue-600 hover:text-blue-700">
                            💬 Discuss ({post.discussionCount})
                          </button>
                        </div>
                      </div>
                    </SampleContainer>
                  )
                }

                if (post.type === 'proposal') {
                  return (
                    <SampleContainer key={post.id}>
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-xs font-bold text-orange-800 mb-1">
                              🗳️ PROPOSAL
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                                {post.status}
                              </span>
                              <span className="text-orange-700">
                                {post.daysLeft} days left • {post.participationRate}% voted
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">{post.summary}</p>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            Vote Now
                          </button>
                          <button className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </SampleContainer>
                  )
                }

                if (post.type === 'event') {
                  return (
                    <SampleContainer key={post.id}>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-xs font-bold text-blue-800 mb-1">
                              📅 EVENT
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{post.date}</span>
                              <span>•</span>
                              <span>📍 {post.location}</span>
                              <span>•</span>
                              <span>{post.attendees} attending</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Hosted by {post.host}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">{post.summary}</p>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            RSVP Going
                          </button>
                          <button className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                            Details
                          </button>
                          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                            Share
                          </button>
                        </div>
                      </div>
                    </SampleContainer>
                  )
                }

                return null
              })}
            </div>
          </main>

          {/* RIGHT SIDEBAR (1 column) */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Pending Actions */}
            <SampleContainer>
              <CollapsibleModule title="Needs Your Action">
                <div className="space-y-2 text-sm">
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-900">🗳️ 5 proposals to vote</span>
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-900">💬 3 discussions need reply</span>
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-900">⏰ 12 tasks overdue</span>
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-900">📝 2 drafts to finish</span>
                  </button>
                </div>
              </CollapsibleModule>
            </SampleContainer>

            {/* Upcoming Events */}
            <SampleContainer>
              <CollapsibleModule title="Upcoming Events">
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <div className="text-xs text-gray-600 mb-1">{event.date}</div>
                      <div className="font-medium text-gray-900 mb-1">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        📍 {event.location} • {event.attendees} going
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
                        RSVP
                      </button>
                    </div>
                  ))}
                  <button className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium mt-2">
                    View All Events →
                  </button>
                </div>
              </CollapsibleModule>
            </SampleContainer>

            {/* Upcoming Votes */}
            <SampleContainer>
              <CollapsibleModule title="Upcoming Votes">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900 mb-1">Farmers Market</div>
                    <div className="text-sm text-gray-600 mb-2">2 days left • 67% voted</div>
                    <button className="w-full px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                      Vote Now
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900 mb-1">Community Garden</div>
                    <div className="text-sm text-gray-600 mb-2">5 days left • 45% voted</div>
                    <button className="w-full px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </CollapsibleModule>
            </SampleContainer>

            {/* Suggested Groups */}
            <SampleContainer>
              <CollapsibleModule title="Groups For You">
                <div className="space-y-3">
                  {suggestedGroups.slice(0, 3).map((group) => (
                    <div key={group.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900 mb-1">{group.name}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {group.location} • {group.members} members
                      </div>
                      <div className="text-xs text-green-700 mb-2">Matches: {group.match}%</div>
                      <button className="w-full px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                        Join
                      </button>
                    </div>
                  ))}
                  <button className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium mt-2">
                    Explore Groups →
                  </button>
                </div>
              </CollapsibleModule>
            </SampleContainer>

            {/* Hot Topics */}
            <SampleContainer>
              <CollapsibleModule title="Hot Topics">
                <div className="space-y-2">
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors">
                    <div className="font-medium text-gray-900">🔥 Housing Crisis</div>
                    <div className="text-sm text-gray-600">47 participants</div>
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors">
                    <div className="font-medium text-gray-900">🔥 Climate Action</div>
                    <div className="text-sm text-gray-600">32 participants</div>
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors">
                    <div className="font-medium text-gray-900">💬 Local Farmers Markets</div>
                    <div className="text-sm text-gray-600">18 participants</div>
                  </button>
                </div>
              </CollapsibleModule>
            </SampleContainer>

            {/* Recommended Actions */}
            <SampleContainer>
              <CollapsibleModule title="For You">
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-gray-900 mb-1">You care about Housing</div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      → Join Housing Task Force
                    </button>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-gray-900 mb-1">3 people near you care about Climate</div>
                    <button className="text-green-600 hover:text-green-700 font-medium">
                      → Invite to group
                    </button>
                  </div>
                </div>
              </CollapsibleModule>
            </SampleContainer>
          </aside>
        </div>
      </div>

      {/* Bridge Chat (Floating) */}
      <BridgeChatWidget />
    </div>
  )
}
