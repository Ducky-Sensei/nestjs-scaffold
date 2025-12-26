# NestJS Backend API

Production-ready NestJS scaffold with TypeORM, PostgreSQL, Redis, and comprehensive testing infrastructure.

## Quick Start

```bash
# Install dependencies (from monorepo root)
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev:api
```

Server starts at `http://localhost:8000` with PostgreSQL and Redis automatically provisioned via Testcontainers.

## Key Features

- **NestJS Framework** - TypeScript-first backend framework
- **TypeORM** - Database ORM with migrations and seeding
- **Testcontainers** - Automatic PostgreSQL & Redis for development/testing
- **Authentication** - JWT, OAuth (Google/GitHub), RBAC
- **API Versioning** - URI versioning with backward compatibility
- **Caching** - Redis-based caching with decorators
- **Monitoring** - Sentry error tracking, performance monitoring
- **Security** - Helmet, CORS, rate limiting, security headers
- **Swagger/OpenAPI** - Auto-generated API documentation
- **Structured Logging** - Pino logger with correlation IDs

## Documentation

### Getting Started

- **[Onboarding Guide](./docs/onboarding.md)** - Installation and setup
- **[Development Workflow](./docs/development.md)** - Hot-reload, testing, debugging
- **[Architecture](./docs/architecture.md)** - Project structure and design decisions

### Core Features

- **[API Documentation](./docs/api.md)** - Available endpoints and examples
- **[Authentication](./docs/authentication.md)** - JWT, OAuth, session management
- **[API Versioning](./docs/api-versioning.md)** - Version strategy and migration
- **[RBAC](./docs/rbac.md)** - Role-based access control
- **[Validation](./docs/validation.md)** - Request validation and DTOs
- **[Error Handling](./docs/error-handling.md)** - Error responses and logging

### Infrastructure

- **[Database](./docs/db.md)** - Migrations, seeding, TypeORM usage
- **[Caching](./docs/caching.md)** - Redis caching strategies
- **[Rate Limiting](./docs/rate-limiting.md)** - API rate limiting configuration
- **[Security](./docs/security.md)** - Security headers, CORS, best practices
- **[Monitoring](./docs/MONITORING.md)** - Sentry setup and observability
- **[Docker](./docs/docker.md)** - Docker workflows and deployment

### Advanced

- **[OAuth Setup](./docs/OAUTH_SETUP.md)** - Google/GitHub OAuth configuration
- **[Swagger/OpenAPI](./docs/swagger.md)** - API documentation setup

## Common Commands

```bash
# Development
pnpm dev:api              # Start dev server
pnpm build:api            # Build for production
pnpm start:prod           # Run production build

# Database
pnpm migration:generate   # Create new migration
pnpm migration:run        # Run pending migrations
pnpm migration:revert     # Revert last migration

# Testing
pnpm test:api             # Run all tests (uses Testcontainers)
pnpm test:watch           # Watch mode
pnpm test:cov             # Coverage report

# Code Quality
pnpm lint                 # Lint code
pnpm format               # Format code
```

## Environment Variables

See `.env.example` for all configuration options. Key variables:

```env
# Database (auto-provisioned in dev via Testcontainers)
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Redis (auto-provisioned in dev via Testcontainers)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-secret

# Monitoring (optional)
SENTRY_DSN=https://your-dsn@sentry.io/project
```

## Project Structure

```
apps/api/
├── src/
│   ├── modules/          # Feature modules (auth, users, products, etc.)
│   ├── common/           # Shared utilities, decorators, guards
│   ├── database/         # Database config, migrations, seeders
│   ├── config/           # Configuration modules
│   └── main.ts           # Application entry point
├── test/                 # E2E tests
├── docs/                 # Comprehensive documentation
└── migrations/           # TypeORM migrations
```

## Tech Stack

- **Framework**: NestJS 10+
- **Database**: PostgreSQL 16+ with TypeORM 0.3+
- **Cache**: Redis 7+
- **Testing**: Jest, Testcontainers
- **Validation**: class-validator, class-transformer
- **Security**: Helmet, CORS, rate-limit
- **Logging**: Pino
- **Monitoring**: Sentry
- **API Docs**: Swagger/OpenAPI

## Learn More

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Testcontainers Documentation](https://testcontainers.com)
- [Swagger/OpenAPI](https://swagger.io)

## License

MIT
