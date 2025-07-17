# 📊 Grafana Integration Setup Guide

This guide will help you set up Grafana dashboard integration with your Backstage instance, allowing each component to have its own monitoring tab with real-time metrics.

## 🎯 What You'll Get

- **Per-Component Dashboards**: Each service/component gets its own Grafana dashboard tab
- **Real-time Metrics**: CPU, memory, requests, errors, custom metrics directly in Backstage
- **Alert Integration**: See active alerts for each component
- **Automated Discovery**: Dashboards automatically appear based on component annotations

## 📋 Prerequisites

- Grafana instance (self-hosted or cloud)
- Prometheus or other data source configured in Grafana
- Applications instrumented with metrics (Prometheus metrics, APM, etc.)

## 🔧 Setup Steps

### 1. Configure Your Grafana Instance

Update `app-config.yaml` with your actual Grafana details:

```yaml
proxy:
  '/grafana/api':
    target: 'https://your-grafana-instance.com'  # Replace with your Grafana URL
    headers:
      Authorization: 'Bearer YOUR_GRAFANA_API_KEY'  # Replace with your API key

grafana:
  domain: https://your-grafana-instance.com  # Optional: your Grafana domain
  proxyPath: /grafana/api
```

### 2. Create Grafana API Key

1. Go to your Grafana instance → Configuration → API Keys
2. Create a new API key with "Viewer" role
3. Copy the key and replace `YOUR_GRAFANA_API_KEY` in the config above

### 3. Install Dependencies

```bash
cd /var/www/html/qortexone
yarn workspace app add @backstage-community/plugin-grafana
yarn build:all
```

### 4. Configure Components with Dashboards

Add annotations to your component YAML files to link them to Grafana dashboards:

#### Method 1: Dashboard Tag Selector (Recommended)
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    # Find dashboards with specific tags
    grafana/dashboard-selector: "tags @> ['backstage', 'my-service']"
    # Find alerts with specific labels
    grafana/alert-label-selector: "service=my-service"
spec:
  type: service
  # ... rest of your component spec
```

#### Method 2: Specific Dashboard UID
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    # Link to specific dashboard by UID
    grafana/dashboard-uid: "abc123def456"
    grafana/alert-label-selector: "service=my-service"
spec:
  type: service
  # ... rest of your component spec
```

## 🎨 Creating Grafana Dashboards

### Dashboard Naming Convention

For automatic discovery, use this naming pattern:
- `[Service Name] - Application Metrics`
- `[Service Name] - Infrastructure Metrics`
- `Platform Overview - [Team Name]`

### Required Tags for Auto-Discovery

Add these tags to your Grafana dashboards:

```json
{
  "tags": ["backstage", "service-name", "team-name"]
}
```

### Example Dashboard Structure

```bash
📊 Example Service Dashboard
├── 🔥 Key Metrics Row
│   ├── Request Rate (RPS)
│   ├── Error Rate (%)
│   ├── Response Time (P95)
│   └── Active Users
├── 📈 Application Metrics Row
│   ├── Throughput
│   ├── Error Breakdown
│   ├── Database Queries
│   └── Cache Hit Rate
└── 🖥️ Infrastructure Row
    ├── CPU Usage
    ├── Memory Usage
    ├── Disk I/O
    └── Network Traffic
```

## 🚀 Dashboard Templates

### Template 1: Web Service Dashboard

```json
{
  "dashboard": {
    "title": "{{service-name}} - Application Metrics",
    "tags": ["backstage", "{{service-name}}", "web-service"],
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{service=\"{{service-name}}\"}[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{service=\"{{service-name}}\",status=~\"5..\"}[5m]) / rate(http_requests_total{service=\"{{service-name}}\"}[5m]) * 100"
          }
        ]
      }
    ]
  }
}
```

### Template 2: Database Service Dashboard

```json
{
  "dashboard": {
    "title": "{{service-name}} - Database Metrics",
    "tags": ["backstage", "{{service-name}}", "database"],
    "panels": [
      {
        "title": "Query Rate",
        "targets": [
          {
            "expr": "rate(database_queries_total{service=\"{{service-name}}\"}[5m])"
          }
        ]
      },
      {
        "title": "Connection Pool",
        "targets": [
          {
            "expr": "database_connections_active{service=\"{{service-name}}\"}"
          }
        ]
      }
    ]
  }
}
```

## 🤖 Automated Dashboard Creation

### Option 1: Terraform/Script-based

Create a script to automatically generate dashboards:

```bash
#!/bin/bash
# generate-dashboard.sh

SERVICE_NAME=$1
TEAM_NAME=$2

# Template dashboard JSON
cat > "/tmp/${SERVICE_NAME}-dashboard.json" << EOF
{
  "dashboard": {
    "title": "${SERVICE_NAME} - Application Metrics",
    "tags": ["backstage", "${SERVICE_NAME}", "${TEAM_NAME}"],
    "panels": [
      // ... panel definitions
    ]
  }
}
EOF

# Create dashboard via Grafana API
curl -X POST \
  -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @"/tmp/${SERVICE_NAME}-dashboard.json" \
  "${GRAFANA_URL}/api/dashboards/db"
```

### Option 2: CI/CD Integration

Add to your deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Create Grafana Dashboard
  run: |
    ./scripts/create-grafana-dashboard.sh \
      --service="${SERVICE_NAME}" \
      --team="${TEAM_NAME}" \
      --environment="${ENVIRONMENT}"
```

## 📊 Metrics to Include

### Essential Application Metrics
- **Request Rate**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Response Time**: P50, P95, P99 latencies
- **Throughput**: Data processed per unit time

### Infrastructure Metrics
- **CPU Usage**: Percentage utilization
- **Memory Usage**: RAM consumption
- **Disk I/O**: Read/write operations
- **Network**: Inbound/outbound traffic

### Business Metrics
- **Active Users**: Current user sessions
- **Feature Usage**: Feature adoption rates
- **Conversion Rates**: Business KPIs
- **Revenue Impact**: Financial metrics

## 🚨 Alert Configuration

Configure alerts that appear in the Backstage monitoring tab:

```yaml
# Alert rule example
groups:
  - name: backstage-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        labels:
          service: "{{ $labels.service }}"
          severity: critical
        annotations:
          summary: "High error rate detected for {{ $labels.service }}"
```

## ✅ Testing Your Setup

1. **Verify Plugin Installation**: Check that the Monitoring tab appears on component pages
2. **Test Dashboard Discovery**: Ensure dashboards appear for annotated components
3. **Check Alerts**: Verify alerts show up in the monitoring tab
4. **Proxy Functionality**: Test that Grafana data loads correctly

## 🎉 Next Steps

1. **Install and configure** the Grafana plugin (already done above)
2. **Update app-config.yaml** with your Grafana instance details
3. **Create your first dashboard** using the templates above
4. **Add annotations** to your components
5. **Deploy and test** the integration

## 🛠️ Troubleshooting

### Common Issues

1. **Dashboard not appearing**: Check component annotations and dashboard tags
2. **No data in dashboard**: Verify Grafana proxy configuration
3. **Authentication errors**: Ensure API key has correct permissions
4. **CORS issues**: Add Backstage domain to Grafana allowed origins

### Debug Commands

```bash
# Test Grafana proxy
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "http://qortexone.qburst.build/api/proxy/grafana/api/health"

# Check dashboard tags
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "http://qortexone.qburst.build/api/proxy/grafana/api/search?tag=backstage"
```

Now you have a complete Grafana integration that automatically shows relevant dashboards for each component in your Backstage catalog! 🎯 