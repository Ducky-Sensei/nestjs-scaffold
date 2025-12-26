# Error Handling

## Overview

The application uses a global exception filter to provide standardized error responses across all endpoints. All errors are logged with appropriate context and return consistent JSON responses.

## Error Response Format

All errors follow this standardized format:

```json
{
  "statusCode": 400,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products",
  "method": "POST",
  "message": "Validation failed",
  "error": "BadRequestException",
  "details": {}
}
```

### Fields

- **statusCode** - HTTP status code
- **timestamp** - ISO 8601 timestamp when the error occurred
- **path** - Request path where the error occurred
- **method** - HTTP method (GET, POST, PUT, DELETE, etc.)
- **message** - Human-readable error message
- **error** - Error type/name
- **details** - Additional error details (only in non-production environments)

## Production vs Development

### Production Mode (`NODE_ENV=production`)

- Error messages are generic and safe
- No internal details exposed
- No stack traces included
- Database errors are sanitized

Example:
```json
{
  "statusCode": 500,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products/1",
  "method": "GET",
  "message": "Internal server error",
  "error": "InternalServerError"
}
```

### Development Mode

- Detailed error messages
- Stack traces included
- Database error details provided
- Validation details exposed

Example:
```json
{
  "statusCode": 500,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products/1",
  "method": "GET",
  "message": "Cannot read property 'id' of undefined",
  "error": "InternalServerError",
  "details": {
    "name": "TypeError",
    "stack": "TypeError: Cannot read property 'id' of undefined\n    at ProductService.findOne..."
  }
}
```

## Common Error Responses

### 400 Bad Request

Invalid request data or validation errors.

```json
{
  "statusCode": 400,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products",
  "method": "POST",
  "message": "Validation failed",
  "error": "BadRequestException"
}
```

### 404 Not Found

Resource not found.

```json
{
  "statusCode": 404,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products/999",
  "method": "GET",
  "message": "Product not found",
  "error": "NotFoundException"
}
```

### 409 Conflict

Resource already exists (duplicate).

```json
{
  "statusCode": 409,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products",
  "method": "POST",
  "message": "Resource already exists",
  "error": "DatabaseError"
}
```

### 500 Internal Server Error

Unexpected server error.

```json
{
  "statusCode": 500,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products",
  "method": "GET",
  "message": "Internal server error",
  "error": "InternalServerError"
}
```

## Database Error Handling

The filter automatically maps PostgreSQL error codes to appropriate HTTP status codes:

### Unique Violation (23505)

**Database:** Duplicate key violation
**HTTP Status:** 409 Conflict

```json
{
  "statusCode": 409,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products",
  "method": "POST",
  "message": "Resource already exists",
  "error": "DatabaseError"
}
```

### Foreign Key Violation (23503)

**Database:** Referenced resource doesn't exist
**HTTP Status:** 400 Bad Request

```json
{
  "statusCode": 400,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products",
  "method": "POST",
  "message": "Referenced resource does not exist",
  "error": "DatabaseError"
}
```

### Not Null Violation (23502)

**Database:** Required field is null
**HTTP Status:** 400 Bad Request

```json
{
  "statusCode": 400,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products",
  "method": "POST",
  "message": "Required field is missing",
  "error": "DatabaseError"
}
```

### Invalid Text Representation (22P02)

**Database:** Invalid data type/format
**HTTP Status:** 400 Bad Request

```json
{
  "statusCode": 400,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products/abc",
  "method": "GET",
  "message": "Invalid data format",
  "error": "DatabaseError"
}
```

## Error Logging

All errors are automatically logged with appropriate context:

### Server Errors (5xx)

Logged as **ERROR** with full details:
- Request method, URL, body, query params
- Error message and stack trace
- User context (if available)

### Client Errors (4xx)

Logged as **WARNING** with request details:
- Request method, URL, body, query params
- Error message (no stack trace)

### Example Log Output

```
[ERROR] HttpExceptionFilter - {
  method: 'POST',
  url: '/products',
  statusCode: 500,
  message: 'Database connection failed',
  body: { name: 'Product 1', price: 99.99 },
  error: 'Connection timeout',
  stack: 'Error: Connection timeout\n    at ...'
}
```

## Throwing Custom Errors

In your services and controllers, use NestJS built-in exceptions:

```typescript
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Not found
throw new NotFoundException('Product not found');

// Bad request
throw new BadRequestException('Invalid product data');

// Custom message
throw new BadRequestException({
  message: 'Validation failed',
  errors: ['Price must be positive', 'Name is required']
});
```

## Security Considerations

1. **No Internal Details in Production** - Stack traces and internal errors are hidden
2. **Sanitized Database Errors** - Database structure is not exposed
3. **Generic Error Messages** - Production errors use safe, generic messages
4. **No User Data in Logs** - Sensitive user data should be filtered before logging

## Best Practices

1. **Use Specific Exceptions** - Use appropriate HTTP exceptions (NotFoundException, BadRequestException, etc.)
2. **Provide Context** - Include helpful error messages for debugging
3. **Log Appropriately** - Let the filter handle logging, don't duplicate logs
4. **Test Error Paths** - Write tests for error scenarios
5. **Monitor Errors** - Use error logs to identify issues in production
