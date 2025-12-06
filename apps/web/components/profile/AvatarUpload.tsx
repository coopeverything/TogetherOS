'use client';

import * as React from 'react';
import { useState, useRef, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, Button, Input, Label, Tabs } from '@/components/ui';

export interface AvatarUploadProps {
  value?: string;
  onChange: (avatarUrl: string) => void;
  className?: string;
  name?: string;
  maxSizeMB?: number;
}

export function AvatarUpload({
  value = '',
  onChange,
  className,
  name = 'User',
  maxSizeMB = 5,
}: AvatarUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [preview, setPreview] = useState<string>(value);
  const [error, setError] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    setError('');
  };

  const handleUrlSubmit = () => {
    if (!urlInput) {
      setError('Please enter a URL');
      return;
    }

    try {
      new URL(urlInput);
      setPreview(urlInput);
      onChange(urlInput);
      setError('');
    } catch {
      setError('Please enter a valid URL');
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-4">
        <Avatar src={preview} alt={name} size="xl" />
        {preview && (
          <Button type="button" variant="secondary" size="sm" onClick={handleRemove}>
            Remove
          </Button>
        )}
      </div>

      <Tabs
        defaultTab={uploadMethod}
        onChange={(tabId) => setUploadMethod(tabId as 'url' | 'file')}
        tabs={[
          {
            id: 'url',
            label: 'URL',
            content: (
              <div className="space-y-2">
                <Label htmlFor="avatar-url">Avatar URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="avatar-url"
                    type="url"
                    value={urlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1"
                  />
                  <Button type="button" variant="secondary" onClick={handleUrlSubmit}>
                    Apply
                  </Button>
                </div>
              </div>
            ),
          },
          {
            id: 'file',
            label: 'Upload File',
            content: (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleUploadClick}
                  className="w-full"
                >
                  Choose Image
                </Button>
                <p className="text-xs text-ink-700">
                  Max file size: {maxSizeMB}MB. Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            ),
          },
        ]}
      />

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}
    </div>
  );
}
