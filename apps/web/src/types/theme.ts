export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;

  // Component colors
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;

  // Semantic colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;

  // UI elements
  border: string;
  input: string;
  ring: string;
}

export interface Theme {
  id: string;
  name: string;
  light: ThemeColors;
  dark?: ThemeColors;
  radius?: string;
}

export interface CustomerTheme {
  customerId: string;
  customerName: string;
  theme: Theme;
  createdAt?: string;
  updatedAt?: string;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme | null;
  themeMode: ThemeMode;
  isCustomTheme: boolean;
  customerId: string | null;
  setTheme: (theme: Theme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  resetTheme: () => void;
  applyTheme: (theme: Theme, mode?: ThemeMode) => void;
}
