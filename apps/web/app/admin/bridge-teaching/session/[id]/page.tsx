/**
 * Bridge Teaching Session Conversation Page
 * Interactive role-play training interface
 *
 * Route: /admin/bridge-teaching/session/[id]
 * Auth: Admin only
 */

'use client'

import { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import type {
  TeachingSession,
  ConversationTurn,
  UserArchetype,
  ConversationMode,
  SessionIntent,
  Speaker,
  FeedbackRating,
} from '@togetheros/types'

const INTENT_LABELS: Record<SessionIntent, string> = {
  information: 'Information Lookup',
  brainstorm: 'Brainstorming',
  articulation: 'Articulation Help',
  roleplay: 'Role-play Training',
  general: 'General Session',
}

const INTENT_COLORS: Record<SessionIntent, string> = {
  information: '#3b82f6',
  brainstorm: '#8b5cf6',
  articulation: '#ec4899',
  roleplay: '#f59e0b',
  general: '#6b7280',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TeachingSessionPage({ params }: PageProps) {
  const { id } = use(params)

  const [session, setSession] = useState<TeachingSession | null>(null)
  const [archetypes, setArchetypes] = useState<UserArchetype[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Conversation state
  const [mode, setMode] = useState<ConversationMode>('demo')
  const [message, setMessage] = useState('')
  const [explanation, setExplanation] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Edit session state
  const [isEditing, setIsEditing] = useState(false)
  const [editTopic, setEditTopic] = useState('')
  const [editArchetypeId, setEditArchetypeId] = useState('')

  useEffect(() => {
    loadSession()
    loadArchetypes()
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [session?.turns])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSession = async () => {
    try {
      const res = await fetch(`/api/bridge-teaching/sessions/${id}`)
      if (!res.ok) throw new Error('Failed to load session')
      const data = await res.json()
      setSession(data.session)
      setEditTopic(data.session.topic)
      setEditArchetypeId(data.session.archetypeId || '')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadArchetypes = async () => {
    try {
      const res = await fetch('/api/bridge-teaching/archetypes')
      if (res.ok) {
        const data = await res.json()
        setArchetypes(data.archetypes || [])
      }
    } catch (err) {
      console.error('Failed to load archetypes:', err)
    }
  }

  const saveSessionEdit = async () => {
    if (!editTopic.trim()) {
      alert('Topic is required')
      return
    }

    try {
      const res = await fetch(`/api/bridge-teaching/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic: editTopic.trim(),
          archetypeId: editArchetypeId,
        }),
      })

      if (!res.ok) throw new Error('Failed to update session')

      const data = await res.json()
      setSession(data.session)
      setIsEditing(false)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || isSending || !session) return

    setIsSending(true)
    try {
      // Determine speaker based on mode
      // Demo: trainer demonstrates (as Bridge), so speaker is 'trainer'
      // Practice: trainer plays archetype, Bridge responds
      const speaker: Speaker = mode === 'practice' ? 'trainer' : 'trainer'
      const role = mode === 'demo'
        ? 'demonstrating ideal response'
        : mode === 'practice'
        ? `as ${session.archetype?.name || 'user'}`
        : 'discussing'

      const res = await fetch(`/api/bridge-teaching/sessions/${id}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode,
          speaker,
          message: message.trim(),
          role,
          explanation: explanation.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send message')
      }

      setMessage('')
      setExplanation('')
      await loadSession()

      // Auto-generate Bridge response in practice and demo modes
      if (mode === 'practice' || mode === 'demo') {
        await generateBridgeResponse(message.trim())
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSending(false)
    }
  }

  const generateBridgeResponse = async (trainerMessage: string) => {
    try {
      const res = await fetch(`/api/bridge-teaching/sessions/${id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode,
          trainerMessage,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('Bridge generation error:', data.error)
        // Don't show alert - just log the error, user can still continue manually
        return
      }

      await loadSession()
    } catch (err: any) {
      console.error('Bridge generation error:', err)
    }
  }

  const provideFeedback = async (turnId: string, rating: FeedbackRating, comment?: string) => {
    try {
      const res = await fetch(`/api/bridge-teaching/sessions/${id}/turns`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          turnId,
          rating,
          comment,
        }),
      })

      if (!res.ok) throw new Error('Failed to provide feedback')
      await loadSession()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const deleteTurn = async (turnId: string) => {
    if (!confirm('Delete this message?')) return

    try {
      const res = await fetch(`/api/bridge-teaching/sessions/${id}/turns?turnId=${turnId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to delete turn')
      await loadSession()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const updateStatus = async (status: 'active' | 'completed' | 'archived') => {
    try {
      const res = await fetch(`/api/bridge-teaching/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error('Failed to update status')
      await loadSession()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const getModeColor = (m: ConversationMode) => {
    switch (m) {
      case 'demo': return '#8b5cf6'
      case 'practice': return '#10b981'
      case 'discussion': return '#3b82f6'
    }
  }

  const getSpeakerStyle = (speaker: Speaker) => {
    return speaker === 'trainer'
      ? { bg: '#dbeafe', border: '#3b82f6', align: 'flex-end' as const }
      : { bg: '#f3e8ff', border: '#8b5cf6', align: 'flex-start' as const }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)' }}>
        <div style={{ color: 'var(--ink-700)' }}>Loading session...</div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)', gap: '1rem' }}>
        <div style={{ color: '#dc2626' }}>{error || 'Session not found'}</div>
        <Link href="/admin/bridge-teaching" style={{ color: 'var(--brand-600)' }}>
          Back to Teaching Sessions
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link
              href="/admin/bridge-teaching"
              style={{
                color: 'var(--ink-600)',
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              ← Back
            </Link>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '0.25rem',
              background: session.status === 'active' ? '#10b98120' : session.status === 'completed' ? '#3b82f620' : '#6b728020',
              color: session.status === 'active' ? '#10b981' : session.status === 'completed' ? '#3b82f6' : '#6b7280',
              textTransform: 'capitalize',
            }}>
              {session.status}
            </span>
            {session.status === 'active' && (
              <button
                onClick={() => updateStatus('completed')}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                Complete Session
              </button>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={editTopic}
                onChange={(e) => setEditTopic(e.target.value)}
                placeholder="Topic"
                className="teaching-input"
                style={{
                  flex: '1 1 200px',
                  padding: '0.375rem 0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                }}
              />
              {/* Only show archetype selector for roleplay sessions */}
              {session.intent === 'roleplay' && (
                <select
                  value={editArchetypeId}
                  onChange={(e) => setEditArchetypeId(e.target.value)}
                  className="teaching-input"
                  style={{
                    padding: '0.375rem 0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">No archetype</option>
                  {archetypes.map((arch) => (
                    <option key={arch.id} value={arch.id}>{arch.name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={saveSessionEdit}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: 'var(--brand-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditTopic(session.topic)
                  setEditArchetypeId(session.archetypeId || '')
                }}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: 'transparent',
                  color: 'var(--ink-600)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--ink-900)', margin: 0 }}>
                {session.topic}
              </h1>
              <span style={{
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                background: INTENT_COLORS[session.intent] + '20',
                borderRadius: '0.25rem',
                color: INTENT_COLORS[session.intent],
              }}>
                {INTENT_LABELS[session.intent]}
              </span>
              {session.archetype && (
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.5rem',
                  background: 'var(--bg-2)',
                  borderRadius: '0.25rem',
                  color: 'var(--ink-700)',
                }}>
                  {session.archetype.name}
                </span>
              )}
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem',
                  background: 'transparent',
                  color: 'var(--ink-600)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
            </div>
          )}

          {session.archetype && (
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--ink-600)',
              margin: '0.375rem 0 0 0',
              fontStyle: 'italic',
            }}>
              "{session.archetype.mindset}"
            </p>
          )}
        </div>
      </div>

      {/* Mode Selector */}
      <div style={{
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border)',
        padding: '0.5rem 1rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '0.5rem' }}>
          {(['demo', 'practice', 'discussion'] as ConversationMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: mode === m ? getModeColor(m) + '20' : 'transparent',
                color: mode === m ? getModeColor(m) : 'var(--ink-600)',
                border: `1px solid ${mode === m ? getModeColor(m) : 'var(--border)'}`,
                borderRadius: '0.375rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {m}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-600)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Demo: {session.totalDemoTurns}</span>
            <span>Practice: {session.totalPracticeTurns}</span>
            {session.practiceSuccessRate !== null && (
              <span style={{ color: session.practiceSuccessRate >= 70 ? '#10b981' : 'var(--ink-600)' }}>
                Success: {Math.round(session.practiceSuccessRate)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mode Instructions */}
      <div style={{
        background: getModeColor(mode) + '10',
        borderBottom: `1px solid ${getModeColor(mode)}30`,
        padding: '0.5rem 1rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', fontSize: '0.8125rem', color: getModeColor(mode) }}>
          {session.intent === 'roleplay' ? (
            // Role-play specific instructions
            <>
              {mode === 'demo' && (
                <>
                  <strong>Demo Mode:</strong> You demonstrate ideal Bridge responses. Write how Bridge should respond to the {session.archetype?.name || 'user'}.
                </>
              )}
              {mode === 'practice' && (
                <>
                  <strong>Practice Mode:</strong> You play the {session.archetype?.name || 'user'}. Bridge will attempt to respond. Provide feedback on each response.
                </>
              )}
              {mode === 'discussion' && (
                <>
                  <strong>Discussion Mode:</strong> Discuss the conversation freely. Analyze what worked, extract patterns, share insights.
                </>
              )}
            </>
          ) : (
            // Non-roleplay intents (information, brainstorm, articulation, general)
            <>
              {session.intent === 'information' && (
                <strong>Information Session:</strong>
              )}
              {session.intent === 'brainstorm' && (
                <strong>Brainstorming Session:</strong>
              )}
              {session.intent === 'articulation' && (
                <strong>Articulation Session:</strong>
              )}
              {session.intent === 'general' && (
                <strong>General Session:</strong>
              )}
              {' '}Have a natural conversation with Bridge. Share your thoughts, ask questions, and explore together.
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {session.turns.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--ink-600)',
              fontSize: '0.875rem',
            }}>
              No messages yet. Start the conversation in {mode} mode.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {session.turns.map((turn) => {
                const style = getSpeakerStyle(turn.speaker)
                return (
                  <div
                    key={turn.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: style.align,
                    }}
                  >
                    {/* Mode badge + role + delete */}
                    <div style={{
                      display: 'flex',
                      gap: '0.375rem',
                      alignItems: 'center',
                      marginBottom: '0.25rem',
                    }}>
                      <span style={{
                        fontSize: '0.6875rem',
                        padding: '0.0625rem 0.375rem',
                        borderRadius: '0.25rem',
                        background: getModeColor(turn.mode) + '20',
                        color: getModeColor(turn.mode),
                        textTransform: 'capitalize',
                      }}>
                        {turn.mode}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-600)' }}>
                        {turn.speaker === 'trainer' ? 'You' : 'Bridge'} {turn.role && `(${turn.role})`}
                      </span>
                      {session.status === 'active' && (
                        <button
                          onClick={() => deleteTurn(turn.id)}
                          style={{
                            fontSize: '0.6875rem',
                            padding: '0.0625rem 0.25rem',
                            background: 'transparent',
                            color: 'var(--ink-400)',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            opacity: 0.6,
                          }}
                          title="Delete message"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Message bubble */}
                    <div style={{
                      background: style.bg,
                      border: `1px solid ${style.border}30`,
                      borderRadius: '0.75rem',
                      padding: '0.625rem 0.875rem',
                      maxWidth: '85%',
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        lineHeight: 1.5,
                        color: 'var(--ink-900)',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {turn.message}
                      </p>

                      {turn.explanation && (
                        <p style={{
                          margin: '0.5rem 0 0 0',
                          fontSize: '0.8125rem',
                          color: 'var(--ink-600)',
                          fontStyle: 'italic',
                          borderTop: '1px solid var(--border)',
                          paddingTop: '0.5rem',
                        }}>
                          Explanation: {turn.explanation}
                        </p>
                      )}
                    </div>

                    {/* Feedback for Bridge turns */}
                    {turn.speaker === 'bridge' && turn.mode === 'practice' && (
                      <div style={{ marginTop: '0.375rem', display: 'flex', gap: '0.375rem' }}>
                        {turn.feedback ? (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: turn.feedback.rating === 'positive' ? '#10b98120'
                              : turn.feedback.rating === 'negative' ? '#ef444420' : '#6b728020',
                            color: turn.feedback.rating === 'positive' ? '#10b981'
                              : turn.feedback.rating === 'negative' ? '#ef4444' : '#6b7280',
                          }}>
                            {turn.feedback.rating === 'positive' ? 'Good' : turn.feedback.rating === 'negative' ? 'Needs work' : 'Okay'}
                            {turn.feedback.comment && `: ${turn.feedback.comment}`}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => provideFeedback(turn.id, 'positive')}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.125rem 0.375rem',
                                background: '#10b98120',
                                color: '#10b981',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                              }}
                            >
                              Good
                            </button>
                            <button
                              onClick={() => provideFeedback(turn.id, 'neutral')}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.125rem 0.375rem',
                                background: '#6b728020',
                                color: '#6b7280',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                              }}
                            >
                              Okay
                            </button>
                            <button
                              onClick={() => {
                                const comment = prompt('What needs improvement?')
                                if (comment !== null) {
                                  provideFeedback(turn.id, 'negative', comment)
                                }
                              }}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.125rem 0.375rem',
                                background: '#ef444420',
                                color: '#ef4444',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                              }}
                            >
                              Needs work
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      {session.status === 'active' && (
        <div style={{
          background: 'var(--bg-1)',
          borderTop: '1px solid var(--border)',
          padding: '0.75rem 1rem',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {mode === 'demo' && (
              <div style={{ marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explanation for this response (optional)"
                  className="teaching-input"
                  style={{
                    width: '100%',
                    padding: '0.375rem 0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder={
                  session.intent === 'roleplay' ? (
                    mode === 'demo'
                      ? `Demonstrate how Bridge should respond...`
                      : mode === 'practice'
                      ? `Play the ${session.archetype?.name || 'user'} role...`
                      : `Share thoughts or extract patterns...`
                  ) : session.intent === 'information' ? (
                    `Ask a question about CoopEverything...`
                  ) : session.intent === 'brainstorm' ? (
                    `Share your idea or thought to explore...`
                  ) : session.intent === 'articulation' ? (
                    `Try to express what you're thinking...`
                  ) : (
                    `Type your message...`
                  )
                }
                className="teaching-input"
                style={{
                  flex: 1,
                  padding: '0.625rem 0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  resize: 'none',
                  minHeight: '2.5rem',
                  maxHeight: '8rem',
                  fontFamily: 'inherit',
                }}
                rows={2}
              />
              <button
                onClick={sendMessage}
                disabled={isSending || !message.trim()}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: isSending || !message.trim() ? 'var(--ink-300)' : 'var(--brand-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: isSending || !message.trim() ? 'not-allowed' : 'pointer',
                  alignSelf: 'flex-end',
                }}
              >
                {isSending ? '...' : 'Send'}
              </button>
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--ink-500)',
              margin: '0.375rem 0 0 0',
              textAlign: 'center',
            }}>
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
