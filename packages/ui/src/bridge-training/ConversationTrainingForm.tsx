/**
 * Conversation Training Form Component
 * Multi-turn dialogue training interface for Bridge
 *
 * Workflow:
 * 1. Ask Bridge a question
 * 2. See Bridge's response
 * 3. Rate response (1-5 stars - single quality score)
 * 4. Provide ideal alternative response
 * 5. Continue conversation or finish
 * 6. Save entire conversation with all ratings
 */

'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { StarRating } from './StarRating';
import { renderMarkdown } from '../bridge/markdown-renderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

interface MessageRating {
  messageIndex: number; // Index in messages array
  qualityScore: number;
  idealResponse?: string; // Optional when quality score is high
}

export interface ConversationTrainingFormProps {
  onSubmit?: (data: {
    messages: Message[];
    ratings: MessageRating[];
  }) => Promise<void>;
}

export function ConversationTrainingForm({ onSubmit }: ConversationTrainingFormProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Rating state
  const [ratingMessageIndex, setRatingMessageIndex] = useState<number | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentIdealResponse, setCurrentIdealResponse] = useState('');
  const [ratings, setRatings] = useState<MessageRating[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to Bridge
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: Message = {
      role: 'user',
      content: userInput.trim(),
    };

    // Add user message to conversation
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput('');
    setIsLoading(true);
    setError('');

    try {
      // Build conversation history for API (exclude current message)
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Call Bridge API with conversation history
      const response = await fetch('/api/bridge/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newUserMessage.content,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get response from Bridge');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Update Bridge message in real-time
        setMessages([...updatedMessages, {
          role: 'assistant',
          content: accumulated,
        }]);
      }

      // Final update
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: accumulated,
      }]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response from Bridge');
    } finally {
      setIsLoading(false);
    }
  };

  // Start rating a Bridge message
  const handleStartRating = (messageIndex: number) => {
    // Check if already rated
    const existingRating = ratings.find(r => r.messageIndex === messageIndex);
    if (existingRating) {
      setCurrentRating(existingRating.qualityScore);
      setCurrentIdealResponse(existingRating.idealResponse || '');
    } else {
      setCurrentRating(0);
      setCurrentIdealResponse('');
    }
    setRatingMessageIndex(messageIndex);
  };

  // Submit rating for current message
  const handleSubmitRating = () => {
    if (ratingMessageIndex === null) return;

    if (currentRating === 0) {
      setError('Please provide a rating');
      return;
    }

    // Check if rating is high quality (4+ stars)
    const isHighQuality = currentRating >= 4;

    // Require ideal response only if rating is not high quality
    if (!currentIdealResponse.trim() && !isHighQuality) {
      setError('Please provide an ideal response (or rate 4+ stars to approve as-is)');
      return;
    }

    // Save rating
    const newRating: MessageRating = {
      messageIndex: ratingMessageIndex,
      qualityScore: currentRating,
      idealResponse: currentIdealResponse.trim() || undefined,
    };

    // Update or add rating
    setRatings(prev => {
      const existing = prev.findIndex(r => r.messageIndex === ratingMessageIndex);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newRating;
        return updated;
      }
      return [...prev, newRating];
    });

    // Clear rating UI
    setRatingMessageIndex(null);
    setCurrentRating(0);
    setCurrentIdealResponse('');
    setError('');
  };

  // Cancel rating
  const handleCancelRating = () => {
    setRatingMessageIndex(null);
    setCurrentRating(0);
    setCurrentIdealResponse('');
    setError('');
  };

  // Check if a message has been rated
  const isMessageRated = (index: number) => {
    return ratings.some(r => r.messageIndex === index);
  };

  // Finish and save conversation
  const handleFinishConversation = async () => {
    if (messages.length === 0) {
      setError('No messages to save');
      return;
    }

    // Check if all Bridge messages have been rated
    const bridgeMessageIndices = messages
      .map((m, idx) => ({ message: m, index: idx }))
      .filter(({ message, index }) => message.role === 'assistant' && index > 0)
      .map(({ index }) => index);

    const unratedBridgeIndices = bridgeMessageIndices.filter(idx => !isMessageRated(idx));

    if (unratedBridgeIndices.length > 0) {
      setError(`Please rate all ${bridgeMessageIndices.length} Bridge responses before finishing`);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (onSubmit) {
        await onSubmit({
          messages,
          ratings,
        });
      }

      // Reset form
      setMessages([]);
      setUserInput('');
      setRatings([]);
      setRatingMessageIndex(null);
      setCurrentRating(0);
      setCurrentIdealResponse('');
    } catch (err: any) {
      setError(err.message || 'Failed to save conversation');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '700px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Chat Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: '1rem 1rem 0 0',
          padding: '1.5rem',
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ink-400)', padding: '3rem 1rem' }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Start a Training Conversation</p>
            <p style={{ fontSize: '0.875rem' }}>Ask Bridge a question to begin the dialogue</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '1.5rem' }}>
            {/* Message Bubble */}
            <div
              style={{
                background: message.role === 'user' ? 'var(--brand-100)' : 'var(--bg-2)',
                color: message.role === 'user' ? 'var(--brand-800)' : 'var(--ink-900)',
                padding: '1rem 1.25rem',
                borderRadius: '0.75rem',
                maxWidth: '80%',
                marginLeft: message.role === 'user' ? 'auto' : '0',
                marginRight: message.role === 'user' ? '0' : 'auto',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', opacity: 0.7 }}>
                {message.role === 'user' ? 'You' : 'Bridge'}
              </div>
              <div style={{ lineHeight: 1.6 }}>
                {message.role === 'assistant' ? renderMarkdown(message.content) : message.content}
              </div>
            </div>

            {/* Rating Button (only for Bridge messages) */}
            {message.role === 'assistant' && index > 0 && ratingMessageIndex !== index && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => handleStartRating(index)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: isMessageRated(index) ? 'var(--success-bg)' : 'var(--brand-200)',
                    color: isMessageRated(index) ? 'var(--success)' : 'var(--brand-700)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isMessageRated(index) ? '✓ Rated' : 'Rate this response'}
                </button>
                {isMessageRated(index) && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink-400)' }}>
                    {ratings.find(r => r.messageIndex === index)?.qualityScore}/5
                  </span>
                )}
              </div>
            )}

            {/* Rating Form (inline) */}
            {ratingMessageIndex === index && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1.5rem',
                  background: 'var(--bg-0)',
                  border: '2px solid var(--brand-400)',
                  borderRadius: '0.75rem',
                }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                  Rate Bridge's Response
                </h4>

                <div style={{ marginBottom: '1rem' }}>
                  <StarRating
                    label="Quality Score"
                    value={currentRating}
                    onChange={setCurrentRating}
                  />
                </div>

                {currentRating >= 4 && (
                  <div
                    style={{
                      background: 'var(--success-bg, #d1fae5)',
                      color: 'var(--success, #065f46)',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                    }}
                  >
                    ✓ High quality response (4+ stars). You can approve this as-is without providing an ideal answer.
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                    Your Ideal Response {currentRating >= 4 && '(Optional)'}
                  </label>
                  <textarea
                    value={currentIdealResponse}
                    onChange={(e) => setCurrentIdealResponse(e.target.value)}
                    placeholder={
                      currentRating >= 4
                        ? 'Optional: Write an improved answer, or leave blank to approve as-is...'
                        : 'Write how Bridge should have responded...'
                    }
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      background: 'var(--bg-1)',
                      color: 'var(--ink-900)',
                      fontFamily: 'inherit',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                {error && (
                  <div
                    style={{
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      background: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleSubmitRating}
                    disabled={currentRating === 0 || (!currentIdealResponse.trim() && currentRating < 4)}
                    style={{
                      padding: '0.625rem 1.25rem',
                      background:
                        currentRating === 0 || (!currentIdealResponse.trim() && currentRating < 4)
                          ? 'var(--ink-400)'
                          : 'var(--brand-600)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      cursor:
                        currentRating === 0 || (!currentIdealResponse.trim() && currentRating < 4)
                          ? 'not-allowed'
                          : 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    {!currentIdealResponse.trim() && currentRating >= 4 ? 'Approve As-Is' : 'Save Rating'}
                  </button>
                  <button
                    onClick={handleCancelRating}
                    style={{
                      padding: '0.625rem 1.25rem',
                      background: 'transparent',
                      color: 'var(--ink-700)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ textAlign: 'center', color: 'var(--ink-400)', padding: '1rem' }}>
            Bridge is responding...
          </div>
        )}

        {/* Error display for fetch/API errors */}
        {error && ratingMessageIndex === null && (
          <div
            style={{
              padding: '1rem',
              margin: '1rem 0',
              background: 'var(--danger-bg, #fef2f2)',
              color: 'var(--danger, #dc2626)',
              borderRadius: '0.5rem',
              border: '1px solid var(--danger, #dc2626)',
              fontSize: '0.875rem',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '1rem 1.5rem',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 1rem 1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={messages.length === 0 ? 'Ask Bridge a question...' : 'Continue the conversation...'}
            disabled={isLoading || isSaving}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              background: 'var(--bg-1)',
              color: 'var(--ink-900)',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || isSaving || !userInput.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              background: (isLoading || isSaving || !userInput.trim()) ? 'var(--ink-400)' : 'var(--brand-600)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: (isLoading || isSaving || !userInput.trim()) ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {messages.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--ink-400)' }}>
              {messages.filter(m => m.role === 'assistant').length} Bridge responses • {ratings.length} rated
            </span>
            <button
              type="button"
              onClick={handleFinishConversation}
              disabled={isSaving || messages.length === 0}
              style={{
                padding: '0.625rem 1.25rem',
                background: isSaving ? 'var(--ink-400)' : 'var(--success)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {isSaving ? 'Saving...' : 'Finish & Save'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
