# Fixing "No Data" in Grafana Dashboard

## Problem: `http_requests_total` Returns 0 Series

If you see "Result series: 0" when querying `http_requests_total` in Prometheus, it means **no HTTP requests have been tracked yet**.

## Solution: Generate Metrics

### Step 1: Make API Requests

The metrics middleware only collects data **after requests are made**. You need to make some API calls first:

```bash
# Get your application token
APPLICATION_TOKEN=$(grep "^APPLICATION_TOKEN=" server/.env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

# Make some API requests
curl -H "X-API-Key: $APPLICATION_TOKEN" http://localhost:3010/api/v1/health
curl -H "X-API-Key: $APPLICATION_TOKEN" http://localhost:3010/api/v1/products?page=1
curl -H "X-API-Key: $APPLICATION_TOKEN" http://localhost:3010/api/v1/health
```

### Step 2: Use the Generate Metrics Script

I've created a script to automatically generate metrics:

```bash
# Generate metrics by making multiple API requests
npm run generate-metrics

# Or directly
./scripts/generate-metrics.sh
```

This will:
- Make 20 API requests to different endpoints
- Wait for metrics to update
- Show you if metrics are being collected

### Step 3: Verify Metrics in Prometheus

1. **Go to Prometheus:** http://localhost:9090/graph
2. **Try query:**
   ```
   http_requests_total
   ```
3. **Click Execute**
4. **Should see data** (if requests were made)

### Step 4: Check Grafana Dashboard

1. **Open Grafana:** http://localhost:3001
2. **Open your dashboard**
3. **Set time range:** "Last 5 minutes"
4. **Click refresh**
5. **Should see metrics!**

## Why "No Data"?

### Reason 1: No Requests Made Yet

**Problem:** Metrics are only collected when requests are made.

**Solution:** Make some API requests first.

### Reason 2: Wrong Time Range

**Problem:** Looking at a time range where no data exists.

**Solution:** 
- Set time range to "Last 5 minutes" or "Last 1 hour"
- Make sure you made requests within that time range

### Reason 3: Metrics Not Being Collected

**Problem:** Metrics middleware isn't working.

**Solution:**
1. Check if metrics endpoint works:
   ```bash
   curl http://localhost:3010/metrics | grep "http_requests_total"
   ```
2. Should see metric definitions (even if no data yet)
3. If not, check server logs

### Reason 4: Prometheus Not Scraping

**Problem:** Prometheus isn't collecting metrics from your API.

**Solution:**
1. Check Prometheus targets: http://localhost:9090/targets
2. Should see `ecommerce-api` as **UP** (green)
3. If **DOWN** (red), check the error message

## Quick Test Workflow

### 1. Generate Metrics
```bash
npm run generate-metrics
```

### 2. Check Prometheus
- Go to: http://localhost:9090/graph
- Query: `http_requests_total`
- Should see data

### 3. Check Grafana
- Go to: http://localhost:3001
- Open dashboard
- Set time: "Last 5 minutes"
- Click refresh
- Should see visualizations!

## Understanding Metrics Collection

### How Metrics Work

1. **Metrics middleware** is applied to all requests (line 64 in `server/index.js`)
2. **When a request is made**, the middleware:
   - Tracks request duration
   - Increments `http_requests_total`
   - Tracks errors (if any)
   - Records response size

3. **Metrics are exposed** at `/metrics` endpoint
4. **Prometheus scrapes** metrics every 15 seconds
5. **Grafana queries** Prometheus to display data

### Important Notes

- **Metrics only exist after requests are made**
- **Empty metrics** (no requests) = "No data" in Grafana
- **Make requests first**, then view dashboard
- **Time range matters** - look at time when requests were made

## Example: Complete Workflow

```bash
# 1. Start your server
cd server && npm run dev

# 2. Generate metrics
npm run generate-metrics

# 3. Check Prometheus
# Open: http://localhost:9090/graph
# Query: http_requests_total
# Should see data!

# 4. Check Grafana
# Open: http://localhost:3001
# Open dashboard
# Set time: "Last 5 minutes"
# Should see visualizations!
```

## Troubleshooting Checklist

✅ **Server is running** - `curl http://localhost:3010/health` works
✅ **Metrics endpoint works** - `curl http://localhost:3010/metrics` returns data
✅ **Requests were made** - Used `npm run generate-metrics` or made manual requests
✅ **Prometheus is scraping** - http://localhost:9090/targets shows UP
✅ **Time range is correct** - Looking at "Last 5 minutes" or when requests were made
✅ **Grafana data source works** - Test connection shows "Data source is working"
✅ **Dashboard refreshed** - Clicked refresh or auto-refresh is enabled

## Still No Data?

If you still see "No data" after making requests:

1. **Check Prometheus directly:**
   - http://localhost:9090/graph
   - Query: `http_requests_total`
   - If no data here, metrics aren't being collected

2. **Check server logs:**
   - Look for errors in server console
   - Check if metrics middleware is applied

3. **Verify metrics endpoint:**
   ```bash
   curl http://localhost:3010/metrics | grep "http_requests_total"
   ```
   - Should see metric definitions
   - Should see data if requests were made

4. **Check Prometheus targets:**
   - http://localhost:9090/targets
   - Should see `ecommerce-api` as UP
   - Check last scrape time

---

**Remember:** Metrics are only collected **after** requests are made. Make some API calls first, then check your dashboard!
