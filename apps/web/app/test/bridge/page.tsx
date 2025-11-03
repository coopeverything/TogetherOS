'use client';

import * as React from 'react';
import { useState } from 'react';
import { BridgeChat } from '@togetheros/ui';
import { Card, Badge, Button } from '@/components/ui';

export default function BridgeTestPage() {
  const [activeTab, setActiveTab] = useState<'showcase' | 'demo' | 'api'>('showcase');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bridge Components Test Page</h1>
          <p className="mt-2 text-gray-600">
            Testing interface for Bridge AI assistant components and interactions.
          </p>
          <div className="mt-3 flex gap-2">
            <Badge variant="brand">Phase 1 (Planned)</Badge>
            <Badge variant="default">UI Components Ready</Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'showcase' as const, label: 'Component Showcase' },
              { id: 'demo' as const, label: 'Interactive Demo' },
              { id: 'api' as const, label: 'API Documentation' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Component Showcase Tab */}
          {activeTab === 'showcase' && (
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-semibold mb-4">BridgeChat Component</h2>
                <p className="text-gray-600 mb-6">
                  Interactive Q&A interface with streaming responses, error handling, and rate limiting.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Default State</h3>
                    <Card className="p-4">
                      <BridgeChat />
                    </Card>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Component Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Streaming Responses</h3>
                    <p className="text-sm text-gray-600">
                      Displays answers as they arrive from the Bridge AI, providing real-time feedback.
                    </p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Error Handling</h3>
                    <p className="text-sm text-gray-600">
                      Handles network errors, rate limiting (429), and empty questions with clear messages.
                    </p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Markdown Links</h3>
                    <p className="text-sm text-gray-600">
                      Converts [text](url) format into clickable links in responses.
                    </p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Loading States</h3>
                    <p className="text-sm text-gray-600">
                      Clear visual feedback during question submission and answer streaming.
                    </p>
                  </Card>
                </div>
              </section>
            </div>
          )}

          {/* Interactive Demo Tab */}
          {activeTab === 'demo' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Live Bridge Demo</h2>
                <p className="text-gray-600 mt-1 mb-6">
                  Try asking Bridge questions about TogetherOS, cooperation, and community organization.
                </p>
              </div>

              <Card className="p-6">
                <BridgeChat />
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Suggested Questions</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>What is TogetherOS?</li>
                  <li>How does cooperative governance work?</li>
                  <li>What are the 8 Cooperation Paths?</li>
                  <li>How can I join a local group?</li>
                  <li>What is the Social Economy module?</li>
                </ul>
              </div>
            </div>
          )}

          {/* API Documentation Tab */}
          {activeTab === 'api' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Bridge API Endpoints</h2>
                <p className="text-gray-600 mb-6">
                  API routes for Bridge AI interactions. These endpoints will be implemented in Phase 1.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">POST /api/bridge/ask</h3>
                <p className="text-sm text-gray-600">Submit a question to Bridge AI and receive a streaming response.</p>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Request Body:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  question: string    // User's question (trimmed, non-empty)
}`}
                  </pre>
                  <h4 className="font-semibold mt-4 mb-2">Response (Streaming):</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`// Content-Type: text/plain; charset=utf-8
// Transfer-Encoding: chunked

Answer text streamed in real-time...

Sources:
- [Document Title](https://example.com/doc)
- [Another Source](https://example.com/source)`}
                  </pre>
                  <h4 className="font-semibold mt-4 mb-2">Error Responses:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`// 204 No Content - Empty question
// 429 Too Many Requests - Rate limit exceeded
{
  "message": "Rate limit exceeded. Try again in 3600 seconds.",
  "retryAfter": 3600
}

// 500 Internal Server Error
{
  "error": "Error message"
}`}
                  </pre>
                </Card>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">Rate Limiting</h3>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Limits:</h4>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    <li><strong>Per IP:</strong> 30 requests per hour</li>
                    <li><strong>Window:</strong> Rolling 1-hour window</li>
                    <li><strong>Storage:</strong> In-memory (per-process)</li>
                  </ul>
                  <h4 className="font-semibold mt-4 mb-2">Headers:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1699123456`}
                  </pre>
                </Card>
              </section>

              <section className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Implementation Status</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Bridge module is currently at 0% code implementation. Phase 1 will include:
                </p>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>POST /api/bridge/ask endpoint (streaming)</li>
                  <li>LLM integration (OpenAI/Anthropic)</li>
                  <li>Document embedding and RAG</li>
                  <li>Citation extraction and source links</li>
                  <li>NDJSON audit logging</li>
                  <li>IP-based rate limiting</li>
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
