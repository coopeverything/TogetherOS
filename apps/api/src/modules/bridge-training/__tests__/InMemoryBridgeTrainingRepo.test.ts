/**
 * InMemoryBridgeTrainingRepo Tests
 *
 * Tests for the in-memory repository for Bridge training examples
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  BridgeTrainingExample,
  BridgeTrainingBatch,
  BridgeTrainingFeedback,
  BridgeTrainingSession,
  BridgeSource,
  CreateTrainingExampleInput,
  TrainingExampleFilters,
} from '@togetheros/types';

// Helper to create mock BridgeSource
function createMockSource(overrides: Partial<BridgeSource> = {}): BridgeSource {
  return {
    path: '/docs/guide',
    title: 'User Guide',
    url: 'https://example.com/docs/guide',
    ...overrides,
  };
}

// Helper to create mock training example
function createMockExample(overrides: Partial<BridgeTrainingExample> = {}): BridgeTrainingExample {
  const now = new Date();
  return {
    id: `example-${Math.random().toString(36).substr(2, 9)}`,
    question: 'How do I create a proposal?',
    contextPath: '/governance',
    questionCategory: 'governance',
    bridgeResponse: 'To create a proposal, navigate to the Governance section...',
    bridgeModel: 'claude-3-5-sonnet',
    bridgeTemperature: 0.7,
    bridgeSources: [createMockSource()],
    bridgeResponseTimeMs: 1500,
    trainingStatus: 'pending',
    usedInTraining: false,
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// Helper to create mock training batch
function createMockBatch(overrides: Partial<BridgeTrainingBatch> = {}): BridgeTrainingBatch {
  const now = new Date();
  return {
    id: `batch-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Governance Q&A Batch',
    description: 'Training examples for governance module',
    trainingType: 'rag_enhancement',
    config: { maxExamples: 100 },
    exampleCount: 0,
    status: 'draft',
    createdBy: 'admin-1',
    createdAt: now,
    ...overrides,
  };
}

// Helper to create mock feedback
function createMockFeedback(overrides: Partial<BridgeTrainingFeedback> = {}): BridgeTrainingFeedback {
  return {
    id: `feedback-${Math.random().toString(36).substr(2, 9)}`,
    exampleId: 'example-1',
    feedbackType: 'helpful',
    feedbackText: 'This response was very clear',
    submittedBy: 'user-1',
    submittedAt: new Date(),
    ...overrides,
  };
}

// Helper to create mock session
function createMockSession(overrides: Partial<BridgeTrainingSession> = {}): BridgeTrainingSession {
  return {
    id: `session-${Math.random().toString(36).substr(2, 9)}`,
    adminId: 'admin-1',
    sessionStart: new Date(),
    examplesCreated: 0,
    examplesApproved: 0,
    examplesRejected: 0,
    ...overrides,
  };
}

// Simple in-memory repo implementation for testing
class InMemoryBridgeTrainingRepo {
  private examples: Map<string, BridgeTrainingExample> = new Map();
  private batches: Map<string, BridgeTrainingBatch> = new Map();
  private feedback: Map<string, BridgeTrainingFeedback> = new Map();
  private sessions: Map<string, BridgeTrainingSession> = new Map();

  // Example operations
  async createExample(input: CreateTrainingExampleInput, createdBy: string): Promise<BridgeTrainingExample> {
    const now = new Date();
    const example: BridgeTrainingExample = {
      id: `example-${this.examples.size + 1}`,
      ...input,
      trainingStatus: 'pending',
      usedInTraining: false,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.examples.set(example.id, example);
    return example;
  }

  async getExampleById(id: string): Promise<BridgeTrainingExample | null> {
    return this.examples.get(id) ?? null;
  }

  async updateExample(id: string, updates: Partial<BridgeTrainingExample>): Promise<BridgeTrainingExample | null> {
    const example = this.examples.get(id);
    if (!example) return null;

    const updated = { ...example, ...updates, updatedAt: new Date() };
    this.examples.set(id, updated);
    return updated;
  }

  async deleteExample(id: string): Promise<boolean> {
    return this.examples.delete(id);
  }

  async listExamples(filters: TrainingExampleFilters = {}): Promise<BridgeTrainingExample[]> {
    let results = Array.from(this.examples.values());

    if (filters.status) {
      results = results.filter(e => e.trainingStatus === filters.status);
    }

    if (filters.category) {
      results = results.filter(e => e.questionCategory === filters.category);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(e =>
        e.question.toLowerCase().includes(query) ||
        e.bridgeResponse.toLowerCase().includes(query)
      );
    }

    if (filters.minQualityScore !== undefined) {
      results = results.filter(e => (e.qualityScore ?? 0) >= filters.minQualityScore!);
    }

    // Sorting
    if (filters.sortBy) {
      results.sort((a, b) => {
        const aVal = a[filters.sortBy!];
        const bVal = b[filters.sortBy!];
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;
        if (aVal < bVal) return filters.sortOrder === 'desc' ? 1 : -1;
        if (aVal > bVal) return filters.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // Pagination
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }

  async countExamples(filters: TrainingExampleFilters = {}): Promise<number> {
    const results = await this.listExamples({ ...filters, page: 1, pageSize: 10000 });
    return results.length;
  }

  // Batch operations
  async createBatch(batch: BridgeTrainingBatch): Promise<BridgeTrainingBatch> {
    this.batches.set(batch.id, batch);
    return batch;
  }

  async getBatchById(id: string): Promise<BridgeTrainingBatch | null> {
    return this.batches.get(id) ?? null;
  }

  async updateBatch(id: string, updates: Partial<BridgeTrainingBatch>): Promise<BridgeTrainingBatch | null> {
    const batch = this.batches.get(id);
    if (!batch) return null;

    const updated = { ...batch, ...updates };
    this.batches.set(id, updated);
    return updated;
  }

  // Feedback operations
  async addFeedback(feedback: BridgeTrainingFeedback): Promise<BridgeTrainingFeedback> {
    this.feedback.set(feedback.id, feedback);
    return feedback;
  }

  async getFeedbackForExample(exampleId: string): Promise<BridgeTrainingFeedback[]> {
    return Array.from(this.feedback.values()).filter(f => f.exampleId === exampleId);
  }

  // Session operations
  async createSession(session: BridgeTrainingSession): Promise<BridgeTrainingSession> {
    this.sessions.set(session.id, session);
    return session;
  }

  async getSessionById(id: string): Promise<BridgeTrainingSession | null> {
    return this.sessions.get(id) ?? null;
  }

  async updateSession(id: string, updates: Partial<BridgeTrainingSession>): Promise<BridgeTrainingSession | null> {
    const session = this.sessions.get(id);
    if (!session) return null;

    const updated = { ...session, ...updates };
    this.sessions.set(id, updated);
    return updated;
  }

  // Utility
  clear(): void {
    this.examples.clear();
    this.batches.clear();
    this.feedback.clear();
    this.sessions.clear();
  }
}

describe('InMemoryBridgeTrainingRepo', () => {
  let repo: InMemoryBridgeTrainingRepo;

  beforeEach(() => {
    repo = new InMemoryBridgeTrainingRepo();
  });

  describe('Example CRUD', () => {
    it('should create a training example', async () => {
      const input: CreateTrainingExampleInput = {
        question: 'How do I vote on a proposal?',
        contextPath: '/governance',
        questionCategory: 'governance',
        bridgeResponse: 'To vote on a proposal, click the Vote button...',
        bridgeModel: 'claude-3-5-sonnet',
        bridgeTemperature: 0.7,
        bridgeSources: [createMockSource()],
        bridgeResponseTimeMs: 1200,
      };

      const example = await repo.createExample(input, 'admin-1');

      expect(example.id).toBeDefined();
      expect(example.question).toBe(input.question);
      expect(example.bridgeResponse).toBe(input.bridgeResponse);
      expect(example.trainingStatus).toBe('pending');
      expect(example.usedInTraining).toBe(false);
      expect(example.createdBy).toBe('admin-1');
    });

    it('should retrieve example by id', async () => {
      const input: CreateTrainingExampleInput = {
        question: 'Test question',
        bridgeResponse: 'Test response',
        bridgeModel: 'claude-3-5-sonnet',
      };

      const created = await repo.createExample(input, 'admin-1');
      const retrieved = await repo.getExampleById(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.question).toBe(input.question);
    });

    it('should return null for non-existent example', async () => {
      const result = await repo.getExampleById('non-existent');
      expect(result).toBeNull();
    });

    it('should update example', async () => {
      const input: CreateTrainingExampleInput = {
        question: 'Original question',
        bridgeResponse: 'Original response',
        bridgeModel: 'claude-3-5-sonnet',
      };

      const created = await repo.createExample(input, 'admin-1');
      const updated = await repo.updateExample(created.id, {
        helpfulnessRating: 5,
        accuracyRating: 4,
        toneRating: 5,
        trainingStatus: 'reviewed',
      });

      expect(updated).not.toBeNull();
      expect(updated!.helpfulnessRating).toBe(5);
      expect(updated!.accuracyRating).toBe(4);
      expect(updated!.trainingStatus).toBe('reviewed');
    });

    it('should delete example', async () => {
      const input: CreateTrainingExampleInput = {
        question: 'To be deleted',
        bridgeResponse: 'Response',
        bridgeModel: 'claude-3-5-sonnet',
      };

      const created = await repo.createExample(input, 'admin-1');
      const deleted = await repo.deleteExample(created.id);

      expect(deleted).toBe(true);

      const retrieved = await repo.getExampleById(created.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Example Filtering', () => {
    beforeEach(async () => {
      // Create test examples
      await repo.createExample({
        question: 'Governance question 1',
        bridgeResponse: 'Response 1',
        bridgeModel: 'claude-3-5-sonnet',
        questionCategory: 'governance',
      }, 'admin-1');

      await repo.createExample({
        question: 'Governance question 2',
        bridgeResponse: 'Response 2',
        bridgeModel: 'claude-3-5-sonnet',
        questionCategory: 'governance',
      }, 'admin-1');

      await repo.createExample({
        question: 'Groups question',
        bridgeResponse: 'Response 3',
        bridgeModel: 'claude-3-5-sonnet',
        questionCategory: 'groups',
      }, 'admin-2');
    });

    it('should filter by category', async () => {
      const results = await repo.listExamples({ category: 'governance' });
      expect(results).toHaveLength(2);
      expect(results.every(e => e.questionCategory === 'governance')).toBe(true);
    });

    it('should filter by search query', async () => {
      const results = await repo.listExamples({ searchQuery: 'Groups' });
      expect(results).toHaveLength(1);
      expect(results[0].questionCategory).toBe('groups');
    });

    it('should paginate results', async () => {
      const page1 = await repo.listExamples({ page: 1, pageSize: 2 });
      const page2 = await repo.listExamples({ page: 2, pageSize: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(1);
    });

    it('should count examples with filters', async () => {
      const total = await repo.countExamples({});
      const governanceCount = await repo.countExamples({ category: 'governance' });

      expect(total).toBe(3);
      expect(governanceCount).toBe(2);
    });
  });

  describe('Batch Operations', () => {
    it('should create a training batch', async () => {
      const batch = createMockBatch();
      const created = await repo.createBatch(batch);

      expect(created.id).toBe(batch.id);
      expect(created.name).toBe(batch.name);
      expect(created.status).toBe('draft');
    });

    it('should retrieve batch by id', async () => {
      const batch = createMockBatch();
      await repo.createBatch(batch);

      const retrieved = await repo.getBatchById(batch.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.name).toBe(batch.name);
    });

    it('should update batch status', async () => {
      const batch = createMockBatch();
      await repo.createBatch(batch);

      const updated = await repo.updateBatch(batch.id, {
        status: 'ready',
        exampleCount: 50,
      });

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('ready');
      expect(updated!.exampleCount).toBe(50);
    });

    it('should track batch lifecycle', async () => {
      const batch = createMockBatch({ status: 'draft' });
      await repo.createBatch(batch);

      // Move to ready
      await repo.updateBatch(batch.id, { status: 'ready' });

      // Start training
      await repo.updateBatch(batch.id, {
        status: 'training',
        startedAt: new Date(),
      });

      // Complete training
      const completed = await repo.updateBatch(batch.id, {
        status: 'completed',
        completedAt: new Date(),
        modelArtifactUrl: 'https://storage.example.com/models/batch-123',
      });

      expect(completed!.status).toBe('completed');
      expect(completed!.modelArtifactUrl).toBeDefined();
    });
  });

  describe('Feedback Operations', () => {
    it('should add feedback for example', async () => {
      const feedback = createMockFeedback({ exampleId: 'example-1' });
      const created = await repo.addFeedback(feedback);

      expect(created.id).toBe(feedback.id);
      expect(created.feedbackType).toBe('helpful');
    });

    it('should retrieve feedback for example', async () => {
      await repo.addFeedback(createMockFeedback({ exampleId: 'example-1', feedbackType: 'helpful' }));
      await repo.addFeedback(createMockFeedback({ exampleId: 'example-1', feedbackType: 'incomplete' }));
      await repo.addFeedback(createMockFeedback({ exampleId: 'example-2', feedbackType: 'incorrect' }));

      const feedbackForExample1 = await repo.getFeedbackForExample('example-1');
      expect(feedbackForExample1).toHaveLength(2);
    });

    it('should support different feedback types', async () => {
      const feedbackTypes: Array<'helpful' | 'incorrect' | 'incomplete' | 'tone_issue'> = [
        'helpful', 'incorrect', 'incomplete', 'tone_issue'
      ];

      for (const type of feedbackTypes) {
        const feedback = createMockFeedback({ exampleId: 'example-1', feedbackType: type });
        const created = await repo.addFeedback(feedback);
        expect(created.feedbackType).toBe(type);
      }
    });
  });

  describe('Session Operations', () => {
    it('should create training session', async () => {
      const session = createMockSession();
      const created = await repo.createSession(session);

      expect(created.id).toBe(session.id);
      expect(created.adminId).toBe(session.adminId);
    });

    it('should retrieve session by id', async () => {
      const session = createMockSession();
      await repo.createSession(session);

      const retrieved = await repo.getSessionById(session.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.adminId).toBe(session.adminId);
    });

    it('should update session metrics', async () => {
      const session = createMockSession();
      await repo.createSession(session);

      const updated = await repo.updateSession(session.id, {
        examplesCreated: 10,
        examplesApproved: 8,
        examplesRejected: 2,
        sessionEnd: new Date(),
      });

      expect(updated).not.toBeNull();
      expect(updated!.examplesCreated).toBe(10);
      expect(updated!.examplesApproved).toBe(8);
      expect(updated!.examplesRejected).toBe(2);
      expect(updated!.sessionEnd).toBeDefined();
    });
  });

  describe('BridgeSource Type', () => {
    it('should properly type BridgeSource objects', () => {
      const source: BridgeSource = {
        path: '/docs/governance/proposals',
        title: 'Proposal Creation Guide',
        url: 'https://togetheros.com/docs/governance/proposals',
      };

      expect(source.path).toBe('/docs/governance/proposals');
      expect(source.title).toBe('Proposal Creation Guide');
      expect(source.url).toBe('https://togetheros.com/docs/governance/proposals');
    });

    it('should handle multiple sources in example', async () => {
      const sources: BridgeSource[] = [
        { path: '/docs/guide1', title: 'Guide 1', url: 'https://example.com/1' },
        { path: '/docs/guide2', title: 'Guide 2', url: 'https://example.com/2' },
      ];

      const input: CreateTrainingExampleInput = {
        question: 'Multi-source question',
        bridgeResponse: 'Response with multiple sources',
        bridgeModel: 'claude-3-5-sonnet',
        bridgeSources: sources,
      };

      const example = await repo.createExample(input, 'admin-1');

      expect(example.bridgeSources).toHaveLength(2);
      expect(example.bridgeSources![0].path).toBe('/docs/guide1');
      expect(example.bridgeSources![1].path).toBe('/docs/guide2');
    });
  });

  describe('Quality Score Filtering', () => {
    beforeEach(async () => {
      const example1 = await repo.createExample({
        question: 'High quality question',
        bridgeResponse: 'Response',
        bridgeModel: 'claude-3-5-sonnet',
      }, 'admin-1');
      await repo.updateExample(example1.id, { qualityScore: 90 });

      const example2 = await repo.createExample({
        question: 'Medium quality question',
        bridgeResponse: 'Response',
        bridgeModel: 'claude-3-5-sonnet',
      }, 'admin-1');
      await repo.updateExample(example2.id, { qualityScore: 60 });

      const example3 = await repo.createExample({
        question: 'Low quality question',
        bridgeResponse: 'Response',
        bridgeModel: 'claude-3-5-sonnet',
      }, 'admin-1');
      await repo.updateExample(example3.id, { qualityScore: 30 });
    });

    it('should filter by minimum quality score', async () => {
      const highQuality = await repo.listExamples({ minQualityScore: 80 });
      expect(highQuality).toHaveLength(1);
      expect(highQuality[0].qualityScore).toBe(90);

      const mediumPlus = await repo.listExamples({ minQualityScore: 50 });
      expect(mediumPlus).toHaveLength(2);
    });
  });
});
