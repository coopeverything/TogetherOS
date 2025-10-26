// packages/types/__tests__/rewards.test.ts
// TogetherOS Rewards Module - Entity Validation Tests

import { describe, it, expect } from 'vitest'
import {
  createRewardEventSchema,
  rewardEventSchema,
  memberRewardBalanceSchema,
  badgeSchema,
  memberBadgeSchema,
  isValidEventType,
  getSPWeight,
  calculatePRSize,
  generateDedupKey,
} from '@togetheros/validators/rewards'

describe('createRewardEventSchema', () => {
  describe('valid inputs', () => {
    it('accepts valid PR merge event', () => {
      const input = {
        memberId: '550e8400-e29b-41d4-a716-446655440000',
        event_type: 'pr_merged_small',
        context: {
          pr_number: 123,
          repo: 'TogetherOS',
          lines_changed: 42,
        },
        source: 'github',
      }
      
      const result = createRewardEventSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('accepts valid docs contribution event', () => {
      const input = {
        memberId: '550e8400-e29b-41d4-a716-446655440001',
        event_type: 'docs_contribution',
        context: {
          pr_number: 456,
          repo: 'TogetherOS',
        },
        source: 'github',
        timestamp: new Date('2025-01-25T10:00:00Z'),
      }
      
      const result = createRewardEventSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('accepts minimal valid event', () => {
      const input = {
        memberId: '550e8400-e29b-41d4-a716-446655440002',
        event_type: 'code_review',
        context: {},
        source: 'manual',
      }
      
      const result = createRewardEventSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  describe('validation errors', () => {
    it('rejects invalid member ID', () => {
      const input = {
        memberId: 'not-a-uuid',
        event_type: 'pr_merged_small',
        context: {},
        source: 'github',
      }
      
      const result = createRewardEventSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('UUID')
      }
    })

    it('rejects invalid event type', () => {
      const input = {
        memberId: '550e8400-e29b-41d4-a716-446655440000',
        event_type: 'invalid_type',
        context: {},
        source: 'github',
      }
      
      const result = createRewardEventSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects empty source', () => {
      const input = {
        memberId: '550e8400-e29b-41d4-a716-446655440000',
        event_type: 'pr_merged_small',
        context: {},
        source: '',
      }
      
      const result = createRewardEventSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects negative PR number', () => {
      const input = {
        memberId: '550e8400-e29b-41d4-a716-446655440000',
        event_type: 'pr_merged_small',
        context: { pr_number: -1 },
        source: 'github',
      }
      
      const result = createRewardEventSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects negative lines changed', () => {
      const input = {
        memberId: '550e8400-e29b-41d4-a716-446655440000',
        event_type: 'pr_merged_small',
        context: { lines_changed: -10 },
        source: 'github',
      }
      
      const result = createRewardEventSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })
})

describe('rewardEventSchema', () => {
  it('accepts complete reward event', () => {
    const event = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      memberId: '550e8400-e29b-41d4-a716-446655440001',
      event_type: 'pr_merged_medium',
      sp_weight: 10,
      context: {
        pr_number: 123,
        repo: 'TogetherOS',
        lines_changed: 150,
      },
      source: 'github',
      dedup_key: 'github::pr:123::repo:TogetherOS',
      timestamp: new Date(),
      status: 'processed',
      processedAt: new Date(),
    }
    
    const result = rewardEventSchema.safeParse(event)
    expect(result.success).toBe(true)
  })

  it('rejects invalid SP weight', () => {
    const event = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      memberId: '550e8400-e29b-41d4-a716-446655440001',
      event_type: 'pr_merged_medium',
      sp_weight: 0, // Must be positive
      context: {},
      source: 'github',
      dedup_key: 'test',
      timestamp: new Date(),
      status: 'processed',
    }
    
    const result = rewardEventSchema.safeParse(event)
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const event = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      memberId: '550e8400-e29b-41d4-a716-446655440001',
      event_type: 'pr_merged_medium',
      sp_weight: 10,
      context: {},
      source: 'github',
      dedup_key: 'test',
      timestamp: new Date(),
      status: 'invalid_status',
    }
    
    const result = rewardEventSchema.safeParse(event)
    expect(result.success).toBe(false)
  })
})

describe('memberRewardBalanceSchema', () => {
  it('accepts valid balance', () => {
    const balance = {
      memberId: '550e8400-e29b-41d4-a716-446655440000',
      total: 100,
      available: 70,
      allocated: 30,
      updatedAt: new Date(),
    }
    
    const result = memberRewardBalanceSchema.safeParse(balance)
    expect(result.success).toBe(true)
  })

  it('rejects mismatched totals', () => {
    const balance = {
      memberId: '550e8400-e29b-41d4-a716-446655440000',
      total: 100,
      available: 70,
      allocated: 20, // Should be 30
      updatedAt: new Date(),
    }
    
    const result = memberRewardBalanceSchema.safeParse(balance)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('available + allocated')
    }
  })

  it('rejects negative values', () => {
    const balance = {
      memberId: '550e8400-e29b-41d4-a716-446655440000',
      total: 100,
      available: -10,
      allocated: 110,
      updatedAt: new Date(),
    }
    
    const result = memberRewardBalanceSchema.safeParse(balance)
    expect(result.success).toBe(false)
  })
})

describe('badgeSchema', () => {
  it('accepts valid badge', () => {
    const badge = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'First PR',
      description: 'Merged your first pull request',
      icon: '🎉',
      criteria: 'Merge at least one pull request',
      category: 'milestone',
    }
    
    const result = badgeSchema.safeParse(badge)
    expect(result.success).toBe(true)
  })

  it('rejects invalid category', () => {
    const badge = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'First PR',
      description: 'Merged your first pull request',
      icon: '🎉',
      criteria: 'Merge at least one pull request',
      category: 'invalid',
    }
    
    const result = badgeSchema.safeParse(badge)
    expect(result.success).toBe(false)
  })

  it('rejects short name', () => {
    const badge = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'AB', // Too short
      description: 'Merged your first pull request',
      icon: '🎉',
      criteria: 'Merge at least one pull request',
      category: 'milestone',
    }
    
    const result = badgeSchema.safeParse(badge)
    expect(result.success).toBe(false)
  })
})

describe('helper functions', () => {
  describe('isValidEventType', () => {
    it('returns true for valid types', () => {
      expect(isValidEventType('pr_merged_small')).toBe(true)
      expect(isValidEventType('docs_contribution')).toBe(true)
      expect(isValidEventType('bug_fix')).toBe(true)
    })

    it('returns false for invalid types', () => {
      expect(isValidEventType('invalid_type')).toBe(false)
      expect(isValidEventType('')).toBe(false)
      expect(isValidEventType('pr_merged')).toBe(false)
    })
  })

  describe('getSPWeight', () => {
    it('returns correct weights', () => {
      expect(getSPWeight('pr_merged_small')).toBe(5)
      expect(getSPWeight('pr_merged_medium')).toBe(10)
      expect(getSPWeight('pr_merged_large')).toBe(20)
      expect(getSPWeight('docs_contribution')).toBe(8)
      expect(getSPWeight('code_review')).toBe(3)
      expect(getSPWeight('issue_triage')).toBe(2)
      expect(getSPWeight('bug_fix')).toBe(15)
    })
  })

  describe('calculatePRSize', () => {
    it('returns small for < 50 lines', () => {
      expect(calculatePRSize(0)).toBe('small')
      expect(calculatePRSize(25)).toBe('small')
      expect(calculatePRSize(49)).toBe('small')
    })

    it('returns medium for 50-199 lines', () => {
      expect(calculatePRSize(50)).toBe('medium')
      expect(calculatePRSize(100)).toBe('medium')
      expect(calculatePRSize(199)).toBe('medium')
    })

    it('returns large for >= 200 lines', () => {
      expect(calculatePRSize(200)).toBe('large')
      expect(calculatePRSize(500)).toBe('large')
      expect(calculatePRSize(1000)).toBe('large')
    })
  })

  describe('generateDedupKey', () => {
    it('generates key from PR context', () => {
      const key = generateDedupKey('github', {
        pr_number: 123,
        repo: 'TogetherOS',
      })
      expect(key).toBe('github::pr:123::repo:TogetherOS')
    })

    it('generates key from issue context', () => {
      const key = generateDedupKey('github', {
        issue_number: 456,
        repo: 'TogetherOS',
      })
      expect(key).toBe('github::issue:456::repo:TogetherOS')
    })

    it('generates key from source only', () => {
      const key = generateDedupKey('manual', {})
      expect(key).toBe('manual')
    })

    it('generates consistent keys', () => {
      const key1 = generateDedupKey('github', {
        pr_number: 123,
        repo: 'TogetherOS',
      })
      const key2 = generateDedupKey('github', {
        pr_number: 123,
        repo: 'TogetherOS',
      })
      expect(key1).toBe(key2)
    })
  })
})
