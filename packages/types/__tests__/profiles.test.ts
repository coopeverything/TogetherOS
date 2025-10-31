// packages/types/__tests__/profiles.test.ts
// TogetherOS Profiles Module - Entity Validation Tests

import { describe, it, expect } from 'vitest'
import {
  profileUpdateSchema,
  skillsArraySchema,
  emailSchema,
  cooperationPathIdSchema,
  validateProfileUpdate,
  validateSkills,
  validatePaths
} from '@togetheros/validators/profiles'
import type { Profile, CooperationPathId } from '@togetheros/types/profiles'

// Test fixtures
export const mockProfile: Profile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  emailVerified: true,
  name: 'Test User',
  username: 'testuser',
  bio: 'A passionate community organizer and developer',
  avatarUrl: 'https://example.com/avatar.jpg',
  city: 'San Francisco',
  state: 'California',
  country: 'USA',
  timezone: 'America/Los_Angeles',
  paths: ['technology', 'community', 'governance'],
  skills: ['JavaScript', 'Community Organizing', 'Facilitation'],
  canOffer: 'Web development, technical mentorship, and facilitation skills',
  seekingHelp: 'Learning about regenerative agriculture and cooperative economics',
  onboardingStep: 'complete',
  onboardingCompletedAt: new Date('2025-01-20T00:00:00Z'),
  createdAt: new Date('2025-01-15T00:00:00Z'),
  updatedAt: new Date('2025-01-20T00:00:00Z')
}

export const mockMinimalProfile: Profile = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'minimal@example.com',
  emailVerified: false,
  paths: [],
  skills: [],
  onboardingStep: 'welcome',
  createdAt: new Date('2025-01-25T00:00:00Z'),
  updatedAt: new Date('2025-01-25T00:00:00Z')
}

describe('profileUpdateSchema', () => {
  describe('valid inputs', () => {
    it('accepts valid profile update with all fields', () => {
      const input = {
        name: 'Jane Doe',
        username: 'janedoe',
        bio: 'Developer and community organizer',
        avatarUrl: 'https://example.com/jane.jpg',
        city: 'Portland',
        state: 'Oregon',
        country: 'USA',
        timezone: 'America/Los_Angeles',
        paths: ['technology', 'community'] as CooperationPathId[],
        skills: ['React', 'Node.js', 'Facilitation'],
        canOffer: 'Full-stack development and workshop facilitation',
        seekingHelp: 'Learning about decentralized governance'
      }

      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('accepts partial profile update', () => {
      const input = {
        name: 'John Smith',
        bio: 'Just joined the community'
      }

      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('accepts empty string for optional URL field', () => {
      const input = {
        avatarUrl: ''
      }

      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('rejects name that is too short', () => {
      const input = { name: 'A' }
      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects name that is too long', () => {
      const input = { name: 'A'.repeat(101) }
      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects invalid username format', () => {
      const input = { username: 'user name' } // spaces not allowed
      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects username that is too short', () => {
      const input = { username: 'ab' }
      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects bio that is too long', () => {
      const input = { bio: 'A'.repeat(501) }
      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects invalid avatar URL', () => {
      const input = { avatarUrl: 'not-a-url' }
      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects too many paths', () => {
      const input = {
        paths: ['education', 'economy', 'wellbeing', 'technology', 'governance', 'community', 'media', 'planet', 'extra'] as any
      }
      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects too many skills', () => {
      const input = {
        skills: Array(21).fill('skill')
      }
      const result = profileUpdateSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })
})

describe('skillsArraySchema', () => {
  it('accepts valid skills array', () => {
    const skills = ['JavaScript', 'React', 'Node.js']
    const result = skillsArraySchema.safeParse(skills)
    expect(result.success).toBe(true)
  })

  it('rejects empty skill string', () => {
    const skills = ['JavaScript', '', 'React']
    const result = skillsArraySchema.safeParse(skills)
    expect(result.success).toBe(false)
  })

  it('rejects skill that is too long', () => {
    const skills = ['A'.repeat(51)]
    const result = skillsArraySchema.safeParse(skills)
    expect(result.success).toBe(false)
  })

  it('rejects more than 20 skills', () => {
    const skills = Array(21).fill('skill')
    const result = skillsArraySchema.safeParse(skills)
    expect(result.success).toBe(false)
  })
})

describe('cooperationPathIdSchema', () => {
  it('accepts all valid path IDs', () => {
    const validPaths: CooperationPathId[] = [
      'education',
      'economy',
      'wellbeing',
      'technology',
      'governance',
      'community',
      'media',
      'planet'
    ]

    validPaths.forEach(path => {
      const result = cooperationPathIdSchema.safeParse(path)
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid path ID', () => {
    const result = cooperationPathIdSchema.safeParse('invalid-path')
    expect(result.success).toBe(false)
  })
})

describe('emailSchema', () => {
  it('accepts valid email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user+tag@domain.co.uk',
      'name.surname@company.org'
    ]

    validEmails.forEach(email => {
      const result = emailSchema.safeParse(email)
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid email formats', () => {
    const invalidEmails = [
      'not-an-email',
      '@example.com',
      'user@',
      'user@domain',
      ''
    ]

    invalidEmails.forEach(email => {
      const result = emailSchema.safeParse(email)
      expect(result.success).toBe(false)
    })
  })

  it('rejects email that is too long', () => {
    const email = 'a'.repeat(246) + '@example.com' // 256 chars total
    const result = emailSchema.safeParse(email)
    expect(result.success).toBe(false)
  })
})

describe('helper functions', () => {
  describe('validateProfileUpdate', () => {
    it('validates and returns parsed data', () => {
      const input = {
        name: 'Test User',
        bio: 'A test bio'
      }

      const result = validateProfileUpdate(input)
      expect(result).toEqual(input)
    })

    it('throws on invalid input', () => {
      const input = {
        name: 'A' // too short
      }

      expect(() => validateProfileUpdate(input)).toThrow()
    })
  })

  describe('validateSkills', () => {
    it('validates and returns parsed skills array', () => {
      const skills = ['JavaScript', 'React']
      const result = validateSkills(skills)
      expect(result).toEqual(skills)
    })

    it('throws on invalid skills', () => {
      const skills = [''] // empty skill
      expect(() => validateSkills(skills)).toThrow()
    })
  })

  describe('validatePaths', () => {
    it('validates and returns parsed paths array', () => {
      const paths: CooperationPathId[] = ['technology', 'community']
      const result = validatePaths(paths)
      expect(result).toEqual(paths)
    })

    it('throws on invalid path', () => {
      const paths = ['invalid-path']
      expect(() => validatePaths(paths as any)).toThrow()
    })
  })
})
