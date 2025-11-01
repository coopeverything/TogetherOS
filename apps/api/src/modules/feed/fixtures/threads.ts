// apps/api/src/modules/feed/fixtures/threads.ts
// Sample discussion threads and posts for testing

import type { DiscussionThread, ThreadPost } from '@togetheros/types'
import { v4 as uuidv4 } from 'uuid'

// Use first post ID from main feed fixtures
const GARDEN_POST_ID = 'post-garden-001'
const COOP_POST_ID = 'post-coop-001'

const ALICE_ID = '00000000-0000-0000-0000-000000000001'
const BOB_ID = '00000000-0000-0000-0000-000000000002'
const CAROL_ID = '00000000-0000-0000-0000-000000000003'

const now = new Date()
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

export const sampleThreads: DiscussionThread[] = [
  {
    id: uuidv4(),
    postId: GARDEN_POST_ID,
    title: 'Community Garden Initiative - Discussion',
    topic: 'Common Planet',
    participantCount: 3,
    postCount: 5,
    createdAt: twoHoursAgo,
    lastActivityAt: oneHourAgo,
  },
]

const post1Id = uuidv4()
const post2Id = uuidv4()
const post3Id = uuidv4()
const post4Id = uuidv4()
const post5Id = uuidv4()

export const sampleThreadPosts: ThreadPost[] = [
  {
    id: post1Id,
    threadId: sampleThreads[0].id,
    authorId: BOB_ID,
    content: 'I love this idea! I have some gardening experience and would be happy to help organize.',
    parentId: undefined,
    createdAt: twoHoursAgo,
    updatedAt: twoHoursAgo,
  },
  {
    id: post2Id,
    threadId: sampleThreads[0].id,
    authorId: CAROL_ID,
    content: "What about water access? The lot on Oak Street doesn't have a direct water line.",
    parentId: undefined,
    createdAt: new Date(twoHoursAgo.getTime() + 30 * 60 * 1000),
    updatedAt: new Date(twoHoursAgo.getTime() + 30 * 60 * 1000),
  },
  {
    id: post3Id,
    threadId: sampleThreads[0].id,
    authorId: ALICE_ID,
    content: 'Good point! We could install rain barrels and maybe work with the city for a temporary hookup.',
    parentId: post2Id,
    createdAt: new Date(twoHoursAgo.getTime() + 45 * 60 * 1000),
    updatedAt: new Date(twoHoursAgo.getTime() + 45 * 60 * 1000),
  },
  {
    id: post4Id,
    threadId: sampleThreads[0].id,
    authorId: BOB_ID,
    content: 'I can contribute some tools - shovels, hoes, a wheelbarrow.',
    parentId: undefined,
    createdAt: oneHourAgo,
    updatedAt: oneHourAgo,
  },
  {
    id: post5Id,
    threadId: sampleThreads[0].id,
    authorId: CAROL_ID,
    content: "That's great! Maybe we should create a shared spreadsheet to track commitments?",
    parentId: post4Id,
    createdAt: oneHourAgo,
    updatedAt: oneHourAgo,
  },
]
