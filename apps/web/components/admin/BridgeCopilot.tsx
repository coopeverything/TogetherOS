'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ContentType } from './ContentList';
import type { ContentData } from './ContentEditor';

type AssistAction = 'suggest_reflection' | 'find_statistic' | 'improve_tone' | 'expand' | 'shorten' | 'analyze' | 'suggest_visuals' | 'create_scenario';

interface AssistResponse {
  suggestion: string;
  confidence: number;
  action: AssistAction;
}

interface BridgeCopilotProps {
  content: ContentData | null;
  onApplySuggestion: (field: keyof ContentData, value: string) => void;
}

const QUICK_ACTIONS: { action: AssistAction; label: string; icon: string; description: string }[] = [
  { action: 'suggest_reflection', label: 'Suggest Reflection', icon: '💭', description: 'Generate a reflection question' },
  { action: 'find_statistic', label: 'Find Statistic', icon: '📊', description: 'Suggest a relevant number/stat' },
  { action: 'improve_tone', label: 'Improve Tone', icon: '✨', description: 'Make more engaging' },
  { action: 'expand', label: 'Expand', icon: '📝', description: 'Add more detail' },
  { action: 'shorten', label: 'Shorten', icon: '✂️', description: 'Condense content' },
  { action: 'analyze', label: 'Analyze', icon: '🔍', description: 'Get improvement tips' },
];

const VISUAL_ACTIONS: { action: AssistAction; label: string; icon: string; description: string }[] = [
  { action: 'suggest_visuals', label: 'Suggest Visuals', icon: '🎨', description: 'Get visual content ideas' },
  { action: 'create_scenario', label: 'Video Script', icon: '🎬', description: 'Create a short video scenario' },
];

export function BridgeCopilot({ content, onApplySuggestion }: BridgeCopilotProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AssistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Debounced auto-analysis
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!content?.story || content.story.length < 50) {
      setSuggestion(null);
      return;
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for auto-analysis (300ms after typing stops)
    debounceRef.current = setTimeout(() => {
      runAssist('analyze', true);
    }, 1500); // Use longer delay for auto-analysis to avoid too many requests

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [content?.story]);

  const runAssist = useCallback(async (action: AssistAction, silent = false) => {
    if (!content) return;

    const contentText = content.story || content.task || '';
    if (!contentText.trim()) {
      if (!silent) setError('Add some content first');
      return;
    }

    setIsLoading(true);
    if (!silent) setError(null);

    try {
      const response = await fetch('/api/bridge/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: content.type,
          content: contentText,
          action,
          context: content.title,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get suggestion');
      }

      const data: AssistResponse = await response.json();
      setSuggestion(data);

      if (!silent) {
        setChatHistory(prev => [
          ...prev,
          { role: 'assistant', content: data.suggestion },
        ]);
      }
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  const handleChat = useCallback(async () => {
    if (!chatInput.trim() || !content) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      // Use the analyze action with the chat message as context
      const response = await fetch('/api/bridge/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: content.type,
          content: `User's content: ${content.story || content.task || ''}\n\nUser's question: ${userMessage}`,
          action: 'analyze',
          context: content.title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: AssistResponse = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.suggestion }]);
    } catch (err) {
      setError('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  }, [chatInput, content]);

  const applySuggestion = useCallback((field: keyof ContentData) => {
    if (!suggestion) return;
    onApplySuggestion(field, suggestion.suggestion);
    setSuggestion(null);
  }, [suggestion, onApplySuggestion]);

  if (!content) {
    return (
      <div className="h-full bg-bg-1 border-l border-border p-6 flex items-center justify-center">
        <div className="text-center text-ink-500">
          <div className="text-4xl mb-3">🤖</div>
          <p className="font-medium">Bridge AI Copilot</p>
          <p className="text-base mt-1">Select content to get AI assistance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-bg-1 border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🤖</span>
          <div>
            <h3 className="font-semibold text-ink-900">Bridge AI Copilot</h3>
            <p className="text-sm text-ink-500">Ready to help you create great content</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <h4 className="text-sm font-semibold text-ink-700 uppercase tracking-wide mb-3">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(({ action, label, icon, description }) => (
            <button
              key={action}
              onClick={() => runAssist(action)}
              disabled={isLoading}
              title={description}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-left text-base rounded-lg transition-colors',
                'bg-bg-2 hover:bg-bg-3 disabled:opacity-50',
                isLoading && 'cursor-wait'
              )}
            >
              <span>{icon}</span>
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Content Actions */}
      <div className="p-4 border-b border-border">
        <h4 className="text-sm font-semibold text-ink-700 uppercase tracking-wide mb-3">
          Visual Content
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {VISUAL_ACTIONS.map(({ action, label, icon, description }) => (
            <button
              key={action}
              onClick={() => runAssist(action)}
              disabled={isLoading}
              title={description}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-left text-base rounded-lg transition-colors',
                'bg-purple-50 hover:bg-purple-100 text-purple-900 disabled:opacity-50',
                isLoading && 'cursor-wait'
              )}
            >
              <span>{icon}</span>
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Suggestion */}
      {suggestion && (
        <div className="p-4 border-b border-border bg-brand-50">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-base font-semibold text-brand-700">Suggestion</h4>
            <button
              onClick={() => setSuggestion(null)}
              className="text-ink-400 hover:text-ink-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-base text-ink-700 mb-3 whitespace-pre-wrap">
            {suggestion.suggestion}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestion.action === 'suggest_reflection' && (
              <Button
                size="sm"
                onClick={() => applySuggestion('reflection')}
              >
                Use as Reflection
              </Button>
            )}
            {suggestion.action === 'find_statistic' && (
              <Button
                size="sm"
                onClick={() => applySuggestion('number')}
              >
                Use as Statistic
              </Button>
            )}
            {(suggestion.action === 'improve_tone' || suggestion.action === 'expand' || suggestion.action === 'shorten') && (
              <Button
                size="sm"
                onClick={() => applySuggestion('story')}
              >
                Replace Content
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(suggestion.suggestion);
              }}
            >
              Copy
            </Button>
          </div>
          {suggestion.confidence < 0.6 && (
            <p className="text-sm text-ink-500 mt-2">
              Low confidence - review carefully before using
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-base">
          {error}
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.length === 0 ? (
          <div className="text-center text-ink-400 text-base py-8">
            <p>Ask Bridge anything about your content:</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>&quot;Help me write about repair cafés&quot;</li>
              <li>&quot;Make this more engaging&quot;</li>
              <li>&quot;What bias does this reveal?&quot;</li>
            </ul>
          </div>
        ) : (
          chatHistory.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg p-4 text-base',
                msg.role === 'user'
                  ? 'bg-brand-100 text-brand-900 ml-4'
                  : 'bg-bg-2 text-ink-700 mr-4'
              )}
            >
              {msg.content}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
            placeholder="Ask Bridge..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
          />
          <Button
            size="sm"
            onClick={handleChat}
            disabled={isLoading || !chatInput.trim()}
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BridgeCopilot;
