import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyTheme,
  applyThemeColors,
  clearCustomerTheme,
  getDefaultTheme,
  getInitialThemeMode,
  getReferralFromURL,
  loadCustomerTheme,
  resetTheme,
  saveCustomerTheme,
  saveThemeMode,
} from './theme';

describe('theme utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getDefaultTheme', () => {
    it('should return the default theme object', () => {
      const theme = getDefaultTheme();
      expect(theme).toBeDefined();
      expect(theme.id).toBe('default');
      expect(theme.name).toBe('Professional Theme');
      expect(theme.light).toBeDefined();
      expect(theme.dark).toBeDefined();
    });
  });

  describe('saveThemeMode', () => {
    it('should save theme mode to localStorage', () => {
      saveThemeMode('dark');
      expect(localStorage.getItem('theme-mode')).toBe('dark');
    });

    it('should save light theme mode', () => {
      saveThemeMode('light');
      expect(localStorage.getItem('theme-mode')).toBe('light');
    });
  });

  describe('getInitialThemeMode', () => {
    it('should return stored theme mode from localStorage', () => {
      localStorage.setItem('theme-mode', 'dark');
      expect(getInitialThemeMode()).toBe('dark');
    });

    it('should return light mode if no stored preference', () => {
      const matchMedia = vi.fn().mockReturnValue({ matches: false });
      vi.stubGlobal('matchMedia', matchMedia);

      expect(getInitialThemeMode()).toBe('light');

      vi.unstubAllGlobals();
    });

    it('should respect system preference when no stored mode', () => {
      const matchMedia = vi.fn().mockReturnValue({ matches: true });
      vi.stubGlobal('matchMedia', matchMedia);

      expect(getInitialThemeMode()).toBe('dark');

      vi.unstubAllGlobals();
    });
  });

  describe('getReferralFromURL', () => {
    it('should extract referral_page from URL', () => {
      vi.stubGlobal('location', {
        search: '?referral_page=customer123',
      });

      expect(getReferralFromURL()).toBe('customer123');

      vi.unstubAllGlobals();
    });

    it('should extract customer_id from URL', () => {
      vi.stubGlobal('location', {
        search: '?customer_id=customer456',
      });

      expect(getReferralFromURL()).toBe('customer456');

      vi.unstubAllGlobals();
    });

    it('should extract ref from URL', () => {
      vi.stubGlobal('location', {
        search: '?ref=customer789',
      });

      expect(getReferralFromURL()).toBe('customer789');

      vi.unstubAllGlobals();
    });

    it('should prioritize referral_page over other params', () => {
      vi.stubGlobal('location', {
        search: '?referral_page=customer1&customer_id=customer2&ref=customer3',
      });

      expect(getReferralFromURL()).toBe('customer1');

      vi.unstubAllGlobals();
    });

    it('should return null when no referral params exist', () => {
      vi.stubGlobal('location', {
        search: '?other_param=value',
      });

      expect(getReferralFromURL()).toBeNull();

      vi.unstubAllGlobals();
    });
  });

  describe('customer theme storage', () => {
    const mockTheme = {
      id: 'test-theme',
      name: 'Test Theme',
      light: {
        background: '0 0% 100%',
        foreground: '0 0% 0%',
        card: '0 0% 100%',
        cardForeground: '0 0% 0%',
        popover: '0 0% 100%',
        popoverForeground: '0 0% 0%',
        primary: '217 91% 60%',
        primaryForeground: '0 0% 100%',
        secondary: '214 32% 91%',
        secondaryForeground: '0 0% 0%',
        muted: '210 40% 96%',
        mutedForeground: '215 16% 47%',
        accent: '210 40% 96%',
        accentForeground: '0 0% 0%',
        destructive: '0 72% 51%',
        destructiveForeground: '0 0% 100%',
        border: '214 32% 88%',
        input: '214 32% 88%',
        ring: '217 91% 60%',
      },
      radius: '0.5rem',
    };

    describe('saveCustomerTheme', () => {
      it('should save customer theme to localStorage', () => {
        saveCustomerTheme('customer123', mockTheme);
        const stored = localStorage.getItem('customer-theme-customer123');
        expect(stored).toBeDefined();
        if (stored) {
          expect(JSON.parse(stored)).toEqual(mockTheme);
        }
      });
    });

    describe('loadCustomerTheme', () => {
      it('should load customer theme from localStorage', () => {
        localStorage.setItem('customer-theme-customer123', JSON.stringify(mockTheme));
        const loaded = loadCustomerTheme('customer123');
        expect(loaded).toEqual(mockTheme);
      });

      it('should return null if theme does not exist', () => {
        const loaded = loadCustomerTheme('nonexistent');
        expect(loaded).toBeNull();
      });

      it('should return null if stored data is invalid JSON', () => {
        localStorage.setItem('customer-theme-customer123', 'invalid-json');
        const loaded = loadCustomerTheme('customer123');
        expect(loaded).toBeNull();
      });
    });

    describe('clearCustomerTheme', () => {
      it('should remove customer theme from localStorage', () => {
        localStorage.setItem('customer-theme-customer123', JSON.stringify(mockTheme));
        clearCustomerTheme('customer123');
        expect(localStorage.getItem('customer-theme-customer123')).toBeNull();
      });
    });
  });

  describe('applyThemeColors', () => {
    const mockColors = {
      background: '0 0% 100%',
      foreground: '0 0% 0%',
      card: '0 0% 100%',
      cardForeground: '0 0% 0%',
      popover: '0 0% 100%',
      popoverForeground: '0 0% 0%',
      primary: '217 91% 60%',
      primaryForeground: '0 0% 100%',
      secondary: '214 32% 91%',
      secondaryForeground: '0 0% 0%',
      muted: '210 40% 96%',
      mutedForeground: '215 16% 47%',
      accent: '210 40% 96%',
      accentForeground: '0 0% 0%',
      destructive: '0 72% 51%',
      destructiveForeground: '0 0% 100%',
      border: '214 32% 88%',
      input: '214 32% 88%',
      ring: '217 91% 60%',
    };

    beforeEach(() => {
      document.documentElement.className = '';
      document.documentElement.removeAttribute('style');
    });

    it('should apply light theme colors to document root', () => {
      applyThemeColors(mockColors, 'light');

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.style.getPropertyValue('--background')).toBe(mockColors.background);
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe(mockColors.primary);
    });

    it('should apply dark theme colors and add dark class', () => {
      applyThemeColors(mockColors, 'dark');

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.getPropertyValue('--background')).toBe(mockColors.background);
      expect(document.documentElement.style.getPropertyValue('--foreground')).toBe(mockColors.foreground);
    });

    it('should apply all CSS variables correctly', () => {
      applyThemeColors(mockColors, 'light');

      expect(document.documentElement.style.getPropertyValue('--card')).toBe(mockColors.card);
      expect(document.documentElement.style.getPropertyValue('--card-foreground')).toBe(mockColors.cardForeground);
      expect(document.documentElement.style.getPropertyValue('--popover')).toBe(mockColors.popover);
      expect(document.documentElement.style.getPropertyValue('--popover-foreground')).toBe(mockColors.popoverForeground);
      expect(document.documentElement.style.getPropertyValue('--secondary')).toBe(mockColors.secondary);
      expect(document.documentElement.style.getPropertyValue('--secondary-foreground')).toBe(mockColors.secondaryForeground);
      expect(document.documentElement.style.getPropertyValue('--muted')).toBe(mockColors.muted);
      expect(document.documentElement.style.getPropertyValue('--muted-foreground')).toBe(mockColors.mutedForeground);
      expect(document.documentElement.style.getPropertyValue('--accent')).toBe(mockColors.accent);
      expect(document.documentElement.style.getPropertyValue('--accent-foreground')).toBe(mockColors.accentForeground);
      expect(document.documentElement.style.getPropertyValue('--destructive')).toBe(mockColors.destructive);
      expect(document.documentElement.style.getPropertyValue('--destructive-foreground')).toBe(mockColors.destructiveForeground);
      expect(document.documentElement.style.getPropertyValue('--border')).toBe(mockColors.border);
      expect(document.documentElement.style.getPropertyValue('--input')).toBe(mockColors.input);
      expect(document.documentElement.style.getPropertyValue('--ring')).toBe(mockColors.ring);
    });

    it('should remove dark class when applying light theme', () => {
      document.documentElement.classList.add('dark');
      applyThemeColors(mockColors, 'light');

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('applyTheme', () => {
    const mockTheme = {
      id: 'test-theme',
      name: 'Test Theme',
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
      radius: '0.75rem',
    };

    beforeEach(() => {
      document.documentElement.className = '';
      document.documentElement.removeAttribute('style');
    });

    it('should apply light theme with radius', () => {
      applyTheme(mockTheme, 'light');

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.style.getPropertyValue('--background')).toBe(mockTheme.light.background);
      expect(document.documentElement.style.getPropertyValue('--radius')).toBe(mockTheme.radius);
    });

    it('should apply dark theme with radius', () => {
      applyTheme(mockTheme, 'dark');

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.getPropertyValue('--background')).toBe(mockTheme.dark.background);
      expect(document.documentElement.style.getPropertyValue('--radius')).toBe(mockTheme.radius);
    });

    it('should apply light theme when dark mode requested but no dark colors provided', () => {
      const lightOnlyTheme = {
        ...mockTheme,
        dark: undefined,
      };

      applyTheme(lightOnlyTheme, 'dark');

      expect(document.documentElement.style.getPropertyValue('--background')).toBe(mockTheme.light.background);
    });

    it('should work without radius', () => {
      const themeWithoutRadius = {
        ...mockTheme,
        radius: undefined,
      };

      applyTheme(themeWithoutRadius, 'light');

      expect(document.documentElement.style.getPropertyValue('--background')).toBe(mockTheme.light.background);
    });
  });

  describe('resetTheme', () => {
    beforeEach(() => {
      document.documentElement.className = '';
      document.documentElement.removeAttribute('style');
    });

    it('should reset to default light theme', () => {
      resetTheme('light');

      const defaultTheme = getDefaultTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.style.getPropertyValue('--background')).toBe(defaultTheme.light.background);
      expect(document.documentElement.style.getPropertyValue('--radius')).toBe(defaultTheme.radius);
    });

    it('should reset to default dark theme', () => {
      resetTheme('dark');

      const defaultTheme = getDefaultTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.getPropertyValue('--background')).toBe(defaultTheme.dark?.background);
      expect(document.documentElement.style.getPropertyValue('--radius')).toBe(defaultTheme.radius);
    });
  });
});
