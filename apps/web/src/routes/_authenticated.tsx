import { createFileRoute, Navigate } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/features/auth/stores/auth-context';

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <DashboardLayout />;
}

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});
