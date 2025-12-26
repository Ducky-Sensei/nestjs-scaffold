import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import type { SentryConfig } from './configuration';

/**
 * Initialize Sentry error tracking and performance monitoring
 * This should be called as early as possible in the application lifecycle
 *
 * @param config - Sentry configuration from ConfigService
 */
export function initializeSentry(config: SentryConfig): void {
    if (!config.enabled) {
        console.log('[Sentry] Sentry is disabled');
        return;
    }

    if (!config.dsn) {
        console.warn('[Sentry] Sentry is enabled but no DSN provided. Skipping initialization.');
        return;
    }

    Sentry.init({
        dsn: config.dsn,
        environment: config.environment,

        tracesSampleRate: config.tracesSampleRate,

        profilesSampleRate: config.profilesSampleRate,
        integrations: [nodeProfilingIntegration()],

        beforeSend(event) {
            // Filter out sensitive data here if needed
            return event;
        },

        debug: config.environment === 'development',
    });

    console.log(`[Sentry] Initialized successfully (environment: ${config.environment})`);
}

/**
 * Manually capture an exception with Sentry
 * Useful for catching errors in try-catch blocks
 *
 * @param error - The error to capture
 * @param context - Optional context to add to the error
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
    if (context) {
        Sentry.setContext('additional', context);
    }
    Sentry.captureException(error);
}

/**
 * Manually capture a message with Sentry
 * Useful for logging important events
 *
 * @param message - The message to capture
 * @param level - The severity level
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry events
 *
 * @param user - User information
 */
export function setUser(user: { id: string; email?: string; username?: string }): void {
    Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser(): void {
    Sentry.setUser(null);
}

/**
 * Flush all pending Sentry events
 * Should be called before application shutdown
 *
 * @param timeout - Timeout in milliseconds
 * @returns Promise that resolves when flush is complete
 */
export async function flushSentry(timeout = 2000): Promise<boolean> {
    return Sentry.flush(timeout);
}
