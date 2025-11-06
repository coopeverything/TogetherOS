/**
 * Consolidated Bridge Admin Page
 * Combines conversation training and training data management in one interface
 *
 * Route: /admin/bridge
 * Auth: Admin only (protected by layout.tsx)
 */

'use client';

import { useState, useEffect } from 'react';
import { ConversationTrainingForm } from '@togetheros/ui';
import type { BridgeTrainingExample } from '@togetheros/types';

type TabView = 'train' | 'data';
type SortField = 'createdAt' | 'qualityScore' | 'helpfulnessRating' | 'accuracyRating' | 'toneRating';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'pending' | 'reviewed' | 'approved' | 'rejected';

export default function BridgeAdminPage() {
  const [activeTab, setActiveTab] = useState<TabView>('train');
  const [conversationCount, setConversationCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Training data state
  const [examples, setExamples] = useState<BridgeTrainingExample[]>([]);
  const [filteredExamples, setFilteredExamples] = useState<BridgeTrainingExample[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Fetch training examples when switching to data tab
  useEffect(() => {
    if (activeTab === 'data') {
      fetchExamples();
    }
  }, [activeTab]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...examples];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((ex) => ex.trainingStatus === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.question.toLowerCase().includes(query) ||
          ex.bridgeResponse.toLowerCase().includes(query) ||
          ex.idealResponse?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: number | string | undefined;
      let bVal: number | string | undefined;

      if (sortField === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }

      // Handle undefined values
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredExamples(filtered);
  }, [examples, filterStatus, searchQuery, sortField, sortDirection]);

  const fetchExamples = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bridge-training/examples');
      if (!response.ok) {
        throw new Error('Failed to fetch training examples');
      }

      const data = await response.json();
      setExamples(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load training data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrainingSubmit = async (data: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    ratings: { messageIndex: number; qualityScore: number; idealResponse: string }[];
  }) => {
    try {
      let savedCount = 0;
      const errors: string[] = [];

      for (const rating of data.ratings) {
        const bridgeMessage = data.messages[rating.messageIndex];
        let userMessage = null;

        for (let i = rating.messageIndex - 1; i >= 0; i--) {
          if (data.messages[i].role === 'user') {
            userMessage = data.messages[i];
            break;
          }
        }

        if (!userMessage || bridgeMessage.role !== 'assistant') {
          errors.push(`Skipped rating at index ${rating.messageIndex}: invalid message structure`);
          continue;
        }

        try {
          const createResponse = await fetch('/api/bridge-training/examples', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              question: userMessage.content,
              bridgeResponse: bridgeMessage.content,
              bridgeModel: 'gpt-3.5-turbo',
              questionCategory: 'general',
            }),
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json().catch(() => ({ error: 'Unknown error' }));
            errors.push(`Failed to create example at index ${rating.messageIndex}: ${errorData.error}`);
            continue;
          }

          const { example } = await createResponse.json();

          const rateResponse = await fetch(`/api/bridge-training/examples/${example.id}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              helpfulnessRating: rating.qualityScore,
              accuracyRating: rating.qualityScore,
              toneRating: rating.qualityScore,
            }),
          });

          if (!rateResponse.ok) {
            errors.push(`Failed to rate example at index ${rating.messageIndex}`);
            continue;
          }

          const idealResponse = await fetch(`/api/bridge-training/examples/${example.id}/ideal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              idealResponse: rating.idealResponse,
            }),
          });

          if (!idealResponse.ok) {
            errors.push(`Failed to save ideal response at index ${rating.messageIndex}`);
            continue;
          }

          savedCount++;
        } catch (error: any) {
          errors.push(`Exception at index ${rating.messageIndex}: ${error.message}`);
        }
      }

      setConversationCount(conversationCount + 1);

      const avgQuality = data.ratings.length > 0
        ? Math.round((data.ratings.reduce((sum, r) => sum + r.qualityScore, 0) * 100) / (data.ratings.length * 5))
        : 0;

      if (errors.length > 0) {
        setSuccessMessage(
          `Saved ${savedCount}/${data.ratings.length} examples (${avgQuality}/100 avg quality). ${errors.length} failed.`
        );
      } else {
        setSuccessMessage(
          `✓ Conversation saved! ${savedCount} examples created with ${avgQuality}/100 average quality`
        );
      }

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save conversation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this training example?')) return;

    try {
      const response = await fetch(`/api/bridge-training/examples/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setExamples(examples.filter((ex) => ex.id !== id));
      if (expandedRowId === id) setExpandedRowId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/bridge-training/examples/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes: 'Approved from admin' }),
      });

      if (!response.ok) throw new Error('Failed to approve');
      await fetchExamples();
    } catch (err: any) {
      alert(err.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/bridge-training/examples/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes: reason }),
      });

      if (!response.ok) throw new Error('Failed to reject');
      await fetchExamples();
    } catch (err: any) {
      alert(err.message || 'Failed to reject');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'var(--success)';
      case 'rejected': return 'var(--danger)';
      case 'reviewed': return 'var(--info)';
      default: return 'var(--warn)';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--info)';
    if (score >= 40) return 'var(--warn)';
    return 'var(--danger)';
  };

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink-900)', marginBottom: '0.5rem' }}>
            Bridge Admin
          </h1>
          <p style={{ color: 'var(--ink-700)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Train Bridge through conversations and manage training data
          </p>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid var(--border)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('train')}
              style={{
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'train' ? '2px solid var(--brand-600)' : '2px solid transparent',
                color: activeTab === 'train' ? 'var(--brand-600)' : 'var(--ink-700)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              Train Bridge
            </button>
            <button
              onClick={() => setActiveTab('data')}
              style={{
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'data' ? '2px solid var(--brand-600)' : '2px solid transparent',
                color: activeTab === 'data' ? 'var(--brand-600)' : 'var(--ink-700)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              Training Data ({examples.length})
            </button>
          </div>
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

        {/* Train Tab */}
        {activeTab === 'train' && (
          <div>
            {conversationCount > 0 && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--brand-100)',
                  color: 'var(--brand-600)',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                }}
              >
                {conversationCount} {conversationCount === 1 ? 'conversation' : 'conversations'} saved this session
              </div>
            )}

            <ConversationTrainingForm onSubmit={handleTrainingSubmit} />

            <div
              style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'var(--bg-2)',
                borderRadius: '0.5rem',
              }}
            >
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ink-900)', marginBottom: '0.75rem' }}>
                Training Guidelines
              </h3>
              <ul style={{ color: 'var(--ink-700)', fontSize: '0.8125rem', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
                <li>Ask questions a real member might ask</li>
                <li>Rate each Bridge response (whether question or answer)</li>
                <li>Provide your ideal version of what Bridge should have said</li>
                <li>Continue the conversation naturally</li>
                <li>Click "Finish & Save" after one or more interactions</li>
              </ul>
            </div>
          </div>
        )}

        {/* Training Data Tab */}
        {activeTab === 'data' && (
          <div>
            {/* Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              {[
                { label: 'Total', count: examples.length, color: 'var(--ink-700)' },
                { label: 'Pending', count: examples.filter((ex) => ex.trainingStatus === 'pending').length, color: '#f59e0b' },
                { label: 'Approved', count: examples.filter((ex) => ex.trainingStatus === 'approved').length, color: '#10b981' },
                { label: 'High Quality', count: examples.filter((ex) => (ex.qualityScore || 0) >= 80).length, color: '#10b981' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'var(--bg-1)',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: stat.color, marginBottom: '0.25rem' }}>
                    {stat.count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-700)', textTransform: 'uppercase' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Filters & Sort */}
            <div
              style={{
                background: 'var(--bg-1)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                marginBottom: '1rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.25rem',
                  background: 'var(--bg-2)',
                  color: 'var(--ink-900)',
                }}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.25rem',
                  background: 'var(--bg-2)',
                  color: 'var(--ink-900)',
                }}
              >
                <option value="createdAt">Date</option>
                <option value="qualityScore">Quality</option>
                <option value="helpfulnessRating">Helpful</option>
                <option value="accuracyRating">Accuracy</option>
                <option value="toneRating">Tone</option>
              </select>

              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.25rem',
                  background: 'var(--bg-2)',
                  color: 'var(--ink-900)',
                  cursor: 'pointer',
                }}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                style={{
                  marginLeft: 'auto',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.25rem',
                  background: 'var(--bg-2)',
                  color: 'var(--ink-900)',
                  width: '200px',
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '1rem',
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-700)' }}>
                Loading training data...
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredExamples.length === 0 && (
              <div
                style={{
                  background: 'var(--bg-1)',
                  padding: '3rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: 'var(--ink-700)', marginBottom: '1rem' }}>
                  {examples.length === 0 ? 'No training examples yet.' : 'No examples match your filters.'}
                </p>
                <button
                  onClick={() => setActiveTab('train')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--brand-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Start Training
                </button>
              </div>
            )}

            {/* Training Data List - One line per entry with expand */}
            {!isLoading && filteredExamples.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredExamples.map((example) => {
                  const isExpanded = expandedRowId === example.id;
                  const isEditing = editingId === example.id;

                  return (
                    <div
                      key={example.id}
                      style={{
                        background: 'var(--bg-1)',
                        border: isExpanded ? '2px solid var(--brand-500)' : '1px solid var(--border)',
                        borderRadius: '0.5rem',
                      }}
                    >
                      {/* One-line summary */}
                      <div
                        onClick={() => setExpandedRowId(isExpanded ? null : example.id)}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: getStatusColor(example.trainingStatus) + '20',
                            color: getStatusColor(example.trainingStatus),
                            textTransform: 'capitalize',
                          }}
                        >
                          {example.trainingStatus}
                        </span>
                        {example.qualityScore !== undefined && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              background: getQualityColor(example.qualityScore) + '20',
                              color: getQualityColor(example.qualityScore),
                            }}
                          >
                            {example.qualityScore}
                          </span>
                        )}
                        <span style={{ flex: 1, fontSize: '0.9375rem', color: 'var(--ink-900)', fontWeight: 500 }}>
                          {example.question}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--ink-700)' }}>
                          {new Date(example.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{ fontSize: '1rem', color: 'var(--ink-700)' }}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>

                      {/* Expanded stats and edit */}
                      {isExpanded && (
                        <div
                          style={{
                            padding: '0.75rem',
                            borderTop: '1px solid var(--border)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Stats */}
                          <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                              Stats & Ratings
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--ink-700)' }}>
                              {example.helpfulnessRating && <span>Helpful: {example.helpfulnessRating}/5</span>}
                              {example.accuracyRating && <span>Accuracy: {example.accuracyRating}/5</span>}
                              {example.toneRating && <span>Tone: {example.toneRating}/5</span>}
                              <span>Model: {example.bridgeModel}</span>
                            </div>
                          </div>

                          {/* Bridge Response */}
                          <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                              Bridge's Response
                            </div>
                            <div
                              style={{
                                padding: '0.5rem',
                                background: 'var(--bg-2)',
                                borderRadius: '0.25rem',
                                fontSize: '0.8125rem',
                                color: 'var(--ink-900)',
                                whiteSpace: 'pre-wrap',
                                maxHeight: '150px',
                                overflowY: 'auto',
                              }}
                            >
                              {example.bridgeResponse}
                            </div>
                          </div>

                          {/* Ideal Response */}
                          {example.idealResponse && (
                            <div style={{ marginBottom: '0.75rem' }}>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                                Ideal Response
                              </div>
                              <div
                                style={{
                                  padding: '0.5rem',
                                  background: 'var(--success-bg)',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.8125rem',
                                  color: 'var(--ink-900)',
                                  whiteSpace: 'pre-wrap',
                                  maxHeight: '150px',
                                  overflowY: 'auto',
                                }}
                              >
                                {example.idealResponse}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {example.trainingStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(example.id)}
                                  style={{
                                    padding: '0.375rem 0.75rem',
                                    fontSize: '0.8125rem',
                                    border: '1px solid #10b981',
                                    borderRadius: '0.25rem',
                                    background: '#10b98110',
                                    color: '#10b981',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(example.id)}
                                  style={{
                                    padding: '0.375rem 0.75rem',
                                    fontSize: '0.8125rem',
                                    border: '1px solid #ef4444',
                                    borderRadius: '0.25rem',
                                    background: '#ef444410',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setEditingId(isEditing ? null : example.id)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.8125rem',
                                border: '1px solid var(--brand-500)',
                                borderRadius: '0.25rem',
                                background: isEditing ? 'var(--brand-500)' : 'transparent',
                                color: isEditing ? 'white' : 'var(--brand-500)',
                                cursor: 'pointer',
                              }}
                            >
                              {isEditing ? 'Cancel Edit' : 'Edit'}
                            </button>
                            <button
                              onClick={() => handleDelete(example.id)}
                              style={{
                                marginLeft: 'auto',
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.8125rem',
                                border: '1px solid #ef4444',
                                borderRadius: '0.25rem',
                                background: 'transparent',
                                color: '#ef4444',
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                          </div>

                          {/* Edit mode placeholder */}
                          {isEditing && (
                            <div
                              style={{
                                marginTop: '0.75rem',
                                padding: '0.75rem',
                                background: 'var(--bg-2)',
                                borderRadius: '0.5rem',
                                fontSize: '0.8125rem',
                                color: 'var(--ink-700)',
                              }}
                            >
                              Edit functionality coming soon (update question, response, ratings, ideal response)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
