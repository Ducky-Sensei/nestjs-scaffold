import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type { HealthCheckResult } from '@/types/health';

/**
 * Get combined health check
 */
export const getHealthCheck = async (): Promise<HealthCheckResult> => {
  const response = await apiClient.get<HealthCheckResult>(API_ENDPOINTS.HEALTH.COMBINED);
  return response.data;
};

/**
 * Get readiness probe
 */
export const getReadinessCheck = async (): Promise<HealthCheckResult> => {
  const response = await apiClient.get<HealthCheckResult>(API_ENDPOINTS.HEALTH.READY);
  return response.data;
};

/**
 * Get liveness probe
 */
export const getLivenessCheck = async (): Promise<HealthCheckResult> => {
  const response = await apiClient.get<HealthCheckResult>(API_ENDPOINTS.HEALTH.LIVE);
  return response.data;
};
