# Troubleshooting Guide

**Last Updated:** 2025-12-04

Common issues and solutions for TogetherOS development and deployment.

---

## SSH Connection Issues

### Error: "Permission denied (publickey)"

**Symptoms:**
```
Permission denied (publickey).
fatal: Could not read from remote repository.
```

**Causes & Solutions:**

1. **SSH key not in GitHub Secrets**
   ```bash
   # Verify secret exists at:
   # https://github.com/coopeverything/TogetherOS/settings/secrets/actions
   # Check: VPS_SSH_PRIVATE_KEY
   ```

2. **Key file permissions wrong**
   ```bash
   # On VPS
   chmod 600 ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   ```

3. **Public key not in VPS authorized_keys**
   ```bash
   # SSH with console/other access and verify
   cat ~/.ssh/authorized_keys
   # Should contain the public key matching your private key
   ```

4. **Wrong private key format**
   ```bash
   # Private key must include BEGIN/END lines:
   -----BEGIN OPENSSH PRIVATE KEY-----
   ...key content...
   -----END OPENSSH PRIVATE KEY-----
   ```

### Error: "Host key verification failed"

**Symptoms:**
```
Host key verification failed.
```

**Causes & Solutions:**

1. **Stale known_hosts entry**
   ```bash
   # Clear old entry
   ssh-keygen -R ${VPS_IP:-72.60.27.167}

   # Re-scan host key
   ssh-keyscan -H ${VPS_IP:-72.60.27.167} >> ~/.ssh/known_hosts
   ```

2. **Server changed (IP reuse, rebuild)**
   ```bash
   # Same as above - clear and re-scan
   ```

### Error: "Connection refused"

**Symptoms:**
```
ssh: connect to host 72.60.27.167 port 22: Connection refused
```

**Causes & Solutions:**

1. **SSH service not running**
   ```bash
   # On VPS (via console access)
   sudo systemctl status sshd
   sudo systemctl start sshd
   ```

2. **Firewall blocking port 22**
   ```bash
   # Check firewall rules
   sudo ufw status
   sudo ufw allow 22/tcp
   ```

3. **VPS is down**
   - Check VPS provider status page
   - Try ping: `ping ${VPS_IP:-72.60.27.167}`

### Error: "Connection timed out"

**Symptoms:**
```
ssh: connect to host 72.60.27.167 port 22: Connection timed out
```

**Causes & Solutions:**

1. **Network connectivity issues**
   - Check your internet connection
   - Try from different network

2. **Wrong IP address**
   - Verify IP is correct: `VPS_IP=72.60.27.167`
   - Check VPS provider dashboard for current IP

3. **VPS provider outage**
   - Check provider status page

### Error: "No route to host"

**Symptoms:**
```
ssh: connect to host 72.60.27.167 port 22: No route to host
```

**Causes & Solutions:**

1. **VPS is offline or network issue**
   ```bash
   # Check if host is reachable
   ping -c 3 ${VPS_IP:-72.60.27.167}
   ```

2. **Routing issue**
   - Contact VPS provider
   - Try from different network

---

## GitHub Actions Issues

### Deployment fails with SSH error

**Check:**
1. View workflow logs at GitHub Actions
2. Look for SSH step output
3. Verify secrets are set correctly

**Common fixes:**
```bash
# Verify secrets are set
gh secret list

# Update SSH key if needed
gh secret set VPS_SSH_PRIVATE_KEY < ~/.ssh/togetheros_deploy
```

### Deployment succeeds but site shows old content

**Check:**
1. Was build step successful? (check logs)
2. Did PM2 restart?
   ```bash
   ssh ${VPS_USER:-root}@${VPS_IP:-72.60.27.167} "pm2 status"
   ```
3. Browser cache - try hard refresh (Ctrl+Shift+R)

### Health check fails after successful deployment

**Causes:**
1. Application crashed during startup
2. Database connection issues
3. Environment variables missing

**Debug:**
```bash
# SSH into VPS and check logs
ssh ${VPS_USER:-root}@${VPS_IP:-72.60.27.167}
pm2 logs togetheros --lines 100
```

---

## Database Issues

### Cannot connect to database

**Check .env configuration:**
```bash
# On VPS
cat /var/www/togetheros/.env | grep DB
# Should have: DATABASE_URL or DB_* variables
```

**Check PostgreSQL is running:**
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

**Test connection:**
```bash
psql $DATABASE_URL -c '\q'
```

### Migration fails

**Check migration logs:**
```bash
bash scripts/run-migrations.sh 2>&1
```

**Verify database exists:**
```bash
sudo -u postgres psql -l | grep togetheros
```

---

## Build Issues

### TypeScript compilation fails

**Local fix:**
```bash
cd apps/web
npx tsc --noEmit
# Fix all errors before pushing
```

### Next.js build fails

**Debug locally:**
```bash
cd apps/web
npm run build
# Check error output
```

**Common issues:**
- Missing environment variables
- Import errors
- Type mismatches

---

## PM2 Issues

### Application not starting

**Check status:**
```bash
pm2 status togetheros
pm2 logs togetheros --lines 50
```

**Restart:**
```bash
pm2 restart togetheros
# or
pm2 start ecosystem.config.js
```

### Application keeps crashing

**Check crash reason:**
```bash
pm2 logs togetheros --err --lines 100
```

**Common causes:**
- Missing environment variables
- Port already in use
- Memory limits exceeded

---

## Quick Diagnostic Commands

```bash
# SSH connection test
ssh -v ${VPS_USER:-root}@${VPS_IP:-72.60.27.167} "echo 'Connected'"

# Full VPS check
./scripts/check-vps-setup.sh

# Deployment verification
./scripts/verify-deployment.sh https://coopeverything.org

# GitHub Actions status
gh run list --workflow=auto-deploy-production.yml --limit 5

# PM2 status
ssh ${VPS_USER:-root}@${VPS_IP:-72.60.27.167} "pm2 status"

# Application logs
ssh ${VPS_USER:-root}@${VPS_IP:-72.60.27.167} "pm2 logs togetheros --lines 50"
```

---

## Related Documentation

- [Auto-Deploy Setup](./auto-deploy-setup.md)
- [SSH Key Rotation](./ssh-key-rotation.md)
- [Deploy Quickstart](./DEPLOY_QUICKSTART.md)
