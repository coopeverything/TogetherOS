// packages/types/__tests__/learning.test.ts
// TogetherOS Learning Module - Schema and Utility Tests

import { describe, it, expect } from 'vitest'
import {
  // Schemas
  learningPathCategorySchema,
  lessonContentTypeSchema,
  quizQuestionTypeSchema,
  quizQuestionOptionSchema,
  structuredContentSchema,
  markdownContentSchema,
  videoContentSchema,
  lessonContentSchema,
  createLearningPathSchema,
  updateLearningPathSchema,
  createLessonSchema,
  createQuizSchema,
  createQuizQuestionSchema,
  submitQuizSchema,
  completeLessonSchema,
  // Utilities
  getCategoryLabel,
  calculateQuizScore,
  // Constants
  LEARNING_RP_DEFAULTS,
  QUIZ_DEFAULTS,
  LEARNING_PATH_CATEGORY_LABELS,
  // Types
  type QuizQuestion,
} from '../src/learning'

// ============================================================
// Category Schema Tests
// ============================================================

describe('learningPathCategorySchema', () => {
  it('accepts valid categories', () => {
    const categories = ['getting-started', 'governance', 'economy', 'community', 'technology', 'culture']
    categories.forEach(cat => {
      expect(learningPathCategorySchema.safeParse(cat).success).toBe(true)
    })
  })

  it('rejects invalid category', () => {
    expect(learningPathCategorySchema.safeParse('invalid').success).toBe(false)
    expect(learningPathCategorySchema.safeParse('').success).toBe(false)
    expect(learningPathCategorySchema.safeParse(123).success).toBe(false)
  })
})

describe('lessonContentTypeSchema', () => {
  it('accepts valid content types', () => {
    expect(lessonContentTypeSchema.safeParse('markdown').success).toBe(true)
    expect(lessonContentTypeSchema.safeParse('structured').success).toBe(true)
    expect(lessonContentTypeSchema.safeParse('video').success).toBe(true)
  })

  it('rejects invalid content types', () => {
    expect(lessonContentTypeSchema.safeParse('html').success).toBe(false)
    expect(lessonContentTypeSchema.safeParse('').success).toBe(false)
  })
})

describe('quizQuestionTypeSchema', () => {
  it('accepts valid question types', () => {
    expect(quizQuestionTypeSchema.safeParse('multiple_choice').success).toBe(true)
    expect(quizQuestionTypeSchema.safeParse('true_false').success).toBe(true)
    expect(quizQuestionTypeSchema.safeParse('multi_select').success).toBe(true)
  })

  it('rejects invalid question types', () => {
    expect(quizQuestionTypeSchema.safeParse('essay').success).toBe(false)
    expect(quizQuestionTypeSchema.safeParse('fill_blank').success).toBe(false)
  })
})

// ============================================================
// Quiz Option Schema Tests
// ============================================================

describe('quizQuestionOptionSchema', () => {
  it('accepts valid option', () => {
    const option = { id: 'opt1', text: 'Option text', isCorrect: true }
    expect(quizQuestionOptionSchema.safeParse(option).success).toBe(true)
  })

  it('accepts option with isCorrect false', () => {
    const option = { id: 'opt2', text: 'Wrong option', isCorrect: false }
    expect(quizQuestionOptionSchema.safeParse(option).success).toBe(true)
  })

  it('rejects option with empty id', () => {
    const option = { id: '', text: 'Option', isCorrect: true }
    expect(quizQuestionOptionSchema.safeParse(option).success).toBe(false)
  })

  it('rejects option with empty text', () => {
    const option = { id: 'opt1', text: '', isCorrect: true }
    expect(quizQuestionOptionSchema.safeParse(option).success).toBe(false)
  })

  it('rejects option without isCorrect', () => {
    const option = { id: 'opt1', text: 'Option' }
    expect(quizQuestionOptionSchema.safeParse(option).success).toBe(false)
  })
})

// ============================================================
// Content Schema Tests
// ============================================================

describe('structuredContentSchema', () => {
  it('accepts valid structured content', () => {
    const content = {
      format: 'structured',
      structured: {
        introduction: 'Welcome to this lesson',
        keyPoints: ['Point 1', 'Point 2'],
        example: 'Here is an example',
        reflection: 'Think about this',
        nextSteps: 'Continue learning',
      },
    }
    expect(structuredContentSchema.safeParse(content).success).toBe(true)
  })

  it('accepts minimal structured content', () => {
    const content = {
      format: 'structured',
      structured: {
        introduction: 'Welcome',
        keyPoints: ['Point 1'],
      },
    }
    expect(structuredContentSchema.safeParse(content).success).toBe(true)
  })

  it('rejects structured content without introduction', () => {
    const content = {
      format: 'structured',
      structured: {
        keyPoints: ['Point 1'],
      },
    }
    expect(structuredContentSchema.safeParse(content).success).toBe(false)
  })

  it('rejects structured content with empty keyPoints', () => {
    const content = {
      format: 'structured',
      structured: {
        introduction: 'Welcome',
        keyPoints: [],
      },
    }
    expect(structuredContentSchema.safeParse(content).success).toBe(false)
  })
})

describe('markdownContentSchema', () => {
  it('accepts valid markdown content', () => {
    const content = {
      format: 'markdown',
      markdown: '# Heading\n\nSome content here.',
    }
    expect(markdownContentSchema.safeParse(content).success).toBe(true)
  })

  it('rejects empty markdown content', () => {
    const content = {
      format: 'markdown',
      markdown: '',
    }
    expect(markdownContentSchema.safeParse(content).success).toBe(false)
  })
})

describe('videoContentSchema', () => {
  it('accepts valid YouTube video content', () => {
    const content = {
      format: 'video',
      video: {
        url: 'https://youtube.com/watch?v=abc123',
        provider: 'youtube',
        duration: 300,
        transcript: 'Video transcript here',
      },
    }
    expect(videoContentSchema.safeParse(content).success).toBe(true)
  })

  it('accepts minimal video content', () => {
    const content = {
      format: 'video',
      video: {
        url: 'https://vimeo.com/123456',
        provider: 'vimeo',
      },
    }
    expect(videoContentSchema.safeParse(content).success).toBe(true)
  })

  it('rejects video with invalid URL', () => {
    const content = {
      format: 'video',
      video: {
        url: 'not-a-url',
        provider: 'youtube',
      },
    }
    expect(videoContentSchema.safeParse(content).success).toBe(false)
  })

  it('rejects video with invalid provider', () => {
    const content = {
      format: 'video',
      video: {
        url: 'https://example.com/video',
        provider: 'dailymotion',
      },
    }
    expect(videoContentSchema.safeParse(content).success).toBe(false)
  })
})

describe('lessonContentSchema (discriminated union)', () => {
  it('correctly parses structured content', () => {
    const content = {
      format: 'structured',
      structured: {
        introduction: 'Welcome',
        keyPoints: ['Point 1'],
      },
    }
    const result = lessonContentSchema.safeParse(content)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.format).toBe('structured')
    }
  })

  it('correctly parses markdown content', () => {
    const content = {
      format: 'markdown',
      markdown: '# Title',
    }
    const result = lessonContentSchema.safeParse(content)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.format).toBe('markdown')
    }
  })

  it('correctly parses video content', () => {
    const content = {
      format: 'video',
      video: {
        url: 'https://youtube.com/watch?v=123',
        provider: 'youtube',
      },
    }
    const result = lessonContentSchema.safeParse(content)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.format).toBe('video')
    }
  })
})

// ============================================================
// Learning Path Schema Tests
// ============================================================

describe('createLearningPathSchema', () => {
  it('accepts valid learning path', () => {
    const path = {
      slug: 'getting-started-101',
      title: 'Getting Started with TogetherOS',
      description: 'Learn the basics',
      icon: '📚',
      category: 'getting-started',
      orderIndex: 1,
      isActive: true,
      rpReward: 50,
      estimatedMinutes: 30,
    }
    expect(createLearningPathSchema.safeParse(path).success).toBe(true)
  })

  it('accepts minimal learning path', () => {
    const path = {
      slug: 'quick-start',
      title: 'Quick Start',
    }
    expect(createLearningPathSchema.safeParse(path).success).toBe(true)
  })

  it('rejects invalid slug format', () => {
    const path = {
      slug: 'Invalid Slug With Spaces',
      title: 'Test',
    }
    expect(createLearningPathSchema.safeParse(path).success).toBe(false)
  })

  it('rejects slug with uppercase', () => {
    const path = {
      slug: 'InvalidSlug',
      title: 'Test',
    }
    expect(createLearningPathSchema.safeParse(path).success).toBe(false)
  })

  it('rejects excessive RP reward', () => {
    const path = {
      slug: 'test-path',
      title: 'Test',
      rpReward: 9999,
    }
    expect(createLearningPathSchema.safeParse(path).success).toBe(false)
  })

  it('rejects empty slug', () => {
    const path = {
      slug: '',
      title: 'Test',
    }
    expect(createLearningPathSchema.safeParse(path).success).toBe(false)
  })
})

describe('updateLearningPathSchema', () => {
  it('accepts partial update', () => {
    const update = { title: 'Updated Title' }
    expect(updateLearningPathSchema.safeParse(update).success).toBe(true)
  })

  it('accepts empty update', () => {
    const update = {}
    expect(updateLearningPathSchema.safeParse(update).success).toBe(true)
  })
})

// ============================================================
// Lesson Schema Tests
// ============================================================

describe('createLessonSchema', () => {
  it('accepts valid lesson with structured content', () => {
    const lesson = {
      pathId: '550e8400-e29b-41d4-a716-446655440000',
      slug: 'lesson-1-intro',
      title: 'Introduction',
      contentType: 'structured',
      content: {
        format: 'structured',
        structured: {
          introduction: 'Welcome to the lesson',
          keyPoints: ['Point 1', 'Point 2'],
        },
      },
    }
    expect(createLessonSchema.safeParse(lesson).success).toBe(true)
  })

  it('accepts valid lesson with markdown content', () => {
    const lesson = {
      pathId: '550e8400-e29b-41d4-a716-446655440001',
      slug: 'lesson-2-markdown',
      title: 'Markdown Lesson',
      contentType: 'markdown',
      content: {
        format: 'markdown',
        markdown: '# Lesson Content\n\nThis is the content.',
      },
    }
    expect(createLessonSchema.safeParse(lesson).success).toBe(true)
  })

  it('rejects lesson with invalid pathId', () => {
    const lesson = {
      pathId: 'not-a-uuid',
      slug: 'lesson-1',
      title: 'Test',
      contentType: 'markdown',
      content: { format: 'markdown', markdown: 'Content' },
    }
    expect(createLessonSchema.safeParse(lesson).success).toBe(false)
  })

  it('rejects lesson with excessive duration', () => {
    const lesson = {
      pathId: '550e8400-e29b-41d4-a716-446655440000',
      slug: 'long-lesson',
      title: 'Very Long Lesson',
      contentType: 'markdown',
      content: { format: 'markdown', markdown: 'Content' },
      durationMinutes: 999,
    }
    expect(createLessonSchema.safeParse(lesson).success).toBe(false)
  })
})

// ============================================================
// Quiz Schema Tests
// ============================================================

describe('createQuizQuestionSchema', () => {
  it('accepts valid multiple choice question', () => {
    const question = {
      questionText: 'What is TogetherOS?',
      questionType: 'multiple_choice',
      options: [
        { id: 'a', text: 'An operating system', isCorrect: false },
        { id: 'b', text: 'A cooperation platform', isCorrect: true },
        { id: 'c', text: 'A video game', isCorrect: false },
      ],
      explanation: 'TogetherOS is a cooperation-first platform.',
      points: 5,
    }
    expect(createQuizQuestionSchema.safeParse(question).success).toBe(true)
  })

  it('accepts valid true/false question', () => {
    const question = {
      questionText: 'TogetherOS promotes cooperation.',
      questionType: 'true_false',
      options: [
        { id: 'true', text: 'True', isCorrect: true },
        { id: 'false', text: 'False', isCorrect: false },
      ],
    }
    expect(createQuizQuestionSchema.safeParse(question).success).toBe(true)
  })

  it('rejects question with only one option', () => {
    const question = {
      questionText: 'Question?',
      questionType: 'multiple_choice',
      options: [{ id: 'a', text: 'Only option', isCorrect: true }],
    }
    expect(createQuizQuestionSchema.safeParse(question).success).toBe(false)
  })

  it('rejects question with too many options', () => {
    const question = {
      questionText: 'Question?',
      questionType: 'multiple_choice',
      options: Array(7)
        .fill(null)
        .map((_, i) => ({ id: `opt${i}`, text: `Option ${i}`, isCorrect: i === 0 })),
    }
    expect(createQuizQuestionSchema.safeParse(question).success).toBe(false)
  })

  it('rejects question with excessive points', () => {
    const question = {
      questionText: 'Question?',
      questionType: 'multiple_choice',
      options: [
        { id: 'a', text: 'A', isCorrect: true },
        { id: 'b', text: 'B', isCorrect: false },
      ],
      points: 99,
    }
    expect(createQuizQuestionSchema.safeParse(question).success).toBe(false)
  })
})

describe('createQuizSchema', () => {
  it('accepts valid quiz', () => {
    const quiz = {
      lessonId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Knowledge Check',
      description: 'Test your understanding',
      passingScore: 70,
      rpReward: 25,
      maxAttempts: 3,
      isActive: true,
    }
    expect(createQuizSchema.safeParse(quiz).success).toBe(true)
  })

  it('accepts quiz without lessonId (standalone)', () => {
    const quiz = {
      title: 'Standalone Quiz',
    }
    expect(createQuizSchema.safeParse(quiz).success).toBe(true)
  })

  it('rejects quiz with passing score over 100', () => {
    const quiz = {
      title: 'Test Quiz',
      passingScore: 150,
    }
    expect(createQuizSchema.safeParse(quiz).success).toBe(false)
  })

  it('rejects quiz with too many attempts', () => {
    const quiz = {
      title: 'Test Quiz',
      maxAttempts: 99,
    }
    expect(createQuizSchema.safeParse(quiz).success).toBe(false)
  })
})

describe('submitQuizSchema', () => {
  it('accepts valid quiz submission', () => {
    const submission = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      quizId: '550e8400-e29b-41d4-a716-446655440001',
      answers: {
        q1: 'opt-a',
        q2: ['opt-b', 'opt-c'],
      },
    }
    expect(submitQuizSchema.safeParse(submission).success).toBe(true)
  })

  it('accepts submission with single answer per question', () => {
    const submission = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      quizId: '550e8400-e29b-41d4-a716-446655440001',
      answers: {
        q1: 'opt-a',
        q2: 'opt-b',
      },
    }
    expect(submitQuizSchema.safeParse(submission).success).toBe(true)
  })

  it('rejects submission with invalid userId', () => {
    const submission = {
      userId: 'not-uuid',
      quizId: '550e8400-e29b-41d4-a716-446655440001',
      answers: { q1: 'opt-a' },
    }
    expect(submitQuizSchema.safeParse(submission).success).toBe(false)
  })
})

describe('completeLessonSchema', () => {
  it('accepts valid lesson completion', () => {
    const completion = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '550e8400-e29b-41d4-a716-446655440001',
    }
    expect(completeLessonSchema.safeParse(completion).success).toBe(true)
  })

  it('rejects completion with invalid UUIDs', () => {
    const completion = {
      userId: 'invalid',
      lessonId: 'also-invalid',
    }
    expect(completeLessonSchema.safeParse(completion).success).toBe(false)
  })
})

// ============================================================
// Utility Function Tests
// ============================================================

describe('getCategoryLabel', () => {
  it('returns correct labels for all categories', () => {
    expect(getCategoryLabel('getting-started')).toBe('Getting Started')
    expect(getCategoryLabel('governance')).toBe('Governance')
    expect(getCategoryLabel('economy')).toBe('Economy')
    expect(getCategoryLabel('community')).toBe('Community')
    expect(getCategoryLabel('technology')).toBe('Technology')
    expect(getCategoryLabel('culture')).toBe('Culture')
  })
})

describe('calculateQuizScore', () => {
  const createQuestion = (
    id: string,
    type: 'multiple_choice' | 'true_false' | 'multi_select',
    correctIds: string[],
    points: number = 1
  ): QuizQuestion => ({
    id,
    quizId: 'quiz-1',
    questionText: `Question ${id}`,
    questionType: type,
    options: [
      { id: 'a', text: 'Option A', isCorrect: correctIds.includes('a') },
      { id: 'b', text: 'Option B', isCorrect: correctIds.includes('b') },
      { id: 'c', text: 'Option C', isCorrect: correctIds.includes('c') },
    ],
    orderIndex: 0,
    points,
    createdAt: new Date(),
  })

  it('calculates perfect score correctly', () => {
    const questions = [
      createQuestion('q1', 'multiple_choice', ['a'], 10),
      createQuestion('q2', 'multiple_choice', ['b'], 10),
    ]
    const answers = { q1: 'a', q2: 'b' }

    const result = calculateQuizScore(questions, answers)
    expect(result.score).toBe(100)
    expect(result.totalPoints).toBe(20)
    expect(result.earnedPoints).toBe(20)
  })

  it('calculates partial score correctly', () => {
    const questions = [
      createQuestion('q1', 'multiple_choice', ['a'], 10),
      createQuestion('q2', 'multiple_choice', ['b'], 10),
    ]
    const answers = { q1: 'a', q2: 'c' } // q2 wrong

    const result = calculateQuizScore(questions, answers)
    expect(result.score).toBe(50)
    expect(result.earnedPoints).toBe(10)
  })

  it('calculates zero score correctly', () => {
    const questions = [
      createQuestion('q1', 'multiple_choice', ['a'], 10),
      createQuestion('q2', 'multiple_choice', ['b'], 10),
    ]
    const answers = { q1: 'c', q2: 'c' } // all wrong

    const result = calculateQuizScore(questions, answers)
    expect(result.score).toBe(0)
    expect(result.earnedPoints).toBe(0)
  })

  it('handles multi_select questions correctly', () => {
    const questions = [createQuestion('q1', 'multi_select', ['a', 'b'], 10)]

    // All correct
    const correctResult = calculateQuizScore(questions, { q1: ['a', 'b'] })
    expect(correctResult.score).toBe(100)

    // Partial (missing one) - counts as wrong
    const partialResult = calculateQuizScore(questions, { q1: ['a'] })
    expect(partialResult.score).toBe(0)

    // Wrong selection included
    const wrongResult = calculateQuizScore(questions, { q1: ['a', 'c'] })
    expect(wrongResult.score).toBe(0)
  })

  it('handles true_false questions', () => {
    const question: QuizQuestion = {
      id: 'q1',
      quizId: 'quiz-1',
      questionText: 'True or False?',
      questionType: 'true_false',
      options: [
        { id: 'true', text: 'True', isCorrect: true },
        { id: 'false', text: 'False', isCorrect: false },
      ],
      orderIndex: 0,
      points: 5,
      createdAt: new Date(),
    }

    const correctResult = calculateQuizScore([question], { q1: 'true' })
    expect(correctResult.score).toBe(100)

    const wrongResult = calculateQuizScore([question], { q1: 'false' })
    expect(wrongResult.score).toBe(0)
  })

  it('handles empty questions array', () => {
    const result = calculateQuizScore([], {})
    expect(result.score).toBe(0)
    expect(result.totalPoints).toBe(0)
    expect(result.earnedPoints).toBe(0)
  })

  it('handles missing answers', () => {
    const questions = [createQuestion('q1', 'multiple_choice', ['a'], 10)]
    const result = calculateQuizScore(questions, {}) // no answer provided

    expect(result.score).toBe(0)
    expect(result.earnedPoints).toBe(0)
  })

  it('handles weighted questions correctly', () => {
    const questions = [
      createQuestion('q1', 'multiple_choice', ['a'], 5),
      createQuestion('q2', 'multiple_choice', ['b'], 15),
    ]
    // Only got the easy one right
    const result = calculateQuizScore(questions, { q1: 'a', q2: 'c' })

    expect(result.totalPoints).toBe(20)
    expect(result.earnedPoints).toBe(5)
    expect(result.score).toBe(25) // 5/20 = 25%
  })
})

// ============================================================
// Constants Tests
// ============================================================

describe('LEARNING_RP_DEFAULTS', () => {
  it('has expected values', () => {
    expect(LEARNING_RP_DEFAULTS.LESSON_COMPLETE).toBe(10)
    expect(LEARNING_RP_DEFAULTS.QUIZ_PASS).toBe(25)
    expect(LEARNING_RP_DEFAULTS.QUIZ_PERFECT).toBe(10)
    expect(LEARNING_RP_DEFAULTS.PATH_COMPLETE).toBe(50)
    expect(LEARNING_RP_DEFAULTS.ALL_PATHS_COMPLETE).toBe(100)
  })
})

describe('QUIZ_DEFAULTS', () => {
  it('has expected values', () => {
    expect(QUIZ_DEFAULTS.PASSING_SCORE).toBe(70)
    expect(QUIZ_DEFAULTS.MAX_ATTEMPTS).toBe(3)
    expect(QUIZ_DEFAULTS.RP_REWARD).toBe(25)
  })
})

describe('LEARNING_PATH_CATEGORY_LABELS', () => {
  it('has all categories', () => {
    const categories = ['getting-started', 'governance', 'economy', 'community', 'technology', 'culture']
    categories.forEach(cat => {
      expect(LEARNING_PATH_CATEGORY_LABELS[cat as keyof typeof LEARNING_PATH_CATEGORY_LABELS]).toBeDefined()
    })
  })
})
