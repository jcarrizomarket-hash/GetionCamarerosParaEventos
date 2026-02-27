# Monitoring Rules

**Application:** Gestión de Camareros para Eventos  
**Created:** 2026-02-27

This document defines monitoring rules for the application. These rules should be configured in your observability platform (Supabase Logs, Datadog, Grafana, or similar).

---

## 1. Security Monitoring Rules

### RULE-SEC-001: Authentication Failure Spike
```yaml
rule: authentication_failure_spike
description: Alert when auth failures exceed threshold
condition:
  metric: api_responses
  filter: status_code IN (401, 403)
  aggregation: count
  window: 5m
  threshold: 10
severity: HIGH
alert:
  channels: [email, slack]
  message: "High number of authentication failures: {count} in 5 minutes from IP: {source_ip}"
action:
  - Log all source IPs
  - Auto-block IP if count > 50 in 5 minutes
```

### RULE-SEC-002: Rate Limit Exhaustion
```yaml
rule: rate_limit_exhaustion
description: Alert when rate limits are hit repeatedly
condition:
  metric: api_responses
  filter: status_code = 429
  aggregation: count
  window: 1m
  threshold: 5
severity: MEDIUM
alert:
  channels: [slack]
  message: "Rate limit threshold reached: {count} 429 responses in 1 minute"
```

### RULE-SEC-003: Unusual Data Access Pattern
```yaml
rule: unusual_data_access
description: Alert on bulk data access that may indicate exfiltration
condition:
  metric: api_requests
  filter: endpoint MATCHES '/camareros|/pedidos|/clientes'
  aggregation: count_per_minute
  window: 1m
  threshold: 100
severity: HIGH
alert:
  channels: [email, slack]
  message: "Unusual bulk data access: {count} requests/minute to data endpoints"
```

### RULE-SEC-004: Secrets or Credentials in Logs
```yaml
rule: credentials_in_logs
description: Alert if log entries contain credential patterns
condition:
  metric: application_logs
  filter: message MATCHES '(password|secret|token|key).*=.*[a-zA-Z0-9]{16,}'
  aggregation: count
  window: 1m
  threshold: 1
severity: CRITICAL
alert:
  channels: [email, slack, pagerduty]
  message: "CRITICAL: Possible credential exposure in logs"
action:
  - Immediate alert to security team
  - Redact log entry
```

---

## 2. Application Health Rules

### RULE-HEALTH-001: API Error Rate
```yaml
rule: api_error_rate
description: Alert when API error rate exceeds acceptable threshold
condition:
  metric: api_responses
  filter: status_code >= 500
  aggregation: percentage_of_total
  window: 5m
  threshold: 5  # 5% error rate
severity: HIGH
alert:
  channels: [email, slack]
  message: "API error rate is {rate}% over the last 5 minutes (threshold: 5%)"
```

### RULE-HEALTH-002: API Response Latency
```yaml
rule: api_response_latency
description: Alert when P95 response time exceeds threshold
condition:
  metric: api_response_time
  aggregation: p95
  window: 5m
  threshold: 3000  # 3 seconds
severity: MEDIUM
alert:
  channels: [slack]
  message: "API P95 latency is {latency}ms (threshold: 3000ms)"
```

### RULE-HEALTH-003: Build Failure
```yaml
rule: ci_build_failure
description: Alert when CI build fails on main branch
condition:
  trigger: github_actions
  filter: workflow = 'CI - Lint & Build' AND branch = 'main' AND status = 'failure'
severity: HIGH
alert:
  channels: [email, slack]
  message: "CI build failed on main branch. Run: {run_url}"
action:
  - Link to failing workflow run
  - Tag responsible committer
```

### RULE-HEALTH-004: Database Connection Errors
```yaml
rule: database_connection_errors
description: Alert on repeated Supabase connection errors
condition:
  metric: application_logs
  filter: level = 'ERROR' AND message CONTAINS 'supabase' OR 'database'
  aggregation: count
  window: 5m
  threshold: 5
severity: HIGH
alert:
  channels: [email, slack]
  message: "Database connection errors: {count} in 5 minutes"
```

---

## 3. Dependency Vulnerability Rules

### RULE-DEP-001: New Critical Vulnerability
```yaml
rule: new_critical_vulnerability
description: Alert when npm audit detects new critical vulnerability
condition:
  trigger: scheduled_audit  # runs via auto-remediation.yml
  filter: severity = 'critical'
  aggregation: count
  threshold: 1
severity: CRITICAL
alert:
  channels: [email, slack, pagerduty]
  message: "NEW CRITICAL vulnerability in dependency: {package_name} ({cve_id})"
action:
  - Create GitHub issue with 'critical' label
  - Attempt auto-fix via npm audit fix
  - If not fixable: escalate to lead developer
```

### RULE-DEP-002: New High Vulnerability
```yaml
rule: new_high_vulnerability
description: Alert when npm audit detects new high vulnerability
condition:
  trigger: scheduled_audit
  filter: severity = 'high'
  aggregation: count
  threshold: 1
severity: HIGH
alert:
  channels: [slack]
  message: "New high vulnerability in dependency: {package_name}"
action:
  - Create GitHub issue with 'security' label
  - Attempt auto-fix
```

---

## 4. Code Quality Rules

### RULE-CODE-001: Merge Conflict Detection
```yaml
rule: merge_conflict_detection
description: Alert when merge conflict markers found in source code
condition:
  trigger: scheduled_scan  # runs via auto-remediation.yml
  pattern: '<<<<<<|======|>>>>>>>'
  in_files: ['*.ts', '*.tsx', '*.js']
  threshold: 1
severity: CRITICAL
alert:
  channels: [email, slack]
  message: "Merge conflict markers found in: {file_list}"
action:
  - Create GitHub issue with 'critical' label
  - Block deployments
```

### RULE-CODE-002: Large Bundle Size Increase
```yaml
rule: bundle_size_increase
description: Alert when build bundle increases significantly
condition:
  trigger: build_complete
  metric: bundle_size_kb
  comparison: increase_percentage
  threshold: 20  # 20% increase triggers alert
severity: MEDIUM
alert:
  channels: [slack]
  message: "Bundle size increased by {percentage}% ({old_size}KB → {new_size}KB)"
```

---

## 5. Alert Escalation Matrix

```
Severity  │ Initial Alert  │ Escalation (if not ack'd) │ Action
──────────┼───────────────┼──────────────────────────┼──────────────────────
CRITICAL  │ Immediate      │ 15 min → PagerDuty       │ Block deployments, notify all devs
HIGH      │ 5 min          │ 1 hr → Email lead dev    │ Create issue, assign sprint
MEDIUM    │ 15 min         │ 4 hr → Slack channel     │ Add to backlog
LOW       │ Daily digest   │ Weekly review            │ Track in tech debt
```

---

## 6. Implementation Notes

### Supabase Logs
Supabase provides built-in log aggregation. Access via:
- Dashboard → Logs → API Logs
- Use the query interface for custom monitoring

### GitHub Actions Integration
The following workflows provide automated monitoring:
- `.github/workflows/security-gates.yml` — Per-PR security checks
- `.github/workflows/auto-remediation.yml` — Daily automated scans

### Recommended External Tools
1. **Sentry** — Frontend error tracking and performance monitoring
2. **Datadog / New Relic** — APM and infrastructure monitoring
3. **GitHub Security Alerts** — Automated Dependabot alerts
4. **Snyk** — Continuous dependency vulnerability monitoring
