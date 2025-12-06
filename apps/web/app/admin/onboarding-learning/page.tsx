'use client'

/**
 * Admin Learning Paths Page
 * Manage learning paths, lessons, and quizzes for onboarding
 * Route: /admin/onboarding-learning
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  LearningPath,
  Lesson,
  Quiz,
  LearningPathCategory,
  LessonContentType,
} from '@togetheros/types'

type Tab = 'paths' | 'lessons' | 'quizzes'

const CATEGORIES: LearningPathCategory[] = [
  'getting-started',
  'governance',
  'economy',
  'community',
  'technology',
  'culture',
]

const CONTENT_TYPES: LessonContentType[] = ['markdown', 'structured', 'video']

export default function LearningAdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('paths')
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
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
          loadData()
        } else {
          router.push('/login?redirect=/admin/onboarding-learning')
        }
      })
      .catch(() => {
        router.push('/login?redirect=/admin/onboarding-learning')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [router])

  const loadData = async () => {
    try {
      const [pathsRes, lessonsRes, quizzesRes] = await Promise.all([
        fetch('/api/admin/onboarding/paths'),
        fetch('/api/admin/onboarding/lessons'),
        fetch('/api/admin/onboarding/quizzes'),
      ])

      const [pathsData, lessonsData, quizzesData] = await Promise.all([
        pathsRes.json(),
        lessonsRes.json(),
        quizzesRes.json(),
      ])

      if (pathsData.success) setPaths(pathsData.data)
      if (lessonsData.success) setLessons(lessonsData.data)
      if (quizzesData.success) setQuizzes(quizzesData.data)
    } catch {
      setError('Failed to load data')
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
        loadData()
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
        loadData()
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
        loadData()
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
        loadData()
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
        loadData()
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
        loadData()
      } else {
        setError(data.error || 'Failed to delete quiz')
      }
    } catch {
      setError('Failed to delete quiz')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-1">
        <div className="text-ink-700 dark:text-ink-400">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-bg-1 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-ink-400 dark:text-ink-400 mb-2">
            <a href="/admin" className="hover:text-ink-700 dark:hover:text-gray-300">Admin</a>
            <span>/</span>
            <span>Onboarding Learning</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink-900">Learning Content Management</h1>
          <p className="text-sm text-ink-700 dark:text-ink-400 mt-1">
            Manage learning paths, lessons, and quizzes for user onboarding
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
        <div className="bg-bg-0 rounded-lg border border-border overflow-hidden">
          <div className="border-b border-border flex">
            {(['paths', 'lessons', 'quizzes'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-ink-700 hover:text-ink-900 hover:bg-bg-1'
                }`}
              >
                {tab}
                <span className="ml-2 text-xs text-ink-400">
                  ({tab === 'paths' ? paths.length : tab === 'lessons' ? lessons.length : quizzes.length})
                </span>
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Paths Tab */}
            {activeTab === 'paths' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-ink-900">Learning Paths</h2>
                  <button
                    onClick={() => setEditingPath({} as LearningPath)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    + New Path
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-bg-1 text-left">
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
                        <tr key={p.id} className="hover:bg-bg-1 dark:hover:bg-gray-800">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span>{p.icon}</span>
                              <div>
                                <div className="font-medium">{p.title}</div>
                                <div className="text-xs text-ink-400 dark:text-ink-400">{p.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">{p.category}</td>
                          <td className="px-3 py-2">{p.rpReward}</td>
                          <td className="px-3 py-2">{p.estimatedMinutes} min</td>
                          <td className="px-3 py-2">{p.orderIndex}</td>
                          <td className="px-3 py-2">
                            <span className={p.isActive ? 'text-green-600' : 'text-ink-400'}>
                              {p.isActive ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => setEditingPath(p)}
                              className="text-blue-600 hover:underline mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deletePath(p.id)}
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

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-ink-900">Lessons</h2>
                  <button
                    onClick={() => setEditingLesson({} as Lesson)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    + New Lesson
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-bg-1 text-left">
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
                          <tr key={l.id} className="hover:bg-bg-1 dark:hover:bg-gray-800">
                            <td className="px-3 py-2">
                              <div className="font-medium">{l.title}</div>
                              <div className="text-xs text-ink-400 dark:text-ink-400">{l.slug}</div>
                            </td>
                            <td className="px-3 py-2">{path?.title || 'Unknown'}</td>
                            <td className="px-3 py-2 capitalize">{l.contentType}</td>
                            <td className="px-3 py-2">{l.rpReward}</td>
                            <td className="px-3 py-2">{l.durationMinutes} min</td>
                            <td className="px-3 py-2">{l.orderIndex}</td>
                            <td className="px-3 py-2">
                              <span className={l.isActive ? 'text-green-600' : 'text-ink-400'}>
                                {l.isActive ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => setEditingLesson(l)}
                                className="text-blue-600 hover:underline mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteLesson(l.id)}
                                className="text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-ink-900">Quizzes</h2>
                  <button
                    onClick={() => setEditingQuiz({} as Quiz)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    + New Quiz
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-bg-1 text-left">
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
                          <tr key={q.id} className="hover:bg-bg-1 dark:hover:bg-gray-800">
                            <td className="px-3 py-2">
                              <div className="font-medium">{q.title}</div>
                              <div className="text-xs text-ink-400 dark:text-ink-400">{q.description}</div>
                            </td>
                            <td className="px-3 py-2">{lesson?.title || 'Standalone'}</td>
                            <td className="px-3 py-2">{q.passingScore}%</td>
                            <td className="px-3 py-2">{q.rpReward}</td>
                            <td className="px-3 py-2">{q.maxAttempts}</td>
                            <td className="px-3 py-2">
                              <span className={q.isActive ? 'text-green-600' : 'text-ink-400'}>
                                {q.isActive ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => setEditingQuiz(q)}
                                className="text-blue-600 hover:underline mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteQuiz(q.id)}
                                className="text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Path Edit Modal */}
        {editingPath && (
          <PathModal
            path={editingPath}
            onSave={savePath}
            onClose={() => setEditingPath(null)}
          />
        )}

        {/* Lesson Edit Modal */}
        {editingLesson && (
          <LessonModal
            lesson={editingLesson}
            paths={paths}
            onSave={saveLesson}
            onClose={() => setEditingLesson(null)}
          />
        )}

        {/* Quiz Edit Modal */}
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
      <div className="bg-bg-0 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-ink-900">
              {path.id ? 'Edit Learning Path' : 'New Learning Path'}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  placeholder="e.g. getting-started"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  placeholder="e.g. 🚀"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 text-sm"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as LearningPathCategory })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Order</label>
                <input
                  type="number"
                  value={form.orderIndex}
                  onChange={e => setForm({ ...form, orderIndex: Number(e.target.value) })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  min={0}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">RP Reward</label>
                <input
                  type="number"
                  value={form.rpReward}
                  onChange={e => setForm({ ...form, rpReward: Number(e.target.value) })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={form.estimatedMinutes}
                  onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  min={1}
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
              />
              <span className="text-sm text-ink-700">Active</span>
            </label>
          </div>
          <div className="p-4 border-t border-border flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-ink-700 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white dark:text-white">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Save
            </button>
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
      <div className="bg-bg-0 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-ink-900">
              {lesson.id ? 'Edit Lesson' : 'New Lesson'}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Learning Path</label>
              <select
                value={form.pathId}
                onChange={e => setForm({ ...form, pathId: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 text-sm"
                required
              >
                <option value="">Select a path...</option>
                {paths.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Content Type</label>
                <select
                  value={form.contentType}
                  onChange={e => setForm({ ...form, contentType: e.target.value as LessonContentType })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                >
                  {CONTENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Content (JSON)</label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 text-sm font-mono"
                rows={8}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Order</label>
                <input
                  type="number"
                  value={form.orderIndex}
                  onChange={e => setForm({ ...form, orderIndex: Number(e.target.value) })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Duration</label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">RP</label>
                <input
                  type="number"
                  value={form.rpReward}
                  onChange={e => setForm({ ...form, rpReward: Number(e.target.value) })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
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
              <span className="text-sm text-ink-700">Active</span>
            </label>
          </div>
          <div className="p-4 border-t border-border flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-ink-700 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white dark:text-white">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Save
            </button>
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
      <div className="bg-bg-0 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-ink-900">
              {quiz.id ? 'Edit Quiz' : 'New Quiz'}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Linked Lesson (optional)</label>
              <select
                value={form.lessonId}
                onChange={e => setForm({ ...form, lessonId: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 text-sm"
              >
                <option value="">Standalone quiz</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 text-sm"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Pass %</label>
                <input
                  type="number"
                  value={form.passingScore}
                  onChange={e => setForm({ ...form, passingScore: Number(e.target.value) })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">RP</label>
                <input
                  type="number"
                  value={form.rpReward}
                  onChange={e => setForm({ ...form, rpReward: Number(e.target.value) })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Attempts</label>
                <input
                  type="number"
                  value={form.maxAttempts}
                  onChange={e => setForm({ ...form, maxAttempts: Number(e.target.value) })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  min={1}
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
              />
              <span className="text-sm text-ink-700">Active</span>
            </label>
            <p className="text-xs text-ink-400 dark:text-ink-400">
              Note: Quiz questions are managed separately via the database. Future version will add question editor.
            </p>
          </div>
          <div className="p-4 border-t border-border flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-ink-700 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white dark:text-white">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
