# Grafana Dashboard Guide

Complete guide on how to view and use Grafana dashboards to visualize your metrics.

## Quick Start: Viewing Your Dashboard

### Step 1: Access Your Dashboard

1. **Open Grafana:** http://localhost:3001
2. **Login:**
   - Username: `admin`
   - Password: `admin`

3. **Navigate to Dashboards:**
   - Click **📊 Dashboards** (left sidebar)
   - Click **"Browse"** or **"Manage"**
   - Find your dashboard in the list
   - Click on it to open

### Step 2: Verify Data Source

Before viewing visualizations, make sure Prometheus data source is configured:

1. **Check Data Source:**
   - Click ⚙️ (Configuration) → **Data Sources**
   - You should see **Prometheus** listed
   - Click on it to verify it's working

2. **Test Connection:**
   - Click **"Save & Test"**
   - Should see: ✅ "Data source is working"

### Step 3: View Visualizations

Once your dashboard is open:

1. **Check Time Range:**
   - Top right corner shows time range (e.g., "Last 5 minutes")
   - Click to change: "Last 1 hour", "Last 6 hours", etc.
   - **Important:** Make sure you're looking at a time range where data exists

2. **Refresh Dashboard:**
   - Click **🔄 Refresh** button (top right)
   - Or press `F5` to refresh
   - Auto-refresh: Click refresh dropdown → Select interval (e.g., "10s")

3. **View Panels:**
   - Each panel shows a different metric
   - Panels should display graphs, tables, or stats
   - If you see "No data", see troubleshooting below

## Common Issues: "No Data" in Panels

### Issue 1: No Metrics Being Collected

**Symptom:** All panels show "No data"

**Solution:**
1. **Check if your API is running:**
   ```bash
   curl http://localhost:3010/metrics
   ```
   Should return Prometheus metrics

2. **Check if Prometheus is scraping:**
   - Go to: http://localhost:9090/targets
   - Should see `ecommerce-api` as **UP** (green)
   - If **DOWN** (red), check the error message

3. **Check if metrics exist:**
   - Go to: http://localhost:9090/graph
   - Try query: `http_requests_total`
   - Should see data points

### Issue 2: Wrong Time Range

**Symptom:** Dashboard shows "No data" but metrics exist

**Solution:**
1. **Change time range:**
   - Click time range selector (top right)
   - Select: **"Last 5 minutes"** or **"Last 1 hour"**
   - Click **"Apply"**

2. **Check if data exists in that range:**
   - In Prometheus (http://localhost:9090/graph)
   - Try: `http_requests_total[5m]`
   - Should see data

### Issue 3: Wrong Query

**Symptom:** Panel shows "No data" but other panels work

**Solution:**
1. **Edit the panel:**
   - Click panel title → **Edit**
   - Check the **Query** tab
   - Verify the PromQL query is correct

2. **Test query in Prometheus:**
   - Copy the query
   - Paste in Prometheus: http://localhost:9090/graph
   - See if it returns data

### Issue 4: Data Source Not Selected

**Symptom:** Panel shows "No data source"

**Solution:**
1. **Edit panel:**
   - Click panel title → **Edit**
   - In **Query** tab, check **Data source** dropdown
   - Should be set to **Prometheus**

## Creating a Simple Dashboard Panel

If you want to create a new panel:

### Step 1: Create New Panel

1. **In your dashboard:**
   - Click **"Add"** → **"Visualization"**
   - Or click **"Add panel"** → **"Add new panel"**

### Step 2: Configure Query

1. **Select Data Source:**
   - In **Query** tab, select **Prometheus**

2. **Enter PromQL Query:**
   ```
   # Example: Request rate
   rate(http_requests_total[5m])
   
   # Example: Response time
   histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
   
   # Example: Error rate
   rate(http_request_errors_total[5m])
   ```

3. **Test Query:**
   - Click **"Run query"** button
   - Should see data in the graph below

### Step 3: Configure Visualization

1. **Select Visualization Type:**
   - Right panel → **Visualization** dropdown
   - Choose: **Time series**, **Stat**, **Table**, etc.

2. **Customize:**
   - **Title:** Set panel title
   - **Legend:** Configure legend format
   - **Axes:** Set Y-axis labels and units

### Step 4: Save Panel

1. **Click "Apply"** (top right)
2. **Click "Save dashboard"** (top right)
3. **Enter dashboard name** (if new)

## Example Queries for Your Dashboard

### Request Rate
```promql
rate(http_requests_total[5m])
```
**Legend:** `{{method}} {{route}}`

### Response Time (P95)
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```
**Legend:** `P95 - {{route}}`
**Unit:** Seconds

### Error Rate
```promql
rate(http_request_errors_total[5m])
```
**Legend:** `{{method}} {{route}} ({{status_code}})`

### Memory Usage
```promql
nodejs_nodejs_heap_size_used_bytes
```
**Legend:** `Memory Used`
**Unit:** Bytes

### CPU Usage
```promql
rate(nodejs_process_cpu_seconds_total[5m]) * 100
```
**Legend:** `CPU Usage %`
**Unit:** Percent (0-100)

### Event Loop Lag
```promql
nodejs_nodejs_eventloop_lag_seconds
```
**Legend:** `Event Loop Lag`
**Unit:** Seconds

## Viewing Different Metrics

### By Endpoint
```promql
# Requests per endpoint
sum by (route) (rate(http_requests_total[5m]))
```

### By HTTP Method
```promql
# Requests by method
sum by (method) (rate(http_requests_total[5m]))
```

### By Status Code
```promql
# Requests by status code
sum by (status_code) (rate(http_requests_total[5m]))
```

### Error Percentage
```promql
# Error percentage
(rate(http_request_errors_total[5m]) / rate(http_requests_total[5m])) * 100
```

## Dashboard Best Practices

### 1. Time Range
- **Development:** Use "Last 5 minutes" or "Last 1 hour"
- **Production:** Use "Last 6 hours" or "Last 24 hours"

### 2. Refresh Interval
- **Development:** 10 seconds
- **Production:** 30 seconds or 1 minute

### 3. Panel Organization
- **Top row:** Key metrics (request rate, error rate)
- **Middle row:** Performance metrics (response time, CPU, memory)
- **Bottom row:** Detailed metrics (by endpoint, by method)

### 4. Alerts
- Set up alerts for critical metrics
- Error rate > threshold
- Response time > threshold
- Memory usage > threshold

## Troubleshooting Checklist

✅ **API is running** - `curl http://localhost:3010/metrics` returns data
✅ **Prometheus is running** - http://localhost:9090 is accessible
✅ **Prometheus is scraping** - http://localhost:9090/targets shows UP
✅ **Grafana is running** - http://localhost:3001 is accessible
✅ **Data source configured** - Prometheus data source is working
✅ **Time range correct** - Looking at time range with data
✅ **Queries are correct** - Test queries in Prometheus first
✅ **Dashboard refreshed** - Click refresh or wait for auto-refresh

## Quick Test

To quickly verify everything is working:

1. **Generate some traffic:**
   ```bash
   # Make some API calls
   curl http://localhost:3010/api/v1/health
   curl http://localhost:3010/api/v1/products
   ```

2. **Check Prometheus:**
   - Go to: http://localhost:9090/graph
   - Query: `rate(http_requests_total[1m])`
   - Should see data

3. **Check Grafana:**
   - Open your dashboard
   - Should see metrics appear

## Import Pre-configured Dashboard

If you want to use the pre-configured dashboard:

1. **In Grafana:**
   - Click ➕ (Create) → **Import**
   - Click **"Upload JSON file"**
   - Select: `grafana/dashboards/ecommerce-api.json`
   - Select **Prometheus** as data source
   - Click **"Import"**

2. **View Dashboard:**
   - Dashboard should open automatically
   - You should see panels with metrics

## Next Steps

1. **Customize panels** - Adjust queries, colors, thresholds
2. **Add more panels** - Track additional metrics
3. **Set up alerts** - Get notified of issues
4. **Create multiple dashboards** - Different views for different purposes

---

**Need help?** Check the troubleshooting section or verify each step in the checklist above.
