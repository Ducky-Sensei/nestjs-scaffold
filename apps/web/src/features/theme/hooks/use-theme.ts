import { useQuery } from '@tanstack/react-query';
import { getCustomerTheme, getThemeById, listThemes } from '../api/theme-api';

/**
 * Query keys for theme-related queries
 */
export const themeKeys = {
  all: ['themes'] as const,
  lists: () => [...themeKeys.all, 'list'] as const,
  list: () => [...themeKeys.lists()] as const,
  details: () => [...themeKeys.all, 'detail'] as const,
  detail: (id: string) => [...themeKeys.details(), id] as const,
  customer: (customerId: string) => [...themeKeys.all, 'customer', customerId] as const,
};

/**
 * Hook to fetch a customer's theme
 */
export function useCustomerTheme(customerId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: themeKeys.customer(customerId || ''),
    queryFn: () => {
      if (!customerId) throw new Error('Customer ID is required');
      return getCustomerTheme(customerId);
    },
    enabled: !!customerId && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch a theme by ID
 */
export function useThemeById(themeId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: themeKeys.detail(themeId || ''),
    queryFn: () => {
      if (!themeId) throw new Error('Theme ID is required');
      return getThemeById(themeId);
    },
    enabled: !!themeId && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch all available themes
 */
export function useThemes() {
  return useQuery({
    queryKey: themeKeys.list(),
    queryFn: listThemes,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
