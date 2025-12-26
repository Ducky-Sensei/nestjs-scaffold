# Verification Checklist

Use this checklist to verify that the frontend scaffold is working correctly.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] Backend running at `http://localhost:8000`
- [ ] Backend health check returns OK: `curl http://localhost:8000/health`

## Installation

- [ ] Dependencies installed: `pnpm install`
- [ ] No installation errors
- [ ] `.env` file created from `.env.example`

## Build & Type Check

- [ ] TypeScript compiles without errors: `pnpm type-check`
- [ ] Production build succeeds: `pnpm build`
- [ ] No build warnings or errors
- [ ] Build output in `dist/` directory

## Development Server

- [ ] Dev server starts: `pnpm dev`
- [ ] Server runs on `http://localhost:3000`
- [ ] Browser opens automatically
- [ ] No console errors in terminal
- [ ] Hot Module Replacement (HMR) works

## Authentication Flow

### Registration
- [ ] Register page loads at `/register`
- [ ] Form validation works (email, password, name)
- [ ] Password strength indicator displays
- [ ] Can register a new user
- [ ] Redirects to dashboard after successful registration
- [ ] Error messages display for invalid input
- [ ] "Already have an account" link works

### Login
- [ ] Login page loads at `/login`
- [ ] Can login with default credentials (`admin@admin.com` / `Foobar1!`)
- [ ] Form validation works
- [ ] Success toast notification appears
- [ ] Redirects to dashboard after login
- [ ] Error message displays for wrong credentials
- [ ] "Don't have an account" link works

### OAuth
- [ ] "Login with Google" button present
- [ ] "Login with GitHub" button present
- [ ] Buttons redirect to backend OAuth endpoints
- [ ] (Optional) OAuth flow completes if configured in backend

### Token Management
- [ ] Access token stored in localStorage
- [ ] Refresh token stored in localStorage
- [ ] User data stored in localStorage
- [ ] Token automatically added to API requests (check Network tab)
- [ ] Automatic token refresh on 401 (test by expiring token manually)

### Logout
- [ ] Logout button in sidebar works
- [ ] Tokens cleared from localStorage
- [ ] Redirects to login page
- [ ] Success toast notification appears

## Protected Routes

- [ ] Accessing `/dashboard` while logged out redirects to `/login`
- [ ] Accessing `/products` while logged out redirects to `/login`
- [ ] Accessing `/health` while logged out redirects to `/login`
- [ ] Can access all pages when logged in
- [ ] Root `/` redirects to dashboard when logged in
- [ ] Root `/` redirects to login when logged out

## Dashboard Page

- [ ] Dashboard loads at `/dashboard`
- [ ] Welcome message displays user name
- [ ] Stats cards display:
  - [ ] Total products count
  - [ ] System health status
  - [ ] Account status
- [ ] User info card displays:
  - [ ] Email
  - [ ] Name
  - [ ] Auth provider
  - [ ] Account status (Active/Inactive)
  - [ ] Member since date
- [ ] System health card displays:
  - [ ] Overall status
  - [ ] Database status
- [ ] Navigation sidebar works
- [ ] Active route highlighted in sidebar

## Products Page

### List View
- [ ] Products page loads at `/products`
- [ ] Empty state displays when no products
- [ ] "Add Product" button visible
- [ ] Table displays when products exist
- [ ] Table columns: Name, Quantity, Price, Status, Actions

### Create Product
- [ ] "Add Product" button opens modal
- [ ] Form fields present:
  - [ ] Name (text input)
  - [ ] Quantity (number input)
  - [ ] Unit (text input)
  - [ ] Price (number input)
  - [ ] Currency (text input, max 3 chars)
  - [ ] Active (checkbox)
- [ ] Form validation works
- [ ] Can create product
- [ ] Success toast appears
- [ ] Modal closes after creation
- [ ] Product list updates automatically
- [ ] Cancel button works

### Edit Product
- [ ] Edit button (pencil icon) opens modal
- [ ] Form pre-filled with product data
- [ ] Can update product
- [ ] Success toast appears
- [ ] Modal closes after update
- [ ] Product list updates automatically
- [ ] Cancel button works

### Delete Product
- [ ] Delete button (trash icon) opens confirmation dialog
- [ ] Confirmation dialog shows product name
- [ ] Can cancel deletion
- [ ] Can confirm deletion
- [ ] Success toast appears
- [ ] Product removed from list
- [ ] Dialog closes after deletion

## Health Page

- [ ] Health page loads at `/health`
- [ ] Overall status card displays
- [ ] Database status card displays
- [ ] Status badges color-coded (green/red)
- [ ] Status icons display (CheckCircle/XCircle)
- [ ] Auto-refresh indicator shows
- [ ] Last updated timestamp displays
- [ ] Auto-refreshes every 30 seconds
- [ ] Manual refresh button works
- [ ] Detailed health info displays:
  - [ ] Healthy services (green)
  - [ ] Services with issues (red)
- [ ] Error state displays if backend down

## UI Components

### Navigation
- [ ] Sidebar visible on desktop
- [ ] Sidebar toggles on mobile
- [ ] Navigation links work
- [ ] Active route highlighted
- [ ] User profile section in sidebar
- [ ] Logout button in sidebar

### Forms
- [ ] Input fields styled correctly
- [ ] Labels display
- [ ] Error messages in red below fields
- [ ] Required field validation
- [ ] Disabled state works
- [ ] Focus states visible

### Buttons
- [ ] Primary buttons styled
- [ ] Outline buttons styled
- [ ] Destructive buttons styled
- [ ] Loading states show "..." text
- [ ] Disabled state works
- [ ] Hover effects work

### Modals/Dialogs
- [ ] Dialogs center on screen
- [ ] Backdrop dims background
- [ ] Close button (X) works
- [ ] Click outside to close works
- [ ] ESC key closes dialog

### Toast Notifications
- [ ] Success toasts (green)
- [ ] Error toasts (red)
- [ ] Toasts auto-dismiss after ~3 seconds
- [ ] Toasts appear in top-right corner
- [ ] Multiple toasts stack

### Tables
- [ ] Headers styled
- [ ] Rows styled
- [ ] Hover effects on rows
- [ ] Action buttons in last column
- [ ] Responsive on mobile

### Cards
- [ ] Cards have shadow
- [ ] Headers styled
- [ ] Content padded
- [ ] Descriptions in muted text

### Badges
- [ ] Success badges (green)
- [ ] Destructive badges (red)
- [ ] Warning badges (yellow)
- [ ] Default badges

## Responsive Design

- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Sidebar becomes hamburger menu on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Forms stack on mobile
- [ ] Cards stack on mobile

## Error Handling

- [ ] Network errors show toast
- [ ] Validation errors show in forms
- [ ] 401 errors trigger token refresh
- [ ] Refresh failure logs out user
- [ ] API errors show user-friendly messages
- [ ] Backend down shows error state
- [ ] Loading states during API calls

## Performance

- [ ] Initial load < 3 seconds
- [ ] Page transitions instant
- [ ] No unnecessary re-renders (check React DevTools)
- [ ] Forms don't lag when typing
- [ ] API calls cached by React Query
- [ ] Background refetching works

## Browser Console

- [ ] No console errors
- [ ] No console warnings (except from libraries)
- [ ] Network tab shows API calls
- [ ] Authorization header on requests
- [ ] Responses have correct status codes

## TypeScript

- [ ] No type errors: `pnpm type-check`
- [ ] Auto-completion works in editor
- [ ] Type inference works
- [ ] Import paths resolve

## Code Quality

- [ ] ESLint passes: `pnpm lint`
- [ ] Code formatted consistently
- [ ] No unused imports
- [ ] No unused variables
- [ ] Comments explain complex logic

## Documentation

- [ ] README.md exists and is clear
- [ ] GETTING_STARTED.md exists
- [ ] PROJECT_SUMMARY.md exists
- [ ] docs/architecture.md exists
- [ ] docs/api-integration.md exists
- [ ] All docs accurate and helpful

## Integration with Backend

- [ ] Login API call works
- [ ] Register API call works
- [ ] Refresh token API call works
- [ ] Logout API call works
- [ ] Get current user API call works
- [ ] List products API call works
- [ ] Create product API call works
- [ ] Update product API call works
- [ ] Delete product API call works
- [ ] Health check API call works

## Environment Variables

- [ ] `.env` file exists
- [ ] VITE_API_BASE_URL set correctly
- [ ] VITE_GOOGLE_OAUTH_URL set correctly
- [ ] VITE_GITHUB_OAUTH_URL set correctly
- [ ] Environment variables accessible in code

## Git

- [ ] `.gitignore` includes `node_modules`
- [ ] `.gitignore` includes `dist`
- [ ] `.gitignore` includes `.env`
- [ ] `.gitignore` includes `.tanstack`

## Production Build

- [ ] `pnpm build` succeeds
- [ ] `pnpm preview` serves production build
- [ ] Production build works same as dev
- [ ] No errors in production build
- [ ] Assets optimized (check size)

## Summary

**Total Checks**: ~150

**Passed**: _____ / 150

**Issues Found**:
1.
2.
3.

**Notes**:


---

## Quick Smoke Test

For a quick verification, test this minimal flow:

1. [ ] `pnpm install` works
2. [ ] `pnpm type-check` passes
3. [ ] `pnpm build` succeeds
4. [ ] `pnpm dev` starts server
5. [ ] Login at `/login` works
6. [ ] Dashboard loads
7. [ ] Can create a product
8. [ ] Can delete a product
9. [ ] Health page shows status
10. [ ] Logout works

If all 10 pass, the scaffold is working correctly!
