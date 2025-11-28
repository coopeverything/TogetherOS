'use client'

/**
 * Unified Onboarding Admin Page
 * Consolidates all onboarding-related content management
 * Route: /admin/onboarding
 *
 * Tabs:
 * - Challenges: Daily and first-week challenges
 * - Microlessons: Short learning content
 * - Learning Paths: Structured learning journeys
 * - Lessons: Individual lessons within paths
 * - Quizzes: Assessment quizzes
 * - Suggestions: Onboarding flow suggestions
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeActionType,
  MicrolessonFormat,
  LearningPath,
  Lesson,
  Quiz,
  LearningPathCategory,
  LessonContentType,
} from '@togetheros/types'

type Tab = 'challenges' | 'microlessons' | 'paths' | 'lessons' | 'quizzes' | 'suggestions'

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
const PATH_CATEGORIES: LearningPathCategory[] = [
  'getting-started', 'governance', 'economy', 'community', 'technology', 'culture',
]
const CONTENT_TYPES: LessonContentType[] = ['markdown', 'structured', 'video']

export default function OnboardingAdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('challenges')

  // Gamification data
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [microlessons, setMicrolessons] = useState<Microlesson[]>([])
  const [suggestions, setSuggestions] = useState<OnboardingSuggestion[]>([])

  // Learning data
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  // Edit states
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [editingMicrolesson, setEditingMicrolesson] = useState<Microlesson | null>(null)
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.is_admin) {
          setIsAuthorized(true)
          loadAllData()
        } else {
          router.push('/login?redirect=/admin/onboarding')
        }
      })
      .catch(() => {
        router.push('/login?redirect=/admin/onboarding')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [router])

  const loadAllData = async () => {
    try {
      const [
        challengesRes, microlessonsRes, suggestionsRes,
        pathsRes, lessonsRes, quizzesRes
      ] = await Promise.all([
        fetch('/api/admin/gamification/challenges'),
        fetch('/api/admin/gamification/microlessons'),
        fetch('/api/admin/gamification/onboarding'),
        fetch('/api/admin/onboarding/paths'),
        fetch('/api/admin/onboarding/lessons'),
        fetch('/api/admin/onboarding/quizzes'),
      ])

      const [
        challengesData, microlessonsData, suggestionsData,
        pathsData, lessonsData, quizzesData
      ] = await Promise.all([
        challengesRes.json(),
        microlessonsRes.json(),
        suggestionsRes.json(),
        pathsRes.json(),
        lessonsRes.json(),
        quizzesRes.json(),
      ])

      if (challengesData.success) setChallenges(challengesData.data)
      if (microlessonsData.success) setMicrolessons(microlessonsData.data)
      if (suggestionsData.success) setSuggestions(suggestionsData.data)
      if (pathsData.success) setPaths(pathsData.data)
      if (lessonsData.success) setLessons(lessonsData.data)
      if (quizzesData.success) setQuizzes(quizzesData.data)
    } catch {
      setError('Failed to load data')
    }
  }

  // Challenge CRUD
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
        loadAllData()
      } else {
        setError(data.error || 'Failed to save challenge')
      }
    } catch {
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
        loadAllData()
      } else {
        setError(data.error || 'Failed to delete challenge')
      }
    } catch {
      setError('Failed to delete challenge')
    }
  }

  // Microlesson CRUD
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
        loadAllData()
      } else {
        setError(data.error || 'Failed to save microlesson')
      }
    } catch {
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
        loadAllData()
      } else {
        setError(data.error || 'Failed to delete microlesson')
      }
    } catch {
      setError('Failed to delete microlesson')
    }
  }

  // Path CRUD
  const savePath = async (path: Partial<LearningPath>) => {
    try {
      const isNew = !path.id
      const url = isNew
        ? '/api/admin/onboarding/paths'
        : `/api/admin/onboarding/paths/${path.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(path),
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(isNew ? 'Path created' : 'Path updated')
        setEditingPath(null)
        loadAllData()
      } else {
        setError(data.error || 'Failed to save path')
      }
    } catch {
      setError('Failed to save path')
    }
  }

  const deletePath = async (id: string) => {
    if (!confirm('Delete this learning path? All lessons will also be deleted.')) return
    try {
      const res = await fetch(`/api/admin/onboarding/paths/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSuccess('Path deleted')
        loadAllData()
      } else {
        setError(data.error || 'Failed to delete path')
      }
    } catch {
      setError('Failed to delete path')
    }
  }

  // Lesson CRUD
  const saveLesson = async (lesson: Partial<Lesson>) => {
    try {
      const isNew = !lesson.id
      const url = isNew
        ? '/api/admin/onboarding/lessons'
        : `/api/admin/onboarding/lessons/${lesson.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lesson),
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(isNew ? 'Lesson created' : 'Lesson updated')
        setEditingLesson(null)
        loadAllData()
      } else {
        setError(data.error || 'Failed to save lesson')
      }
    } catch {
      setError('Failed to save lesson')
    }
  }

  const deleteLesson = async (id: string) => {
    if (!confirm('Delete this lesson?')) return
    try {
      const res = await fetch(`/api/admin/onboarding/lessons/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSuccess('Lesson deleted')
        loadAllData()
      } else {
        setError(data.error || 'Failed to delete lesson')
      }
    } catch {
      setError('Failed to delete lesson')
    }
  }

  // Quiz CRUD
  const saveQuiz = async (quiz: Partial<Quiz>) => {
    try {
      const isNew = !quiz.id
      const url = isNew
        ? '/api/admin/onboarding/quizzes'
        : `/api/admin/onboarding/quizzes/${quiz.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz),
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(isNew ? 'Quiz created' : 'Quiz updated')
        setEditingQuiz(null)
        loadAllData()
      } else {
        setError(data.error || 'Failed to save quiz')
      }
    } catch {
      setError('Failed to save quiz')
    }
  }

  const deleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz?')) return
    try {
      const res = await fetch(`/api/admin/onboarding/quizzes/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSuccess('Quiz deleted')
        loadAllData()
      } else {
        setError(data.error || 'Failed to delete quiz')
      }
    } catch {
      setError('Failed to delete quiz')
    }
  }

  // Suggestions reset
  const resetSuggestions = async () => {
    if (!confirm('Reset onboarding suggestions to defaults?')) return
    try {
      const res = await fetch('/api/admin/gamification/onboarding?action=reset', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSuccess('Onboarding suggestions reset')
        loadAllData()
      } else {
        setError(data.error || 'Failed to reset suggestions')
      }
    } catch {
      setError('Failed to reset suggestions')
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

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'challenges', label: 'Challenges', count: challenges.length },
    { key: 'microlessons', label: 'Microlessons', count: microlessons.length },
    { key: 'paths', label: 'Learning Paths', count: paths.length },
    { key: 'lessons', label: 'Lessons', count: lessons.length },
    { key: 'quizzes', label: 'Quizzes', count: quizzes.length },
    { key: 'suggestions', label: 'Flow', count: suggestions.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/admin" className="hover:text-gray-700">Admin</a>
            <span>/</span>
            <span>Onboarding</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Onboarding Content Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage challenges, microlessons, learning paths, and onboarding flow
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
          <div className="border-b border-gray-200 flex flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs text-gray-400">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
              <ChallengesTab
                challenges={challenges}
                microlessons={microlessons}
                onEdit={setEditingChallenge}
                onDelete={deleteChallenge}
                onCreate={() => setEditingChallenge({} as Challenge)}
              />
            )}

            {/* Microlessons Tab */}
            {activeTab === 'microlessons' && (
              <MicrolessonsTab
                microlessons={microlessons}
                onEdit={setEditingMicrolesson}
                onDelete={deleteMicrolesson}
                onCreate={() => setEditingMicrolesson({} as Microlesson)}
              />
            )}

            {/* Learning Paths Tab */}
            {activeTab === 'paths' && (
              <PathsTab
                paths={paths}
                onEdit={setEditingPath}
                onDelete={deletePath}
                onCreate={() => setEditingPath({} as LearningPath)}
              />
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <LessonsTab
                lessons={lessons}
                paths={paths}
                onEdit={setEditingLesson}
                onDelete={deleteLesson}
                onCreate={() => setEditingLesson({} as Lesson)}
              />
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <QuizzesTab
                quizzes={quizzes}
                lessons={lessons}
                onEdit={setEditingQuiz}
                onDelete={deleteQuiz}
                onCreate={() => setEditingQuiz({} as Quiz)}
              />
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <SuggestionsTab
                suggestions={suggestions}
                onReset={resetSuggestions}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        {editingChallenge && (
          <ChallengeModal
            challenge={editingChallenge}
            microlessons={microlessons}
            onSave={saveChallenge}
            onClose={() => setEditingChallenge(null)}
          />
        )}
        {editingMicrolesson && (
          <MicrolessonModal
            microlesson={editingMicrolesson}
            onSave={saveMicrolesson}
            onClose={() => setEditingMicrolesson(null)}
          />
        )}
        {editingPath && (
          <PathModal
            path={editingPath}
            onSave={savePath}
            onClose={() => setEditingPath(null)}
          />
        )}
        {editingLesson && (
          <LessonModal
            lesson={editingLesson}
            paths={paths}
            onSave={saveLesson}
            onClose={() => setEditingLesson(null)}
          />
        )}
        {editingQuiz && (
          <QuizModal
            quiz={editingQuiz}
            lessons={lessons}
            onSave={saveQuiz}
            onClose={() => setEditingQuiz(null)}
          />
        )}
      </div>
    </div>
  )
}

// Tab Components
function ChallengesTab({
  challenges,
  microlessons,
  onEdit,
  onDelete,
  onCreate,
}: {
  challenges: Challenge[]
  microlessons: Microlesson[]
  onEdit: (c: Challenge) => void
  onDelete: (id: string) => void
  onCreate: () => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-gray-900">Daily & First-Week Challenges</h2>
        <button
          onClick={onCreate}
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
                  <button onClick={() => onEdit(c)} className="text-blue-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => onDelete(c.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MicrolessonsTab({
  microlessons,
  onEdit,
  onDelete,
  onCreate,
}: {
  microlessons: Microlesson[]
  onEdit: (m: Microlesson) => void
  onDelete: (id: string) => void
  onCreate: () => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-gray-900">Microlessons</h2>
        <button
          onClick={onCreate}
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
                  <button onClick={() => onEdit(m)} className="text-blue-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => onDelete(m.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PathsTab({
  paths,
  onEdit,
  onDelete,
  onCreate,
}: {
  paths: LearningPath[]
  onEdit: (p: LearningPath) => void
  onDelete: (id: string) => void
  onCreate: () => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-gray-900">Learning Paths</h2>
        <button
          onClick={onCreate}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + New Path
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">RP</th>
              <th className="px-3 py-2">Duration</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paths.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-gray-500">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">{p.category}</td>
                <td className="px-3 py-2">{p.rpReward}</td>
                <td className="px-3 py-2">{p.estimatedMinutes} min</td>
                <td className="px-3 py-2">{p.orderIndex}</td>
                <td className="px-3 py-2">
                  <span className={p.isActive ? 'text-green-600' : 'text-gray-400'}>
                    {p.isActive ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => onEdit(p)} className="text-blue-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => onDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LessonsTab({
  lessons,
  paths,
  onEdit,
  onDelete,
  onCreate,
}: {
  lessons: Lesson[]
  paths: LearningPath[]
  onEdit: (l: Lesson) => void
  onDelete: (id: string) => void
  onCreate: () => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-gray-900">Lessons</h2>
        <button
          onClick={onCreate}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + New Lesson
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Path</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">RP</th>
              <th className="px-3 py-2">Duration</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lessons.map(l => {
              const path = paths.find(p => p.id === l.pathId)
              return (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium">{l.title}</div>
                    <div className="text-xs text-gray-500">{l.slug}</div>
                  </td>
                  <td className="px-3 py-2">{path?.title || 'Unknown'}</td>
                  <td className="px-3 py-2 capitalize">{l.contentType}</td>
                  <td className="px-3 py-2">{l.rpReward}</td>
                  <td className="px-3 py-2">{l.durationMinutes} min</td>
                  <td className="px-3 py-2">{l.orderIndex}</td>
                  <td className="px-3 py-2">
                    <span className={l.isActive ? 'text-green-600' : 'text-gray-400'}>
                      {l.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => onEdit(l)} className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button onClick={() => onDelete(l.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function QuizzesTab({
  quizzes,
  lessons,
  onEdit,
  onDelete,
  onCreate,
}: {
  quizzes: Quiz[]
  lessons: Lesson[]
  onEdit: (q: Quiz) => void
  onDelete: (id: string) => void
  onCreate: () => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-gray-900">Quizzes</h2>
        <button
          onClick={onCreate}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + New Quiz
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Linked Lesson</th>
              <th className="px-3 py-2">Pass Score</th>
              <th className="px-3 py-2">RP</th>
              <th className="px-3 py-2">Attempts</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quizzes.map(q => {
              const lesson = lessons.find(l => l.id === q.lessonId)
              return (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium">{q.title}</div>
                    <div className="text-xs text-gray-500">{q.description}</div>
                  </td>
                  <td className="px-3 py-2">{lesson?.title || 'Standalone'}</td>
                  <td className="px-3 py-2">{q.passingScore}%</td>
                  <td className="px-3 py-2">{q.rpReward}</td>
                  <td className="px-3 py-2">{q.maxAttempts}</td>
                  <td className="px-3 py-2">
                    <span className={q.isActive ? 'text-green-600' : 'text-gray-400'}>
                      {q.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => onEdit(q)} className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button onClick={() => onDelete(q.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SuggestionsTab({
  suggestions,
  onReset,
}: {
  suggestions: OnboardingSuggestion[]
  onReset: () => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-gray-900">Onboarding Flow Suggestions</h2>
        <button
          onClick={onReset}
          className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
        >
          Reset to Defaults
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        First 10 challenges suggested to new users. Completing the microlesson before the challenge awards a 10% RP bonus.
      </p>
      <div className="space-y-2">
        {suggestions.map((o, idx) => (
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
  )
}

// Modal Components
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
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm({ ...form, difficulty: e.target.value as ChallengeDifficulty })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
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
                  {ACTION_TYPES.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
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
                  placeholder="e.g. wave, star"
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
                  {microlessons.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isFirstWeek} onChange={e => setForm({ ...form, isFirstWeek: e.target.checked })} />
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
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
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
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PathModal({
  path,
  onSave,
  onClose,
}: {
  path: LearningPath
  onSave: (p: Partial<LearningPath>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    slug: path.slug || '',
    title: path.title || '',
    description: path.description || '',
    icon: path.icon || '',
    category: path.category || 'getting-started',
    orderIndex: path.orderIndex ?? 0,
    rpReward: path.rpReward ?? 50,
    estimatedMinutes: path.estimatedMinutes ?? 30,
    isActive: path.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: path.id,
      ...form,
      orderIndex: Number(form.orderIndex),
      rpReward: Number(form.rpReward),
      estimatedMinutes: Number(form.estimatedMinutes),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {path.id ? 'Edit Learning Path' : 'New Learning Path'}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="e.g. getting-started"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="e.g. rocket emoji"
                />
              </div>
            </div>
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
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as LearningPathCategory })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {PATH_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={form.orderIndex}
                  onChange={e => setForm({ ...form, orderIndex: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={0}
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={form.estimatedMinutes}
                  onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={1}
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LessonModal({
  lesson,
  paths,
  onSave,
  onClose,
}: {
  lesson: Lesson
  paths: LearningPath[]
  onSave: (l: Partial<Lesson>) => void
  onClose: () => void
}) {
  const defaultContent = { format: 'markdown' as const, markdown: '' }
  const [form, setForm] = useState({
    pathId: lesson.pathId || '',
    slug: lesson.slug || '',
    title: lesson.title || '',
    description: lesson.description || '',
    contentType: lesson.contentType || 'markdown',
    content: JSON.stringify(lesson.content || defaultContent, null, 2),
    orderIndex: lesson.orderIndex ?? 0,
    durationMinutes: lesson.durationMinutes ?? 5,
    rpReward: lesson.rpReward ?? 10,
    isActive: lesson.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const content = JSON.parse(form.content)
      onSave({
        id: lesson.id,
        pathId: form.pathId,
        slug: form.slug,
        title: form.title,
        description: form.description,
        contentType: form.contentType as LessonContentType,
        content,
        orderIndex: Number(form.orderIndex),
        durationMinutes: Number(form.durationMinutes),
        rpReward: Number(form.rpReward),
        isActive: form.isActive,
      })
    } catch {
      alert('Invalid JSON in content field')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {lesson.id ? 'Edit Lesson' : 'New Lesson'}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Learning Path</label>
              <select
                value={form.pathId}
                onChange={e => setForm({ ...form, pathId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                required
              >
                <option value="">Select a path...</option>
                {paths.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select
                  value={form.contentType}
                  onChange={e => setForm({ ...form, contentType: e.target.value as LessonContentType })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
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
              />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={form.orderIndex}
                  onChange={e => setForm({ ...form, orderIndex: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RP</label>
                <input
                  type="number"
                  value={form.rpReward}
                  onChange={e => setForm({ ...form, rpReward: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={0}
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function QuizModal({
  quiz,
  lessons,
  onSave,
  onClose,
}: {
  quiz: Quiz
  lessons: Lesson[]
  onSave: (q: Partial<Quiz>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    lessonId: quiz.lessonId || '',
    title: quiz.title || '',
    description: quiz.description || '',
    passingScore: quiz.passingScore ?? 70,
    rpReward: quiz.rpReward ?? 25,
    maxAttempts: quiz.maxAttempts ?? 3,
    isActive: quiz.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: quiz.id,
      lessonId: form.lessonId || undefined,
      title: form.title,
      description: form.description,
      passingScore: Number(form.passingScore),
      rpReward: Number(form.rpReward),
      maxAttempts: Number(form.maxAttempts),
      isActive: form.isActive,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {quiz.id ? 'Edit Quiz' : 'New Quiz'}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linked Lesson (optional)</label>
              <select
                value={form.lessonId}
                onChange={e => setForm({ ...form, lessonId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Standalone quiz</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
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
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pass %</label>
                <input
                  type="number"
                  value={form.passingScore}
                  onChange={e => setForm({ ...form, passingScore: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RP</label>
                <input
                  type="number"
                  value={form.rpReward}
                  onChange={e => setForm({ ...form, rpReward: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attempts</label>
                <input
                  type="number"
                  value={form.maxAttempts}
                  onChange={e => setForm({ ...form, maxAttempts: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min={1}
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <p className="text-xs text-gray-500">
              Note: Quiz questions are managed separately via the database.
            </p>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
