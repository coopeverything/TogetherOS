// apps/api/src/modules/notifications/fixtures/index.ts
// Sample notification data for testing and development

import type { Notification } from '@togetheros/types'

/**
 * Sample user IDs for fixtures
 * These should match IDs from user fixtures
 */
const SAMPLE_USER_ID = '00000000-0000-0000-0000-000000000001'
const SAMPLE_ACTOR_ID = '00000000-0000-0000-0000-000000000002'

/**
 * Sample notifications
 */
export const sampleNotifications: Notification[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    userId: SAMPLE_USER_ID,
    type: 'proposal_update',
    title: 'New proposal: Implement timebanking system',
    body: 'A proposal requiring your input has been submitted',
    icon: '📋',
    priority: 'high',
    status: 'unread',
    reference: {
      type: 'proposal',
      id: '20000000-0000-0000-0000-000000000001',
      url: '/proposals/20000000-0000-0000-0000-000000000001',
    },
    actorId: SAMPLE_ACTOR_ID,
    metadata: {
      proposalTitle: 'Implement timebanking system',
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    readAt: undefined,
    archivedAt: undefined,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    userId: SAMPLE_USER_ID,
    type: 'discussion_reply',
    title: 'Reply to your discussion',
    body: 'Someone replied to "Privacy vs transparency trade-offs"',
    icon: '💬',
    priority: 'normal',
    status: 'unread',
    reference: {
      type: 'discussion',
      id: '30000000-0000-0000-0000-000000000001',
      url: '/forum/30000000-0000-0000-0000-000000000001',
    },
    actorId: SAMPLE_ACTOR_ID,
    metadata: {
      discussionTitle: 'Privacy vs transparency trade-offs',
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    readAt: undefined,
    archivedAt: undefined,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    userId: SAMPLE_USER_ID,
    type: 'group_update',
    title: 'Group update: Local Food Cooperative',
    body: 'New members joined and posted introduction',
    icon: '👥',
    priority: 'normal',
    status: 'read',
    reference: {
      type: 'group',
      id: '40000000-0000-0000-0000-000000000001',
      url: '/groups/40000000-0000-0000-0000-000000000001',
    },
    metadata: {
      groupName: 'Local Food Cooperative',
      newMembers: 3,
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    readAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    archivedAt: undefined,
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    userId: SAMPLE_USER_ID,
    type: 'support_points',
    title: 'Support Points allocation reminder',
    body: 'You have 87 points available to allocate this month',
    icon: '⭐',
    priority: 'normal',
    status: 'read',
    reference: {
      type: 'user',
      id: SAMPLE_USER_ID,
      url: '/rewards',
    },
    metadata: {
      availablePoints: 87,
    },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    readAt: new Date(Date.now() - 46 * 60 * 60 * 1000),
    archivedAt: undefined,
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    userId: SAMPLE_USER_ID,
    type: 'badge_earned',
    title: 'New badge earned: Early Contributor',
    body: 'You earned the Early Contributor badge for your first merged PR!',
    icon: '🏆',
    priority: 'high',
    status: 'read',
    reference: {
      type: 'badge',
      id: '50000000-0000-0000-0000-000000000001',
      url: '/profile',
    },
    actorId: undefined,
    metadata: {
      badgeName: 'Early Contributor',
    },
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    readAt: new Date(Date.now() - 70 * 60 * 60 * 1000),
    archivedAt: undefined,
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    userId: SAMPLE_USER_ID,
    type: 'mention',
    title: 'You were mentioned in a post',
    body: '@you mentioned you in a discussion about cooperative housing',
    icon: '💬',
    priority: 'normal',
    status: 'archived',
    reference: {
      type: 'post',
      id: '60000000-0000-0000-0000-000000000001',
      url: '/feed/60000000-0000-0000-0000-000000000001',
    },
    actorId: SAMPLE_ACTOR_ID,
    metadata: {
      postPreview: 'I agree with @you about the benefits of...',
    },
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000), // 5 days ago
    readAt: new Date(Date.now() - 118 * 60 * 60 * 1000),
    archivedAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
  },
]
