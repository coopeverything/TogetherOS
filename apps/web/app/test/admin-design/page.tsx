'use client'

import { useState } from 'react'

export default function AdminDesignTest() {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const mockIssues = [
    {
      id: '1',
      title: 'User authentication fails after password reset',
      type: 'bug',
      status: 'open',
      priority: 'critical',
      module: 'bridge',
      reporter: 'alice@example.com',
      created: '2 hours ago',
      comments: 3,
      assigned: null
    },
    {
      id: '2',
      title: 'Add delegate voting feature',
      type: 'feature',
      status: 'triaged',
      priority: 'high',
      module: 'governance',
      reporter: 'bob@example.com',
      created: '1 day ago',
      comments: 7,
      assigned: 'Core Team'
    },
    {
      id: '3',
      title: 'Improve feed loading performance',
      type: 'enhancement',
      status: 'in_progress',
      priority: 'medium',
      module: 'feed',
      reporter: 'carol@example.com',
      created: '3 days ago',
      comments: 2,
      assigned: 'You'
    },
    {
      id: '4',
      title: 'Profile avatar upload not working',
      type: 'bug',
      status: 'resolved',
      priority: 'high',
      module: 'profiles',
      reporter: 'dave@example.com',
      created: '5 days ago',
      comments: 5,
      assigned: 'You'
    }
  ]

  const stats = {
    total: 142,
    open: 38,
    inProgress: 12,
    resolved: 87,
    bugs: 89,
    features: 48,
    critical: 5,
    unassigned: 23
  }

  const filteredIssues = mockIssues.filter(issue => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false
    if (typeFilter !== 'all' && issue.type !== typeFilter) return false
    return true
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'bug': return '🐛'
      case 'feature': return '✨'
      case 'enhancement': return '⚡'
      default: return '📝'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#f59e0b'
      case 'triaged': return '#3b82f6'
      case 'in_progress': return '#8b5cf6'
      case 'resolved': return '#10b981'
      case 'closed': return '#6b7280'
      default: return '#6b7280'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-0)',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--ink-900)',
            marginBottom: '0.5rem'
          }}>
            Issues & Features
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--ink-700)'
          }}>
            Compact admin view • Utilitarian design with relaxed vibe
          </p>
        </div>

        {/* Compact Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--ink-700)' },
            { label: 'Open', value: stats.open, color: '#f59e0b' },
            { label: 'Progress', value: stats.inProgress, color: '#3b82f6' },
            { label: 'Resolved', value: stats.resolved, color: '#10b981' },
            { label: 'Bugs', value: stats.bugs, color: '#ef4444' },
            { label: 'Features', value: stats.features, color: '#8b5cf6' },
            { label: 'Critical', value: stats.critical, color: '#dc2626' },
            { label: 'Unassigned', value: stats.unassigned, color: '#6b7280' }
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: stat.color,
                marginBottom: '0.25rem'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--ink-700)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Compact Filter Bar */}
        <div style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          marginBottom: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--ink-700)' }}>
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.875rem',
              border: '1px solid var(--border)',
              borderRadius: '0.25rem',
              background: 'var(--bg-2)',
              color: 'var(--ink-900)'
            }}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="triaged">Triaged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <label style={{ fontSize: '0.875rem', color: 'var(--ink-700)', marginLeft: '1rem' }}>
            Type:
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.875rem',
              border: '1px solid var(--border)',
              borderRadius: '0.25rem',
              background: 'var(--bg-2)',
              color: 'var(--ink-900)'
            }}
          >
            <option value="all">All</option>
            <option value="bug">Bugs</option>
            <option value="feature">Features</option>
            <option value="enhancement">Enhancements</option>
          </select>

          <input
            type="text"
            placeholder="Search..."
            style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.5rem',
              fontSize: '0.875rem',
              border: '1px solid var(--border)',
              borderRadius: '0.25rem',
              background: 'var(--bg-2)',
              color: 'var(--ink-900)',
              width: '200px'
            }}
          />

          <button style={{
            padding: '0.25rem 0.75rem',
            fontSize: '0.875rem',
            border: '1px solid var(--border)',
            borderRadius: '0.25rem',
            background: 'var(--bg-2)',
            color: 'var(--ink-900)',
            cursor: 'pointer'
          }}>
            Export ↓
          </button>
        </div>

        {/* Compact Issues List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredIssues.map(issue => (
            <div
              key={issue.id}
              style={{
                background: 'var(--bg-1)',
                border: selectedIssue === issue.id ? '2px solid var(--brand-500)' : '1px solid var(--border)',
                borderRadius: '0.5rem',
                padding: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>

                {/* Priority indicator */}
                <div style={{
                  width: '3px',
                  height: '100%',
                  background: getPriorityColor(issue.priority),
                  borderRadius: '2px',
                  alignSelf: 'stretch'
                }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Meta badges */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ fontSize: '0.875rem' }}>
                      {getTypeEmoji(issue.type)}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: 'var(--bg-2)',
                      color: 'var(--ink-700)',
                      textTransform: 'capitalize'
                    }}>
                      {issue.type}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: getStatusColor(issue.status) + '20',
                      color: getStatusColor(issue.status),
                      textTransform: 'capitalize'
                    }}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--ink-700)'
                    }}>
                      {issue.module}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    color: 'var(--ink-900)',
                    marginBottom: '0.5rem'
                  }}>
                    {issue.title}
                  </div>

                  {/* Meta info */}
                  <div style={{
                    fontSize: '0.8125rem',
                    color: 'var(--ink-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  }}>
                    <span>{issue.reporter}</span>
                    <span>•</span>
                    <span>{issue.created}</span>
                    {issue.assigned && (
                      <>
                        <span>•</span>
                        <span>Assigned: {issue.assigned}</span>
                      </>
                    )}
                    {issue.comments > 0 && (
                      <>
                        <span>•</span>
                        <span>💬 {issue.comments}</span>
                      </>
                    )}
                  </div>

                  {/* Expanded actions */}
                  {selectedIssue === issue.id && (
                    <div style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <button style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.8125rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.25rem',
                        background: 'var(--bg-2)',
                        color: 'var(--ink-900)',
                        cursor: 'pointer'
                      }}>
                        Assign to me
                      </button>
                      <select style={{
                        padding: '0.375rem 0.5rem',
                        fontSize: '0.8125rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.25rem',
                        background: 'var(--bg-2)',
                        color: 'var(--ink-900)',
                        cursor: 'pointer'
                      }}>
                        <option>Change status...</option>
                        <option>Open</option>
                        <option>Triaged</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                      </select>
                      <button style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.8125rem',
                        border: '1px solid #ef4444',
                        borderRadius: '0.25rem',
                        background: '#ef444410',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}>
                        Delete
                      </button>
                      <button style={{
                        marginLeft: 'auto',
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.8125rem',
                        border: '1px solid var(--brand-500)',
                        borderRadius: '0.25rem',
                        background: 'var(--brand-500)',
                        color: 'white',
                        cursor: 'pointer'
                      }}>
                        View Details →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Design Notes */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--ink-900)',
            marginBottom: '1rem'
          }}>
            Design Principles
          </h2>
          <ul style={{
            fontSize: '0.875rem',
            color: 'var(--ink-700)',
            lineHeight: '1.6',
            paddingLeft: '1.5rem'
          }}>
            <li>✅ <strong>Compact</strong> – Reduced padding, smaller font sizes (0.75-0.9375rem)</li>
            <li>✅ <strong>Dense stats</strong> – 8 stat cards in compact grid (vs 4 large cards)</li>
            <li>✅ <strong>Inline filters</strong> – Single row, minimal height (vs multi-row sections)</li>
            <li>✅ <strong>Streamlined cards</strong> – Vertical priority bar, collapsed actions until clicked</li>
            <li>✅ <strong>Relaxed vibe maintained</strong> – Rounded corners, soft borders, calm colors</li>
            <li>✅ <strong>Focused windows</strong> – Content constrained to 1200px max-width</li>
            <li>✅ <strong>Information hierarchy</strong> – Emoji + badges + meta in organized layers</li>
            <li>✅ <strong>Expandable actions</strong> – Click card to reveal action buttons (less clutter)</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
