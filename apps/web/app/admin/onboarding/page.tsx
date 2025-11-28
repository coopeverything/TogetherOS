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

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ContentList, type ContentItem, type ContentType } from '@/components/admin/ContentList';
import { ContentEditor, type ContentData } from '@/components/admin/ContentEditor';
import { BridgeCopilot } from '@/components/admin/BridgeCopilot';

// Map API data to our unified ContentItem format
function mapToContentItem(type: ContentType, item: APIItem): ContentItem {
  return {
    id: item.id,
    type,
    title: item.title || item.name || 'Untitled',
    status: item.isActive !== false ? 'published' : 'draft',
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
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

    case 'bias_challenge':
    case 'micro_challenge':
      // Map challenge data
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
}

interface APIQuiz extends APIItem {
  question?: string;
  options?: string[];
  correctAnswerIndex?: number;
  explanation?: string;
}

export default function OnboardingEditorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Content state
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<ContentData | null>(null);
  const [rawData, setRawData] = useState<Map<string, APIItem>>(new Map());

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      // Map challenges (as micro_challenge or bias_challenge based on description)
      if (challengesData.success && Array.isArray(challengesData.data)) {
        challengesData.data.forEach((ch: APIChallenge) => {
          const type: ContentType = ch.category === 'growth' ? 'bias_challenge' : 'micro_challenge';
          items.push(mapToContentItem(type, ch));
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
    <div className="h-screen flex flex-col bg-bg-2">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between">
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Split-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Content List */}
        <div className="w-72 flex-shrink-0">
          <ContentList
            items={contentItems}
            selectedId={selectedId}
            onSelect={handleSelect}
            onNew={handleNew}
            onDelete={handleDelete}
          />
        </div>

        {/* Center: Content Editor */}
        <ContentEditor
          content={editingContent}
          onChange={handleChange}
          onSave={handleSave}
          onPublish={handlePublish}
          isSaving={isSaving}
          lastSaved={lastSaved || undefined}
        />

        {/* Right: Bridge AI Copilot */}
        <BridgeCopilot
          content={editingContent}
          onApplySuggestion={handleApplySuggestion}
        />
      </div>
    </div>
  );
}
