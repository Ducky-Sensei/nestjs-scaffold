/**
 * Health Check Types
 */

export type HealthStatus = 'ok' | 'error';

export interface HealthIndicator {
  status: 'up' | 'down';
  message?: string;
}

export interface HealthCheckResult {
  status: HealthStatus;
  info: Record<string, HealthIndicator>;
  error: Record<string, HealthIndicator>;
  details: Record<string, HealthIndicator>;
}
