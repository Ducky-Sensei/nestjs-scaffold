import { createFileRoute } from '@tanstack/react-router';
import { Activity, CheckCircle, Database, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHealthCheck } from '@/features/health/hooks/use-health';

function HealthPage() {
  const { data: health, isLoading, isError, refetch, dataUpdatedAt } = useHealthCheck();

  const getStatusColor = (status: 'ok' | 'error' | 'up' | 'down') => {
    if (status === 'ok' || status === 'up') return 'success';
    return 'destructive';
  };

  const getStatusIcon = (status: 'ok' | 'error' | 'up' | 'down') => {
    if (status === 'ok' || status === 'up') {
      return <CheckCircle className="h-5 w-5 text-primary" />;
    }
    return <XCircle className="h-5 w-5 text-destructive" />;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Real-time monitoring of backend services</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Activity className="h-4 w-4" />
            <span>
              Auto-refreshing every 30 seconds • Last updated: {formatTimestamp(dataUpdatedAt)}
            </span>
          </div>
        </CardContent>
      </Card>

      {isLoading && !health && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <Card className="border-destructive/20">
          <CardContent className="py-12 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold text-destructive">
              Failed to fetch health status
            </h3>
            <p className="mt-2 text-sm text-destructive/80">
              Unable to connect to the backend. Please check if the server is running.
            </p>
            <Button className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {health && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Overall Status
              </CardTitle>
              <CardDescription>System-wide health status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {getStatusIcon(health.status)}
                <div>
                  <Badge variant={getStatusColor(health.status)} className="text-base">
                    {health.status.toUpperCase()}
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {health.status === 'ok'
                      ? 'All systems operational'
                      : 'Some systems are experiencing issues'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {health.details.database && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database
                </CardTitle>
                <CardDescription>Database connectivity status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {getStatusIcon(health.details.database.status)}
                  <div>
                    <Badge
                      variant={getStatusColor(health.details.database.status)}
                      className="text-base"
                    >
                      {health.details.database.status.toUpperCase()}
                    </Badge>
                    {health.details.database.message && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {health.details.database.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Health Check Details</CardTitle>
              <CardDescription>Detailed system health information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(health.info).length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-primary">Healthy Services</h4>
                    <div className="space-y-2">
                      {Object.entries(health.info).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-lg border bg-primary/5 p-3"
                        >
                          <span className="text-sm font-medium capitalize">{key}</span>
                          <Badge variant="success">{value.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(health.error).length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-destructive">
                      Services with Issues
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(health.error).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-lg border bg-destructive/5 p-3"
                        >
                          <div>
                            <span className="text-sm font-medium capitalize">{key}</span>
                            {value.message && (
                              <p className="text-xs text-destructive/80">{value.message}</p>
                            )}
                          </div>
                          <Badge variant="destructive">{value.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(health.info).length === 0 &&
                  Object.keys(health.error).length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      No detailed health information available
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/health')({
  component: HealthPage,
});
