'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  PostCard,
  PostList,
  PostComposer,
  ThreadView,
  DuplicateThreadModal,
  GroupGrowthTracker,
  InvitationModal,
  type CreatePostData,
  type TopicSuggestion,
  type SimilarThread as SimilarThreadUI,
  type InvitationData
} from '@togetheros/ui';
import type { Post, ReactionType, ThreadPost, DiscussionThread } from '@togetheros/types';
import { Card, Button, Badge } from '@/components/ui';
import { TopicIntelligence, AVAILABLE_TOPICS } from '@/../../apps/api/src/services/bridge';

// Mock user IDs (matching feed fixtures)
const ALICE_ID = '00000000-0000-0000-0000-000000000001';
const BOB_ID = '00000000-0000-0000-0000-000000000002';
const CAROL_ID = '00000000-0000-0000-0000-000000000003';
const DAVE_ID = '00000000-0000-0000-0000-000000000004';

// Mock author names
const AUTHOR_NAMES: Record<string, string> = {
  [ALICE_ID]: 'Alice Cooper',
  [BOB_ID]: 'Bob Martinez',
  [CAROL_ID]: 'Carol Chen',
  [DAVE_ID]: 'Dave Wilson',
};

// Available topics (now from Bridge intelligence service)
// const AVAILABLE_TOPICS is imported from TopicIntelligence

// Mock discussion threads for duplicate detection testing
const MOCK_THREADS: DiscussionThread[] = [
  {
    id: 'thread-1',
    postId: '1',
    title: 'Community Garden Planning and Organization',
    topic: 'Community Connection',
    participantCount: 12,
    postCount: 34,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'thread-2',
    postId: '2',
    title: 'Housing Cooperative Formation Steps',
    topic: 'Social Economy',
    participantCount: 8,
    postCount: 19,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// Sample posts for showcase
const SAMPLE_POSTS: Post[] = [
  // Native post with title
  {
    id: '1',
    type: 'native',
    authorId: ALICE_ID,
    groupId: undefined,
    title: 'Community Garden Initiative - Spring 2026',
    content: `I've been thinking about starting a community garden in our neighborhood. We have an unused lot on Oak Street that could be perfect for this.

**Benefits:**
- Fresh, local produce
- Brings neighbors together
- Educational opportunities for kids
- Reduces food costs for participants

Who's interested in joining? Let's discuss!`,
    sourceUrl: undefined,
    sourcePreview: undefined,
    topics: ['Community Connection', 'Common Planet', 'Social Economy'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 12,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    updatedAt: new Date(Date.now() - 60 * 60 * 1000),
  },

  // Native post without title
  {
    id: '2',
    type: 'native',
    authorId: BOB_ID,
    groupId: undefined,
    title: undefined,
    content: `Just read an amazing article about worker cooperatives in Spain. The Mondragon Corporation has 80,000+ worker-owners and has been thriving for 70 years.

Why aren't we doing more of this here? Imagine if every company was owned by its workers. No exploitation, fair wages, democratic decision-making.

This is what cooperative economics looks like in practice.`,
    sourceUrl: undefined,
    sourcePreview: undefined,
    topics: ['Social Economy', 'Cooperative Technology'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 8,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },

  // Imported Instagram post
  {
    id: '3',
    type: 'instagram',
    authorId: CAROL_ID,
    groupId: undefined,
    title: undefined,
    content: undefined,
    sourceUrl: 'https://instagram.com/p/example123',
    sourcePreview: {
      platform: 'instagram',
      title: 'Check out our community mural project!',
      description: 'Local artists came together to create this beautiful piece celebrating our neighborhood\'s diversity and history.',
      authorName: 'Carol Chen',
      thumbnailUrl: 'https://picsum.photos/seed/mural/800/600',
      fetchedAt: new Date(),
    },
    topics: ['Community Connection', 'Collaborative Media'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 5,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },

  // Imported Twitter/X post
  {
    id: '4',
    type: 'twitter',
    authorId: DAVE_ID,
    groupId: undefined,
    title: undefined,
    content: undefined,
    sourceUrl: 'https://x.com/user/status/123456',
    sourcePreview: {
      platform: 'twitter',
      title: 'Thread: The economics of mutual aid networks',
      description: 'A 10-tweet thread exploring how mutual aid networks create economic resilience in communities. Data from 50+ cities worldwide shows these systems reduce poverty by an average of 23%.',
      authorName: 'Dave Wilson',
      thumbnailUrl: 'https://picsum.photos/seed/economics/800/400',
      fetchedAt: new Date(),
    },
    topics: ['Social Economy', 'Common Wellbeing'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 15,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

// Sample thread posts
const SAMPLE_THREAD: ThreadPost[] = [
  {
    id: 't1',
    threadId: 'thread1',
    authorId: ALICE_ID,
    content: 'I think we should start with a small pilot group of 5-6 people to test the concept.',
    parentId: undefined,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 't2',
    threadId: 'thread1',
    authorId: BOB_ID,
    content: 'Great idea! I have some gardening experience and would love to be part of the pilot group.',
    parentId: 't1',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    id: 't3',
    threadId: 'thread1',
    authorId: CAROL_ID,
    content: 'Count me in! I can help with organizing community events around the garden.',
    parentId: 't1',
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000),
  },
];

export default function FeedTestPage() {
  const [activeTab, setActiveTab] = useState<'showcase' | 'demo' | 'api'>('showcase');

  // Demo state
  const [demoPosts, setDemoPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({
    '1': 'care',
    '2': 'insightful',
  });
  const [reactionCounts] = useState<Record<string, any>>({
    '1': { care: 15, insightful: 8, agree: 12, disagree: 0, act: 23, question: 3 },
    '2': { care: 7, insightful: 19, agree: 14, disagree: 2, act: 5, question: 1 },
    '3': { care: 12, insightful: 3, agree: 8, disagree: 0, act: 2, question: 0 },
    '4': { care: 21, insightful: 32, agree: 18, disagree: 5, act: 14, question: 7 },
  });
  const [composerOpen, setComposerOpen] = useState(false);
  const [showcaseComposerOpen, setShowcaseComposerOpen] = useState(false);

  // Phase 3: Bridge intelligence state
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [similarThreads, setSimilarThreads] = useState<SimilarThreadUI[]>([]);
  const [proposedThreadTitle, setProposedThreadTitle] = useState('');

  // Gamification: Invitation modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Handlers
  const handleReact = (postId: string, type: ReactionType) => {
    if (userReactions[postId] === type) {
      const newReactions = { ...userReactions };
      delete newReactions[postId];
      setUserReactions(newReactions);
    } else {
      setUserReactions({ ...userReactions, [postId]: type });
    }
  };

  const handleDiscuss = (postId: string) => {
    // Phase 3: Check for duplicate threads before creating discussion
    const post = demoPosts.find(p => p.id === postId);
    if (!post) return;

    const title = post.title || post.content?.substring(0, 100) || 'Discussion';
    const topic = post.topics[0] || 'General';

    // Use Bridge intelligence to find similar threads
    const similar = TopicIntelligence.findSimilarThreads(
      title,
      post.content || '',
      topic,
      MOCK_THREADS,
      5
    );

    if (similar.length > 0) {
      setProposedThreadTitle(title);
      setSimilarThreads(similar);
      setDuplicateModalOpen(true);
    } else {
      alert(`No similar threads found. Creating new discussion: "${title}"`);
    }
  };

  // Phase 3: Topic suggestion handler for PostComposer
  const handleSuggestTopics = (content: string, title?: string): TopicSuggestion[] => {
    return TopicIntelligence.suggestTopics(content, title);
  };

  // Phase 3: Topic filtering handler
  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic === selectedTopic ? undefined : topic);
  };

  // Phase 3: Show related posts handler
  const handleShowRelated = (postId: string) => {
    const post = demoPosts.find(p => p.id === postId);
    if (!post) return;

    const similar = TopicIntelligence.findSimilarPosts(
      post.content || '',
      post.topics,
      demoPosts.filter(p => p.id !== postId),
      5
    );

    if (similar.length > 0) {
      alert(`Found ${similar.length} similar posts! (Bridge intelligence working)`);
    } else {
      alert('No similar posts found.');
    }
  };

  // Phase 3: Duplicate modal handlers
  const handleJoinThread = (threadId: string) => {
    const thread = MOCK_THREADS.find(t => t.id === threadId);
    alert(`Joining existing discussion: "${thread?.title}"`);
    setDuplicateModalOpen(false);
  };

  const handleCreateNewThread = () => {
    alert(`Creating new discussion: "${proposedThreadTitle}"`);
    setDuplicateModalOpen(false);
  };

  const handleCreatePost = async (data: CreatePostData) => {
    const newPost: Post = {
      id: `new-${Date.now()}`,
      type: data.type === 'native' ? 'native' : 'instagram',
      authorId: ALICE_ID,
      groupId: undefined,
      title: data.title,
      content: data.content,
      sourceUrl: data.sourceUrl,
      sourcePreview: data.sourceUrl ? {
        platform: 'instagram',
        title: 'Imported content preview',
        description: 'This would be fetched from the URL in production',
        authorName: 'Alice Cooper',
        thumbnailUrl: 'https://picsum.photos/seed/new/800/600',
        fetchedAt: new Date(),
      } : undefined,
      topics: data.topics,
      status: 'active',
      discussionThreadId: undefined,
      discussionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDemoPosts([newPost, ...demoPosts]);
  };

  const handleInviteSubmit = async (data: InvitationData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Invitation submitted:', data);
    alert(`Invitation sent to ${data.inviteeName} (${data.inviteeEmail}) - 50RP earned!`);
    setInviteModalOpen(false);
  };

  const filteredPosts = selectedTopic
    ? demoPosts.filter(p => p.topics.includes(selectedTopic))
    : demoPosts;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feed Components Test Page</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive testing interface for all feed-related UI components, interactions, and features.
          </p>
          <div className="mt-3 flex gap-2">
            <Badge variant="brand">Phase 1 ✓</Badge>
            <Badge variant="brand">Phase 2 ✓</Badge>
            <Badge variant="brand">Phase 3 ✓</Badge>
            <Badge variant="default">Phase 4+ (Next)</Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'showcase' as const, label: 'Component Showcase' },
              { id: 'demo' as const, label: 'Interactive Demo' },
              { id: 'api' as const, label: 'API Documentation' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Component Showcase Tab */}
          {activeTab === 'showcase' && (
            <div className="space-y-10">
              {/* PostCard Variations */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">PostCard Component</h2>
                <p className="text-gray-600 mb-6">Display individual posts with reactions and discussion counts.</p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Native Post (with title) - Phase 3 ✓</h3>
                    <PostCard
                      post={SAMPLE_POSTS[0]}
                      authorName={AUTHOR_NAMES[SAMPLE_POSTS[0].authorId]}
                      reactionCounts={reactionCounts['1']}
                      userReaction={userReactions['1']}
                      onReact={handleReact}
                      onDiscuss={handleDiscuss}
                      onTopicClick={handleTopicClick}
                      onShowRelated={handleShowRelated}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Native Post (without title) - Phase 3 ✓</h3>
                    <PostCard
                      post={SAMPLE_POSTS[1]}
                      authorName={AUTHOR_NAMES[SAMPLE_POSTS[1].authorId]}
                      reactionCounts={reactionCounts['2']}
                      userReaction={userReactions['2']}
                      onReact={handleReact}
                      onDiscuss={handleDiscuss}
                      onTopicClick={handleTopicClick}
                      onShowRelated={handleShowRelated}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Imported Instagram Post - Phase 3 ✓</h3>
                    <PostCard
                      post={SAMPLE_POSTS[2]}
                      authorName={AUTHOR_NAMES[SAMPLE_POSTS[2].authorId]}
                      reactionCounts={reactionCounts['3']}
                      onReact={handleReact}
                      onDiscuss={handleDiscuss}
                      onTopicClick={handleTopicClick}
                      onShowRelated={handleShowRelated}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Imported Twitter/X Post - Phase 3 ✓</h3>
                    <PostCard
                      post={SAMPLE_POSTS[3]}
                      authorName={AUTHOR_NAMES[SAMPLE_POSTS[3].authorId]}
                      reactionCounts={reactionCounts['4']}
                      onReact={handleReact}
                      onDiscuss={handleDiscuss}
                      onTopicClick={handleTopicClick}
                      onShowRelated={handleShowRelated}
                    />
                  </div>
                </div>
              </section>

              {/* PostList States */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">PostList Component</h2>
                <p className="text-gray-600 mb-6">Feed display with loading and empty states.</p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Normal List</h3>
                    <PostList
                      posts={SAMPLE_POSTS.slice(0, 2)}
                      authorNames={AUTHOR_NAMES}
                      reactionCounts={reactionCounts}
                      userReactions={userReactions}
                      onReact={handleReact}
                      onDiscuss={handleDiscuss}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Empty State</h3>
                    <PostList
                      posts={[]}
                      authorNames={AUTHOR_NAMES}
                      reactionCounts={reactionCounts}
                      userReactions={userReactions}
                      onReact={handleReact}
                      onDiscuss={handleDiscuss}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Loading State</h3>
                    <PostList
                      posts={[]}
                      authorNames={AUTHOR_NAMES}
                      loading={true}
                    />
                  </div>
                </div>
              </section>

              {/* PostComposer */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">PostComposer Component - Phase 3 ✓</h2>
                <p className="text-gray-600 mb-6">Modal for creating native posts or importing social media content. Now with Bridge AI topic suggestions!</p>

                <Button onClick={() => setShowcaseComposerOpen(true)}>
                  Open PostComposer Demo (with AI suggestions)
                </Button>
                <PostComposer
                  isOpen={showcaseComposerOpen}
                  onClose={() => setShowcaseComposerOpen(false)}
                  onSubmit={async (data) => {
                    alert(`Post created!\n\nType: ${data.type}\nTopics: ${data.topics.join(', ')}`);
                    setShowcaseComposerOpen(false);
                  }}
                  topics={AVAILABLE_TOPICS}
                  onSuggestTopics={handleSuggestTopics}
                />
              </section>

              {/* ThreadView */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">ThreadView Component</h2>
                <p className="text-gray-600 mb-6">Basic discussion thread display (Phase 2 minimal version).</p>

                <ThreadView
                  posts={SAMPLE_THREAD}
                  authorNames={AUTHOR_NAMES}
                  onReply={(content, parentId) => {
                    alert(`Reply submitted!\n\nContent: ${content}\nParent: ${parentId || 'root'}`);
                  }}
                />
              </section>
            </div>
          )}

          {/* Interactive Demo Tab */}
          {activeTab === 'demo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Live Feed Demo</h2>
                  <p className="text-gray-600 mt-1">Create posts and interact with the feed in real-time.</p>
                </div>
                <Button onClick={() => setComposerOpen(true)}>
                  + Create Post
                </Button>
              </div>

              {/* Topic filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedTopic(undefined)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    !selectedTopic
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All Topics
                </button>
                {AVAILABLE_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedTopic === topic
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {/* Interactive Feed */}
              <PostList
                posts={filteredPosts}
                authorNames={AUTHOR_NAMES}
                reactionCounts={reactionCounts}
                userReactions={userReactions}
                onReact={handleReact}
                onDiscuss={handleDiscuss}
              />

              <PostComposer
                isOpen={composerOpen}
                onClose={() => setComposerOpen(false)}
                onSubmit={handleCreatePost}
                topics={AVAILABLE_TOPICS}
                onSuggestTopics={handleSuggestTopics}
              />

              {/* Phase 3: Duplicate Thread Detection Modal */}
              <DuplicateThreadModal
                isOpen={duplicateModalOpen}
                onClose={() => setDuplicateModalOpen(false)}
                similarThreads={similarThreads}
                onJoinThread={handleJoinThread}
                onCreateNew={handleCreateNewThread}
                proposedTitle={proposedThreadTitle}
              />

              {/* Gamification: Group Growth Tracker & Invitation */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Group Growth & Invitations</h3>
                <GroupGrowthTracker
                  groupId="seattle-001"
                  location="Seattle"
                  currentMemberCount={12}
                  onInvite={() => setInviteModalOpen(true)}
                />
              </div>

              <InvitationModal
                isOpen={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onSubmit={handleInviteSubmit}
                groupId="seattle-001"
                location="Seattle"
                rewardPoints={50}
              />
            </div>
          )}

          {/* API Documentation Tab */}
          {activeTab === 'api' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Feed API Endpoints</h2>
                <p className="text-gray-600 mb-6">
                  API routes for feed operations (Phase 3+). These endpoints will be implemented as the Feed module progresses.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">GET /api/feed</h3>
                <p className="text-sm text-gray-600">Fetch feed posts with optional filtering.</p>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Query Parameters:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  topic?: string          // Filter by topic
  limit?: number          // Results per page (default: 20)
  cursor?: string         // Pagination cursor
  authorId?: string       // Filter by author
  type?: 'native' | 'import'  // Filter by post type
}`}
                  </pre>
                  <h4 className="font-semibold mt-4 mb-2">Response:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  posts: Post[]
  nextCursor?: string
  topics: string[]        // Available topics
}`}
                  </pre>
                </Card>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">POST /api/feed</h3>
                <p className="text-sm text-gray-600">Create a new post (native or import).</p>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Request Body:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  type: 'native' | 'import'
  title?: string          // For native posts
  content?: string        // For native posts
  sourceUrl?: string      // For imports
  topics: string[]        // 1-5 topics required
  groupId?: string        // Optional group scope
}`}
                  </pre>
                  <h4 className="font-semibold mt-4 mb-2">Response:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  post: Post
}`}
                  </pre>
                </Card>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">POST /api/feed/[postId]/react</h3>
                <p className="text-sm text-gray-600">Add or toggle a reaction to a post.</p>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Request Body:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  type: 'care' | 'insightful' | 'agree' | 'disagree' | 'act' | 'question'
}`}
                  </pre>
                  <h4 className="font-semibold mt-4 mb-2">Response:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  reactionCounts: {
    care: number
    insightful: number
    agree: number
    disagree: number
    act: number
    question: number
  }
}`}
                  </pre>
                </Card>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">GET /api/feed/[postId]/thread</h3>
                <p className="text-sm text-gray-600">Get discussion thread for a post (Phase 3).</p>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  thread: {
    id: string
    postId: string
    posts: ThreadPost[]
  }
}`}
                  </pre>
                </Card>
              </section>

              <section className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Implementation Status</h3>
                <p className="text-sm text-blue-800 mb-3">
                  The Feed module is currently at 40% completion. Phase 3 will implement:
                </p>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>Discussion thread routes (/api/feed/[postId]/thread)</li>
                  <li>Reply UI and nested thread rendering</li>
                  <li>Real-time reaction updates</li>
                  <li>Topic-based clustering</li>
                  <li>Bridge AI integration for content recommendations</li>
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
