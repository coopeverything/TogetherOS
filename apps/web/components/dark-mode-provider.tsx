'use client';

import * as React from 'react';

// Available themes
export const THEMES = ['default', 'sage-earth', 'fresh-peach'] as const;
export type Theme = (typeof THEMES)[number];

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const DarkModeContext = React.createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = React.useState(false);
  const [theme, setThemeState] = React.useState<Theme>('default');

  // Load preferences from localStorage and URL on mount
  React.useEffect(() => {
    // Dark mode
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      setDarkModeState(stored === 'true');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkModeState(prefersDark);
    }

    // Theme - check URL first, then localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme') as Theme | null;
    if (urlTheme && THEMES.includes(urlTheme)) {
      setThemeState(urlTheme);
    } else {
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (storedTheme && THEMES.includes(storedTheme)) {
        setThemeState(storedTheme);
      }
    }
  }, []);

  // Update document class and localStorage when dark mode changes
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Update data-theme attribute when theme changes
  React.useEffect(() => {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleDarkMode = React.useCallback(() => {
    setDarkModeState((prev) => !prev);
  }, []);

  const setDarkMode = React.useCallback((value: boolean) => {
    setDarkModeState(value);
  }, []);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    // Update URL without reload
    const url = new URL(window.location.href);
    if (newTheme === 'default') {
      url.searchParams.delete('theme');
    } else {
      url.searchParams.set('theme', newTheme);
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  const value = React.useMemo(
    () => ({ darkMode, toggleDarkMode, setDarkMode, theme, setTheme }),
    [darkMode, toggleDarkMode, setDarkMode, theme, setTheme]
  );

  return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
}

export function useDarkMode() {
  const context = React.useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}

export function DarkModeToggle({ className = '' }: { className?: string }) {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`px-4 py-2 rounded-md border border-border bg-bg-2 text-ink-700 hover:bg-bg-1 transition-colors ${className}`}
      aria-label="Toggle dark mode"
    >
      {darkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="px-3 py-1.5 rounded-md border text-sm bg-[var(--bg-1)] text-[var(--ink-900)] border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
        aria-label="Select theme"
      >
        <option value="default">Default</option>
        <option value="sage-earth">Sage Earth</option>
        <option value="fresh-peach">Fresh Peach</option>
      </select>
      <button
        onClick={toggleDarkMode}
        className="px-3 py-1.5 rounded-md border text-sm bg-[var(--bg-1)] text-[var(--ink-900)] border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors"
        aria-label="Toggle dark mode"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
