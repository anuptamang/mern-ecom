# Grafana Configuration

Grafana is configured to run on **port 3001** to avoid conflict with the React frontend (port 3000).

## Configuration File

- `grafana.ini` - Custom Grafana configuration
  - Port: **3001** (instead of default 3000)
  - Data directory: `./data`
  - Logs directory: `./logs`

## Starting Grafana

### Option 1: Using npm script (Recommended)
```bash
npm run start-monitoring
```

### Option 2: Manual start with custom config
```bash
# From project root
grafana-server --config=./grafana/grafana.ini
```

### Option 3: Using Homebrew service (requires config change)
```bash
# Edit Homebrew Grafana config
nano $(brew --prefix grafana)/etc/grafana/grafana.ini

# Change: http_port = 3001

# Start service
brew services start grafana
```

## Access Grafana

- **URL:** http://localhost:3001
- **Username:** admin
- **Password:** admin

## Dashboards

- `dashboards/ecommerce-api.json` - Pre-configured dashboard for e-commerce API metrics

## Port Conflict

If you see "port 3000 already in use":
- ✅ Grafana is configured to use port **3001**
- ✅ React app uses port **3000**
- ✅ No conflict!

## Troubleshooting

### Grafana won't start on port 3001

1. **Check if port 3001 is available:**
   ```bash
   lsof -i :3001
   ```

2. **Kill process on port 3001 (if needed):**
   ```bash
   kill $(lsof -ti:3001)
   ```

3. **Start Grafana manually:**
   ```bash
   grafana-server --config=./grafana/grafana.ini
   ```

### Using default Grafana config

If you want to use Homebrew's default Grafana config:
1. Edit: `$(brew --prefix grafana)/etc/grafana/grafana.ini`
2. Set: `http_port = 3001`
3. Start: `brew services start grafana`
