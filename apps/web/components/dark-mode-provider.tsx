'use client';

import * as React from 'react';

// Theme categories - Classics are refined, everyday themes; Adventurous are bold and experimental
export const CLASSIC_THEMES = [
  // Gray - Pure to Warm
  'pure-grayscale',
  'salt-pepper',
  'zinc-minimal',
  'pebble',
  'stone-path',
  'urban-loft',
  // Warm - Cream to Coffee
  'breakfast-tea',
  'cappuccino',
  'quiet-luxury',
  // Green - Organic tones
  'sage-earth',
  'eucalyptus-grove',
  'zinc-sage-ext',
  // Accented
  'quite-clear',
  'yacht-club',
  'gothic-noir',
] as const;

export const ADVENTUROUS_THEMES = [
  // Core brand (renamed from 'default')
  'together-green',
  // Green family
  'zinc-sage',
  'forest-canvas',
  // Blue - Clean to Deep
  'arctic-minimal',
  'ocean-depth',
  'frozen-lake',
  'cobalt-sky',
  'mountain-mist',
  'winter-chill',
  // Warm - Peach to Sepia
  'fresh-peach',
  'peach-skyline',
  'summer-breeze',
  'horizon-dawn',
  'terracotta-earth',
  'siltstone',
  'night-sands',
  'old-photograph',
  'spiced-mocha',
  // Purple - Cosmic
  'cosmic-violet',
  'under-the-moonlight',
  // Mixed & Vibrant
  'beachfront-view',
  'tropical-punch',
  'sunny-day',
  'cool-revival',
  'sharp-edge',
] as const;

// All available themes (classics first, then adventurous)
export const THEMES = [...CLASSIC_THEMES, ...ADVENTUROUS_THEMES] as const;
export type Theme = (typeof THEMES)[number];

// Theme display info with color swatches
export const THEME_INFO: Record<Theme, { name: string; colors: string[] }> = {
  'together-green': { name: 'Together Green', colors: ['#FAFAF9', '#059669', '#F59E0B', '#0F172A'] },
  // Minimalistic themes
  'zinc-minimal': { name: 'Zinc Minimal', colors: ['#FAFAFA', '#71717A', '#52525B', '#18181B'] },
  'zinc-sage': { name: 'Zinc Sage', colors: ['#FAFAFA', '#84A98C', '#52796F', '#2F3E46'] },
  'zinc-sage-ext': { name: 'Zinc Sage Extended', colors: ['#FAFAFA', '#84A98C', '#B56576', '#2F3E46'] },
  'pure-grayscale': { name: 'Pure Grayscale', colors: ['#FFFFFF', '#9CA3AF', '#4B5563', '#111827'] },
  'pebble': { name: 'Pebble', colors: ['#E8E4DD', '#A8A8A0', '#706F6C', '#3B3B3A'] },
  // Base themes
  'arctic-minimal': { name: 'Arctic Minimal', colors: ['#F8FAFC', '#64748B', '#0EA5E9', '#0C4A6E'] },
  'horizon-dawn': { name: 'Horizon Dawn', colors: ['#FFF7ED', '#FB923C', '#EA580C', '#7C2D12'] },
  'ocean-depth': { name: 'Ocean Depth', colors: ['#F0F9FF', '#0369A1', '#1E3A5F', '#082F49'] },
  'forest-canvas': { name: 'Forest Canvas', colors: ['#F0FDF4', '#22C55E', '#166534', '#052E16'] },
  'cosmic-violet': { name: 'Cosmic Violet', colors: ['#FAF5FF', '#A855F7', '#7E22CE', '#3B0764'] },
  'terracotta-earth': { name: 'Terracotta Earth', colors: ['#FEF2F2', '#DC2626', '#991B1B', '#450A0A'] },
  // Additional themes
  'sage-earth': { name: 'Sage Earth', colors: ['#e3d8bf', '#a3b8a7', '#c4956a', '#2c4a5e'] },
  'fresh-peach': { name: 'Fresh Peach', colors: ['#FFD3AC', '#FFB5AB', '#E39A7B', '#BDD06B'] },
  'gothic-noir': { name: 'Gothic Noir', colors: ['#000000', '#D1D0D0', '#988686', '#5C4E4E'] },
  'yacht-club': { name: 'Yacht Club', colors: ['#F2F0EF', '#BBBDBC', '#245F73', '#733E24'] },
  'quiet-luxury': { name: 'Quiet Luxury', colors: ['#F7E6CA', '#E8D59E', '#D9BBB0', '#AD9C8E'] },
  'night-sands': { name: 'Night Sands', colors: ['#CBBD93', '#FAE8B4', '#80775C', '#574A24'] },
  'old-photograph': { name: 'Old Photograph', colors: ['#FDFBD4', '#D9B7B6', '#878672', '#545333'] },
  'cappuccino': { name: 'Cappuccino', colors: ['#D6B588', '#C6C0B9', '#705E46', '#422701'] },
  'sunny-day': { name: 'Sunny Day', colors: ['#FFBF00', '#807040', '#007EFF', '#2400FF'] },
  'cool-revival': { name: 'Cool Revival', colors: ['#00FFFF', '#00AEFF', '#00DE94', '#00FF52'] },
  'sharp-edge': { name: 'Sharp Edge', colors: ['#898989', '#D9D9D9', '#FF4D4D', '#4DFFBC'] },
  'tropical-punch': { name: 'Tropical Punch', colors: ['#FF8243', '#FFC0CB', '#FCE883', '#069494'] },
  'cobalt-sky': { name: 'Cobalt Sky', colors: ['#0047AB', '#000080', '#82C8E5', '#6D8196'] },
  'salt-pepper': { name: 'Salt & Pepper', colors: ['#FFFFFF', '#D4D4D4', '#B3B3B3', '#2B2B2B'] },
  'quite-clear': { name: 'Quite Clear', colors: ['#CBCBCB', '#F2F2F2', '#174D38', '#4D1717'] },
  'breakfast-tea': { name: 'Breakfast Tea', colors: ['#FFD3AC', '#CCBEB1', '#664C36', '#331C08'] },
  'stone-path': { name: 'Stone Path', colors: ['#A49A87', '#A5A58D', '#968F83', '#E8E5DF'] },
  'urban-loft': { name: 'Urban Loft', colors: ['#9C9A9A', '#A35E47', '#000000', '#464646'] },
  'spiced-mocha': { name: 'Spiced Mocha', colors: ['#6F4E37', '#D47E30', '#F5F5DC', '#6D3B07'] },
  'beachfront-view': { name: 'Beachfront View', colors: ['#EDE8D0', '#6E632E', '#DBD1ED', '#ABBEED'] },
  'under-the-moonlight': { name: 'Under the Moonlight', colors: ['#CCCCFF', '#A3AE3C', '#5C5C99', '#292966'] },
  'siltstone': { name: 'Siltstone', colors: ['#CBBD93', '#FFF5B8', '#FFB16E', '#CCA25A'] },
  'peach-skyline': { name: 'Peach Skyline', colors: ['#FFDBBB', '#BADDFF', '#BAFFF5', '#496580'] },
  'mountain-mist': { name: 'Mountain Mist', colors: ['#6D8196', '#B0C4DE', '#01796F', '#5A5A5A'] },
  'frozen-lake': { name: 'Frozen Lake', colors: ['#6D8196', '#ADD8E6', '#FFFAFA', '#000080'] },
  'eucalyptus-grove': { name: 'Eucalyptus Grove', colors: ['#B2AC88', '#898989', '#F2F0EF', '#4B6E48'] },
  'winter-chill': { name: 'Winter Chill', colors: ['#B8E3E9', '#93B1B5', '#4F7C82', '#0B2E33'] },
  'summer-breeze': { name: 'Summer Breeze', colors: ['#FF3B3B', '#F88379', '#82C8E5', '#E6D8C4'] },
};

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const DarkModeContext = React.createContext<DarkModeContextType | undefined>(undefined);

// Helper to migrate old 'default' theme to 'together-green'
function migrateTheme(theme: string | null): Theme | null {
  if (theme === 'default') return 'together-green';
  if (theme && THEMES.includes(theme as Theme)) return theme as Theme;
  return null;
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = React.useState(false);
  const [theme, setThemeState] = React.useState<Theme>('pure-grayscale'); // Default to first classic

  // Load preferences from localStorage, URL, and user profile on mount
  React.useEffect(() => {
    // Dark mode
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      setDarkModeState(stored === 'true');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkModeState(prefersDark);
    }

    // Theme - check URL first, then localStorage, then user profile
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = migrateTheme(urlParams.get('theme'));
    if (urlTheme) {
      setThemeState(urlTheme);
    } else {
      const storedTheme = migrateTheme(localStorage.getItem('theme'));
      if (storedTheme) {
        setThemeState(storedTheme);
        // Update localStorage if we migrated from 'default'
        if (localStorage.getItem('theme') === 'default') {
          localStorage.setItem('theme', 'together-green');
        }
      } else {
        // Fetch user's saved theme preference from backend
        fetch('/api/user/theme')
          .then((res) => res.json())
          .then((data) => {
            const migratedTheme = migrateTheme(data.theme);
            if (migratedTheme) {
              setThemeState(migratedTheme);
              localStorage.setItem('theme', migratedTheme);
            }
          })
          .catch(() => {
            // Ignore errors - user may not be logged in
          });
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
    // 'together-green' uses the :root defaults, so we use data-theme for it too
    // This allows consistent theme switching behavior
    document.documentElement.setAttribute('data-theme', theme);
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
    url.searchParams.set('theme', newTheme);
    window.history.replaceState({}, '', url.toString());

    // Save to user profile (fire and forget - don't block UI)
    fetch('/api/user/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {
      // Ignore errors - user may not be logged in
    });
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
        {THEMES.map((t) => (
          <option key={t} value={t}>{THEME_INFO[t].name}</option>
        ))}
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

export function ThemePicker({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const { theme, setTheme, darkMode, toggleDarkMode } = useDarkMode();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showAdventurous, setShowAdventurous] = React.useState(false);

  const handleSelect = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  // Determine which category to show based on current theme
  React.useEffect(() => {
    if (isOpen) {
      // If current theme is adventurous, show adventurous list
      setShowAdventurous(ADVENTUROUS_THEMES.includes(theme as typeof ADVENTUROUS_THEMES[number]));
    }
  }, [isOpen, theme]);

  const currentThemes = showAdventurous ? ADVENTUROUS_THEMES : CLASSIC_THEMES;

  return (
    <>
      {/* Trigger Button */}
      <div className={`flex items-center gap-1 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="px-2 py-1.5 rounded-md border text-sm font-medium bg-[var(--bg-1)] text-[var(--ink-900)] border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors flex items-center gap-1.5"
        >
          <span className="flex gap-px">
            {THEME_INFO[theme].colors.map((color, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-sm border border-black/20"
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
          {compact ? null : <span className="hidden sm:inline">{THEME_INFO[theme].name}</span>}
        </button>
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-md border text-sm bg-[var(--bg-1)] text-[var(--ink-700)] border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Panel */}
          <div
            className="bg-[var(--bg-1)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-md lg:max-w-lg mx-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--ink-900)]">Pick Your Theme</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDarkMode}
                  className="px-3 py-1.5 rounded-md border text-sm bg-[var(--bg-2)] text-[var(--ink-900)] border-[var(--border)] hover:bg-[var(--bg-0)] transition-colors"
                >
                  {darkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[var(--ink-400)] hover:text-[var(--ink-900)] transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Theme List */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-2">
                {currentThemes.map((t) => {
                  const info = THEME_INFO[t];
                  const isSelected = theme === t;
                  return (
                    <button
                      key={t}
                      onClick={() => handleSelect(t)}
                      className={`flex items-center gap-4 px-4 py-2 rounded-lg border transition-all text-left ${
                        isSelected
                          ? 'border-[var(--brand-500)] bg-[var(--brand-100)] ring-2 ring-[var(--brand-500)]'
                          : 'border-[var(--border)] hover:bg-[var(--bg-2)] hover:border-[var(--ink-400)]'
                      }`}
                    >
                      {/* Color Swatches */}
                      <div className="flex gap-1">
                        {info.colors.map((color, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded border border-black/20 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      {/* Theme Name */}
                      <span className={`font-medium ${isSelected ? 'text-[var(--brand-600)]' : 'text-[var(--ink-900)]'}`}>
                        {info.name}
                      </span>
                      {/* Checkmark */}
                      {isSelected && (
                        <svg className="w-5 h-5 ml-auto text-[var(--brand-600)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}

                {/* Category Toggle Divider */}
                <button
                  onClick={() => setShowAdventurous(!showAdventurous)}
                  className="flex items-center justify-center gap-2 py-3 mt-2 text-sm font-medium text-[var(--ink-400)] hover:text-[var(--ink-700)] transition-colors group"
                >
                  <span className="flex-1 h-px bg-[var(--border)] group-hover:bg-[var(--ink-400)] transition-colors" />
                  <span className="flex items-center gap-1">
                    {showAdventurous ? 'classics' : 'adventurous'}
                    <svg
                      className={`w-4 h-4 transition-transform ${showAdventurous ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                  <span className="flex-1 h-px bg-[var(--border)] group-hover:bg-[var(--ink-400)] transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
