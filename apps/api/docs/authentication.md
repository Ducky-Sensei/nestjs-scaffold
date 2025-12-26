# Authentication Guide

This application uses JWT (JSON Web Tokens) for authentication.

## Quick Start

### 1. Set JWT Secret

Add to `.env`:
```bash
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

**Production**: Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Default Admin User

When seeding the database, an admin user is created:
- **Email**: `admin@admin.com`
- **Password**: `Foobar1!`

## API Endpoints

### Register New User

**POST** `/v1/auth/register`

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Login

**POST** `/v1/auth/login`

Rate Limited: 5 requests per minute

```json
{
  "email": "admin@admin.com",
  "password": "Foobar1!"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "admin@admin.com",
    "name": "Admin User"
  }
}
```

### Get Current User

**GET** `/v1/auth/me`

**Headers**:
```
Authorization: Bearer eyJhbGc...
```

**Response**:
```json
{
  "id": "uuid",
  "email": "admin@admin.com",
  "name": "Admin User",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

## Using Authentication

### Making Authenticated Requests

Include the JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:8000/v1/auth/me
```

### Token Expiration

Tokens expire after the configured duration (default: 7 days). When a token expires:
- Status: `401 Unauthorized`
- Message: "Unauthorized"

Client should redirect to login and obtain a new token.

## Protecting Routes

### Make Endpoint Require Authentication

By default, all routes require authentication (JWT guard is global).

### Make Endpoint Public

Use the `@Public()` decorator:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller('products')
export class ProductController {
    @Public()  // No authentication required
    @Get()
    findAll() {
        return [];
    }

    @Get('admin')  // Authentication required (default)
    adminPanel() {
        return { secret: 'data' };
    }
}
```

### Get Current User in Controller

Use the `@CurrentUser()` decorator:

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { User } from './user/user.entity';

@Controller('profile')
export class ProfileController {
    @Get()
    getProfile(@CurrentUser() user: User) {
        return {
            id: user.id,
            email: user.email,
            name: user.name
        };
    }
}
```

## Security Best Practices

### 1. Strong JWT Secret

**Production**: Use a cryptographically secure random string (64+ characters).

```bash
# Generate secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Token Expiration

- **Development**: Longer (7d) for convenience
- **Production**: Shorter (1h-24h) for security
- **Refresh Tokens**: Implement for better UX with short-lived tokens

### 3. HTTPS Only

Always use HTTPS in production to prevent token interception.

### 4. Secure Password Requirements

Current requirements:
- Minimum 8 characters
- Validated via `class-validator`

**Recommended**: Add complexity requirements (uppercase, lowercase, numbers, symbols).

### 5. Rate Limiting

Login endpoint is rate-limited (5 requests/minute) to prevent brute force attacks.

## Password Hashing

Passwords are hashed using bcrypt with a cost factor of 10:

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

## Error Handling

### Invalid Credentials

**Status**: `401 Unauthorized`
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### User Already Exists

**Status**: `409 Conflict`
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

### Account Inactive

**Status**: `401 Unauthorized`
```json
{
  "statusCode": 401,
  "message": "Account is not active",
  "error": "Unauthorized"
}
```

## Testing

### Test Registration

```bash
curl -X POST http://localhost:8000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.com",
    "password": "Foobar1!"
  }'
```

### Test Protected Route

```bash
# Save token from login response
TOKEN="eyJhbGc..."

# Access protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/v1/auth/me
```

## Future Enhancements

- **Refresh Tokens**: Long-lived tokens for obtaining new access tokens
- **Email Verification**: Verify email addresses before activation
- **Password Reset**: Forgot password flow
- **2FA**: Two-factor authentication
- **OAuth**: Social login (Google, GitHub, etc.)
- **Role-Based Access Control (RBAC)**: Different permission levels
- **Account Lockout**: Temporary lock after failed login attempts
- **Audit Log**: Track authentication events

## Troubleshooting

### "Unauthorized" on all requests

**Cause**: JWT guard is global, and endpoint is not marked as `@Public()`

**Solution**: Add `@Public()` decorator to public endpoints:
```typescript
@Public()
@Get()
publicEndpoint() {}
```

### Token expires too quickly

**Cause**: Short `JWT_EXPIRES_IN` value

**Solution**: Increase in `.env`:
```bash
JWT_EXPIRES_IN=7d  # or 1h, 24h, 30d, etc.
```

### Cannot login with admin user

**Cause**: Database not seeded or incorrect password

**Solution**:
1. Ensure `SEED_DATABASE=true` in `.env`
2. Restart application to trigger seeding
3. Use exact credentials: `admin@admin.com` / `Foobar1!`

## References

- [JWT.io](https://jwt.io/) - JWT debugger and documentation
- [Passport.js](http://www.passportjs.org/) - Authentication middleware
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
