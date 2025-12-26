# Monitoring & Observability Guide

This guide explains how to set up and use the monitoring and observability features in the frontend scaffold.

## Overview

The frontend includes comprehensive monitoring with three major services (all opt-in):

- **Sentry**: Error tracking, performance monitoring, session replay
- **Datadog RUM**: Real user monitoring, analytics, user journey tracking
- **OpenTelemetry**: Distributed tracing, connecting frontend to backend traces
- **Web Vitals**: Core Web Vitals tracking (LCP, FID, CLS, INP, FCP, TTFB)

All monitoring services are **disabled by default** and must be explicitly enabled via environment variables.

## Quick Start

1. **Enable Sentry** (recommended for error tracking)
   ```env
   VITE_SENTRY_ENABLED=true
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   VITE_SENTRY_ENVIRONMENT=production
   ```

2. **Enable Datadog RUM** (for user analytics)
   ```env
   VITE_DATADOG_ENABLED=true
   VITE_DATADOG_APPLICATION_ID=your-app-id
   VITE_DATADOG_CLIENT_TOKEN=your-client-token
   ```

3. **Enable OpenTelemetry** (for distributed tracing)
   ```env
   VITE_OTEL_ENABLED=true
   VITE_OTEL_EXPORTER_ENDPOINT=http://your-collector:4318/v1/traces
   ```

## Sentry Configuration

### Features

- **Error Tracking**: Automatic capture of unhandled errors
- **Performance Monitoring**: Track page loads, API calls, React rendering
- **Session Replay**: Record user sessions for debugging (opt-in)
- **Release Tracking**: Associate errors with git commits
- **Source Maps**: Debug production errors with original source code

### Environment Variables

```env
VITE_SENTRY_ENABLED=true
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=1.0
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
```

### Usage in Code

```typescript
import { captureException, captureMessage, addBreadcrumb } from '@/lib/monitoring/sentry';

// Capture an error manually
try {
  // risky operation
} catch (error) {
  captureException(error, { context: 'additional info' });
}

// Log a message
captureMessage('User completed checkout', 'info', { orderId: '123' });

// Add breadcrumb for debugging
addBreadcrumb('user-action', 'User clicked purchase button', { productId: '456' });
```

### Setting User Context

```typescript
import { setSentryUser, clearSentryUser } from '@/lib/monitoring/sentry';

// On login
setSentryUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// On logout
clearSentryUser();
```

### Source Maps Upload

Source maps are automatically uploaded during production builds when Sentry is enabled. Configure these environment variables for CI/CD:

```env
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
```

## Datadog RUM Configuration

### Features

- **Real User Monitoring**: Track real user sessions and interactions
- **Core Web Vitals**: LCP, FID, CLS, INP metrics
- **User Actions**: Button clicks, form submissions, navigation
- **Resource Monitoring**: Track API calls, images, scripts
- **Session Replay**: Visual replay of user sessions

### Environment Variables

```env
VITE_DATADOG_ENABLED=true
VITE_DATADOG_APPLICATION_ID=your-app-id
VITE_DATADOG_CLIENT_TOKEN=your-client-token
VITE_DATADOG_SITE=datadoghq.com
VITE_DATADOG_SERVICE=scaffold-fe
VITE_DATADOG_ENV=production
VITE_DATADOG_SESSION_SAMPLE_RATE=100
VITE_DATADOG_SESSION_REPLAY_SAMPLE_RATE=20
```

### Usage in Code

```typescript
import { addDatadogAction, addDatadogError, setDatadogUser } from '@/lib/monitoring/datadog';

// Track custom action
addDatadogAction('purchase-completed', { productId: '123', amount: 99.99 });

// Log error
addDatadogError(new Error('Payment failed'), { gateway: 'stripe' });

// Set user context
setDatadogUser({
  id: user.id,
  email: user.email,
  name: user.name,
});
```

## OpenTelemetry Configuration

### Features

- **Distributed Tracing**: Connect frontend requests to backend services
- **Automatic Instrumentation**: Fetch API, XMLHttpRequest
- **Custom Spans**: Track specific operations
- **OTLP Export**: Send traces to Jaeger, Honeycomb, or other backends

### Environment Variables

```env
VITE_OTEL_ENABLED=true
VITE_OTEL_SERVICE_NAME=scaffold-fe
VITE_OTEL_ENVIRONMENT=production
VITE_OTEL_EXPORTER_ENDPOINT=http://localhost:4318/v1/traces
```

### Usage in Code

```typescript
import { createSpan } from '@/lib/monitoring/opentelemetry';

// Create custom span
await createSpan('expensive-operation', async (span) => {
  // Your operation here
  const result = await fetchData();
  return result;
});
```

## Web Vitals Monitoring

Web Vitals are automatically tracked and reported to:
- Datadog (if enabled)
- Sentry (if poor vitals detected)
- Custom analytics endpoint (if configured)

### Environment Variables

```env
VITE_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com/vitals
```

### Thresholds

- **LCP (Largest Contentful Paint)**: Good < 2.5s, Poor > 4s
- **FID (First Input Delay)**: Good < 100ms, Poor > 300ms
- **CLS (Cumulative Layout Shift)**: Good < 0.1, Poor > 0.25
- **INP (Interaction to Next Paint)**: Good < 200ms, Poor > 500ms
- **FCP (First Contentful Paint)**: Good < 1.8s, Poor > 3s
- **TTFB (Time to First Byte)**: Good < 800ms, Poor > 1.8s

## Monitoring in Development

All monitoring is opt-in. In development, you can:

1. **View Web Vitals in Console**
   ```typescript
   import { getWebVitals } from '@/lib/performance/web-vitals';

   getWebVitals().then(vitals => console.log(vitals));
   ```

2. **Test Sentry Integration**
   - Enable Sentry in `.env`
   - Throw a test error
   - Check Sentry dashboard

3. **Monitor Performance**
   - Use React DevTools Profiler
   - Check Network tab for slow requests
   - Use Lighthouse for audits

## Production Best Practices

### Sample Rates

Adjust sample rates based on traffic:

```env
# High traffic sites (>100k users/day)
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.01
VITE_DATADOG_SESSION_SAMPLE_RATE=20

# Medium traffic sites (10k-100k users/day)
VITE_SENTRY_TRACES_SAMPLE_RATE=0.5
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.05
VITE_DATADOG_SESSION_SAMPLE_RATE=50

# Low traffic sites (<10k users/day)
VITE_SENTRY_TRACES_SAMPLE_RATE=1.0
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
VITE_DATADOG_SESSION_SAMPLE_RATE=100
```

### Privacy & Security

All monitoring services are configured to:
- Filter sensitive data (passwords, tokens, cookies)
- Mask user input in session replays
- Remove query parameters from URLs
- Respect user privacy preferences

### Cost Optimization

- Start with Sentry only (free tier available)
- Add Datadog when you need detailed user analytics
- Enable OpenTelemetry when debugging distributed systems
- Adjust sample rates based on budget and traffic

## Debugging Production Issues

1. **Find Error in Sentry**
   - Check error dashboard
   - Review breadcrumbs for user actions
   - Watch session replay if available

2. **Analyze Performance in Datadog**
   - Check Core Web Vitals
   - Review resource timing
   - Analyze user journey

3. **Trace Request in OpenTelemetry**
   - Find trace ID in logs
   - View distributed trace
   - Identify bottlenecks

## Alerts & Notifications

Configure alerts in each service:

- **Sentry**: Alert on error rate spikes, new errors
- **Datadog**: Alert on poor Web Vitals, high error rates
- **Custom**: Set up Slack/Discord webhooks for critical errors

## Monitoring Checklist

- [ ] Sentry DSN configured
- [ ] Sample rates adjusted for traffic
- [ ] Source maps uploaded in production
- [ ] User context set on login
- [ ] Alerts configured for critical errors
- [ ] Team has access to dashboards
- [ ] Privacy policy updated for tracking
- [ ] Monitoring costs reviewed monthly
