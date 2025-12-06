'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ContentType } from './ContentList';

// Action types from gamification module
export const CHALLENGE_ACTION_TYPES = [
  'post_message', 'post_comment', 'view_paths', 'add_skills', 'send_invitation',
  'proposal_interact', 'complete_journey', 'welcome_member', 'start_thread',
  'offer_help', 'share_resource', 'rate_proposal', 'update_profile', 'visit_group', 'join_group',
] as const;

export type ChallengeActionType = typeof CHALLENGE_ACTION_TYPES[number];

export const CHALLENGE_CATEGORIES = ['social', 'contribution', 'exploration', 'growth'] as const;
export type ChallengeCategory = typeof CHALLENGE_CATEGORIES[number];

export const CHALLENGE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type ChallengeDifficulty = typeof CHALLENGE_DIFFICULTIES[number];

// Microlesson card types for visual lesson building
export type MicrolessonCardType = 'text' | 'image' | 'video' | 'statistic' | 'reflection';

export interface MicrolessonCard {
  id: string;
  type: MicrolessonCardType;
  content: string; // Rich text content for text cards, or description for media
  imageUrl?: string; // For image cards
  videoUrl?: string; // For video cards (YouTube, Vimeo, or direct URL)
  caption?: string; // Caption for images/videos
  altText?: string; // Alt text for accessibility
  statistic?: string; // For statistic cards (e.g., "40%")
  statisticLabel?: string; // Label for statistic (e.g., "of food is wasted")
  question?: string; // For reflection cards
  order: number; // For drag-drop reordering
}

export interface ContentData {
  id: string;
  type: ContentType;
  title: string;
  story: string; // Main rich text content (legacy, still used for non-card types)
  number: string; // Statistic/number field (legacy)
  reflection: string; // Reflection question (legacy)
  status: 'draft' | 'published';
  // Card-based microlessons
  cards?: MicrolessonCard[]; // Array of cards for microlessons
  // Additional fields for specific types
  options?: string[]; // For quiz/bias challenge
  correctAnswer?: number; // For quiz
  explanation?: string; // For quiz/bias challenge
  rpReward?: number; // For challenges
  task?: string; // For micro-challenges
  // Full challenge fields (from gamification)
  category?: ChallengeCategory;
  difficulty?: ChallengeDifficulty;
  actionType?: ChallengeActionType;
  actionTarget?: Record<string, unknown>;
  isFirstWeek?: boolean;
  dayNumber?: number;
  icon?: string;
  microlessonId?: string;
}

interface ContentEditorProps {
  content: ContentData | null;
  onChange: (data: Partial<ContentData>) => void;
  onSave: () => void;
  onPublish: () => void;
  isSaving?: boolean;
  lastSaved?: Date;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  microlesson: 'Microlesson',
  challenge: 'Challenge',
  bias_challenge: 'Bias Challenge',
  micro_challenge: 'Micro-Challenge',
  quiz: 'Quiz Question',
};

const CONTENT_TYPE_DESCRIPTIONS: Record<ContentType, string> = {
  microlesson: '60-90 second learning experience: Story → Number → Reflection',
  challenge: 'Full challenge with action type, RP reward, and optional first-week scheduling',
  bias_challenge: 'Quick scenario revealing cognitive bias (1-2 taps)',
  micro_challenge: '3-5 minute actionable task with RP reward',
  quiz: 'Multiple choice question with explanation',
};

export function ContentEditor({
  content,
  onChange,
  onSave,
  onPublish,
  isSaving,
  lastSaved,
}: ContentEditorProps) {
  if (!content) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-1">
        <div className="text-center text-ink-500">
          <p className="text-xl mb-2">Select content to edit</p>
          <p className="text-base">Or create new content from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-1">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white dark:bg-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-brand-600">
              {CONTENT_TYPE_LABELS[content.type]}
            </span>
            <span className={cn(
              'text-sm px-3 py-0.5 rounded',
              content.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            )}>
              {content.status}
            </span>
          </div>
          <p className="text-sm text-ink-500 mt-0.5">
            {CONTENT_TYPE_DESCRIPTIONS[content.type]}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-ink-500">
              Saved {formatTime(lastSaved)}
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            size="sm"
            onClick={onPublish}
            disabled={isSaving}
          >
            Publish
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <label className="block text-base font-medium text-ink-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Enter a compelling title..."
              className="w-full px-4 py-3 text-2xl font-semibold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Type-specific fields */}
          {content.type === 'microlesson' && (
            <MicrolessonFields content={content} onChange={onChange} />
          )}
          {content.type === 'challenge' && (
            <ChallengeFields content={content} onChange={onChange} />
          )}
          {content.type === 'bias_challenge' && (
            <BiasChallengeFields content={content} onChange={onChange} />
          )}
          {content.type === 'micro_challenge' && (
            <MicroChallengeFields content={content} onChange={onChange} />
          )}
          {content.type === 'quiz' && (
            <QuizFields content={content} onChange={onChange} />
          )}
        </div>
      </div>
    </div>
  );
}

// Microlesson Fields: Card-based visual lesson builder
function MicrolessonFields({
  content,
  onChange,
}: {
  content: ContentData;
  onChange: (data: Partial<ContentData>) => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [bridgeSuggestion, setBridgeSuggestion] = useState<string | null>(null);

  const cards = content.cards || [];

  const generateId = () => `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const addCard = (type: MicrolessonCardType) => {
    const newCard: MicrolessonCard = {
      id: generateId(),
      type,
      content: '',
      order: cards.length,
    };
    onChange({ cards: [...cards, newCard] });
  };

  const updateCard = (cardId: string, updates: Partial<MicrolessonCard>) => {
    onChange({
      cards: cards.map(card =>
        card.id === cardId ? { ...card, ...updates } : card
      ),
    });
  };

  const deleteCard = (cardId: string) => {
    onChange({
      cards: cards.filter(card => card.id !== cardId).map((card, index) => ({
        ...card,
        order: index,
      })),
    });
  };

  const moveCard = (cardId: string, direction: 'up' | 'down') => {
    const index = cards.findIndex(c => c.id === cardId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === cards.length - 1)
    ) return;

    const newCards = [...cards];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newCards[index], newCards[swapIndex]] = [newCards[swapIndex], newCards[index]];
    onChange({
      cards: newCards.map((card, i) => ({ ...card, order: i })),
    });
  };

  const askBridgeForScenario = async () => {
    setIsGenerating(true);
    setBridgeSuggestion(null);
    try {
      const res = await fetch('/api/bridge/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'microlesson_scenario',
          context: {
            title: content.title,
            existingCards: cards.map(c => ({ type: c.type, content: c.content?.slice(0, 100) })),
          },
          prompt: `Suggest a compelling real-world scenario for a microlesson titled "${content.title || 'Untitled'}".
                   The scenario should be emotionally engaging, include a specific character/situation,
                   and naturally lead to a surprising statistic and reflection question.
                   Return as JSON: { scenario: string, suggestedStatistic: string, reflectionQuestion: string }`,
        }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setBridgeSuggestion(data.suggestion);
      } else if (data.response) {
        setBridgeSuggestion(data.response);
      }
    } catch (error) {
      console.error('Bridge suggestion error:', error);
      setBridgeSuggestion('Unable to generate suggestion. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyBridgeSuggestion = () => {
    if (!bridgeSuggestion) return;
    try {
      const parsed = JSON.parse(bridgeSuggestion);
      const newCards: MicrolessonCard[] = [];

      if (parsed.scenario) {
        newCards.push({
          id: generateId(),
          type: 'text',
          content: `<p>${parsed.scenario}</p>`,
          order: 0,
        });
      }
      if (parsed.suggestedStatistic) {
        const [stat, ...labelParts] = parsed.suggestedStatistic.split(' ');
        newCards.push({
          id: generateId(),
          type: 'statistic',
          content: '',
          statistic: stat,
          statisticLabel: labelParts.join(' '),
          order: 1,
        });
      }
      if (parsed.reflectionQuestion) {
        newCards.push({
          id: generateId(),
          type: 'reflection',
          content: '',
          question: parsed.reflectionQuestion,
          order: 2,
        });
      }

      if (newCards.length > 0) {
        onChange({ cards: [...cards, ...newCards].map((c, i) => ({ ...c, order: i })) });
        setBridgeSuggestion(null);
      }
    } catch {
      // If not JSON, just add as text card
      const newCard: MicrolessonCard = {
        id: generateId(),
        type: 'text',
        content: `<p>${bridgeSuggestion}</p>`,
        order: cards.length,
      };
      onChange({ cards: [...cards, newCard] });
      setBridgeSuggestion(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bridge AI Suggestion */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌉</span>
            <span className="font-medium text-purple-900">Bridge AI Assistant</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={askBridgeForScenario}
            disabled={isGenerating}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Generating...
              </>
            ) : (
              '✨ Suggest Scenario'
            )}
          </Button>
        </div>
        <p className="text-base text-purple-700">
          Let Bridge suggest a compelling real-world scenario, statistic, and reflection question
        </p>

        {bridgeSuggestion && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200">
            <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">{bridgeSuggestion}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={applyBridgeSuggestion}>
                Apply Suggestion
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setBridgeSuggestion(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Card Buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-base text-ink-600 self-center mr-2">Add card:</span>
        <button
          type="button"
          onClick={() => addCard('text')}
          className="px-3 py-1.5.5 text-base bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          📝 Text
        </button>
        <button
          type="button"
          onClick={() => addCard('image')}
          className="px-3 py-1.5.5 text-base bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
        >
          🖼️ Image
        </button>
        <button
          type="button"
          onClick={() => addCard('video')}
          className="px-3 py-1.5.5 text-base bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
        >
          🎬 Video
        </button>
        <button
          type="button"
          onClick={() => addCard('statistic')}
          className="px-3 py-1.5.5 text-base bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1"
        >
          📊 Statistic
        </button>
        <button
          type="button"
          onClick={() => addCard('reflection')}
          className="px-3 py-1.5.5 text-base bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"
        >
          💭 Reflection
        </button>
      </div>

      {/* Cards List */}
      {cards.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-ink-500 mb-2">No cards yet</p>
          <p className="text-base text-ink-400">
            Add cards to build your microlesson, or let Bridge suggest a scenario
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.sort((a, b) => a.order - b.order).map((card, index) => (
            <MicrolessonCardEditor
              key={card.id}
              card={card}
              index={index}
              totalCards={cards.length}
              onUpdate={(updates) => updateCard(card.id, updates)}
              onDelete={() => deleteCard(card.id)}
              onMove={(direction) => moveCard(card.id, direction)}
            />
          ))}
        </div>
      )}

      {/* Legacy fields for backward compatibility - hidden if cards exist */}
      {cards.length === 0 && (
        <div className="border-t border-border pt-6 mt-6">
          <p className="text-sm text-ink-500 mb-4">
            Or use legacy single-field format:
          </p>
          <RichTextField
            label="Story"
            value={content.story}
            onChange={(story) => onChange({ story })}
            placeholder="Tell a compelling story..."
            hint="The narrative that hooks the reader"
          />
        </div>
      )}
    </div>
  );
}

// Individual Microlesson Card Editor
function MicrolessonCardEditor({
  card,
  index,
  totalCards,
  onUpdate,
  onDelete,
  onMove,
}: {
  card: MicrolessonCard;
  index: number;
  totalCards: number;
  onUpdate: (updates: Partial<MicrolessonCard>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}) {
  const cardTypeConfig: Record<MicrolessonCardType, { icon: string; label: string; color: string }> = {
    text: { icon: '📝', label: 'Text', color: 'bg-blue-50 border-blue-200' },
    image: { icon: '🖼️', label: 'Image', color: 'bg-green-50 border-green-200' },
    video: { icon: '🎬', label: 'Video', color: 'bg-red-50 border-red-200' },
    statistic: { icon: '📊', label: 'Statistic', color: 'bg-orange-50 border-orange-200' },
    reflection: { icon: '💭', label: 'Reflection', color: 'bg-purple-50 border-purple-200' },
  };

  const config = cardTypeConfig[card.type];

  return (
    <div className={cn('rounded-lg border-2 p-4', config.color)}>
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <span className="text-base font-medium text-ink-700">
            Card {index + 1}: {config.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 text-ink-500 hover:text-ink-700 disabled:opacity-30"
            title="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove('down')}
            disabled={index === totalCards - 1}
            className="p-1 text-ink-500 hover:text-ink-700 disabled:opacity-30"
            title="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-red-500 hover:text-red-700 ml-2"
            title="Delete card"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Card Content by Type */}
      {card.type === 'text' && (
        <RichTextField
          label="Content"
          value={card.content}
          onChange={(content) => onUpdate({ content })}
          placeholder="Write your story segment..."
          hint="Use rich text formatting for emphasis"
        />
      )}

      {card.type === 'image' && (
        <div className="space-y-3">
          <div>
            <label className="block text-base font-medium text-ink-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={card.imageUrl || ''}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {card.imageUrl && (
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={card.imageUrl}
                alt={card.altText || 'Preview'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" x="50" text-anchor="middle" fill="%23999">Image Error</text></svg>';
                }}
              />
            </div>
          )}
          <div>
            <label className="block text-base font-medium text-ink-700 mb-1">
              Caption
            </label>
            <input
              type="text"
              value={card.caption || ''}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              placeholder="Describe what's shown in this image..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-ink-700 mb-1">
              Alt Text (Accessibility)
            </label>
            <input
              type="text"
              value={card.altText || ''}
              onChange={(e) => onUpdate({ altText: e.target.value })}
              placeholder="Describe the image for screen readers..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      )}

      {card.type === 'video' && (
        <div className="space-y-3">
          <div>
            <label className="block text-base font-medium text-ink-700 mb-1">
              Video URL
            </label>
            <input
              type="url"
              value={card.videoUrl || ''}
              onChange={(e) => onUpdate({ videoUrl: e.target.value })}
              placeholder="YouTube, Vimeo, or direct video URL..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-sm text-ink-500 mt-1">
              Supports YouTube, Vimeo, and direct video links
            </p>
          </div>
          {card.videoUrl && (
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
              {card.videoUrl.includes('youtube.com') || card.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(card.videoUrl)}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : card.videoUrl.includes('vimeo.com') ? (
                <iframe
                  src={`https://player.vimeo.com/video/${extractVimeoId(card.videoUrl)}`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={card.videoUrl} controls className="w-full h-full" />
              )}
            </div>
          )}
          <div>
            <label className="block text-base font-medium text-ink-700 mb-1">
              Caption
            </label>
            <input
              type="text"
              value={card.caption || ''}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              placeholder="Video description..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      )}

      {card.type === 'statistic' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-base font-medium text-ink-700 mb-1">
                Number
              </label>
              <input
                type="text"
                value={card.statistic || ''}
                onChange={(e) => onUpdate({ statistic: e.target.value })}
                placeholder="40%"
                className="w-full px-3 py-2 text-3xl font-bold text-center border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-base font-medium text-ink-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={card.statisticLabel || ''}
                onChange={(e) => onUpdate({ statisticLabel: e.target.value })}
                placeholder="of food in America is wasted"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          {/* Preview */}
          {(card.statistic || card.statisticLabel) && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
              <span className="text-4xl font-bold text-orange-600">{card.statistic || '—'}</span>
              <span className="text-xl text-ink-700 ml-2">{card.statisticLabel}</span>
            </div>
          )}
        </div>
      )}

      {card.type === 'reflection' && (
        <div className="space-y-3">
          <div>
            <label className="block text-base font-medium text-ink-700 mb-1">
              Reflection Question
            </label>
            <textarea
              value={card.question || ''}
              onChange={(e) => onUpdate({ question: e.target.value })}
              placeholder="What's one way you could..."
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <p className="text-sm text-ink-500 mt-1">
              Open-ended question connecting to personal experience
            </p>
          </div>
          {/* Preview */}
          {card.question && (
            <div className="p-4 bg-purple-100 rounded-lg">
              <p className="text-purple-800 italic">&ldquo;{card.question}&rdquo;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper functions for video URL parsing
function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : '';
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : '';
}

// Full Challenge Fields (from gamification consolidation)
function ChallengeFields({
  content,
  onChange,
}: {
  content: ContentData;
  onChange: (data: Partial<ContentData>) => void;
}) {
  return (
    <>
      <RichTextField
        label="Description"
        value={content.story}
        onChange={(story) => onChange({ story })}
        placeholder="Describe what the user should do..."
        hint="Use rich text to make the challenge engaging"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-medium text-ink-700 mb-2">
            Category
          </label>
          <select
            value={content.category || 'social'}
            onChange={(e) => onChange({ category: e.target.value as ChallengeCategory })}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-gray-800"
          >
            {CHALLENGE_CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="capitalize">{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-base font-medium text-ink-700 mb-2">
            Difficulty
          </label>
          <select
            value={content.difficulty || 'easy'}
            onChange={(e) => onChange({ difficulty: e.target.value as ChallengeDifficulty })}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-gray-800"
          >
            {CHALLENGE_DIFFICULTIES.map(diff => (
              <option key={diff} value={diff} className="capitalize">{diff}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-medium text-ink-700 mb-2">
            RP Reward
          </label>
          <input
            type="number"
            value={content.rpReward || 25}
            onChange={(e) => onChange({ rpReward: parseInt(e.target.value) || 0 })}
            min={1}
            max={100}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-ink-700 mb-2">
            Action Type
          </label>
          <select
            value={content.actionType || 'complete_journey'}
            onChange={(e) => onChange({ actionType: e.target.value as ChallengeActionType })}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-gray-800"
          >
            {CHALLENGE_ACTION_TYPES.map(action => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-base font-medium text-ink-700 mb-2">
          Icon (optional)
        </label>
        <input
          type="text"
          value={content.icon || ''}
          onChange={(e) => onChange({ icon: e.target.value })}
          placeholder="e.g., wave, star, trophy"
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* First Week Scheduling */}
      <div className="p-4 bg-bg-2 rounded-lg border border-border">
        <div className="flex items-center gap-4 mb-3">
          <input
            type="checkbox"
            id="isFirstWeek"
            checked={content.isFirstWeek || false}
            onChange={(e) => onChange({ isFirstWeek: e.target.checked })}
            className="w-4 h-4 text-brand-600 border-border rounded focus:ring-brand-500"
          />
          <label htmlFor="isFirstWeek" className="text-base font-medium text-ink-700">
            First Week Challenge
          </label>
        </div>
        {content.isFirstWeek && (
          <div>
            <label className="block text-base font-medium text-ink-700 mb-2">
              Day Number (1-7)
            </label>
            <select
              value={content.dayNumber || 1}
              onChange={(e) => onChange({ dayNumber: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-gray-800"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <option key={day} value={day}>Day {day}</option>
              ))}
            </select>
            <p className="text-sm text-ink-500 mt-1">
              This challenge will be shown to new users on Day {content.dayNumber || 1} of onboarding
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// Bias Challenge Fields
function BiasChallengeFields({
  content,
  onChange,
}: {
  content: ContentData;
  onChange: (data: Partial<ContentData>) => void;
}) {
  const options = content.options || ['', ''];

  return (
    <>
      <RichTextField
        label="Scenario"
        value={content.story}
        onChange={(story) => onChange({ story })}
        placeholder="Present a quick scenario that reveals cognitive bias..."
        hint="Keep it brief - this should take 1-2 taps to complete"
      />

      <div>
        <label className="block text-base font-medium text-ink-700 mb-2">
          Options (A or B choice)
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-base font-medium text-ink-500 w-6">
                {String.fromCharCode(65 + index)}
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  onChange({ options: newOptions });
                }}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-base font-medium text-ink-700 mb-2">
          Reveal (The Bias Explained)
        </label>
        <textarea
          value={content.explanation || ''}
          onChange={(e) => onChange({ explanation: e.target.value })}
          placeholder="Explain the cognitive bias at play..."
          rows={3}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>
    </>
  );
}

// Micro-Challenge Fields
function MicroChallengeFields({
  content,
  onChange,
}: {
  content: ContentData;
  onChange: (data: Partial<ContentData>) => void;
}) {
  return (
    <>
      <RichTextField
        label="Task Description"
        value={content.task || ''}
        onChange={(task) => onChange({ task })}
        placeholder="Describe the action the user should take..."
        hint="Should be completable in 3-5 minutes, reversible if possible"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-medium text-ink-700 mb-2">
            RP Reward
          </label>
          <input
            type="number"
            value={content.rpReward || 10}
            onChange={(e) => onChange({ rpReward: parseInt(e.target.value) || 0 })}
            min={1}
            max={100}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-base font-medium text-ink-700 mb-2">
          Completion Criteria
        </label>
        <textarea
          value={content.reflection || ''}
          onChange={(e) => onChange({ reflection: e.target.value })}
          placeholder="How do we verify completion?"
          rows={2}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>
    </>
  );
}

// Quiz Fields
function QuizFields({
  content,
  onChange,
}: {
  content: ContentData;
  onChange: (data: Partial<ContentData>) => void;
}) {
  const options = content.options || ['', '', '', ''];

  return (
    <>
      <div>
        <label className="block text-base font-medium text-ink-700 mb-2">
          Question
        </label>
        <textarea
          value={content.story}
          onChange={(e) => onChange({ story: e.target.value })}
          placeholder="Enter your question..."
          rows={2}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-base font-medium text-ink-700 mb-2">
          Answer Options
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ correctAnswer: index })}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-base font-medium transition-colors',
                  content.correctAnswer === index
                    ? 'bg-green-600 text-white'
                    : 'bg-bg-2 text-ink-700 hover:bg-bg-3'
                )}
                title={content.correctAnswer === index ? 'Correct answer' : 'Click to mark as correct'}
              >
                {String.fromCharCode(65 + index)}
              </button>
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  onChange({ options: newOptions });
                }}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-ink-500 mt-2">
          Click a letter to mark the correct answer
        </p>
      </div>

      <div>
        <label className="block text-base font-medium text-ink-700 mb-2">
          Explanation
        </label>
        <textarea
          value={content.explanation || ''}
          onChange={(e) => onChange({ explanation: e.target.value })}
          placeholder="Explain why this is the correct answer..."
          rows={3}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>
    </>
  );
}

// Reusable Rich Text Field with Tiptap
function RichTextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-3',
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div>
      <label className="block text-base font-medium text-ink-700 mb-2">
        {label}
      </label>
      <div className="border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      {hint && (
        <p className="text-sm text-ink-500 mt-1">{hint}</p>
      )}
    </div>
  );
}

// Tiptap Editor Toolbar
function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-bg-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <em>I</em>
      </ToolbarButton>
      <div className="w-px h-4 bg-border mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      </ToolbarButton>
      <div className="w-px h-4 bg-border mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        isActive
          ? 'bg-brand-100 text-brand-700'
          : 'text-ink-600 hover:bg-bg-3'
      )}
    >
      {children}
    </button>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return new Date(date).toLocaleTimeString();
}

export default ContentEditor;
