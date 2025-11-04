/**
 * Bridge Training Data Viewer
 * Admin interface for viewing, editing, and managing training examples
 *
 * Route: /admin/bridge/training-data
 * Auth: Admin only (TODO: Add auth middleware)
 */

'use client';

import { useState, useEffect } from 'react';
import type { BridgeTrainingExample } from '@togetheros/types';

type FilterStatus = 'all' | 'pending' | 'reviewed' | 'approved' | 'rejected';

export default function TrainingDataPage() {
  const [examples, setExamples] = useState<BridgeTrainingExample[]>([]);
  const [filteredExamples, setFilteredExamples] = useState<BridgeTrainingExample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExample, setSelectedExample] = useState<BridgeTrainingExample | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch training examples
  useEffect(() => {
    fetchExamples();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = examples;

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

    setFilteredExamples(filtered);
  }, [examples, filterStatus, searchQuery]);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training example?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bridge-training/examples/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete example');
      }

      setExamples(examples.filter((ex) => ex.id !== id));
      if (selectedExample?.id === id) {
        setSelectedExample(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete example');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/bridge-training/examples/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes: 'Approved from data viewer' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve example');
      }

      await fetchExamples();
    } catch (err: any) {
      alert(err.message || 'Failed to approve example');
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

      if (!response.ok) {
        throw new Error('Failed to reject example');
      }

      await fetchExamples();
    } catch (err: any) {
      alert(err.message || 'Failed to reject example');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'var(--success)';
      case 'rejected':
        return 'var(--danger)';
      case 'reviewed':
        return 'var(--info)';
      default:
        return 'var(--warn)';
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--info)';
    if (score >= 40) return 'var(--warn)';
    return 'var(--danger)';
  };

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--ink-900)',
              marginBottom: '0.5rem',
            }}
          >
            Training Data Viewer
          </h1>
          <p style={{ color: 'var(--ink-700)', fontSize: '1.125rem', lineHeight: 1.6 }}>
            View, edit, and manage Bridge training examples
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {[
            { label: 'Total', count: examples.length, color: 'var(--ink-700)' },
            {
              label: 'Pending',
              count: examples.filter((ex) => ex.trainingStatus === 'pending').length,
              color: 'var(--warn)',
            },
            {
              label: 'Approved',
              count: examples.filter((ex) => ex.trainingStatus === 'approved').length,
              color: 'var(--success)',
            },
            {
              label: 'Rejected',
              count: examples.filter((ex) => ex.trainingStatus === 'rejected').length,
              color: 'var(--danger)',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--bg-1)',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>
                {stat.count}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--ink-700)', marginTop: '0.25rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          style={{
            background: 'var(--bg-1)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Status Filter */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  color: 'var(--ink-700)',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-1)',
                  color: 'var(--ink-900)',
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  color: 'var(--ink-700)',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, responses..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-1)',
                  color: 'var(--ink-900)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '1rem 1.5rem',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              borderRadius: '0.5rem',
              border: '1px solid var(--danger)',
              marginBottom: '2rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-700)' }}>
            Loading training examples...
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
              {examples.length === 0
                ? 'No training examples yet.'
                : 'No examples match your filters.'}
            </p>
            <a
              href="/admin/bridge/train"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'var(--brand-600)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
              }}
            >
              Create Training Example
            </a>
          </div>
        )}

        {/* Examples List */}
        {!isLoading && filteredExamples.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredExamples.map((example) => (
              <div
                key={example.id}
                style={{
                  background: 'var(--bg-1)',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          background: getStatusColor(example.trainingStatus) + '20',
                          color: getStatusColor(example.trainingStatus),
                        }}
                      >
                        {example.trainingStatus.toUpperCase()}
                      </span>
                      {example.qualityScore !== undefined && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            background: getQualityScoreColor(example.qualityScore) + '20',
                            color: getQualityScoreColor(example.qualityScore),
                          }}
                        >
                          Quality: {example.qualityScore}/100
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--ink-900)', marginBottom: '0.5rem' }}>
                      {example.question}
                    </div>
                    {example.reviewNotes && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--ink-700)',
                          fontStyle: 'italic',
                          marginTop: '0.5rem',
                        }}
                      >
                        Notes: {example.reviewNotes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <button
                      onClick={() => setSelectedExample(example)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--brand-600)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      View
                    </button>
                    {example.trainingStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(example.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--success)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(example.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(example.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        color: 'var(--danger)',
                        border: '1px solid var(--danger)',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Ratings */}
                {(example.helpfulnessRating || example.accuracyRating || example.toneRating) && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      padding: '0.75rem',
                      background: 'var(--bg-2)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    {example.helpfulnessRating && (
                      <div>
                        <span style={{ color: 'var(--ink-700)' }}>Helpfulness: </span>
                        <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>
                          {example.helpfulnessRating}/5
                        </span>
                      </div>
                    )}
                    {example.accuracyRating && (
                      <div>
                        <span style={{ color: 'var(--ink-700)' }}>Accuracy: </span>
                        <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>
                          {example.accuracyRating}/5
                        </span>
                      </div>
                    )}
                    {example.toneRating && (
                      <div>
                        <span style={{ color: 'var(--ink-700)' }}>Tone: </span>
                        <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>
                          {example.toneRating}/5
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedExample && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              zIndex: 50,
            }}
            onClick={() => setSelectedExample(null)}
          >
            <div
              style={{
                background: 'var(--bg-1)',
                borderRadius: '1rem',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '2rem',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                  Training Example Details
                </h2>
                <button
                  onClick={() => setSelectedExample(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: 'var(--ink-700)',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Question */}
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                    Question
                  </div>
                  <div
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-2)',
                      borderRadius: '0.5rem',
                      color: 'var(--ink-900)',
                    }}
                  >
                    {selectedExample.question}
                  </div>
                </div>

                {/* Bridge Response */}
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                    Bridge's Response
                  </div>
                  <div
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-2)',
                      borderRadius: '0.5rem',
                      color: 'var(--ink-900)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedExample.bridgeResponse}
                  </div>
                </div>

                {/* Ideal Response */}
                {selectedExample.idealResponse && (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                      Ideal Response
                    </div>
                    <div
                      style={{
                        padding: '1rem',
                        background: 'var(--success-bg)',
                        borderRadius: '0.5rem',
                        color: 'var(--ink-900)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6,
                      }}
                    >
                      {selectedExample.idealResponse}
                    </div>
                  </div>
                )}

                {/* Ratings */}
                {(selectedExample.helpfulnessRating ||
                  selectedExample.accuracyRating ||
                  selectedExample.toneRating) && (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                      Ratings
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                      }}
                    >
                      {selectedExample.helpfulnessRating && (
                        <div
                          style={{
                            padding: '1rem',
                            background: 'var(--bg-2)',
                            borderRadius: '0.5rem',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-600)' }}>
                            {selectedExample.helpfulnessRating}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--ink-700)' }}>
                            Helpfulness
                          </div>
                        </div>
                      )}
                      {selectedExample.accuracyRating && (
                        <div
                          style={{
                            padding: '1rem',
                            background: 'var(--bg-2)',
                            borderRadius: '0.5rem',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-600)' }}>
                            {selectedExample.accuracyRating}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--ink-700)' }}>Accuracy</div>
                        </div>
                      )}
                      {selectedExample.toneRating && (
                        <div
                          style={{
                            padding: '1rem',
                            background: 'var(--bg-2)',
                            borderRadius: '0.5rem',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-600)' }}>
                            {selectedExample.toneRating}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--ink-700)' }}>Tone</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                    Metadata
                  </div>
                  <div
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-2)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--ink-700)' }}>Status: </span>
                      <span style={{ fontWeight: 600, color: getStatusColor(selectedExample.trainingStatus) }}>
                        {selectedExample.trainingStatus}
                      </span>
                    </div>
                    {selectedExample.qualityScore !== undefined && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--ink-700)' }}>Quality Score: </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: getQualityScoreColor(selectedExample.qualityScore),
                          }}
                        >
                          {selectedExample.qualityScore}/100
                        </span>
                      </div>
                    )}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--ink-700)' }}>Model: </span>
                      <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>
                        {selectedExample.bridgeModel}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--ink-700)' }}>Created: </span>
                      <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>
                        {new Date(selectedExample.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedExample(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: 'var(--ink-700)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
