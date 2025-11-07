# Setup Monitoring - Prometheus and Grafana Workflow

Complete setup workflow for metrics collection and visualization.

## Purpose
Configure Prometheus for metrics collection and Grafana for visualization dashboards.

## Prerequisites
- Docker and Docker Compose (for monitoring stack)
- Node.js server running with metrics endpoint

## Steps

### 1. Verify Metrics Endpoint

Check that metrics endpoint is accessible:

```bash
# Test metrics endpoint
curl http://localhost:3010/metrics

# Should return Prometheus metrics in plain text format
```

### 2. Start Monitoring Stack

```bash
# Start Prometheus and Grafana
npm run monitoring

# Or manually:
cd scripts
./start-monitoring.sh
```

### 3. Access Monitoring Tools

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (NOT 3000 - that's the frontend)
- **Metrics Endpoint**: http://localhost:3010/metrics

### 4. Configure Prometheus

Prometheus is pre-configured to scrape metrics from:
- `http://localhost:3010/metrics` (API server)

Configuration is in `prometheus/prometheus.yml`

### 5. Configure Grafana

1. **Login to Grafana**
   - URL: http://localhost:3001
   - Default username: `admin`
   - Default password: `admin` (change on first login)

2. **Add Prometheus Data Source**
   - Go to **Configuration** → **Data Sources**
   - Click **Add data source**
   - Select **Prometheus**
   - URL: `http://prometheus:9090` (or `http://localhost:9090` if not using Docker)
   - Click **Save & Test**

3. **Create Dashboard**
   - Go to **Dashboards** → **New Dashboard**
   - Add panels for:
     - HTTP Request Rate
     - HTTP Request Duration
     - Error Rate
     - Active Connections
     - Memory Usage
     - CPU Usage

### 6. Generate Sample Metrics

To populate Prometheus with data:

```bash
# Generate sample API traffic
npm run generate-metrics

# This makes requests to various endpoints to generate metrics
```

### 7. Verify Metrics Collection

1. **Check Prometheus**
   - Go to http://localhost:9090
   - Click **Graph** tab
   - Try query: `http_requests_total`
   - Should show metrics if requests have been made

2. **Check Grafana**
   - Go to http://localhost:3001
   - View your dashboard
   - Should show visualizations if metrics are collected

## Common Queries

### HTTP Request Rate
```
rate(http_requests_total[5m])
```

### HTTP Request Duration (p95)
```
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Error Rate
```
rate(http_requests_total{status=~"5.."}[5m])
```

### Active Connections
```
nodejs_nodejs_active_handles_total
```

### Memory Usage
```
nodejs_nodejs_heap_size_used_bytes
```

## Troubleshooting

### No Metrics Showing
1. Verify metrics endpoint is accessible: `curl http://localhost:3010/metrics`
2. Generate sample traffic: `npm run generate-metrics`
3. Check Prometheus targets: http://localhost:9090/targets
4. Verify Prometheus is scraping: Check logs

### Grafana Shows "No Data"
1. Verify Prometheus data source is configured correctly
2. Check that Prometheus has metrics: http://localhost:9090/graph
3. Verify time range in Grafana (try last 5 minutes)
4. Check query syntax in Grafana panels

### Prometheus Not Starting
1. Check if port 9090 is already in use
2. Verify `prometheus/prometheus.yml` exists
3. Check Docker logs: `docker-compose logs prometheus`

### Grafana Port Conflict
- Grafana runs on port 3001 (not 3000)
- If 3001 is in use, update `grafana/grafana.ini`

## Stop Monitoring

```bash
# Stop Prometheus and Grafana
# Find and kill processes:
lsof -ti:9090 | xargs kill  # Prometheus
lsof -ti:3001 | xargs kill  # Grafana

# Or if using Docker:
docker-compose down
```

## Production Monitoring

For production, consider:

1. **Persistent Storage**: Configure persistent volumes for Prometheus and Grafana
2. **Alerting**: Set up alert rules in Prometheus
3. **Grafana Alerts**: Configure alert notifications
4. **Retention**: Configure data retention policies
5. **Security**: Enable authentication for Grafana
6. **Backup**: Regular backups of Grafana dashboards

## Documentation
See `docs/enterprise/METRICS_GUIDE.md` for detailed monitoring documentation.
