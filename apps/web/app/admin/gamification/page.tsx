'use client'

/**
 * Admin Gamification Page
 * Manage challenges, microlessons, and onboarding suggestions
 * Route: /admin/gamification
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeActionType,
  MicrolessonFormat,
} from '@togetheros/types'

type Tab = 'challenges' | 'microlessons' | 'onboarding'

interface Challenge {
  id: string
  name: string
  description: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  rpReward: number
  actionType: ChallengeActionType
  actionTarget: Record<string, unknown>
  isActive: boolean
  isFirstWeek: boolean
  dayNumber?: number
  icon?: string
  microlessonId?: string
}

interface Microlesson {
  id: string
  title: string
  description: string
  category: ChallengeCategory
  content: {
    format: MicrolessonFormat
    structured?: {
      introduction: string
      keyPoints: string[]
      example?: string
      reflection?: string
      nextSteps?: string
    }
    markdown?: string
    media?: Array<{ type: string; url: string; caption?: string }>
  }
  rpReward: number
  estimatedMinutes: number
  isActive: boolean
  sortOrder: number
}

interface OnboardingSuggestion {
  id: string
  challengeId: string
  microlessonId?: string
  suggestedOrder: number
  reason: string
  actionType: ChallengeActionType
  category: ChallengeCategory
  isActive: boolean
  challenge?: { id: string; name: string; description: string; rpReward: number }
  microlesson?: { id: string; title: string; rpReward: number }
}

const CATEGORIES: ChallengeCategory[] = ['social', 'contribution', 'exploration', 'growth']
const DIFFICULTIES: ChallengeDifficulty[] = ['easy', 'medium', 'hard']
const ACTION_TYPES: ChallengeActionType[] = [
  'post_message', 'post_comment', 'view_paths', 'add_skills', 'send_invitation',
  'proposal_interact', 'complete_journey', 'welcome_member', 'start_thread',
  'offer_help', 'share_resource', 'rate_proposal', 'update_profile', 'visit_group', 'join_group',
]

export default function GamificationAdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('challenges')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [microlessons, setMicrolessons] = useState<Microlesson[]>([])
  const [onboarding, setOnboarding] = useState<OnboardingSuggestion[]>([])
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [editingMicrolesson, setEditingMicrolesson] = useState<Microlesson | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.is_admin) {
          setIsAuthorized(true)
          loadData()
        } else {
          router.push('/login?redirect=/admin/gamification')
        }
      })
      .catch(() => {
        router.push('/login?redirect=/admin/gamification')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [router])

  const loadData = async () => {
    try {
      const [challengesRes, microlessonsRes, onboardingRes] = await Promise.all([
        fetch('/api/admin/gamification/challenges'),
        fetch('/api/admin/gamification/microlessons'),
        fetch('/api/admin/gamification/onboarding'),
      ])

      const [challengesData, microlessonsData, onboardingData] = await Promise.all([
        challengesRes.json(),
        microlessonsRes.json(),
        onboardingRes.json(),
      ])

      if (challengesData.success) setChallenges(challengesData.data)
      if (microlessonsData.success) setMicrolessons(microlessonsData.data)
      if (onboardingData.success) setOnboarding(onboardingData.data)
    } catch (err) {
      setError('Failed to load data')
    }
  }

  const saveChallenge = async (challenge: Partial<Challenge>) => {
    try {
      const isNew = !challenge.id
      const url = isNew
        ? '/api/admin/gamification/challenges'
        : `/api/admin/gamification/challenges/${challenge.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challenge),
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(isNew ? 'Challenge created' : 'Challenge updated')
        setEditingChallenge(null)
        loadData()
      } else {
        setError(data.error || 'Failed to save challenge')
      }
    } catch (err) {
      setError('Failed to save challenge')
    }
  }

  const deleteChallenge = async (id: string) => {
    if (!confirm('Delete this challenge?')) return
    try {
      const res = await fetch(`/api/admin/gamification/challenges/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSuccess('Challenge deleted')
        loadData()
      } else {
        setError(data.error || 'Failed to delete challenge')
      }
    } catch (err) {
      setError('Failed to delete challenge')
    }
  }

  const saveMicrolesson = async (microlesson: Partial<Microlesson>) => {
    try {
      const isNew = !microlesson.id
      const url = isNew
        ? '/api/admin/gamification/microlessons'
        : `/api/admin/gamification/microlessons/${microlesson.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(microlesson),
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(isNew ? 'Microlesson created' : 'Microlesson updated')
        setEditingMicrolesson(null)
        loadData()
      } else {
        setError(data.error || 'Failed to save microlesson')
      }
    } catch (err) {
      setError('Failed to save microlesson')
    }
  }

  const deleteMicrolesson = async (id: string) => {
    if (!confirm('Delete this microlesson?')) return
    try {
      const res = await fetch(`/api/admin/gamification/microlessons/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSuccess('Microlesson deleted')
        loadData()
      } else {
        setError(data.error || 'Failed to delete microlesson')
      }
    } catch (err) {
      setError('Failed to delete microlesson')
    }
  }

  const resetOnboarding = async () => {
    if (!confirm('Reset onboarding suggestions to defaults?')) return
    try {
      const res = await fetch('/api/admin/gamification/onboarding?action=reset', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSuccess('Onboarding suggestions reset')
        loadData()
      } else {
        setError(data.error || 'Failed to reset onboarding')
      }
    } catch (err) {
      setError('Failed to reset onboarding')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/admin" className="hover:text-gray-700">Admin</a>
            <span>/</span>
            <span>Gamification</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Gamification Content</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage challenges, microlessons, and onboarding flow
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
            <button onClick={() => setError(null)} className="float-right">×</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
            <button onClick={() => setSuccess(null)} className="float-right">×</button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 flex">
            {(['challenges', 'microlessons', 'onboarding'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab}
                <span className="ml-2 text-xs text-gray-400">
                  ({tab === 'challenges' ? challenges.length : tab === 'microlessons' ? microlessons.length : onboarding.length})
                </span>
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-gray-900">Challenge Definitions</h2>
                  <button
                    onClick={() => setEditingChallenge({} as Challenge)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    + New Challenge
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Difficulty</th>
                        <th className="px-3 py-2">RP</th>
                        <th className="px-3 py-2">First Week</th>
                        <th className="px-3 py-2">Active</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {challenges.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{c.description}</div>
                          </td>
                          <td className="px-3 py-2 capitalize">{c.category}</td>
                          <td className="px-3 py-2 capitalize">{c.difficulty}</td>
                          <td className="px-3 py-2">{c.rpReward}</td>
                          <td className="px-3 py-2">
                            {c.isFirstWeek ? <span className="text-green-600">Day {c.dayNumber}</span> : '-'}
                          </td>
                          <td className="px-3 py-2">
                            <span className={c.isActive ? 'text-green-600' : 'text-gray-400'}>
                              {c.isActive ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => setEditingChallenge(c)}
                              className="text-blue-600 hover:underline mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteChallenge(c.id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Microlessons Tab */}
            {activeTab === 'microlessons' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-gray-900">Microlessons</h2>
                  <button
                    onClick={() => setEditingMicrolesson({} as Microlesson)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    + New Microlesson
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-3 py-2">Title</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Format</th>
                        <th className="px-3 py-2">RP</th>
                        <th className="px-3 py-2">Duration</th>
                        <th className="px-3 py-2">Active</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {microlessons.map(m => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div className="font-medium">{m.title}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{m.description}</div>
                          </td>
                          <td className="px-3 py-2 capitalize">{m.category}</td>
                          <td className="px-3 py-2 capitalize">{m.content?.format || 'structured'}</td>
                          <td className="px-3 py-2">{m.rpReward}</td>
                          <td className="px-3 py-2">{m.estimatedMinutes} min</td>
                          <td className="px-3 py-2">
                            <span className={m.isActive ? 'text-green-600' : 'text-gray-400'}>
                              {m.isActive ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => setEditingMicrolesson(m)}
                              className="text-blue-600 hover:underline mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteMicrolesson(m.id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Onboarding Tab */}
            {activeTab === 'onboarding' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-gray-900">Onboarding Suggestions</h2>
                  <button
                    onClick={resetOnboarding}
                    className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Reset to Defaults
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  First 10 challenges suggested to new users. Completing the microlesson before the challenge awards a 10% RP bonus.
                </p>
                <div className="space-y-2">
                  {onboarding.map((o, idx) => (
                    <div
                      key={o.id}
                      className={`p-3 rounded border ${o.isActive ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-60'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{o.challenge?.name || 'Unknown Challenge'}</div>
                          <div className="text-sm text-gray-600 mt-0.5">{o.reason}</div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="capitalize">Category: {o.category}</span>
                            <span>Challenge RP: {o.challenge?.rpReward || 0}</span>
                            {o.microlesson && (
                              <span className="text-green-600">
                                + Microlesson: {o.microlesson.title} ({o.microlesson.rpReward} RP)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Edit Modal */}
        {editingChallenge && (
          <ChallengeModal
            challenge={editingChallenge}
            microlessons={microlessons}
            onSave={saveChallenge}
            onClose={() => setEditingChallenge(null)}
          />
        )}

        {/* Microlesson Edit Modal */}
        {editingMicrolesson && (
          <MicrolessonModal
            microlesson={editingMicrolesson}
            onSave={saveMicrolesson}
            onClose={() => setEditingMicrolesson(null)}
          />
        )}
      </div>
    </div>
  )
}

function ChallengeModal({
  challenge,
  microlessons,
  onSave,
  onClose,
}: {
  challenge: Challenge
  microlessons: Microlesson[]
  onSave: (c: Partial<Challenge>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: challenge.name || '',
    description: challenge.description || '',
    category: challenge.category || 'social',
    difficulty: challenge.difficulty || 'easy',
    rpReward: challenge.rpReward || 25,
    actionType: challenge.actionType || 'post_message',
    actionTarget: JSON.stringify(challenge.actionTarget || {}, null, 2),
    isActive: challenge.isActive ?? true,
    isFirstWeek: challenge.isFirstWeek ?? false,
    dayNumber: challenge.dayNumber || '',
    icon: challenge.icon || '',
    microlessonId: challenge.microlessonId || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: challenge.id,
      ...form,
      rpReward: Number(form.rpReward),
      actionTarget: JSON.parse(form.actionTarget || '{}'),
      dayNumber: form.dayNumber ? Number(form.dayNumber) : undefined,
      microlessonId: form.microlessonId || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {challenge.id ? 'Edit Challenge' : 'New Challenge'}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={2}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as ChallengeCategory })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm({ ...form, difficulty: e.target.value as ChallengeDifficulty })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RP Reward</label>
                <input
                  type="number"
                  value={form.rpReward}
                  onChange={e => setForm({ ...form, rpReward: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <select
                  value={form.actionType}
                  onChange={e => setForm({ ...form, actionType: e.target.value as ChallengeActionType })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {ACTION_TYPES.map(a => (
                    <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Target (JSON)</label>
              <textarea
                value={form.actionTarget}
                onChange={e => setForm({ ...form, actionTarget: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="e.g. wave, star, trophy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Linked Microlesson</label>
                <select
                  value={form.microlessonId}
                  onChange={e => setForm({ ...form, microlessonId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {microlessons.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFirstWeek}
                  onChange={e => setForm({ ...form, isFirstWeek: e.target.checked })}
                />
                <span className="text-sm text-gray-700">First Week Challenge</span>
              </label>
            </div>
            {form.isFirstWeek && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day Number (1-7)</label>
                <input
                  type="number"
                  value={form.dayNumber}
                  onChange={e => setForm({ ...form, dayNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={1}
                  max={7}
                />
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MicrolessonModal({
  microlesson,
  onSave,
  onClose,
}: {
  microlesson: Microlesson
  onSave: (m: Partial<Microlesson>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    title: microlesson.title || '',
    description: microlesson.description || '',
    category: microlesson.category || 'social',
    format: microlesson.content?.format || 'structured',
    content: JSON.stringify(microlesson.content || { format: 'structured', structured: { introduction: '', keyPoints: [] } }, null, 2),
    rpReward: microlesson.rpReward || 15,
    estimatedMinutes: microlesson.estimatedMinutes || 5,
    isActive: microlesson.isActive ?? true,
    sortOrder: microlesson.sortOrder || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: microlesson.id,
      title: form.title,
      description: form.description,
      category: form.category as ChallengeCategory,
      content: JSON.parse(form.content),
      rpReward: Number(form.rpReward),
      estimatedMinutes: Number(form.estimatedMinutes),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {microlesson.id ? 'Edit Microlesson' : 'New Microlesson'}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={2}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as ChallengeCategory })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={form.format}
                  onChange={e => setForm({ ...form, format: e.target.value as MicrolessonFormat })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="structured">Structured (5-part)</option>
                  <option value="markdown">Markdown</option>
                  <option value="media">Media (video/images)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (JSON)</label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                rows={8}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RP Reward</label>
                <input
                  type="number"
                  value={form.rpReward}
                  onChange={e => setForm({ ...form, rpReward: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={form.estimatedMinutes}
                  onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={0}
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
