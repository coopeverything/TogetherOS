'use client';

import * as React from 'react';

export type Density = 'compact' | 'comfortable';

interface DensityContextType {
  density: Density;
  setDensity: (density: Density) => void;
  isDesktop: boolean;
}

const DensityContext = React.createContext<DensityContextType | undefined>(undefined);

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = React.useState<Density>('compact');
  const [isDesktop, setIsDesktop] = React.useState(true);

  // Detect desktop vs mobile and load saved preference
  React.useEffect(() => {
    // Check screen size
    const checkDesktop = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      return desktop;
    };

    const desktop = checkDesktop();

    // Load saved preference from localStorage
    const saved = localStorage.getItem('density') as Density | null;
    if (saved && (saved === 'compact' || saved === 'comfortable')) {
      setDensityState(saved);
    } else {
      // Default: compact on desktop, comfortable on mobile
      setDensityState(desktop ? 'compact' : 'comfortable');
    }

    // Listen for resize
    const handleResize = () => {
      checkDesktop();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply density attribute to document
  React.useEffect(() => {
    if (density === 'comfortable') {
      document.documentElement.setAttribute('data-density', 'comfortable');
    } else {
      document.documentElement.removeAttribute('data-density');
    }
    localStorage.setItem('density', density);
  }, [density]);

  const setDensity = React.useCallback((newDensity: Density) => {
    setDensityState(newDensity);
  }, []);

  const value = React.useMemo(
    () => ({ density, setDensity, isDesktop }),
    [density, setDensity, isDesktop]
  );

  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}

export function useDensity() {
  const context = React.useContext(DensityContext);
  if (context === undefined) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
}

export function DensityToggle({ className = '' }: { className?: string }) {
  const { density, setDensity } = useDensity();

  return (
    <button
      onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
      className={`px-3 py-1.5 rounded-md border text-sm bg-bg-1 text-ink-900 border-border hover:bg-bg-2 transition-colors ${className}`}
      aria-label="Toggle density"
    >
      {density === 'compact' ? 'Compact' : 'Comfortable'}
    </button>
  );
}
