# Scaffold Monorepo

Full-stack TypeScript monorepo with enterprise-grade NestJS backend and React frontend.

## Projects

### [Backend - NestJS API](./apps/api)
Production-ready NestJS scaffold with TypeORM, PostgreSQL, Redis, and comprehensive testing infrastructure.

**[→ View Backend Documentation](./apps/api/README.md)**

Key features: Testcontainers, TypeORM migrations, Swagger docs, security headers, structured logging

### [Frontend - React App](./apps/web)
Enterprise-ready React + TypeScript frontend with monitoring, E2E testing, and deployment infrastructure.

**[→ View Frontend Documentation](./apps/web/README.md)**

Key features: Sentry/Datadog monitoring, Playwright E2E, TanStack Router/Query, shadcn/ui, PWA support

### [Shared Types](./packages/types)
Shared TypeScript types and Zod schemas for type-safe communication between frontend and backend.

## Quick Start

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 10.0.0
- Docker & Docker Compose

### Installation

```bash
# Install all dependencies
pnpm install

# Copy environment files
cp .env.example .env
cd apps/api && cp .env.example .env
cd ../web && cp .env.example .env
```

### Run Development Stack

```bash
# Start both API and Web concurrently
pnpm dev

# Backend runs on http://localhost:8000
# Frontend runs on http://localhost:3000
```

The backend automatically spins up PostgreSQL and Redis using Testcontainers.

## Common Commands

```bash
# Development
pnpm dev              # Run both apps
pnpm dev:api          # Backend only
pnpm dev:web          # Frontend only

# Testing
pnpm test             # All tests
pnpm test:e2e         # E2E tests in Docker

# Building
pnpm build            # Build all packages

# Code Quality
pnpm lint             # Lint all packages
pnpm type-check       # Type check all
```

## Workspace Structure

```
scaffold-mono/
├── apps/
│   ├── api/              # NestJS backend → See apps/api/README.md
│   └── web/              # React frontend → See apps/web/README.md
├── packages/
│   └── types/            # Shared TypeScript types
└── docker-compose.yml    # E2E testing stack
```

## Documentation

Each project has comprehensive documentation:

- **[Backend Documentation](./apps/api/README.md)** - API setup, architecture, database, testing
- **[Frontend Documentation](./apps/web/README.md)** - React setup, monitoring, deployment, security

## Tech Stack

**Backend**: NestJS, TypeORM, PostgreSQL, Redis, Testcontainers, Swagger
**Frontend**: React, Vite, TanStack Router/Query, Tailwind, shadcn/ui, Playwright
**Shared**: TypeScript, Zod, PNPM Workspaces

## License

MIT
