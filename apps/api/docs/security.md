# Security

## Overview

This scaffold includes production-ready security features to protect your API from common attacks and vulnerabilities.

## Security Features

### 1. Security Headers (Helmet)

Helmet sets various HTTP headers to protect against common web vulnerabilities.

**Configured in:** `src/main.ts` and `src/main-dev.ts`

#### Production Configuration

```typescript
import helmet from "helmet";

app.use(helmet());
```

**Headers set by Helmet:**

- `Content-Security-Policy` - Prevents XSS attacks
- `X-DNS-Prefetch-Control` - Controls browser DNS prefetching
- `X-Frame-Options` - Prevents clickjacking
- `X-Content-Type-Options` - Prevents MIME type sniffing
- `X-XSS-Protection` - Enables browser XSS filter
- `Strict-Transport-Security` - Enforces HTTPS
- And more...

#### Development Configuration

In development mode, Content Security Policy is disabled to allow Swagger UI to work:

```typescript
app.use(
    helmet({
        contentSecurityPolicy: false, // Disabled for Swagger UI
    }),
);
```

### 2. CORS (Cross-Origin Resource Sharing)

CORS controls which domains can access your API.

**Configured in:** `src/main.ts` and `src/main-dev.ts`

#### Production Configuration

```typescript
app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
});
```

**Environment Variable:**

```env
# Allow specific origins (recommended for production)
CORS_ORIGIN=https://example.com,https://app.example.com

# Or allow all origins (NOT recommended for production)
CORS_ORIGIN=*
```

#### Development Configuration

In development mode, CORS is permissive to allow testing from any origin:

```typescript
app.enableCors({
    origin: true, // Allow all origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
});
```

### 3. Rate Limiting

Rate limiting prevents abuse by limiting the number of requests from a single IP address.

**Configured in:** `src/app/app.module.ts`

#### Configuration

```typescript
ThrottlerModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => [
        {
            ttl: configService.get('THROTTLE_TTL', 60000), // 60 seconds
            limit: configService.get('THROTTLE_LIMIT', 100), // 100 requests per TTL
        },
    ],
}),
```

**Environment Variables:**

```env
# Time window in milliseconds (default: 60000 = 1 minute)
THROTTLE_TTL=60000

# Maximum requests per time window (default: 100)
THROTTLE_LIMIT=100
```

#### Default Limits

- **Development:** 100 requests per 60 seconds
- **Production:** Configure based on your needs

#### Response When Limit Exceeded

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890

{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

#### Skipping Rate Limiting for Specific Routes

Use the `@SkipThrottle()` decorator:

```typescript
import { SkipThrottle } from "@nestjs/throttler";

@Controller("health")
export class HealthController {
    @SkipThrottle() // Skip rate limiting for health checks
    @Get()
    check() {
        return { status: "ok" };
    }
}
```

#### Custom Rate Limits for Specific Routes

Use the `@Throttle()` decorator:

```typescript
import { Throttle } from "@nestjs/throttler";

@Controller("auth")
export class AuthController {
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
    @Post("login")
    login() {
        // Login logic
    }
}
```

## Security Best Practices

### 1. Environment Variables

**Never commit secrets to version control:**

```env
# ❌ BAD: Hardcoded production secrets
DATABASE_PASSWORD=super_secret_password

# ✅ GOOD: Use environment-specific values
DATABASE_PASSWORD=${DB_PASSWORD}
```

**Use different configurations for different environments:**

- Development: Permissive CORS, relaxed CSP
- Production: Strict CORS, full security headers

### 2. HTTPS Only in Production

Always use HTTPS in production. Helmet's `Strict-Transport-Security` header enforces this.

**Nginx configuration:**

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Input Validation

Always validate and sanitize user input using DTOs and class-validator:

```typescript
import { IsString, IsEmail, Length } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(8, 100)
    password: string;
}
```

See [docs/validation.md](./validation.md) for more details.

### 4. SQL Injection Prevention

TypeORM provides protection against SQL injection when using its query builder or repository methods.

**✅ Safe (uses parameterized queries):**

```typescript
const user = await this.userRepository.findOne({ where: { email } });
```

**❌ Unsafe (vulnerable to SQL injection):**

```typescript
const user = await this.userRepository.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### 5. Authentication & Authorization

**TODO:** This scaffold doesn't include authentication yet. Consider adding:

- JWT authentication with `@nestjs/jwt`
- Passport strategies
- Role-based access control (RBAC)
- API key authentication

### 6. Sensitive Data

**Never log sensitive data:**

```typescript
// ❌ BAD: Logs passwords
logger.log(`User logged in: ${user.email} with password ${password}`);

// ✅ GOOD: Logs only necessary info
logger.log(`User logged in: ${user.email}`);
```

**Never return sensitive data in API responses:**

```typescript
// Use DTOs to control what's returned
export class UserResponseDto {
    id: number;
    email: string;
    // ❌ password is NOT included
}
```

### 7. Error Messages

**Don't leak implementation details in production:**

The global exception filter (see [docs/error-handling.md](./error-handling.md)) automatically handles this:

**Development:**

```json
{
    "statusCode": 500,
    "message": "Internal server error",
    "error": "Error: Cannot connect to database",
    "stack": "Error: Cannot connect to database\n    at DatabaseConnection..."
}
```

**Production:**

```json
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

### 8. Database Security

**Use connection pooling:**

```typescript
// TypeORM automatically uses connection pooling
// Configure in src/app/app.module.ts
extra: {
    max: 20,  // Maximum pool size
    idleTimeoutMillis: 30000,
}
```

**Use read replicas for scaling:**

```typescript
replication: {
    master: {
        host: 'master.db.example.com',
    },
    slaves: [
        { host: 'replica1.db.example.com' },
        { host: 'replica2.db.example.com' },
    ],
}
```

## Security Checklist

Use this checklist before deploying to production:

- [ ] HTTPS enabled and enforced
- [ ] `CORS_ORIGIN` set to specific domains (not `*`)
- [ ] Rate limiting configured appropriately
- [ ] Environment variables not committed to git
- [ ] Secrets stored securely (e.g., AWS Secrets Manager, HashiCorp Vault)
- [ ] Database credentials rotated regularly
- [ ] Input validation on all endpoints
- [ ] Sensitive data not logged
- [ ] Error messages don't leak implementation details
- [ ] Dependencies regularly updated (`pnpm audit`)
- [ ] Security headers configured with Helmet
- [ ] Authentication and authorization implemented
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection added (if using cookies)

## Testing Security

### 1. Check Security Headers

```bash
curl -I http://localhost:8000/api

# Should see headers like:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=15552000; includeSubDomains
```

### 2. Test Rate Limiting

```bash
# Send 101 requests in quick succession
for i in {1..101}; do
  curl http://localhost:8000/products
done

# The 101st request should return 429 Too Many Requests
```

### 3. Test CORS

```bash
# Test from a different origin
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     --head http://localhost:8000/products

# Should be blocked if CORS_ORIGIN doesn't include https://evil.com
```

### 4. Run Security Audit

```bash
# Check for known vulnerabilities in dependencies
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

## Common Vulnerabilities Prevented

| Vulnerability              | Protection                    | How                                              |
| -------------------------- | ----------------------------- | ------------------------------------------------ |
| XSS (Cross-Site Scripting) | Helmet CSP + Input validation | Content-Security-Policy header + class-validator |
| SQL Injection              | TypeORM parameterized queries | Always use repository methods                    |
| CSRF                       | CORS + SameSite cookies       | Strict CORS policy                               |
| Clickjacking               | Helmet X-Frame-Options        | X-Frame-Options: DENY                            |
| MIME Sniffing              | Helmet X-Content-Type-Options | X-Content-Type-Options: nosniff                  |
| DDoS                       | Rate limiting                 | Throttler module                                 |
| Man-in-the-Middle          | HTTPS + HSTS                  | Strict-Transport-Security header                 |
| Information Disclosure     | Exception filter              | Production-safe error messages                   |

## Additional Security Measures

### 1. Add API Key Authentication

```typescript
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

@Injectable()
export class ApiKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers["x-api-key"];
        return apiKey === process.env.API_KEY;
    }
}
```

### 2. Add Request ID Tracking

```typescript
import { v4 as uuidv4 } from "uuid";

app.use((req, res, next) => {
    req.id = uuidv4();
    res.setHeader("X-Request-ID", req.id);
    next();
});
```

### 3. Add Content Length Limits

```typescript
import { json, urlencoded } from "express";

app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [NestJS Security](https://docs.nestjs.com/security/helmet)
- [NestJS Rate Limiting](https://docs.nestjs.com/security/rate-limiting)
- [TypeORM Security](https://typeorm.io/#/security)
