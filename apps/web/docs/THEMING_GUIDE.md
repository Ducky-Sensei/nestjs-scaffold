# White-Label Theming System

## Overview

This project includes a comprehensive white-label theming system that allows customers to use your application with their own branding colors. The system uses CSS variables and Tailwind CSS to provide dynamic theming capabilities.

## Features

- **Dynamic Theme Loading**: Automatically fetches and applies customer themes based on URL parameters
- **Semantic Color System**: Uses semantic color names (primary, secondary, ghost, etc.) throughout the application
- **Dark Mode Support**: Each theme can define both light and dark color schemes
- **Local Caching**: Customer themes are cached in localStorage for instant application
- **Type-Safe**: Full TypeScript support with type definitions for all theme properties

## How It Works

### 1. URL-Based Theme Detection

When a customer accesses your application via a referral link, the theme system automatically detects the customer ID and loads their custom theme:

```
yourapp.com/?referral_page=customer123
yourapp.com/?customer_id=customer123
yourapp.com/?ref=customer123
```

### 2. Theme Structure

Each theme consists of:

```typescript
interface Theme {
  id: string;
  name: string;
  light: ThemeColors; // Light mode colors
  dark?: ThemeColors; // Optional dark mode colors
  radius?: string; // Border radius (e.g., '0.5rem')
}
```

### 3. Semantic Colors

The system uses semantic color keywords that map to CSS variables:

- **primary**: Main brand color for primary actions and branding
- **secondary**: Secondary brand color for alternative actions
- **accent**: Accent color for highlights and emphasis
- **muted**: Muted colors for less important content
- **destructive**: Color for destructive actions (delete, remove, etc.)
- **ghost**: Subtle variant with minimal background
- **background**: Main background color
- **foreground**: Main text color
- **card**: Card background color
- **border**: Border color
- **input**: Input field colors
- **ring**: Focus ring color

## Usage

### Using the Theme Context

```tsx
import { useTheme } from "@/features/theme/context/theme-context";

function MyComponent() {
  const { theme, themeMode, setThemeMode, applyTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme?.name}</p>
      <button onClick={() => setThemeMode("dark")}>Switch to Dark Mode</button>
    </div>
  );
}
```

### Using Semantic Colors in Components

Always use semantic color names instead of hardcoded colors:

```tsx
// ✅ GOOD - Uses semantic colors
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click Me
</button>

// ❌ BAD - Uses hardcoded colors
<button className="bg-blue-500 text-white hover:bg-blue-600">
  Click Me
</button>
```

### Component Variants

Components like buttons use semantic color variants:

```tsx
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="outline">Outlined Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link</Button>
```

## Backend Integration

### API Endpoints

The frontend expects these endpoints from your backend:

#### Get Customer Theme

```
GET /v1/themes/customer/:customerId
```

Response:

```json
{
  "customerId": "customer123",
  "customerName": "Acme Corp",
  "theme": {
    "id": "acme-theme",
    "name": "Acme Brand Theme",
    "light": {
      "background": "0 0% 100%",
      "foreground": "222 47% 11%",
      "primary": "221 83% 53%",
      "primaryForeground": "0 0% 100%"
      // ... other colors
    },
    "dark": {
      // ... dark mode colors
    },
    "radius": "0.5rem"
  }
}
```

### Database Schema Example

```sql
CREATE TABLE customer_themes (
  id UUID PRIMARY KEY,
  customer_id VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  theme_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Color Format

Colors are defined in HSL format without the `hsl()` wrapper:

```typescript
primary: "221 83% 53%"; // Hue Saturation Lightness
```

This format is then used in CSS variables:

```css
:root {
  --primary: 221 83% 53%;
}

/* Used in Tailwind as: */
hsl(var(--primary))
```

## Example Themes

The project includes several pre-built example themes in `src/features/theme/constants/example-themes.ts`:

- **Blue Corporate**: Professional blue theme
- **Green Tech**: Modern green theme
- **Purple Premium**: Premium purple theme
- **Orange Energy**: Vibrant orange theme
- **Red Brand**: Bold red theme

## Testing

### Testing the Theme System Locally

1. Use the `ThemeSwitcher` component to test different themes:

```tsx
import { ThemeSwitcher } from "@/features/theme/components/theme-switcher";

function TestPage() {
  return (
    <div>
      <h1>Theme Testing</h1>
      <ThemeSwitcher />
    </div>
  );
}
```

2. Test URL parameters:

```
http://localhost:5173/?referral_page=test-customer
```

3. Check localStorage to see cached themes:

```javascript
localStorage.getItem("customer-theme-test-customer");
```

## Creating Custom Themes

### For Backend Developers

1. Define theme colors in HSL format
2. Store in database associated with customer ID
3. Return via the `/themes/customer/:customerId` endpoint

### For Frontend Developers

1. Create a new theme object:

```typescript
import type { Theme } from "@/types/theme";

const myCustomTheme: Theme = {
  id: "my-custom-theme",
  name: "My Custom Theme",
  light: {
    background: "0 0% 100%",
    foreground: "222 47% 11%",
    primary: "200 80% 50%",
    primaryForeground: "0 0% 100%",
    // ... define all required colors
  },
  dark: {
    // ... dark mode colors (optional)
  },
  radius: "0.5rem",
};
```

2. Apply programmatically:

```tsx
import { useTheme } from "@/features/theme/context/theme-context";

function MyComponent() {
  const { applyTheme } = useTheme();

  const loadMyTheme = () => {
    applyTheme(myCustomTheme);
  };

  return <button onClick={loadMyTheme}>Load Custom Theme</button>;
}
```

## Best Practices

1. **Always use semantic color names** - Never hardcode color values
2. **Define both light and dark modes** - Provide good UX in both modes
3. **Test accessibility** - Ensure sufficient color contrast
4. **Cache appropriately** - Themes are cached automatically, but can be cleared if needed
5. **Handle loading states** - Theme fetching is asynchronous
6. **Fallback to defaults** - If customer theme fails to load, default theme is applied

## Files Overview

```
src/
├── features/theme/
│   ├── api/
│   │   └── theme-api.ts              # API calls for fetching themes
│   ├── context/
│   │   └── theme-context.tsx         # Theme context and provider
│   ├── hooks/
│   │   └── use-theme.ts              # React Query hooks for themes
│   ├── components/
│   │   └── theme-switcher.tsx        # Theme switcher UI component
│   └── constants/
│       └── example-themes.ts         # Example theme configurations
├── lib/utils/
│   └── theme.ts                      # Theme utility functions
├── types/
│   └── theme.ts                      # TypeScript type definitions
└── index.css                         # CSS variables definitions
```

## Troubleshooting

### Theme not loading from URL

1. Check that URL parameter is correct (`?referral_page=customer-id`)
2. Verify backend endpoint is working
3. Check browser console for errors
4. Verify theme data structure matches expected format

### Colors not updating

1. Check that components use semantic color classes
2. Verify CSS variables are being updated (inspect element)
3. Clear localStorage and try again
4. Check that ThemeProvider wraps your app in main.tsx

### Backend integration issues

1. Verify API endpoint returns correct JSON structure
2. Check CORS settings if calling from different domain
3. Ensure authentication tokens are included if required
4. Review network tab in browser dev tools

## Migration Guide

If you have existing components with hardcoded colors:

1. Find all instances of color classes:

   ```bash
   # Search for hardcoded color classes
   grep -r "bg-blue-" src/
   grep -r "text-red-" src/
   ```

2. Replace with semantic equivalents:
   - `bg-blue-500` → `bg-primary`
   - `text-blue-500` → `text-primary`
   - `bg-gray-100` → `bg-secondary`
   - `bg-red-500` → `bg-destructive`

3. Test all replaced components with different themes
