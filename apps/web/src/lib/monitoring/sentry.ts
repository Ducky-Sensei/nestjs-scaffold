import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry monitoring with error tracking and performance monitoring
 * Opt-in with environment variables - disabled by default
 */
export function initSentry(): void {
  const enabled = import.meta.env.VITE_SENTRY_ENABLED === 'true';

  if (!enabled) {
    console.log('[Sentry] Monitoring disabled (opt-in with VITE_SENTRY_ENABLED=true)');
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.warn('[Sentry] DSN not configured, monitoring disabled');
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',

      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '1.0'),
      replaysSessionSampleRate: parseFloat(
        import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1',
      ),
      replaysOnErrorSampleRate: parseFloat(
        import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0',
      ),
      release: import.meta.env.VITE_APP_VERSION || 'development',
      ignoreErrors: [
        'Non-Error promise rejection captured',
        'ResizeObserver loop limit exceeded',
        'Network request failed',
      ],
      beforeBreadcrumb(breadcrumb) {
        // Filter out console logs in production
        if (
          breadcrumb.category === 'console' &&
          import.meta.env.VITE_SENTRY_ENVIRONMENT === 'production'
        ) {
          return null;
        }
        return breadcrumb;
      },

      beforeSend(event) {
        if (event.request) {
          event.request.cookies = '[Filtered]' as never;
        }

        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
            if (breadcrumb.data?.url) {
              const url = new URL(breadcrumb.data.url as string, window.location.origin);
              url.search = '';
              breadcrumb.data.url = url.toString();
            }
            return breadcrumb;
          });
        }

        return event;
      },
    });

    console.log('[Sentry] Monitoring initialized');
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: string; email?: string; username?: string }): void {
  if (import.meta.env.VITE_SENTRY_ENABLED !== 'true') return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context from Sentry
 */
export function clearSentryUser(): void {
  if (import.meta.env.VITE_SENTRY_ENABLED !== 'true') return;
  Sentry.setUser(null);
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (import.meta.env.VITE_SENTRY_ENABLED !== 'true') {
    console.error(error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message manually
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>,
): void {
  if (import.meta.env.VITE_SENTRY_ENABLED !== 'true') {
    console.log(message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb manually
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  if (import.meta.env.VITE_SENTRY_ENABLED !== 'true') return;

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

/**
 * Start a new transaction for performance monitoring
 */
export function startTransaction(name: string, op: string): Sentry.Span | undefined {
  if (import.meta.env.VITE_SENTRY_ENABLED !== 'true') return undefined;

  return Sentry.startSpan(
    {
      name,
      op,
    },
    (span) => span,
  );
}

/**
 * Sentry Error Boundary Component
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Export Sentry for advanced usage
 */
export { Sentry };
