import tracer from 'dd-trace';
import type { DatadogConfig } from './configuration';

/**
 * Initialize Datadog APM (Application Performance Monitoring)
 * This should be called as early as possible in the application lifecycle
 *
 * NOTE: Datadog tracer must be initialized before importing any other modules
 * to ensure all instrumentations are properly registered
 *
 * @param config - Datadog configuration from ConfigService
 */
export function initializeDatadog(config: DatadogConfig): void {
    if (!config.enabled) {
        console.log('[Datadog] Datadog APM is disabled');
        return;
    }

    tracer.init({
        service: config.serviceName,
        env: config.env,
        version: config.version,

        hostname: config.agentHost,
        port: config.agentPort,

        runtimeMetrics: config.runtimeMetricsEnabled,
        profiling: config.profilingEnabled,

        logInjection: true,

        tags: {
            env: config.env,
            version: config.version,
        },

        plugins: true,

        sampleRate: config.env === 'production' ? 0.1 : 1.0,
    });

    console.log(
        `[Datadog] Initialized successfully (service: ${config.serviceName}, env: ${config.env})`,
    );
}

/**
 * Get the active Datadog tracer instance
 * Use this to create custom spans or add tags
 *
 * @returns The active tracer instance
 */
export function getTracer() {
    return tracer;
}

/**
 * Create a custom span for tracing operations
 *
 * @param operationName - Name of the operation being traced
 * @param options - Span options
 * @param callback - Function to execute within the span
 * @returns Result of the callback
 */
export async function traceOperation<T>(
    operationName: string,
    options: {
        resource?: string;
        tags?: Record<string, string>;
    },
    callback: () => Promise<T>,
): Promise<T> {
    const span = tracer.startSpan(operationName);

    if (options.resource) {
        span.setTag('resource.name', options.resource);
    }

    if (options.tags) {
        for (const [key, value] of Object.entries(options.tags)) {
            span.setTag(key, value);
        }
    }

    try {
        const result = await callback();
        span.finish();
        return result;
    } catch (error) {
        span.setTag('error', true);
        span.setTag('error.message', error instanceof Error ? error.message : String(error));
        span.finish();
        throw error;
    }
}

/**
 * Add custom tags to the current active span
 *
 * @param tags - Tags to add
 */
export function addTags(tags: Record<string, string | number | boolean>): void {
    const span = tracer.scope().active();
    if (span) {
        for (const [key, value] of Object.entries(tags)) {
            span.setTag(key, value);
        }
    }
}

/**
 * Flush all pending Datadog traces
 * Should be called before application shutdown
 *
 * Note: dd-trace automatically flushes on process exit
 * This is a no-op placeholder for consistency with shutdown handlers
 */
export async function flushDatadog(): Promise<void> {
    // dd-trace automatically flushes traces on process exit
    // No explicit flush method is needed
    return Promise.resolve();
}
