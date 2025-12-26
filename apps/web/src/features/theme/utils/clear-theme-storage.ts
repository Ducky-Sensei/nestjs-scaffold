/**
 * Clear all theme-related data from localStorage
 * Useful for debugging or resetting the theme system
 */
export function clearThemeStorage(): void {
  // Clear theme mode
  localStorage.removeItem('theme-mode');

  // Clear all customer themes
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith('customer-theme-')) {
      localStorage.removeItem(key);
    }
  });

  // Remove dark class
  document.documentElement.classList.remove('dark');

  // Clear all inline CSS variable overrides
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

  console.log('✅ Theme storage cleared. Reload the page for default theme.');
}

// Make it available globally for debugging
declare global {
  interface Window {
    clearThemeStorage?: typeof clearThemeStorage;
  }
}

if (typeof window !== 'undefined') {
  window.clearThemeStorage = clearThemeStorage;
}
