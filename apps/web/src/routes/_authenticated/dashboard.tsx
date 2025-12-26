import { createFileRoute } from '@tanstack/react-router';
import { Activity, CheckCircle, Package, User, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/stores/auth-context';
import { useHealthCheck } from '@/features/health/hooks/use-health';
import { useProducts } from '@/features/products/hooks/use-products';

function DashboardPage() {
  const { user } = useAuth();
  const { data: products } = useProducts();
  const { data: health } = useHealthCheck();

  const stats = [
    {
      title: 'Total Products',
      value: products?.length || 0,
      icon: Package,
      description: 'Active products in inventory',
    },
    {
      title: 'System Health',
      value: health?.status === 'ok' ? 'Healthy' : 'Issues',
      icon: Activity,
      description: 'Backend system status',
      badge: health?.status === 'ok' ? 'success' : 'destructive',
    },
    {
      title: 'Account Status',
      value: user?.isActive ? 'Active' : 'Inactive',
      icon: User,
      description: 'Your account status',
      badge: user?.isActive ? 'success' : 'warning',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.badge && (
                  <Badge variant={stat.badge as 'success' | 'destructive' | 'warning'}>
                    {stat.value}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Name:</span>
            <span className="text-sm text-muted-foreground">{user?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Auth Provider:</span>
            <span className="text-sm text-muted-foreground">
              {user?.authProvider || 'Email/Password'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            <div className="flex items-center gap-2">
              {user?.isActive ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Active</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">Inactive</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Member Since:</span>
            <span className="text-sm text-muted-foreground">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>

      {health && (
        <Card>
          <CardHeader>
            <CardTitle>System Health Status</CardTitle>
            <CardDescription>Real-time backend health monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Overall Status:</span>
                <Badge variant={health.status === 'ok' ? 'success' : 'destructive'}>
                  {health.status.toUpperCase()}
                </Badge>
              </div>
              {health.details.database && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Database:</span>
                  <Badge
                    variant={health.details.database.status === 'up' ? 'success' : 'destructive'}
                  >
                    {health.details.database.status.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});
