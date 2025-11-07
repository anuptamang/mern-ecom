# Grafana Setup Guide

Complete guide to set up Grafana with Prometheus for visualizing your e-commerce API metrics.

## Prerequisites

- Node.js server running on `http://localhost:3010`
- Prometheus installed
- Grafana installed

## Step 1: Install Prometheus

### macOS (using Homebrew)
```bash
brew install prometheus
```

### Linux
```bash
# Download from https://prometheus.io/download/
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*
```

### Windows
Download from: https://prometheus.io/download/

## Step 2: Install Grafana

### macOS (using Homebrew)
```bash
brew install grafana
```

**Important:** Grafana will use port **3001** instead of 3000 (to avoid conflict with React app).

To start Grafana with custom port:
```bash
# Using the project's custom config (port 3001)
grafana-server --config=/path/to/project/grafana/grafana.ini

# Or configure Homebrew Grafana to use port 3001
# Edit: $(brew --prefix grafana)/etc/grafana/grafana.ini
# Set: http_port = 3001
# Then: brew services start grafana
```

### Linux
```bash
# Download from https://grafana.com/grafana/download
wget https://dl.grafana.com/enterprise/release/grafana-enterprise-10.0.0.linux-amd64.tar.gz
tar -zxvf grafana-enterprise-*.tar.gz
```

### Windows
Download from: https://grafana.com/grafana/download

## Step 3: Configure Prometheus

1. **Prometheus configuration is already created** at `prometheus/prometheus.yml`

2. **Start Prometheus:**
```bash
# From project root
cd prometheus
prometheus --config.file=prometheus.yml --storage.tsdb.path=./data
```

Or if installed via Homebrew:
```bash
prometheus --config.file=/Users/anupkumartamang/Documents/WORK/Edu/node-express-api/mern-ecom/prometheus/prometheus.yml --storage.tsdb.path=/Users/anupkumartamang/Documents/WORK/Edu/node-express-api/mern-ecom/prometheus/data
```

3. **Verify Prometheus is running:**
   - Open: http://localhost:9090
   - Go to Status → Targets
   - You should see `ecommerce-api` target as "UP"

4. **Test Prometheus queries:**
   - Go to http://localhost:9090/graph
   - Try: `rate(http_requests_total[5m])`
   - You should see metrics

## Step 4: Start Grafana

### macOS (using Homebrew)
```bash
brew services start grafana
```

### Linux
```bash
# Start Grafana
./bin/grafana-server
```

### Windows
Run `grafana-server.exe` from the Grafana installation directory

### Verify Grafana is running:
- Open: http://localhost:3001 (port 3000 is used by React app)
- Default username: `admin`
- Default password: `admin`
- You'll be prompted to change the password (optional)

## Step 5: Add Prometheus Data Source

1. **Login to Grafana** (http://localhost:3001 - port 3000 is used by React app)

2. **Add Data Source:**
   - Click ⚙️ (Configuration) → Data Sources
   - Click "Add data source"
   - Select "Prometheus"

3. **Configure Prometheus:**
   - **Name:** `Prometheus` (or any name)
   - **URL:** `http://localhost:9090`
   - **Access:** Server (default)
   - Click "Save & Test"
   - You should see "Data source is working"

## Step 6: Create Dashboard

### Option A: Import Pre-configured Dashboard

1. **In Grafana:**
   - Click ➕ (Create) → Import
   - Click "Upload JSON file"
   - Select `grafana/dashboards/ecommerce-api.json`
   - Select Prometheus as data source
   - Click "Import"

## Quick Start with npm Script

You can now start monitoring with a simple npm command:

```bash
# Start Prometheus and Grafana
npm run start-monitoring

# Or use the shorter alias
npm run monitoring
```

This will:
- ✅ Check if Prometheus and Grafana are installed
- ✅ Start Prometheus with your configuration
- ✅ Start Grafana service
- ✅ Display URLs and next steps

### Option B: Create Dashboard Manually

1. **Create New Dashboard:**
   - Click ➕ (Create) → Dashboard
   - Click "Add visualization"

2. **Add Panels:**

   **Panel 1: Request Rate**
   - Query: `rate(http_requests_total[5m])`
   - Legend: `{{method}} {{route}}`
   - Title: "Request Rate"
   - Y-axis: Requests/sec

   **Panel 2: Response Time (P95)**
   - Query: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
   - Legend: `P95 - {{route}}`
   - Title: "Response Time (P95)"
   - Y-axis: Seconds

   **Panel 3: Error Rate**
   - Query: `rate(http_request_errors_total[5m])`
   - Legend: `{{method}} {{route}}`
   - Title: "Error Rate"
   - Y-axis: Errors/sec

   **Panel 4: Memory Usage**
   - Query: `nodejs_nodejs_heap_size_used_bytes`
   - Legend: "Memory Used"
   - Title: "Memory Usage"
   - Y-axis: Bytes

   **Panel 5: CPU Usage**
   - Query: `rate(nodejs_process_cpu_seconds_total[5m]) * 100`
   - Legend: "CPU Usage %"
   - Title: "CPU Usage"
   - Y-axis: Percentage

   **Panel 6: Event Loop Lag**
   - Query: `nodejs_nodejs_eventloop_lag_seconds`
   - Legend: "Event Loop Lag"
   - Title: "Event Loop Lag"
   - Y-axis: Seconds

3. **Save Dashboard:**
   - Click "Save dashboard" (top right)
   - Name: "E-Commerce API Dashboard"
   - Folder: General (or create new folder)

## Step 7: Useful PromQL Queries

### Performance Metrics

```promql
# Request rate (requests per second)
rate(http_requests_total[5m])

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# P95 response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# P99 response time
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

### Error Metrics

```promql
# Error rate
rate(http_request_errors_total[5m])

# Error percentage
(rate(http_request_errors_total[5m]) / rate(http_requests_total[5m])) * 100

# Errors by status code
sum by (status_code) (rate(http_request_errors_total[5m]))
```

### Resource Metrics

```promql
# Memory usage percentage
(nodejs_nodejs_heap_size_used_bytes / nodejs_nodejs_heap_size_total_bytes) * 100

# CPU usage
rate(nodejs_process_cpu_seconds_total[5m]) * 100

# Event loop lag
nodejs_nodejs_eventloop_lag_seconds
```

### Business Metrics

```promql
# Orders per minute
rate(orders_total[1m])

# Revenue per hour
rate(revenue_total[1h])
```

## Step 8: Set Up Alerts (Optional)

1. **In Grafana:**
   - Go to Alerting → Alert Rules
   - Click "New alert rule"

2. **Example Alert: High Error Rate**
   - **Name:** High Error Rate
   - **Query:** `rate(http_request_errors_total[5m]) > 0.1`
   - **Condition:** When last is above 0.1
   - **Evaluation:** Every 1m, For 5m
   - **Notifications:** Add notification channel (email, Slack, etc.)

## Quick Start Script

Create a script to start everything:

```bash
#!/bin/bash
# start-monitoring.sh

echo "Starting Prometheus..."
cd prometheus
prometheus --config.file=prometheus.yml --storage.tsdb.path=./data &
PROMETHEUS_PID=$!

echo "Starting Grafana..."
brew services start grafana

echo "Prometheus PID: $PROMETHEUS_PID"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001 (port 3000 is used by React app)"
echo ""
echo "To stop Prometheus: kill $PROMETHEUS_PID"
echo "To stop Grafana: brew services stop grafana"
```

## Troubleshooting

### Prometheus can't scrape metrics

1. **Check if your API is running:**
   ```bash
   curl http://localhost:3010/metrics
   ```

2. **Check Prometheus targets:**
   - Go to http://localhost:9090/targets
   - Check if `ecommerce-api` is UP

3. **Check Prometheus logs:**
   - Look for connection errors
   - Verify the target URL is correct

### Grafana shows "No data"

1. **Check data source:**
   - Go to Configuration → Data Sources
   - Test the Prometheus connection

2. **Check time range:**
   - Make sure you're looking at the right time range
   - Try "Last 5 minutes"

3. **Check queries:**
   - Test queries in Prometheus first (http://localhost:9090/graph)
   - Copy working queries to Grafana

### Metrics not appearing

1. **Check if metrics endpoint is accessible:**
   ```bash
   curl http://localhost:3010/metrics | head -20
   ```

2. **Check Prometheus is scraping:**
   - Go to http://localhost:9090/targets
   - Check scrape status

3. **Check metric names:**
   - In Prometheus, go to http://localhost:9090/graph
   - Type `http_` and see available metrics

## Next Steps

1. **Customize dashboards** - Add more panels for your specific needs
2. **Set up alerts** - Get notified when issues occur
3. **Add more metrics** - Track business-specific metrics
4. **Set up retention** - Configure how long to keep metrics
5. **Add more services** - Monitor multiple services

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboard Examples](https://grafana.com/grafana/dashboards/)

---

**You're all set!** Your metrics are now being visualized in Grafana. 🎉
