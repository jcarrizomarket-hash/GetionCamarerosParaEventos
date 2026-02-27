# Incident Response

Playbooks, escalation matrix, crisis communication guidelines, and post-mortem template for the Event Waitstaff Management System.

## Table of Contents

- [Severity Levels](#severity-levels)
- [Escalation Matrix](#escalation-matrix)
- [Playbooks](#playbooks)
- [Crisis Communication](#crisis-communication)
- [Post-Mortem Template](#post-mortem-template)

---

## Severity Levels

| Severity | Definition | Response Time | Example |
|----------|-----------|---------------|---------|
| **SEV-1** | Complete service outage; no users can access the system | 15 minutes | Frontend returns 5xx for all requests |
| **SEV-2** | Major feature broken; significant subset of users affected | 1 hour | Event assignment fails for all events |
| **SEV-3** | Minor feature degraded; workaround available | 4 hours | PDF export slow but functional |
| **SEV-4** | Cosmetic issue or low-impact bug | Next sprint | Incorrect label in a dropdown |

---

## Escalation Matrix

| Role | Contact | Escalation Trigger |
|------|---------|-------------------|
| On-call developer | GitHub issue + Slack DM | Any SEV-1 or SEV-2 alert |
| Engineering lead | Slack `#incidents` | SEV-1 unresolved after 30 min |
| Project owner | Direct message | SEV-1 unresolved after 1 hour |

---

## Playbooks

### Playbook 1 – Frontend Down (SEV-1)

1. **Detect** – Automated health check fails or Slack alert fires.
2. **Confirm** – Manually open the production URL in an incognito window.
3. **Identify** – Check the hosting provider dashboard (Netlify/Vercel) for deployment errors.
4. **Roll back** – Follow the [Frontend Rollback](./DEPLOYMENT-GUIDE.md#rollback-procedure) procedure in `DEPLOYMENT-GUIDE.md`.
5. **Verify** – Run post-deploy validation checks from `DEPLOYMENT-GUIDE.md`.
6. **Communicate** – Post update to Slack `#incidents` (see [Crisis Communication](#crisis-communication)).
7. **Document** – Open a post-mortem issue and fill in the [Post-Mortem Template](#post-mortem-template).

### Playbook 2 – Edge Function Errors (SEV-2)

1. **Detect** – Sentry shows 5xx spike or Supabase dashboard shows function errors.
2. **Confirm** – Call the function endpoint directly and inspect the response body.
3. **Identify** – Check Supabase Edge Function logs in the Supabase dashboard.
4. **Roll back** – Follow the [Edge Function Rollback](./DEPLOYMENT-GUIDE.md#rollback-procedure) procedure.
5. **Verify** – Run a manual API check (`curl -sf <url>/api/health`).
6. **Communicate and document** – same as Playbook 1, steps 6–7.

### Playbook 3 – Database Issues (SEV-1/SEV-2)

1. **Detect** – Monitoring alert for connection exhaustion or high query latency.
2. **Confirm** – Check `pg_stat_activity` for blocking queries:
   ```sql
   SELECT pid, now() - query_start AS duration, query, state
   FROM pg_stat_activity
   WHERE state != 'idle'
   ORDER BY duration DESC;
   ```
3. **Mitigate** – Terminate long-running queries if safe:
   ```sql
   SELECT pg_terminate_backend(<pid>);
   ```
4. **Escalate** – If issue persists, contact Supabase support with the project reference.
5. **Communicate and document** – same as Playbook 1, steps 6–7.

---

## Crisis Communication

### Internal Updates (Slack `#incidents`)

Post a status update every **30 minutes** during an active SEV-1 or SEV-2 incident using this template:

```
🔴 INCIDENT UPDATE – <timestamp>
Severity: SEV-<N>
Status: Investigating | Mitigating | Resolved
Impact: <brief description>
Next update: <time>
```

### User-Facing Communication

For prolonged outages affecting end users, post a plain-language notice in the application or via email:

> We are currently experiencing issues with [feature]. Our team is actively working on a fix.
> We will provide an update by [time]. We apologize for the inconvenience.

---

## Post-Mortem Template

Copy this template into a new GitHub Issue titled `Post-mortem: <incident title> (<date>)` after every SEV-1 or SEV-2 incident.

```markdown
## Incident Summary

- **Date/Time:** 
- **Duration:** 
- **Severity:** SEV-
- **Impact:** (number of users affected, features broken)

## Timeline

| Time | Event |
|------|-------|
|      | Incident detected |
|      | On-call notified |
|      | Root cause identified |
|      | Mitigation applied |
|      | Service restored |

## Root Cause

(Technical explanation of what went wrong)

## Contributing Factors

- 
- 

## Resolution

(Steps taken to restore service)

## Action Items

| Action | Owner | Due Date |
|--------|-------|----------|
|        |       |          |

## Lessons Learned

(What went well, what could be improved)
```
