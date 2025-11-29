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
    title: 'Feed Module',
    description:
      "The primary engagement surface combining social media UX with structured deliberation. Transforms passive scrolling into active participation through a conversion funnel: scroll → react → discuss → prioritize → vote → act. Features multi-dimensional reactions, imported content from social platforms, and AI-powered topic clustering to prevent duplicate discussions.",
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/feed.md`,
    docsPath: '/docs/modules/feed',
    category: 'Community Connection, Collective Governance',
  },
  {
    title: 'Groups & Organizations',
    description:
      'Enables communities to self-organize with transparent governance. Features group creation, membership management, role-based permissions, and consent-based decision making. Each group operates autonomously while maintaining federation capabilities for cross-group collaboration.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/groups.md`,
    docsPath: '/docs/modules/groups',
    category: 'Community Connection, Collective Governance',
  },
  {
    title: 'Governance & Proposals',
    description:
      'Transparent proposal creation and consent-based decision making system. Members create individual or group-scoped proposals, deliberate with evidence and trade-offs, make decisions with minority report preservation, and track delivery outcomes. Integrates with Bridge AI for similarity detection and regulation conflict checking.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/governance.md`,
    docsPath: '/docs/modules/governance',
    category: 'Collective Governance',
  },
  {
    title: 'Forum & Deliberation',
    description:
      'Structured discussion threads for deep deliberation on complex topics. Feed discussions flow here when they require sustained attention. Features threaded conversations (topics/posts/replies), empathy-focused reactions (agree/disagree/insightful/empathy/question), and transparent moderation queue. Production-ready.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/forum.md`,
    docsPath: '/docs/modules/forum',
    category: 'Collective Governance, Community Connection',
  },
  {
    title: 'Bridge AI Assistant',
    description:
      'Internal AI assistant (core team pilot) providing conversational Q&A, citation-backed answers, and context-aware recommendations. Features streaming responses, NDJSON audit logs, rate limiting, governance integration, 8-step onboarding wizard with RP rewards, and PostgreSQL progress tracking.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/bridge.md`,
    docsPath: '/docs/modules/bridge',
    category: 'Cooperative Technology',
  },
  {
    title: 'Gamification & Milestones',
    description:
      'Local community growth tracking with milestone celebrations and invitation rewards. All phases complete: Database schema (6 tables), invitation flow, 8-step onboarding with RP (~165 RP), daily challenges, first-week journey, admin settings, InviteStats, InviteButton, testing page at /admin/gamification-testing. Focus on cooperation over competition.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/gamification.md`,
    docsPath: '/docs/modules/gamification',
    category: 'Community Connection',
  },
  {
    title: 'Social Economy Primitives',
    description:
      '4-ledger cooperative economic system with anti-plutocracy safeguards: Support Points (SP) for governance power, Reward Points (RP) for economic claims, Timebank Credits (TBC) for bartering goods/services, and Social Horizon (SH) for stable local currency. Core invariant: Money/RP can NEVER become SP - governance power only from contributions. Enables fair social economy without wealth buying influence.',
    progress: 0,
    status: 'planned',
    repoPath: `${GITHUB_BASE}/docs/modules/social-economy.md`,
    docsPath: '/docs/modules/social-economy',
    category: 'Social Economy',
  },
  {
    title: 'Support Points & Reputation',
    description:
      'Tracks member contributions and distributes Support Points (SP) and Reward Points (RP). SP for governance power (ONLY from contributions), RP for economic claims. Full system: DB + API + ReputationService + badge awarding hooks in governance/forum + admin panel + RP balance/transactions API. Production-ready.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/rewards.md`,
    docsPath: '/docs/modules/rewards',
    category: 'Social Economy',
  },
  {
    title: 'Support Points UI',
    description:
      'Complete SP/RP member interface: SP wallet with allocation history, RP dashboard with earnings tracker and badge progress, proposal allocation widget, admin panels for circulation stats. All phases complete including admin tracking panels. Production-ready.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/support-points-ui.md`,
    docsPath: '/docs/modules/support-points-ui',
    category: 'Social Economy',
  },
  {
    title: 'Admin Accountability',
    description:
      'Decision implementation tracking with cooperative safeguards. Prevents admin overreach through transparent action logs, community oversight, and mandatory progress reporting. Every decision includes delivery metrics and public accountability measures.',
    progress: 0,
    status: 'planned',
    repoPath: `${GITHUB_BASE}/docs/modules/admin-accountability.md`,
    docsPath: '/docs/modules/admin-accountability',
    category: 'Collective Governance',
  },
  {
    title: 'Moderation Transparency',
    description:
      'Quality-scored moderation system with Reward Points incentives for effective moderation. Features transparent moderation logs, community review of decisions, and empathy-first de-escalation rules. AI-assisted discourse management helps maintain constructive dialogue.',
    progress: 0,
    status: 'planned',
    repoPath: `${GITHUB_BASE}/docs/modules/moderation-transparency.md`,
    docsPath: '/docs/modules/moderation-transparency',
    category: 'Collective Governance',
  },
  {
    title: 'Security & Privacy',
    description:
      'Privacy-first architecture with no raw prompts stored, IP hashing, PII redaction, and append-only audit logs. Features least-privilege access control, role-based permissions, and exportable data for portable identities. Ensures member data sovereignty and platform transparency.',
    progress: 30,
    status: 'in-progress',
    repoPath: `${GITHUB_BASE}/docs/modules/security.md`,
    docsPath: '/docs/modules/security',
    category: 'Cooperative Technology',
  },
  {
    title: 'Observability & Monitoring',
    description:
      'Self-hosted observability stack with error/perf logging, alert manager, Prometheus metrics, APM distributed tracing, contract testing, feature flags, and canary deployment. Features gradual rollouts (10%→50%→100%), auto-rollback on error threshold, and user targeting rules.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/observability.md`,
    docsPath: '/docs/modules/observability',
    category: 'Cooperative Technology',
  },
  {
    title: 'Monorepo & Scaffolding',
    description:
      'Project infrastructure and build system. Next.js 14 monorepo with TypeScript project references. Shared packages: types, validators, UI components, and database utilities (@togetheros/db). Establishes conventions for domain-driven structure and testing patterns. Production-ready.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/PACKAGES.md`,
    category: 'Cooperative Technology',
  },
  {
    title: 'UI Design System',
    description:
      'Shared component library built on Tailwind CSS v4 and Radix UI primitives. Provides accessible, customizable components following cooperation-first design principles. Includes responsive layouts, dark mode support, and consistent spacing/typography. Production-ready.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/ui`,
    category: 'Cooperative Technology',
  },
  {
    title: 'Identity & Authentication',
    description:
      'User identity management with Google OAuth integration, session handling, email verification, password reset, and secure authentication flows. Features exportable identities for platform portability and privacy-first design. Production-ready.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/auth`,
    category: 'Cooperative Technology',
  },
  {
    title: 'User Profiles',
    description:
      'Member profiles with customizable fields, contribution history, and group memberships. Shows earned Reward Points, allocated Support Points, and participation metrics. Privacy controls allow members to choose what information is public. Production-ready.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/templates/profile-template.md`,
    category: 'Community Connection',
  },
  {
    title: 'Search & Discovery',
    description:
      'Global search with path/keyword filters, full-text search across proposals + forum topics + posts + profiles. Features privacy-preserving query tracking, saved searches, autocomplete, and search history API. All phases complete, production-ready.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/search.md`,
    docsPath: '/docs/modules/search',
    category: 'Cooperative Technology',
  },
  {
    title: 'Notifications & Inbox',
    description:
      'Real-time notifications for mentions, replies, proposal updates, and governance decisions. All features complete: PostgreSQL database schema, preferences API with per-type toggles, settings UI page, filtering by type, mark-as-read/mark-all-read, email digest frequency controls, and push notification settings. Database-backed with in-memory fallback for development.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/notifications.md`,
    docsPath: '/docs/modules/notifications',
    category: 'Community Connection',
  },
  {
    title: 'Onboarding Experience',
    description:
      'Comprehensive onboarding system with behavioral AI, 8-step UI wizard with RP rewards, PostgreSQL-backed progress tracking, and Bridge AI contextual help. Features mystery-driven progressive disclosure, personalized paths, and daily engagement mechanics. Teaches platform usage and cooperative skills through structured learning.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/onboarding.md`,
    docsPath: '/docs/modules/onboarding',
    category: 'Community Connection',
  },
  {
    title: 'Events & Calendar',
    description:
      'Comprehensive event management, milestone tracking, and meeting scheduling. Database schema (6 tables), full CRUD API, RSVP system, calendar view with month navigation, event type filtering, upcoming events sidebar. Features attendance tracking, meeting notes, and capacity management. Production-ready.',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/events.md`,
    docsPath: '/docs/modules/events',
    category: 'Collective Governance, Community Connection',
  },
  {
    title: 'Metrics & Review',
    description:
      'Success tracking and continuous improvement system. Define metrics for initiatives, measure outcomes vs expectations, trigger re-evaluations when metrics fail, validate minority reports, and auto-generate improvement proposals. Creates a feedback loop from implementation back to governance, ensuring the commons learns from experience.',
    progress: 0,
    status: 'planned',
    repoPath: `${GITHUB_BASE}/docs/modules/metrics.md`,
    docsPath: '/docs/modules/metrics',
    category: 'Collective Governance',
  },
]

// Helper functions for filtering modules
export const getCompleteModules = () => modules.filter((m) => m.status === 'complete')
export const getInProgressModules = () => modules.filter((m) => m.status === 'in-progress')
export const getPlannedModules = () => modules.filter((m) => m.status === 'planned')
