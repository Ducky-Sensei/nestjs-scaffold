#!/bin/bash

# Quick Monitoring Stack Test Script
# This script verifies Prometheus and Grafana are working correctly

set -e

echo "🔍 Testing Monitoring Stack..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if monitoring stack is running
echo "1️⃣  Checking if monitoring services are running..."
if docker ps | grep -q "scaffold-prometheus"; then
    echo -e "${GREEN}✓ Prometheus container is running${NC}"
else
    echo -e "${RED}✗ Prometheus is not running${NC}"
    echo -e "${YELLOW}   Run: docker-compose -f docker-compose.monitoring.yml up -d${NC}"
    exit 1
fi

if docker ps | grep -q "scaffold-grafana"; then
    echo -e "${GREEN}✓ Grafana container is running${NC}"
else
    echo -e "${RED}✗ Grafana is not running${NC}"
    echo -e "${YELLOW}   Run: docker-compose -f docker-compose.monitoring.yml up -d${NC}"
    exit 1
fi

echo ""

# Step 2: Check if application is exposing metrics
echo "2️⃣  Checking if application is exposing metrics..."
if curl -s http://localhost:8000/v1/metrics > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Application metrics endpoint is accessible${NC}"
    METRIC_COUNT=$(curl -s http://localhost:8000/v1/metrics | grep -c "^nodejs_" || true)
    echo -e "${GREEN}  Found ${METRIC_COUNT} Node.js metrics${NC}"
else
    echo -e "${RED}✗ Cannot access metrics endpoint${NC}"
    echo -e "${YELLOW}   Make sure your app is running and PROMETHEUS_ENABLED=true in .env${NC}"
    exit 1
fi

echo ""

# Step 3: Check if Prometheus is accessible
echo "3️⃣  Checking Prometheus..."
if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Prometheus is healthy${NC}"
else
    echo -e "${RED}✗ Prometheus health check failed${NC}"
    exit 1
fi

# Check if Prometheus is scraping the target
echo "   Checking if Prometheus is scraping your app..."
sleep 2  # Give Prometheus time to scrape
TARGETS=$(curl -s http://localhost:9090/api/v1/targets | grep -c "scaffold-service" || true)
if [ "$TARGETS" -gt 0 ]; then
    echo -e "${GREEN}✓ Prometheus is scraping scaffold-service${NC}"
else
    echo -e "${YELLOW}⚠ Prometheus target not found (may need a few seconds to appear)${NC}"
fi

echo ""

# Step 4: Check if Grafana is accessible
echo "4️⃣  Checking Grafana..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Grafana is healthy${NC}"
else
    echo -e "${RED}✗ Grafana health check failed${NC}"
    exit 1
fi

# Check if datasource is configured
DATASOURCES=$(curl -s -u admin:admin http://localhost:3001/api/datasources 2>/dev/null | grep -c "Prometheus" || true)
if [ "$DATASOURCES" -gt 0 ]; then
    echo -e "${GREEN}✓ Prometheus datasource is configured${NC}"
else
    echo -e "${YELLOW}⚠ Prometheus datasource not found${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All checks passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Access your dashboards:"
echo "   • Prometheus: http://localhost:9090"
echo "   • Grafana:    http://localhost:3001 (admin/admin)"
echo ""
echo "🎯 Quick tests:"
echo "   • View metrics:  curl http://localhost:8000/v1/metrics"
echo "   • Prometheus UI: http://localhost:9090/graph"
echo "   • Targets:       http://localhost:9090/targets"
echo "   • Grafana:       http://localhost:3001/d/nodejs-app-dashboard"
echo ""
