# Auto-Deploy Quick Start

**Status:** ⚠️ Requires one-time setup (see below)

---

## Quick Commands

### Check if auto-deploy is working
```bash
gh workflow list | grep auto-deploy
```

### Manually trigger deployment
```bash
gh workflow run auto-deploy-production.yml
```

### View deployment status
```bash
gh run list --workflow=auto-deploy-production.yml --limit 5
```

### Watch live deployment
```bash
gh run watch
```

---

## One-Time Setup (5 minutes)

### 1. Generate SSH key
```bash
ssh-keygen -t ed25519 -f ~/.ssh/togetheros_deploy
```

### 2. Add public key to VPS
```bash
cat ~/.ssh/togetheros_deploy.pub
# Copy output

ssh root@72.60.27.167
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

### 3. Add secrets to GitHub
Go to: https://github.com/coopeverything/TogetherOS/settings/secrets/actions

Add three secrets:
- `VPS_SSH_PRIVATE_KEY` = content of `~/.ssh/togetheros_deploy` (entire file)
- `VPS_HOST` = `72.60.27.167`
- `VPS_USER` = `root`

### 4. Create production environment
Go to: https://github.com/coopeverything/TogetherOS/settings/environments

- Name: `production`
- Protection rules: (optional)
- Save

### 5. Test it
```bash
echo "# Test" >> README.md
git add README.md
git commit -m "test: auto-deploy"
git push origin yolo
```

Watch: https://github.com/coopeverything/TogetherOS/actions

---

## How It Works

```
You push to yolo → GitHub Actions runs checks → Deploys to VPS → Live in ~3 minutes
```

**What gets checked:**
- TypeScript compiles ✓
- Build succeeds ✓

**What gets deployed:**
- Code changes
- Dependencies
- New builds

**What doesn't trigger deployment:**
- Markdown changes
- Documentation updates
- Workflow changes

---

## Emergency Rollback

```bash
ssh root@72.60.27.167
cd /var/www/togetheros
git log --oneline -5  # Find working commit
git reset --hard <commit-hash>
cd apps/web && npm run build && pm2 restart togetheros
```

---

## Full Documentation

See: [Auto-Deploy Setup Guide](./auto-deploy-setup.md)
