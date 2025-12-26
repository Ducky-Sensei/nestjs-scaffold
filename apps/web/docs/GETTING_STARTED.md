# Getting Started with Scaffold Frontend

This guide will help you set up and run the frontend application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+**: [Download Node.js](https://nodejs.org/)
- **pnpm**: Install with `npm install -g pnpm`
- **Backend server**: The NestJS backend must be running at `http://localhost:8000`

## Step 1: Install Dependencies

```bash
# Navigate to the project directory
cd scaffold-fe

# Install dependencies
pnpm install
```

This will install all required packages including:
- React 18
- TypeScript 5.6
- TanStack Router & Query
- Tailwind CSS
- And more...

## Step 2: Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_OAUTH_URL=http://localhost:8000/auth/google
VITE_GITHUB_OAUTH_URL=http://localhost:8000/auth/github
```

**Important**: Make sure the backend is running at `http://localhost:8000` before proceeding.

## Step 3: Start the Backend

In a separate terminal, navigate to the backend directory and start it:

```bash
cd ../scaffold-be
pnpm dev
```

The backend should start at `http://localhost:8000`.

Verify it's running:
```bash
curl http://localhost:8000/health
```

You should see a health check response.

## Step 4: Start the Frontend

Now you can start the frontend development server:

```bash
pnpm dev
```

The application will open automatically at `http://localhost:3000`.

## Step 5: Login

You can login with the default admin credentials:

- **Email**: `admin@admin.com`
- **Password**: `Foobar1!`

Or register a new account using the register page.

## Project Structure

```
scaffold-fe/
├── src/
│   ├── routes/              # Pages and routes
│   ├── features/            # Feature modules (auth, products, health)
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and API client
│   └── types/               # TypeScript type definitions
├── docs/                    # Documentation
├── .env                     # Environment variables
└── package.json             # Dependencies
```

## Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build

# Code Quality
pnpm lint         # Lint code
pnpm type-check   # Check TypeScript types
```

## Features to Explore

Once logged in, you can:

1. **Dashboard**: View overview of your account and system health
2. **Products**: Create, read, update, and delete products
3. **Health**: Monitor real-time backend health status

## Common Issues

### Backend Not Running

**Error**: Network error or connection refused

**Solution**: Make sure the backend is running at `http://localhost:8000`

```bash
cd ../scaffold-be
pnpm dev
```

### Port Already in Use

**Error**: Port 3000 is already in use

**Solution**: Either:
1. Stop the process using port 3000
2. Or modify `vite.config.ts` to use a different port

### Authentication Errors

**Error**: Login fails or 401 errors

**Solution**:
1. Clear localStorage in browser DevTools
2. Verify backend is running
3. Check credentials are correct
4. Check backend logs for errors

## Next Steps

Now that you're up and running:

1. **Read the documentation**:
   - [README.md](README.md) - Project overview
   - [docs/architecture.md](docs/architecture.md) - Architecture decisions
   - [docs/api-integration.md](docs/api-integration.md) - API integration guide

2. **Explore the code**:
   - Start with `src/routes/` to see all pages
   - Check `src/features/` to understand feature organization
   - Look at `src/lib/api/client.ts` to see how API calls work

3. **Make changes**:
   - Add new features
   - Customize the UI
   - Extend the API integration

## Development Workflow

### Adding a New Feature

1. Create a new directory in `src/features/`
2. Add API functions in `api/`
3. Create React Query hooks in `hooks/`
4. Build components in `components/`
5. Add routes in `src/routes/`

### Making API Calls

1. Define types in `src/types/`
2. Create API function in feature's `api/` directory
3. Wrap in React Query hook
4. Use in components

Example:

```typescript
// 1. Define type
export interface Example {
  id: string;
  name: string;
}

// 2. Create API function
export const getExamples = async (): Promise<Example[]> => {
  const response = await apiClient.get<Example[]>('/examples');
  return response.data;
};

// 3. Create hook
export function useExamples() {
  return useQuery({
    queryKey: ['examples'],
    queryFn: getExamples,
  });
}

// 4. Use in component
const { data: examples, isLoading } = useExamples();
```

## Building for Production

```bash
# Build the application
pnpm build

# Preview the production build
pnpm preview
```

The production build will be in the `dist/` directory.

## Learn More

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)

## Need Help?

If you encounter issues:

1. Check this guide for common issues
2. Read the [documentation](docs/)
3. Check browser console for errors
4. Check backend logs

## Summary

You now have a fully functional React + TypeScript frontend connected to the NestJS backend!

Key features:
- Authentication with JWT and OAuth
- Product CRUD operations
- Real-time health monitoring
- Type-safe API integration
- Modern React patterns

Happy coding!
