// packages/types/src/topics.ts
// Shared topic constants for TogetherOS

/**
 * Available topics in TogetherOS
 * From the 8 Cooperation Paths + common subtopics
 */
export const AVAILABLE_TOPICS = [
  // Core Cooperation Paths
  'Collaborative Education',
  'Social Economy',
  'Common Wellbeing',
  'Cooperative Technology',
  'Collective Governance',
  'Community Connection',
  'Collaborative Media & Culture',
  'Common Planet',

  // Common subtopics
  'Housing',
  'Climate',
  'Healthcare',
  'Food Systems',
  'Transportation',
  'Energy',
  'Water',
  'Waste & Recycling',
  'Education',
  'Childcare',
  'Elder Care',
  'Mental Health',
  'Local Currency',
  'Timebanking',
  'Mutual Aid',
  'Cooperative Business',
  'Worker Ownership',
  'Land Trusts',
  'Commons',
  'Direct Democracy',
  'Participatory Budgeting',
  'Conflict Resolution',
  'Restorative Justice',
  'Arts & Culture',
  'Media Literacy',
  'Storytelling',
  'Public Space',
  'Community Gardens',
  'Tool Libraries',
  'Skill Sharing',
] as const

export type Topic = typeof AVAILABLE_TOPICS[number]
