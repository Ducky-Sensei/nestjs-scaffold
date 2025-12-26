# Architecture Documentation

## Tech Stack

- [NestJS](https://nestjs.com/) - Progressive Node.js framework for scalable server-side applications
- [TypeORM](https://typeorm.io/) - Powerful ORM with migration support
- [PostgreSQL](https://www.postgresql.org/) - Reliable relational database
- [Testcontainers](https://testcontainers.com/) - Docker containers for testing and development
- [TypeScript](https://www.typescriptlang.org/) - Full type safety
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [Biome](https://biomejs.dev/) - Fast linter and formatter

## Features

- **NestJS Framework** - Progressive Node.js framework for scalable server-side applications
- **TypeORM** - Powerful ORM with migration support
- **PostgreSQL** - Reliable relational database
- **Docker Test Containers** - Isolated database containers for development
- **Hot Reload** - Fast development with nodemon
- **Database Seeding** - Automatic seed data on startup
- **TypeScript** - Full type safety
- **Biome** - Fast linter and formatter (replaces ESLint & Prettier)

## Project Structure

```
scaffold/
├── dev/
│   ├── test-containers.ts      # Docker container setup
│   └── test-data/
│       └── seed.ts              # Database seeding
├── docs/                        # Documentation
│   ├── onboarding.md           # Getting started guide
│   ├── api.md                  # API endpoints
│   ├── architecture.md         # This file
│   ├── db.md                   # Database documentation
│   ├── docker.md               # Docker workflows
│   └── development.md          # Development guide
├── scripts/                     # Build and utility scripts
├── src/
│   ├── app/                     # App module and root controller
│   ├── config/
│   │   └── typeorm.config.ts   # TypeORM configuration
│   ├── migrations/              # Database migrations
│   ├── product/                 # Example product module
│   ├── main.ts                  # Application entry point
│   └── main-dev.ts             # Development container setup
├── test/                        # E2E tests
├── .env.example                 # Environment variables template
├── nodemon.json                 # Nodemon configuration
└── tsconfig.json               # TypeScript configuration
```

## Module Structure

The application follows NestJS module-based architecture:

### App Module
- Root module that imports all feature modules
- Contains the root controller with health check endpoint

### Product Module (Example)
- Demonstrates a typical feature module structure
- Includes:
  - Controller (handles HTTP requests)
  - Service (business logic)
  - Entity (database model)
  - DTOs (data transfer objects)

### Configuration
- TypeORM configuration in `src/config/typeorm.config.ts`
- Environment-based settings
- Migration management

## Development Entry Points

### `src/main.ts`
- Standard NestJS application bootstrap
- Used for production builds
- Connects to external database

### `src/main-dev.ts`
- Development-specific bootstrap
- Integrates with testcontainers
- Handles automatic seeding
- Manages container lifecycle

## Database Architecture

The application uses TypeORM with PostgreSQL:

- **Entities**: Define database tables as TypeScript classes
- **Migrations**: Version-controlled schema changes
- **Repositories**: Type-safe database operations
- **Seeding**: Automatic test data population

See [Database Documentation](./db.md) for detailed information.

## Testing Architecture

- **Unit Tests**: Test individual components in isolation
- **E2E Tests**: Test complete application flows with testcontainers
- **Isolated Databases**: Each test run uses a fresh database container

## Configuration Management

Environment variables are managed through:
- `.env` file for local development
- `.env.example` template with all available options
- TypeORM config reads from environment
- Docker Compose files for containerized environments
