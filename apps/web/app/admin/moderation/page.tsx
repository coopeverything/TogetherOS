'use client'

/**
 * Moderation Reports - Content moderation and safety
 * Route: /admin/moderation
 * Auth: Admin only
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ModerationReports() {
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
          router.push('/login?redirect=/admin/moderation')
        }
      })
      .catch(() => {
        router.push('/login?redirect=/admin/moderation')
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-0)',
      padding: '2rem 1rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <a
              href="/admin"
              style={{
                fontSize: '0.875rem',
                color: 'var(--brand-500)',
                textDecoration: 'none',
              }}
            >
              ← Back to Admin
            </a>
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--ink-900)',
            marginBottom: '0.5rem',
          }}>
            Moderation Reports
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--ink-700)',
          }}>
            Flagged content, user reports, and moderation queue
          </p>
        </div>

        {/* Placeholder Content */}
        <div style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          padding: '2rem',
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--ink-900)',
            marginBottom: '1rem',
          }}>
            Coming Soon
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--ink-700)',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}>
            This page will provide comprehensive content moderation tools:
          </p>

          <ul style={{
            fontSize: '0.875rem',
            color: 'var(--ink-700)',
            lineHeight: 1.8,
            paddingLeft: '1.5rem',
          }}>
            <li>View flagged content and user reports</li>
            <li>Moderation queue (pending, resolved, escalated)</li>
            <li>Moderation history and audit trail</li>
            <li>Ban/suspend user capabilities</li>
            <li>Content takedown and restoration</li>
            <li>Automated filter management</li>
            <li>Moderation analytics and trends</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
