# Onboarding Guide

Get started with the NestJS Scaffold project.

## Prerequisites

- Node.js (v18 or higher)
- pnpm (`npm install -g pnpm`)
- Docker (for test containers)

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
```

## Environment Variables

See `.env.example` for all available configuration options:

```env
DATABASE_HOST=localhost
DATABASE_PORT=1530
DATABASE_USER=test
DATABASE_PASSWORD=test
DATABASE_NAME=test
SEED_DATABASE=true
```

## Quick Start

### Local Development (Recommended)

Fast development with hot-reload using testcontainers:

```bash
pnpm start:dev
```

This will:

1. Start a PostgreSQL testcontainer on port 1530
2. Run migrations automatically
3. Seed the database (once on first start)
4. Start the NestJS server with hot-reload on port 8000
5. Watch for file changes (server restarts automatically, no re-seeding)

Press `Ctrl+C` to stop both the database and server.

**Requirements:**
- Docker must be running
- Node.js and pnpm installed locally

### Verify Installation

Once running, test the API:

```bash
# Health check
curl http://localhost:8000

# Get all products
curl http://localhost:8000/products
```

## Next Steps

- Review the [Architecture Documentation](./architecture.md) to understand the project structure
- Check out [Development Guide](./development.md) for development workflows
- See [Database Documentation](./db.md) for managing migrations and seeding
- Explore [Docker Documentation](./docker.md) for alternative development setups
- Read [API Documentation](./api.md) for available endpoints
