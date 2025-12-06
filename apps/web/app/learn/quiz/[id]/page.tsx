'use client'

/**
 * Quiz Page - Take a quiz
 * Route: /learn/quiz/[id]
 */

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface QuizOption {
  id: string
  text: string
}

interface QuizQuestion {
  id: string
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'multi_select'
  options: QuizOption[]
  points: number
}

interface Quiz {
  id: string
  lessonId?: string
  title: string
  description?: string
  passingScore: number
  rpReward: number
  maxAttempts: number
  lessonTitle?: string
  lessonSlug?: string
  pathSlug?: string
  questions: QuizQuestion[]
  questionCount: number
  totalPoints: number
  attemptsUsed: number
  attemptsRemaining: number
  hasPassed: boolean
}

interface QuestionResult {
  questionId: string
  correct: boolean
  selectedOptions: string[]
  correctOptions: string[]
  explanation?: string
  pointsEarned: number
}

interface SubmitResult {
  passed: boolean
  score: number
  totalPoints: number
  earnedPoints: number
  rpAwarded: number
  attemptNumber: number
  attemptsRemaining: number
  questionResults: QuestionResult[]
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    fetch(`/api/learning/quizzes/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuiz(data.data)
        } else {
          setError(data.error || 'Failed to load quiz')
        }
      })
      .catch(() => setError('Failed to load quiz'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    if (!quiz || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/learning/quizzes/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to submit quiz')
      }
    } catch {
      setError('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Loading quiz...</div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Quiz not found'}</p>
          <button onClick={() => router.push('/learn')} className="text-blue-600 hover:underline">
            Back to Learning Hub
          </button>
        </div>
      </div>
    )
  }

  // Already passed or no attempts remaining
  if (quiz.hasPassed && !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quiz Already Passed</h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6">You&apos;ve already passed this quiz.</p>
            {quiz.pathSlug && quiz.lessonSlug && (
              <Link
                href={`/learn/${quiz.pathSlug}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Back to Path
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (quiz.attemptsRemaining === 0 && !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-5xl mb-4">😔</div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Attempts Remaining</h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6">
              You&apos;ve used all {quiz.maxAttempts} attempts for this quiz.
            </p>
            <Link href="/learn" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Back to Learning Hub
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show result
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className={`rounded-lg border p-8 text-center mb-6 ${
            result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="text-5xl mb-4">{result.passed ? '🎉' : '😔'}</div>
            <h1 className={`text-xl font-semibold mb-2 ${
              result.passed ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
            </h1>
            <p className={`text-2xl font-bold mb-2 ${
              result.passed ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.score}%
            </p>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
              {result.earnedPoints} / {result.totalPoints} points
              {result.passed && ` • Passing score: ${quiz.passingScore}%`}
            </p>
            {result.rpAwarded > 0 && (
              <p className="text-green-600 font-medium">+{result.rpAwarded} RP earned!</p>
            )}
            {!result.passed && result.attemptsRemaining > 0 && (
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm mt-2">
                {result.attemptsRemaining} attempt{result.attemptsRemaining !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>

          {/* Review button */}
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left mb-4 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              {showReview ? 'Hide Review' : 'Review Answers'}
            </span>
          </button>

          {/* Review */}
          {showReview && (
            <div className="space-y-4 mb-6">
              {quiz.questions.map((question, index) => {
                const qResult = result.questionResults.find(r => r.questionId === question.id)
                return (
                  <div
                    key={question.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${
                      qResult?.correct ? 'border-green-200' : 'border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                        qResult?.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {qResult?.correct ? '✓' : '✗'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {index + 1}. {question.questionText}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                          {qResult?.pointsEarned || 0} / {question.points} points
                        </p>
                      </div>
                    </div>

                    <div className="ml-8 space-y-1">
                      {question.options.map(opt => {
                        const isSelected = qResult?.selectedOptions.includes(opt.id)
                        const isCorrect = qResult?.correctOptions.includes(opt.id)
                        return (
                          <div
                            key={opt.id}
                            className={`text-sm p-2 rounded ${
                              isCorrect
                                ? 'bg-green-50 text-green-800'
                                : isSelected
                                ? 'bg-red-50 text-red-800'
                                : 'text-gray-600'
                            }`}
                          >
                            {opt.text}
                            {isCorrect && ' ✓'}
                            {isSelected && !isCorrect && ' (your answer)'}
                          </div>
                        )
                      })}
                    </div>

                    {qResult?.explanation && (
                      <p className="ml-8 mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 italic">
                        {qResult.explanation}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {!result.passed && result.attemptsRemaining > 0 && (
              <button
                onClick={() => {
                  setResult(null)
                  setAnswers({})
                  setCurrentQuestion(0)
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            )}
            {quiz.pathSlug ? (
              <Link
                href={`/learn/${quiz.pathSlug}`}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Back to Path
              </Link>
            ) : (
              <Link
                href="/learn"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Back to Learning
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Quiz in progress
  const question = quiz.questions[currentQuestion]
  const isLastQuestion = currentQuestion === quiz.questions.length - 1
  const canProceed = answers[question.id] !== undefined

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <h1 className="font-semibold text-gray-900 dark:text-white mb-1">{quiz.title}</h1>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
            <span>
              Question {currentQuestion + 1} of {quiz.questionCount}
            </span>
            <span>
              Attempt {quiz.attemptsUsed + 1} of {quiz.maxAttempts}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quiz.questionCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {question.questionText}
          </p>

          {question.questionType === 'multi_select' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-3">Select all that apply</p>
          )}

          <div className="space-y-2">
            {question.options.map(option => {
              const isSelected = question.questionType === 'multi_select'
                ? (answers[question.id] as string[] || []).includes(option.id)
                : answers[question.id] === option.id

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (question.questionType === 'multi_select') {
                      const current = (answers[question.id] as string[]) || []
                      const newValue = current.includes(option.id)
                        ? current.filter(id => id !== option.id)
                        : [...current, option.id]
                      handleAnswer(question.id, newValue)
                    } else {
                      handleAnswer(question.id, option.id)
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900'
                      : 'bg-white dark:bg-gray-800 border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-white dark:text-white disabled:opacity-50"
          >
            ← Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed || submitting}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={!canProceed}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
