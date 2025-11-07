#!/bin/bash
# Start Prometheus and Grafana for monitoring

echo "🚀 Starting Monitoring Stack..."
echo ""

# Check if Prometheus is installed
if ! command -v prometheus &> /dev/null; then
    echo "❌ Prometheus is not installed"
    echo "   Install with: brew install prometheus"
    exit 1
fi

# Check if Grafana is installed
if ! command -v grafana-server &> /dev/null && ! brew list grafana &> /dev/null; then
    echo "❌ Grafana is not installed"
    echo "   Install with: brew install grafana"
    exit 1
fi

# Get the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
PROMETHEUS_DIR="$PROJECT_ROOT/prometheus"
PROMETHEUS_DATA_DIR="$PROMETHEUS_DIR/data"

# Create data directory if it doesn't exist
mkdir -p "$PROMETHEUS_DATA_DIR"

# Check if Prometheus is already running
EXISTING_PROMETHEUS=$(lsof -ti:9090 2>/dev/null)
if [ ! -z "$EXISTING_PROMETHEUS" ]; then
    echo "⚠️  Prometheus is already running on port 9090 (PID: $EXISTING_PROMETHEUS)"
    echo "   URL: http://localhost:9090"
    PROMETHEUS_PID=$EXISTING_PROMETHEUS
else
    # Start Prometheus
    echo "📊 Starting Prometheus..."
    cd "$PROMETHEUS_DIR"
    
    # Try to start Prometheus and capture any errors
    prometheus --config.file=prometheus.yml --storage.tsdb.path=./data > /tmp/prometheus.log 2>&1 &
    PROMETHEUS_PID=$!
    
    # Wait for Prometheus to start
    sleep 3
    
    # Check if Prometheus is running
    if ps -p $PROMETHEUS_PID > /dev/null 2>&1; then
        # Verify it's actually listening on port 9090
        if lsof -ti:9090 > /dev/null 2>&1; then
            echo "✅ Prometheus started (PID: $PROMETHEUS_PID)"
            echo "   URL: http://localhost:9090"
        else
            echo "❌ Prometheus process started but not listening on port 9090"
            echo "   Check logs: cat /tmp/prometheus.log"
            kill $PROMETHEUS_PID 2>/dev/null
            exit 1
        fi
    else
        echo "❌ Failed to start Prometheus"
        echo "   Check logs: cat /tmp/prometheus.log"
        if [ -f /tmp/prometheus.log ]; then
            echo ""
            echo "Last 10 lines of log:"
            tail -10 /tmp/prometheus.log
        fi
        exit 1
    fi
fi

# Start Grafana
echo "📈 Starting Grafana..."
GRAFANA_CONFIG="$PROJECT_ROOT/grafana/grafana.ini"
GRAFANA_PORT=3001

if command -v grafana-server &> /dev/null; then
    # Start Grafana with custom config on port 3001
    grafana-server --config="$GRAFANA_CONFIG" --homepath=/opt/homebrew/var/lib/grafana > /dev/null 2>&1 &
    GRAFANA_PID=$!
    sleep 3
    if ps -p $GRAFANA_PID > /dev/null; then
        echo "✅ Grafana started (PID: $GRAFANA_PID)"
    else
        # Try alternative method
        GRAFANA_HOME=$(brew --prefix grafana 2>/dev/null || echo "/opt/homebrew/opt/grafana")
        if [ -d "$GRAFANA_HOME/share/grafana" ]; then
            grafana-server --config="$GRAFANA_CONFIG" --homepath="$GRAFANA_HOME/share/grafana" > /dev/null 2>&1 &
            GRAFANA_PID=$!
            sleep 3
            if ps -p $GRAFANA_PID > /dev/null; then
                echo "✅ Grafana started (PID: $GRAFANA_PID)"
            else
                echo "⚠️  Grafana might already be running or check configuration"
                echo "   You can start Grafana manually:"
                echo "   grafana-server --config=$GRAFANA_CONFIG"
            fi
        else
            echo "⚠️  Could not find Grafana installation"
            echo "   Start Grafana manually with:"
            echo "   grafana-server --config=$GRAFANA_CONFIG"
        fi
    fi
else
    # Try using Homebrew service (note: this uses default config)
    echo "⚠️  grafana-server command not found"
    echo "   Grafana will use default port 3000 (conflicts with React app)"
    echo "   To use port 3001, start Grafana manually:"
    echo "   grafana-server --config=$GRAFANA_CONFIG"
    echo ""
    echo "   Or configure Grafana to use port 3001:"
    echo "   Edit: $(brew --prefix grafana)/etc/grafana/grafana.ini"
    echo "   Set: http_port = 3001"
fi

echo ""
echo "🎉 Monitoring stack is running!"
echo ""
echo "📍 URLs:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana:    http://localhost:${GRAFANA_PORT} (port 3000 is used by React app)"
echo ""
echo "🔐 Grafana Credentials:"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "📝 Next Steps:"
echo "   1. Open Grafana: http://localhost:${GRAFANA_PORT}"
echo "   2. Add Prometheus data source: http://localhost:9090"
echo "   3. Import dashboard from: grafana/dashboards/ecommerce-api.json"
echo ""
echo "🛑 To stop:"
if [ ! -z "$EXISTING_PROMETHEUS" ]; then
    echo "   Prometheus: kill $PROMETHEUS_PID (or leave it running)"
else
    echo "   Prometheus: kill $PROMETHEUS_PID"
fi
echo "   Grafana: brew services stop grafana"
echo ""
echo "💡 Tip: If Prometheus is already running, you can skip starting it"
echo "   by stopping the existing process first: kill $PROMETHEUS_PID"
echo ""
