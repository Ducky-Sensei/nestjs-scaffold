# Docker Documentation

## Overview

The project supports multiple Docker workflows to suit different development needs and deployment scenarios.

## Development Workflows

### Option 1: Local Development with Testcontainers (Recommended)

Fast development with hot-reload using testcontainers - **best for active development**.

```bash
pnpm start:dev
```

**What this does:**

1. Starts a PostgreSQL testcontainer on port 1530
2. Runs migrations automatically
3. Seeds the database (once on first start)
4. Starts the NestJS server with hot-reload on port 8000
5. Watches for file changes (server restarts automatically, no re-seeding)

Press `Ctrl+C` to stop both the database and server.

**Benefits:**

- Fastest hot-reload performance
- Automatic container cleanup on exit
- Container reuse on file changes (no DB restart)
- Perfect for local development and testing

**Requirements:**

- Docker must be running
- Node.js and pnpm installed locally

### Option 2: Docker Development (Team/CI)

Run the full development stack in Docker - **best for team consistency**.

```bash
# Start development (DB + App with hot-reload)
docker-compose -f docker-compose.dev.yml up

# Build and start in detached mode
docker-compose -f docker-compose.dev.yml up -d --build

# Stop everything
docker-compose -f docker-compose.dev.yml down

# Fresh start (wipes DB)
docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f app
```

**What this does:**

- Dedicated PostgreSQL container on port 1530
- NestJS app with nodemon hot-reload
- Code changes sync via volume mounts
- Database seeding on first start
- Persistent database volume

**When to use:**

- Team consistency (everyone uses Docker)
- No local Node.js/pnpm needed
- Clean environment isolation
- CI/CD pipelines

**Image Size:** ~150MB (Alpine-based, optimized layers)

### Option 3: Production Docker Build

Test the production build locally - **best for pre-deployment verification**.

```bash
# Start production stack
docker-compose -f docker-compose.prod.yml up --build

# Detached mode
docker-compose -f docker-compose.prod.yml up -d --build

# Stop and remove volumes
docker-compose -f docker-compose.prod.yml down -v
```

**What this does:**

- Multi-stage optimized build
- Production-only dependencies
- Separate PostgreSQL container
- No hot-reload (production mode)

**Image Size:** ~50-80MB (minimal production image)

## Docker Compose Files

### `docker-compose.dev.yml`

Development environment with:
- PostgreSQL database
- Development app with hot-reload
- Volume mounts for code sync
- Persistent database volume

### `docker-compose.prod.yml`

Production environment with:
- PostgreSQL database
- Optimized production build
- Minimal image size
- Production configurations

## Testcontainers

Testcontainers provide isolated database instances for development and testing:

**Configuration:** `dev/test-containers.ts`

**Features:**
- Automatic PostgreSQL container management
- Port 1530 by default
- Container reuse for performance
- Automatic cleanup

**Usage:**
```typescript
import { startDatabase } from './dev/test-containers';

const dataSource = await startDatabase();
```

## Docker Best Practices

### Development

1. Use testcontainers for fastest development
2. Use docker-compose.dev.yml for team consistency
3. Mount volumes for hot-reload
4. Use named volumes for data persistence

### Production

1. Multi-stage builds for smaller images
2. Production-only dependencies
3. Environment-based configuration
4. Health checks for container orchestration
5. Non-root user for security

## Troubleshooting

### Port Already in Use

If port 1530 or 8000 is already in use:

```bash
# Find process using the port
lsof -i :1530
lsof -i :8000

# Kill the process or change ports in .env
```

### Container Won't Start

```bash
# Remove all containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml up --build
```

### Slow Hot Reload in Docker

- Ensure volume mounts are configured correctly
- On macOS/Windows, consider using :cached flag for volumes
- Alternatively, use testcontainers with local development

### Database Connection Issues

```bash
# Check database container is running
docker ps

# View database logs
docker-compose -f docker-compose.dev.yml logs db

# Connect to database directly
docker exec -it <container-name> psql -U test -d test
```

## Image Optimization

### Development Image
- Based on Node.js Alpine
- Includes dev dependencies
- ~150MB total size
- Optimized layer caching

### Production Image
- Multi-stage build
- Production dependencies only
- ~50-80MB total size
- Security hardened

## Environment Variables in Docker

Set environment variables in:
- `.env` file (for local development)
- `docker-compose.*.yml` files (for Docker environments)
- Container orchestration configs (for production)

Example docker-compose environment:

```yaml
environment:
  - DATABASE_HOST=db
  - DATABASE_PORT=5432
  - DATABASE_USER=test
  - DATABASE_PASSWORD=test
  - DATABASE_NAME=test
```
