import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearCustomerTheme,
  getDefaultTheme,
  getInitialThemeMode,
  getReferralFromURL,
  loadCustomerTheme,
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
});
