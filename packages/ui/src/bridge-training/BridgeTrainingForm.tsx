/**
 * Bridge Training Form Component
 * 5-step workflow for training Bridge AI:
 * 1. Ask Bridge a question
 * 2. See Bridge's response
 * 3. Rate response (helpfulness, accuracy, tone)
 * 4. Provide ideal response
 * 5. Save for training
 */

'use client';

import { useState, FormEvent } from 'react';
import { StarRating } from './StarRating';
import { renderMarkdown } from '../bridge/markdown-renderer';

type Step = 'ask' | 'rate' | 'ideal' | 'save';

interface Ratings {
  helpfulness: number;
  accuracy: number;
  tone: number;
}

export interface BridgeTrainingFormProps {
  onSubmit?: (data: {
    question: string;
    bridgeResponse: string;
    ratings: Ratings;
    idealResponse: string;
  }) => Promise<void>;
}

export function BridgeTrainingForm({ onSubmit }: BridgeTrainingFormProps) {
  const [step, setStep] = useState<Step>('ask');
  const [question, setQuestion] = useState('');
  const [bridgeResponse, setBridgeResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [ratings, setRatings] = useState<Ratings>({
    helpfulness: 0,
    accuracy: 0,
    tone: 0,
  });

  const [idealResponse, setIdealResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Ask Bridge a question
  const handleAskBridge = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError('');
    setBridgeResponse('');

    try {
      const response = await fetch('/api/bridge/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
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
        setBridgeResponse(accumulated);
      }

      setStep('rate');
    } catch (err: any) {
      setError(err.message || 'Failed to get response from Bridge');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Rate Bridge's response
  const handleRateResponse = () => {
    if (ratings.helpfulness === 0 || ratings.accuracy === 0 || ratings.tone === 0) {
      setError('Please rate all three dimensions');
      return;
    }
    setError('');
    setStep('ideal');
  };

  // Step 3: Provide ideal response and save
  const handleSaveTrainingExample = async () => {
    if (!idealResponse.trim()) {
      setError('Please provide an ideal response');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (onSubmit) {
        await onSubmit({
          question,
          bridgeResponse,
          ratings,
          idealResponse: idealResponse.trim(),
        });
      }

      // Reset form for next training example
      setQuestion('');
      setBridgeResponse('');
      setRatings({ helpfulness: 0, accuracy: 0, tone: 0 });
      setIdealResponse('');
      setStep('ask');
    } catch (err: any) {
      setError(err.message || 'Failed to save training example');
    } finally {
      setIsSaving(false);
    }
  };

  const canProceedToIdeal = ratings.helpfulness > 0 && ratings.accuracy > 0 && ratings.tone > 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Step 1: Ask Question */}
      {step === 'ask' && (
        <div
          style={{
            background: 'var(--bg-1)',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
          }}
        >
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--ink-900)',
              marginBottom: '0.75rem',
            }}
          >
            Step 1: Ask Bridge a Question
          </h2>
          <p style={{ color: 'var(--ink-700)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
            Ask Bridge a question about TogetherOS, cooperation, or governance to see how it responds.
          </p>

          <form onSubmit={handleAskBridge}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: 'var(--ink-700)',
                  marginBottom: '0.5rem',
                }}
              >
                Your Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is TogetherOS?"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-1)',
                  color: 'var(--ink-900)',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '0.5rem',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  borderRadius: '0.5rem',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              style={{
                background: isLoading ? 'var(--ink-400)' : 'var(--brand-600)',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Asking Bridge...' : 'Ask Bridge'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Rate Response */}
      {step === 'rate' && (
        <div
          style={{
            background: 'var(--bg-1)',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
          }}
        >
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--ink-900)',
              marginBottom: '0.75rem',
            }}
          >
            Step 2: Bridge's Response
          </h2>

          <div
            style={{
              background: 'var(--bg-2)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
              Question:
            </div>
            <div style={{ color: 'var(--ink-900)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{question}</div>

            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
              Bridge's Answer:
            </div>
            <div style={{ color: 'var(--ink-900)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {renderMarkdown(bridgeResponse)}
            </div>
          </div>

          <h3
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--ink-900)',
              marginBottom: '0.75rem',
            }}
          >
            Rate Bridge's Response
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <StarRating
              label="Helpfulness"
              value={ratings.helpfulness}
              onChange={(value) => setRatings({ ...ratings, helpfulness: value })}
            />
            <StarRating
              label="Accuracy"
              value={ratings.accuracy}
              onChange={(value) => setRatings({ ...ratings, accuracy: value })}
            />
            <StarRating
              label="Tone"
              value={ratings.tone}
              onChange={(value) => setRatings({ ...ratings, tone: value })}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '0.5rem',
                marginBottom: '0.75rem',
                fontSize: '0.875rem',
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                borderRadius: '0.5rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setStep('ask')}
              style={{
                background: 'transparent',
                color: 'var(--ink-700)',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Start Over
            </button>
            <button
              onClick={handleRateResponse}
              disabled={!canProceedToIdeal}
              style={{
                background: canProceedToIdeal ? 'var(--brand-600)' : 'var(--ink-400)',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 600,
                cursor: canProceedToIdeal ? 'pointer' : 'not-allowed',
              }}
            >
              Continue to Ideal Response
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Provide Ideal Response */}
      {step === 'ideal' && (
        <div
          style={{
            background: 'var(--bg-1)',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
          }}
        >
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--ink-900)',
              marginBottom: '0.75rem',
            }}
          >
            Step 3: Provide Ideal Response
          </h2>

          <p style={{ color: 'var(--ink-700)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
            Write how Bridge should have answered this question. This will be used to train the AI.
          </p>

          <div
            style={{
              background: 'var(--bg-2)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.25rem' }}>
              Question: {question}
            </div>
            <div style={{ color: 'var(--ink-400)' }}>
              Ratings: Helpfulness {ratings.helpfulness}/5 • Accuracy {ratings.accuracy}/5 • Tone{' '}
              {ratings.tone}/5
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'var(--ink-700)',
                marginBottom: '0.5rem',
              }}
            >
              Ideal Response
            </label>
            <textarea
              value={idealResponse}
              onChange={(e) => setIdealResponse(e.target.value)}
              placeholder="Write the ideal answer Bridge should provide..."
              rows={8}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
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
                padding: '0.5rem',
                marginBottom: '0.75rem',
                fontSize: '0.875rem',
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                borderRadius: '0.5rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setStep('rate')}
              disabled={isSaving}
              style={{
                background: 'transparent',
                color: 'var(--ink-700)',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              Back to Rating
            </button>
            <button
              onClick={handleSaveTrainingExample}
              disabled={isSaving || !idealResponse.trim()}
              style={{
                background: isSaving || !idealResponse.trim() ? 'var(--ink-400)' : 'var(--brand-600)',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 600,
                cursor: isSaving || !idealResponse.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Training Example'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
