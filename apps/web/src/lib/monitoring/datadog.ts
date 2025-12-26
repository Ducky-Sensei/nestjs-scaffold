import { datadogRum } from '@datadog/browser-rum';

/**
 * Initialize Datadog RUM (Real User Monitoring)
 * Opt-in with environment variables - disabled by default
 */
export function initDatadog(): void {
  const enabled = import.meta.env.VITE_DATADOG_ENABLED === 'true';

  if (!enabled) {
    console.log('[Datadog] RUM disabled (opt-in with VITE_DATADOG_ENABLED=true)');
    return;
  }

  const applicationId = import.meta.env.VITE_DATADOG_APPLICATION_ID;
  const clientToken = import.meta.env.VITE_DATADOG_CLIENT_TOKEN;

  if (!applicationId || !clientToken) {
    console.warn('[Datadog] Application ID or Client Token not configured, RUM disabled');
    return;
  }

  try {
    datadogRum.init({
      applicationId,
      clientToken,
      site: import.meta.env.VITE_DATADOG_SITE || 'datadoghq.com',
      service: import.meta.env.VITE_DATADOG_SERVICE || 'scaffold-fe',
      env: import.meta.env.VITE_DATADOG_ENV || 'development',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',

      sessionSampleRate: parseInt(import.meta.env.VITE_DATADOG_SESSION_SAMPLE_RATE || '100', 10),
      sessionReplaySampleRate: parseInt(
        import.meta.env.VITE_DATADOG_SESSION_REPLAY_SAMPLE_RATE || '20',
        10,
      ),
      trackUserInteractions: import.meta.env.VITE_DATADOG_TRACK_USER_INTERACTIONS !== 'false',
      trackResources: import.meta.env.VITE_DATADOG_TRACK_RESOURCES !== 'false',
      trackLongTasks: import.meta.env.VITE_DATADOG_TRACK_LONG_TASKS !== 'false',

      defaultPrivacyLevel: 'mask-user-input',

      // Before send hook to filter sensitive data
      beforeSend: (event) => {
        // Remove sensitive data from events
        if (event.type === 'error' && event.error.message) {
          // Filter out specific error messages if needed
          if (event.error.message.includes('Authorization')) {
            return false;
          }
        }
        return true;
      },
    });

    datadogRum.startSessionReplayRecording();

    console.log('[Datadog] RUM initialized');
  } catch (error) {
    console.error('[Datadog] Failed to initialize:', error);
  }
}

/**
 * Set user context for Datadog
 */
export function setDatadogUser(user: { id: string; email?: string; name?: string }): void {
  if (import.meta.env.VITE_DATADOG_ENABLED !== 'true') return;

  datadogRum.setUser({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}

/**
 * Clear user context from Datadog
 */
export function clearDatadogUser(): void {
  if (import.meta.env.VITE_DATADOG_ENABLED !== 'true') return;
  datadogRum.clearUser();
}

/**
 * Add custom action to Datadog
 */
export function addDatadogAction(name: string, context?: Record<string, unknown>): void {
  if (import.meta.env.VITE_DATADOG_ENABLED !== 'true') return;
  datadogRum.addAction(name, context);
}

/**
 * Add custom error to Datadog
 */
export function addDatadogError(
  error: Error,
  context?: Record<string, unknown>,
  source: 'network' | 'source' | 'console' | 'custom' = 'custom',
): void {
  if (import.meta.env.VITE_DATADOG_ENABLED !== 'true') {
    console.error(error, context);
    return;
  }

  datadogRum.addError(error, {
    ...context,
    source,
  });
}

/**
 * Add timing to Datadog
 */
export function addDatadogTiming(name: string, time?: number): void {
  if (import.meta.env.VITE_DATADOG_ENABLED !== 'true') return;
  datadogRum.addTiming(name, time);
}

/**
 * Set global context for all RUM events
 */
export function setDatadogGlobalContext(key: string, value: unknown): void {
  if (import.meta.env.VITE_DATADOG_ENABLED !== 'true') return;
  datadogRum.setGlobalContextProperty(key, value);
}

/**
 * Remove global context property
 */
export function removeDatadogGlobalContext(key: string): void {
  if (import.meta.env.VITE_DATADOG_ENABLED !== 'true') return;
  datadogRum.removeGlobalContextProperty(key);
}

/**
 * Start a new view manually (useful for SPA routing)
 */
export function startDatadogView(name: string, context?: Record<string, unknown>): void {
  if (import.meta.env.VITE_DATADOG_ENABLED !== 'true') return;
  datadogRum.startView({ name, ...context });
}

/**
 * Export datadogRum for advanced usage
 */
export { datadogRum };
