'use client';

/**
 * Learning Content Editor with Bridge AI Copilot
 * Route: /admin/onboarding
 *
 * Split-pane layout:
 * - Left: Content list (navigation)
 * - Center: Content editor with rich text (tiptap)
 * - Right: Bridge AI copilot for assistance
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ContentList, type ContentItem, type ContentType } from '@/components/admin/ContentList';
import { ContentEditor, type ContentData, type ChallengeActionType, type ChallengeCategory, type ChallengeDifficulty } from '@/components/admin/ContentEditor';
import { BridgeCopilot } from '@/components/admin/BridgeCopilot';

// Map API data to our unified ContentItem format
function mapToContentItem(type: ContentType, item: APIItem): ContentItem {
  const ch = item as APIChallenge;
  return {
    id: item.id,
    type,
    title: item.title || item.name || 'Untitled',
    status: item.isActive !== false ? 'published' : 'draft',
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    // Challenge-specific fields for First Week view
    isFirstWeek: ch.isFirstWeek,
    dayNumber: ch.dayNumber,
  };
}

// Map API data to our ContentData format for editing
function mapToContentData(type: ContentType, item: APIItem): ContentData {
  const base: ContentData = {
    id: item.id,
    type,
    title: item.title || item.name || '',
    story: '',
    number: '',
    reflection: '',
    status: item.isActive !== false ? 'published' : 'draft',
  };

  switch (type) {
    case 'microlesson':
      // Map microlesson content
      const ml = item as APIMicrolesson;
      if (ml.content?.structured) {
        base.story = ml.content.structured.introduction || '';
        base.reflection = ml.content.structured.reflection || '';
      } else if (ml.content?.markdown) {
        base.story = ml.content.markdown;
      }
      base.number = ml.description || '';
      break;

    case 'challenge':
      // Map full challenge data (from gamification consolidation)
      const fullCh = item as APIChallenge;
      base.story = fullCh.description || '';
      base.rpReward = fullCh.rpReward;
      base.category = fullCh.category as ChallengeCategory;
      base.difficulty = fullCh.difficulty as ChallengeDifficulty;
      base.actionType = fullCh.actionType as ChallengeActionType;
      base.actionTarget = fullCh.actionTarget;
      base.isFirstWeek = fullCh.isFirstWeek;
      base.dayNumber = fullCh.dayNumber;
      base.icon = fullCh.icon;
      base.microlessonId = fullCh.microlessonId;
      break;

    case 'bias_challenge':
    case 'micro_challenge':
      // Map challenge data (legacy types)
      const ch = item as APIChallenge;
      base.story = ch.description || '';
      base.rpReward = ch.rpReward;
      base.task = ch.description;
      break;

    case 'quiz':
      // Map quiz data
      const q = item as APIQuiz;
      base.story = q.question || '';
      base.options = q.options || [];
      base.correctAnswer = q.correctAnswerIndex;
      base.explanation = q.explanation || '';
      break;
  }

  return base;
}

// Convert ContentData back to API format for saving
function mapToAPIFormat(data: ContentData): Record<string, unknown> {
  const base = {
    id: data.id,
    isActive: data.status === 'published',
  };

  switch (data.type) {
    case 'microlesson':
      return {
        ...base,
        title: data.title,
        description: data.number || data.title,
        category: 'growth', // Default category
        content: {
          format: 'structured',
          structured: {
            introduction: data.story,
            keyPoints: [],
            reflection: data.reflection,
          },
        },
        rpReward: 15,
        estimatedMinutes: 5,
        sortOrder: 0,
      };

    case 'challenge':
      // Full challenge data (from gamification consolidation)
      return {
        ...base,
        name: data.title,
        description: data.story,
        category: data.category || 'social',
        difficulty: data.difficulty || 'easy',
        rpReward: data.rpReward || 25,
        actionType: data.actionType || 'complete_journey',
        actionTarget: data.actionTarget || {},
        isFirstWeek: data.isFirstWeek || false,
        dayNumber: data.dayNumber,
        icon: data.icon,
        microlessonId: data.microlessonId,
      };

    case 'bias_challenge':
    case 'micro_challenge':
      return {
        ...base,
        name: data.title,
        description: data.story || data.task,
        category: 'growth',
        difficulty: 'easy',
        rpReward: data.rpReward || 10,
        actionType: 'complete_journey',
        actionTarget: {},
        isFirstWeek: false,
      };

    case 'quiz':
      return {
        ...base,
        title: data.title,
        question: data.story,
        options: data.options || [],
        correctAnswerIndex: data.correctAnswer || 0,
        explanation: data.explanation,
        pathId: null,
        lessonId: null,
      };

    default:
      return base;
  }
}

// API item interfaces
interface APIItem {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  updatedAt?: string;
}

interface APIMicrolesson extends APIItem {
  content?: {
    format?: string;
    structured?: {
      introduction?: string;
      keyPoints?: string[];
      reflection?: string;
    };
    markdown?: string;
  };
}

interface APIChallenge extends APIItem {
  rpReward?: number;
  category?: string;
  difficulty?: string;
  actionType?: string;
  actionTarget?: Record<string, unknown>;
  isFirstWeek?: boolean;
  dayNumber?: number;
  icon?: string;
  microlessonId?: string;
}

interface APIQuiz extends APIItem {
  question?: string;
  options?: string[];
  correctAnswerIndex?: number;
  explanation?: string;
}

type ViewMode = 'editor' | 'first-week';

export default function OnboardingEditorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');

  // Content state
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<ContentData | null>(null);
  const [rawData, setRawData] = useState<Map<string, APIItem>>(new Map());

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(288); // 72 * 4 = 288px (w-72)
  const isResizing = useRef(false);
  const minWidth = 200;
  const maxWidth = 400;

  // Handle resize
  const handleMouseDown = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Auth check
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.is_admin) {
          setIsAuthorized(true);
          loadAllContent();
        } else {
          router.push('/login?redirect=/admin/onboarding');
        }
      })
      .catch(() => {
        router.push('/login?redirect=/admin/onboarding');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  // Load all content from various APIs
  const loadAllContent = useCallback(async () => {
    try {
      const [microlessonsRes, challengesRes, quizzesRes] = await Promise.all([
        fetch('/api/admin/gamification/microlessons'),
        fetch('/api/admin/gamification/challenges'),
        fetch('/api/admin/onboarding/quizzes'),
      ]);

      const [microlessonsData, challengesData, quizzesData] = await Promise.all([
        microlessonsRes.json(),
        challengesRes.json(),
        quizzesRes.json(),
      ]);

      const items: ContentItem[] = [];
      const raw = new Map<string, APIItem>();

      // Map microlessons
      if (microlessonsData.success && Array.isArray(microlessonsData.data)) {
        microlessonsData.data.forEach((ml: APIMicrolesson) => {
          items.push(mapToContentItem('microlesson', ml));
          raw.set(ml.id, ml);
        });
      }

      // Map challenges (using full 'challenge' type from gamification consolidation)
      if (challengesData.success && Array.isArray(challengesData.data)) {
        challengesData.data.forEach((ch: APIChallenge) => {
          items.push(mapToContentItem('challenge', ch));
          raw.set(ch.id, ch);
        });
      }

      // Map quizzes
      if (quizzesData.success && Array.isArray(quizzesData.data)) {
        quizzesData.data.forEach((q: APIQuiz) => {
          items.push(mapToContentItem('quiz', q));
          raw.set(q.id, q);
        });
      }

      setContentItems(items);
      setRawData(raw);
    } catch (err) {
      console.error('Failed to load content:', err);
      setError('Failed to load content');
    }
  }, []);

  // Handle content selection
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    const item = contentItems.find(i => i.id === id);
    const apiData = rawData.get(id);

    if (item && apiData) {
      setEditingContent(mapToContentData(item.type, apiData));
    }
  }, [contentItems, rawData]);

  // Handle creating new content
  const handleNew = useCallback((type: ContentType) => {
    const newId = `new-${Date.now()}`;
    const newContent: ContentData = {
      id: newId,
      type,
      title: '',
      story: '',
      number: '',
      reflection: '',
      status: 'draft',
    };

    // Add to items list
    setContentItems(prev => [{
      id: newId,
      type,
      title: 'New ' + type.replace('_', ' '),
      status: 'draft',
      updatedAt: new Date(),
    }, ...prev]);

    setSelectedId(newId);
    setEditingContent(newContent);
  }, []);

  // Handle content changes
  const handleChange = useCallback((data: Partial<ContentData>) => {
    setEditingContent(prev => prev ? { ...prev, ...data } : null);
  }, []);

  // Save content
  const handleSave = useCallback(async () => {
    if (!editingContent) return;

    setIsSaving(true);
    setError(null);

    try {
      const apiData = mapToAPIFormat(editingContent);
      const isNew = editingContent.id.startsWith('new-');

      // Determine the API endpoint based on type
      let url: string;
      let method: string;

      switch (editingContent.type) {
        case 'microlesson':
          url = isNew
            ? '/api/admin/gamification/microlessons'
            : `/api/admin/gamification/microlessons/${editingContent.id}`;
          break;
        case 'challenge':
        case 'bias_challenge':
        case 'micro_challenge':
          url = isNew
            ? '/api/admin/gamification/challenges'
            : `/api/admin/gamification/challenges/${editingContent.id}`;
          break;
        case 'quiz':
          url = isNew
            ? '/api/admin/onboarding/quizzes'
            : `/api/admin/onboarding/quizzes/${editingContent.id}`;
          break;
        default:
          throw new Error('Unknown content type');
      }

      method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const data = await res.json();

      if (data.success) {
        setLastSaved(new Date());

        // If new, update the ID
        if (isNew && data.data?.id) {
          const newId = data.data.id;
          setEditingContent(prev => prev ? { ...prev, id: newId } : null);
          setSelectedId(newId);

          // Update items list with new ID
          setContentItems(prev => prev.map(item =>
            item.id === editingContent.id
              ? { ...item, id: newId, title: editingContent.title || item.title }
              : item
          ));
        } else {
          // Update title in list
          setContentItems(prev => prev.map(item =>
            item.id === editingContent.id
              ? { ...item, title: editingContent.title || item.title, updatedAt: new Date() }
              : item
          ));
        }
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  }, [editingContent]);

  // Publish content
  const handlePublish = useCallback(async () => {
    if (!editingContent) return;

    handleChange({ status: 'published' });
    // Save will be triggered after state update
    setTimeout(handleSave, 100);
  }, [editingContent, handleChange, handleSave]);

  // Delete content
  const handleDelete = useCallback(async (id: string) => {
    const item = contentItems.find(i => i.id === id);
    if (!item || id.startsWith('new-')) {
      // Remove unsaved item
      setContentItems(prev => prev.filter(i => i.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setEditingContent(null);
      }
      return;
    }

    try {
      let url: string;
      switch (item.type) {
        case 'microlesson':
          url = `/api/admin/gamification/microlessons/${id}`;
          break;
        case 'challenge':
        case 'bias_challenge':
        case 'micro_challenge':
          url = `/api/admin/gamification/challenges/${id}`;
          break;
        case 'quiz':
          url = `/api/admin/onboarding/quizzes/${id}`;
          break;
        default:
          return;
      }

      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        setContentItems(prev => prev.filter(i => i.id !== id));
        if (selectedId === id) {
          setSelectedId(null);
          setEditingContent(null);
        }
      } else {
        setError(data.error || 'Failed to delete');
      }
    } catch (err) {
      setError('Failed to delete content');
    }
  }, [contentItems, selectedId]);

  // Apply AI suggestion to content
  const handleApplySuggestion = useCallback((field: keyof ContentData, value: string) => {
    handleChange({ [field]: value });
  }, [handleChange]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-1">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-ink-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-bg-2">
      {/* Top Bar with Exit Button and View Mode Toggle */}
      <div className="flex items-center justify-between px-4 py-2 bg-ink-900 text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-medium">Exit Editor</span>
          </Link>
          <div className="h-4 w-px bg-white/20" />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'editor'
                  ? 'bg-white text-ink-900'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Content Editor
            </button>
            <button
              onClick={() => setViewMode('first-week')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'first-week'
                  ? 'bg-white text-ink-900'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              First Week Flow
            </button>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded text-red-200 text-sm">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'first-week' ? (
        <FirstWeekFlowView
          challenges={contentItems.filter(item => item.type === 'challenge')}
          microlessons={contentItems.filter(item => item.type === 'microlesson')}
          rawData={rawData}
          onEditChallenge={(id) => {
            setViewMode('editor');
            handleSelect(id);
          }}
        />
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* Left: Content List (Resizable) */}
          <div
            className="flex-shrink-0 overflow-y-auto relative"
            style={{ width: sidebarWidth }}
          >
            <ContentList
              items={contentItems}
              selectedId={selectedId}
              onSelect={handleSelect}
              onNew={handleNew}
              onDelete={handleDelete}
            />
            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-brand-500 active:bg-brand-600 transition-colors"
              title="Drag to resize"
            />
          </div>

          {/* Center: Content Editor */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <ContentEditor
              content={editingContent}
              onChange={handleChange}
              onSave={handleSave}
              onPublish={handlePublish}
              isSaving={isSaving}
              lastSaved={lastSaved || undefined}
            />
          </div>

          {/* Right: Bridge AI Copilot */}
          <div className="w-80 flex-shrink-0 overflow-y-auto">
            <BridgeCopilot
              content={editingContent}
              onApplySuggestion={handleApplySuggestion}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// First Week Flow View Component
interface FirstWeekFlowViewProps {
  challenges: ContentItem[];
  microlessons: ContentItem[];
  rawData: Map<string, APIItem>;
  onEditChallenge: (id: string) => void;
}

function FirstWeekFlowView({ challenges, microlessons, rawData, onEditChallenge }: FirstWeekFlowViewProps) {
  // Group challenges by day
  const firstWeekChallenges = challenges
    .filter(ch => {
      const raw = rawData.get(ch.id) as APIChallenge | undefined;
      return raw?.isFirstWeek;
    })
    .sort((a, b) => {
      const rawA = rawData.get(a.id) as APIChallenge | undefined;
      const rawB = rawData.get(b.id) as APIChallenge | undefined;
      return (rawA?.dayNumber || 0) - (rawB?.dayNumber || 0);
    });

  // Group by day
  const dayGroups = new Map<number, ContentItem[]>();
  firstWeekChallenges.forEach(ch => {
    const raw = rawData.get(ch.id) as APIChallenge | undefined;
    const day = raw?.dayNumber || 1;
    if (!dayGroups.has(day)) {
      dayGroups.set(day, []);
    }
    dayGroups.get(day)!.push(ch);
  });

  return (
    <div className="flex-1 overflow-y-auto bg-bg-1 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-ink-900">First Week Onboarding Flow</h2>
          <p className="text-ink-600 mt-1">
            Challenges scheduled for new users during their first 7 days. Click on a challenge to edit it.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 7].map(day => {
            const dayChallenges = dayGroups.get(day) || [];
            return (
              <div key={day} className="relative">
                {/* Day Header */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
                    {day}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink-900">Day {day}</h3>
                    <p className="text-sm text-ink-500">
                      {dayChallenges.length === 0
                        ? 'No challenges scheduled'
                        : `${dayChallenges.length} challenge${dayChallenges.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                {/* Challenges for this day */}
                {dayChallenges.length > 0 ? (
                  <div className="ml-6 pl-10 border-l-2 border-border space-y-3">
                    {dayChallenges.map(ch => {
                      const raw = rawData.get(ch.id) as APIChallenge | undefined;
                      const linkedMicrolesson = raw?.microlessonId
                        ? microlessons.find(ml => ml.id === raw.microlessonId)
                        : null;

                      return (
                        <div
                          key={ch.id}
                          onClick={() => onEditChallenge(ch.id)}
                          className="bg-white rounded-lg border border-border p-4 hover:border-brand-300 hover:shadow-sm cursor-pointer transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{raw?.icon || '⭐'}</span>
                            <div className="flex-1">
                              <h4 className="font-medium text-ink-900">{ch.title}</h4>
                              <div className="flex items-center gap-4 mt-2 text-sm text-ink-600">
                                <span className="capitalize">{raw?.category || 'social'}</span>
                                <span>{raw?.rpReward || 25} RP</span>
                                <span className="capitalize">{raw?.difficulty || 'easy'}</span>
                              </div>
                              {linkedMicrolesson && (
                                <div className="mt-2 text-sm text-brand-600 flex items-center gap-1">
                                  <span>📖</span>
                                  <span>Linked: {linkedMicrolesson.title}</span>
                                </div>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              ch.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {ch.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="ml-6 pl-10 border-l-2 border-border">
                    <div className="bg-bg-2 rounded-lg border border-dashed border-border p-4 text-center text-ink-500">
                      No challenges for Day {day}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 p-4 bg-brand-50 rounded-lg border border-brand-200">
          <h3 className="font-semibold text-brand-900 mb-2">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-brand-700">Total First Week Challenges:</span>
              <span className="ml-2 font-semibold text-brand-900">{firstWeekChallenges.length}</span>
            </div>
            <div>
              <span className="text-brand-700">Days Covered:</span>
              <span className="ml-2 font-semibold text-brand-900">{dayGroups.size}/7</span>
            </div>
            <div>
              <span className="text-brand-700">Total RP Available:</span>
              <span className="ml-2 font-semibold text-brand-900">
                {firstWeekChallenges.reduce((sum, ch) => {
                  const raw = rawData.get(ch.id) as APIChallenge | undefined;
                  return sum + (raw?.rpReward || 25);
                }, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
