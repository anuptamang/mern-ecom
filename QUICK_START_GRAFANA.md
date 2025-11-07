# Quick Start: Grafana Setup

Get Grafana up and running in 5 minutes!

## Step 1: Install Prometheus & Grafana

```bash
# Install Prometheus
brew install prometheus

# Install Grafana
brew install grafana
```

## Step 2: Start Monitoring Stack

```bash
# Using npm script (recommended)
npm run start-monitoring

# Or using the script directly
./scripts/start-monitoring.sh
```

Or manually:

```bash
# Terminal 1: Start Prometheus
cd prometheus
prometheus --config.file=prometheus.yml --storage.tsdb.path=./data

# Terminal 2: Start Grafana
brew services start grafana
```

## Step 3: Access Grafana

1. **Open Grafana:** http://localhost:3001 (port 3000 is used by React app)
2. **Login:**
   - Username: `admin`
   - Password: `admin`
   - (You'll be prompted to change password - optional)

## Step 4: Add Prometheus Data Source

1. Click ⚙️ (Configuration) → **Data Sources**
2. Click **"Add data source"**
3. Select **"Prometheus"**
4. Configure:
   - **URL:** `http://localhost:9090`
   - **Access:** Server (default)
5. Click **"Save & Test"**
   - Should see: ✅ "Data source is working"

## Step 5: Import Dashboard

1. Click ➕ (Create) → **Import**
2. Click **"Upload JSON file"**
3. Select: `grafana/dashboards/ecommerce-api.json`
4. Select **Prometheus** as data source
5. Click **"Import"**

## Step 6: Verify Metrics

1. **Check Prometheus:** http://localhost:9090
   - Go to **Status → Targets**
   - Should see `ecommerce-api` as **UP**

2. **Test Query in Prometheus:**
   - Go to http://localhost:9090/graph
   - Try: `rate(http_requests_total[5m])`
   - Should see data

3. **View Dashboard in Grafana:**
   - You should see graphs with metrics!

## Troubleshooting

### No data in Grafana?

1. **Check if API is running:**
   ```bash
   curl http://localhost:3010/metrics
   ```

2. **Check Prometheus targets:**
   - http://localhost:9090/targets
   - Should see `ecommerce-api` as UP

3. **Check time range in Grafana:**
   - Make sure you're looking at "Last 5 minutes" or "Last 1 hour"

### Prometheus can't scrape?

1. **Check if metrics endpoint is accessible:**
   ```bash
   curl http://localhost:3010/metrics | head -20
   ```

2. **Check Prometheus config:**
   - Verify `prometheus/prometheus.yml` has correct target URL

### Grafana won't start?

```bash
# Check if already running
brew services list | grep grafana

# Restart Grafana
brew services restart grafana
```

## What You'll See

Once set up, you'll see:

- **Request Rate** - Requests per second
- **Response Time** - P95 response times
- **Error Rate** - Errors per second
- **Memory Usage** - Heap memory usage
- **CPU Usage** - CPU percentage
- **Event Loop Lag** - Event loop delay
- **Top Endpoints** - Most requested endpoints

## Next Steps

- Customize dashboards
- Set up alerts
- Add more metrics
- Monitor in production

See [GRAFANA_SETUP.md](./GRAFANA_SETUP.md) for detailed documentation.
