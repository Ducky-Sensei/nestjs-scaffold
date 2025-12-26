# OAuth2 Setup Guide

This guide walks you through setting up OAuth2 authentication with Google and GitHub providers.

## Google OAuth Setup

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted:
   - Choose **External** for public apps or **Internal** for Google Workspace
   - Fill in application name and support email
   - Add authorized domains
   - Save and continue

### 2. Configure OAuth Client

1. Choose **Web application** as application type
2. Add authorized redirect URIs:
   - **Development**: `http://localhost:8000/auth/google/callback`
   - **Production**: `https://yourdomain.com/auth/google/callback`
3. Click **Create**
4. Copy the **Client ID** and **Client Secret**

### 3. Update Environment Variables

Add to your `.env` file:

```bash
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback
```

---

## GitHub OAuth Setup

### 1. Create OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in application details:
   - **Application name**: Your App Name
   - **Homepage URL**:
     - Development: `http://localhost:8000`
     - Production: `https://yourdomain.com`
   - **Authorization callback URL**:
     - Development: `http://localhost:8000/auth/github/callback`
     - Production: `https://yourdomain.com/auth/github/callback`
   - **Application description**: (optional)

### 2. Generate Client Secret

1. Click **Register application**
2. Click **Generate a new client secret**
3. Copy the **Client ID** and **Client secret** immediately (secret won't be shown again)

### 3. Update Environment Variables

Add to your `.env` file:

```bash
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
GITHUB_CALLBACK_URL=http://localhost:8000/auth/github/callback
```

---

## Testing OAuth Flows

### Google OAuth

1. Start your application: `pnpm dev`
2. Navigate to: `http://localhost:8000/auth/google`
3. Sign in with your Google account
4. You'll be redirected to the callback with tokens in JSON response:

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "a1b2c3d4...",
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "name": "User Name",
    "authProvider": "google"
  }
}
```

### GitHub OAuth

1. Navigate to: `http://localhost:8000/auth/github`
2. Authorize the application
3. You'll be redirected to the callback with tokens in JSON response

---

## Using the Tokens

### 1. Store Tokens Securely

**Frontend (recommended approach):**
- Store `accessToken` in memory (React state, Vue store, etc.)
- Store `refreshToken` in httpOnly cookie (set via backend)
- Never store tokens in localStorage (vulnerable to XSS)

**For testing with curl:**
```bash
# Save tokens from OAuth callback
ACCESS_TOKEN="your-access-token"
REFRESH_TOKEN="your-refresh-token"
```

### 2. Access Protected Endpoints

```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:8000/auth/me
```

Response:
```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "name": "User Name",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. Refresh Access Token

When the access token expires (after 15 minutes), use the refresh token:

```bash
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

Response:
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "same-refresh-token",
  "user": { ... }
}
```

### 4. Logout

Revoke the refresh token:

```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

---

## Account Linking

The system automatically links OAuth accounts to existing users by email:

### Scenario 1: New User

1. User signs in with Google for the first time
2. New account created with `authProvider: 'google'`
3. User assigned default `'user'` role
4. No password set (OAuth users can't use password login)

### Scenario 2: Existing User

1. User already registered with email/password
2. User signs in with Google using the same email
3. OAuth provider linked to existing account
4. User can now login with **either** password or Google

### Scenario 3: Multiple OAuth Providers

1. User registered with Google
2. User signs in with GitHub using the same email
3. GitHub OAuth linked to existing account
4. User can login with Google or GitHub (but not password)

---

## Production Considerations

### 1. HTTPS Requirements

**All OAuth callback URLs in production MUST use HTTPS:**

```bash
# ❌ WRONG - HTTP in production
GOOGLE_CALLBACK_URL=http://yourdomain.com/auth/google/callback

# ✓ CORRECT - HTTPS in production
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
```

The system will warn you if callback URLs don't use HTTPS in production.

### 2. Environment Variables

**Production `.env` must have:**
```bash
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

GITHUB_CLIENT_ID=<production-client-id>
GITHUB_CLIENT_SECRET=<production-client-secret>
GITHUB_CALLBACK_URL=https://yourdomain.com/auth/github/callback
```

### 3. OAuth Provider Configuration

**Google Cloud Console:**
- Add production domain to authorized domains
- Add production callback URL to authorized redirect URIs
- Review OAuth consent screen for production use
- Consider verified app status for external users

**GitHub OAuth Apps:**
- Update Homepage URL to production domain
- Update Authorization callback URL to production domain
- Consider GitHub App (more features) vs OAuth App

### 4. Frontend Integration

**Recommended flow:**
```
1. Redirect user to: GET /auth/google
2. User completes OAuth on Google's site
3. Google redirects to: GET /auth/google/callback
4. Your backend receives tokens
5. Backend redirects to frontend with tokens in URL hash or query
   Example: https://app.yourdomain.com/#access_token=...&refresh_token=...
6. Frontend extracts tokens and stores securely
7. Frontend makes API calls with access token
```

**Alternative (more secure):**
```
1. Redirect user to: GET /auth/google
2. User completes OAuth
3. Backend sets httpOnly cookie with refresh token
4. Backend redirects to frontend
5. Frontend calls GET /auth/me to get user info
6. Frontend receives short-lived access token
7. Frontend uses access token for API calls
8. When access token expires, backend automatically refreshes via cookie
```

### 5. Security Best Practices

- **Never expose client secrets** - Keep in backend environment variables only
- **Rotate secrets regularly** - Update OAuth credentials periodically
- **Monitor OAuth usage** - Track logins and detect suspicious activity
- **Implement rate limiting** - Prevent OAuth endpoint abuse
- **Validate redirect URLs** - Ensure callbacks match configured URLs
- **Use state parameter** - Prevent CSRF (Passport handles this automatically)

---

## Troubleshooting

### "Invalid credentials" error

**Symptoms:** Getting 401 Unauthorized when calling OAuth endpoints

**Solutions:**
1. Check client ID and secret are correctly set in `.env`
2. Verify callback URLs match exactly in OAuth provider settings
3. Ensure you're using the correct environment (dev vs prod credentials)
4. Check if OAuth app is enabled in provider console

### "Email already registered" (if account linking fails)

**Symptoms:** Error when trying to link OAuth to existing account

**Solutions:**
1. This shouldn't happen with current implementation (auto-links by email)
2. Check database for existing user with that email
3. Verify `authProvider` and `authProviderId` fields exist in users table

### "Refresh token expired"

**Symptoms:** 401 error when trying to refresh access token

**Solutions:**
1. Refresh tokens expire after 30 days (configurable)
2. User must re-authenticate via OAuth
3. Check `expiresAt` field in `refresh_tokens` table
4. Ensure `JWT_REFRESH_EXPIRES_IN` is set correctly

### GitHub user has no public email

**Symptoms:** GitHub OAuth creates user with `username@github.local` email

**Solutions:**
1. This is expected behavior when GitHub user hasn't made email public
2. User can update email in your app after registration
3. Consider requiring email verification for GitHub users
4. Ask GitHub users to make at least one email public

### OAuth callback returns HTML instead of JSON

**Symptoms:** Browser shows HTML page instead of JSON response

**Solutions:**
1. This is normal for development - JSON response is displayed in browser
2. For production, redirect to frontend with tokens in URL
3. Update callback handlers to redirect instead of returning JSON
4. See "Frontend Integration" section above

---

## Next Steps

1. **Configure OAuth providers** (Google, GitHub)
2. **Test OAuth flows** locally
3. **Implement frontend** OAuth integration
4. **Deploy to production** with HTTPS callbacks
5. **Monitor and maintain** OAuth credentials

For more information, see the main [README](../README.md).
