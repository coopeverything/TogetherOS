# TogetherOS Development on Android Tablet (Termux)

## Overview

This guide enables productive development of TogetherOS on Android tablets using **Termux**, a Linux terminal emulator for Android. You'll be able to:

- ✅ Edit code and documentation
- ✅ Run git operations (clone, commit, push, branch management)
- ✅ Build TypeScript and run validation scripts
- ✅ Create pull requests and manage GitHub workflows
- ✅ Use Claude Code for autonomous development

**Cannot** do on tablet (requires desktop environment):
- ❌ Run PostgreSQL database server locally
- ❌ Use Docker containers
- ❌ Run full development server with hot reload (`npm run dev` with DB)
- ❌ Visual debugging with browser dev tools

## Prerequisites

- Android 5.0+ device with at least 2GB free storage
- [Termux](https://f-droid.org/en/packages/com.termux/) installed from F-Droid (recommended) or Google Play
- Basic Unix command knowledge (cd, ls, nano, vim)
- GitHub account with SSH key configured

## Installation Steps

### 1. Install Termux & Configure Storage

```bash
# First time in Termux: grant storage access when prompted
# Run this command to set up file access:
termux-setup-storage

# Navigate to home directory
cd ~
```

### 2. Update Package Manager

```bash
pkg update
pkg upgrade -y
```

This takes 2-5 minutes on first run.

### 3. Install Required Development Tools

```bash
# Install essential tools (one command)
pkg install -y git node npm python jq curl nano

# Install Python-based validators
pip install yamllint

# Verify installations
node --version   # Should be >= 20.0.0
npm --version    # Should be >= 10.0.0
git --version    # Should exist
jq --version     # Should exist
python --version # Should be >= 3.8
```

**Note:** `actionlint` (GitHub Actions validator) is not available for ARM64 on Termux. It's optional for development.

### 4. Configure Git SSH

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# 1. Go to https://github.com/settings/keys
# 2. Click "New SSH key"
# 3. Paste the entire public key output
# 4. Name it "Tablet - Termux"
# 5. Click "Add SSH key"

# Test connection
ssh -T git@github.com
# Expected: "Hi username! You've successfully authenticated..."
```

### 5. Clone TogetherOS Repository

```bash
# Navigate to home
cd ~

# Clone the repository
git clone git@github.com:coopeverything/TogetherOS.git

# Enter directory
cd TogetherOS

# Verify you're on yolo branch
git status
# Expected output: "On branch yolo" and "Your branch is up to date with 'origin/yolo'"
```

### 6. Configure Local Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local

# For tablet development, ensure these are set:
# DB_HOST=coopeverything.org  (use remote VPS, not localhost)
# SKIP_DATABASE_VALIDATION=true  (no local PostgreSQL)
```

**Important:** Never commit `.env.local` to git - it contains sensitive configuration.

### 7. Install GitHub CLI & Authenticate

```bash
# Install GitHub CLI
pkg install gh

# Authenticate (opens browser for login)
gh auth login --web
# Follow prompts: copy code, open URL, enter code

# Setup git to use gh credentials
gh auth setup-git

# Configure git identity
git config user.email "132305976+coopeverything@users.noreply.github.com"
git config user.name "CoopEverything!"

# Verify push works
git push --dry-run origin yolo
# Should complete without errors
```

### 8. Install Node Dependencies

```bash
# From repo root
# Use --ignore-scripts --force to skip native modules that don't support Android
npm install --ignore-scripts --force

# This installs all monorepo dependencies
# Takes 3-10 minutes depending on connection
# You should see "added XXXX packages"
# Ignore warnings about @pact-foundation - it doesn't support Android but isn't needed
```

### 9. Verify Build & Tests

```bash
# Run tests (should all pass)
npm test
# Expected: "118 passed" or similar

# Run type checking (fast)
npm run typecheck

# Run full build (slower, verifies everything)
npm run build

# Both should complete without errors
# You'll see:
# - "✓ Built successfully"
# - "✓ All type checks passed" or similar
```

If build fails, see **Troubleshooting** section below.

## Quick Setup Checklist (TL;DR)

For experienced users, here's the minimal setup:

```bash
# 1. Install tools
pkg update && pkg install -y git node npm gh

# 2. Authenticate GitHub
gh auth login --web
gh auth setup-git
git config user.email "132305976+coopeverything@users.noreply.github.com"
git config user.name "CoopEverything!"

# 3. Clone and install
cd ~ && git clone https://github.com/coopeverything/TogetherOS.git
cd TogetherOS
npm install --ignore-scripts --force

# 4. Verify
npm test          # All tests pass
git push --dry-run origin yolo  # Push works
```

## Development Workflow on Tablet

### Starting a Work Session

```bash
# Ensure you're in the repo directory
cd ~/TogetherOS

# Switch to yolo branch
git checkout yolo

# Pull latest changes from GitHub
git pull origin yolo

# Verify clean working directory
git status
# Expected: "nothing to commit, working tree clean"
```

### Creating a Feature Branch

```bash
# Create and switch to new branch
# Pattern: feature/{module}-{description}
git checkout -b feature/bridge-member-integration

# Verify you're on the new branch
git status
# Expected: "On branch feature/bridge-member-integration"
```

### Making Changes

```bash
# Edit files using nano
nano apps/web/app/bridge/page.tsx

# Or using vim (if installed: pkg install vim)
vim apps/web/app/bridge/page.tsx

# Save and exit:
# nano: Ctrl+O, Enter, Ctrl+X
# vim: Esc, :wq, Enter
```

### Building & Validating

```bash
# Type check (fast)
npm run typecheck

# Full build
npm run build

# Run linters
./scripts/validate.sh

# Expected output:
# LINT=OK
# VALIDATORS=GREEN
# SMOKE=OK
```

### Committing Changes

```bash
# See what changed
git status

# Stage all changes
git add .

# Create commit with conventional message
# Pattern: feat(module): description
git commit -m "feat(bridge): add member profile integration"

# View commit
git log --oneline -n 1
```

### Pushing to GitHub

```bash
# Push to GitHub with branch tracking
git push -u origin feature/bridge-member-integration

# Verify push succeeded
git status
# Expected: "Your branch is ahead of 'origin/...'"

# To push again (after more commits)
git push origin feature/bridge-member-integration
```

### Creating a Pull Request

```bash
# Option 1: Use GitHub CLI (faster)
gh pr create --base yolo --title "feat: description" --body "PR body"

# Option 2: Use GitHub web interface
# 1. Go to https://github.com/coopeverything/TogetherOS
# 2. Click "Compare & pull request" (GitHub suggests this)
# 3. Fill in title and description
# 4. Click "Create pull request"
```

## Common Tasks on Tablet

### View Git Log

```bash
# Last 5 commits
git log --oneline -n 5

# See what's in your branch that yolo doesn't have
git log origin/yolo..HEAD
```

### Sync with Latest Changes

```bash
# Pull latest from origin
git pull origin yolo

# If there are conflicts:
git status  # See which files conflict
nano path/to/conflicted/file  # Fix conflicts
git add .
git commit -m "resolve merge conflicts"
git push origin feature/your-branch
```

### Discard Local Changes

```bash
# Undo unstaged changes
git checkout -- path/to/file

# Or discard all changes in current directory
git checkout -- .

# Hard reset to origin (dangerous!)
git reset --hard origin/branch-name
```

### Check File Sizes

```bash
# See what's taking space
du -sh *
du -sh node_modules

# Delete node_modules to save space (can reinstall)
rm -rf node_modules
```

### View Files

```bash
# Show file contents
cat apps/web/app/bridge/page.tsx

# View with line numbers
cat -n apps/web/app/bridge/page.tsx

# View just first/last lines
head -20 path/to/file
tail -20 path/to/file
```

## Troubleshooting

### "Node not found" or "npm not found"

```bash
# Verify installation
which node
which npm

# If not found, reinstall
pkg install nodejs

# Verify paths are in shell
echo $PATH  # Should contain /data/data/com.termux/files/usr/bin
```

### Build Fails with Type Errors

```bash
# Most common: dependencies not installed
npm install

# Clean install (nuclear option)
rm -rf node_modules package-lock.json
npm install

# Verify types
npm run typecheck
```

### "Permission denied" or "could not read Username" when pushing

```bash
# RECOMMENDED: Use GitHub CLI (simpler than SSH)
pkg install gh
gh auth login --web
gh auth setup-git

# Then push with HTTPS (not SSH)
git remote set-url origin https://github.com/coopeverything/TogetherOS.git
git push origin yolo

# ALTERNATIVE: SSH key setup
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub  # Copy this
# Add to https://github.com/settings/keys
ssh -T git@github.com  # Test connection
```

### "Author identity unknown" when committing

```bash
# Git doesn't know who you are
git config user.email "132305976+coopeverything@users.noreply.github.com"
git config user.name "CoopEverything!"

# Then retry your commit
git commit -m "your message"
```

### npm install fails with "Unsupported platform"

```bash
# Some packages don't support Android (like @pact-foundation/pact-core)
# Use --ignore-scripts --force to skip native modules
npm install --ignore-scripts --force

# This is safe - those packages are optional dev dependencies
# All core functionality works without them
```

### "Database connection failed"

```bash
# Tablet development uses remote VPS database
# Ensure .env.local has:
# DB_HOST=coopeverything.org  (NOT localhost)
# DB_PASSWORD=... (correct VPS password)

# Don't try to run PostgreSQL locally on tablet
# It won't work on ARM64 Termux without complex setup
```

### "Out of storage" error

```bash
# Check space
df -h

# node_modules can be large - delete if needed
rm -rf node_modules

# Reinstall later
npm install

# Clear package manager cache
pkg clean

# Other space hogs to check
du -sh ~/
ls -lh ~/.cache/
```

### Text Editor Issues

If `nano` is slow or freezes:

```bash
# Use vim instead (faster)
pkg install vim
vim path/to/file

# Or use vi (minimal editor, always available)
vi path/to/file

# Keyboard shortcuts:
# vi: Esc + :wq (write and quit)
# vi: Esc + :q! (quit without saving)
# vim: Same as vi
```

## Performance Tips

### Work on Smaller Files

- Edit one small file at a time
- Large monorepo operations (npm install) are slower on tablet
- Don't do full rebuilds unless necessary - use `npm run typecheck` first

### Use Aliases for Common Commands

```bash
# Add to ~/.bashrc
alias cd-proj="cd ~/TogetherOS"
alias ll="ls -la"
alias gs="git status"
alias gc="git commit"
alias gp="git push"

# Reload shell
source ~/.bashrc
```

### Skip Unnecessary Operations

```bash
# Build TypeScript only (faster)
npm run typecheck

# Build only necessary workspace
npm run build --workspace=@togetheros/types

# Skip test watch mode
npm test -- --no-watch
```

## Next Steps After Setup

1. **Verify Everything Works**
   ```bash
   npm install
   npm run typecheck
   npm run build
   ./scripts/validate.sh
   ```

2. **Read Cross-Device Workflow Guide**
   See: `docs/_device-notes/CROSS_DEVICE_WORKFLOW.md`

3. **Try Your First Feature Branch**
   ```bash
   git checkout -b feature/my-first-change
   # Make a small change
   git commit -m "docs: add example"
   git push -u origin feature/my-first-change
   # Create PR on GitHub
   ```

4. **Set Up Claude Code (Optional)**
   - If using Claude Code CLI: Verify SSH keys work
   - Run: `git push --dry-run origin yolo` to test
   - Claude Code will use these same credentials

## Limitations & Workarounds

| Task | Tablet | Workaround |
|------|--------|-----------|
| Local PostgreSQL | ❌ No | Use remote VPS database via `.env.local` |
| `npm run dev` with DB | ❌ No | Only works without live database |
| Docker | ❌ No | Not supported in Termux |
| Visual debugging | ❌ No | Use console.log + build verification |
| Full IDE | ❌ No | Use nano/vim + GitHub web interface |
| `actionlint` | ❌ No | CI validates GitHub Actions on push |
| Database migrations | ❌ No | Run on VPS only (not automated on tablet) |

## Getting Help

### If setup fails:

1. **Check error message** - note exact text
2. **Verify prerequisites** - `node --version`, `git --version`
3. **Check network** - tablet needs internet for git clone, npm install
4. **Try again** - transient network issues are common on mobile

### For specific problems:

- **Git issues:** `git status` and `git log` usually show the problem
- **Node issues:** Check `npm cache clean --force` and retry
- **Storage issues:** Run `df -h` and consider deleting node_modules
- **SSH issues:** `ssh -T git@github.com` for detailed error messages

## Related Documentation

- **Cross-Device Workflow:** `docs/_device-notes/CROSS_DEVICE_WORKFLOW.md`
- **Development Operations:** `docs/OPERATIONS.md`
- **Project Conventions:** `.claude/CLAUDE.md`

