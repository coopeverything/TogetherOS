# SSH Key Rotation Procedure

**Last Updated:** 2025-12-04

This document describes how to rotate SSH keys used for TogetherOS deployments.

---

## Schedule

| Key Type | Rotation Interval | Notes |
|----------|-------------------|-------|
| Production deploy key | Every 90 days | GitHub Actions → VPS |
| Emergency rotation | Immediately | If compromise suspected |
| Personal SSH keys | Annual | Team member access |

---

## Rotation Steps

### 1. Generate New Key

```bash
# Generate a new ED25519 key with date stamp
ssh-keygen -t ed25519 -C "github-actions@togetheros-$(date +%Y%m%d)" \
  -f ~/.ssh/togetheros_deploy_new

# This creates:
# - togetheros_deploy_new (private key)
# - togetheros_deploy_new.pub (public key)
```

### 2. Add New Public Key to VPS

```bash
# Copy the new public key
cat ~/.ssh/togetheros_deploy_new.pub

# SSH into VPS (use current key while it still works)
ssh ${VPS_USER:-root}@${VPS_IP:-72.60.27.167}

# Append new key (don't overwrite - both keys should work temporarily)
echo "ssh-ed25519 AAAA... github-actions@togetheros-YYYYMMDD" >> ~/.ssh/authorized_keys

# Verify format is correct (one key per line)
cat ~/.ssh/authorized_keys

exit
```

### 3. Update GitHub Secret

1. Go to: https://github.com/coopeverything/TogetherOS/settings/secrets/actions
2. Click on `VPS_SSH_PRIVATE_KEY`
3. Click "Update secret"
4. Paste the **entire contents** of `~/.ssh/togetheros_deploy_new`:
   ```bash
   cat ~/.ssh/togetheros_deploy_new
   ```
5. Click "Update secret"

### 4. Verify New Key Works

```bash
# Trigger a test deployment
gh workflow run auto-deploy-production.yml

# Watch the deployment
gh run watch

# Or manually verify connection
./scripts/check-vps-setup.sh ${VPS_USER:-root}@${VPS_IP:-72.60.27.167}
```

### 5. Remove Old Public Key from VPS

```bash
# SSH into VPS
ssh ${VPS_USER:-root}@${VPS_IP:-72.60.27.167}

# Edit authorized_keys
nano ~/.ssh/authorized_keys

# Remove the old key line (identified by older date in comment)
# Save and exit (Ctrl+X, Y, Enter)

# Verify only new key remains
cat ~/.ssh/authorized_keys
```

### 6. Clean Up Local Key Files

```bash
# Rename old key for archival (optional)
mv ~/.ssh/togetheros_deploy ~/.ssh/togetheros_deploy_old_$(date +%Y%m%d)

# Move new key to standard name
mv ~/.ssh/togetheros_deploy_new ~/.ssh/togetheros_deploy
mv ~/.ssh/togetheros_deploy_new.pub ~/.ssh/togetheros_deploy.pub

# Delete archived keys after 30 days
# rm ~/.ssh/togetheros_deploy_old_*
```

---

## Key Revocation (Emergency)

If an SSH key is compromised:

### Step 1: Immediately Remove Public Key from VPS

```bash
# SSH in with a different key or console access
ssh ${VPS_USER:-root}@${VPS_IP:-72.60.27.167}

# Remove the compromised key (replace COMPROMISED_KEY_COMMENT with actual comment)
grep -v "COMPROMISED_KEY_COMMENT" ~/.ssh/authorized_keys > /tmp/ak
mv /tmp/ak ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Verify key is removed
cat ~/.ssh/authorized_keys
```

### Step 2: Revoke GitHub Secret

1. Go to: https://github.com/coopeverything/TogetherOS/settings/secrets/actions
2. Delete or update `VPS_SSH_PRIVATE_KEY`
3. **Disable auto-deploy workflow** temporarily:
   - Actions → auto-deploy-production.yml → ... → Disable workflow

### Step 3: Generate and Deploy New Key

Follow the standard rotation steps (1-6 above).

### Step 4: Re-enable Workflow

1. Actions → auto-deploy-production.yml → Enable workflow
2. Trigger test deployment to verify

### Step 5: Audit Recent Activity

```bash
# On VPS, check recent SSH connections
last -a | head -20

# Check auth log for suspicious activity
sudo tail -100 /var/log/auth.log | grep sshd

# Review recent deployments
gh run list --workflow=auto-deploy-production.yml --limit 10
```

### Step 6: Document Incident

Create a security incident report:
- Date/time of discovery
- How compromise was detected
- Actions taken
- Recommendations to prevent recurrence

---

## Key Management Best Practices

### DO:
- ✅ Use ED25519 keys (not RSA)
- ✅ Include date stamps in key comments
- ✅ Rotate keys every 90 days
- ✅ Keep old keys archived for 30 days (for rollback)
- ✅ Use separate keys for different purposes (deploy, personal access)
- ✅ Store private keys in GitHub Secrets, never in code

### DON'T:
- ❌ Commit private keys to repository
- ❌ Share deploy keys with personal access
- ❌ Use the same key across multiple services
- ❌ Skip rotation because "nothing has changed"
- ❌ Leave old keys on VPS after rotation

---

## Automation (Future)

Consider implementing automated key rotation:

```yaml
# .github/workflows/rotate-ssh-key.yml (future implementation)
name: Rotate SSH Key (Manual)
on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 1 */3 *'  # Every 3 months

jobs:
  rotate:
    steps:
      - name: Generate new key
      - name: Add to VPS
      - name: Update GitHub secret
      - name: Verify connection
      - name: Remove old key
      - name: Send notification
```

---

## Related Documentation

- [Auto-Deploy Setup](./auto-deploy-setup.md)
- [Deploy Quickstart](./DEPLOY_QUICKSTART.md)
- [Troubleshooting](./troubleshooting.md)

---

## Key Inventory

Track your keys here:

| Key Name | Created | Expires | Location | Status |
|----------|---------|---------|----------|--------|
| togetheros_deploy | YYYY-MM-DD | +90 days | GitHub Secrets | Active |
| Personal (your-name) | YYYY-MM-DD | +1 year | VPS authorized_keys | Active |

Update this table when rotating keys.
