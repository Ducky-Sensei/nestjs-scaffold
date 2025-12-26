# Testing Guide

## Overview

The scaffold includes three types of testing:

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright (multi-browser)
- **Component Tests**: Storybook

## Running Tests

```bash
# Unit tests
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
pnpm test:ui           # Interactive UI

# E2E tests
pnpm test:e2e          # Run all E2E tests
pnpm test:e2e:ui       # Interactive mode
pnpm test:e2e:headed   # With browser visible

# Storybook
pnpm storybook         # Start Storybook
pnpm build-storybook   # Build static site
```

## Writing Unit Tests

### Example Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### API Mocking with MSW

API requests are automatically mocked in tests using MSW (Mock Service Worker).

Handlers are defined in `src/__mocks__/handlers.ts`.

## Writing E2E Tests

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('complete user flow', async ({ page }) => {
  await page.goto('/');

  // Login
  await page.getByLabel(/email/i).fill('admin@admin.com');
  await page.getByLabel(/password/i).fill('Foobar1!');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Verify dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText(/welcome/i)).toBeVisible();
});
```

## Coverage Requirements

Minimum coverage thresholds (configured in `vitest.config.ts`):

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Best Practices

1. **Test behavior, not implementation**
2. **Use accessibility queries** (`getByRole`, `getByLabelText`)
3. **Avoid testing internals**
4. **Mock external dependencies**
5. **Keep tests fast and isolated**
6. **Write meaningful test descriptions**
7. **Test error states and edge cases**

## CI Integration

Tests run automatically on every push and PR via GitHub Actions.
