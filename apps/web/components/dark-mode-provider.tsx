'use client';

import * as React from 'react';

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const DarkModeContext = React.createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = React.useState(false);

  // Load dark mode preference from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      setDarkModeState(stored === 'true');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkModeState(prefersDark);
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

  const toggleDarkMode = React.useCallback(() => {
    setDarkModeState((prev) => !prev);
  }, []);

  const setDarkMode = React.useCallback((value: boolean) => {
    setDarkModeState(value);
  }, []);

  const value = React.useMemo(
    () => ({ darkMode, toggleDarkMode, setDarkMode }),
    [darkMode, toggleDarkMode, setDarkMode]
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
