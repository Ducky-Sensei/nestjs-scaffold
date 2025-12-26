# Database Documentation

## Overview

The project uses PostgreSQL with TypeORM for database management. TypeORM provides powerful migration support and type-safe database operations.

## Database Configuration

Database configuration is managed through environment variables:

```env
DATABASE_HOST=localhost
DATABASE_PORT=1530
DATABASE_USER=test
DATABASE_PASSWORD=test
DATABASE_NAME=test
SEED_DATABASE=true
```

## Migrations

Migrations allow you to version control your database schema changes.

### Generate Migration

Automatically detect entity changes and generate a migration:

```bash
pnpm migration:generate [name of migration file]
```

TypeORM will compare your entities with the current database schema and generate the necessary SQL.

### Create Empty Migration

Create a blank migration file for custom SQL:

```bash
pnpm migration:create src/migrations/MigrationName
```

### Run Migrations

Apply pending migrations to the database:

```bash
pnpm migration:run
```

### Revert Migration

Rollback the last executed migration:

```bash
pnpm migration:revert
```

### Check Migration Status

See which migrations have been applied:

```bash
pnpm migration:show
```

## Database Seeding

### Automatic Seeding

The database is automatically seeded when you run `pnpm start:dev` for the first time:

1. On initial startup, the seed runs and creates test data
2. A flag is set to prevent re-seeding
3. On subsequent hot-reloads, seeding is skipped for performance
4. Container restart resets the flag and re-seeds

### Modify Seed Data

To change the seed data:

1. Edit `dev/test-data/seed.ts`
2. Restart your development server

### Seed Data Structure

The seed file should export functions that:
- Create test data using TypeORM repositories
- Return created entities for reference
- Handle relationships between entities

Example:

```typescript
export async function seedProducts(dataSource: DataSource) {
  const productRepository = dataSource.getRepository(Product);

  const products = [
    { name: 'Product 1', price: 29.99, description: 'Test product 1' },
    { name: 'Product 2', price: 39.99, description: 'Test product 2' },
  ];

  return await productRepository.save(products);
}
```

## Working with Entities

### Creating an Entity

Entities are TypeScript classes that map to database tables:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column({ nullable: true })
  description: string;
}
```

### Entity Best Practices

- Use decorators to define columns and relationships
- Add validation using class-validator
- Keep entities in feature module directories
- Use TypeScript types for compile-time safety

## Database Environments

### Development with Testcontainers

- Automatic PostgreSQL container on port 1530
- Fresh database on each restart
- Automatic migrations and seeding
- Container cleanup on exit

### Docker Development

- Dedicated PostgreSQL container
- Persistent database volume
- Manual migration and seed control
- Shared database across team

### Production

- External PostgreSQL instance
- Migration management via CI/CD
- No automatic seeding
- Backup and recovery strategies needed

## TypeORM Configuration

Configuration is located in `src/config/typeorm.config.ts`:

- Environment-based settings
- Entity discovery
- Migration paths
- Connection pooling
- Logging options

## Database Connection

TypeORM manages connections automatically:

- Connection pool for concurrent requests
- Automatic reconnection on failure
- Transaction support
- Query caching options

## Best Practices

1. **Always use migrations** - Never modify the database schema manually
2. **Test migrations** - Run migrations in development before applying to production
3. **Seed data for development** - Keep seed data up-to-date with schema changes
4. **Use repositories** - Leverage TypeORM repositories for type-safe queries
5. **Handle relations properly** - Define and use entity relationships correctly
6. **Version control** - Commit all migration files to version control
