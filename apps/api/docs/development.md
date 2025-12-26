# Development Guide

## Development Workflow

### Starting Development

```bash
pnpm start:dev
```

This starts the application with:
- Hot-reload enabled (automatic restart on file changes)
- Testcontainer PostgreSQL database
- Automatic migrations
- Database seeding (first run only)

### Building the Application

```bash
# Development build
pnpm build

# Production build
pnpm build

# Run production build
pnpm start:prod
```

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov
```

### E2E Tests

```bash
# Run end-to-end tests
pnpm test:e2e
```

E2E tests use testcontainers to provide isolated database instances for each test run.

## Code Quality

This project uses [Biome](https://biomejs.dev/) for fast linting and formatting with a single tool.

### Commands

```bash
# Check and fix both linting and formatting issues
pnpm check

# Lint code only (with auto-fix)
pnpm lint

# Check linting without auto-fix
pnpm lint:check

# Format code
pnpm format

# Check formatting without writing
pnpm format:check

# CI mode (checks without modifying files, exits with error if issues found)
pnpm check:ci
```

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to automatically enforce code quality on commits.

### Pre-commit Hook

Automatically runs on every commit:

- **Linting & Formatting**: Runs `biome check --write` on staged files
- **Auto-fixes**: Issues are automatically fixed when possible
- **Fails on errors**: Commit is blocked if unfixable issues exist

The hook only checks files you've staged, making it fast and efficient.

### Commit Message Hook

Enforces [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

[optional body]

[optional footer]
```

**Valid types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `build:` - Build system or dependencies
- `ci:` - CI configuration changes
- `chore:` - Other changes (maintenance)
- `revert:` - Revert previous commit

**Examples:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve database connection timeout"
git commit -m "docs: update API documentation"
```

### Bypassing Hooks (Not Recommended)

If you need to bypass hooks in exceptional cases:

```bash
# Skip all hooks
git commit --no-verify -m "emergency fix"
```

Use sparingly - hooks are there to maintain code quality.

### Biome vs ESLint/Prettier

Biome replaces both ESLint and Prettier with a single, faster tool:
- 10-100x faster than ESLint
- Single configuration file
- Consistent formatting and linting
- Built in Rust for performance

## Project Scripts

```json
{
  "start:dev": "Start development with hot-reload",
  "start:prod": "Run production build",
  "build": "Build the application",
  "test": "Run unit tests",
  "test:watch": "Run tests in watch mode",
  "test:e2e": "Run E2E tests",
  "test:cov": "Run tests with coverage",
  "lint": "Lint and fix code",
  "format": "Format code",
  "check": "Run all linting and formatting",
  "migration:generate": "Generate migration from entity changes",
  "migration:create": "Create empty migration",
  "migration:run": "Run pending migrations",
  "migration:revert": "Revert last migration",
  "migration:show": "Show migration status"
}
```

## Development Best Practices

### Code Organization

- Keep modules focused and cohesive
- Follow NestJS module structure
- Use dependency injection
- Separate business logic from HTTP layer

### Database

- Always use migrations for schema changes
- Keep seed data updated
- Use TypeORM repositories
- Test migrations before production

### Testing

- Write unit tests for business logic
- Write E2E tests for critical flows
- Use testcontainers for database tests
- Aim for good test coverage

### Type Safety

- Use TypeScript strict mode
- Define DTOs for API contracts
- Use entity types from TypeORM
- Avoid `any` types

### Error Handling

- Use NestJS exception filters
- Return appropriate HTTP status codes
- Log errors with context
- Validate input data

## Hot Reload

The project uses nodemon for hot-reload during development:

- File changes trigger automatic restart
- Database container is reused (no restart)
- Seeding skipped on restart for performance
- Configuration in `nodemon.json`

## Debugging

### VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["start:dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Logging

NestJS includes built-in logging:

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('ContextName');
logger.log('Message');
logger.error('Error message');
logger.warn('Warning message');
logger.debug('Debug message');
```

## Performance

### Development

- Use testcontainers for fast startup
- Enable hot-reload for quick iterations
- Skip seeding on restart

### Production

- Use compiled JavaScript (not ts-node)
- Enable production mode
- Configure connection pooling
- Use caching where appropriate

## Contributing

### Workflow

1. Create a feature branch from `master`
2. Make your changes
3. Run linting and formatting: `pnpm check`
4. Run tests: `pnpm test`
5. Ensure build succeeds: `pnpm build`
6. Commit with descriptive messages
7. Submit a pull request

### Code Review Checklist

- Code follows project style
- Tests added/updated
- Documentation updated
- No linting errors
- Build succeeds
- Migrations tested
