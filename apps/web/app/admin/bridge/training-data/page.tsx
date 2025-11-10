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
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
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

  const handleExport = (format: 'csv' | 'json') => {
    window.open(`/api/bridge-training/export?format=${format}`, '_blank');
  };

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--ink-900)',
              marginBottom: '0.5rem',
            }}
          >
            Training Data Viewer
          </h1>
          <p style={{ color: 'var(--ink-700)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            View, edit, and manage Bridge training examples
          </p>
        </div>

        {/* Stats - Compact 8-grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          {[
            { label: 'Total', count: examples.length, color: 'var(--ink-700)' },
            {
              label: 'Pending',
              count: examples.filter((ex) => ex.trainingStatus === 'pending').length,
              color: '#f59e0b',
            },
            {
              label: 'Approved',
              count: examples.filter((ex) => ex.trainingStatus === 'approved').length,
              color: '#10b981',
            },
            {
              label: 'Rejected',
              count: examples.filter((ex) => ex.trainingStatus === 'rejected').length,
              color: '#ef4444',
            },
            {
              label: 'Reviewed',
              count: examples.filter((ex) => ex.trainingStatus === 'reviewed').length,
              color: '#3b82f6',
            },
            {
              label: 'High Quality',
              count: examples.filter((ex) => (ex.qualityScore || 0) >= 80).length,
              color: '#10b981',
            },
            {
              label: 'With Ideal',
              count: examples.filter((ex) => ex.idealResponse).length,
              color: '#8b5cf6',
            },
            {
              label: 'Rated',
              count: examples.filter((ex) => ex.helpfulnessRating || ex.accuracyRating || ex.toneRating).length,
              color: '#6b7280',
            },
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
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters - Compact inline bar */}
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
          <label style={{ fontSize: '0.875rem', color: 'var(--ink-700)' }}>
            Status:
          </label>
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
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

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

          <button
            onClick={() => handleExport('csv')}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid var(--border)',
              borderRadius: '0.25rem',
              background: 'var(--bg-2)',
              color: 'var(--ink-900)',
              cursor: 'pointer',
            }}
          >
            CSV ↓
          </button>
          <button
            onClick={() => handleExport('json')}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid var(--border)',
              borderRadius: '0.25rem',
              background: 'var(--bg-2)',
              color: 'var(--ink-900)',
              cursor: 'pointer',
            }}
          >
            JSON ↓
          </button>
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

        {/* Examples List - Compact expandable cards */}
        {!isLoading && filteredExamples.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredExamples.map((example) => {
              const isExpanded = expandedCardId === example.id;
              const getPriorityColor = () => {
                if (example.qualityScore && example.qualityScore >= 80) return '#10b981';
                if (example.trainingStatus === 'pending') return '#f59e0b';
                if (example.trainingStatus === 'rejected') return '#ef4444';
                return '#3b82f6';
              };

              return (
                <div
                  key={example.id}
                  style={{
                    background: 'var(--bg-1)',
                    padding: '0.875rem',
                    borderRadius: '0.5rem',
                    border: isExpanded ? '2px solid var(--brand-500)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setExpandedCardId(isExpanded ? null : example.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                    {/* Priority indicator bar */}
                    <div style={{
                      width: '3px',
                      minHeight: '60px',
                      background: getPriorityColor(),
                      borderRadius: '2px',
                      alignSelf: 'stretch',
                    }} />

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Meta badges */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.25rem',
                          background: getStatusColor(example.trainingStatus) + '20',
                          color: getStatusColor(example.trainingStatus),
                          textTransform: 'capitalize',
                        }}>
                          {example.trainingStatus}
                        </span>
                        {example.qualityScore !== undefined && (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: getQualityScoreColor(example.qualityScore) + '20',
                            color: getQualityScoreColor(example.qualityScore),
                          }}>
                            Q: {example.qualityScore}
                          </span>
                        )}
                      </div>

                      {/* Question */}
                      <div style={{
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: 'var(--ink-900)',
                        marginBottom: '0.5rem',
                      }}>
                        {example.question}
                      </div>

                      {/* Meta info */}
                      <div style={{
                        fontSize: '0.8125rem',
                        color: 'var(--ink-700)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                      }}>
                        <span>{new Date(example.createdAt).toLocaleDateString()}</span>
                        {(example.helpfulnessRating || example.accuracyRating || example.toneRating) && (
                          <>
                            <span>•</span>
                            <span>⭐ Rated</span>
                          </>
                        )}
                        {example.idealResponse && (
                          <>
                            <span>•</span>
                            <span>✓ Has ideal</span>
                          </>
                        )}
                      </div>

                      {/* Ratings (compact inline) */}
                      {(example.helpfulnessRating || example.accuracyRating || example.toneRating) && (
                        <div style={{
                          marginTop: '0.5rem',
                          display: 'flex',
                          gap: '1rem',
                          fontSize: '0.8125rem',
                          color: 'var(--ink-700)',
                        }}>
                          {example.helpfulnessRating && (
                            <span>H: {example.helpfulnessRating}/5</span>
                          )}
                          {example.accuracyRating && (
                            <span>A: {example.accuracyRating}/5</span>
                          )}
                          {example.toneRating && (
                            <span>T: {example.toneRating}/5</span>
                          )}
                        </div>
                      )}

                      {/* Expanded actions */}
                      {isExpanded && (
                        <div style={{
                          marginTop: '0.75rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid var(--border)',
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
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
                            onClick={() => handleDelete(example.id)}
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
                            Delete
                          </button>
                          <button
                            onClick={() => setSelectedExample(example)}
                            style={{
                              marginLeft: 'auto',
                              padding: '0.375rem 0.75rem',
                              fontSize: '0.8125rem',
                              border: '1px solid var(--brand-500)',
                              borderRadius: '0.25rem',
                              background: 'var(--brand-500)',
                              color: 'white',
                              cursor: 'pointer',
                            }}
                          >
                            View Details →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal - Compact */}
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
              padding: '1rem',
              zIndex: 50,
            }}
            onClick={() => setSelectedExample(null)}
          >
            <div
              style={{
                background: 'var(--bg-1)',
                borderRadius: '0.5rem',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '1.5rem',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--ink-900)' }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Question */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                    Question
                  </div>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--bg-2)',
                      borderRadius: '0.5rem',
                      color: 'var(--ink-900)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedExample.question}
                  </div>
                </div>

                {/* Bridge Response */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                    Bridge's Response
                  </div>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--bg-2)',
                      borderRadius: '0.5rem',
                      color: 'var(--ink-900)',
                      fontSize: '0.875rem',
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
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                      Ideal Response
                    </div>
                    <div
                      style={{
                        padding: '0.75rem',
                        background: 'var(--success-bg)',
                        borderRadius: '0.5rem',
                        color: 'var(--ink-900)',
                        fontSize: '0.875rem',
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
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                      Ratings
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.75rem',
                      }}
                    >
                      {selectedExample.helpfulnessRating && (
                        <div
                          style={{
                            padding: '0.75rem',
                            background: 'var(--bg-2)',
                            borderRadius: '0.5rem',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--brand-600)' }}>
                            {selectedExample.helpfulnessRating}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink-700)' }}>
                            Helpfulness
                          </div>
                        </div>
                      )}
                      {selectedExample.accuracyRating && (
                        <div
                          style={{
                            padding: '0.75rem',
                            background: 'var(--bg-2)',
                            borderRadius: '0.5rem',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--brand-600)' }}>
                            {selectedExample.accuracyRating}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink-700)' }}>Accuracy</div>
                        </div>
                      )}
                      {selectedExample.toneRating && (
                        <div
                          style={{
                            padding: '0.75rem',
                            background: 'var(--bg-2)',
                            borderRadius: '0.5rem',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--brand-600)' }}>
                            {selectedExample.toneRating}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink-700)' }}>Tone</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ink-700)', marginBottom: '0.5rem' }}>
                    Metadata
                  </div>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--bg-2)',
                      borderRadius: '0.5rem',
                      fontSize: '0.8125rem',
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

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedExample(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    color: 'var(--ink-700)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
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
