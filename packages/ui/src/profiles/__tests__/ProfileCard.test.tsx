// packages/ui/src/profiles/__tests__/ProfileCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileCard } from '../ProfileCard'
import type { Profile, CooperationPath } from '@togetheros/types/profiles'

const mockProfile: Profile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  emailVerified: true,
  name: 'Test User',
  username: 'testuser',
  bio: 'A passionate community organizer',
  avatarUrl: 'https://example.com/avatar.jpg',
  city: 'San Francisco',
  state: 'California',
  country: 'USA',
  timezone: 'America/Los_Angeles',
  paths: ['technology', 'community'],
  skills: ['JavaScript', 'Community Organizing'],
  canOffer: 'Web development and facilitation',
  seekingHelp: 'Learning about regenerative agriculture',
  onboardingStep: 'complete',
  createdAt: new Date('2025-01-15T00:00:00Z'),
  updatedAt: new Date('2025-01-20T00:00:00Z')
}

const mockPaths: CooperationPath[] = [
  {
    id: 'technology',
    name: 'Cooperative Technology',
    emoji: '💻',
    description: 'Open-source software and tech'
  },
  {
    id: 'community',
    name: 'Community Connection',
    emoji: '🤝',
    description: 'Local community building'
  }
]

describe('ProfileCard', () => {
  describe('default variant', () => {
    it('renders profile name', () => {
      render(<ProfileCard profile={mockProfile} paths={mockPaths} />)
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('renders username', () => {
      render(<ProfileCard profile={mockProfile} paths={mockPaths} />)
      expect(screen.getByText('@testuser')).toBeInTheDocument()
    })

    it('renders location', () => {
      render(<ProfileCard profile={mockProfile} paths={mockPaths} />)
      expect(screen.getByText('San Francisco, California, USA')).toBeInTheDocument()
    })

    it('renders bio', () => {
      render(<ProfileCard profile={mockProfile} paths={mockPaths} />)
      expect(screen.getByText('A passionate community organizer')).toBeInTheDocument()
    })

    it('renders cooperation paths', () => {
      render(<ProfileCard profile={mockProfile} paths={mockPaths} />)
      expect(screen.getByText(/💻 Cooperative Technology/)).toBeInTheDocument()
      expect(screen.getByText(/🤝 Community Connection/)).toBeInTheDocument()
    })

    it('renders skills', () => {
      render(<ProfileCard profile={mockProfile} paths={mockPaths} />)
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('Community Organizing')).toBeInTheDocument()
    })

    it('renders avatar image', () => {
      render(<ProfileCard profile={mockProfile} paths={mockPaths} />)
      const avatar = screen.getByAltText('Test User')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('calls onEdit when edit button clicked', async () => {
      const onEdit = vi.fn()
      render(<ProfileCard profile={mockProfile} paths={mockPaths} onEdit={onEdit} />)

      const editButton = screen.getByRole('button', { name: 'Edit Profile' })
      await userEvent.click(editButton)

      expect(onEdit).toHaveBeenCalledTimes(1)
    })

    it('does not render edit button when onEdit not provided', () => {
      render(<ProfileCard profile={mockProfile} paths={mockPaths} />)
      expect(screen.queryByRole('button', { name: 'Edit Profile' })).not.toBeInTheDocument()
    })
  })

  describe('compact variant', () => {
    it('renders in compact mode', () => {
      render(<ProfileCard profile={mockProfile} paths={mockPaths} variant="compact" />)
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('limits displayed paths to 3 in compact mode', () => {
      const profileWithManyPaths: Profile = {
        ...mockProfile,
        paths: ['technology', 'community', 'governance', 'economy']
      }

      const allPaths: CooperationPath[] = [
        ...mockPaths,
        {
          id: 'governance',
          name: 'Collective Governance',
          emoji: '🏛️',
          description: 'Democratic decision-making'
        },
        {
          id: 'economy',
          name: 'Social Economy',
          emoji: '💰',
          description: 'Cooperative economics'
        }
      ]

      render(<ProfileCard profile={profileWithManyPaths} paths={allPaths} variant="compact" />)
      expect(screen.getByText('+1 more')).toBeInTheDocument()
    })
  })

  describe('minimal profile', () => {
    it('renders anonymous user when no name', () => {
      const minimalProfile: Profile = {
        ...mockProfile,
        name: undefined,
        username: undefined,
        bio: undefined,
        city: undefined,
        state: undefined,
        country: undefined
      }

      render(<ProfileCard profile={minimalProfile} paths={mockPaths} />)
      expect(screen.getByText('Anonymous User')).toBeInTheDocument()
    })

    it('does not render location when no location fields', () => {
      const noLocationProfile: Profile = {
        ...mockProfile,
        city: undefined,
        state: undefined,
        country: undefined
      }

      render(<ProfileCard profile={noLocationProfile} paths={mockPaths} />)
      expect(screen.queryByText(/,/)).not.toBeInTheDocument()
    })
  })

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ProfileCard profile={mockProfile} paths={mockPaths} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
