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

/**
 * Parse inline markdown formatting (links, bold) within a line
 * Handles: [text](url), **bold**
 */
function parseInlineMarkdown(text: string): JSX.Element[] {
  const parts: JSX.Element[] = [];
  // Combined regex for links and bold
  const inlineRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${key++}`}>{text.slice(lastIndex, match.index)}</span>
      );
    }

    if (match[1] && match[2]) {
      // Link: [text](url)
      const linkText = match[1];
      const url = match[2];
      parts.push(
        <a
          key={`link-${key++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles['bridge-link']}
        >
          {linkText}
        </a>
      );
    } else if (match[3]) {
      // Bold: **text**
      parts.push(
        <strong key={`bold-${key++}`}>{match[3]}</strong>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key="default">{text}</span>];
}

/**
 * Render markdown-formatted answer with support for:
 * - H3 headers (###)
 * - Bullet lists (-, *)
 * - Links ([text](url))
 * - Bold text (**text**)
 * - Horizontal rules (---)
 */
function renderMarkdown(text: string): JSX.Element[] {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: JSX.Element[] = [];
  let listKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className={styles['bridge-list']}>
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmedLine = line.trim();

    // Horizontal rule
    if (trimmedLine === '---') {
      flushList();
      elements.push(<hr key={`hr-${idx}`} />);
      return;
    }

    // H3 header
    if (trimmedLine.startsWith('###')) {
      flushList();
      const headerText = trimmedLine.slice(3).trim();
      elements.push(
        <h3 key={`h3-${idx}`} className={styles['bridge-heading']}>
          {parseInlineMarkdown(headerText)}
        </h3>
      );
      return;
    }

    // Bullet list item
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const itemText = trimmedLine.slice(2).trim();
      listItems.push(
        <li key={`li-${idx}`}>{parseInlineMarkdown(itemText)}</li>
      );
      return;
    }

    // Regular paragraph (flush list first)
    if (trimmedLine.length > 0) {
      flushList();
      elements.push(
        <p key={`p-${idx}`} className={styles['bridge-paragraph']}>
          {parseInlineMarkdown(line)}
        </p>
      );
    } else {
      // Empty line
      flushList();
    }
  });

  // Flush any remaining list items
  flushList();

  return elements.length > 0 ? elements : [<span key="default">{text}</span>];
}

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
        <h2>Bridge Knows!</h2>
        <h3 className={styles['bridge-subtitle']}>Ask Bridge about all things that cooperation can achieve.</h3>
        <p className={styles['bridge-intro']}>
          Coopeverything is a vast project to transform the way we survive, thrive and govern ourselves.
          Bridge will help you with your questions.
        </p>

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
            {renderMarkdown(answer)}
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
