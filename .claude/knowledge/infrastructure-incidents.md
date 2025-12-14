# Infrastructure Incidents & Recovery

Production server documentation for outages, security incidents, and deployment procedures.

---

## Quick Index

| Incident | Date | Status | Key Learning |
|----------|------|--------|--------------|
| PM2 Restart Loop | Dec 11, 2025 | Resolved | Configure restart limits |
| Malware Discovery | Dec 11, 2025 | Resolved | Both payloads failed to execute |
| Zero-Downtime Deploy | Dec 12, 2025 | Resolved | Build before stopping PM2 |

---

## Recovery Procedure (Quick Reference)

If site goes 502:

```bash
# 1. Check if build is running
ssh root@72.60.27.167 "ps aux | grep 'next build' | grep -v grep"

# 2. If build running, wait for completion
# 3. If no build, check for BUILD_ID
ssh root@72.60.27.167 "cat /var/www/togetheros/apps/web/.next/BUILD_ID"

# 4. If BUILD_ID exists, restart PM2
ssh root@72.60.27.167 "pm2 restart togetheros"

# 5. If no BUILD_ID, run build manually
ssh root@72.60.27.167 "cd /var/www/togetheros/apps/web && npm run build && pm2 restart togetheros"

# 6. Verify
curl https://coopeverything.org/api/health
```

---

## Incident: 2025-12-11 Production Outage

### Part 1: PM2 Restart Loop & CPU Throttling

**Timeline:**
| Time | Event |
|------|-------|
| ~15:00 | Deployment triggered during incomplete build |
| ~15:00-16:00 | PM2 restarted 482+ times (no restart limits configured) |
| ~16:00 | Hostinger CPU throttling activated (84% steal time) |
| ~16:00-17:30 | Site down, multiple investigation rounds |
| ~17:55 | Site restored after manual rebuild |

**Root Causes:**

1. **PM2 restart loop** - PM2 had no restart limits configured. When app crashed, PM2 restarted it instantly and infinitely.
2. **Race condition in deployment** - PM2 was running while `.next` directory was deleted during build.
3. **Incomplete build** - BUILD_ID file was missing because build never completed.

**Symptoms:**
- `Cannot find module 'tailwind-merge'` errors
- `Could not find a production build in the '.next' directory`
- 84% CPU steal time (hypervisor throttling)
- PM2 showing 482+ restarts (up-arrow column)

**Fixes Applied:**

1. **ecosystem.config.js** - Added restart limits:
   ```javascript
   max_restarts: 10,
   min_uptime: '10s',
   restart_delay: 4000,
   exp_backoff_restart_delay: 100
   ```

2. **auto-deploy-production.yml** - Fixed deployment sequence (stop PM2 before build)

3. **pm2-root.service** - Added systemd restart limits:
   ```ini
   RestartSec=30
   StartLimitIntervalSec=300
   StartLimitBurst=5
   ```

4. **ensure-build.sh** - Created build verification script at `/var/www/togetheros/scripts/ensure-build.sh`

---

### Part 2: Malware Discovery & Removal

**Discovery Date:** December 11, 2025
**Installation Date:** December 6, 2025 (09:00-10:30 UTC)

**Malware Found:**

| Component | Location | Purpose | C2 Server |
|-----------|----------|---------|-----------|
| **meshagent** | `/usr/local/mesh_services/meshagent` | MeshCentral RAT (remote access) | 45.93.8.88 (ALEXHOST Amsterdam) |
| **rsyslo** | `/usr/local/rsyslo/rsyslo` | UPX-packed payload (typosquatting rsyslog) | Unknown |

**Service Files:**
- `/usr/lib/systemd/system/meshagent.service` - "meshagent background service"
- `/etc/systemd/system/rsyslo.service` - "Rsyslo AV Agent Service" (fake antivirus)

**Critical Finding: Both Malware Components FAILED**

| Malware | Behavior | Evidence |
|---------|----------|----------|
| **meshagent** | Crashed immediately | `exit-code=1/FAILURE` after 18 seconds, entered restart loop |
| **rsyslo** | Crashed repeatedly | 13+ restart attempts, each lasting ~1 second |

Kernel log: `process 'usr/local/rsyslo/rsyslo' started with executable stack`
- Indicates poorly constructed payload
- Likely crashed due to ASLR/NX protection or missing dependencies

**Removal Actions (Dec 11):**
```bash
# Stopped and disabled services
systemctl stop meshagent rsyslo
systemctl disable meshagent rsyslo

# Removed service files
rm /usr/lib/systemd/system/meshagent.service
rm /etc/systemd/system/rsyslo.service

# Removed binaries
rm -rf /usr/local/mesh_services/
rm -rf /usr/local/rsyslo/

# Reloaded systemd
systemctl daemon-reload
```

**Attack Vector Analysis:**
- No SSH logins during installation window (09:00-10:30 Dec 6)
- Likely vector: Hostinger control panel compromise OR supply chain attack
- `clp` user (Hostinger panel) has sudo access

---

### Part 3: Data Exfiltration Assessment

**Database Check:**
- Only 1 user in database (owner account)
- No `pg_dump`, `COPY`, or export commands in PostgreSQL logs
- Only normal app queries on Dec 6 (theme updates, post selects)
- No suspicious database backups created

**File Access Check:**
- `.env` file last modified Nov 3, 2025 (before attack)
- No tar/zip/curl uploads in bash history
- No audit logs of file exfiltration

**Network Check:**
- Dec 6 logs show normal traffic (Postfix probes, SSH from known IPs)
- No connections to attacker C2 (45.93.8.88) succeeded

**Assessment: LOW RISK of Data Exfiltration**
- Malware never successfully ran
- Database shows no unauthorized queries
- Single user account remains intact
- `.env` unchanged since Nov 3

**Probable Attack Intent:**
- MeshAgent for remote desktop/shell access (reconnaissance)
- rsyslo was likely cryptominer or botnet payload
- Attack was **unsuccessful** - malware kept crashing

---

### Part 4: Post-Incident Hardening

**Completed:**
- [x] PM2 restart limits configured
- [x] Systemd restart limits configured
- [x] Deployment workflow fixed (stop PM2 before build)
- [x] Malware removed
- [x] Crontab cleaned (removed process-hiding entries)
- [x] Audit logging enabled

**Recommended:**
- [ ] Change database password
- [ ] Change JWT secret
- [ ] Rotate OpenAI API key
- [ ] Contact Hostinger about Dec 6 activity
- [ ] Enable fail2ban for SSH
- [ ] Regular security scans (rkhunter, chkrootkit)

---

### Part 5: Full Recovery Procedure

If PM2 loop happens again:

```bash
# 1. SSH to server
ssh root@72.60.27.167

# 2. Stop PM2 completely
pm2 stop togetheros
pm2 delete togetheros
pm2 save --force

# 3. Wait for CPU throttling to lift (check with top, look for 0% st)
top -bn1 | head -5

# 4. Clean and rebuild
cd /var/www/togetheros/apps/web
rm -rf .next
npm run build

# 5. Verify BUILD_ID exists
cat .next/BUILD_ID

# 6. Start PM2
cd /var/www/togetheros
pm2 start ecosystem.config.js
pm2 save

# 7. Verify health
curl https://coopeverything.org/api/health
```

---

## Incident: 2025-12-12 Zero-Downtime Deployment Fix

### Part 1: Misdiagnosis Correction

**Initial Hypothesis (from user):** The Dec 6 malware (meshagent, rsyslo) was a decoy/front, and something deeper was blocking the development process.

**Actual Finding:** The malware was NOT the cause of ongoing issues. The recurring 502 errors were caused by:

1. **Deployment workflow design flaw** - stopped PM2 before building
2. **CPU throttling** - 82-85% steal time from Hostinger hypervisor
3. **Concurrent Claude sessions** - multiple instances triggering overlapping deployments

---

### Part 2: The Deployment Workflow Flaw

**Location:** `.github/workflows/auto-deploy-production.yml`

**Old Workflow (caused 5-10 min downtime per deploy):**
```bash
pm2 stop togetheros      # SITE GOES 502 IMMEDIATELY
rm -rf .next             # DELETE BUILD
npm run build            # 5-10 MINUTES (85% CPU steal)
pm2 start                # Site finally back
```

**Why This Was Catastrophic:**
- Every push to `yolo` triggered deployment
- PM2 stopped BEFORE build started
- Build took 5-10 minutes due to CPU throttling
- Site was 502 for ENTIRE build duration
- If build failed, site stayed down

**New Workflow (seconds of downtime):**
```bash
npm run build            # Site stays up during build
pm2 restart              # Only seconds of downtime
```

**Key Changes:**
- Build completes WHILE site is still running
- Only restart PM2 AFTER build succeeds
- If build fails, site stays up on previous version
- Downtime reduced from 5-10 minutes to ~5 seconds

---

### Part 3: Concurrent Claude Sessions Problem

**Discovery:** During investigation, found TWO simultaneous `next build` processes (PIDs 68599 and 68807) fighting over `.next` directory.

**Pattern Identified:**
```
1. Claude session A sees site down -> SSHs to server -> starts build
2. Claude session B sees site down -> SSHs to server -> starts build
3. Both builds fight over .next directory
4. CPU gets throttled (59-85% steal time)
5. Both builds fail or produce corrupt output
6. Cycle repeats
```

**Evidence:**
- Multiple SSH connections from same IP (user's IP)
- No GitHub workflow triggering these builds
- SSH key authentication (legitimate sessions)
- Builds started within 2 minutes of each other

**Root Cause:** When site goes down, multiple Claude Code sessions in different terminals/contexts all independently try to fix it, creating chaos.

**Prevention:**
- Only ONE Claude session should attempt recovery at a time
- User should coordinate if multiple sessions are active
- Deployment workflow now keeps site up during build (reduces trigger for "fix" attempts)

---

### Part 4: CPU Throttling Context

**Observed:** 82-85% CPU steal time consistently during builds

**What This Means:**
- Hostinger VPS is on shared infrastructure
- Hypervisor allocates CPU time to other VMs
- 85% steal = only 15% of CPU cycles available to our VM
- A build that takes 2 minutes normally takes 10+ minutes

**Impact on Deployments:**
- Old workflow: 10+ minute downtime (PM2 stopped during slow build)
- New workflow: Build takes same time but site stays up

**This is NOT a bug to fix** - it's the nature of shared hosting. The fix is designing workflows that tolerate slow builds.

---

### Part 5: Files Changed

**Workflow fix committed:**
- `.github/workflows/auto-deploy-production.yml` - Zero-downtime deployment

**Key code change:**
```yaml
# OLD (lines 113-127):
pm2 stop togetheros
rm -rf .next
npm run build
pm2 start

# NEW:
npm run build  # Site stays up
pm2 restart    # Only seconds down
```

---

## Lessons Learned

### From PM2 Incident (Dec 11)
1. PM2 default is unlimited instant restarts - ALWAYS configure limits
2. Systemd can override PM2 restart limits - configure both
3. Never delete build artifacts while process manager is running
4. BUILD_ID verification is critical before starting app
5. 84% CPU steal = hypervisor throttling, not app issue

### From Malware Incident (Dec 11)
6. Malware can be installed via hosting control panels, not just SSH
7. Poor-quality malware may fail silently - still remove immediately
8. Enable audit logging BEFORE incidents occur

### From Deployment Fix (Dec 12)
9. **Deployment design matters more than speed** - A 10-minute build is fine if site stays up
10. **Stop PM2 AFTER build, not BEFORE** - Critical for zero-downtime
11. **CPU throttling is expected on shared hosting** - Design workflows accordingly
12. **Multiple Claude sessions can cause chaos** - Coordinate recovery attempts
13. **Malware was a red herring** - The Dec 6 malware failed to execute; ongoing issues were workflow design
14. **Always investigate infrastructure assumptions** - The "attack" was self-inflicted

---

## Files Changed (Summary)

- `.github/workflows/auto-deploy-production.yml` - Zero-downtime deployment
- `ecosystem.config.example.js` - PM2 restart limits
- `/etc/systemd/system/pm2-root.service` (on VPS) - Systemd limits
- `/var/www/togetheros/scripts/ensure-build.sh` (on VPS) - Build verification
- Removed: `/usr/local/mesh_services/`, `/usr/local/rsyslo/` (on VPS)
