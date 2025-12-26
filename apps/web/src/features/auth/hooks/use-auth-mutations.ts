import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { clearAuth } from '@/lib/api/client';
import { login, logout as logoutApi, register } from '../api/auth-api';
import { useAuth } from '../stores/auth-context';

/**
 * Hook for login mutation
 */
export function useLogin() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser({
        ...data.user,
        authProvider: data.user.authProvider ?? null,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      toast.success('Login successful!');
      navigate({ to: '/dashboard' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

/**
 * Hook for register mutation
 */
export function useRegister() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setUser({
        ...data.user,
        authProvider: data.user.authProvider ?? null,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      toast.success('Registration successful!');
      navigate({ to: '/dashboard' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
}

/**
 * Hook for logout mutation
 */
export function useLogout() {
  const { logout: logoutContext } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await logoutApi();
      } catch (error) {
        console.error('Logout API error:', error);
      }
    },
    onSuccess: () => {
      logoutContext();
      clearAuth();

      queryClient.clear();

      toast.success('Logged out successfully');
      navigate({ to: '/login' });
    },
  });
}
