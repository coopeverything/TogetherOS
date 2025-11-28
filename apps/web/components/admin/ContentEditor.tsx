'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ContentType } from './ContentList';

export interface ContentData {
  id: string;
  type: ContentType;
  title: string;
  story: string; // Main rich text content
  number: string; // Statistic/number field
  reflection: string; // Reflection question
  status: 'draft' | 'published';
  // Additional fields for specific types
  options?: string[]; // For quiz/bias challenge
  correctAnswer?: number; // For quiz
  explanation?: string; // For quiz/bias challenge
  rpReward?: number; // For challenges
  task?: string; // For micro-challenges
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
  bias_challenge: 'Bias Challenge',
  micro_challenge: 'Micro-Challenge',
  quiz: 'Quiz Question',
};

const CONTENT_TYPE_DESCRIPTIONS: Record<ContentType, string> = {
  microlesson: '60-90 second learning experience: Story → Number → Reflection',
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
      <div className="flex-1 flex items-center justify-center bg-bg-1">
        <div className="text-center text-ink-500">
          <p className="text-lg mb-2">Select content to edit</p>
          <p className="text-sm">Or create new content from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-brand-600">
              {CONTENT_TYPE_LABELS[content.type]}
            </span>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded',
              content.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            )}>
              {content.status}
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            {CONTENT_TYPE_DESCRIPTIONS[content.type]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-ink-500">
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
            <label className="block text-sm font-medium text-ink-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Enter a compelling title..."
              className="w-full px-4 py-3 text-xl font-semibold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Type-specific fields */}
          {content.type === 'microlesson' && (
            <MicrolessonFields content={content} onChange={onChange} />
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

// Microlesson Fields: Story → Number → Reflection
function MicrolessonFields({
  content,
  onChange,
}: {
  content: ContentData;
  onChange: (data: Partial<ContentData>) => void;
}) {
  return (
    <>
      <RichTextField
        label="Story"
        value={content.story}
        onChange={(story) => onChange({ story })}
        placeholder="Tell a compelling story that creates emotional connection..."
        hint="The narrative that hooks the reader (60-90 seconds to read)"
      />

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Number / Statistic
        </label>
        <input
          type="text"
          value={content.number || ''}
          onChange={(e) => onChange({ number: e.target.value })}
          placeholder="e.g., '40% of food in America is wasted'"
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <p className="text-xs text-ink-500 mt-1">
          A striking statistic that grounds the story in reality
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Reflection Question
        </label>
        <textarea
          value={content.reflection || ''}
          onChange={(e) => onChange({ reflection: e.target.value })}
          placeholder="What's one way you could..."
          rows={2}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <p className="text-xs text-ink-500 mt-1">
          Open-ended question connecting to personal experience
        </p>
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
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Options (A or B choice)
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink-500 w-6">
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
        <label className="block text-sm font-medium text-ink-700 mb-2">
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
          <label className="block text-sm font-medium text-ink-700 mb-2">
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
        <label className="block text-sm font-medium text-ink-700 mb-2">
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
        <label className="block text-sm font-medium text-ink-700 mb-2">
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
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Answer Options
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ correctAnswer: index })}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
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
        <p className="text-xs text-ink-500 mt-2">
          Click a letter to mark the correct answer
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
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
    onUpdate: ({ editor }) => {
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
      <label className="block text-sm font-medium text-ink-700 mb-2">
        {label}
      </label>
      <div className="border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      {hint && (
        <p className="text-xs text-ink-500 mt-1">{hint}</p>
      )}
    </div>
  );
}

// Tiptap Editor Toolbar
function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-bg-2">
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
