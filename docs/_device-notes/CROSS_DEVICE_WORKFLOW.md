# Cross-Device Workflow: PC ↔ Tablet Development

## Overview

TogetherOS can be developed on both Windows PC and Android tablet (Termux). This guide explains how to coordinate work across devices while avoiding conflicts and maintaining clean git history.

## Device Capabilities Matrix

| Operation | PC (Windows) | Tablet (Termux) | Notes |
|-----------|-------------|-----------------|-------|
| **Code Editing** | ✅ Full IDE | ✅ nano/vim | Tablet slower, fewer tools |
| **Git Operations** | ✅ Yes | ✅ Yes | Both support full workflow |
| **npm install/build** | ✅ Yes | ✅ Yes | Tablet takes longer |
| **TypeScript check** | ✅ Yes | ✅ Yes | Both equivalent |
| **Local Database** | ✅ PostgreSQL | ❌ No | Tablet uses remote VPS |
| **Full dev server** | ✅ npm run dev | ❌ No | DB required |
| **Docker** | ✅ Yes | ❌ No | Not available on Termux |
| **PR Creation** | ✅ gh CLI | ✅ gh CLI | Both identical |
| **Branch Management** | ✅ Yes | ✅ Yes | Both equivalent |

## Workflow Strategies

### Strategy 1: Sequential Development (Safest)

Use this if you want zero complexity around merges.

**Pattern:**
```
PC Start    → Feature branch → Initial implementation → Commit/Push
            ↓
Tablet      → Pull branch → Continue work → Commit/Push
            ↓
PC End      → Pull updates → Final polish/PR → Create PR
```

**Example Session:**

**Day 1 (PC):**
```bash
git checkout -b feature/bridge-member-integration
# Edit /apps/web/app/api/bridge/ask/route.ts
# Add member context loading
npm run build
git commit -m "feat(bridge): add user context detection"
git push -u origin feature/bridge-member-integration
```

**Day 2 (Tablet):**
```bash
git checkout feature/bridge-member-integration
git pull origin feature/bridge-member-integration
# Edit /lib/db/users.ts additions if needed
# Update documentation
npm run typecheck
git commit -m "docs(bridge): document member context usage"
git push origin feature/bridge-member-integration
```

**Day 3 (PC):**
```bash
git checkout feature/bridge-member-integration
git pull origin feature/bridge-member-integration
# Review tablet changes
# Add final touches
# Run full test suite
git push origin feature/bridge-member-integration
gh pr create --base yolo --title "feat(bridge): member integration"
```

**Advantages:**
- ✅ Zero merge conflicts
- ✅ Clear separation of work
- ✅ Easy to review changes
- ✅ Good for larger features

**Disadvantages:**
- ❌ Can't work simultaneously
- ❌ Slower for quick iterations

---

### Strategy 2: Parallel Development (Advanced)

Use this if you want to work simultaneously without blocking.

**Pattern:** Divide work by module/file

```
PC works on:        Tablet works on:
- /apps/web/*       - /docs/* (documentation)
- UI components     - /packages/types (TypeScript types)
- Backend logic     - /packages/validators (validation)
                    - Shell scripts

Both: Pull before starting each session
Both: Push frequently (every 30 min)
Both: Coordinate which files you're touching
```

**Example Session:**

**Day 1 (PC & Tablet Simultaneous):**

*PC Session:*
```bash
git checkout yolo && git pull origin yolo
git checkout -b feature/bridge-integration
# Work on /apps/web/app/api/bridge/ask/route.ts
# Push every 30 min
git push origin feature/bridge-integration
```

*Tablet Session (Same Feature Branch):*
```bash
git checkout yolo && git pull origin yolo
git checkout feature/bridge-integration  # Same branch as PC!
git pull origin feature/bridge-integration
# Work on /docs/_device-notes/BRIDGE_TABLET_GUIDE.md
# Work on /packages/types/src/bridge.ts (types only)
# Push every 30 min
git push origin feature/bridge-integration
```

*Integration:*
```bash
# Both pull before starting
# PC: git pull origin feature/bridge-integration
# Tablet: git pull origin feature/bridge-integration
# Continue from latest code
```

**Advantages:**
- ✅ Work simultaneously
- ✅ Fast iteration cycles
- ✅ Good for documentation + code split
- ✅ Both devices stay in sync

**Disadvantages:**
- ⚠️ Must coordinate file boundaries
- ⚠️ Pull frequently to avoid conflicts
- ⚠️ Requires discipline on commit messages

**How to Avoid Conflicts:**
1. **Divide files clearly** - PC takes UI, Tablet takes docs
2. **Pull before each session** - `git pull origin branch-name`
3. **Push frequently** - Every 15-30 minutes
4. **Use descriptive commits** - Helps understand what changed
5. **Communicate intent** - Use branch name and commit messages

---

### Strategy 3: Tablet for Quick Edits (Flexible)

Use this if tablet is mainly for documentation and bug fixes.

**Pattern:**
```
PC:      Main development (UI, features, complex logic)
Tablet:  Documentation updates, quick fixes, PR reviews
Both:    Can create PRs, handle urgent issues
```

**Example:**

**PC (Main Work):**
```bash
git checkout -b feature/bridge-complete
# Implement full Bridge member integration
# 3-4 hours of complex work
git push origin feature/bridge-complete
```

**Tablet (Quick Tasks):**
```bash
git checkout yolo && git pull
git checkout -b docs/bridge-setup-guide
# Write TERMUX_SETUP.md documentation
# Edit README with examples
git push -u origin docs/bridge-setup-guide
# Create separate PR for docs
```

**Advantages:**
- ✅ PC handles complex work
- ✅ Tablet handles focused tasks
- ✅ No file conflicts
- ✅ Clear task boundaries

**Disadvantages:**
- ❌ Can't work on same feature together
- ❌ Limited tablet capabilities

---

## Conflict Prevention Checklist

Before starting a work session on EITHER device:

```bash
# 1. Always pull first
git pull origin yolo
git pull origin your-feature-branch  # If continuing existing branch

# 2. Check status
git status
# Should show: "Your branch is up to date with 'origin/...'"

# 3. Only THEN start editing
# If status doesn't show "up to date", pull again!

# 4. After edits, push frequently
git commit -m "message"
git push origin branch-name

# 5. Before switching to other device, push
git push origin branch-name  # Confirm push succeeded

# 6. On other device, pull BEFORE editing
git pull origin branch-name
```

## Handling Merge Conflicts

If you get a merge conflict:

**On PC (better tools):**
```bash
git pull origin feature/bridge-integration

# If conflicts appear:
git status  # Shows which files conflict

# Open in VS Code
code path/to/conflicted/file

# Resolve conflicts in editor, then:
git add path/to/conflicted/file
git commit -m "resolve merge conflicts"
git push origin feature/bridge-integration

# Push back, tablet pulls it
```

**On Tablet (manual resolution):**
```bash
git pull origin feature/bridge-integration

# If conflicts appear:
# 1. View conflict
cat path/to/conflicted/file

# 2. Edit with nano
nano path/to/conflicted/file

# 3. Remove conflict markers manually:
# <<<<<<< HEAD
# (tablet changes)
# =======
# (pc changes)
# >>>>>>> origin/feature

# 4. Keep what you want, delete markers

# 5. Stage and commit
git add path/to/conflicted/file
git commit -m "resolve merge conflicts"
git push origin feature/bridge-integration

# 6. PC pulls the resolved version
git pull origin feature/bridge-integration
```

## Recommended Workflow Template

**For Most Features: Sequential + Quick Edits Hybrid**

```
Day 1 (PC):
├─ Create feature branch
├─ Implement main feature
├─ Run build, verify
└─ Push when done

Day 2+ (Tablet):
├─ Pull branch
├─ Update documentation
├─ Add examples/guides
├─ TypeScript types if needed
└─ Push updates

Day N (PC):
├─ Pull latest from tablet
├─ Final review & polish
├─ Run full test suite
├─ Create PR
└─ Merge to yolo
```

## Using Claude Code on Both Devices

Claude Code can work on both PC and tablet with same credentials.

**Same Features:**
- `yolo1` skill works identically on both
- `pr-formatter` skill works on both
- `status-tracker` skill syncs via Notion
- All git operations identical

**Differences:**
- Tablet: No Docker, no local DB
- PC: Full development environment
- Both: Can create PRs and manage GitHub

**For Consistency:**
- Keep `.claude/CLAUDE.md` definitions same on both
- Use same `.env.local` pattern (PC = local DB, Tablet = remote DB)
- Both use `yolo` branch as base

## Git Workflow Comparison

### PC Development
```bash
# Typical PC flow
git checkout yolo
git pull origin yolo
git checkout -b feature/module-description

# Edit many files at once
npm run build        # Full build
npm run test         # Full test
npm run dev          # With database

# Create PR with all checks passing
git push origin feature/module-description
gh pr create --base yolo
```

### Tablet Development
```bash
# Typical Tablet flow
git checkout yolo
git pull origin yolo
git checkout -b feature/module-description

# Edit 1-2 files carefully
npm run typecheck    # Fast check only

# Can't run dev server or tests with DB
# Can run docs/types/scripts validation

git push origin feature/module-description
gh pr create --base yolo  # Same command works!
```

## Performance Expectations

**PC Development:**
- `npm install`: 2-5 min
- `npm run build`: 30-60 sec
- `npm run typecheck`: 10-20 sec
- `npm run dev`: 5-10 sec (with live reload)

**Tablet Development:**
- `npm install`: 5-15 min (much slower)
- `npm run build`: 60-120 sec
- `npm run typecheck`: 15-30 sec
- `npm run dev`: ❌ Not recommended (no DB)

**Recommendation:**
- Use tablet for quick edits (10-30 min tasks)
- Use PC for long dev sessions (1+ hour)
- Offload docs/types work to tablet while PC handles features

## Which Device for What?

### Use PC For:
- ✅ New feature development (complex logic)
- ✅ Full integration testing
- ✅ Local database setup & migrations
- ✅ Docker development
- ✅ Large refactoring
- ✅ Performance optimization

### Use Tablet For:
- ✅ Documentation writing
- ✅ TypeScript type definitions
- ✅ Adding examples & guides
- ✅ Quick bug fixes
- ✅ Editing package.json
- ✅ Shell script development
- ✅ PR reviews & feedback
- ✅ Updating markdown files
- ✅ When away from desk

### Use Both For:
- ✅ Coordinating same feature (sequential strategy)
- ✅ Parallel work on different files
- ✅ PR creation and merging
- ✅ Branch management
- ✅ Committing & pushing

## Branch Naming Across Devices

Use consistent branch names:

```bash
# Good (works on both)
feature/bridge-member-integration
docs/termux-setup-guide
fix/database-connection-timeout

# Bad (device-specific, avoid)
windows-feature-xyz
tablet-feature-abc
pc-only-fix
```

When branch is used on both devices:
```bash
# Both devices track same branch
git checkout feature/bridge-member-integration
git pull origin feature/bridge-member-integration  # Gets both devices' changes
git push origin feature/bridge-member-integration   # Both can push
```

## Keeping Notion Memory in Sync

If using Claude Code's `status-tracker` skill:

**Session Memory:**
- Automatically syncs via Notion
- Works on both PC and tablet
- Latest session notes available on both devices

**How to use:**
```bash
# At start of session
# Claude Code reads Notion (auto-generated)

# During session
# Work normally with yolo1, etc.

# At end of session
# Claude Code updates Notion with progress

# On next device
# You see what last device accomplished
```

**Note:** Tablet sessions may be shorter, so use clear commit messages + Notion updates to handoff to PC.

## Troubleshooting Cross-Device Issues

### "Your branch is ahead of origin by X commits"
```bash
# You have unpushed commits
git push origin branch-name

# Other device needs to pull
git pull origin branch-name
```

### "Your branch has diverged"
```bash
# Different commits on each device (conflict pattern)
# Don't just pull - understand what happened first

git log origin/branch-name --oneline -5  # See remote
git log --oneline -5                      # See local

# If local has good commits PC doesn't:
git push origin branch-name  # PC will pull these

# If both have new commits:
# Use PC to resolve (better tools)
# Resolve conflict manually
# Push resolved version
# Tablet pulls the resolved version
```

### "Can't push - permission denied"
```bash
# SSH key issue
ssh -T git@github.com

# On tablet: SSH key might not be set up
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub
# Add to GitHub settings
```

### "npm install fails on tablet"
```bash
# Network issue or disk full
df -h  # Check space

# Try again with network:
npm install

# If space issue:
rm -rf node_modules
npm cache clean --force
npm install

# If still fails: Use PC to install, commit package-lock
# Tablet: npm ci (faster, uses package-lock)
```

## Quick Reference

| Scenario | Solution |
|----------|----------|
| PC → Tablet | PC: `git push`, Tablet: `git pull` |
| Tablet → PC | Tablet: `git push`, PC: `git pull` |
| Merge conflict | Use PC for resolution (better tools) |
| Simultaneous edits | Divide files; pull frequently |
| Quick edit on tablet | Use `feature/docs-*` branches (don't conflict) |
| Complex feature | Start on PC, document on tablet |
| PR creation | Either device using `gh pr create` |
| Emergency fix | Either device can create emergency branch |
| Database work | PC only (no local DB on tablet) |
| Stuck in conflict? | `git reset --hard origin/branch-name` (loses local) |

## Related Documentation

- **Tablet Setup:** `docs/_device-notes/TERMUX_SETUP.md`
- **Development Operations:** `docs/OPERATIONS.md`
- **Project Conventions:** `.claude/CLAUDE.md`

