/**
 * Bridge Conversation Training Admin Page
 * Multi-turn dialogue training interface
 *
 * Route: /admin/bridge/train-conversation
 * Auth: Admin only (TODO: Add auth middleware)
 */

'use client';

import { useState } from 'react';
import { ConversationTrainingForm } from '@togetheros/ui';

export default function BridgeConversationTrainPage() {
  const [successMessage, setSuccessMessage] = useState('');
  const [conversationCount, setConversationCount] = useState(0);

  const handleSubmit = async (data: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    ratings: { messageIndex: number; qualityScore: number; idealResponse: string }[];
  }) => {
    try {
      // For MVP, just log the data (in production, this would save to database)
      console.log('[Conversation Training] Saving conversation:', {
        totalMessages: data.messages.length,
        bridgeMessages: data.messages.filter(m => m.role === 'assistant').length,
        ratingsProvided: data.ratings.length,
        averageQuality: data.ratings.length > 0
          ? Math.round((data.ratings.reduce((sum, r) => sum + r.qualityScore, 0) * 100) / (data.ratings.length * 5))
          : 0,
      });

      setConversationCount(conversationCount + 1);

      const avgQuality = data.ratings.length > 0
        ? Math.round((data.ratings.reduce((sum, r) => sum + r.qualityScore, 0) * 100) / (data.ratings.length * 5))
        : 0;

      setSuccessMessage(
        `Conversation saved! ${data.ratings.length} responses rated with ${avgQuality}/100 average quality`
      );

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save conversation');
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
            Train Bridge: Conversations
          </h1>
          <p style={{ color: 'var(--ink-700)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Have a multi-turn conversation with Bridge, rate each response, and provide ideal alternatives.
          </p>

          {conversationCount > 0 && (
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
              {conversationCount} {conversationCount === 1 ? 'conversation' : 'conversations'} saved this
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

        {/* Training Form */}
        <ConversationTrainingForm onSubmit={handleSubmit} />

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
            Conversation Training Guidelines
          </h3>
          <ul style={{ color: 'var(--ink-700)', fontSize: '0.8125rem', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
            <li>Start with a question a real member might ask</li>
            <li>Bridge will respond - often with a clarifying question</li>
            <li>Rate Bridge's response (whether it's a question or answer)</li>
            <li>Provide your ideal version of what Bridge should have said</li>
            <li>Continue the conversation naturally</li>
            <li>Repeat until the dialogue feels complete</li>
            <li>Click "Finish & Save" when done</li>
            <li>
              Training goals:
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Teach Bridge to ask good clarifying questions</li>
                <li>Train Bridge to guide users step-by-step</li>
                <li>Show Bridge how to be conversational and empathetic</li>
                <li>Help Bridge understand when to ask vs when to answer</li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="/admin/bridge/train"
            style={{
              color: 'var(--brand-600)',
              textDecoration: 'none',
              fontSize: '0.8125rem',
            }}
          >
            ← Back to Single Q&A Training
          </a>
        </div>
      </div>
    </div>
  );
}
