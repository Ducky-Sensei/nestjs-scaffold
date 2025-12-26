# API Integration Guide

This guide explains how the frontend integrates with the NestJS backend and how to add new API endpoints.

## Table of Contents

- [Backend Overview](#backend-overview)
- [API Client Configuration](#api-client-configuration)
- [Authentication Flow](#authentication-flow)
- [Token Management](#token-management)
- [Adding New Endpoints](#adding-new-endpoints)
- [Error Handling](#error-handling)
- [Type Safety](#type-safety)

## Backend Overview

The frontend connects to the NestJS backend at `http://localhost:8000`. The backend uses **API versioning** with all endpoints prefixed by the version (e.g., `/v1/`).

### API Versioning

The backend follows a versioned API strategy:
- **Current Version**: `v1`
- **Base URL**: `http://localhost:8000/v1`
- **Example**: `http://localhost:8000/v1/auth/login`

All API endpoints are prefixed with the version number. This allows the backend to introduce breaking changes in new versions (v2, v3, etc.) while maintaining backward compatibility.

### Available Endpoints

#### Authentication
- `POST /v1/auth/login` - Login with email/password
- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout (revoke refresh token)
- `GET /v1/auth/me` - Get current user info
- `GET /v1/auth/google` - Initiate Google OAuth
- `GET /v1/auth/github` - Initiate GitHub OAuth

#### Products
- `GET /v1/products` - List all products
- `GET /v1/products/:id` - Get single product
- `POST /v1/products` - Create product (requires auth)
- `PUT /v1/products/:id` - Update product (requires auth)
- `DELETE /v1/products/:id` - Delete product (requires auth)

#### Health
- `GET /v1/health` - Combined health check
- `GET /v1/health/ready` - Readiness probe
- `GET /v1/health/live` - Liveness probe

## API Client Configuration

### Axios Instance

The API client is configured in `src/lib/api/client.ts`:

```typescript
import axios from 'axios';
import { API_VERSIONED_BASE_URL } from '@/lib/constants/api';

export const apiClient = axios.create({
  baseURL: API_VERSIONED_BASE_URL, // e.g., http://localhost:8000/v1
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});
```

The `baseURL` uses the versioned URL, so all API calls automatically include the version prefix. Endpoints in your code are written as relative paths (e.g., `/auth/login`), and Axios combines them with the base URL to create the full path (e.g., `http://localhost:8000/v1/auth/login`).

### Environment Variables

Configure the API URL and version in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1

# OAuth URLs (automatically includes version)
VITE_GOOGLE_OAUTH_URL=http://localhost:8000/v1/auth/google
VITE_GITHUB_OAUTH_URL=http://localhost:8000/v1/auth/github
```

Access in code (`src/lib/constants/api.ts`):
```typescript
// Base URL without version
export const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000');

// API Version
export const API_VERSION = getEnvVar('VITE_API_VERSION', 'v1');

// Versioned base URL (combines base + version)
export const API_VERSIONED_BASE_URL = `${API_BASE_URL}/${API_VERSION}`;
```

### Versioned Endpoints

All API endpoints are automatically versioned through the base URL. Define endpoints as relative paths:

```typescript
// src/lib/constants/api.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',        // Becomes /v1/auth/login
    REGISTER: '/auth/register',  // Becomes /v1/auth/register
    REFRESH: '/auth/refresh',    // Becomes /v1/auth/refresh
    // ...
  },
  PRODUCTS: {
    LIST: '/products',           // Becomes /v1/products
    GET: (id) => `/products/${id}`, // Becomes /v1/products/:id
    // ...
  },
};
```

## Authentication Flow

### Request Interceptor

Automatically adds JWT token to all requests:

```typescript
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor

Handles 401 errors and automatically refreshes tokens:

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh', { refreshToken });

        // Store new tokens
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## Token Management

### Token Storage

Tokens are stored in localStorage:

```typescript
// Store tokens after login
export const storeTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Clear tokens on logout
export const clearAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};
```

### Token Lifecycle

1. **Login**: User logs in, receives access + refresh tokens
2. **Request**: Access token sent with every request
3. **Expiration**: Access token expires (15 minutes)
4. **Refresh**: Interceptor catches 401, refreshes token
5. **Retry**: Original request retried with new token
6. **Logout**: Refresh fails, user logged out

### Security Considerations

**Current Implementation**:
- Tokens stored in localStorage
- Automatic refresh on 401
- Logout on refresh failure

**Production Recommendations**:
- Use httpOnly cookies for refresh tokens
- Implement CSRF protection
- Consider short-lived access tokens (5-15 minutes)
- Implement token rotation

## Adding New Endpoints

Follow this pattern to add new API endpoints:

### 1. Define Types

Create TypeScript types matching backend DTOs:

```typescript
// src/types/example.ts
export interface Example {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateExampleDto {
  name: string;
}
```

### 2. Create API Functions

Create API functions in the feature's `api/` directory:

```typescript
// src/features/example/api/example-api.ts
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type { Example, CreateExampleDto } from '@/types/example';

export const getExamples = async (): Promise<Example[]> => {
  const response = await apiClient.get<Example[]>(API_ENDPOINTS.EXAMPLES.LIST);
  return response.data;
};

export const createExample = async (data: CreateExampleDto): Promise<Example> => {
  const response = await apiClient.post<Example>(
    API_ENDPOINTS.EXAMPLES.CREATE,
    data
  );
  return response.data;
};
```

### 3. Create React Query Hooks

Wrap API functions in React Query hooks:

```typescript
// src/features/example/hooks/use-examples.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExamples, createExample } from '../api/example-api';
import { toast } from 'sonner';

export function useExamples() {
  return useQuery({
    queryKey: ['examples'],
    queryFn: getExamples,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCreateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExample,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
      toast.success('Example created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create example');
    },
  });
}
```

### 4. Use in Components

Use hooks in React components:

```typescript
// src/routes/_authenticated/examples.tsx
import { useExamples, useCreateExample } from '@/features/example/hooks/use-examples';

function ExamplesPage() {
  const { data: examples, isLoading } = useExamples();
  const createExample = useCreateExample();

  const handleCreate = () => {
    createExample.mutate({ name: 'New Example' });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Examples</h1>
      <button onClick={handleCreate}>Create</button>
      <ul>
        {examples?.map((example) => (
          <li key={example.id}>{example.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Error Handling

### Backend Error Response

The backend returns errors in this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

Or for validation errors:

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password is too short"],
  "error": "Bad Request"
}
```

### Error Extraction

Extract error messages in a type-safe way:

```typescript
// src/lib/api/client.ts
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;

    if (apiError?.message) {
      return Array.isArray(apiError.message)
        ? apiError.message.join(', ')
        : apiError.message;
    }

    return error.message || 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
```

### Error Display

Display errors to users:

```typescript
// In mutation hook
onError: (error: Error) => {
  toast.error(getErrorMessage(error));
}

// In component
if (isError) {
  return <div className="text-red-500">{getErrorMessage(error)}</div>;
}
```

## Type Safety

### Type Matching

Frontend types should match backend DTOs:

**Backend DTO** (`backend/src/auth/dto/auth-response.dto.ts`):
```typescript
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}
```

**Frontend Type** (`frontend/src/types/auth.ts`):
```typescript
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}
```

### Type Generation (Future Enhancement)

Consider using tools to generate types from backend:
- `openapi-typescript` - Generate types from OpenAPI spec
- `tRPC` - End-to-end type safety
- `GraphQL Code Generator` - Generate types from GraphQL schema

### Runtime Validation

Use Zod for runtime validation:

```typescript
import { z } from 'zod';

// Define schema
const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
  }),
});

// Validate response
const response = await apiClient.post('/auth/login', credentials);
const validated = authResponseSchema.parse(response.data);
```

## Testing API Integration

### Manual Testing

1. Start backend: `cd ../scaffold-be && pnpm dev`
2. Start frontend: `pnpm dev`
3. Test each endpoint in the UI

### API Testing with cURL

```bash
# Login (note the /v1 prefix)
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"Foobar1!"}'

# Get products (with token)
curl http://localhost:8000/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create product (with token)
curl -X POST http://localhost:8000/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test","quantity":10,"unit":"pcs","price":99.99,"currency":"USD"}'
```

### Browser DevTools

Use browser DevTools to inspect API calls:

1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions in the app
4. Inspect requests/responses

## Troubleshooting

### CORS Errors

If you see CORS errors:

1. Ensure backend CORS is configured correctly
2. Check `VITE_API_BASE_URL` is correct
3. Verify backend is running

**Backend CORS config** (should be in `main.ts`):
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### 401 Unauthorized

If you get 401 errors:

1. Check token is stored in localStorage
2. Verify token is not expired
3. Check Authorization header is being sent
4. Try logging out and back in

### Network Timeout

If requests timeout:

1. Increase timeout in axios config
2. Check backend is responsive
3. Check network connection

### Type Errors

If TypeScript complains about types:

1. Verify types match backend DTOs
2. Check for null/undefined handling
3. Use type guards for runtime checks

## API Versioning Strategy

### Current Implementation

The frontend uses a comprehensive versioning strategy to match the NestJS backend:

1. **Environment Configuration**
   - `VITE_API_VERSION=v1` in `.env` controls the API version
   - Change this value to upgrade to v2, v3, etc.

2. **Versioned Base URL**
   - All API calls use `API_VERSIONED_BASE_URL` (e.g., `http://localhost:8000/v1`)
   - Endpoints are relative paths that get combined with the base URL

3. **Version Configuration Utilities**
   - `src/lib/api/version-config.ts` - Version management utilities
   - `src/types/api-versions.ts` - Version-specific type definitions

### Upgrading to a New API Version

When the backend releases a new API version (e.g., v2):

1. **Review Breaking Changes**
   ```bash
   # Check backend release notes for v2 breaking changes
   ```

2. **Update Environment Variable**
   ```env
   # .env
   VITE_API_VERSION=v2
   ```

3. **Update OAuth URLs** (if changed)
   ```env
   VITE_GOOGLE_OAUTH_URL=http://localhost:8000/v2/auth/google
   VITE_GITHUB_OAUTH_URL=http://localhost:8000/v2/auth/github
   ```

4. **Update Type Definitions**
   ```typescript
   // src/types/api-versions.ts
   export namespace ApiV2 {
     export interface Product {
       // Add v2-specific fields
       category: string;
       tags: string[];
     }
   }
   ```

5. **Update MSW Handlers** (for testing)
   ```typescript
   // src/__mocks__/handlers.ts
   // Add v2 handlers or update API_VERSION constant
   const API_VERSION = 'v2';
   ```

6. **Test Thoroughly**
   - Run unit tests: `pnpm test`
   - Run E2E tests: `pnpm test:e2e`
   - Manual testing in dev environment

### Version-Specific Types

Use the `api-versions.ts` module for version-specific types:

```typescript
import { ApiV1, ApiV2 } from '@/types/api-versions';

// Use v1 types
const configV1: ApiV1.Config = {
  version: 'v1',
  baseUrl: 'http://localhost:8000/v1',
  features: { oauth: true, healthChecks: true, products: true },
};

// Use v2 types (future)
const configV2: ApiV2.Config = {
  version: 'v2',
  baseUrl: 'http://localhost:8000/v2',
  features: {
    oauth: true,
    healthChecks: true,
    products: true,
    advancedSearch: true,
  },
};
```

### Gradual Migration

For gradual migration (supporting both v1 and v2):

1. **Run both versions in parallel**
   ```typescript
   const v1Client = axios.create({ baseURL: 'http://localhost:8000/v1' });
   const v2Client = axios.create({ baseURL: 'http://localhost:8000/v2' });
   ```

2. **Feature flags**
   ```typescript
   const useV2Products = import.meta.env.VITE_FEATURE_V2_PRODUCTS === 'true';
   const client = useV2Products ? v2Client : v1Client;
   ```

3. **Progressive migration**
   - Migrate one feature at a time
   - Test each feature thoroughly
   - Roll back if issues arise

## Best Practices

1. **Always type API responses**: Use TypeScript types for all API calls
2. **Handle errors gracefully**: Show user-friendly error messages
3. **Validate input**: Use Zod for form validation
4. **Cache wisely**: Use React Query's caching strategically
5. **Optimize queries**: Use React Query's `staleTime` and `cacheTime`
6. **Test API calls**: Test both success and error cases
7. **Document endpoints**: Keep this doc updated with new endpoints
8. **Version APIs**: Use API versioning for breaking changes
9. **Keep endpoints relative**: Always use relative paths (e.g., `/auth/login` not `http://localhost:8000/v1/auth/login`)
10. **Review version changes**: Always review backend release notes before upgrading API versions

## Summary

The frontend integrates with the backend using:
- **Axios** for HTTP requests
- **Interceptors** for automatic token management
- **TypeScript** for type safety
- **React Query** for data fetching and caching
- **Zod** for validation

This architecture provides a robust, type-safe, and maintainable API integration layer.
