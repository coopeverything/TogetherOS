import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  describe('rendering', () => {
    it('renders with default variant and size', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
    })

    it('renders with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button', { name: 'Secondary' })
      expect(button).toBeInTheDocument()
    })

    it('renders with different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(<Button size="icon">Icon</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders disabled button', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button', { name: 'Disabled' })
      expect(button).toBeDisabled()
    })
  })

  describe('interaction', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button', { name: 'Click me' })

      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick} disabled>Click me</Button>)
      const button = screen.getByRole('button', { name: 'Click me' })

      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('variants', () => {
    it('renders all variant types', () => {
      const variants = ['default', 'secondary', 'ghost', 'link', 'joy', 'danger'] as const

      variants.forEach((variant) => {
        const { unmount } = render(<Button variant={variant}>{variant}</Button>)
        expect(screen.getByRole('button', { name: variant })).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('accessibility', () => {
    it('has correct role', () => {
      render(<Button>Accessible Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('can be focused', async () => {
      const user = userEvent.setup()
      render(<Button>Focus me</Button>)
      const button = screen.getByRole('button', { name: 'Focus me' })

      await user.tab()
      expect(button).toHaveFocus()
    })
  })
})
