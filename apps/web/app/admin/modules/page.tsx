import { ModuleCard } from '@togetheros/ui/docs/ModuleCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Modules Hub | Coopeverything Docs',
  description: 'Comprehensive overview of all Coopeverything platform modules',
}

const GITHUB_BASE = 'https://github.com/coopeverything/TogetherOS/blob/yolo'

interface Module {
  title: string
  description: string
  progress: number
  status: 'complete' | 'in-progress' | 'planned'
  repoPath: string
  docsPath?: string
  category: string
}

const modules: Module[] = [
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
      'Structured discussion threads for deep deliberation on complex topics. Feed discussions flow here when they require sustained attention. Features threaded conversations (topics/posts/replies), empathy-focused reactions (agree/disagree/insightful/empathy/question), and transparent moderation queue. Production-ready ✅',
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
      'Tracks member contributions and distributes Support Points (SP) and Reward Points (RP). SP for governance power (ONLY from contributions), RP for economic claims. Backend complete with database schema, API endpoints, and type definitions. UI components pending for member-facing interfaces.',
    progress: 45,
    status: 'in-progress',
    repoPath: `${GITHUB_BASE}/docs/modules/rewards.md`,
    docsPath: '/docs/modules/rewards',
    category: 'Social Economy',
  },
  {
    title: 'Support Points UI',
    description:
      'Complete SP/RP member interface: SP wallet with allocation history, RP dashboard with earnings tracker and badge progress, proposal allocation widget, admin panels for circulation stats. All phases complete including admin tracking panels. Production-ready ✅',
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
      'Project infrastructure and build system. Next.js 14 monorepo with TypeScript project references. Shared packages: types, validators, UI components, and database utilities (@togetheros/db). Establishes conventions for domain-driven structure and testing patterns. Production-ready ✅',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/PACKAGES.md`,
    category: 'Cooperative Technology',
  },
  {
    title: 'UI Design System',
    description:
      'Shared component library built on Tailwind CSS v4 and Radix UI primitives. Provides accessible, customizable components following cooperation-first design principles. Includes responsive layouts, dark mode support, and consistent spacing/typography. Production-ready ✅',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/modules/ui`,
    category: 'Cooperative Technology',
  },
  {
    title: 'Identity & Authentication',
    description:
      'User identity management with Google OAuth integration, session handling, email verification, password reset, and secure authentication flows. Features exportable identities for platform portability and privacy-first design. Production-ready ✅',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/auth`,
    category: 'Cooperative Technology',
  },
  {
    title: 'User Profiles',
    description:
      'Member profiles with customizable fields, contribution history, and group memberships. Shows earned Reward Points, allocated Support Points, and participation metrics. Privacy controls allow members to choose what information is public. Production-ready ✅',
    progress: 100,
    status: 'complete',
    repoPath: `${GITHUB_BASE}/docs/templates/profile-template.md`,
    category: 'Community Connection',
  },
  {
    title: 'Search & Discovery',
    description:
      'Global search with path/keyword filters, full-text search across proposals + forum topics + posts. Features privacy-preserving query tracking (SHA-256 hashing), relevance scoring, and fast response times (4-15ms). Phase 1-2 complete, production-verified.',
    progress: 85,
    status: 'in-progress',
    repoPath: `${GITHUB_BASE}/docs/modules/search.md`,
    docsPath: '/docs/modules/search',
    category: 'Cooperative Technology',
  },
  {
    title: 'Notifications & Inbox',
    description:
      'Real-time notifications for mentions, replies, proposal updates, and governance decisions. Configurable notification preferences with email and in-app delivery. Complete MVP with 6 endpoints and 3 UI components deployed.',
    progress: 65,
    status: 'in-progress',
    repoPath: `${GITHUB_BASE}/docs/modules`,
    category: 'Community Connection',
  },
  {
    title: 'Onboarding Experience',
    description:
      'Comprehensive learning system with structured paths, mini-lessons, and quizzes. Teaches platform usage and cooperative skills (self-moderation, consensus-building). Features RP rewards, badges, daily challenges, and streak tracking. Bridge AI provides contextual help throughout. Designed to develop confident contributors with healthy daily engagement habits.',
    progress: 0,
    status: 'planned',
    repoPath: `${GITHUB_BASE}/docs/modules/onboarding.md`,
    category: 'Community Connection',
  },
  {
    title: 'Events & Calendar',
    description:
      'Comprehensive event management, milestone tracking, and meeting scheduling. Integrates with initiatives to auto-create deadline events, workgroup meetings, and review sessions. Features attendance tracking, meeting notes, and RSVP management. Keeps the community coordinated and accountable.',
    progress: 0,
    status: 'planned',
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

export default function ModulesIndexPage() {
  const completeModules = modules.filter((m) => m.status === 'complete')
  const inProgressModules = modules.filter((m) => m.status === 'in-progress')
  const plannedModules = modules.filter((m) => m.status === 'planned')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Coopeverything Modules Hub
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            These modules work together as a <strong>unified governance pipeline</strong>: from ideation to decision to execution to continuous improvement. Each module represents a key capability powered by TogetherOS, the technology stack enabling cooperation.
          </p>
          <div className="mt-4">
            <a
              href="/how-we-decide"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Learn how the pipeline works →
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {modules.length}
            </div>
            <div className="text-sm text-gray-600">Total Modules</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {completeModules.length}
            </div>
            <div className="text-sm text-gray-600">Production Ready</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {inProgressModules.length}
            </div>
            <div className="text-sm text-gray-600">In Development</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {plannedModules.length}
            </div>
            <div className="text-sm text-gray-600">Planned</div>
          </div>
        </div>

        {/* Complete Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-green-600 rounded-full"></span>
            Production Ready
          </h2>
          <div className="space-y-4">
            {completeModules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </section>

        {/* In Progress Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-orange-600 rounded-full"></span>
            In Development
          </h2>
          <div className="space-y-4">
            {inProgressModules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </section>

        {/* Planned Modules */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-gray-400 rounded-full"></span>
            Planned Modules
          </h2>
          <div className="space-y-4">
            {plannedModules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-16 p-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contributing
          </h3>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Each module follows domain-driven design with tiny, verifiable
            increments. See our{' '}
            <a
              href={`${GITHUB_BASE}/docs/OPERATIONS.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Operations Guide
            </a>{' '}
            for contribution workflow and{' '}
            <a
              href={`${GITHUB_BASE}/docs/STATUS_v2.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Status Dashboard
            </a>{' '}
            for authoritative progress tracking.
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/coopeverything/TogetherOS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              View Repository
            </a>
            <a
              href={`${GITHUB_BASE}/docs/contributors/GETTING_STARTED.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
