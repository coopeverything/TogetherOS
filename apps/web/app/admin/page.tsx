'use client'

/**
 * Admin Dashboard - Clean, organized admin interface
 * Route: /admin
 * Auth: Admin only
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminSection {
  title: string
  items: AdminItem[]
}

interface AdminItem {
  title: string
  description: string
  path: string
  status: 'active' | 'coming-soon'
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('Platform Operations')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.is_admin) {
          setIsAuthorized(true)
        } else {
          router.push('/login?redirect=/admin')
        }
      })
      .catch(() => {
        router.push('/login?redirect=/admin')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const sections: AdminSection[] = [
    {
      title: 'Platform Operations',
      items: [
        {
          title: 'System Settings',
          description: 'Configure SP/RP weights, conversion rates, and constraints',
          path: '/admin/settings',
          status: 'active',
        },
        {
          title: 'Feature Flags',
          description: 'Toggle features and experimental functionality',
          path: '/admin/features',
          status: 'active',
        },
        {
          title: 'Security Dashboard',
          description: 'Security features, rate limiting, GDPR compliance, and vulnerability status',
          path: '/admin/security',
          status: 'active',
        },
        {
          title: 'Member Management',
          description: 'User accounts, roles, and permissions',
          path: '/admin/members',
          status: 'coming-soon',
        },
        {
          title: 'Group Oversight',
          description: 'Monitor groups and coordination',
          path: '/admin/groups',
          status: 'coming-soon',
        },
      ],
    },
    {
      title: 'Bridge AI',
      items: [
        {
          title: 'Training Data',
          description: 'Manage Bridge AI training data and Q&A examples',
          path: '/admin/bridge',
          status: 'active',
        },
        {
          title: 'Teaching Sessions',
          description: 'Interactive role-play training for teaching Bridge to handle user archetypes',
          path: '/admin/bridge-teaching',
          status: 'active',
        },
        {
          title: 'Recommendations',
          description: 'Bridge context-aware recommendation system configuration',
          path: '/admin/recommendations-testing',
          status: 'active',
        },
      ],
    },
    {
      title: 'Learning & Content',
      items: [
        {
          title: 'Onboarding Editor',
          description: 'Rich text editor for challenges, microlessons, quizzes, and first-week onboarding flow',
          path: '/admin/onboarding',
          status: 'active',
        },
        {
          title: 'Learning Paths',
          description: 'Manage learning paths, lessons, and quizzes for user onboarding',
          path: '/admin/onboarding-learning',
          status: 'active',
        },
        {
          title: 'Moderation Queue',
          description: 'Review flagged content and user reports',
          path: '/admin/moderation',
          status: 'coming-soon',
        },
      ],
    },
    {
      title: 'Community & Economy',
      items: [
        {
          title: 'Governance Oversight',
          description: 'Proposal monitoring and decision logs',
          path: '/admin/governance',
          status: 'coming-soon',
        },
        {
          title: 'Support Points',
          description: 'SP circulation, top allocators, allocation patterns',
          path: '/admin/support-points',
          status: 'active',
        },
        {
          title: 'Reward Points',
          description: 'RP stats, earning breakdown, top earners',
          path: '/admin/reward-points',
          status: 'active',
        },
        {
          title: 'Badges & Achievements',
          description: 'View badges, award statistics, and recent awards',
          path: '/admin/badges',
          status: 'active',
        },
        {
          title: 'Events Calendar',
          description: 'Community events, meetings, and milestone tracking',
          path: '/events',
          status: 'active',
        },
        {
          title: 'Forum Tags',
          description: 'Manage, rename, and delete forum tags across all topics',
          path: '/admin/forum/tags',
          status: 'active',
        },
        {
          title: 'Social Economy',
          description: 'Timebanking, mutual aid, and cooperative treasury',
          path: '/admin/economy',
          status: 'coming-soon',
        },
      ],
    },
    {
      title: 'System Health',
      items: [
        {
          title: 'Observability',
          description: 'Full observability dashboard with logs, metrics, flags, and APM',
          path: '/admin/observability',
          status: 'active',
        },
        {
          title: 'System Status',
          description: 'Overall system status and health overview',
          path: '/admin/status',
          status: 'active',
        },
        {
          title: 'Module Progress',
          description: 'Module implementation progress and status tracking',
          path: '/admin/modules',
          status: 'active',
        },
        {
          title: 'Analytics',
          description: 'Growth metrics and system performance',
          path: '/admin/analytics',
          status: 'coming-soon',
        },
        {
          title: 'Backup & Export',
          description: 'Data export and recovery',
          path: '/admin/backup',
          status: 'coming-soon',
        },
      ],
    },
    {
      title: 'Design Sandbox',
      items: [
        {
          title: 'Design Gallery',
          description: 'Theme previews, design tokens, and component library',
          path: '/admin/design-gallery',
          status: 'active',
        },
        {
          title: 'Component Testing',
          description: 'Consolidated UI component testing for all modules',
          path: '/admin/component-testing',
          status: 'active',
        },
        {
          title: 'Dashboard Prototypes',
          description: 'Dashboard design experiments and creative variations',
          path: '/admin/dashboard',
          status: 'active',
        },
        {
          title: 'Notifications Testing',
          description: 'Notification system testing and configuration',
          path: '/admin/notifications',
          status: 'active',
        },
      ],
    },
  ]

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            System administration and configuration
          </p>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.title} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Section Header (Clickable) */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                      expandedSection === section.title ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-gray-900 dark:text-white">{section.title}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {section.items.filter(i => i.status === 'active').length} / {section.items.length} active
                </span>
              </button>

              {/* Section Content (Expandable) */}
              {expandedSection === section.title && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  {section.items.map((item) => (
                    <a
                      key={item.path}
                      href={item.status === 'active' ? item.path : undefined}
                      className={`block px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400 ${
                        item.status === 'active'
                          ? 'hover:bg-white dark:hover:bg-gray-800 cursor-pointer'
                          : 'cursor-not-allowed opacity-60'
                      }`}
                      onClick={(e) => {
                        if (item.status !== 'active') {
                          e.preventDefault()
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {item.title}
                            </span>
                            {item.status === 'coming-soon' && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        {item.status === 'active' && (
                          <svg
                            className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>


        {/* Quick Links */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-3">
          <a href="/" className="hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus-visible:underline">Home</a>
          <span>•</span>
          <a href="/bridge" className="hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus-visible:underline">Bridge</a>
          <span>•</span>
          <a href="https://github.com/coopeverything/TogetherOS" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus-visible:underline">
            GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
