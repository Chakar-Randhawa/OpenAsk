import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
}

export const THEME_STORAGE_KEY = 'openask_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    try {
      const saved = (localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('theme')) as Theme;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      console.warn('Unable to access localStorage for theme preference:', e);
    }
  }
  return 'system';
}

function applyThemeToDOM(isDark: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  // Synchronize browser theme-color meta tag if present
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#0a0a0a' : '#fafafa');
  }
}

// Synchronously apply theme on module load to prevent flash of incorrect theme
if (typeof window !== 'undefined') {
  const initTheme = getInitialTheme();
  const initDark = initTheme === 'dark' || (initTheme === 'system' && getSystemTheme() === 'dark');
  applyThemeToDOM(initDark);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  // Compute resolvedTheme reactively based on active theme setting and system theme
  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (theme === 'system') {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme]);

  // Immediately apply theme to DOM attributes whenever resolvedTheme changes
  useEffect(() => {
    applyThemeToDOM(resolvedTheme === 'dark');
  }, [resolvedTheme]);

  // Handle system preference changes reactively via matchMedia listeners
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Ensure state matches current OS preference at effect attachment time
    const initialIsDark = mediaQuery.matches;
    setSystemTheme(initialIsDark ? 'dark' : 'light');

    const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const isDark = 'matches' in event ? event.matches : mediaQuery.matches;
      setSystemTheme(isDark ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if ((mediaQuery as unknown as { addListener: (cb: typeof handleMediaChange) => void }).addListener) {
      (mediaQuery as unknown as { addListener: (cb: typeof handleMediaChange) => void }).addListener(handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if ((mediaQuery as unknown as { removeListener: (cb: typeof handleMediaChange) => void }).removeListener) {
        (mediaQuery as unknown as { removeListener: (cb: typeof handleMediaChange) => void }).removeListener(handleMediaChange);
      }
    };
  }, []);

  // Handle cross-tab localStorage synchronization reactively
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === THEME_STORAGE_KEY || e.key === 'theme') && e.newValue) {
        const nextTheme = e.newValue as Theme;
        if (nextTheme === 'light' || nextTheme === 'dark' || nextTheme === 'system') {
          setThemeState(nextTheme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
    } catch (e) {
      console.warn('Failed to save theme preference to localStorage', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const currentResolved = currentTheme === 'system' ? getSystemTheme() : currentTheme;
      const nextTheme: Theme = currentResolved === 'dark' ? 'light' : 'dark';
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        }
      } catch (e) {
        console.warn('Failed to save theme preference to localStorage', e);
      }
      return nextTheme;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      resolvedTheme,
      systemTheme
    }),
    [theme, setTheme, toggleTheme, resolvedTheme, systemTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
