import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/auth-api';
import { useAuth } from '../stores/auth-context';

/**
 * Hook to fetch current user data
 * Only runs when user is authenticated
 */
export function useCurrentUser() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}
