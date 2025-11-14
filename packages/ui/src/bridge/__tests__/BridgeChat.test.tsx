import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BridgeChat } from '../BridgeChat'

// Mock CSS modules
vi.mock('../BridgeChat.module.css', () => ({
  default: {
    'bridge-container': 'bridge-container',
    'bridge-subtitle': 'bridge-subtitle',
    'bridge-intro': 'bridge-intro',
    'bridge-input-container': 'bridge-input-container',
    'bridge-input': 'bridge-input',
    'bridge-submit': 'bridge-submit',
    'bridge-error': 'bridge-error',
    'bridge-output': 'bridge-output',
    'bridge-loading': 'bridge-loading',
    'bridge-disclaimer': 'bridge-disclaimer',
    'bridge-link': 'bridge-link',
  },
}))

describe('BridgeChat', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn()

    // Mock scrollIntoView (not available in JSDOM/test environment)
    Element.prototype.scrollIntoView = vi.fn()
  })

  describe('rendering', () => {
    it('renders the chat interface', () => {
      render(<BridgeChat />)

      expect(screen.getByText('Bridge Knows!')).toBeInTheDocument()
      expect(screen.getByLabelText('Ask a question to Bridge')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit question' })).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      const { container } = render(<BridgeChat className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('shows placeholder text', () => {
      render(<BridgeChat />)
      const input = screen.getByPlaceholderText('What is TogetherOS?')
      expect(input).toBeInTheDocument()
    })
  })

  describe('input handling', () => {
    it('updates input value when typing', async () => {
      const user = userEvent.setup()
      render(<BridgeChat />)

      const input = screen.getByLabelText('Ask a question to Bridge') as HTMLInputElement
      await user.type(input, 'What is cooperation?')

      expect(input.value).toBe('What is cooperation?')
    })

    it('does not submit when input is empty', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      render(<BridgeChat />)

      const button = screen.getByRole('button', { name: 'Submit question' })
      await user.click(button)

      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('form submission', () => {
    it('calls API with question on submit', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('Test answer') })
              .mockResolvedValueOnce({ done: true, value: undefined }),
          }),
        },
      })
      global.fetch = mockFetch

      render(<BridgeChat />)

      const input = screen.getByLabelText('Ask a question to Bridge')
      const button = screen.getByRole('button', { name: 'Submit question' })

      await user.type(input, 'What is TogetherOS?')
      await user.click(button)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/bridge/ask',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'What is TogetherOS?', conversationHistory: [] }),
        })
      )
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves
      global.fetch = mockFetch

      render(<BridgeChat />)

      const input = screen.getByLabelText('Ask a question to Bridge')
      const button = screen.getByRole('button', { name: 'Submit question' })

      await user.type(input, 'Test question')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Thinking...')).toBeInTheDocument()
      })
    })

    it('disables input during loading', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {}))
      global.fetch = mockFetch

      render(<BridgeChat />)

      const input = screen.getByLabelText('Ask a question to Bridge')
      const button = screen.getByRole('button', { name: 'Submit question' })

      await user.type(input, 'Test question')
      await user.click(button)

      await waitFor(() => {
        expect(input).toBeDisabled()
        expect(button).toBeDisabled()
      })
    })
  })

  describe('error handling', () => {
    it('shows error message on 204 response', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 204,
      })
      global.fetch = mockFetch

      render(<BridgeChat />)

      const input = screen.getByLabelText('Ask a question to Bridge')
      const button = screen.getByRole('button', { name: 'Submit question' })

      await user.type(input, 'Test')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Please enter a question')
      })
    })

    it('shows rate limit message on 429 response', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Rate limit exceeded' }),
      })
      global.fetch = mockFetch

      render(<BridgeChat />)

      const input = screen.getByLabelText('Ask a question to Bridge')
      const button = screen.getByRole('button', { name: 'Submit question' })

      await user.type(input, 'Test')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Rate limit exceeded')
      })
    })

    it('shows generic error on network failure', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
      global.fetch = mockFetch

      render(<BridgeChat />)

      const input = screen.getByLabelText('Ask a question to Bridge')
      const button = screen.getByRole('button', { name: 'Submit question' })

      await user.type(input, 'Test')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to connect to Bridge')
      })
    })
  })

  describe('streaming response', () => {
    it('displays streamed answer', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('This is ') })
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('a test.') })
              .mockResolvedValueOnce({ done: true, value: undefined }),
          }),
        },
      })
      global.fetch = mockFetch

      render(<BridgeChat />)

      const input = screen.getByLabelText('Ask a question to Bridge')
      const button = screen.getByRole('button', { name: 'Submit question' })

      await user.type(input, 'Test')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('This is a test.')).toBeInTheDocument()
      })
    })
  })
})
