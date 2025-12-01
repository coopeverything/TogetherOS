/**
 * Bridge Teaching Sessions Admin Page
 * Interactive role-play training for teaching Bridge to handle different user archetypes
 *
 * Route: /admin/bridge-teaching
 * Auth: Admin only
 */

'use client'

import { useState, useEffect } from 'react'
import type {
  TeachingSession,
  UserArchetype,
  PatternSummary,
  TeachingStats,
  SessionStatus,
} from '@togetheros/types'

type TabView = 'sessions' | 'patterns' | 'archetypes'

export default function BridgeTeachingPage() {
  const [activeTab, setActiveTab] = useState<TabView>('sessions')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Data state
  const [sessions, setSessions] = useState<TeachingSession[]>([])
  const [patterns, setPatterns] = useState<PatternSummary[]>([])
  const [archetypes, setArchetypes] = useState<UserArchetype[]>([])
  const [stats, setStats] = useState<TeachingStats | null>(null)

  // Form state
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSessionTopic, setNewSessionTopic] = useState('')
  const [newSessionArchetype, setNewSessionArchetype] = useState('')

  // Expanded session
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError('')

    try {
      const [sessionsRes, patternsRes, archetypesRes, statsRes] = await Promise.all([
        fetch('/api/bridge-teaching/sessions'),
        fetch('/api/bridge-teaching/patterns'),
        fetch('/api/bridge-teaching/archetypes'),
        fetch('/api/bridge-teaching/statistics'),
      ])

      if (!sessionsRes.ok || !patternsRes.ok || !archetypesRes.ok || !statsRes.ok) {
        throw new Error('Failed to load data')
      }

      const [sessionsData, patternsData, archetypesData, statsData] = await Promise.all([
        sessionsRes.json(),
        patternsRes.json(),
        archetypesRes.json(),
        statsRes.json(),
      ])

      setSessions(sessionsData.sessions || [])
      setPatterns(patternsData.patterns || [])
      setArchetypes(archetypesData.archetypes || [])
      setStats(statsData.stats || null)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const createSession = async () => {
    if (!newSessionTopic.trim() || !newSessionArchetype) {
      alert('Please enter a topic and select an archetype')
      return
    }

    try {
      const res = await fetch('/api/bridge-teaching/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic: newSessionTopic.trim(),
          archetypeId: newSessionArchetype,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create session')
      }

      setNewSessionTopic('')
      setNewSessionArchetype('')
      setShowNewSession(false)
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Failed to create session')
    }
  }

  const updateSessionStatus = async (sessionId: string, status: SessionStatus) => {
    try {
      const res = await fetch(`/api/bridge-teaching/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        throw new Error('Failed to update session')
      }

      await loadData()
    } catch (err: any) {
      alert(err.message || 'Failed to update session')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'completed': return '#3b82f6'
      case 'archived': return '#6b7280'
      default: return '#f59e0b'
    }
  }

  const getTrustColor = (trust: string) => {
    switch (trust) {
      case 'high': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'low': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)' }}>
        <div style={{ color: 'var(--ink-700)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink-900)', marginBottom: '0.5rem' }}>
            Bridge Teaching Sessions
          </h1>
          <p style={{ color: 'var(--ink-700)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Train Bridge through interactive role-play conversations with different user archetypes
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--brand-600)' }}>{stats.totalSessions}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-700)', textTransform: 'uppercase' }}>Sessions</div>
            </div>
            <div style={{ background: 'var(--bg-1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#10b981' }}>{stats.completedSessions}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-700)', textTransform: 'uppercase' }}>Completed</div>
            </div>
            <div style={{ background: 'var(--bg-1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#3b82f6' }}>{stats.totalPatterns}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-700)', textTransform: 'uppercase' }}>Patterns</div>
            </div>
            <div style={{ background: 'var(--bg-1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#8b5cf6' }}>{stats.activePatterns}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-700)', textTransform: 'uppercase' }}>Active</div>
            </div>
            <div style={{ background: 'var(--bg-1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f59e0b' }}>
                {stats.avgPracticeSuccessRate ? `${Math.round(stats.avgPracticeSuccessRate)}%` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-700)', textTransform: 'uppercase' }}>Success Rate</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid var(--border)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {(['sessions', 'patterns', 'archetypes'] as TabView[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--brand-600)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--brand-600)' : 'var(--ink-700)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  marginBottom: '-2px',
                  textTransform: 'capitalize',
                }}
              >
                {tab} ({tab === 'sessions' ? sessions.length : tab === 'patterns' ? patterns.length : archetypes.length})
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
            {/* New Session Button */}
            <div style={{ marginBottom: '1rem' }}>
              {!showNewSession ? (
                <button
                  onClick={() => setShowNewSession(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--brand-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  + New Teaching Session
                </button>
              ) : (
                <div style={{ background: 'var(--bg-1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Start New Session</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={newSessionTopic}
                      onChange={(e) => setNewSessionTopic(e.target.value)}
                      placeholder="Topic (e.g., 'Explaining support points')"
                      style={{
                        flex: '1 1 200px',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                      }}
                    />
                    <select
                      value={newSessionArchetype}
                      onChange={(e) => setNewSessionArchetype(e.target.value)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        minWidth: '180px',
                      }}
                    >
                      <option value="">Select archetype...</option>
                      {archetypes.map((arch) => (
                        <option key={arch.id} value={arch.id}>{arch.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={createSession}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--brand-600)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowNewSession(false)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        color: 'var(--ink-700)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sessions List */}
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-700)' }}>
                No teaching sessions yet. Create one to get started!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sessions.map((session) => {
                  const isExpanded = expandedSessionId === session.id

                  return (
                    <div
                      key={session.id}
                      style={{
                        background: 'var(--bg-1)',
                        border: isExpanded ? '2px solid var(--brand-500)' : '1px solid var(--border)',
                        borderRadius: '0.5rem',
                      }}
                    >
                      {/* Session Summary */}
                      <div
                        onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: getStatusColor(session.status) + '20',
                            color: getStatusColor(session.status),
                            textTransform: 'capitalize',
                          }}
                        >
                          {session.status}
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', background: 'var(--bg-2)', color: 'var(--ink-700)' }}>
                          {session.archetype?.name || session.archetypeId}
                        </span>
                        <span style={{ flex: 1, fontSize: '0.9375rem', color: 'var(--ink-900)', fontWeight: 500 }}>
                          {session.topic}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-600)' }}>
                          {session.totalDemoTurns + session.totalPracticeTurns} turns
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--ink-700)' }}>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{ fontSize: '1rem', color: 'var(--ink-700)' }}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
                          {/* Session Info */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--ink-600)', marginBottom: '0.25rem' }}>Demo Turns</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink-900)' }}>{session.totalDemoTurns}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--ink-600)', marginBottom: '0.25rem' }}>Practice Turns</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink-900)' }}>{session.totalPracticeTurns}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--ink-600)', marginBottom: '0.25rem' }}>Success Rate</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: session.practiceSuccessRate && session.practiceSuccessRate >= 70 ? '#10b981' : 'var(--ink-900)' }}>
                                {session.practiceSuccessRate ? `${Math.round(session.practiceSuccessRate)}%` : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--ink-600)', marginBottom: '0.25rem' }}>Patterns</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink-900)' }}>{session.extractedPatterns?.length || 0}</div>
                            </div>
                          </div>

                          {/* Archetype Info */}
                          {session.archetype && (
                            <div style={{ background: 'var(--bg-2)', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                {session.archetype.name} - {session.archetype.description}
                              </div>
                              <div style={{ fontSize: '0.8125rem', color: 'var(--ink-700)', fontStyle: 'italic' }}>
                                "{session.archetype.mindset}"
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {session.status === 'active' && (
                              <button
                                onClick={() => updateSessionStatus(session.id, 'completed')}
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  fontSize: '0.8125rem',
                                  border: '1px solid #10b981',
                                  borderRadius: '0.25rem',
                                  background: '#10b98110',
                                  color: '#10b981',
                                  cursor: 'pointer',
                                }}
                              >
                                Mark Completed
                              </button>
                            )}
                            {session.status !== 'archived' && (
                              <button
                                onClick={() => updateSessionStatus(session.id, 'archived')}
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  fontSize: '0.8125rem',
                                  border: '1px solid var(--ink-500)',
                                  borderRadius: '0.25rem',
                                  background: 'transparent',
                                  color: 'var(--ink-600)',
                                  cursor: 'pointer',
                                }}
                              >
                                Archive
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div>
            {patterns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-700)' }}>
                No patterns extracted yet. Complete teaching sessions to extract patterns.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {patterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    style={{
                      background: 'var(--bg-1)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.25rem',
                          background: pattern.isActive ? '#10b98120' : '#6b728020',
                          color: pattern.isActive ? '#10b981' : '#6b7280',
                        }}
                      >
                        {pattern.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', background: 'var(--bg-2)', color: 'var(--ink-700)' }}>
                        {pattern.archetype}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-600)' }}>
                        Confidence: {Math.round(pattern.confidence * 100)}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-600)' }}>
                        Used: {pattern.usageCount}x
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9375rem', color: 'var(--ink-900)', fontWeight: 500 }}>
                      {pattern.principle}
                    </div>
                    {pattern.topic && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--ink-600)', marginTop: '0.25rem' }}>
                        Topic: {pattern.topic}
                      </div>
                    )}
                    {pattern.avgRating > 0 && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--ink-600)', marginTop: '0.25rem' }}>
                        Avg Rating: {pattern.avgRating.toFixed(1)}/5 | Helpful: {Math.round(pattern.helpfulRate)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Archetypes Tab */}
        {activeTab === 'archetypes' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {archetypes.map((archetype) => (
              <div
                key={archetype.id}
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink-900)' }}>
                    {archetype.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: getTrustColor(archetype.trustLevel) + '20',
                      color: getTrustColor(archetype.trustLevel),
                      textTransform: 'capitalize',
                    }}
                  >
                    {archetype.trustLevel} trust
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', marginBottom: '0.75rem' }}>
                  {archetype.description}
                </p>
                <div style={{ fontSize: '0.8125rem', color: 'var(--ink-600)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                  "{archetype.mindset}"
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.25rem' }}>
                    Needs:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {archetype.needs.map((need: string, i: number) => (
                      <span key={i} style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', background: '#10b98115', color: '#10b981', borderRadius: '0.25rem' }}>
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.25rem' }}>
                    Anti-patterns:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {archetype.antiPatterns.map((ap: string, i: number) => (
                      <span key={i} style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', background: '#ef444415', color: '#ef4444', borderRadius: '0.25rem' }}>
                        {ap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-2)', borderRadius: '0.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ink-900)', marginBottom: '0.75rem' }}>
            How Teaching Sessions Work
          </h3>
          <ul style={{ color: 'var(--ink-700)', fontSize: '0.8125rem', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
            <li><strong>Demo Mode:</strong> You demonstrate ideal responses while Bridge plays the archetype</li>
            <li><strong>Practice Mode:</strong> Bridge attempts responses while you play the archetype and provide feedback</li>
            <li><strong>Discussion Mode:</strong> Analyze what worked and extract response patterns</li>
            <li><strong>Patterns:</strong> Extracted guidelines that Bridge uses in real conversations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
