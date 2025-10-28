/**
 * BridgeChat Component
 *
 * Minimal chat interface for Bridge Q&A.
 * Supports streaming responses, error states, and rate limiting.
 */

'use client';

import { useState, FormEvent } from 'react';
import styles from './BridgeChat.module.css';

export interface BridgeChatProps {
  /** Optional CSS class name for styling */
  className?: string;
}

type ChatState = 'idle' | 'loading' | 'streaming' | 'error' | 'rate-limited';

export function BridgeChat({ className }: BridgeChatProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [state, setState] = useState<ChatState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!question.trim()) return;

    setState('loading');
    setAnswer('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/bridge/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedAnswer += chunk;
        setAnswer(accumulatedAnswer);
      }

      setState('idle');
    } catch (error) {
      console.error('Bridge error:', error);
      setState('error');
      setErrorMessage('Failed to connect to Bridge. Please try again.');
    }
  };

  const isDisabled = state === 'loading' || state === 'streaming';

  return (
    <div className={className}>
      <div className={styles['bridge-container']}>
        <h2>Ask Bridge</h2>
        <p className={styles['bridge-intro']}>Ask Bridge what TogetherOS is.</p>

        <form onSubmit={handleSubmit}>
          <div className={styles['bridge-input-container']}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is TogetherOS?"
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

        {(state === 'error' || state === 'rate-limited') && (
          <div className={styles['bridge-error']} role="alert">
            {errorMessage}
          </div>
        )}

        {answer && (
          <div className={styles['bridge-output']} role="region" aria-live="polite">
            {answer}
          </div>
        )}

        {state === 'loading' && (
          <div className={styles['bridge-loading']} aria-live="polite">
            Thinking...
          </div>
        )}

        <p className={styles['bridge-disclaimer']}>
          Bridge answers are informed by TogetherOS documentation. Sources are listed below each answer.
        </p>
      </div>
    </div>
  );
}
