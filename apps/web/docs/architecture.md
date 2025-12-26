# Architecture Documentation

This document explains the architecture decisions, patterns, and rationale behind the frontend scaffold.

## Table of Contents

- [Overview](#overview)
- [Tech Stack Decisions](#tech-stack-decisions)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Routing](#routing)
- [Authentication Flow](#authentication-flow)
- [API Integration](#api-integration)
- [Design Patterns](#design-patterns)

## Overview

This frontend application is built with production-ready patterns in mind:

- **Type Safety First**: Strict TypeScript throughout
- **Separation of Concerns**: Features are self-contained modules
- **Modern React**: Hooks, function components, composition
- **Performance**: Code splitting, lazy loading, optimistic updates
- **Developer Experience**: Type inference, auto-completion, hot reload

## Tech Stack Decisions

### Why Vite?

**Chosen**: Vite
**Alternatives Considered**: Create React App, Next.js, Parcel

**Rationale**:
- **Fast**: Lightning-fast dev server with HMR
- **Modern**: Native ES modules, optimized builds
- **Flexible**: Framework-agnostic, plugin ecosystem
- **TypeScript**: First-class TypeScript support

Vite provides the best developer experience for single-page applications without the overhead of server-side rendering frameworks.

### Why TanStack Router?

**Chosen**: TanStack Router
**Alternatives Considered**: React Router, Wouter

**Rationale**:
- **Type Safety**: End-to-end type safety with route params, search params
- **File-based**: Convention over configuration
- **Modern**: Built for React 18+, supports Suspense
- **Developer Tools**: Excellent devtools integration

TanStack Router provides the best type safety and developer experience for routing.

### Why TanStack Query?

**Chosen**: TanStack Query (React Query)
**Alternatives Considered**: SWR, Apollo Client, Redux + RTK Query

**Rationale**:
- **Server State**: Purpose-built for server state management
- **Caching**: Intelligent caching, background refetching
- **DevTools**: Amazing developer tools
- **TypeScript**: Excellent TypeScript support
- **Mutations**: Built-in mutation handling with optimistic updates

React Query eliminates the need for global state management for server data, reducing complexity and improving performance.

### Why Tailwind CSS + shadcn/ui?

**Chosen**: Tailwind CSS + shadcn/ui
**Alternatives Considered**: Material-UI, Chakra UI, Ant Design, CSS Modules

**Rationale**:
- **Utility-First**: Rapid development with utility classes
- **Customizable**: Full control over design without overrides
- **No Runtime**: All CSS is generated at build time
- **Copy-Paste**: shadcn/ui provides copy-paste components, not a dependency
- **Accessibility**: Built-in accessibility patterns

Tailwind provides the flexibility of custom CSS with the speed of a utility framework. shadcn/ui gives us beautiful, accessible components without lock-in.

### Why React Hook Form + Zod?

**Chosen**: React Hook Form + Zod
**Alternatives Considered**: Formik, React Final Form, Yup

**Rationale**:
- **Performance**: Minimal re-renders, uncontrolled components
- **TypeScript**: Full type inference from schemas
- **Validation**: Zod provides runtime type safety
- **DX**: Simple API, great error messages
- **Size**: Small bundle size

React Hook Form + Zod provides the best balance of performance, type safety, and developer experience.

### Why Axios?

**Chosen**: Axios
**Alternatives Considered**: Fetch API, ky, got

**Rationale**:
- **Interceptors**: Built-in request/response interceptors for auth
- **Automatic Transforms**: JSON parsing, error handling
- **Timeout**: Built-in timeout support
- **Cancel Requests**: Request cancellation
- **Familiar**: Industry standard, well-documented

Axios provides all the features we need for API communication with a simple API.

## Project Structure

### Feature-Based Organization

We organize code by **feature**, not by type:

```
✅ Good: Feature-based
features/
  auth/
    api/
    hooks/
    components/
    types/

❌ Avoid: Type-based
components/
  auth/
hooks/
  auth/
api/
  auth/
```

**Why?**
- **Colocation**: Related code is together
- **Maintainability**: Easy to find and modify features
- **Scalability**: Features can be added/removed independently
- **Team Workflow**: Teams can own entire features

### Directory Structure

```
src/
├── app/                    # App setup (providers, routing)
├── components/            # Shared components
│   ├── ui/               # Design system components
│   └── layout/           # Layout components
├── features/             # Feature modules (auth, products, health)
│   └── [feature]/
│       ├── api/         # API calls
│       ├── hooks/       # Custom hooks
│       ├── components/  # Feature components
│       ├── stores/      # State management
│       └── types/       # TypeScript types
├── routes/              # TanStack Router routes
├── lib/                 # Shared utilities
│   ├── api/            # API client configuration
│   ├── utils/          # Helper functions
│   └── constants/      # Constants
└── types/              # Global types
```

## State Management

We use **different tools for different types of state**:

### Server State (TanStack Query)

For data from the backend:
- Product lists
- User profile
- Health checks

**Why?**
- Automatic caching
- Background refetching
- Loading/error states
- Optimistic updates

### Client State (React Context)

For application state:
- Authentication status
- Current user
- UI preferences

**Why?**
- Simple for auth state
- No external dependencies
- Built-in to React

### Local State (useState)

For component-specific state:
- Form inputs
- Modal open/close
- UI toggles

**Why?**
- Simplest solution
- No prop drilling needed
- Automatic cleanup

## Routing

We use **TanStack Router** with file-based routing:

### Route Structure

```
routes/
├── __root.tsx              # Root layout (Outlet + Toaster)
├── index.tsx              # Home (redirect to login/dashboard)
├── login.tsx              # Public login page
├── register.tsx           # Public register page
└── _authenticated.tsx     # Protected layout
    ├── dashboard.tsx      # Dashboard page
    ├── products.tsx       # Products page
    └── health.tsx         # Health page
```

### Protected Routes

Protected routes use the `_authenticated.tsx` layout:

1. Check if user is authenticated
2. If not, redirect to `/login`
3. If yes, render child routes in `DashboardLayout`

**Benefits**:
- Centralized auth check
- Consistent layout for authenticated pages
- Type-safe route params

## Authentication Flow

### Initial Load

1. App loads, `AuthProvider` checks localStorage
2. If access token exists, set user from stored data
3. If no token, user is not authenticated

### Login Flow

1. User submits login form
2. POST to `/auth/login` with credentials
3. Backend returns `{ accessToken, refreshToken, user }`
4. Store tokens in localStorage
5. Set user in auth context
6. Redirect to `/dashboard`

### Token Refresh Flow

1. User makes authenticated request
2. Access token expired, API returns 401
3. Axios interceptor catches 401
4. POST to `/auth/refresh` with refresh token
5. Backend returns new access + refresh tokens
6. Store new tokens, retry original request
7. If refresh fails, logout user

### OAuth Flow

1. User clicks "Login with Google/GitHub"
2. Redirect to backend OAuth endpoint (`/auth/google` or `/auth/github`)
3. Backend handles OAuth flow, redirects back with tokens
4. Frontend extracts tokens, stores them, logs in user

## API Integration

### Axios Client

We use a centralized Axios instance with interceptors:

```typescript
// Request interceptor
- Adds JWT Bearer token to Authorization header

// Response interceptor
- Catches 401 errors
- Automatically refreshes tokens
- Retries failed requests
- Logs out if refresh fails
```

### Type Safety

All API functions are typed:

```typescript
// ✅ Type-safe API call
const login = async (credentials: LoginDto): Promise<AuthResponseDto> => {
  const response = await apiClient.post<AuthResponseDto>('/auth/login', credentials);
  return response.data;
};
```

### React Query Integration

API functions are wrapped in React Query hooks:

```typescript
// API function
export const getProducts = async (): Promise<Product[]> => { ... }

// React Query hook
export function useProducts() {
  return useQuery({
    queryKey: ['products', 'list'],
    queryFn: getProducts,
  });
}
```

**Benefits**:
- Automatic caching
- Loading/error states
- Refetching on focus
- Optimistic updates

## Design Patterns

### Custom Hooks

We extract logic into custom hooks:

```typescript
// ✅ Custom hook
function useLogin() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data.user);
      navigate({ to: '/dashboard' });
    },
  });
}

// Usage
const login = useLogin();
login.mutate({ email, password });
```

### Composition

We build complex UIs from small components:

```typescript
// ✅ Composition
<Card>
  <CardHeader>
    <CardTitle>Products</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>...</Table>
  </CardContent>
</Card>
```

### Error Handling

Centralized error handling:

```typescript
// API client handles errors
- 401 → Refresh token
- 403 → Show forbidden message
- 500 → Show error toast

// React Query handles errors
- onError: (error) => toast.error(error.message)

// Component boundaries
- Error boundaries catch render errors
```

### Loading States

Consistent loading patterns:

```typescript
const { data, isLoading, isError } = useProducts();

if (isLoading) return <Spinner />;
if (isError) return <ErrorMessage />;
return <ProductList products={data} />;
```

## Performance Optimizations

1. **Code Splitting**: Routes are lazy-loaded
2. **Memoization**: Expensive computations are memoized
3. **Query Caching**: React Query caches all requests
4. **Optimistic Updates**: UI updates before server responds
5. **Debouncing**: Search inputs are debounced
6. **Virtual Scrolling**: Long lists use virtual scrolling (if needed)

## TypeScript Patterns

### Type Inference

Let TypeScript infer types when possible:

```typescript
// ✅ Let TypeScript infer
const products = useProducts(); // TypeScript knows the type

// ❌ Don't repeat yourself
const products: UseQueryResult<Product[]> = useProducts();
```

### Type Guards

Use type guards for runtime safety:

```typescript
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error
  );
}
```

### Generics

Use generics for reusable code:

```typescript
function createMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  return useMutation({ mutationFn });
}
```

## Security Considerations

1. **Token Storage**: Tokens in localStorage (consider httpOnly cookies for production)
2. **XSS Protection**: React escapes all output by default
3. **CSRF**: Not needed for JWT (no cookies)
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: All forms validated with Zod

## Testing Strategy

(Not implemented in scaffold, but recommended):

1. **Unit Tests**: Test utilities, hooks
2. **Integration Tests**: Test features end-to-end
3. **E2E Tests**: Test critical user flows
4. **Type Tests**: Use TypeScript for type testing

## Future Enhancements

Potential improvements:

1. **Dark Mode**: Theme switching
2. **i18n**: Internationalization
3. **PWA**: Progressive Web App features
4. **Analytics**: User behavior tracking
5. **Error Monitoring**: Sentry integration
6. **Performance Monitoring**: Web Vitals
7. **Accessibility**: ARIA labels, keyboard navigation
8. **Testing**: Vitest + React Testing Library

## Conclusion

This architecture balances:
- **Developer Experience**: Fast, type-safe, modern tools
- **User Experience**: Fast, responsive, accessible
- **Maintainability**: Clear structure, separation of concerns
- **Scalability**: Easy to add features, refactor code

The patterns established here can scale from small projects to large applications.
