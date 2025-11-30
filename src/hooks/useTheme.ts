import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

/** Supported theme options */
export type Theme = 'light' | 'dark' | 'system';

export interface UseThemeReturn {
  /** Current theme setting */
  theme: Theme;
  /** Update the theme setting */
  setTheme: (theme: Theme) => void;
  /** Whether dark mode is currently active (resolved from system if needed) */
  isDark: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'theme';
const DEFAULT_THEME: Theme = 'system';
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely checks if we're running in a browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Gets the stored theme from localStorage, falling back to default.
 */
function getStoredTheme(): Theme {
  if (!isBrowser()) return DEFAULT_THEME;
  return (localStorage.getItem(STORAGE_KEY) as Theme) || DEFAULT_THEME;
}

/**
 * Checks if the system prefers dark mode.
 */
function getSystemPrefersDark(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia(DARK_MODE_QUERY).matches;
}

/**
 * Resolves the effective theme (light/dark) from a theme setting.
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemPrefersDark() ? 'dark' : 'light';
  }
  return theme;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for managing the application theme.
 *
 * Features:
 * - Persists theme preference to localStorage
 * - Supports light, dark, and system themes
 * - Responds to system theme changes in real-time
 * - Applies theme class to document root
 *
 * @example
 * ```tsx
 * const { theme, setTheme, isDark } = useTheme();
 *
 * return (
 *   <button onClick={() => setTheme(isDark ? 'light' : 'dark')}>
 *     Toggle Theme
 *   </button>
 * );
 * ```
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  /**
   * Applies the resolved theme to the document root element.
   */
  const applyTheme = useCallback((newTheme: Theme) => {
    if (!isBrowser()) return;

    const root = document.documentElement;
    const effectiveTheme = resolveTheme(newTheme);

    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listen for system theme changes when using 'system' theme
  useEffect(() => {
    if (!isBrowser()) return;

    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  /**
   * Updates the theme and persists to localStorage.
   */
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);

      if (isBrowser()) {
        localStorage.setItem(STORAGE_KEY, newTheme);
      }

      applyTheme(newTheme);
    },
    [applyTheme]
  );

  /**
   * Computed value indicating whether dark mode is currently active.
   */
  const isDark = useMemo(() => {
    if (!isBrowser()) return false;
    return resolveTheme(theme) === 'dark';
  }, [theme]);

  return { theme, setTheme, isDark };
}
