import { useQuery } from '@tanstack/react-query';
import { getHealthCheck, getLivenessCheck, getReadinessCheck } from '../api/health-api';

/**
 * Hook to fetch health check with auto-refresh
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health', 'combined'],
    queryFn: getHealthCheck,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    retry: 1,
  });
}

/**
 * Hook to fetch readiness check
 */
export function useReadinessCheck() {
  return useQuery({
    queryKey: ['health', 'ready'],
    queryFn: getReadinessCheck,
    retry: 1,
  });
}

/**
 * Hook to fetch liveness check
 */
export function useLivenessCheck() {
  return useQuery({
    queryKey: ['health', 'live'],
    queryFn: getLivenessCheck,
    retry: 1,
  });
}
