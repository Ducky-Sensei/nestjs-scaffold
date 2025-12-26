# Monitoring Setup Guide

This guide covers setting up Prometheus and Grafana for monitoring your NestJS application.

## Overview

The monitoring stack includes:
- **Prometheus**: Time-series database for metrics collection
- **Grafana**: Visualization and dashboards
- **Application Metrics**: Exposed via `/metrics` endpoint

## Architecture

```
┌─────────────────┐
│  Your App:3000  │ ◄─── HTTP requests
│   /metrics      │
└────────┬────────┘
         │ Scrapes every 10s
         ▼
┌─────────────────┐
│ Prometheus:9090 │ ◄─── Query metrics
└────────┬────────┘
         │ Data source
         ▼
┌─────────────────┐
│  Grafana:3001   │ ◄─── View dashboards
└─────────────────┘
```

## Quick Start

### 1. Enable Prometheus in Your Application

Update your `.env` file:
```bash
PROMETHEUS_ENABLED=true
PROMETHEUS_PATH=/metrics
PROMETHEUS_DEFAULT_METRICS=true
```

### 2. Start Your Application

```bash
pnpm dev
# or
pnpm start
```

Verify metrics are exposed:
```bash
curl http://localhost:3000/metrics
```

You should see Prometheus-formatted metrics output.

### 3. Start Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

This starts:
- Prometheus on `http://localhost:9090`
- Grafana on `http://localhost:3001`

### 4. Access Grafana

1. Open http://localhost:3001
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin`
3. (Optional) Change password when prompted

### 5. View Pre-configured Dashboard

1. Click on "Dashboards" (four squares icon) in the left sidebar
2. Select "Node.js Application Dashboard"
3. You should see live metrics from your application

## Services

### Prometheus (Port 9090)

**URL**: http://localhost:9090

**Features**:
- Query metrics using PromQL
- View targets and their status
- Configure alerting rules
- Explore time-series data

**Useful Pages**:
- `/targets` - View all scrape targets and their status
- `/graph` - Query and graph metrics
- `/config` - View current configuration

**Example Queries**:
```promql
# Heap memory usage
nodejs_heap_size_used_bytes

# Event loop lag rate
rate(nodejs_eventloop_lag_seconds[5m])

# Active HTTP connections
nodejs_active_handles

# CPU usage
rate(process_cpu_user_seconds_total[5m])

# Memory usage percentage
(nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes) * 100
```

### Grafana (Port 3001)

**URL**: http://localhost:3001

**Default Credentials**:
- Username: `admin`
- Password: `admin`

**Features**:
- Pre-configured Prometheus datasource
- Node.js application dashboard
- Create custom dashboards
- Set up alerts
- Share dashboards

## Configuration Files

### Prometheus Configuration

**File**: `monitoring/prometheus/prometheus.yml`

Key settings:
```yaml
scrape_configs:
  - job_name: 'scaffold-service'
    scrape_interval: 10s         # How often to scrape
    scrape_timeout: 5s           # Timeout for scraping
    metrics_path: '/metrics'     # Your app's metrics endpoint
    static_configs:
      - targets: ['host.docker.internal:3000']
```

**Adding More Targets**:
```yaml
scrape_configs:
  # Your existing config...

  - job_name: 'another-service'
    static_configs:
      - targets: ['host.docker.internal:4000']
        labels:
          service: 'another-service'
```

### Grafana Datasource

**File**: `monitoring/grafana/provisioning/datasources/prometheus.yml`

Automatically configures Prometheus as the default datasource.

### Dashboard Provisioning

**File**: `monitoring/grafana/provisioning/dashboards/default.yml`

Automatically loads dashboards from `monitoring/grafana/dashboards/`.

## Available Dashboards

### Node.js Application Dashboard

**File**: `monitoring/grafana/dashboards/nodejs-application-dashboard.json`

**Panels**:
1. **Memory Usage** - Heap used, total, and external memory
2. **Event Loop Lag** - Event loop latency
3. **Active Handles** - Open file descriptors, sockets
4. **Active Requests** - In-flight HTTP requests
5. **Resident Memory (RSS)** - Total process memory
6. **CPU Usage** - User CPU time
7. **Garbage Collection Duration** - GC performance by type

## Creating Custom Dashboards

### Option 1: Grafana UI

1. Click "+" → "Dashboard" → "Add new panel"
2. Select "Prometheus" as datasource
3. Write PromQL query
4. Configure visualization
5. Save dashboard

### Option 2: Import Dashboard

1. Click "+" → "Import"
2. Enter dashboard ID from https://grafana.com/grafana/dashboards/
3. Popular Node.js dashboards:
   - **11159**: Node.js Application Dashboard
   - **14058**: Node Exporter Full
   - **13978**: Node.js Metrics

### Option 3: Provision Dashboard

1. Create JSON file in `monitoring/grafana/dashboards/`
2. Restart Grafana or wait for auto-reload (30s)
3. Dashboard appears automatically

## Common Metrics

### Memory Metrics
```promql
# Heap usage percentage
(nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes) * 100

# Memory trend (last hour)
nodejs_heap_size_used_bytes[1h]

# Memory leak detection (increasing over time)
delta(nodejs_heap_size_used_bytes[1h]) > 0
```

### Performance Metrics
```promql
# Event loop lag (should be < 10ms)
nodejs_eventloop_lag_seconds

# GC frequency (collections per second)
rate(nodejs_gc_duration_seconds_count[5m])

# GC pause time
rate(nodejs_gc_duration_seconds_sum[5m])
```

### Application Metrics
```promql
# Active connections
nodejs_active_handles

# Process uptime
process_uptime_seconds

# CPU usage
rate(process_cpu_user_seconds_total[5m])
```

## Alerting

### Create Alert in Grafana

1. Open a dashboard panel
2. Click "Edit"
3. Go to "Alert" tab
4. Click "Create Alert"
5. Set threshold conditions
6. Configure notification channel

### Example Alerts

**High Memory Usage**:
```promql
(nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes) > 0.9
```
Triggers when heap is > 90% full.

**High Event Loop Lag**:
```promql
rate(nodejs_eventloop_lag_seconds[5m]) > 0.05
```
Triggers when event loop lag exceeds 50ms.

**High CPU Usage**:
```promql
rate(process_cpu_user_seconds_total[5m]) > 0.8
```
Triggers when CPU > 80%.

## Production Deployment

### Security Considerations

1. **Change Default Passwords**:
   ```yaml
   # docker-compose.monitoring.yml
   environment:
     - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
   ```

2. **Restrict Access**:
   - Use reverse proxy (nginx) with authentication
   - Enable Grafana authentication
   - Use network policies

3. **Enable HTTPS**:
   - Configure TLS certificates
   - Use secure connections

### Scaling Prometheus

For high-traffic applications:

1. **Increase Retention**:
   ```yaml
   command:
     - '--storage.tsdb.retention.time=90d'
   ```

2. **Adjust Scrape Intervals**:
   ```yaml
   scrape_interval: 30s  # Reduce frequency
   ```

3. **Use Remote Storage**:
   - Thanos
   - Cortex
   - Victoria Metrics

### High Availability

1. **Multiple Prometheus Instances**:
   - Run multiple Prometheus servers
   - Use federation or remote write

2. **Grafana HA**:
   - Use external database (PostgreSQL/MySQL)
   - Load balance multiple Grafana instances
   - Share dashboard storage

## Troubleshooting

### Metrics Not Showing in Grafana

1. **Check Prometheus is scraping**:
   - Visit http://localhost:9090/targets
   - Verify "scaffold-service" is UP
   - Check for error messages

2. **Verify application is exposing metrics**:
   ```bash
   curl http://localhost:3000/metrics
   ```

3. **Check Grafana datasource**:
   - Configuration → Data Sources → Prometheus
   - Click "Test" to verify connection

### Prometheus Can't Reach Application

**Problem**: Target shows as DOWN in Prometheus

**Solutions**:
1. Verify app is running on port 3000
2. Check `PROMETHEUS_ENABLED=true` in `.env`
3. On Linux, use `host.docker.internal` in prometheus.yml
4. On Windows/Mac, Docker Desktop handles this automatically

### High Memory Usage

**Problem**: Prometheus using too much memory

**Solutions**:
1. Reduce retention time:
   ```yaml
   - '--storage.tsdb.retention.time=15d'
   ```

2. Reduce scrape frequency:
   ```yaml
   scrape_interval: 30s
   ```

3. Limit metric cardinality (avoid high-cardinality labels)

### Dashboard Not Loading

**Problem**: Dashboard shows "No data"

**Solutions**:
1. Check time range (top-right corner)
2. Verify job label matches: `{job="scaffold-service"}`
3. Run query directly in Prometheus (/graph)
4. Check if metrics are being collected

## Adding Custom Metrics

### Counter Example

```typescript
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class AppService {
    constructor(
        @InjectMetric('http_requests_total')
        public counter: Counter<string>
    ) {}

    handleRequest() {
        this.counter.inc({ method: 'GET', path: '/' });
    }
}
```

### Histogram Example

```typescript
import { Histogram } from 'prom-client';

@Injectable()
export class AppService {
    constructor(
        @InjectMetric('http_request_duration_seconds')
        public histogram: Histogram<string>
    ) {}

    async handleRequest() {
        const end = this.histogram.startTimer();
        try {
            // Your logic here
        } finally {
            end({ method: 'GET', path: '/' });
        }
    }
}
```

### Gauge Example

```typescript
import { Gauge } from 'prom-client';

@Injectable()
export class QueueService {
    constructor(
        @InjectMetric('queue_size')
        public gauge: Gauge<string>
    ) {}

    updateQueueSize(size: number) {
        this.gauge.set(size);
    }
}
```

## Managing the Stack

### Start Services
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### Stop Services
```bash
docker-compose -f docker-compose.monitoring.yml down
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.monitoring.yml logs -f

# Prometheus only
docker-compose -f docker-compose.monitoring.yml logs -f prometheus

# Grafana only
docker-compose -f docker-compose.monitoring.yml logs -f grafana
```

### Restart Services
```bash
docker-compose -f docker-compose.monitoring.yml restart
```

### Remove All Data (Reset)
```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

**Warning**: This deletes all Prometheus data and Grafana dashboards!

## Resources

### Official Documentation
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)

### Grafana Dashboards
- [Grafana Dashboard Library](https://grafana.com/grafana/dashboards/)
- [Node.js Dashboards](https://grafana.com/grafana/dashboards/?search=nodejs)

### Learning Resources
- [Prometheus Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)

## Next Steps

1. **Explore Metrics**: Visit http://localhost:9090 and try queries
2. **Customize Dashboard**: Add panels for your specific needs
3. **Set Up Alerts**: Configure notifications for critical thresholds
4. **Add More Exporters**: PostgreSQL, Redis, nginx exporters
5. **Production Hardening**: Secure credentials, enable HTTPS, add auth
