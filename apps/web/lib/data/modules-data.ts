/**
 * Shared module data - single source of truth for all module status displays.
 *
 * Used by:
 * - /modules (public modules hub)
 * - /admin/modules (admin modules dashboard)
 *
 * When updating module progress:
 * 1. Update this file
 * 2. Update docs/STATUS_v2.md (authoritative documentation)
 * 3. Run scripts/check-module-status.sh to verify sync
 */

export const GITHUB_BASE = 'https://github.com/coopeverything/TogetherOS/blob/yolo'

export interface Module {
  title: string
  description: string
  progress: number
  status: 'complete' | 'in-progress' | 'planned'
  repoPath: string
  docsPath?: string
  category: string
}

export const modules: Module[] = [
  {
    title: 'Feed',
    description:
      'Your main view of community activity. See what members are discussing, react to posts, join conversations, and discover proposals that need your input. A familiar scroll experience that connects you to meaningful action.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/feed.md`,
    docsPath: '/docs/modules/feed',
    category: 'Community Connection, Collective Governance',
  },
  {
    title: 'Groups & Organizations',
    description:
      'Join or create groups around shared interests, locations, or causes. Groups make decisions together, manage their own membership, and connect with other groups when needed. Your group, your rules.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/groups.md`,
    docsPath: '/docs/modules/groups',
    category: 'Community Connection, Collective Governance',
  },
  {
    title: 'Governance & Proposals',
    description:
      'Create proposals, discuss them with your community, and make decisions together. Every voice matters - you can support ideas you care about, raise concerns, and track what happens after decisions are made.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/governance.md`,
    docsPath: '/docs/modules/governance',
    category: 'Collective Governance',
  },
  {
    title: 'Forum & Deliberation',
    description:
      'Deep discussions on topics that matter. When conversations need more space than a quick post, the forum lets you explore ideas thoroughly, share different perspectives, and reach understanding together.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/forum.md`,
    docsPath: '/docs/modules/forum',
    category: 'Collective Governance, Community Connection',
  },
  {
    title: 'Bridge AI Assistant',
    description:
      'Your helpful guide to understanding CoopEverything. Ask questions, get clear answers with sources, and discover how to participate effectively. Bridge helps you find what you need.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/bridge.md`,
    docsPath: '/docs/modules/bridge',
    category: 'Cooperative Technology',
  },
  {
    title: 'Achievements & Milestones',
    description:
      'Celebrate your community journey. Earn recognition for inviting friends, completing your first week, and participating in group decisions. Watch your local community grow together.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/gamification.md`,
    docsPath: '/docs/modules/gamification',
    category: 'Community Connection',
  },
  {
    title: 'Social Economy',
    description:
      'A fair economic system where money follows values. Exchange services through timebanking, pool resources for group purchases, and build collective wealth that stays in your community.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/social-economy.md`,
    docsPath: '/docs/modules/social-economy',
    category: 'Social Economy',
  },
  {
    title: 'Recognition & Rewards',
    description:
      'Get recognized for your contributions. Earn points by helping others, participating in decisions, and building community. Your effort matters and the system remembers.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/rewards.md`,
    docsPath: '/docs/modules/rewards',
    category: 'Social Economy',
  },
  {
    title: 'Your Wallet',
    description:
      'See your Support Points and Reward Points at a glance. Track what you have earned, what you have allocated to proposals, and your progress toward community badges.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/support-points-ui.md`,
    docsPath: '/docs/modules/support-points-ui',
    category: 'Social Economy',
  },
  {
    title: 'Admin Accountability',
    description:
      'See what coordinators are doing and hold them accountable. Every decision gets tracked, every action gets logged, and the community can review and recall roles when needed.',
    progress: 0,
    status: 'planned',
    repoPath: `${GITHUB_BASE}/docs/modules/admin-accountability.md`,
    docsPath: '/docs/modules/admin-accountability',
    category: 'Collective Governance',
  },
  {
    title: 'Moderation Transparency',
    description:
      'Fair, visible moderation that the community controls. See why content was moderated, appeal decisions you disagree with, and help maintain a healthy community through collective oversight.',
    progress: 0,
    status: 'planned',
    repoPath: `${GITHUB_BASE}/docs/modules/moderation-transparency.md`,
    docsPath: '/docs/modules/moderation-transparency',
    category: 'Collective Governance',
  },
  {
    title: 'Security & Privacy',
    description:
      'Your data belongs to you. We protect your privacy, let you export your information anytime, and never sell your data. You control what you share and with whom.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/security.md`,
    docsPath: '/docs/modules/security',
    category: 'Cooperative Technology',
  },
  {
    title: 'System Health',
    description:
      'We monitor our systems to keep everything running smoothly. When something goes wrong, we catch it fast and fix it fast. Your experience matters.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/observability.md`,
    docsPath: '/docs/modules/observability',
    category: 'Cooperative Technology',
  },
  {
    title: 'Platform Foundation',
    description:
      'The technical foundation that makes everything work together. Built for reliability, speed, and the ability to grow with our community.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/PACKAGES.md`,
    category: 'Cooperative Technology',
  },
  {
    title: 'Visual Design',
    description:
      'A consistent, accessible look and feel across the platform. Dark mode, mobile-friendly layouts, and thoughtful design that works for everyone.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/ui`,
    category: 'Cooperative Technology',
  },
  {
    title: 'Your Account',
    description:
      'Sign in securely, manage your profile, and control your account settings. Your identity stays yours - you can export your data or delete your account anytime.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/auth`,
    category: 'Cooperative Technology',
  },
  {
    title: 'Member Profiles',
    description:
      'Show the community who you are. Share your interests, see your contribution history, and connect with like-minded members. You choose what to share.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/templates/profile-template.md`,
    category: 'Community Connection',
  },
  {
    title: 'Search & Discovery',
    description:
      'Find proposals, discussions, members, and groups quickly. Search across everything, save searches you use often, and discover new ways to participate.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/search.md`,
    docsPath: '/docs/modules/search',
    category: 'Cooperative Technology',
  },
  {
    title: 'Notifications',
    description:
      'Stay informed about what matters to you. Get notified when someone replies to you, when proposals you care about are decided, or when your group needs input. You control what you receive.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/notifications.md`,
    docsPath: '/docs/modules/notifications',
    category: 'Community Connection',
  },
  {
    title: 'Getting Started',
    description:
      'A friendly introduction to how everything works. Learn the basics, discover what you can do, and earn rewards as you explore. No prior experience needed.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/onboarding.md`,
    docsPath: '/docs/modules/onboarding',
    category: 'Community Connection',
  },
  {
    title: 'Events & Calendar',
    description:
      'See what is happening in your community. Find local meetups, online gatherings, and important dates. RSVP to events and never miss something you care about.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/events.md`,
    docsPath: '/docs/modules/events',
    category: 'Collective Governance, Community Connection',
  },
  {
    title: 'Progress Tracking',
    description:
      'See how well initiatives are working. Track outcomes, understand what succeeded and what needs adjustment, and help improve future proposals based on real results.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/metrics.md`,
    docsPath: '/docs/modules/metrics',
    category: 'Collective Governance',
  },
]

// Helper functions for filtering modules
export const getCompleteModules = () => modules.filter((m) => m.status === 'complete')
export const getInProgressModules = () => modules.filter((m) => m.status === 'in-progress')
export const getPlannedModules = () => modules.filter((m) => m.status === 'planned')
