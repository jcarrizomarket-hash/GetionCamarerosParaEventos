# Monitoring Setup

Configuration for dashboards, alerts, metrics, and automated health checks for the Event Waitstaff Management System.

## Table of Contents

- [Key Metrics](#key-metrics)
- [Health Checks](#health-checks)
- [Dashboard Configuration](#dashboard-configuration)
- [Alerts](#alerts)

---

## Key Metrics

### Frontend (Sentry)

| Metric | Description | Target |
|--------|-------------|--------|
| Error rate | JS errors per session | < 0.1% |
| Session crash rate | Sessions ending in crash | < 0.5% |
| Performance score | Core Web Vitals (LCP, FID, CLS) | LCP < 2.5 s |

### Backend – Supabase Edge Functions

| Metric | Description | Target |
|--------|-------------|--------|
| Function invocations | Requests per minute | Monitor trend |
| Function errors | 5xx responses | < 1% |
| Response time (p95) | 95th-percentile latency | < 1 000 ms |
| Cold start rate | Invocations with cold start | Monitor trend |

### Database – Supabase Postgres

| Metric | Description | Target |
|--------|-------------|--------|
| Active connections | Current open connections | < 80% of limit |
| Query latency (p95) | Slow query threshold | < 500 ms |
| Disk usage | Storage consumed | < 80% |

---

## Health Checks

### Automated Health Check (GitHub Actions)

Add the following job to `.github/workflows/ci.yml` to run a basic availability check after each deployment:

```yaml
health-check:
  needs: deploy
  runs-on: ubuntu-latest
  steps:
    - name: Frontend health check
      run: |
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${{ vars.DEPLOY_URL }})
        [ "$STATUS" = "200" ] || (echo "Health check failed: HTTP $STATUS" && exit 1)
```

### Manual Health Check Script

```bash
#!/usr/bin/env bash
BASE_URL="${1:-https://your-domain.com}"
echo "Checking $BASE_URL ..."
curl -sf "$BASE_URL" > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend DOWN"
curl -sf "$BASE_URL/api/health" > /dev/null && echo "✅ API OK" || echo "❌ API DOWN"
```

---

## Dashboard Configuration

### Sentry

1. Go to **Sentry → Projects → GetionCamarerosParaEventos → Performance**.
2. Add the following widgets to a custom dashboard:
   - **Error rate** – Grouped by transaction
   - **Apdex score** – Target threshold: 300 ms (satisfied), 1 200 ms (tolerated)
   - **P95 transaction duration** – Filtered to `GET /api/*`

Configure the `SENTRY_DSN` secret in GitHub Actions (see [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)).

### Grafana (self-hosted or Grafana Cloud)

If using Grafana, connect it to the Supabase Postgres instance with the read-only credentials and import the following panels:

- **Active connections** – `SELECT count(*) FROM pg_stat_activity`
- **Query latency** – `SELECT mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 20`
- **Table sizes** – `SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_stat_user_tables`

---

## Alerts

### Critical Alerts (page on-call immediately)

| Alert | Condition | Channel |
|-------|-----------|---------|
| Frontend down | HTTP check fails 2× in 5 min | Slack `#incidents` + SMS |
| Error rate spike | Error rate > 5% for 10 min | Slack `#incidents` |
| Database connections exhausted | Active connections > 90% | Slack `#incidents` |
| Edge Function error rate | 5xx rate > 5% for 5 min | Slack `#incidents` |

### Warning Alerts (notify team, no page)

| Alert | Condition | Channel |
|-------|-----------|---------|
| Slow response | P95 latency > 2 000 ms for 15 min | Slack `#monitoring` |
| Disk usage high | Disk > 75% | Slack `#monitoring` |
| Cold starts elevated | Cold start rate > 20% | Slack `#monitoring` |

### Configuring Slack Alerts

Set the `SLACK_WEBHOOK` secret in GitHub Actions, then use the following step template in any workflow:

```yaml
- name: Notify Slack on failure
  if: failure()
  run: |
    curl -X POST "$SLACK_WEBHOOK" \
      -H 'Content-Type: application/json' \
      -d "{\"text\": \"❌ Deployment failed on \`$GITHUB_REF_NAME\` — <$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID|View run>\"}"
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```
