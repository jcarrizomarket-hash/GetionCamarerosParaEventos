# Incident Response Procedures

**Application:** Gestión de Camareros para Eventos  
**Created:** 2026-02-27  
**Owner:** Development Team Lead

---

## Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| 🔴 P1 – Critical | Service down or data breach | 15 minutes | Database unavailable, credentials exposed |
| 🟠 P2 – High | Major feature broken | 1 hour | API returning 500 errors, build failing on main |
| 🟡 P3 – Medium | Degraded service | 4 hours | Slow response times, minor feature broken |
| 🟢 P4 – Low | Minor issue | Next business day | UI glitch, log noise |

---

## Incident Response Team

| Role | Responsibility |
|------|----------------|
| Incident Commander | Coordinates response, communicates status |
| Developer On-Call | Investigates root cause, implements fix |
| QA Lead | Validates fix before deployment |
| Stakeholder | Business impact assessment |

---

## Phase 1: Detection & Initial Response (0–15 minutes)

### Step 1: Confirm the Incident
1. Verify the alert is real (not a false positive).
2. Attempt to reproduce the issue locally or in staging.
3. Assess severity using the matrix above.
4. If P1/P2: immediately notify the incident team.

### Step 2: Initial Assessment Checklist
```
□ Is the service completely down? → P1
□ Is user data exposed? → P1 (also initiate data breach procedure)
□ Is a major feature broken? → P2
□ Is the CI/CD pipeline broken? → P2
□ Is performance severely degraded? → P2
□ Is a minor feature broken? → P3
```

### Step 3: Open Incident Channel
For P1/P2 incidents:
1. Create a GitHub issue with label `incident` and appropriate severity label.
2. Title format: `[INCIDENT P{level}] Brief description - YYYY-MM-DD`
3. Pin the issue to the repository.
4. Update status every 30 minutes in the issue.

---

## Phase 2: Investigation (15–60 minutes)

### Check Application Logs
```bash
# Check Supabase Edge Function logs
# Dashboard → Edge Functions → Logs

# Check browser console errors
# Open DevTools → Console tab

# Check CI/CD logs
# GitHub → Actions → Latest failing run
```

### Check Recent Changes
```bash
# Review recent commits
git log --oneline -20

# Check diff since last known good state
git diff <last-good-commit> HEAD

# Check for merge conflicts
grep -rn "^<<<<<<< " src/ --include="*.ts" --include="*.tsx"
```

### Common Failure Patterns and Diagnosis

#### 🔴 Build Failure
```bash
# 1. Install dependencies
npm ci

# 2. Run build
npm run build 2>&1

# 3. Check for merge conflicts
grep -rn "^<<<<<<< \|^=======$\|^>>>>>>> " src/

# 4. Check for missing imports or broken packages
npm run type-check 2>&1 | head -20

# 5. Check for dependency issues
npm audit
```

#### 🔴 API Returning Errors
```bash
# 1. Check Supabase Edge Function logs for errors
# 2. Verify environment variables are set correctly
# 3. Test endpoint directly:
curl -X GET "https://<project-id>.supabase.co/functions/v1/make-server-25b11ac0/camareros" \
  -H "Authorization: Bearer <anon-key>"

# 4. Check Supabase database connection
# Dashboard → Database → Connection string
```

#### 🔴 Authentication Issues
```bash
# 1. Verify SUPABASE_ANON_KEY is current (check Supabase dashboard)
# 2. Check if JWT tokens are expired
# 3. Verify RLS policies are not blocking legitimate requests
# 4. Test with a fresh token
```

#### 🟠 Security Incident (Credentials Exposed)
```
IMMEDIATELY:
1. Rotate all exposed credentials in Supabase dashboard
2. Invalidate all active sessions
3. Review access logs for any unauthorized access
4. Determine if any data was accessed/modified
5. Follow Data Breach Procedure below
```

---

## Phase 3: Remediation

### For Build Failures
```bash
# 1. Identify the breaking commit
git bisect start
git bisect bad HEAD
git bisect good <last-known-good-hash>

# 2. Fix the issue in a hotfix branch
git checkout -b hotfix/fix-description

# 3. Apply fix
# [implement fix]

# 4. Verify
npm ci && npm run lint && npm run build

# 5. Create PR targeting main (skip normal review for P1/P2)
# 6. Merge after minimal review
# 7. Deploy
```

### For Security Incidents
```bash
# 1. Rotate compromised credentials immediately (do NOT wait)
# 2. Enable audit logging if not already active
# 3. Review access logs
# 4. Document everything with timestamps
# 5. Notify affected parties if data was exposed
```

### Rollback Procedure
```bash
# Identify last known good deployment
git log --oneline main | head -10

# Revert to last good commit (creates a revert commit)
git revert <bad-commit-hash>
git push origin main

# Or: redeploy from last known good artifact
# (Vercel/Netlify: use deployment history to roll back)
```

---

## Phase 4: Resolution & Post-Incident

### Resolution Criteria
An incident is resolved when:
- [ ] The root cause is identified
- [ ] The fix is deployed to production
- [ ] The service is functioning normally
- [ ] Monitoring confirms no recurrence for 30 minutes

### Post-Incident Report Template
Create a post-incident report within 48 hours of P1/P2 resolution:

```markdown
## Post-Incident Report: [Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** P1/P2/P3
**Incident Commander:** [Name]

### Timeline
- HH:MM — Incident detected by [monitoring/user report]
- HH:MM — Team notified
- HH:MM — Root cause identified
- HH:MM — Fix deployed
- HH:MM — Incident resolved

### Root Cause
[Describe the root cause]

### Impact
- Number of users affected:
- Duration of impact:
- Data affected (if any):

### What Went Well
- [Things that helped resolve faster]

### What Could Be Improved
- [Things that slowed resolution]

### Action Items
| Action | Owner | Due Date |
|--------|-------|----------|
| [Preventive measure] | [Name] | YYYY-MM-DD |
```

---

## Specific Procedure: Data Breach

If user data is suspected to have been exposed:

1. **Contain** (0–5 minutes)
   - Rotate all API keys and tokens immediately.
   - Disable affected endpoints if possible.
   - Enable maximum logging.

2. **Assess** (5–30 minutes)
   - Determine what data was accessed.
   - Identify the attack vector.
   - Review all Supabase access logs.

3. **Notify** (30–60 minutes)
   - Notify all affected users.
   - If applicable, notify relevant data protection authorities.
   - Document the notification with timestamps.

4. **Remediate** (1–24 hours)
   - Fix the vulnerability.
   - Implement additional controls.
   - Force-reset all user sessions.

5. **Review** (24–72 hours)
   - Complete post-incident report.
   - Update security controls.
   - Schedule security review.

---

## Specific Procedure: CI/CD Pipeline Failure

When the main branch build is broken:

```bash
# 1. Identify the breaking commit
git log --oneline -10 main

# 2. Check what the CI error is
# GitHub → Actions → Latest failed run → View logs

# Common causes and fixes:

# A: Merge conflict markers
grep -rn "^<<<<<<< " src/
# Fix: Resolve all conflict markers

# B: Missing package
npm ci && npm run build 2>&1 | grep "Cannot find"
# Fix: Install the missing package

# C: TypeScript errors
npm run type-check 2>&1 | head -20
# Fix: Address the type errors

# D: ESLint errors
npm run lint 2>&1
# Fix: Address the lint errors

# 3. Create a hotfix PR immediately
git checkout -b hotfix/fix-ci-failure
# [apply fix]
npm ci && npm run lint && npm run build
git push origin hotfix/fix-ci-failure
# Create PR → merge as soon as checks pass
```

---

## Useful Commands Reference

```bash
# Check npm vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for merge conflicts
grep -rn "^<<<<<<< \|^=======$\|^>>>>>>> " src/ --include="*.ts" --include="*.tsx"

# Full CI simulation locally
npm ci && npm run lint && npm run type-check && npm run build

# Check what changed recently
git log --oneline -20

# Find what introduced a bug
git bisect start && git bisect bad HEAD && git bisect good <hash>
```

---

## Contact Escalation

| Escalation Level | Contact | Method | SLA |
|-----------------|---------|--------|-----|
| On-Call Developer | Team rotation | GitHub issue, Slack | 15 min (P1), 1 hr (P2) |
| Team Lead | Project manager | Email + Slack | 1 hr (P1), 4 hr (P2) |
| Stakeholder | Business owner | Email | For P1 data breaches |
