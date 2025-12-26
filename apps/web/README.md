# React Frontend

Enterprise-ready React + TypeScript frontend with monitoring, E2E testing, security, and deployment infrastructure.

## Quick Start

```bash
# Install dependencies (from monorepo root)
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev:web
```

Frontend starts at `http://localhost:3000` and connects to backend at `http://localhost:8000`.

## Key Features

### Core Stack
- **React 18.3+** with TypeScript 5.6+
- **Vite 6.0+** - Lightning-fast builds and HMR
- **TanStack Router** - Type-safe routing with automatic code splitting
- **TanStack Query** - Powerful server state management
- **Tailwind CSS** + **shadcn/ui** - Beautiful, accessible components
- **React Hook Form** + **Zod** - Type-safe form validation

### Enterprise Infrastructure
- **Monitoring** - Sentry, Datadog RUM, OpenTelemetry (all opt-in)
- **Testing** - Vitest, Playwright, MSW, 80%+ coverage enforced
- **Security** - CSP headers, XSS protection, CORS
- **Performance** - Bundle < 200KB gzipped, Lighthouse > 90
- **CI/CD** - GitHub Actions, Docker, automated deployment
- **PWA** - Service worker, offline support, install-to-home

## Documentation

### Getting Started
- **[Getting Started Guide](./docs/GETTING_STARTED.md)** - Setup and first steps
- **[Project Summary](./docs/PROJECT_SUMMARY.md)** - Overview and capabilities
- **[Architecture](./docs/architecture.md)** - Project structure and patterns

### Features & Integration
- **[API Integration](./docs/api-integration.md)** - Backend integration, API versioning
- **[Theming Guide](./docs/THEMING_GUIDE.md)** - Theme system overview
- **[Theming Implementation](./docs/THEMING_IMPLEMENTATION.md)** - Detailed theme setup

### Operations
- **[Testing Guide](./docs/testing.md)** - Unit, integration, and E2E testing
- **[Monitoring Setup](./docs/monitoring.md)** - Sentry, Datadog, OpenTelemetry
- **[Deployment](./docs/deployment.md)** - Docker, CI/CD, production builds
- **[Verification Checklist](./docs/VERIFICATION_CHECKLIST.md)** - Pre-deployment checks

## Common Commands

```bash
# Development
pnpm dev:web              # Start dev server
pnpm build:web            # Production build
pnpm preview              # Preview production build

# Testing
pnpm test:web             # Run unit tests
pnpm test:watch           # Watch mode
pnpm test:coverage        # With coverage report
pnpm test:ui              # Interactive test UI
pnpm test:e2e             # Run E2E tests
pnpm test:e2e:ui          # E2E with Playwright UI

# Code Quality
pnpm lint                 # Lint with Biome
pnpm lint:fix             # Fix issues automatically
pnpm format               # Format code
pnpm type-check           # TypeScript type checking

# Storybook
pnpm storybook            # Start Storybook dev server
pnpm build-storybook      # Build Storybook
```

## Environment Variables

See `.env.example` for all options. Required variables:

```env
# API Configuration (required)
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
```

Optional monitoring (all disabled by default):

```env
# Sentry - Error tracking
VITE_SENTRY_ENABLED=true
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project

# Datadog - Real user monitoring
VITE_DATADOG_ENABLED=true
VITE_DATADOG_APPLICATION_ID=your-app-id
VITE_DATADOG_CLIENT_TOKEN=your-token

# OpenTelemetry - Distributed tracing
VITE_OTEL_ENABLED=true
VITE_OTEL_EXPORTER_ENDPOINT=http://localhost:4318/v1/traces
```

## Project Structure

```
apps/web/
├── src/
│   ├── components/       # Reusable components
│   │   ├── ui/          # shadcn/ui components
│   │   └── layout/      # Layout components
│   ├── features/         # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── products/    # Product management
│   │   └── health/      # Health monitoring
│   ├── lib/
│   │   ├── monitoring/  # Sentry, Datadog, OTEL
│   │   ├── performance/ # Web Vitals, performance utils
│   │   ├── security/    # Security utilities
│   │   └── analytics/   # Analytics integration
│   ├── routes/          # TanStack Router routes
│   └── types/           # TypeScript types
├── e2e/                 # Playwright E2E tests
├── docs/                # Comprehensive documentation
├── .storybook/          # Storybook configuration
└── public/              # Static assets
```

## Testing

### Unit & Integration Tests
```bash
# Run with coverage (80% minimum enforced)
pnpm test:coverage

# Watch mode for development
pnpm test:watch

# Interactive UI for debugging
pnpm test:ui
```

### E2E Tests
```bash
# Run all E2E tests
pnpm test:e2e

# Run with Playwright UI
pnpm test:e2e:ui

# Run specific browser
pnpm test:e2e --project=chromium
```

API requests are automatically mocked with MSW in tests.

## Monitoring

All monitoring is **opt-in** and disabled by default. See [docs/monitoring.md](./docs/monitoring.md) for setup:

- **Sentry** - Error tracking, performance monitoring, session replay
- **Datadog RUM** - Real user monitoring, Core Web Vitals, user analytics
- **OpenTelemetry** - Distributed tracing connecting frontend to backend
- **Web Vitals** - Automatic tracking of LCP, FID, CLS, INP, FCP, TTFB

## Deployment

### Docker
```bash
# Build production image
docker build -t scaffold-web:latest .

# Run container
docker run -p 8080:80 scaffold-web:latest
```

### CI/CD
GitHub Actions automatically:
- Runs tests on every PR
- Checks code quality with Biome
- Builds production bundle
- Deploys to production (main branch)

See [docs/deployment.md](./docs/deployment.md) for detailed deployment guide.

## Tech Stack

**Frontend**: React 18.3+, TypeScript 5.6+, Vite 6.0+
**Routing**: TanStack Router (type-safe, file-based)
**State**: TanStack Query (server state), React Context (UI state)
**Styling**: Tailwind CSS, shadcn/ui components
**Forms**: React Hook Form, Zod validation
**Testing**: Vitest, Playwright, React Testing Library, MSW
**Monitoring**: Sentry, Datadog RUM, OpenTelemetry
**DevOps**: Docker, Nginx, GitHub Actions, Biome

## Learn More

- [React Documentation](https://react.dev)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)
- [Sentry](https://sentry.io)
- [Datadog](https://www.datadoghq.com)

## License

ISC
