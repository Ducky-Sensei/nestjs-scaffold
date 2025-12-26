/**
 * OpenTelemetry Browser Tracing (Simplified)
 * Opt-in with environment variables - disabled by default
 *
 * Note: This is a simplified implementation. For production use with full
 * distributed tracing, configure OpenTelemetry according to your backend setup.
 */

let tracingEnabled = false;

/**
 * Initialize OpenTelemetry browser tracing
 * Opt-in with environment variables - disabled by default
 */
export function initOpenTelemetry(): void {
  const enabled = import.meta.env.VITE_OTEL_ENABLED === 'true';

  if (!enabled) {
    console.log('[OpenTelemetry] Tracing disabled (opt-in with VITE_OTEL_ENABLED=true)');
    return;
  }

  const endpoint = import.meta.env.VITE_OTEL_EXPORTER_ENDPOINT;
  if (!endpoint) {
    console.warn('[OpenTelemetry] Exporter endpoint not configured, tracing disabled');
    return;
  }

  try {
    tracingEnabled = true;
    console.log('[OpenTelemetry] Tracing initialized (simplified mode)');
    console.log(
      '[OpenTelemetry] For full tracing, configure OpenTelemetry SDK according to your setup',
    );
  } catch (error) {
    console.error('[OpenTelemetry] Failed to initialize:', error);
  }
}

/**
 * Get the tracer instance (placeholder for simplified mode)
 */
export function getTracer(name = 'scaffold-fe') {
  if (!tracingEnabled) {
    throw new Error('OpenTelemetry not initialized. Call initOpenTelemetry() first.');
  }
  console.log(`[OpenTelemetry] Tracer requested: ${name}`);
  return null;
}

/**
 * Create a custom span (simplified - logs only in this version)
 */
export function createSpan(
  name: string,
  callback: (span: unknown) => Promise<unknown> | unknown,
): Promise<unknown> | unknown {
  if (import.meta.env.VITE_OTEL_ENABLED !== 'true') {
    return callback(null);
  }

  try {
    console.log(`[OpenTelemetry] Span: ${name}`);
    return callback(null);
  } catch (_error) {
    return callback(null);
  }
}

/**
 * Shutdown OpenTelemetry gracefully (placeholder)
 */
export async function shutdownOpenTelemetry(): Promise<void> {
  if (!tracingEnabled) return;

  try {
    tracingEnabled = false;
    console.log('[OpenTelemetry] Shutdown complete');
  } catch (error) {
    console.error('[OpenTelemetry] Error during shutdown:', error);
  }
}

/**
 * NOTE: This is a simplified implementation for demonstration purposes.
 *
 * For production use with full OpenTelemetry support:
 * 1. Install the correct version-matched OpenTelemetry packages
 * 2. Configure the WebTracerProvider with proper span processors
 * 3. Set up auto-instrumentations for fetch/XHR
 * 4. Configure trace context propagation
 * 5. Connect to your OTLP collector endpoint
 *
 * See: https://opentelemetry.io/docs/instrumentation/js/getting-started/browser/
 */
