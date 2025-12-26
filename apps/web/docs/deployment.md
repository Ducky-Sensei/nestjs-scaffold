# Deployment Guide

## Quick Deploy with Docker

```bash
# Build production image
docker build -t scaffold-fe:latest .

# Run container
docker run -p 8080:80 scaffold-fe:latest

# Or use docker-compose
docker-compose up -d
```

## Environment-Specific Builds

### Development
```bash
pnpm dev
```

### Staging
```bash
VITE_SENTRY_ENVIRONMENT=staging pnpm build
```

### Production
```bash
VITE_SENTRY_ENVIRONMENT=production pnpm build
```

## Deployment Platforms

### Vercel

```bash
vercel --prod
```

### Netlify

```bash
netlify deploy --prod --dir=dist
```

### AWS S3 + CloudFront

```bash
pnpm build
aws s3 sync dist/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

## CI/CD Pipeline

GitHub Actions automatically:
1. Runs tests on every PR
2. Builds production bundle
3. Checks bundle size
4. Deploys to production on `main` branch

## Environment Variables

Set these in your deployment platform:

```env
# Required
VITE_API_BASE_URL=https://api.example.com

# Monitoring (opt-in)
VITE_SENTRY_ENABLED=true
VITE_SENTRY_DSN=https://...@sentry.io/...

# For CI/CD
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
```

## Health Checks

Nginx serves a `/health` endpoint for container health checks.

## Rollback Procedure

1. Identify last known good commit
2. Revert to that commit or re-deploy
3. Create new release with fix

## Production Checklist

- [ ] All environment variables set
- [ ] Monitoring configured
- [ ] Source maps uploaded
- [ ] Bundle size verified (<200KB)
- [ ] Health checks passing
- [ ] HTTPS enabled
- [ ] CDN configured
- [ ] Error tracking enabled
