/**
 * Evidence Attachment Component
 * Modal for adding evidence URLs to thread posts with viewpoint tagging
 */

'use client';

import { useState } from 'react';

interface EvidenceAttachmentProps {
  postId: string;
  onSubmit?: (evidence: { url: string; viewpoint: string; description?: string }) => void;
  onCancel?: () => void;
}

const viewpoints = [
  { value: 'support', label: 'Supports this view', color: 'green' },
  { value: 'oppose', label: 'Opposes this view', color: 'red' },
  { value: 'neutral', label: 'Provides context', color: 'blue' },
];

export function EvidenceAttachment({ postId, onSubmit, onCancel }: EvidenceAttachmentProps) {
  const [url, setUrl] = useState('');
  const [viewpoint, setViewpoint] = useState('support');
  const [description, setDescription] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!url || !validateUrl(url)) {
      alert('Please enter a valid URL');
      return;
    }

    onSubmit?.({ url, viewpoint, description });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Add Evidence</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link to article, study, video, or other evidence
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Viewpoint *</label>
            <div className="space-y-2">
              {viewpoints.map((vp) => (
                <label
                  key={vp.value}
                  className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700"
                >
                  <input
                    type="radio"
                    name="viewpoint"
                    value={vp.value}
                    checked={viewpoint === vp.value}
                    onChange={(e) => setViewpoint(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className={`font-medium text-${vp.color}-600`}>{vp.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief explanation of why this evidence is relevant..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Evidence
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Evidence will be verified by moderators and Bridge AI. Include sources that advance the discussion.
        </p>
      </div>
    </div>
  );
}
