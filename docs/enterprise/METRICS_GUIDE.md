# Prometheus Metrics Guide

## What Are Prometheus Metrics?

Prometheus metrics are **time-series data** that track the performance and health of your application. They help you:

- **Monitor Performance** - Track response times, request rates, error rates
- **Detect Issues** - Identify memory leaks, CPU spikes, slow endpoints
- **Track Business Metrics** - Monitor orders, revenue, user activity
- **Set Up Alerts** - Get notified when something goes wrong
- **Visualize Data** - Create dashboards with Grafana

## What You're Seeing

The `/metrics` endpoint returns **Prometheus-formatted text** that contains:

### 1. **Node.js System Metrics** (Default)

These are automatically collected by `prom-client`:

#### CPU Metrics

- `nodejs_process_cpu_user_seconds_total` - Total CPU time used by your app
- `nodejs_process_cpu_system_seconds_total` - CPU time used by system calls
- `nodejs_process_cpu_seconds_total` - Total CPU time (user + system)

**What it tells you:**

- High CPU usage = Your app is working hard (might need optimization)
- Sudden spikes = Something is consuming resources

#### Memory Metrics

- `nodejs_process_resident_memory_bytes` - RAM used by your app (132MB in your case)
- `nodejs_nodejs_heap_size_total_bytes` - Total heap memory allocated
- `nodejs_nodejs_heap_size_used_bytes` - Heap memory actually used
- `nodejs_nodejs_external_memory_bytes` - Memory used by C++ objects

**What it tells you:**

- Memory growing over time = Possible memory leak
- High heap usage = Might need garbage collection optimization
- External memory = Native modules (MongoDB driver, etc.)

#### Event Loop Metrics

- `nodejs_nodejs_eventloop_lag_seconds` - How delayed your event loop is
- `nodejs_nodejs_eventloop_lag_p50/p90/p99` - Percentiles (50th, 90th, 99th)

**What it tells you:**

- High lag = Your app is blocking the event loop (bad!)
- P99 > 100ms = Some operations are too slow
- Increasing lag = Performance degradation

#### Garbage Collection Metrics

- `nodejs_nodejs_gc_duration_seconds` - Time spent in garbage collection
- Histogram buckets show GC duration distribution

**What it tells you:**

- Frequent GC = Memory pressure
- Long GC pauses = Application freezes (bad user experience)

### 2. **Custom HTTP Metrics** (Your Application)

These track your API performance:

#### Request Metrics

- `http_request_duration_seconds` - How long each request takes
- `http_requests_total` - Total number of requests
- `http_request_errors_total` - Number of errors (4xx, 5xx)
- `http_request_size_bytes` - Size of incoming requests
- `http_response_size_bytes` - Size of outgoing responses

**Labels:**

- `method` - GET, POST, PUT, DELETE
- `route` - `/api/v1/products`, `/api/v1/orders`, etc.
- `status_code` - 200, 404, 500, etc.

**What it tells you:**

- Which endpoints are slow
- Which endpoints have errors
- Request/response sizes (bandwidth usage)
- Traffic patterns

### 3. **Business Metrics** (E-Commerce Specific)

- `orders_total` - Total orders created
- `revenue_total` - Total revenue (in cents)

**What it tells you:**

- Sales trends
- Order volume
- Revenue tracking

## How to Use These Metrics

### Option 1: Direct Browser Access (Development)

```bash
# View metrics in browser
open http://localhost:3010/metrics

# Or using curl
curl http://localhost:3010/metrics
```

**Use cases:**

- Quick health check
- Debugging performance issues
- Manual inspection

### Option 2: Prometheus + Grafana (Production)

#### Step 1: Install Prometheus

```bash
# Using Homebrew (macOS)
brew install prometheus

# Or download from https://prometheus.io/download/
```

#### Step 2: Configure Prometheus

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s # Scrape metrics every 15 seconds

scrape_configs:
  - job_name: "ecommerce-api"
    static_configs:
      - targets: ["localhost:3010"]
    metrics_path: "/metrics"
    scrape_interval: 15s
```

#### Step 3: Start Prometheus

```bash
prometheus --config.file=prometheus.yml
```

Access Prometheus UI: `http://localhost:9090`

#### Step 4: Install Grafana

```bash
# Using Homebrew (macOS)
brew install grafana

# Or download from https://grafana.com/grafana/download
```

#### Step 5: Start Grafana

```bash
brew services start grafana
# Or: grafana-server
```

Access Grafana UI: `http://localhost:3001` (port 3000 is used by React app)

- Default username: `admin`
- Default password: `admin`

#### Step 6: Add Prometheus Data Source

1. Go to Grafana → Configuration → Data Sources
2. Add Prometheus
3. URL: `http://localhost:9090`
4. Save & Test

#### Step 7: Create Dashboards

**Example Queries:**

```promql
# Request rate (requests per second)
rate(http_requests_total[5m])

# Error rate
rate(http_request_errors_total[5m])

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Memory usage
nodejs_nodejs_heap_size_used_bytes

# CPU usage
rate(nodejs_process_cpu_seconds_total[5m])

# Event loop lag
nodejs_nodejs_eventloop_lag_seconds
```

### Option 3: Cloud Monitoring Services

#### Datadog

- Add Prometheus endpoint as custom metric source
- Automatic dashboard creation

#### New Relic

- Prometheus integration available
- Automatic alerting

#### AWS CloudWatch

- Use Prometheus exporter for CloudWatch
- Native AWS integration

## Key Metrics to Monitor

### 1. **Performance Metrics**

```promql
# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# P95 response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Requests per second
rate(http_requests_total[5m])
```

### 2. **Error Metrics**

```promql
# Error rate
rate(http_request_errors_total[5m])

# Error percentage
(rate(http_request_errors_total[5m]) / rate(http_requests_total[5m])) * 100
```

### 3. **Resource Metrics**

```promql
# Memory usage
nodejs_nodejs_heap_size_used_bytes / nodejs_nodejs_heap_size_total_bytes * 100

# CPU usage
rate(nodejs_process_cpu_seconds_total[5m]) * 100

# Event loop lag
nodejs_nodejs_eventloop_lag_seconds
```

### 4. **Business Metrics**

```promql
# Orders per minute
rate(orders_total[1m])

# Revenue per hour
rate(revenue_total[1h])
```

## Setting Up Alerts

### Example Alert Rules (`alerts.yml`)

```yaml
groups:
  - name: ecommerce_alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_request_errors_total[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/second"

      # Slow response time
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        annotations:
          summary: "Slow API response time"
          description: "P95 response time is {{ $value }} seconds"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (nodejs_nodejs_heap_size_used_bytes / nodejs_nodejs_heap_size_total_bytes) > 0.9
        for: 5m
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      # Event loop lag
      - alert: HighEventLoopLag
        expr: nodejs_nodejs_eventloop_lag_seconds > 0.1
        for: 5m
        annotations:
          summary: "High event loop lag"
          description: "Event loop lag is {{ $value }} seconds"
```

## Real-World Use Cases

### 1. **Performance Optimization**

- Identify slow endpoints
- Track response time improvements
- Monitor after code changes

### 2. **Capacity Planning**

- Track request rates over time
- Plan for traffic spikes
- Right-size your infrastructure

### 3. **Debugging Issues**

- Correlate errors with metrics
- Identify memory leaks
- Find performance bottlenecks

### 4. **Business Intelligence**

- Track sales trends
- Monitor order volume
- Revenue analytics

### 5. **SLA Monitoring**

- Track uptime
- Monitor response time SLAs
- Error rate SLAs

## Example Dashboard Panels

### 1. **Request Rate Panel**

```
Panel Type: Graph
Query: rate(http_requests_total[5m])
Title: Requests per Second
```

### 2. **Response Time Panel**

```
Panel Type: Graph
Query: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
Title: P95 Response Time
```

### 3. **Error Rate Panel**

```
Panel Type: Graph
Query: rate(http_request_errors_total[5m])
Title: Error Rate
```

### 4. **Memory Usage Panel**

```
Panel Type: Graph
Query: nodejs_nodejs_heap_size_used_bytes
Title: Memory Usage
```

### 5. **Top Endpoints Panel**

```
Panel Type: Table
Query: topk(10, sum by (route) (rate(http_requests_total[5m])))
Title: Top 10 Endpoints by Request Rate
```

## Quick Start Commands

```bash
# View metrics
curl http://localhost:3010/metrics

# Filter specific metric
curl http://localhost:3010/metrics | grep "http_requests_total"

# Count requests
curl http://localhost:3010/metrics | grep "http_requests_total" | grep "status_code=\"200\""

# Check memory
curl http://localhost:3010/metrics | grep "heap_size_used_bytes"
```

## Production Considerations

### 1. **Security**

- ✅ Metrics endpoint is protected in production
- ✅ Use authentication for Prometheus scraping
- ✅ Consider IP whitelisting

### 2. **Performance**

- Metrics collection has minimal overhead
- Use sampling for high-traffic endpoints
- Consider metric retention policies

### 3. **Storage**

- Prometheus stores metrics for 15 days by default
- Use long-term storage (Thanos, Cortex) for longer retention
- Consider metric cardinality (too many unique labels = high storage)

## Next Steps

1. **Set up Prometheus** - Start collecting metrics
2. **Create Grafana dashboards** - Visualize your metrics
3. **Set up alerts** - Get notified of issues
4. **Add custom metrics** - Track business-specific metrics
5. **Monitor in production** - Keep an eye on your application health

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Node.js Metrics Best Practices](https://prometheus.io/docs/instrumenting/exporters/)

---

**Summary**: Prometheus metrics give you **visibility** into your application's performance, health, and business metrics. Use them to monitor, debug, and optimize your e-commerce platform!
