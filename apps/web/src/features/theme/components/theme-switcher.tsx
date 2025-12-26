import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EXAMPLE_THEMES } from '../constants/example-themes';
import { useTheme } from '../context/theme-context';

export function ThemeSwitcher() {
  const { theme, themeMode, setThemeMode, applyTheme, resetTheme, isCustomTheme, customerId } =
    useTheme();

  const toggleMode = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const handleThemeChange = (themeKey: keyof typeof EXAMPLE_THEMES) => {
    applyTheme(EXAMPLE_THEMES[themeKey]);
  };

  const handleReset = () => {
    resetTheme();
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-semibold">Theme Settings</h3>
          {isCustomTheme && customerId && (
            <p className="text-sm text-muted-foreground">Custom theme for: {customerId}</p>
          )}
          {theme && (
            <p className="text-sm text-muted-foreground">
              Current: {theme.name} ({themeMode})
            </p>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={toggleMode}>
          {themeMode === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Theme Options:</p>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset to Default
          </Button>
        </div>
      </div>

      {!isCustomTheme && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Try Example Themes:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleThemeChange('BLUE_CORPORATE')}>
              Blue Corporate
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleThemeChange('GREEN_TECH')}>
              Green Tech
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleThemeChange('PURPLE_PREMIUM')}>
              Purple Premium
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleThemeChange('ORANGE_ENERGY')}>
              Orange Energy
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleThemeChange('RED_BRAND')}>
              Red Brand
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Test All Button Variants:</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="default" size="sm">
            Primary
          </Button>
          <Button variant="secondary" size="sm">
            Secondary
          </Button>
          <Button variant="ghost" size="sm">
            Ghost
          </Button>
          <Button variant="outline" size="sm">
            Outline
          </Button>
          <Button variant="destructive" size="sm">
            Destructive
          </Button>
          <Button variant="link" size="sm">
            Link
          </Button>
        </div>
      </div>
    </div>
  );
}
