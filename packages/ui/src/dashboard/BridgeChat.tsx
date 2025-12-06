/**
 * BridgeChatWidget Component
 *
 * Expandable AI chat interface (bottom-right corner).
 * Provides conversational assistance for dashboard actions.
 */

'use client'

import { useState } from 'react'

export interface BridgeChatWidgetProps {
  /** Optional CSS class */
  className?: string
}

export function BridgeChatWidget({ className = '' }: BridgeChatWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Welcome! What can I help you with?',
    },
  ])
  const [input, setInput] = useState('')

  const quickSuggestions = [
    '📊 My Activity Summary',
    '🗳️ Active Votes',
    '📅 Upcoming Events',
    '👥 Suggested Groups',
    '💬 Hot Discussions',
  ]

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: input }])

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Here's a sample response to "${input}". In production, this would connect to the Bridge AI API.`,
        },
      ])
    }, 500)

    setInput('')
  }

  if (!isExpanded) {
    // Collapsed pill
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-all z-50 ${className}`}
      >
        <span className="text-xl">💬</span>
        <span className="font-medium">Bridge</span>
        <span className="text-base opacity-90">Ask me anything</span>
      </button>
    )
  }

  // Expanded chat window
  return (
    <div
      className={`fixed bottom-4 right-4 w-[400px] h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-orange-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <span className="font-semibold text-gray-900 dark:text-white">Bridge AI Assistant</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700 font-bold"
        >
          −
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-base text-gray-600">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(suggestion)
                    handleSendMessage()
                  }}
                  className="text-sm px-3 py-1.5.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            disabled={!input.trim()}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
