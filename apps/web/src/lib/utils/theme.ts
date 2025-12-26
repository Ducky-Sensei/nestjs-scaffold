import type { Theme, ThemeColors, ThemeMode } from '@/types/theme';

const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Professional Theme',
  light: {
    background: '0 0% 98%',
    foreground: '222 47% 11%',
    card: '0 0% 100%',
    cardForeground: '222 47% 11%',
    popover: '0 0% 100%',
    popoverForeground: '222 47% 11%',
    primary: '217 91% 60%',
    primaryForeground: '0 0% 100%',
    secondary: '214 32% 91%',
    secondaryForeground: '222 47% 11%',
    muted: '210 40% 96%',
    mutedForeground: '215 16% 47%',
    accent: '210 40% 96%',
    accentForeground: '222 47% 11%',
    destructive: '0 72% 51%',
    destructiveForeground: '0 0% 100%',
    border: '214 32% 88%',
    input: '214 32% 88%',
    ring: '217 91% 60%',
  },
  dark: {
    background: '224 71% 4%',
    foreground: '213 31% 91%',
    card: '224 71% 6%',
    cardForeground: '213 31% 91%',
    popover: '224 71% 6%',
    popoverForeground: '213 31% 91%',
    primary: '217 91% 60%',
    primaryForeground: '0 0% 100%',
    secondary: '222 47% 11%',
    secondaryForeground: '213 31% 91%',
    muted: '223 47% 11%',
    mutedForeground: '215 20% 65%',
    accent: '216 34% 17%',
    accentForeground: '213 31% 91%',
    destructive: '0 63% 51%',
    destructiveForeground: '213 31% 91%',
    border: '216 34% 17%',
    input: '216 34% 17%',
    ring: '217 91% 60%',
  },
  radius: '0.5rem',
};

/**
 * Converts a ThemeColors object to CSS variable format
 */
function colorsToCSSVariables(colors: ThemeColors): Record<string, string> {
  return {
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--card': colors.card,
    '--card-foreground': colors.cardForeground,
    '--popover': colors.popover,
    '--popover-foreground': colors.popoverForeground,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--secondary': colors.secondary,
    '--secondary-foreground': colors.secondaryForeground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--destructive': colors.destructive,
    '--destructive-foreground': colors.destructiveForeground,
    '--border': colors.border,
    '--input': colors.input,
    '--ring': colors.ring,
  };
}

/**
 * Apply theme colors to the document root or dark class
 */
export function applyThemeColors(colors: ThemeColors, mode: ThemeMode = 'light'): void {
  const root = document.documentElement;
  const cssVars = colorsToCSSVariables(colors);

  if (mode === 'dark') {
    // Apply to .dark class
    root.classList.add('dark');
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  } else {
    // Apply to root
    root.classList.remove('dark');
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
}

/**
 * Apply a complete theme including radius
 */
export function applyTheme(theme: Theme, mode: ThemeMode = 'light'): void {
  const colors = mode === 'dark' && theme.dark ? theme.dark : theme.light;
  applyThemeColors(colors, mode);

  if (theme.radius) {
    document.documentElement.style.setProperty('--radius', theme.radius);
  }
}

/**
 * Get the default theme
 */
export function getDefaultTheme(): Theme {
  return DEFAULT_THEME;
}

/**
 * Reset to the default theme
 */
export function resetTheme(mode: ThemeMode = 'light'): void {
  applyTheme(DEFAULT_THEME, mode);
}

/**
 * Get current theme mode from localStorage or system preference
 */
export function getInitialThemeMode(): ThemeMode {
  const stored = localStorage.getItem('theme-mode');
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Save theme mode to localStorage
 */
export function saveThemeMode(mode: ThemeMode): void {
  localStorage.setItem('theme-mode', mode);
}

/**
 * Extract referral/customer ID from URL parameters
 */
export function getReferralFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('referral_page') || params.get('customer_id') || params.get('ref');
}

/**
 * Save customer theme to localStorage for offline/quick access
 */
export function saveCustomerTheme(customerId: string, theme: Theme): void {
  const key = `customer-theme-${customerId}`;
  localStorage.setItem(key, JSON.stringify(theme));
}

/**
 * Load customer theme from localStorage
 */
export function loadCustomerTheme(customerId: string): Theme | null {
  const key = `customer-theme-${customerId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored) as Theme;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Clear customer theme from localStorage
 */
export function clearCustomerTheme(customerId: string): void {
  const key = `customer-theme-${customerId}`;
  localStorage.removeItem(key);
}
