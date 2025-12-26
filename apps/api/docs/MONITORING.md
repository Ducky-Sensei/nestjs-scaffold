# Monitoring Setup

This scaffold includes production-ready configurations for three observability platforms:

## 1. OpenTelemetry (Already Configured)
- **Status**: Active by default
- **Usage**: Distributed tracing with OTLP export
- **Configuration**: See `src/config/instrumentations.ts`

## 2. Sentry (Ready to Enable)
- **Status**: Installed but disabled
- **Purpose**: Error tracking and performance monitoring
- **Configuration**: See `src/config/sentry.ts`

### Enabling Sentry

1. Create a Sentry project at https://sentry.io
2. Get your DSN from the project settings
3. Update your `.env` file:

```bash
SENTRY_ENABLED=true
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% in production
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

### Using Sentry in Your Code

```typescript
import { captureException, captureMessage, setUser } from './config/sentry';

// Capture errors
try {
    // your code
} catch (error) {
    captureException(error, { context: 'additional info' });
}

// Log messages
captureMessage('Important event occurred', 'warning');

// Set user context
setUser({ id: '123', email: 'user@example.com' });
```

## 3. Datadog (Ready to Enable)
- **Status**: Installed but disabled
- **Purpose**: APM (Application Performance Monitoring)
- **Configuration**: See `src/config/datadog.ts`

### Enabling Datadog

1. Install the Datadog Agent on your server/infrastructure
2. Get your API key from Datadog
3. Update your `.env` file:

```bash
DATADOG_ENABLED=true
DATADOG_SERVICE_NAME=scaffold-service
DATADOG_ENV=production
DATADOG_VERSION=1.0.0
DATADOG_AGENT_HOST=localhost  # or your agent hostname
DATADOG_AGENT_PORT=8126
DATADOG_RUNTIME_METRICS_ENABLED=true
DATADOG_PROFILING_ENABLED=true
```

### Using Datadog in Your Code

```typescript
import { traceOperation, addTags, getTracer } from './config/datadog';

// Trace custom operations
await traceOperation(
    'database.query',
    {
        resource: 'SELECT * FROM users',
        tags: { table: 'users' }
    },
    async () => {
        // your operation
        return result;
    }
);

// Add tags to current span
addTags({ userId: '123', action: 'purchase' });

// Access tracer directly
const tracer = getTracer();
```

## Configuration Priority

All three systems can run simultaneously:

1. **Datadog** - Initialized first (automatic instrumentation requires early loading)
2. **Sentry** - Initialized second (error tracking and performance)
3. **OpenTelemetry** - Initialized third (distributed tracing)

## Environment Variables Reference

All monitoring configuration is in `.env.example`. Key settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `SENTRY_ENABLED` | false | Enable/disable Sentry |
| `SENTRY_DSN` | (empty) | Sentry project DSN |
| `DATADOG_ENABLED` | false | Enable/disable Datadog |
| `DATADOG_SERVICE_NAME` | scaffold-service | Service identifier |

## Development vs Production

### Development
- All systems disabled by default (set to `false` in `.env.example`)
- OpenTelemetry uses console exporter for visibility
- Sample rates set to 100% for full visibility

### Production
- Enable only what you need (Sentry, Datadog, or both)
- OpenTelemetry can export to OTLP collectors
- Reduce sample rates to manage costs:
  - Sentry: `SENTRY_TRACES_SAMPLE_RATE=0.1` (10%)
  - Datadog: Automatically set to 10% in production

## Graceful Shutdown

Both Sentry and Datadog flush pending events on shutdown:

```typescript
// In main.ts and main-dev.ts
await Promise.allSettled([
    flushSentry(2000),  // 2 second timeout
    flushDatadog(),
]);
```

This ensures all traces and errors are sent before the application exits.

## Cost Optimization Tips

1. **Use appropriate sample rates** - Don't trace 100% in production
2. **Filter sensitive data** - Use `beforeSend` in Sentry config
3. **Choose the right tool**:
   - Sentry: Best for error tracking and user-facing issues
   - Datadog: Best for APM and infrastructure monitoring
   - OpenTelemetry: Best for distributed tracing across microservices
4. **You don't need all three** - Pick what fits your needs

## Troubleshooting

### Sentry not receiving events
- Verify `SENTRY_ENABLED=true` and DSN is set
- Check network connectivity to sentry.io
- Enable debug mode: `SENTRY_ENVIRONMENT=development`

### Datadog not showing traces
- Verify Datadog Agent is running
- Check agent host/port settings
- Ensure `DATADOG_ENABLED=true`
- Agent must be accessible from the application

### TypeScript errors
- All types are included in the installed packages
- Run `pnpm install` if you see type errors
