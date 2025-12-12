'use client'

/**
 * Bridge Content Trust Configuration
 * Route: /admin/bridge-trust
 * Auth: Admin only
 *
 * Configure trust tier thresholds for Bridge content weighting.
 * Allows admins to tune how community validation (votes, SP, replies)
 * affects Bridge's confidence in content.
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { TrustThresholds, TrustTier } from '@togetheros/types'

interface IndexStats {
  totalIndexed: number
  byType: Record<string, number>
  byTrust: Record<string, number>
  avgSP: number
  lastIndexed: string | null
}

const DEFAULT_THRESHOLDS: TrustThresholds = {
  newContentHours: 24,
  low: { minVotes: 1, minReplies: 1 },
  medium: { minVotes: 3, minReplies: 3, minSP: 5 },
  high: { minVotes: 10, minReplies: 5, minSP: 20 },
  consensus: { minVotes: 20, minParticipants: 10, minSP: 50 },
}

const TRUST_TIER_COLORS: Record<TrustTier, string> = {
  unvalidated: 'bg-gray-500',
  low: 'bg-yellow-500',
  medium: 'bg-blue-500',
  high: 'bg-green-500',
  consensus: 'bg-purple-500',
}

const TRUST_TIER_DESCRIPTIONS: Record<TrustTier, string> = {
  unvalidated: 'New content with no community feedback. Bridge treats as opinion.',
  low: 'Some engagement but limited validation. Bridge is cautious.',
  medium: 'Positive engagement from multiple members. Bridge shows moderate confidence.',
  high: 'Strong community support. Bridge speaks with confidence.',
  consensus: 'Overwhelming agreement from many participants. Bridge treats as fact.',
}

export default function BridgeTrustPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [thresholds, setThresholds] = useState<TrustThresholds>(DEFAULT_THRESHOLDS)
  const [stats, setStats] = useState<IndexStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const user = await res.json()
          if (user.is_admin) {
            setIsAdmin(true)
            // Load current thresholds and stats
            await Promise.all([loadThresholds(), loadStats()])
          } else {
            router.push('/')
          }
        } else {
          router.push('/login')
        }
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [router])

  const loadThresholds = async () => {
    try {
      const res = await fetch('/api/admin/bridge-trust/thresholds')
      if (res.ok) {
        const data = await res.json()
        setThresholds(data)
      }
    } catch (err) {
      console.error('Failed to load thresholds:', err)
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/bridge-trust/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/bridge-trust/thresholds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thresholds),
      })

      if (res.ok) {
        setSuccess('Thresholds saved successfully!')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save thresholds')
      }
    } catch (err) {
      setError('Network error - please try again')
    } finally {
      setSaving(false)
    }
  }, [thresholds])

  const handleReset = useCallback(() => {
    setThresholds(DEFAULT_THRESHOLDS)
    setSuccess('Reset to defaults - remember to save!')
    setTimeout(() => setSuccess(null), 3000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-1 flex items-center justify-center">
        <div className="text-ink-400">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-1">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900">Bridge Content Trust</h1>
          <p className="text-ink-400 mt-2">
            Configure how Bridge weights community validation when referencing site content.
            Higher thresholds = more rigorous validation required for confident language.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Thresholds */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <div className="bg-bg-2 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">General Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    New Content Window (hours)
                  </label>
                  <p className="text-xs text-ink-400 mb-2">
                    Content younger than this is considered "new" and starts as unvalidated
                  </p>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={thresholds.newContentHours}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, newContentHours: parseInt(e.target.value) || 24 })
                    }
                    className="w-24 px-3 py-2 bg-bg-1 border border-border rounded text-ink-900"
                  />
                </div>
              </div>
            </div>

            {/* Tier Thresholds */}
            {(['low', 'medium', 'high', 'consensus'] as const).map((tier) => (
              <div key={tier} className="bg-bg-2 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${TRUST_TIER_COLORS[tier]}`} />
                  <h2 className="text-lg font-semibold text-ink-900 capitalize">{tier} Trust</h2>
                </div>
                <p className="text-sm text-ink-400 mb-4">{TRUST_TIER_DESCRIPTIONS[tier]}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">
                      Min Votes
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={thresholds[tier].minVotes}
                      onChange={(e) =>
                        setThresholds({
                          ...thresholds,
                          [tier]: { ...thresholds[tier], minVotes: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-3 py-2 bg-bg-1 border border-border rounded text-ink-900"
                    />
                  </div>

                  {'minReplies' in thresholds[tier] && (
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1">
                        Min Replies
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={(thresholds[tier] as { minReplies: number }).minReplies}
                        onChange={(e) =>
                          setThresholds({
                            ...thresholds,
                            [tier]: { ...thresholds[tier], minReplies: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 bg-bg-1 border border-border rounded text-ink-900"
                      />
                    </div>
                  )}

                  {'minSP' in thresholds[tier] && (
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1">
                        Min Support Points
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={(thresholds[tier] as { minSP: number }).minSP}
                        onChange={(e) =>
                          setThresholds({
                            ...thresholds,
                            [tier]: { ...thresholds[tier], minSP: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 bg-bg-1 border border-border rounded text-ink-900"
                      />
                    </div>
                  )}

                  {'minParticipants' in thresholds[tier] && (
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1">
                        Min Participants
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={(thresholds[tier] as { minParticipants: number }).minParticipants}
                        onChange={(e) =>
                          setThresholds({
                            ...thresholds,
                            [tier]: {
                              ...thresholds[tier],
                              minParticipants: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-bg-1 border border-border rounded text-ink-900"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-bg-2 text-ink-700 rounded-lg hover:bg-bg-1 border border-border"
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Right column: Stats */}
          <div className="space-y-6">
            {/* Index Stats */}
            <div className="bg-bg-2 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Index Statistics</h2>
              {stats ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-ink-900">{stats.totalIndexed}</div>
                    <div className="text-sm text-ink-400">Total indexed items</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-ink-700 mb-2">By Content Type</div>
                    <div className="space-y-1">
                      {Object.entries(stats.byType).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-ink-400">{type.replace('_', ' ')}</span>
                          <span className="text-ink-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-ink-700 mb-2">By Trust Tier</div>
                    <div className="space-y-1">
                      {Object.entries(stats.byTrust).map(([tier, count]) => (
                        <div key={tier} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${TRUST_TIER_COLORS[tier as TrustTier]}`}
                            />
                            <span className="text-ink-400 capitalize">{tier}</span>
                          </div>
                          <span className="text-ink-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-ink-700 mb-1">Average SP</div>
                    <div className="text-lg text-ink-900">{stats.avgSP.toFixed(1)}</div>
                  </div>

                  {stats.lastIndexed && (
                    <div className="text-xs text-ink-400">
                      Last indexed: {new Date(stats.lastIndexed).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-ink-400 text-sm">No index data yet</div>
              )}
            </div>

            {/* Trust Tier Legend */}
            <div className="bg-bg-2 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">How Bridge Uses Trust</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${TRUST_TIER_COLORS.unvalidated}`} />
                  <div>
                    <div className="font-medium text-ink-700">Unvalidated</div>
                    <div className="text-ink-400">"One member suggested..."</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${TRUST_TIER_COLORS.low}`} />
                  <div>
                    <div className="font-medium text-ink-700">Low</div>
                    <div className="text-ink-400">"Some members think..."</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${TRUST_TIER_COLORS.medium}`} />
                  <div>
                    <div className="font-medium text-ink-700">Medium</div>
                    <div className="text-ink-400">"Several members support..."</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${TRUST_TIER_COLORS.high}`} />
                  <div>
                    <div className="font-medium text-ink-700">High</div>
                    <div className="text-ink-400">"Strong community support for..."</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${TRUST_TIER_COLORS.consensus}`} />
                  <div>
                    <div className="font-medium text-ink-700">Consensus</div>
                    <div className="text-ink-400">"The community agrees..."</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SP Weighting Note */}
            <div className="bg-joy-500/10 border border-joy-500/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-joy-600 mb-2">
                Support Points Matter Most
              </h3>
              <p className="text-xs text-ink-400">
                SP allocations are weighted 2x in trust calculations because members are putting
                their limited SP "where their mouth is". Content with significant SP backing
                gets prioritized even with fewer votes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
