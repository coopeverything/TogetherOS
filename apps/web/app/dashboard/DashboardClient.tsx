'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SampleContainer,
  CompactMetrics,
  CollapsibleModule,
  BridgeChatWidget,
} from '@togetheros/ui/dashboard';

interface User {
  id: string;
  email: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
  paths?: string[];
  skills?: string[];
  onboarding_step?: string;
}

interface EconomyData {
  sp: { available: number; total: number } | null;
  rp: { available: number; total_earned: number } | null;
  tbc: { balance: number } | null;
}

// Sample data that can be loaded on demand
const SAMPLE_DATA = {
  metrics: [
    { icon: '👥', value: '1,247', label: 'Active Members' },
    { icon: '📋', value: '23', label: 'Open Proposals' },
    { icon: '🗳️', value: '5', label: 'Active Votes' },
    { icon: '🤲', value: '89', label: 'Mutual Aid Requests' },
    { icon: '📅', value: '3', label: 'Events This Week' },
    { icon: '✨', value: '5/8', label: 'Your Paths' },
  ],
  userGroups: [
    { id: '1', name: 'Seattle Local', newPosts: 3, upcomingEvents: 1, activeVotes: 0 },
    { id: '2', name: 'Tech Co-op Network', newPosts: 12, upcomingEvents: 0, activeVotes: 1 },
    { id: '3', name: 'Climate Action PDX', newPosts: 0, upcomingEvents: 0, activeVotes: 0 },
  ],
  priorities: [
    { topic: 'Housing', rank: 1, weight: 9 },
    { topic: 'Climate', rank: 2, weight: 8 },
    { topic: 'Education', rank: 3, weight: 6 },
    { topic: 'Economy', rank: 4, weight: 5 },
    { topic: 'Wellbeing', rank: 5, weight: 4 },
  ],
  cooperationPaths: [
    { id: 'education', emoji: '📚', name: 'Education' },
    { id: 'technology', emoji: '💻', name: 'Technology' },
    { id: 'governance', emoji: '🏛️', name: 'Governance' },
    { id: 'planet', emoji: '🌍', name: 'Planet' },
  ],
  communityFocus: [
    { topic: 'Housing', percentage: 67 },
    { topic: 'Climate', percentage: 45 },
    { topic: 'Healthcare', percentage: 32 },
  ],
  upcomingEvents: [
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
  ],
  suggestedGroups: [
    { id: '1', name: 'Affordable Housing Alliance', location: 'Seattle', members: 89, match: 90 },
    { id: '2', name: 'Climate Action PDX', location: 'Portland', members: 124, match: 85 },
    { id: '3', name: 'Tech Co-ops Network', location: 'National', members: 567, match: 78 },
  ],
  feedPosts: [
    {
      id: '1',
      type: 'post' as const,
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
      type: 'proposal' as const,
      title: 'Weekly Farmers Market',
      status: 'Voting',
      daysLeft: 2,
      participationRate: 67,
      summary: 'Partner with local farms to establish weekly farmers market...',
    },
    {
      id: '3',
      type: 'event' as const,
      title: 'Community Garden Meeting',
      date: 'Tomorrow, 6:00 PM',
      location: 'Seattle',
      attendees: 12,
      host: 'Seattle Local',
      summary: 'Join us to plan spring planting...',
    },
    {
      id: '4',
      type: 'post' as const,
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
  ],
  activity: {
    postsThisWeek: 3,
    reactions: 47,
    discussions: 12,
    votesCast: 2,
    eventsAttended: 1,
  },
  pendingActions: [
    { icon: '🗳️', label: '5 proposals to vote' },
    { icon: '💬', label: '3 discussions need reply' },
    { icon: '⏰', label: '12 tasks overdue' },
    { icon: '📝', label: '2 drafts to finish' },
  ],
  hotTopics: [
    { title: 'Housing Crisis', participants: 47, hot: true },
    { title: 'Climate Action', participants: 32, hot: true },
    { title: 'Local Farmers Markets', participants: 18, hot: false },
  ],
};

// Empty state defaults
const EMPTY_DATA = {
  metrics: [
    { icon: '👥', value: '0', label: 'Active Members' },
    { icon: '📋', value: '0', label: 'Open Proposals' },
    { icon: '🗳️', value: '0', label: 'Active Votes' },
    { icon: '🤲', value: '0', label: 'Mutual Aid Requests' },
    { icon: '📅', value: '0', label: 'Events This Week' },
    { icon: '✨', value: '0/8', label: 'Your Paths' },
  ],
  userGroups: [] as typeof SAMPLE_DATA.userGroups,
  priorities: [] as typeof SAMPLE_DATA.priorities,
  cooperationPaths: [] as typeof SAMPLE_DATA.cooperationPaths,
  communityFocus: [] as typeof SAMPLE_DATA.communityFocus,
  upcomingEvents: [] as typeof SAMPLE_DATA.upcomingEvents,
  suggestedGroups: [] as typeof SAMPLE_DATA.suggestedGroups,
  feedPosts: [] as typeof SAMPLE_DATA.feedPosts,
  activity: {
    postsThisWeek: 0,
    reactions: 0,
    discussions: 0,
    votesCast: 0,
    eventsAttended: 0,
  },
  pendingActions: [] as typeof SAMPLE_DATA.pendingActions,
  hotTopics: [] as typeof SAMPLE_DATA.hotTopics,
};

export default function DashboardClient({ user }: { user: User }) {
  const [feedFilter, setFeedFilter] = useState<string>('all');
  const [showSampleData, setShowSampleData] = useState(false);
  const [economy, setEconomy] = useState<EconomyData>({ sp: null, rp: null, tbc: null });

  // Fetch economy data on mount
  useEffect(() => {
    async function loadEconomy() {
      try {
        const [spRes, rpRes, tbcRes] = await Promise.all([
          fetch('/api/support-points/balance'),
          fetch('/api/reward-points/balance'),
          fetch('/api/timebank/account'),
        ]);

        const sp = spRes.ok ? (await spRes.json()).balance : null;
        const rp = rpRes.ok ? (await rpRes.json()).balance : null;
        const tbc = tbcRes.ok ? (await tbcRes.json()).account : null;

        setEconomy({ sp, rp, tbc });
      } catch {
        // Silently fail - economy data is optional
      }
    }
    loadEconomy();
  }, []);

  // Use sample data or empty data based on toggle
  const data = showSampleData ? SAMPLE_DATA : EMPTY_DATA;

  return (
    <div className="min-h-screen bg-bg-0">
      {/* Header */}
      <header className="bg-bg-1 border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-ink-900">Dashboard</h1>
              <p className="text-sm text-ink-700 mt-1">
                Welcome back{user.name ? `, ${user.name}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSampleData(!showSampleData)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  showSampleData
                    ? 'bg-joy-600 text-white hover:bg-joy-700'
                    : 'bg-bg-2 text-ink-700 hover:bg-bg-0'
                }`}
              >
                {showSampleData ? 'Clear Sample' : 'Sample'}
              </button>
              <Link href="/profile">
                <button className="px-4 py-2 text-ink-700 bg-bg-2 rounded-md hover:opacity-80 transition-colors">
                  Profile
                </button>
              </Link>
            </div>
          </div>

          {/* Compact Summary Metrics */}
          <CompactMetrics metrics={data.metrics} />
        </div>
      </header>

      {/* Main Content - 3 Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* LEFT SIDEBAR (1 column) */}
          <aside className="lg:col-span-1 space-y-2">
            {/* Your Groups */}
            {showSampleData ? (
              <SampleContainer>
                <CollapsibleModule title="Your Groups">
                  <div className="space-y-3">
                    {data.userGroups.map((group) => (
                      <div
                        key={group.id}
                        className="p-3 bg-bg-0 rounded-lg hover:bg-bg-2 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-ink-900">{group.name}</div>
                        <div className="text-sm text-ink-700 mt-1 space-y-0.5">
                          {group.newPosts > 0 && <div>🔔 {group.newPosts} new posts</div>}
                          {group.upcomingEvents > 0 && <div>📅 Event tomorrow</div>}
                          {group.activeVotes > 0 && <div>🗳️ Vote ending soon</div>}
                        </div>
                      </div>
                    ))}
                    <button className="w-full text-sm text-brand-600 hover:text-brand-500 font-medium mt-2">
                      Browse All Groups →
                    </button>
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            ) : (
              <CollapsibleModule title="Your Groups">
                <div className="text-center py-6 text-ink-400">
                  <div className="text-2xl mb-2">👥</div>
                  <p className="text-sm">No groups yet</p>
                  <button className="text-sm text-brand-600 hover:text-brand-500 font-medium mt-2">
                    Browse Groups →
                  </button>
                </div>
              </CollapsibleModule>
            )}

            {/* Your Activity */}
            {showSampleData ? (
              <SampleContainer>
                <CollapsibleModule title="Your Activity">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-700">Posts this week:</span>
                      <span className="font-medium text-ink-900">{data.activity.postsThisWeek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-700">Reactions:</span>
                      <span className="font-medium text-ink-900">{data.activity.reactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-700">Discussions:</span>
                      <span className="font-medium text-ink-900">{data.activity.discussions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-700">Votes cast:</span>
                      <span className="font-medium text-ink-900">{data.activity.votesCast}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-700">Events attended:</span>
                      <span className="font-medium text-ink-900">{data.activity.eventsAttended}</span>
                    </div>
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            ) : (
              <CollapsibleModule title="Your Activity">
                <div className="text-center py-6 text-ink-400">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm">No activity yet</p>
                </div>
              </CollapsibleModule>
            )}

            {/* Your Economy */}
            <CollapsibleModule title="Your Economy">
              <div className="space-y-3">
                {/* Timebank Credits - Primary */}
                <Link href="/economy/timebank" className="block p-3 bg-accent-4/10 rounded-lg hover:bg-accent-4/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏰</span>
                      <span className="font-medium text-ink-900">Timebank</span>
                    </div>
                    <span className="text-sm font-bold text-accent-4">
                      {economy.tbc?.balance?.toFixed(1) ?? '0.0'} TBC
                    </span>
                  </div>
                  <p className="text-xs text-ink-400 mt-1">Exchange skills & services</p>
                </Link>

                {/* Support Points */}
                <Link href="/economy/support-points" className="block p-3 bg-joy-500/10 rounded-lg hover:bg-joy-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🗳️</span>
                      <span className="font-medium text-ink-900">Support Points</span>
                    </div>
                    <span className="text-sm font-bold text-joy-600">
                      {economy.sp?.available ?? 0} / {economy.sp?.total ?? 0} SP
                    </span>
                  </div>
                </Link>

                {/* Reward Points */}
                <Link href="/economy/reward-points" className="block p-3 bg-accent-3/10 rounded-lg hover:bg-accent-3/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💎</span>
                      <span className="font-medium text-ink-900">Reward Points</span>
                    </div>
                    <span className="text-sm font-bold text-accent-3">
                      {economy.rp?.available ?? 0} RP
                    </span>
                  </div>
                </Link>

                {/* Link to full economy page */}
                <Link href="/economy" className="w-full text-sm text-brand-600 hover:text-brand-500 font-medium mt-2 block text-center">
                  View Full Economy →
                </Link>
              </div>
            </CollapsibleModule>

            {/* Your Priorities */}
            {showSampleData ? (
              <SampleContainer>
                <CollapsibleModule title="Your Top Priorities">
                  <div className="space-y-2">
                    {data.priorities.map((priority) => (
                      <div key={priority.rank} className="flex items-center justify-between text-sm">
                        <span className="text-ink-900">
                          {priority.rank}. {priority.topic}
                        </span>
                        <span className="text-ink-700">({priority.weight}/10)</span>
                      </div>
                    ))}
                    <button className="w-full text-sm text-brand-600 hover:text-brand-500 font-medium mt-3">
                      Manage Priorities →
                    </button>
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            ) : (
              <CollapsibleModule title="Your Top Priorities">
                <div className="text-center py-6 text-ink-400">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="text-sm">No priorities set</p>
                  <button className="text-sm text-brand-600 hover:text-brand-500 font-medium mt-2">
                    Set Priorities →
                  </button>
                </div>
              </CollapsibleModule>
            )}

            {/* Your Paths */}
            {showSampleData ? (
              <SampleContainer>
                <CollapsibleModule title="Your Paths">
                  <div className="space-y-2">
                    {data.cooperationPaths.map((path) => (
                      <div key={path.id} className="flex items-center gap-2 text-sm">
                        <span className="text-sm">{path.emoji}</span>
                        <span className="text-ink-900">{path.name}</span>
                      </div>
                    ))}
                    <button className="w-full text-sm text-joy-600 hover:text-joy-500 font-medium mt-3">
                      + Add more paths
                    </button>
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            ) : (
              <CollapsibleModule title="Your Paths">
                <div className="text-center py-6 text-ink-400">
                  <div className="text-2xl mb-2">🛤️</div>
                  <p className="text-sm">No paths selected</p>
                  <button className="text-sm text-joy-600 hover:text-joy-500 font-medium mt-2">
                    + Choose paths
                  </button>
                </div>
              </CollapsibleModule>
            )}

            {/* Community Sentiment */}
            {showSampleData ? (
              <SampleContainer>
                <CollapsibleModule title="Community Focus">
                  <div className="space-y-3">
                    {data.communityFocus.map((item) => (
                      <div key={item.topic}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-ink-900">{item.topic}</span>
                          <span className="text-ink-700">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-bg-2 rounded-full h-2">
                          <div
                            className="bg-brand-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <button className="w-full text-sm text-brand-600 hover:text-brand-500 font-medium mt-3">
                      View Full Map →
                    </button>
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            ) : (
              <CollapsibleModule title="Community Focus">
                <div className="text-center py-6 text-ink-400">
                  <div className="text-2xl mb-2">🌐</div>
                  <p className="text-sm">No community data yet</p>
                </div>
              </CollapsibleModule>
            )}
          </aside>

          {/* CENTRAL FEED (2 columns) */}
          <main className="lg:col-span-2 space-y-2">
            {/* Feed Header */}
            <div className="bg-bg-1 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-ink-900">Feed</h2>
                <button className="px-4 py-2 bg-brand-600 text-bg-1 rounded-lg hover:opacity-90 transition-colors">
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
                        ? 'bg-brand-600 text-bg-1'
                        : 'bg-bg-2 text-ink-700 hover:bg-bg-0'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed Posts */}
            {showSampleData ? (
              <div className="space-y-2">
                {data.feedPosts.map((post) => {
                  if (post.type === 'post') {
                    return (
                      <SampleContainer key={post.id}>
                        <div className="bg-bg-1 rounded-lg border border-border p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-ink-900 mb-1">
                                {post.title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-ink-400">
                                <span>by {post.author}</span>
                                <span>•</span>
                                <span>{post.time}</span>
                                <span>•</span>
                                <span className="capitalize">{post.topic}</span>
                                {post.isImported && (
                                  <>
                                    <span>•</span>
                                    <span className="text-brand-600">{post.platform}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-ink-700 mb-4">{post.summary}</p>
                          <div className="flex items-center gap-4 text-sm text-ink-400">
                            <span>❤️ {post.reactions?.care}</span>
                            <span>💡 {post.reactions?.insightful}</span>
                            <span>✓ {post.reactions?.agree}</span>
                            <span>⚡ {post.reactions?.act}</span>
                            <button className="text-brand-600 hover:text-brand-500">
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
                        <div className="bg-brand-100 border-2 border-brand-500 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="text-xs font-bold text-brand-600 mb-1">
                                🗳️ PROPOSAL
                              </div>
                              <h3 className="text-sm font-semibold text-ink-900 mb-1">
                                {post.title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="px-2 py-0.5 bg-joy-100 text-joy-600 rounded-full font-medium">
                                  {post.status}
                                </span>
                                <span className="text-brand-600">
                                  {post.daysLeft} days left • {post.participationRate}% voted
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-ink-700 mb-4">{post.summary}</p>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 bg-brand-600 text-bg-1 rounded-lg hover:opacity-90 transition-colors">
                              Vote Now
                            </button>
                            <button className="px-4 py-2 bg-bg-1 text-brand-600 border border-brand-600 rounded-lg hover:bg-brand-100 transition-colors">
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
                        <div className="bg-joy-100 border-2 border-joy-500 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="text-xs font-bold text-joy-600 mb-1">
                                📅 EVENT
                              </div>
                              <h3 className="text-sm font-semibold text-ink-900 mb-1">
                                {post.title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-ink-700">
                                <span>{post.date}</span>
                                <span>•</span>
                                <span>📍 {post.location}</span>
                                <span>•</span>
                                <span>{post.attendees} attending</span>
                              </div>
                              <div className="text-sm text-ink-400 mt-1">
                                Hosted by {post.host}
                              </div>
                            </div>
                          </div>
                          <p className="text-ink-700 mb-4">{post.summary}</p>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 bg-joy-600 text-bg-1 rounded-lg hover:opacity-90 transition-colors">
                              RSVP Going
                            </button>
                            <button className="px-4 py-2 bg-bg-1 text-joy-600 border border-joy-600 rounded-lg hover:bg-joy-100 transition-colors">
                              Details
                            </button>
                            <button className="px-4 py-2 text-ink-700 hover:text-ink-900 transition-colors">
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
            ) : (
              <div className="bg-bg-1 rounded-lg border border-border p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-ink-900 mb-2">Your feed is empty</h3>
                <p className="text-ink-700 mb-4">
                  Join groups and follow topics to see posts here
                </p>
                <div className="flex gap-3 justify-center">
                  <button className="px-4 py-2 bg-brand-600 text-bg-1 rounded-lg hover:opacity-90 transition-colors">
                    Browse Groups
                  </button>
                  <button className="px-4 py-2 bg-bg-2 text-ink-700 rounded-lg hover:bg-bg-0 transition-colors">
                    Explore Topics
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR (1 column) */}
          <aside className="lg:col-span-1 space-y-2">
            {/* Pending Actions */}
            {showSampleData ? (
              <SampleContainer>
                <CollapsibleModule title="Needs Your Action">
                  <div className="space-y-2 text-sm">
                    {data.pendingActions.map((action, idx) => (
                      <button key={idx} className="w-full text-left p-2 hover:bg-bg-2 rounded transition-colors">
                        <span className="text-ink-900">{action.icon} {action.label}</span>
                      </button>
                    ))}
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            ) : (
              <CollapsibleModule title="Needs Your Action">
                <div className="text-center py-6 text-ink-400">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-sm">All caught up!</p>
                </div>
              </CollapsibleModule>
            )}

            {/* Upcoming Events */}
            {showSampleData ? (
              <SampleContainer>
                <CollapsibleModule title="Upcoming Events">
                  <div className="space-y-3">
                    {data.upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="p-3 bg-bg-0 rounded-lg hover:bg-bg-2 cursor-pointer transition-colors">
                        <div className="text-xs text-ink-700 mb-1">{event.date}</div>
                        <div className="font-medium text-ink-900 mb-1">{event.title}</div>
                        <div className="text-sm text-ink-700">
                          📍 {event.location} • {event.attendees} going
                        </div>
                        <button className="text-sm text-joy-600 hover:text-joy-500 font-medium mt-2">
                          RSVP
                        </button>
                      </div>
                    ))}
                    <button className="w-full text-sm text-brand-600 hover:text-brand-500 font-medium mt-2">
                      View All Events →
                    </button>
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            ) : (
              <CollapsibleModule title="Upcoming Events">
                <div className="text-center py-6 text-ink-400">
                  <div className="text-2xl mb-2">📅</div>
                  <p className="text-sm">No upcoming events</p>
                  <button className="text-sm text-brand-600 hover:text-brand-500 font-medium mt-2">
                    Browse Events →
                  </button>
                </div>
              </CollapsibleModule>
            )}

            {/* Upcoming Votes */}
            {showSampleData ? (
              <SampleContainer>
                <CollapsibleModule title="Upcoming Votes">
                  <div className="space-y-3">
                    <div className="p-3 bg-bg-0 rounded-lg">
                      <div className="font-medium text-ink-900 mb-1">Farmers Market</div>
                      <div className="text-sm text-ink-700 mb-2">2 days left • 67% voted</div>
                      <button className="w-full px-3 py-1.5 bg-brand-600 text-bg-1 rounded-lg hover:opacity-90 transition-colors text-sm font-medium">
                        Vote Now
                      </button>
                    </div>
                    <div className="p-3 bg-bg-0 rounded-lg">
                      <div className="font-medium text-ink-900 mb-1">Community Garden</div>
                      <div className="text-sm text-ink-700 mb-2">5 days left • 45% voted</div>
                      <button className="w-full px-3 py-1.5 bg-bg-1 border border-border text-ink-700 rounded-lg hover:bg-bg-2 transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            ) : (
              <CollapsibleModule title="Upcoming Votes">
                <div className="text-center py-6 text-ink-400">
                  <div className="text-2xl mb-2">🗳️</div>
                  <p className="text-sm">No active votes</p>
                  <button className="text-sm text-brand-600 hover:text-brand-500 font-medium mt-2">
                    View Proposals →
                  </button>
                </div>
              </CollapsibleModule>
            )}

            {/* Suggested Groups */}
            {showSampleData ? (
              <SampleContainer>
                <CollapsibleModule title="Groups For You">
                  <div className="space-y-3">
                    {data.suggestedGroups.slice(0, 3).map((group) => (
                      <div key={group.id} className="p-3 bg-bg-0 rounded-lg">
                        <div className="font-medium text-ink-900 mb-1">{group.name}</div>
                        <div className="text-sm text-ink-700 mb-2">
                          {group.location} • {group.members} members
                        </div>
                        <div className="text-xs text-joy-600 mb-2">Matches: {group.match}%</div>
                        <button className="w-full px-3 py-1.5 bg-brand-600 text-bg-1 rounded-lg hover:opacity-90 transition-colors text-sm font-medium">
                          Join
                        </button>
                      </div>
                    ))}
                    <button className="w-full text-sm text-brand-600 hover:text-brand-500 font-medium mt-2">
                      Explore Groups →
                    </button>
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            ) : (
              <CollapsibleModule title="Groups For You">
                <div className="text-center py-6 text-ink-400">
                  <div className="text-2xl mb-2">🔍</div>
                  <p className="text-sm">Complete your profile to get recommendations</p>
                  <Link href="/profile">
                    <button className="text-sm text-brand-600 hover:text-brand-500 font-medium mt-2">
                      Update Profile →
                    </button>
                  </Link>
                </div>
              </CollapsibleModule>
            )}

            {/* Hot Topics */}
            {showSampleData ? (
              <SampleContainer>
                <CollapsibleModule title="Hot Topics">
                  <div className="space-y-2">
                    {data.hotTopics.map((topic, idx) => (
                      <button key={idx} className="w-full text-left p-2 hover:bg-bg-2 rounded transition-colors">
                        <div className="font-medium text-ink-900">{topic.hot ? '🔥' : '💬'} {topic.title}</div>
                        <div className="text-sm text-ink-700">{topic.participants} participants</div>
                      </button>
                    ))}
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            ) : (
              <CollapsibleModule title="Hot Topics">
                <div className="text-center py-6 text-ink-400">
                  <div className="text-2xl mb-2">💬</div>
                  <p className="text-sm">No trending topics yet</p>
                </div>
              </CollapsibleModule>
            )}

            {/* Recommended Actions */}
            {showSampleData && (
              <SampleContainer>
                <CollapsibleModule title="For You">
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-brand-100 rounded-lg">
                      <div className="text-ink-900 mb-1">You care about Housing</div>
                      <button className="text-brand-600 hover:text-brand-500 font-medium">
                        → Join Housing Task Force
                      </button>
                    </div>
                    <div className="p-3 bg-joy-100 rounded-lg">
                      <div className="text-ink-900 mb-1">3 people near you care about Climate</div>
                      <button className="text-joy-600 hover:text-joy-500 font-medium">
                        → Invite to group
                      </button>
                    </div>
                  </div>
                </CollapsibleModule>
              </SampleContainer>
            )}
          </aside>
        </div>
      </div>

      {/* Bridge Chat (Floating) */}
      <BridgeChatWidget />
    </div>
  )
}
