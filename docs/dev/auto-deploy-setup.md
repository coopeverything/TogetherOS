# Auto-Deploy Production Setup

**Last Updated:** 2025-11-06

This guide explains how to set up automatic deployment from the `yolo` branch to production (coopeverything.org).

---

## How It Works

```
Push to yolo branch
    ↓
GitHub Actions triggers auto-deploy-production.yml
    ↓
Pre-deployment checks:
  - TypeScript compilation ✓
  - Build succeeds ✓
    ↓
SSH into VPS
    ↓
Run deployment:
  1. git pull origin yolo
  2. Run database migrations (automatic)
  3. npm install
  4. npm run build
  5. pm2 restart togetheros
    ↓
Verify deployment health:
  - PM2 status check
  - /api/health endpoint
  - Homepage & signup page tests
    ↓
✅ Live at coopeverything.org
```

**Workflow file:** `.github/workflows/auto-deploy-production.yml`

---

## One-Time Setup (Required)

### Step 1: Generate SSH Key Pair

On your local machine or a secure environment:

```bash
# Generate a new SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions@togetheros" -f ~/.ssh/togetheros_deploy

# This creates two files:
# - togetheros_deploy (private key - keep secret!)
# - togetheros_deploy.pub (public key)
```

### Step 2: Add Public Key to VPS

```bash
# Copy the public key
cat ~/.ssh/togetheros_deploy.pub

# SSH into VPS
ssh root@72.60.27.167

# Add the public key to authorized_keys
echo "ssh-ed25519 AAAA... github-actions@togetheros" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Step 3: Add Secrets to GitHub

Go to: https://github.com/coopeverything/TogetherOS/settings/secrets/actions

Add these repository secrets:

**1. `VPS_SSH_PRIVATE_KEY`**
```bash
# Copy the ENTIRE private key (including BEGIN/END lines)
cat ~/.ssh/togetheros_deploy

# Paste into GitHub secret
```

**2. `VPS_HOST`**
```
72.60.27.167
```

**3. `VPS_USER`**
```
root
```

### Step 4: Create Production Environment

Go to: https://github.com/coopeverything/TogetherOS/settings/environments

1. Click "New environment"
2. Name: `production`
3. Add protection rules:
   - ✅ Required reviewers (optional)
   - ✅ Wait timer: 1 minute (optional safety delay)
4. Save

---

## Testing the Setup

### Method 1: Test with Manual Trigger

1. Go to: https://github.com/coopeverything/TogetherOS/actions/workflows/auto-deploy-production.yml
2. Click "Run workflow"
3. Select branch: `yolo`
4. Click "Run workflow"
5. Watch the deployment logs

### Method 2: Test with a Small Change

```bash
# Make a small change to yolo
git checkout yolo
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: trigger auto-deploy"
git push origin yolo

# Watch GitHub Actions:
# https://github.com/coopeverything/TogetherOS/actions
```

---

## How to Use

### Normal Workflow (Automatic)

```bash
# 1. Work on your feature branch
git checkout -b feature/my-feature

# 2. Make changes, commit
git add .
git commit -m "feat: my feature"

# 3. Push and create PR to yolo
git push origin feature/my-feature
gh pr create --base yolo --head feature/my-feature

# 4. Merge PR to yolo
# → Deployment triggers automatically! ✨
```

### Emergency Rollback

If deployment breaks production:

```bash
# SSH into VPS
ssh root@72.60.27.167

# Rollback to previous commit
cd /var/www/togetheros
git log --oneline -5  # Find previous working commit
git reset --hard <commit-hash>

# Rebuild and restart
cd apps/web
npm run build
pm2 restart togetheros
```

---

## What Gets Deployed

**Triggers on push to yolo, EXCEPT:**
- Markdown files (`**.md`)
- Documentation (`docs/**`)
- GitHub workflows (`.github/**`)
- Scripts (`scripts/**`)

**Why?** Doc-only changes don't need deployment.

**To force deploy docs/scripts:**
```bash
# Use manual workflow trigger
gh workflow run auto-deploy-production.yml
```

---

## Safety Features

### Pre-Deployment Checks

Before deploying, the workflow verifies:
- ✅ TypeScript compiles without errors
- ✅ Application builds successfully
- ✅ No syntax errors

**If checks fail, deployment is blocked.**

### Force Deploy Option

To override failed checks (use with caution):

```bash
gh workflow run auto-deploy-production.yml -f force=true
```

---

## Troubleshooting

### Deployment fails with "Permission denied (publickey)"

**Fix:**
1. Check VPS has the public key in `~/.ssh/authorized_keys`
2. Check GitHub secret `VPS_SSH_PRIVATE_KEY` is correct
3. Verify SSH key permissions on VPS: `chmod 600 ~/.ssh/authorized_keys`

### Deployment succeeds but site shows old content

**Check:**
1. Was the build step successful in logs?
2. Did PM2 restart? Run: `ssh root@72.60.27.167 "pm2 status"`
3. Hard refresh browser: Ctrl+Shift+R (may be cached)

### TypeScript check fails

**Fix locally first:**
```bash
cd apps/web
npx tsc --noEmit
# Fix all errors before pushing
```

### Build fails in deployment

**Test locally:**
```bash
cd apps/web
npm run build
# Fix build errors before pushing
```

---

## Monitoring Deployments

### GitHub Actions UI

Watch live deployment:
- https://github.com/coopeverything/TogetherOS/actions

### VPS Logs

```bash
# SSH into VPS
ssh root@72.60.27.167

# Check PM2 status
pm2 status

# View application logs
pm2 logs togetheros

# View last 100 lines
pm2 logs togetheros --lines 100
```

### Production Site

After deployment (wait ~30 seconds):
- https://coopeverything.org
- https://coopeverything.org/status (check progress data)
- https://coopeverything.org/bridge (test AI chat)

---

## Disabling Auto-Deploy

To temporarily disable automatic deployments:

**Option 1: Disable workflow**
1. Go to: https://github.com/coopeverything/TogetherOS/actions/workflows/auto-deploy-production.yml
2. Click "..." → "Disable workflow"

**Option 2: Comment out trigger**
Edit `.github/workflows/auto-deploy-production.yml`:
```yaml
on:
  # push:
  #   branches:
  #     - yolo
  workflow_dispatch:  # Keep manual trigger
```

---

## Security Notes

- **Private key** (`VPS_SSH_PRIVATE_KEY`) must NEVER be committed to repo
- **Use deploy-specific keys**, not your personal SSH key
- **Rotate keys** every 90 days
- **Monitor** deployment logs for suspicious activity
- **Limit** SSH key to only the deploy user (not root, ideally)

---

## Database Migrations

### How They Work

Migrations run automatically on every deployment:

1. **Loads credentials** from `/var/www/togetheros/.env`
2. **Connects** using `DATABASE_URL` (togetheros_app user)
3. **Runs** `scripts/run-migrations.sh`
4. **Tracks** applied migrations in `schema_migrations` table
5. **Skips** already-applied migrations (idempotent)

**Graceful failure:** If migrations fail, deployment continues. Health checks determine success.

### Manual Migration Run

```bash
# SSH into production
ssh root@72.60.27.167

# Navigate to project
cd /var/www/togetheros

# Load database credentials and run migrations
export $(grep DATABASE_URL .env | xargs)
bash scripts/run-migrations.sh
```

### Migration Troubleshooting

**Migration fails with "Cannot connect to database":**
- Check `.env` file exists and has valid `DATABASE_URL`
- Verify PostgreSQL is running: `systemctl status postgresql`
- Test connection: `psql $DATABASE_URL -c '\q'`

**Migration fails with "permission denied":**
- App user needs `GRANT CREATE ON SCHEMA public`
- Contact DB admin or use superuser for schema changes

**View migration status:**
```bash
psql $DATABASE_URL -c "SELECT filename, applied_at FROM schema_migrations ORDER BY applied_at DESC LIMIT 10;"
```

---

## Future Improvements

- [ ] Add automated tests before deployment
- [ ] Add Slack/Discord notifications on deploy
- [x] Add database migration step (✅ Implemented 2025-11-06)
- [x] Add health check after deployment (✅ Implemented 2025-11-06)
- [x] Add automatic rollback on health check failure (✅ Implemented 2025-11-06)
- [ ] Create staging environment for testing
- [ ] Add deployment metrics/analytics

---

**Related Docs:**
- [Progress Tracking Flow](./progress-tracking-flow.md)
- [Pre-Push Validation](./pre-push-validation.md)
- [PR Checklist](./pr-checklist.md)
