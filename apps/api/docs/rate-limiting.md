# Rate Limiting Guide

This application uses `@nestjs/throttler` for rate limiting to protect against abuse and ensure fair resource usage.

## Global Configuration

Rate limiting is configured globally and applied to all endpoints by default.

### Configuration Files

**Environment Variables** (`.env`):
```bash
# Rate limiting - applies to all endpoints
THROTTLE_TTL=60000      # Time window in milliseconds (60 seconds)
THROTTLE_LIMIT=100      # Maximum requests per time window (100 requests)
```

**Validation** (`src/config/env.validation.ts:98-106`):
```typescript
@IsInt()
@Min(1000)              // Minimum 1 second
@Max(3600000)           // Maximum 1 hour
THROTTLE_TTL: number = 60000;

@IsInt()
@Min(1)                 // At least 1 request
@Max(10000)             // Maximum 10,000 requests
THROTTLE_LIMIT: number = 100;
```

**Application Setup** (`src/app/app.module.ts:57-68, 98-100`):
```typescript
ThrottlerModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService<Configuration, true>) => {
        const throttleConfig = configService.get('throttle', { infer: true });
        return [{
            ttl: throttleConfig.ttl,
            limit: throttleConfig.limit,
        }];
    },
}),

// ...in providers
{
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
}
```

### How It Works

- **Default Behavior**: All endpoints are protected with `100 requests per 60 seconds` (configurable via env vars)
- **Per-Client Tracking**: Limits are tracked per IP address
- **HTTP 429 Response**: When limit is exceeded, clients receive `429 Too Many Requests`
- **Headers**: Response includes rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)

## Per-Endpoint Rate Limiting

For sensitive endpoints (authentication, password reset, etc.), you can override the global limits.

### Basic Usage

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    // Stricter limit: 5 requests per minute
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('login')
    async login(@Body() credentials: LoginDto) {
        // Login logic
    }

    // Very strict: 3 requests per 5 minutes
    @Throttle({ default: { limit: 3, ttl: 300000 } })
    @Post('password-reset')
    async resetPassword(@Body() resetDto: PasswordResetDto) {
        // Password reset logic
    }

    // Inherits global limit (100 per minute)
    @Get('profile')
    async getProfile() {
        // Profile logic
    }
}
```

### Advanced Patterns

#### Multiple Rate Limit Tiers

```typescript
// Configure multiple named tiers in app.module.ts
ThrottlerModule.forRoot([
    {
        name: 'short',
        ttl: 1000,      // 1 second
        limit: 3,
    },
    {
        name: 'medium',
        ttl: 10000,     // 10 seconds
        limit: 20,
    },
    {
        name: 'long',
        ttl: 60000,     // 1 minute
        limit: 100,
    },
])

// Use in controllers
@Throttle({ short: { limit: 1, ttl: 1000 } })
@Post('expensive-operation')
async expensiveOp() { }
```

#### Skip Rate Limiting for Specific Endpoints

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Controller('public')
export class PublicController {
    // Skip throttling entirely
    @SkipThrottle()
    @Get('health')
    healthCheck() {
        return { status: 'ok' };
    }

    // Skip only specific throttler tier
    @SkipThrottle({ default: false, short: true })
    @Get('data')
    getData() { }
}
```

#### Controller-Level Throttling

```typescript
// Apply to all routes in controller
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('admin')
export class AdminController {
    // Uses controller limit: 10 per minute
    @Get('users')
    getUsers() { }

    // Override with stricter limit: 3 per minute
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Delete('user/:id')
    deleteUser() { }
}
```

## Recommended Limits by Endpoint Type

| Endpoint Type | Suggested Limit | Reasoning |
|--------------|----------------|-----------|
| Login / Authentication | 5-10 per minute | Prevent brute force attacks |
| Password Reset | 3 per 5 minutes | Prevent abuse, allow legitimate retries |
| Registration | 5 per hour | Prevent spam accounts |
| Email Send | 3 per 10 minutes | Prevent email flooding |
| File Upload | 10 per minute | Resource-intensive operation |
| Search | 30 per minute | Balance UX with server load |
| Public Read | 100 per minute | Default global limit |
| Admin Operations | 20 per minute | Lower traffic, more sensitive |

## Production Considerations

### Recommended Production Settings

```bash
# For public-facing APIs
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# For internal APIs with authenticated users
THROTTLE_TTL=60000
THROTTLE_LIMIT=500

# For high-traffic APIs with CDN/caching
THROTTLE_TTL=60000
THROTTLE_LIMIT=1000
```

### Behind a Reverse Proxy

If running behind nginx, Cloudflare, or AWS ALB, ensure the throttler uses the real client IP:

```typescript
// app.module.ts - Add custom throttler storage or use proxy trust
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

// Use Redis for distributed rate limiting
ThrottlerModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        throttlers: [{
            ttl: configService.get('throttle.ttl'),
            limit: configService.get('throttle.limit'),
        }],
        storage: new ThrottlerStorageRedisService({
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
        }),
    }),
}),
```

```typescript
// main.ts - Trust proxy headers
app.set('trust proxy', 1);
```

### Monitoring

Track rate limit violations in your monitoring solution:

```typescript
import { ThrottlerException } from '@nestjs/throttler';
import { ExceptionFilter, Catch } from '@nestjs/common';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
    catch(exception: ThrottlerException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();

        // Log to monitoring (Sentry, Datadog, etc.)
        logger.warn('Rate limit exceeded', {
            ip: request.ip,
            path: request.path,
            userAgent: request.headers['user-agent'],
        });

        // Return response
        ctx.getResponse().status(429).json({
            statusCode: 429,
            message: 'Too Many Requests',
            error: 'ThrottlerException',
        });
    }
}
```

## Testing Rate Limits

### Unit Tests

```typescript
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';

describe('RateLimiting', () => {
    it('should throttle requests', async () => {
        const module = await Test.createTestingModule({
            imports: [
                ThrottlerModule.forRoot([{
                    ttl: 1000,
                    limit: 2,
                }]),
            ],
        }).compile();

        // Make requests and assert 429 on third request
    });
});
```

### Manual Testing with curl

```bash
# Test endpoint multiple times quickly
for i in {1..10}; do
    curl -w "\nStatus: %{http_code}\n" http://localhost:3000/api/auth/login \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"password"}'
    sleep 0.1
done
```

### Using Artillery for Load Testing

```yaml
# artillery-rate-limit-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 10
      arrivalRate: 20  # 20 requests per second
scenarios:
  - name: 'Test rate limiting'
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: 'test@example.com'
            password: 'password123'
```

```bash
artillery run artillery-rate-limit-test.yml
```

## Common Issues

### Issue: Rate limits not working
**Cause**: ThrottlerGuard not registered globally
**Solution**: Ensure APP_GUARD provider is configured in app.module.ts

### Issue: Rate limit shared across all users
**Cause**: Running behind proxy without proper IP extraction
**Solution**: Configure `trust proxy` and use real IP from headers

### Issue: Rate limits reset on server restart
**Cause**: Using in-memory storage
**Solution**: Use Redis storage for production (`nestjs-throttler-storage-redis`)

### Issue: Health checks getting rate limited
**Cause**: Global throttler applies to all routes
**Solution**: Use `@SkipThrottle()` on health check endpoints

## References

- [NestJS Throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [OWASP Rate Limiting Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [RFC 6585 - HTTP Status Code 429](https://tools.ietf.org/html/rfc6585#section-4)
