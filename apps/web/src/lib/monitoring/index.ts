/**
 * Central monitoring initialization
 * This file initializes all monitoring services (Sentry, Datadog, OpenTelemetry, Web Vitals)
 * All services are opt-in via environment variables
 */

import { initWebVitals } from '../performance/web-vitals';
import { clearDatadogUser, initDatadog, setDatadogUser } from './datadog';
import { initOpenTelemetry } from './opentelemetry';
import { clearSentryUser, initSentry, setSentryUser } from './sentry';

/**
 * Initialize all monitoring services
 * Call this as early as possible in your app lifecycle
 */
export function initMonitoring(): void {
  console.log('[Monitoring] Initializing...');

  initSentry();
  initDatadog();
  initOpenTelemetry();
  initWebVitals();

  console.log('[Monitoring] Initialization complete');
}

/**
 * Set user context across all monitoring services
 */
export function setMonitoringUser(user: {
  id: string;
  email?: string;
  username?: string;
  name?: string;
}): void {
  setSentryUser(user);
  setDatadogUser(user);
}

/**
 * Clear user context from all monitoring services
 */
export function clearMonitoringUser(): void {
  clearSentryUser();
  clearDatadogUser();
}

export * from '../performance/web-vitals';
export * from './datadog';
export * from './opentelemetry';
export * from './sentry';
