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
  const [expandedSection, setExpandedSection] = useState<string | null>('system')
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-sm">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const sections: AdminSection[] = [
    {
      title: 'System Configuration',
      items: [
        {
          title: 'System Settings',
          description: 'Configure SP/RP weights, conversion rates, and constraints',
          path: '/admin/settings',
          status: 'active',
        },
      ],
    },
    {
      title: 'AI & Content',
      items: [
        {
          title: 'Bridge Training',
          description: 'Manage Bridge AI training data and Q&A examples',
          path: '/admin/bridge',
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
      title: 'Users & Groups',
      items: [
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
      title: 'Governance & Economy',
      items: [
        {
          title: 'Governance Oversight',
          description: 'Proposal monitoring and decision logs',
          path: '/admin/governance',
          status: 'coming-soon',
        },
        {
          title: 'Social Economy',
          description: 'Support Points, timebanking, and treasury',
          path: '/admin/economy',
          status: 'coming-soon',
        },
      ],
    },
    {
      title: 'Monitoring & Data',
      items: [
        {
          title: 'System Logs',
          description: 'Audit trails and security events',
          path: '/admin/logs',
          status: 'coming-soon',
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
  ]

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            System administration and configuration
          </p>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Section Header (Clickable) */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      expandedSection === section.title ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-gray-900">{section.title}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {section.items.filter(i => i.status === 'active').length} / {section.items.length} active
                </span>
              </button>

              {/* Section Content (Expandable) */}
              {expandedSection === section.title && (
                <div className="border-t border-gray-200 bg-gray-50">
                  {section.items.map((item) => (
                    <a
                      key={item.path}
                      href={item.status === 'active' ? item.path : undefined}
                      className={`block px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                        item.status === 'active'
                          ? 'hover:bg-white cursor-pointer'
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
                            <span className="font-medium text-gray-900 text-sm">
                              {item.title}
                            </span>
                            {item.status === 'coming-soon' && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        {item.status === 'active' && (
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
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

        {/* Test Pages (Minimal) */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Development Tools</h2>
          <div className="space-y-2">
            <a
              href="/test/admin-design"
              className="block px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Admin Design Demo</div>
                  <div className="text-xs text-gray-600">UI patterns and components</div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 text-xs text-gray-500 flex items-center gap-3">
          <a href="/" className="hover:text-gray-700">Home</a>
          <span>•</span>
          <a href="/bridge" className="hover:text-gray-700">Bridge</a>
          <span>•</span>
          <a href="https://github.com/coopeverything/TogetherOS" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
            GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
