'use client'

/**
 * Admin Dashboard - Central hub for all admin and test pages
 * Route: /admin
 * Auth: Admin only
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check admin authorization
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-0)',
      }}>
        <div style={{ color: 'var(--ink-700)', fontSize: '0.875rem' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const adminPages = [
    {
      title: 'Training Data Viewer',
      description: 'View, filter, approve/reject Bridge training examples',
      path: '/admin/bridge/training-data',
      category: 'Bridge Training',
      stats: 'Manage training data',
    },
    {
      title: 'Single Q&A Training',
      description: 'Ask Bridge questions and provide ideal responses',
      path: '/admin/bridge/train',
      category: 'Bridge Training',
      stats: 'One-shot training',
    },
    {
      title: 'Conversation Training',
      description: 'Multi-turn dialogue training with context',
      path: '/admin/bridge/train-conversation',
      category: 'Bridge Training',
      stats: 'Multi-turn training',
    },
  ]

  const testPages = [
    {
      title: 'Admin Design Demo',
      description: 'Compact, utilitarian admin UI patterns',
      path: '/test/admin-design',
      category: 'Design System',
    },
    {
      title: 'Bridge Interface',
      description: 'AI assistant Q&A interface testing',
      path: '/test/bridge',
      category: 'Bridge',
    },
    {
      title: 'Profile Components',
      description: 'User profile and avatar components',
      path: '/test/profiles',
      category: 'Profiles',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-0)',
      padding: '2rem 1rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--ink-900)',
            marginBottom: '0.5rem',
          }}>
            Admin Dashboard
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--ink-700)',
          }}>
            Central hub for administration and testing
          </p>
        </div>

        {/* Admin Tools Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--ink-900)',
            marginBottom: '1rem',
          }}>
            Admin Tools
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}>
            {adminPages.map(page => (
              <a
                key={page.path}
                href={page.path}
                style={{
                  display: 'block',
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-500)'
                  e.currentTarget.style.background = 'var(--bg-2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--bg-1)'
                }}
              >
                <div style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--brand-500)',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}>
                  {page.category}
                </div>

                <div style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--ink-900)',
                  marginBottom: '0.5rem',
                }}>
                  {page.title}
                </div>

                <div style={{
                  fontSize: '0.8125rem',
                  color: 'var(--ink-700)',
                  lineHeight: 1.5,
                  marginBottom: '0.75rem',
                }}>
                  {page.description}
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--ink-700)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span>{page.stats}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--brand-500)' }}>
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Test Pages Section */}
        <section>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--ink-900)',
            marginBottom: '1rem',
          }}>
            Test Pages
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}>
            {testPages.map(page => (
              <a
                key={page.path}
                href={page.path}
                style={{
                  display: 'block',
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--joy-500)'
                  e.currentTarget.style.background = 'var(--bg-2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--bg-1)'
                }}
              >
                <div style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--joy-500)',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}>
                  {page.category}
                </div>

                <div style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--ink-900)',
                  marginBottom: '0.5rem',
                }}>
                  {page.title}
                </div>

                <div style={{
                  fontSize: '0.8125rem',
                  color: 'var(--ink-700)',
                  lineHeight: 1.5,
                }}>
                  {page.description}
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--joy-500)',
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}>
                  →
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <div style={{
          marginTop: '3rem',
          padding: '1rem',
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
        }}>
          <div style={{
            fontSize: '0.8125rem',
            color: 'var(--ink-700)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600 }}>Quick Links:</span>
            <a
              href="/"
              style={{
                color: 'var(--brand-500)',
                textDecoration: 'none',
              }}
            >
              Home
            </a>
            <span>•</span>
            <a
              href="/bridge"
              style={{
                color: 'var(--brand-500)',
                textDecoration: 'none',
              }}
            >
              Bridge
            </a>
            <span>•</span>
            <a
              href="https://github.com/coopeverything/TogetherOS"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--brand-500)',
                textDecoration: 'none',
              }}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
