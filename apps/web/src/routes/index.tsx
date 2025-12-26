import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/stores/auth-context';

function IndexPage() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}

export const Route = createFileRoute('/')({
  component: IndexPage,
});
