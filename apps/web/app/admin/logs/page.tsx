'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SystemLogsAudit() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.is_admin) setIsAuthorized(true)
        else router.push('/login?redirect=/admin/logs')
      })
      .catch(() => router.push('/login?redirect=/admin/logs'))
      .finally(() => setIsLoading(false))
  }, [router])

  if (isLoading || !isAuthorized) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <a href="/admin" style={{ fontSize: '0.875rem', color: 'var(--brand-500)', textDecoration: 'none' }}>← Back</a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.5rem' }}>System Logs & Audit</h1>
        </div>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '2rem' }}>
          <h2>Coming Soon</h2>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
            <li>Security event logs</li>
            <li>NDJSON log viewer</li>
            <li>System health monitoring</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
