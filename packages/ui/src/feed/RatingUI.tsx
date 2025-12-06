/**
 * Multi-dimensional Rating UI Component
 * Allows users to rate thread posts on 4 dimensions:
 * - Language (clarity, accessibility)
 * - Originality (novelty, fresh perspective)
 * - Tone (respectful, constructive)
 * - Argument (logic, evidence-based)
 */

'use client';

import { useState } from 'react';

interface Rating {
  language: number;
  originality: number;
  tone: number;
  argument: number;
}

interface RatingUIProps {
  postId: string;
  existingRating?: Rating;
  onSubmit?: (rating: Rating) => void;
}

const dimensions = [
  {
    key: 'language' as keyof Rating,
    label: 'Language',
    description: 'Clear and accessible to everyone',
  },
  {
    key: 'originality' as keyof Rating,
    label: 'Originality',
    description: 'Fresh perspective or novel insight',
  },
  {
    key: 'tone' as keyof Rating,
    label: 'Tone',
    description: 'Respectful and constructive',
  },
  {
    key: 'argument' as keyof Rating,
    label: 'Argument',
    description: 'Logical and evidence-based',
  },
];

export function RatingUI({ postId, existingRating, onSubmit }: RatingUIProps) {
  const [rating, setRating] = useState<Rating>(
    existingRating || {
      language: 0,
      originality: 0,
      tone: 0,
      argument: 0,
    }
  );
  const [hovering, setHovering] = useState<{ dimension: keyof Rating; value: number } | null>(null);

  const handleRate = (dimension: keyof Rating, value: number) => {
    const newRating = { ...rating, [dimension]: value };
    setRating(newRating);
  };

  const handleSubmit = () => {
    const allRated = Object.values(rating).every((v) => v > 0);
    if (!allRated) {
      alert('Please rate all dimensions before submitting');
      return;
    }
    onSubmit?.(rating);
  };

  const renderStars = (dimension: keyof Rating) => {
    const currentValue = rating[dimension];
    const hoverValue = hovering?.dimension === dimension ? hovering.value : 0;
    const displayValue = hoverValue || currentValue;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onMouseEnter={() => setHovering({ dimension, value })}
            onMouseLeave={() => setHovering(null)}
            onClick={() => handleRate(dimension, value)}
            className={`text-sm transition ${
              value <= displayValue
                ? 'text-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            } hover:scale-110`}
            aria-label={`Rate ${dimension} ${value} stars`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <h3 className="font-semibold mb-4">Rate this post</h3>

      <div className="space-y-2">
        {dimensions.map(({ key, label, description }) => (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
              </div>
              {renderStars(key)}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        disabled={Object.values(rating).some((v) => v === 0)}
      >
        Submit Rating
      </button>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Your rating helps build reputation and quality signals for the community
      </p>
    </div>
  );
}

/**
 * Rating Display Component
 * Shows aggregate ratings for a post
 */

interface RatingDisplayProps {
  ratings: Rating & { count: number };
}

export function RatingDisplay({ ratings }: RatingDisplayProps) {
  const avgRating =
    (ratings.language + ratings.originality + ratings.tone + ratings.argument) / 4;

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= Math.round(avgRating) ? 'text-yellow-500' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-gray-600 dark:text-gray-400">
        {avgRating.toFixed(1)} ({ratings.count} ratings)
      </span>
    </div>
  );
}
