'use client';

/**
 * Cookie Consent Banner
 *
 * GDPR-compliant cookie consent component
 * Manages user preferences for cookies and tracking
 */

import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean; // Always true - required for functionality
  analytics: boolean; // For Vercel Analytics
  functional: boolean; // For session management
}

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    functional: true,
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch {
          // Invalid preferences, reset
        }
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
    };
    saveConsent(allAccepted);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: true,
    };
    saveConsent(necessaryOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, new Date().toISOString());
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowPreferences(false);

    // Emit event for analytics tracking systems
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cookie-consent-updated', { detail: prefs })
      );
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Cookie Preferences
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                We use cookies to ensure the basic functionality of our site and to enhance your experience.
                We only use privacy-respecting tools and never sell your data.{' '}
                <a
                  href="/privacy"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Learn more
                </a>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
              >
                Customize
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors"
              >
                Necessary Only
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close preferences"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Necessary cookies */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                />
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">
                    Necessary Cookies
                  </label>
                  <p className="text-base text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    Required for authentication, security, and basic functionality. Cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Functional cookies */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) =>
                    setPreferences({ ...preferences, functional: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">
                    Functional Cookies
                  </label>
                  <p className="text-base text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    Remember your preferences like theme, language, and display settings.
                  </p>
                </div>
              </div>

              {/* Analytics cookies */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">
                    Analytics Cookies
                  </label>
                  <p className="text-base text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    Help us understand how you use the site. We use privacy-respecting Vercel Analytics (no personal data tracked).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleAcceptNecessary}
                className="px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors"
              >
                Necessary Only
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to check cookie consent status
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPrefs) {
      try {
        setConsent(JSON.parse(savedPrefs));
      } catch {
        setConsent(null);
      }
    }

    // Listen for updates
    const handleUpdate = (event: CustomEvent<CookiePreferences>) => {
      setConsent(event.detail);
    };

    window.addEventListener('cookie-consent-updated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('cookie-consent-updated', handleUpdate as EventListener);
    };
  }, []);

  return consent;
}
