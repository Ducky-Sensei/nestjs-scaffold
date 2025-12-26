# Caching Layer

This application includes a flexible caching layer that supports both in-memory and Redis-based caching. The caching system is designed to be optional, production-ready, and follows the same optional service pattern as other infrastructure services (Prometheus, Sentry, Datadog).

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Cache Invalidation](#cache-invalidation)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Health Checks](#health-checks)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Why Caching?

Caching provides several benefits for production applications:

- **Reduced Database Load**: Frequently accessed data is served from cache instead of hitting the database
- **Improved Response Times**: Cache responses are significantly faster than database queries
- **Scalability**: Reduces bottlenecks on database connections
- **Multi-Instance Support**: Redis enables shared cache across multiple application instances
- **Rate Limiting**: Can be used to store rate limit data across instances

### Cache Types

The application supports two cache types:

1. **Memory Cache**: In-memory caching using Node.js process memory
   - ✅ Simple setup, no external dependencies
   - ✅ Fast access times
   - ❌ Not shared across application instances
   - ❌ Lost on application restart
   - **Best for**: Single-instance deployments, development

2. **Redis Cache**: Distributed caching using Redis
   - ✅ Shared across multiple application instances
   - ✅ Persistent across application restarts
   - ✅ Horizontal scalability
   - ✅ Production-ready
   - ❌ Requires Redis infrastructure
   - **Best for**: Multi-instance deployments, production

---

## Architecture

### Optional Service Pattern

The caching layer follows the same pattern as other optional services in the application:

1. **Configuration-Driven**: Enabled/disabled via environment variables
2. **Graceful Degradation**: Falls back to memory cache if Redis connection fails
3. **Early Exit**: No overhead when caching is disabled
4. **Type-Safe**: Full TypeScript support with proper interfaces

### Cache Flow

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Check Cache    │
└────┬───────┬────┘
     │       │
 Hit │       │ Miss
     │       │
     ▼       ▼
┌─────────┐ ┌──────────────┐
│ Return  │ │ Query DB     │
│ Cached  │ │ Store in     │
│ Data    │ │ Cache        │
└─────────┘ └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │ Return Data  │
            └──────────────┘
```

### Implementation Details

**Location**: `src/app/app.module.ts`

The CacheModule is registered globally with an async factory that:

1. Checks if caching is enabled
2. Determines cache type (memory vs Redis)
3. Attempts Redis connection if configured
4. Falls back to memory cache on Redis connection failure
5. Returns appropriate cache configuration

**Cache Manager**: Available globally via `@Inject(CACHE_MANAGER)`

---

## Configuration

### Environment Variables

#### Development (.env.example)

```bash
# Cache Configuration
CACHE_ENABLED=false                    # Optional in development
CACHE_TYPE=memory                      # 'memory' or 'redis'
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                        # Optional in development
REDIS_DB=0                             # Redis database number (0-15)
CACHE_TTL=300                          # Time to live in seconds (5 minutes)
```

#### Production (.env.production.example)

```bash
# Cache Configuration
CACHE_ENABLED=true                     # RECOMMENDED for production
CACHE_TYPE=redis                       # STRONGLY RECOMMENDED for production
REDIS_HOST=redis                       # Redis instance hostname
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password    # CRITICAL: Use strong password
REDIS_DB=0
CACHE_TTL=300
```

### Configuration Validation

The application validates cache configuration at startup:

- `CACHE_ENABLED`: Boolean (true/false)
- `CACHE_TYPE`: Must be 'memory' or 'redis'
- `REDIS_HOST`: Required when `CACHE_TYPE=redis` and `CACHE_ENABLED=true`
- `REDIS_PORT`: Integer between 1-65535
- `REDIS_DB`: Integer between 0-15
- `CACHE_TTL`: Integer between 0-86400 seconds (24 hours)

**Location**: `src/config/env.validation.ts`

### TypeScript Configuration

**Location**: `src/config/configuration.ts`

```typescript
export interface CacheConfig {
    enabled: boolean;
    type: 'memory' | 'redis';
    redis: {
        host: string;
        port: number;
        password?: string;
        db: number;
        ttl: number;
    };
}
```

---

## Usage Examples

### Basic Cache Usage

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class MyService {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    async getData(key: string): Promise<any> {
        // Try cache first
        const cached = await this.cacheManager.get(key);
        if (cached) {
            return cached;
        }

        // Cache miss - fetch from source
        const data = await this.fetchFromDatabase(key);

        // Store in cache
        await this.cacheManager.set(key, data);

        return data;
    }
}
```

### Cache with Custom TTL

```typescript
// Set with custom TTL (in milliseconds)
await this.cacheManager.set('key', 'value', 60000); // 60 seconds
```

### Cache Deletion

```typescript
// Delete a single key
await this.cacheManager.del('key');

// Delete multiple keys
await Promise.all([
    this.cacheManager.del('key1'),
    this.cacheManager.del('key2'),
]);
```

### Product Service Example

**Location**: `src/app/product/product.service.ts`

```typescript
@Injectable()
export class ProductService {
    private readonly CACHE_KEY_ALL = 'products:all';
    private readonly CACHE_KEY_PREFIX = 'product:';

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    // Get all products (cached)
    async findAll(): Promise<ProductResponseDto[]> {
        const cached = await this.cacheManager.get<ProductResponseDto[]>(
            this.CACHE_KEY_ALL
        );
        if (cached) {
            return cached;
        }

        const products = await this.productRepository.find();
        const productDtos = ProductMapper.toDtoArray(products);

        await this.cacheManager.set(this.CACHE_KEY_ALL, productDtos);

        return productDtos;
    }

    // Get single product (cached)
    async findOne(id: number): Promise<ProductResponseDto> {
        const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
        const cached = await this.cacheManager.get<ProductResponseDto>(cacheKey);
        if (cached) {
            return cached;
        }

        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        const productDto = ProductMapper.toDto(product);
        await this.cacheManager.set(cacheKey, productDto);

        return productDto;
    }

    // Update product (invalidate cache)
    async update(id: number, updateDto: UpdateProductDto): Promise<ProductResponseDto> {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        Object.assign(product, updateDto);
        const updatedProduct = await this.productRepository.save(product);

        // Invalidate both list and specific product cache
        await Promise.all([
            this.cacheManager.del(this.CACHE_KEY_ALL),
            this.cacheManager.del(`${this.CACHE_KEY_PREFIX}${id}`),
        ]);

        return ProductMapper.toDto(updatedProduct);
    }
}
```

---

## Cache Invalidation

### When to Invalidate

Cache should be invalidated when data changes:

1. **Create Operations**: Invalidate list caches
2. **Update Operations**: Invalidate both specific item and list caches
3. **Delete Operations**: Invalidate both specific item and list caches

### Invalidation Patterns

#### 1. Single Key Invalidation

```typescript
await this.cacheManager.del('product:123');
```

#### 2. Multiple Key Invalidation

```typescript
await Promise.all([
    this.cacheManager.del('products:all'),
    this.cacheManager.del('product:123'),
]);
```

#### 3. Pattern-Based Invalidation

For complex invalidation needs, you may need to track keys:

```typescript
// Store a list of related cache keys
const relatedKeys = await this.cacheManager.get<string[]>('user:123:keys') || [];

// Invalidate all related keys
await Promise.all(relatedKeys.map(key => this.cacheManager.del(key)));
```

### Cache Key Naming Conventions

Use consistent, hierarchical key naming:

```typescript
// ✅ Good - Hierarchical, clear
'products:all'
'product:123'
'user:456:products'
'category:electronics:products'

// ❌ Bad - Flat, unclear
'allproducts'
'p123'
'userproducts456'
```

---

## Development Setup

### Using Docker Compose

Redis is included in `docker-compose.dev.yml`:

```bash
# Start all services (including Redis)
docker compose -f docker-compose.dev.yml up

# Redis is available at localhost:6379
```

### Enabling Caching Locally

1. **Option 1: Redis Cache** (recommended for testing production behavior)

```bash
# .env or environment variables
CACHE_ENABLED=true
CACHE_TYPE=redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

2. **Option 2: Memory Cache** (lightweight)

```bash
CACHE_ENABLED=true
CACHE_TYPE=memory
```

3. **Option 3: Disabled** (default)

```bash
CACHE_ENABLED=false
```

### Running Without Redis

The application works perfectly without Redis:

1. Set `CACHE_ENABLED=false` or use default configuration
2. Or set `CACHE_TYPE=memory` for in-memory caching
3. The app will use a no-op cache or memory cache

No Redis container needed for basic development!

### Testing Cache Behavior

```bash
# Start services with Redis
docker compose -f docker-compose.dev.yml up

# Make a request (cache miss - slow)
curl http://localhost:8000/v1/products

# Make same request again (cache hit - fast!)
curl http://localhost:8000/v1/products

# Update a product (invalidates cache)
curl -X PATCH http://localhost:8000/v1/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Product"}'

# Request again (cache miss - slow, then re-cached)
curl http://localhost:8000/v1/products
```

---

## Production Setup

### Docker Compose Production

Redis is included in `docker-compose.prod.yml`:

```bash
# Start production stack
docker compose -f docker-compose.prod.yml up -d

# Redis is password-protected in production
```

### Kubernetes Deployment

```yaml
# redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        args:
        - --requirepass
        - $(REDIS_PASSWORD)
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: password
        volumeMounts:
        - name: redis-data
          mountPath: /data
      volumes:
      - name: redis-data
        persistentVolumeClaim:
          claimName: redis-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

### Cloud Redis Services

Instead of self-hosting, consider managed Redis:

- **AWS**: ElastiCache for Redis
- **Azure**: Azure Cache for Redis
- **GCP**: Memorystore for Redis
- **DigitalOcean**: Managed Redis
- **Heroku**: Heroku Redis
- **Redis Cloud**: Redis Enterprise Cloud

Example with AWS ElastiCache:

```bash
CACHE_ENABLED=true
CACHE_TYPE=redis
REDIS_HOST=my-cluster.abcdef.0001.use1.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=<from-aws>
CACHE_TTL=300
```

### Security Considerations

1. **Always use passwords in production**:
   ```bash
   REDIS_PASSWORD=$(openssl rand -base64 32)
   ```

2. **Use TLS for Redis connections** (if supported by your Redis provider)

3. **Restrict network access** to Redis (firewall rules, VPC, security groups)

4. **Use separate Redis instances** for different environments

5. **Set appropriate maxmemory** policies in Redis configuration

---

## Health Checks

### Redis Health Check

**Location**: `src/app/health/health.controller.ts`

The `/health/ready` endpoint automatically checks Redis when enabled:

```typescript
// Readiness check includes Redis when configured
@Get('ready')
async ready() {
    // Performs read/write test to Redis
    // Returns 'up' or 'down' status
}
```

### Testing Health Checks

```bash
# General health (includes cache if enabled)
curl http://localhost:8000/health

# Readiness probe (includes Redis check)
curl http://localhost:8000/health/ready

# Liveness probe (doesn't check cache)
curl http://localhost:8000/health/live
```

### Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 5
```

The readiness probe will fail if Redis is down, preventing traffic to unhealthy instances.

---

## Best Practices

### 1. Cache Naming Conventions

Use hierarchical, descriptive keys:

```typescript
// ✅ Good
const CACHE_KEY_USER_PROFILE = (userId: string) => `user:${userId}:profile`;
const CACHE_KEY_USER_SETTINGS = (userId: string) => `user:${userId}:settings`;
const CACHE_KEY_PRODUCTS_CATEGORY = (cat: string) => `products:category:${cat}`;

// ❌ Bad
const key = `u${userId}p`;
const key = `products`;
```

### 2. Choose Appropriate TTL

Different data has different freshness requirements:

```typescript
// Frequently changing data - short TTL
await this.cacheManager.set('stock:123', quantity, 30000); // 30 seconds

// Stable data - longer TTL
await this.cacheManager.set('product:123', product, 3600000); // 1 hour

// Reference data - very long TTL
await this.cacheManager.set('categories:all', categories, 86400000); // 24 hours
```

### 3. Always Invalidate on Writes

```typescript
// ✅ Good - Invalidate after update
async updateProduct(id: number, data: UpdateDto) {
    const product = await this.repository.save({ id, ...data });
    await this.cacheManager.del(`product:${id}`);
    return product;
}

// ❌ Bad - Stale cache
async updateProduct(id: number, data: UpdateDto) {
    return this.repository.save({ id, ...data });
    // Cache still has old data!
}
```

### 4. Handle Cache Failures Gracefully

```typescript
async getData(id: string): Promise<Data> {
    try {
        const cached = await this.cacheManager.get<Data>(`data:${id}`);
        if (cached) return cached;
    } catch (error) {
        // Log but don't fail - cache is not critical
        console.error('Cache read failed:', error);
    }

    const data = await this.repository.findOne(id);

    try {
        await this.cacheManager.set(`data:${id}`, data);
    } catch (error) {
        // Log but don't fail - cache write is not critical
        console.error('Cache write failed:', error);
    }

    return data;
}
```

### 5. Avoid Caching Personalized Data

```typescript
// ❌ Bad - Personalized data shouldn't be cached globally
await this.cacheManager.set('current-user', user);

// ✅ Good - Cache with user-specific key if needed
await this.cacheManager.set(`user:${userId}:session`, user, 900000); // 15 min
```

### 6. Monitor Cache Performance

Track cache hit/miss ratios:

```typescript
async findOne(id: number): Promise<Product> {
    const cacheKey = `product:${id}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
        // Emit metric: cache hit
        this.metricsService.incrementCounter('cache.hit', { entity: 'product' });
        return cached;
    }

    // Emit metric: cache miss
    this.metricsService.incrementCounter('cache.miss', { entity: 'product' });

    const product = await this.repository.findOne(id);
    await this.cacheManager.set(cacheKey, product);
    return product;
}
```

---

## Troubleshooting

### Cache Not Working

**Symptoms**: Every request hits the database

**Diagnosis**:
```bash
# Check if caching is enabled
echo $CACHE_ENABLED

# Check cache type
echo $CACHE_TYPE

# Check logs for cache initialization
docker logs scaffold_app_dev | grep Cache
```

**Solutions**:
- Ensure `CACHE_ENABLED=true`
- Verify Redis is running: `docker ps | grep redis`
- Check Redis connection: `redis-cli -h localhost ping`

### Redis Connection Failures

**Symptoms**: App logs show Redis connection errors

**Diagnosis**:
```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping

# With password
redis-cli -h localhost -p 6379 -a <password> ping
```

**Solutions**:
- Verify `REDIS_HOST` and `REDIS_PORT` are correct
- Check if Redis password is configured correctly
- Ensure Redis is healthy: `docker logs scaffold_redis_dev`
- The app will fall back to memory cache automatically

### Stale Cache Data

**Symptoms**: Updates don't reflect in API responses

**Diagnosis**:
```bash
# Check cache TTL
echo $CACHE_TTL

# Inspect Redis keys
redis-cli KEYS "product:*"

# Check key TTL
redis-cli TTL "product:123"
```

**Solutions**:
- Verify cache invalidation is working in update/delete methods
- Check if cache keys are correct
- Manually flush cache: `redis-cli FLUSHDB`

### High Memory Usage (Memory Cache)

**Symptoms**: Application memory grows continuously

**Diagnosis**:
```bash
# Check if using memory cache
echo $CACHE_TYPE

# Monitor app memory
docker stats scaffold_app_dev
```

**Solutions**:
- Switch to Redis for production: `CACHE_TYPE=redis`
- Reduce `CACHE_TTL` to expire items sooner
- Reduce cache `max` items in `app.module.ts`

### Redis Out of Memory

**Symptoms**: Redis starts evicting keys or failing writes

**Diagnosis**:
```bash
# Check Redis memory usage
redis-cli INFO memory

# Check maxmemory configuration
redis-cli CONFIG GET maxmemory
```

**Solutions**:
- Increase Redis memory allocation
- Set Redis eviction policy: `maxmemory-policy allkeys-lru`
- Reduce `CACHE_TTL` to expire items faster
- Review what's being cached and optimize

---

## Related Documentation

- [Development Setup](./development.md)
- [Docker Configuration](./docker.md)
- [Monitoring & Observability](./monitoring-setup.md)
- [Architecture Overview](./architecture.md)

---

## Summary

The caching layer is a production-ready, optional service that:

- ✅ Works with or without Redis (graceful degradation)
- ✅ Follows the same pattern as other optional services
- ✅ Supports both development and production environments
- ✅ Includes health checks for Redis
- ✅ Provides clear examples in ProductService
- ✅ Has comprehensive environment validation

**For Development**: Start without Redis, enable when needed
**For Production**: Use Redis for multi-instance deployments
