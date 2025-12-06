'use client';

/**
 * Gamification Admin Page - DEPRECATED
 *
 * This page has been consolidated into /admin/onboarding.
 * All challenge, microlesson, and first-week scheduling functionality
 * is now available in the unified Learning Content Editor.
 *
 * This redirect ensures existing bookmarks/links continue to work.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GamificationRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to onboarding with challenges filter
    router.replace('/admin/onboarding');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Redirecting to Content Editor...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-2">
          Gamification has been consolidated into the Learning Content Editor.
        </p>
      </div>
    </div>
  );
}
