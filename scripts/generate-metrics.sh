#!/bin/bash
# Generate metrics by making API requests
# This helps populate Prometheus with data for visualization

echo "📊 Generating metrics by making API requests..."
echo ""

# Get application token from server/.env
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
ENV_FILE="$PROJECT_ROOT/server/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ server/.env file not found"
    exit 1
fi

APPLICATION_TOKEN=$(grep "^APPLICATION_TOKEN=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$APPLICATION_TOKEN" ]; then
    echo "❌ APPLICATION_TOKEN not found in server/.env"
    exit 1
fi

API_URL="http://localhost:3010"
NUM_REQUESTS=20

echo "Making $NUM_REQUESTS API requests..."
echo ""

# Make requests to different endpoints
for i in $(seq 1 $NUM_REQUESTS); do
    # Health endpoint
    curl -s -H "X-API-Key: $APPLICATION_TOKEN" "$API_URL/api/v1/health" > /dev/null
    
    # Products endpoint (every 3rd request)
    if [ $((i % 3)) -eq 0 ]; then
        curl -s -H "X-API-Key: $APPLICATION_TOKEN" "$API_URL/api/v1/products?page=1" > /dev/null
    fi
    
    # Health endpoint again (every 5th request)
    if [ $((i % 5)) -eq 0 ]; then
        curl -s -H "X-API-Key: $APPLICATION_TOKEN" "$API_URL/api/v1/health" > /dev/null
    fi
    
    if [ $((i % 5)) -eq 0 ]; then
        echo -n "."
    fi
    sleep 0.2
done

echo ""
echo ""
echo "✅ Requests completed!"
echo ""
echo "Waiting for metrics to update..."
sleep 2

echo ""
echo "📈 Checking metrics:"
echo ""

# Check if metrics are being collected
METRICS=$(curl -s "$API_URL/metrics" | grep -E "http_requests_total|http_request_duration" | head -5)

if [ -z "$METRICS" ]; then
    echo "⚠️  No HTTP metrics found yet"
    echo "   Make sure:"
    echo "   1. Server is running on port 3010"
    echo "   2. Metrics middleware is applied"
    echo "   3. Try making more requests"
else
    echo "$METRICS"
    echo ""
    echo "✅ Metrics are being collected!"
    echo ""
    echo "Now check Prometheus:"
    echo "   http://localhost:9090/graph"
    echo "   Query: http_requests_total"
    echo ""
    echo "Or check Grafana dashboard:"
    echo "   http://localhost:3001"
fi
