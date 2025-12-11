/**
 * Tests for InMemoryBridgeTrainingRepo
 * Covers CRUD operations, filtering, rating, and approval workflow
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryBridgeTrainingRepo } from '../repos/InMemoryBridgeTrainingRepo'
import type { BridgeTrainingExample, CreateTrainingExampleInput } from '@togetheros/types'

describe('InMemoryBridgeTrainingRepo', () => {
  let repo: InMemoryBridgeTrainingRepo

  // Test data
  const testUserId = 'a0000000-0000-4000-a000-000000000001'
  const testUserId2 = 'a0000000-0000-4000-a000-000000000002'

  const createInput: CreateTrainingExampleInput = {
    question: 'How do I start a cooperative in my community?',
    contextPath: '/bridge',
    questionCategory: 'cooperation',
    bridgeResponse: 'Starting a cooperative involves several steps...',
    bridgeModel: 'gpt-4o-mini',
    bridgeTemperature: 0.7,
    bridgeSources: ['docs/guides/cooperative-formation.md'],
    bridgeResponseTimeMs: 1500,
  }

  beforeEach(() => {
    repo = new InMemoryBridgeTrainingRepo()
  })

  describe('create', () => {
    it('should create a new training example', async () => {
      const example = await repo.create(createInput, testUserId)

      expect(example.id).toBeDefined()
      expect(example.question).toBe(createInput.question)
      expect(example.bridgeResponse).toBe(createInput.bridgeResponse)
      expect(example.bridgeModel).toBe(createInput.bridgeModel)
      expect(example.trainingStatus).toBe('pending')
      expect(example.usedInTraining).toBe(false)
      expect(example.createdBy).toBe(testUserId)
      expect(example.createdAt).toBeInstanceOf(Date)
    })

    it('should generate unique IDs for each example', async () => {
      const example1 = await repo.create(createInput, testUserId)
      const example2 = await repo.create(createInput, testUserId)

      expect(example1.id).not.toBe(example2.id)
    })

    it('should preserve all input fields', async () => {
      const example = await repo.create(createInput, testUserId)

      expect(example.contextPath).toBe(createInput.contextPath)
      expect(example.questionCategory).toBe(createInput.questionCategory)
      expect(example.bridgeTemperature).toBe(createInput.bridgeTemperature)
      expect(example.bridgeSources).toEqual(createInput.bridgeSources)
      expect(example.bridgeResponseTimeMs).toBe(createInput.bridgeResponseTimeMs)
    })
  })

  describe('findById', () => {
    it('should find existing example by ID', async () => {
      const created = await repo.create(createInput, testUserId)
      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
      expect(found?.question).toBe(created.question)
    })

    it('should return null for non-existent ID', async () => {
      const found = await repo.findById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('update', () => {
    it('should update example fields', async () => {
      const created = await repo.create(createInput, testUserId)

      const updated = await repo.update({
        exampleId: created.id,
        question: 'Updated question text',
        bridgeResponse: 'Updated response',
      }, testUserId)

      expect(updated).not.toBeNull()
      expect(updated?.question).toBe('Updated question text')
      expect(updated?.bridgeResponse).toBe('Updated response')
    })

    it('should update ratings', async () => {
      const created = await repo.create(createInput, testUserId)

      const updated = await repo.update({
        exampleId: created.id,
        helpfulnessRating: 4,
        accuracyRating: 5,
        toneRating: 4,
      }, testUserId)

      expect(updated?.helpfulnessRating).toBe(4)
      expect(updated?.accuracyRating).toBe(5)
      expect(updated?.toneRating).toBe(4)
    })

    it('should return null for non-existent ID', async () => {
      const updated = await repo.update({
        exampleId: 'non-existent',
        question: 'test',
      }, testUserId)

      expect(updated).toBeNull()
    })

    it('should return null for soft-deleted examples', async () => {
      const created = await repo.create(createInput, testUserId)
      await repo.delete(created.id, testUserId)

      const updated = await repo.update({
        exampleId: created.id,
        question: 'Updated',
      }, testUserId)

      expect(updated).toBeNull()
    })
  })

  describe('list', () => {
    beforeEach(async () => {
      // Create multiple examples with different statuses
      const example1 = await repo.create(createInput, testUserId)
      await repo.approve(example1.id, testUserId)

      await repo.create({
        ...createInput,
        question: 'What is timebanking?',
        questionCategory: 'economy',
      }, testUserId)

      const example3 = await repo.create({
        ...createInput,
        question: 'How to organize events?',
        questionCategory: 'community',
      }, testUserId)
      await repo.reject(example3.id, testUserId, 'Low quality')
    })

    it('should list all non-deleted examples', async () => {
      const result = await repo.list()

      expect(result.total).toBe(3)
      expect(result.items.length).toBe(3)
    })

    it('should filter by status', async () => {
      const pending = await repo.list({ status: 'pending' })
      expect(pending.total).toBe(1)

      const approved = await repo.list({ status: 'approved' })
      expect(approved.total).toBe(1)

      const rejected = await repo.list({ status: 'rejected' })
      expect(rejected.total).toBe(1)
    })

    it('should filter by category', async () => {
      const result = await repo.list({ category: 'economy' })

      expect(result.total).toBe(1)
      expect(result.items[0].questionCategory).toBe('economy')
    })

    it('should filter by search query', async () => {
      const result = await repo.list({ searchQuery: 'timebanking' })

      expect(result.total).toBe(1)
      expect(result.items[0].question).toContain('timebanking')
    })

    it('should paginate results', async () => {
      const page1 = await repo.list({ page: 1, pageSize: 2 })
      expect(page1.items.length).toBe(2)
      expect(page1.totalPages).toBe(2)

      const page2 = await repo.list({ page: 2, pageSize: 2 })
      expect(page2.items.length).toBe(1)
    })

    it('should sort by createdAt descending by default', async () => {
      const result = await repo.list()

      for (let i = 0; i < result.items.length - 1; i++) {
        expect(result.items[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          result.items[i + 1].createdAt.getTime()
        )
      }
    })
  })

  describe('findSimilar', () => {
    beforeEach(async () => {
      // Create examples with different statuses and ideal responses
      const ex1 = await repo.create({
        ...createInput,
        question: 'How do I start a cooperative?',
      }, testUserId)
      await repo.provideIdealResponse({
        exampleId: ex1.id,
        idealResponse: 'The ideal way to start a cooperative is...',
      }, testUserId)

      const ex2 = await repo.create({
        ...createInput,
        question: 'What is a cooperative business model?',
      }, testUserId)
      await repo.provideIdealResponse({
        exampleId: ex2.id,
        idealResponse: 'A cooperative business model involves...',
      }, testUserId)

      // Pending example (should not be found)
      await repo.create({
        ...createInput,
        question: 'How to form a cooperative partnership?',
      }, testUserId)
    })

    it('should find similar reviewed examples', async () => {
      const similar = await repo.findSimilar('cooperative', { status: 'reviewed' })

      expect(similar.length).toBe(2)
      similar.forEach(ex => {
        expect(ex.trainingStatus).toBe('reviewed')
        expect(ex.idealResponse).toBeDefined()
      })
    })

    it('should respect limit parameter', async () => {
      const similar = await repo.findSimilar('cooperative', { status: 'reviewed', limit: 1 })
      expect(similar.length).toBe(1)
    })

    it('should only return examples with ideal responses', async () => {
      const similar = await repo.findSimilar('form cooperative', { status: 'pending' })
      expect(similar.length).toBe(0)
    })
  })

  describe('rateResponse', () => {
    it('should rate a response and calculate quality score', async () => {
      const created = await repo.create(createInput, testUserId)

      const rated = await repo.rateResponse({
        exampleId: created.id,
        helpfulnessRating: 4,
        accuracyRating: 5,
        toneRating: 5,
      }, testUserId)

      expect(rated?.helpfulnessRating).toBe(4)
      expect(rated?.accuracyRating).toBe(5)
      expect(rated?.toneRating).toBe(5)
      expect(rated?.trainingStatus).toBe('reviewed')
      // Quality score: (4 + 5 + 5) * 100 / 15 = 93.33 ≈ 93
      expect(rated?.qualityScore).toBe(93)
    })

    it('should update status to reviewed', async () => {
      const created = await repo.create(createInput, testUserId)
      expect(created.trainingStatus).toBe('pending')

      await repo.rateResponse({
        exampleId: created.id,
        helpfulnessRating: 3,
        accuracyRating: 3,
        toneRating: 3,
      }, testUserId)

      const found = await repo.findById(created.id)
      expect(found?.trainingStatus).toBe('reviewed')
    })
  })

  describe('provideIdealResponse', () => {
    it('should add ideal response to example', async () => {
      const created = await repo.create(createInput, testUserId)

      const updated = await repo.provideIdealResponse({
        exampleId: created.id,
        idealResponse: 'This is the ideal response...',
        idealSources: ['source1.md', 'source2.md'],
        idealKeywords: ['cooperative', 'community', 'formation'],
        reviewNotes: 'Good example for training',
      }, testUserId)

      expect(updated?.idealResponse).toBe('This is the ideal response...')
      expect(updated?.idealSources).toEqual(['source1.md', 'source2.md'])
      expect(updated?.idealKeywords).toEqual(['cooperative', 'community', 'formation'])
      expect(updated?.reviewNotes).toBe('Good example for training')
      expect(updated?.reviewedBy).toBe(testUserId)
      expect(updated?.reviewedAt).toBeInstanceOf(Date)
      expect(updated?.trainingStatus).toBe('reviewed')
    })
  })

  describe('approve', () => {
    it('should approve an example', async () => {
      const created = await repo.create(createInput, testUserId)

      const approved = await repo.approve(created.id, testUserId, 'Ready for training')

      expect(approved?.trainingStatus).toBe('approved')
      expect(approved?.reviewedBy).toBe(testUserId)
      expect(approved?.reviewedAt).toBeInstanceOf(Date)
      expect(approved?.reviewNotes).toBe('Ready for training')
    })

    it('should return null for non-existent example', async () => {
      const result = await repo.approve('non-existent', testUserId)
      expect(result).toBeNull()
    })
  })

  describe('reject', () => {
    it('should reject an example with notes', async () => {
      const created = await repo.create(createInput, testUserId)

      const rejected = await repo.reject(created.id, testUserId, 'Response quality too low')

      expect(rejected?.trainingStatus).toBe('rejected')
      expect(rejected?.reviewedBy).toBe(testUserId)
      expect(rejected?.reviewNotes).toBe('Response quality too low')
    })
  })

  describe('getStatistics', () => {
    beforeEach(async () => {
      // Create examples with various states
      const ex1 = await repo.create({ ...createInput, questionCategory: 'cooperation' }, testUserId)
      await repo.approve(ex1.id, testUserId)

      const ex2 = await repo.create({ ...createInput, questionCategory: 'cooperation' }, testUserId)
      await repo.rateResponse({
        exampleId: ex2.id,
        helpfulnessRating: 4,
        accuracyRating: 4,
        toneRating: 4,
      }, testUserId)

      await repo.create({ ...createInput, questionCategory: 'economy' }, testUserId)

      const ex4 = await repo.create({ ...createInput, questionCategory: 'economy' }, testUserId)
      await repo.reject(ex4.id, testUserId, 'Poor quality')
    })

    it('should return correct counts by status', async () => {
      const stats = await repo.getStatistics()

      expect(stats.totalExamples).toBe(4)
      expect(stats.pendingReview).toBe(1)
      expect(stats.approved).toBe(1)
      expect(stats.rejected).toBe(1)
    })

    it('should calculate average quality score', async () => {
      const stats = await repo.getStatistics()

      // Only one example has a quality score (80)
      expect(stats.averageQuality).toBe(80)
    })

    it('should count by category', async () => {
      const stats = await repo.getStatistics()

      expect(stats.categoryCounts['cooperation']).toBe(2)
      expect(stats.categoryCounts['economy']).toBe(2)
    })
  })

  describe('delete', () => {
    it('should soft delete an example', async () => {
      const created = await repo.create(createInput, testUserId)
      await repo.delete(created.id, testUserId)

      // Should not be found in list
      const list = await repo.list()
      expect(list.items.find(e => e.id === created.id)).toBeUndefined()

      // But findById still finds it with deletedAt set
      const found = await repo.findById(created.id)
      expect(found?.deletedAt).toBeInstanceOf(Date)
      expect(found?.deletedBy).toBe(testUserId)
    })
  })

  describe('initialization with fixtures', () => {
    it('should initialize with provided examples', async () => {
      const fixtureExample: BridgeTrainingExample = {
        id: 'fixture-1',
        question: 'Fixture question',
        bridgeResponse: 'Fixture response',
        bridgeModel: 'gpt-4o-mini',
        bridgeTemperature: 0.7,
        trainingStatus: 'approved',
        usedInTraining: false,
        createdBy: testUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const repoWithFixtures = new InMemoryBridgeTrainingRepo([fixtureExample])
      const found = await repoWithFixtures.findById('fixture-1')

      expect(found).not.toBeNull()
      expect(found?.question).toBe('Fixture question')
    })
  })
})
