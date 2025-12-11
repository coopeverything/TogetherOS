/**
 * BridgeChat Component
 *
 * Conversation-based chat interface for Bridge Q&A.
 * Supports multi-turn conversations, streaming responses, error states, and rate limiting.
 */

'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import styles from './BridgeChat.module.css';
import { renderMarkdown } from './markdown-renderer';

export interface BridgeChatProps {
  /** Optional CSS class name for styling */
  className?: string;
}

type ChatState = 'idle' | 'loading' | 'streaming' | 'error' | 'rate-limited';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function BridgeChat({ className }: BridgeChatProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<ChatState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!question.trim()) return;

    const userQuestion = question.trim();
    setQuestion(''); // Clear input immediately

    // Add user message to conversation
    const userMessage: Message = { role: 'user', content: userQuestion };
    setMessages((prev) => [...prev, userMessage]);

    setState('loading');
    setErrorMessage('');

    try {
      // Send conversation history to API
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/bridge/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          conversationHistory, // Send full conversation context
        }),
      });

      // Handle error states
      if (response.status === 204) {
        setState('error');
        setErrorMessage('Please enter a question');
        return;
      }

      if (response.status === 429) {
        const data = await response.json();
        setState('rate-limited');
        setErrorMessage(data.message || 'Rate limit exceeded. Please try again later.');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setState('error');
        setErrorMessage(data.error || 'Something went wrong');
        return;
      }

      // Handle streaming response
      setState('streaming');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedAnswer = '';

      // Add assistant message placeholder
      // Use functional update to get correct index after user message was added
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedAnswer += chunk;

        // Update assistant message in real-time
        // Always update the LAST message (the assistant's response)
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: accumulatedAnswer };
          return updated;
        });
      }

      setState('idle');
    } catch (error) {
      console.error('Bridge error:', error);
      setState('error');
      setErrorMessage('Failed to connect to Bridge. Please try again.');
    }
  };

  const handleClearConversation = () => {
    if (messages.length > 0 && !confirm('Clear conversation history?')) return;
    setMessages([]);
    setErrorMessage('');
    setState('idle');
  };

  const isDisabled = state === 'loading' || state === 'streaming';

  return (
    <div className={className}>
      <div className={styles['bridge-container']}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2>Bridge Knows!</h2>
            <h3 className={styles['bridge-subtitle']}>Ask Bridge about all things that cooperation can achieve.</h3>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearConversation}
              className={styles['bridge-clear-button']}
              aria-label="Clear conversation"
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--ink-600)',
              }}
            >
              Clear conversation
            </button>
          )}
        </div>

        {messages.length === 0 && (
          <p className={styles['bridge-intro']}>
            CoopEverything is a vast project to transform the way we survive, thrive and govern ourselves.
            Bridge will help you with your questions.
          </p>
        )}

        {/* Conversation Messages */}
        {messages.length > 0 && (
          <div
            className={styles['bridge-conversation']}
            style={{
              maxHeight: '500px',
              overflowY: 'auto',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'var(--bg-1)',
              borderRadius: '0.75rem',
              border: '1px solid var(--border)',
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    background: message.role === 'user' ? 'var(--brand-100)' : 'var(--bg-2)',
                    color: message.role === 'user' ? 'var(--brand-800)' : 'var(--ink-900)',
                    padding: '1rem 1.25rem',
                    borderRadius: '0.75rem',
                    maxWidth: '80%',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', opacity: 0.7 }}>
                    {message.role === 'user' ? 'You' : 'Bridge'}
                  </div>
                  <div style={{ lineHeight: 1.6 }}>
                    {message.role === 'assistant' ? (
                      renderMarkdown(message.content, {
                        linkClassName: styles['bridge-link'],
                        headingClassName: styles['bridge-heading'],
                        paragraphClassName: styles['bridge-paragraph'],
                        listClassName: styles['bridge-list'],
                        sourceClassName: styles['bridge-source-link'],
                      })
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {(state === 'error' || state === 'rate-limited') && (
          <div className={styles['bridge-error']} role="alert">
            {errorMessage}
          </div>
        )}

        {state === 'loading' && (
          <div className={styles['bridge-loading']} aria-live="polite">
            Thinking...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles['bridge-input-container']}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={messages.length === 0 ? 'What is TogetherOS?' : 'Ask a follow-up question...'}
              className={styles['bridge-input']}
              aria-label="Ask a question to Bridge"
              disabled={isDisabled}
            />
            <button
              type="submit"
              className={styles['bridge-submit']}
              aria-label="Submit question"
              disabled={isDisabled}
            >
              {state === 'loading' ? 'Asking...' : state === 'streaming' ? 'Receiving...' : 'Ask'}
            </button>
          </div>
        </form>

        <p className={styles['bridge-disclaimer']}>
          Bridge answers are informed by TogetherOS documentation. Sources are listed below each answer.
        </p>
      </div>
    </div>
  );
}
