import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import {
  applyTheme,
  getDefaultTheme,
  getInitialThemeMode,
  getReferralFromURL,
  loadCustomerTheme,
  saveCustomerTheme,
  saveThemeMode,
} from '@/lib/utils/theme';
import type { Theme, ThemeContextType, ThemeMode } from '@/types/theme';
import { useCustomerTheme } from '../hooks/use-theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme | null>(defaultTheme || null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialThemeMode());
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isCustomTheme, setIsCustomTheme] = useState(false);

  // Fetch customer theme if customerId is present
  const { data: customerThemeData, isSuccess } = useCustomerTheme(customerId, {
    enabled: !!customerId,
  });

  // Initialize theme on mount
  useEffect(() => {
    const referralId = getReferralFromURL();

    if (referralId) {
      setCustomerId(referralId);

      // Try to load from localStorage first for instant application
      const cachedTheme = loadCustomerTheme(referralId);
      if (cachedTheme) {
        setThemeState(cachedTheme);
        setIsCustomTheme(true);
        applyTheme(cachedTheme, themeMode);
      }
    } else {
      // Don't apply default theme - let CSS handle it
      const defaultThemeValue = defaultTheme || getDefaultTheme();
      setThemeState(defaultThemeValue);
      setIsCustomTheme(false);
      // Only apply dark class if needed
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [defaultTheme, themeMode]);

  // Update theme when customer theme is fetched
  useEffect(() => {
    if (isSuccess && customerThemeData && customerId) {
      const newTheme = customerThemeData.theme;
      setThemeState(newTheme);
      setIsCustomTheme(true);
      applyTheme(newTheme, themeMode);

      // Cache the theme
      saveCustomerTheme(customerId, newTheme);
    }
  }, [isSuccess, customerThemeData, customerId, themeMode]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setIsCustomTheme(true);
    applyTheme(newTheme, themeMode);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemeMode(mode);

    if (isCustomTheme && theme) {
      // Only apply theme if it's a custom theme
      applyTheme(theme, mode);
    } else {
      // For default theme, just toggle the dark class
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const resetThemeToDefault = () => {
    const defaultThemeValue = defaultTheme || getDefaultTheme();
    setThemeState(defaultThemeValue);
    setIsCustomTheme(false);
    setCustomerId(null);

    // Clear all inline styles and let CSS take over
    const root = document.documentElement;
    const cssVarKeys = [
      '--background',
      '--foreground',
      '--card',
      '--card-foreground',
      '--popover',
      '--popover-foreground',
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--secondary-foreground',
      '--muted',
      '--muted-foreground',
      '--accent',
      '--accent-foreground',
      '--destructive',
      '--destructive-foreground',
      '--border',
      '--input',
      '--ring',
      '--radius',
    ];

    cssVarKeys.forEach((key) => {
      root.style.removeProperty(key);
    });

    // Just handle dark mode class
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const applyThemeManually = (newTheme: Theme, mode?: ThemeMode) => {
    const modeToUse = mode || themeMode;
    setThemeState(newTheme);
    setIsCustomTheme(true);
    if (mode) {
      setThemeModeState(mode);
      saveThemeMode(mode);
    }
    applyTheme(newTheme, modeToUse);
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    isCustomTheme,
    customerId,
    setTheme,
    setThemeMode,
    resetTheme: resetThemeToDefault,
    applyTheme: applyThemeManually,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
