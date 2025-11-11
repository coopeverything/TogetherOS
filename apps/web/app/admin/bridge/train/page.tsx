/**
 * Bridge Training Admin Page
 * Admin-only interface for training Bridge AI by providing example Q&A pairs
 *
 * Route: /admin/bridge/train
 * Auth: Admin only (TODO: Add auth middleware)
 */

'use client';

import { useState } from 'react';
import { BridgeTrainingForm } from '@togetheros/ui';

export default function BridgeTrainPage() {
  const [successMessage, setSuccessMessage] = useState('');
  const [exampleCount, setExampleCount] = useState(0);

  const handleSubmit = async (data: {
    question: string;
    bridgeResponse: string;
    ratings: { helpfulness: number; accuracy: number; tone: number };
    idealResponse?: string; // Optional when ratings are high
  }) => {
    try {
      // Create training example
      const createResponse = await fetch('/api/bridge-training/examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: data.question,
          bridgeResponse: data.bridgeResponse,
          bridgeModel: 'gpt-3.5-turbo', // Default model
          questionCategory: 'general', // Default category for MVP
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create training example');
      }

      const { example } = await createResponse.json();

      // Rate the response
      const rateResponse = await fetch(`/api/bridge-training/examples/${example.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helpfulnessRating: data.ratings.helpfulness,
          accuracyRating: data.ratings.accuracy,
          toneRating: data.ratings.tone,
        }),
      });

      if (!rateResponse.ok) {
        throw new Error('Failed to rate example');
      }

      // Provide ideal response (only if provided)
      if (data.idealResponse) {
        const idealResponse = await fetch(`/api/bridge-training/examples/${example.id}/ideal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idealResponse: data.idealResponse,
          }),
        });

        if (!idealResponse.ok) {
          throw new Error('Failed to save ideal response');
        }
      }

      setExampleCount(exampleCount + 1);
      setSuccessMessage(
        `Training example saved! Quality score: ${Math.round(
          ((data.ratings.helpfulness + data.ratings.accuracy + data.ratings.tone) * 100) / 15
        )}/100`
      );

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save training example');
    }
  };

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--ink-900)',
              marginBottom: '0.5rem',
            }}
          >
            Train Bridge AI
          </h1>
          <p style={{ color: 'var(--ink-700)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Help improve Bridge by providing example questions and ideal responses.
          </p>

          {exampleCount > 0 && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 0.75rem',
                background: 'var(--brand-100)',
                color: 'var(--brand-600)',
                borderRadius: '0.5rem',
                fontSize: '0.8125rem',
              }}
            >
              {exampleCount} training {exampleCount === 1 ? 'example' : 'examples'} created this
              session
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.75rem 1rem',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              borderRadius: '0.5rem',
              border: '1px solid var(--success)',
              fontSize: '0.875rem',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Training Mode Selection */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <a
            href="/admin/bridge/train-conversation"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: 'var(--brand-200)',
              color: 'var(--brand-700)',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.8125rem',
            }}
          >
            Switch to Conversation Training →
          </a>
        </div>

        {/* Training Form */}
        <BridgeTrainingForm onSubmit={handleSubmit} />

        {/* Instructions Panel */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'var(--bg-2)',
            borderRadius: '0.5rem',
          }}
        >
          <h3
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--ink-900)',
              marginBottom: '0.75rem',
            }}
          >
            Training Guidelines
          </h3>
          <ul style={{ color: 'var(--ink-700)', fontSize: '0.8125rem', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
            <li>Ask questions that real users might ask about TogetherOS, cooperation, or governance</li>
            <li>Rate Bridge's response honestly across all three dimensions</li>
            <li>
              Provide ideal responses that are:
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Accurate and factual</li>
                <li>Clear and accessible</li>
                <li>Helpful and actionable</li>
                <li>Aligned with TogetherOS principles</li>
              </ul>
            </li>
            <li>Focus on one concept or question at a time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
