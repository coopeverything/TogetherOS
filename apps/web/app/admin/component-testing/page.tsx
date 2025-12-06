'use client'

/**
 * Component Testing Hub - Consolidated testing interface
 * Provides tabbed access to all module testing pages
 */

import { useState } from 'react'
import Link from 'next/link'

type TestModule = 'auth' | 'feed' | 'profile' | 'gamification' | 'recommendations' | 'forum'

interface ModuleInfo {
  id: TestModule
  name: string
  description: string
  path: string
  status: 'active' | 'partial' | 'coming-soon'
  features: string[]
}

const modules: ModuleInfo[] = [
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Test signup, login, OAuth, email verification, password reset',
    path: '/admin/auth-testing',
    status: 'active',
    features: ['Email/Password signup', 'Login flow', 'Google OAuth', 'Email verification', 'Password reset', 'Session management'],
  },
  {
    id: 'feed',
    name: 'Feed',
    description: 'Post cards, reactions, discussions, topic filtering',
    path: '/admin/feed-testing',
    status: 'active',
    features: ['PostCard variants', 'PostList states', 'PostComposer', 'ThreadView', 'Topic intelligence', 'Duplicate detection'],
  },
  {
    id: 'profile',
    name: 'Profile',
    description: 'Profile cards, completion indicator, tag input',
    path: '/admin/profile-testing',
    status: 'active',
    features: ['ProfileCard variations', 'Completion indicator', 'TagInput component', 'Interactive editing', 'API testing'],
  },
  {
    id: 'gamification',
    name: 'Gamification',
    description: 'RP animations, milestones, challenges, invitations',
    path: '/admin/gamification-testing',
    status: 'active',
    features: ['RP animations', 'Milestone celebrations', 'Daily challenges', 'Invitation system', 'Growth tracker', 'Progress bars'],
  },
  {
    id: 'recommendations',
    name: 'Recommendations',
    description: 'Bridge AI context-aware recommendations testing',
    path: '/admin/recommendations-testing',
    status: 'active',
    features: ['Generate recommendations', 'Fetch existing', 'Take action', 'Dismiss', 'Context awareness', 'Urgency scoring'],
  },
  {
    id: 'forum',
    name: 'Forum',
    description: 'Forum UI components and topic displays',
    path: '/admin/forum-designs',
    status: 'active',
    features: ['Topic list', 'Thread view', 'Reply forms', 'Tag display', 'Category navigation'],
  },
]

export default function ComponentTestingPage() {
  const [selectedModule, setSelectedModule] = useState<TestModule | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-brand-100 text-brand-800'
      case 'partial': return 'bg-amber-100 text-amber-800'
      case 'coming-soon': return 'bg-bg-2 text-ink-400'
      default: return 'bg-bg-2 text-ink-400'
    }
  }

  return (
    <div className="min-h-screen bg-bg-0 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/admin"
            className="text-sm text-ink-400 hover:text-ink-700 mb-2 inline-block"
          >
            ← Back to Admin
          </Link>
          <h1 className="text-sm font-semibold text-ink-900 mb-2">
            Component Testing Hub
          </h1>
          <p className="text-sm text-ink-400">
            Consolidated testing interface for all TogetherOS UI modules
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`bg-bg-1 rounded-lg border ${
                selectedModule === module.id
                  ? 'border-brand-500 ring-2 ring-brand-500/20'
                  : 'border-border'
              } overflow-hidden transition-all hover:shadow-md`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-ink-900">
                    {module.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(module.status)}`}>
                    {module.status === 'active' ? 'Active' : module.status === 'partial' ? 'Partial' : 'Soon'}
                  </span>
                </div>
                <p className="text-sm text-ink-400 mb-3">
                  {module.description}
                </p>

                {/* Features List */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {module.features.slice(0, 4).map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-bg-2 text-ink-400 px-2 py-0.5 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {module.features.length > 4 && (
                    <span className="text-xs text-ink-400">
                      +{module.features.length - 4} more
                    </span>
                  )}
                </div>

                <Link
                  href={module.path}
                  className="w-full block text-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 transition-colors"
                >
                  Open Testing Page
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access Panel */}
        <div className="bg-bg-1 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {modules.map((module) => (
              <Link
                key={module.id}
                href={module.path}
                className="flex flex-col items-center p-3 rounded-lg bg-bg-2 hover:bg-bg-1 transition-colors text-center"
              >
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center mb-2">
                  <span className="text-brand-600 text-sm font-bold">
                    {module.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-ink-700 font-medium">
                  {module.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Testing Guidelines */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Testing Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Each module has its own dedicated testing page with interactive demos</li>
            <li>• Test both light and dark mode variants using the theme toggle</li>
            <li>• API testing requires authentication - ensure you&apos;re logged in</li>
            <li>• Report bugs via GitHub Issues with module name in the title</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
