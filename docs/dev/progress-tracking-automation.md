# Progress Tracking Automation

**Version:** 1.0
**Last Updated:** 2025-10-29

## Overview

TogetherOS has an automated progress tracking system that keeps project status up-to-date across multiple documentation files. This guide explains how the system works and how to use it.

## Progress Tracking Files

### 1. `docs/STATUS_v2.md`
**Purpose:** Technical status dashboard with module-by-module progress percentages

**Format:** Markdown table with HTML comment markers for automation
```markdown
| **Identity & Auth** | ... | <!-- progress:auth=70 --> 70% | ... |
```

**Update Method:** Automated via scripts or manual edit

### 2. `STATUS/progress-log.md`
**Purpose:** Append-only chronological log of progress milestones

**Format:** Timestamped entries with descriptions
```markdown
## 2025-10-29 - Milestone Name
- **auth:** 70% - Completed JWT authentication
```

**Update Method:** Appended by automation scripts

**Note:** Previously, we maintained a third file `progress-report.md` with verbose details, but this was redundant with STATUS_v2.md and has been removed

---

## Automation Tools

### Script 1: `update-progress.sh`

**Purpose:** Update individual module progress percentages

**Usage:**
```bash
# Set a module to a specific percentage
./scripts/update-progress.sh auth 70

# Increment a module's progress
./scripts/update-progress.sh auth +5

# With description (logs to progress-log.md)
./scripts/update-progress.sh auth 75 "Completed OAuth integration"
```

**What it does:**
1. Updates the HTML comment marker in `docs/STATUS_v2.md`
2. Updates the visible percentage in the table
3. If description provided, appends entry to `STATUS/progress-log.md`

**Module Keys:**
```
Core Modules:
  scaffold, ui, auth, profiles, groups, forum, governance,
  social-economy, reputation, onboarding, search, notifications,
  docs-hooks, observability, security

Path Modules:
  path-education, path-governance, path-community, path-media,
  path-wellbeing, path-economy, path-technology, path-planet

DevEx Modules:
  devcontainer, ci-lint, ci-docs, ci-smoke, deploy, secrets
```

---

### Script 2: `generate-progress-report.sh`

**Purpose:** Generate comprehensive progress snapshot with project metrics

**Usage:**
```bash
# Generate report with default milestone name
./scripts/generate-progress-report.sh

# Generate report with custom milestone description
./scripts/generate-progress-report.sh "Completed OAuth integration"
```

**What it does:**
1. Extracts all module progress percentages from `STATUS_v2.md`
2. Counts TypeScript files, pages, API routes, database tables, components
3. Gathers recent commit history
4. Appends detailed milestone entry to `STATUS/progress-log.md`
5. Displays summary statistics

**Output Example:**
```
============================================
Progress Summary
============================================
Authentication: 70%
Scaffolding: 40%
UI System: 20%
...
Average Progress: 35%
TypeScript Files: 42
Pages: 7
API Routes: 8
Database Tables: 3
UI Components: 10
```

---

### GitHub Action: `auto-progress-update.yml`

**Purpose:** Automatically update progress when PRs are merged

**Trigger:** When a PR is merged to `yolo` or `main`

**How to use in PRs:**

Add progress markers in your PR description:
```markdown
## Progress Updates

progress:auth=+10
progress:onboarding=+5
```

**Syntax:**
- `progress:MODULE_KEY=XX` - Set to specific percentage
- `progress:MODULE_KEY=+XX` - Increment by percentage

**What it does:**
1. Extracts progress markers from PR body
2. Calls `update-progress.sh` for each update
3. Commits changes back to the branch
4. Uses `[skip ci]` to prevent infinite loops

**Example PR Description:**
```markdown
## What & Why
Completed OAuth integration with Google and Facebook providers.

## Progress Updates
progress:auth=+15

## Touchpoints
- lib/auth/oauth/google.ts
- lib/auth/oauth/facebook.ts
- apps/web/app/api/auth/oauth/route.ts

## Proof
LINT=OK
SMOKE=OK
```

---

## Manual Workflows

### After Completing a Major Feature

1. **Update module progress:**
   ```bash
   ./scripts/update-progress.sh auth 75 "OAuth integration complete"
   ```

2. **Generate progress report:**
   ```bash
   ./scripts/generate-progress-report.sh "OAuth integration milestone"
   ```

3. **Commit changes:**
   ```bash
   git add docs/STATUS_v2.md STATUS/progress-log.md
   git commit -m "docs(status): update progress for auth module"
   ```

### Weekly Progress Review

Run weekly to track overall progress:

```bash
./scripts/generate-progress-report.sh "Week of $(date +%Y-%m-%d)"
```

This creates a timestamped snapshot in `progress-log.md` for historical tracking.

---

## Git Hooks (Optional)

### Post-Commit Hook

To automatically generate progress snapshots after significant commits:

Create `.git/hooks/post-commit`:

```bash
#!/usr/bin/env bash

# Only run on commits that mention "feat" or "fix"
COMMIT_MSG=$(git log -1 --pretty=%B)

if [[ "${COMMIT_MSG}" =~ ^(feat|fix) ]]; then
  echo "Generating progress snapshot..."
  ./scripts/generate-progress-report.sh "Auto: ${COMMIT_MSG:0:50}"
fi
```

Make it executable:
```bash
chmod +x .git/hooks/post-commit
```

**Note:** This is optional and may add overhead to commits. Consider if it's useful for your workflow.

---

## Best Practices

### 1. Update Progress Incrementally

Don't wait for 100% completion. Update progress as you make meaningful increments:
- Small feature completed: +5-10%
- Significant milestone: +15-25%
- Module fully functional: 80-100%

### 2. Use Descriptions

Always provide descriptions when updating progress:
```bash
# Good
./scripts/update-progress.sh auth 70 "JWT auth and session management complete"

# Less helpful
./scripts/update-progress.sh auth 70
```

### 3. Include Progress Markers in PRs

Make it a habit to include `progress:MODULE=+XX` in PR descriptions so the automation can track changes.

### 4. Generate Reports at Milestones

Run `generate-progress-report.sh` at significant milestones:
- End of each sprint/week
- Major feature completion
- Before demos or releases
- After completing multiple modules

### 5. Review STATUS_v2.md Periodically

The `STATUS_v2.md` file should be reviewed and updated:
- At major milestones (MVP, beta, v1.0)
- When blockers are resolved or new ones identified
- When timeline changes significantly
- Quarterly for comprehensive review

---

## Integration with CI/CD

### Automatic Checks

The progress tracking system integrates with CI:

1. **Lint checks:** Ensure `STATUS_v2.md` is well-formed
2. **Docs validation:** Links and formatting checks
3. **Progress markers:** PR checks validate progress syntax

### Status Badges (Future)

Consider adding progress badges to README:

```markdown
![Auth Progress](https://img.shields.io/badge/Auth-70%25-yellow)
![UI Progress](https://img.shields.io/badge/UI-20%25-red)
```

Can be auto-generated from `STATUS_v2.md` markers.

---

## Troubleshooting

### Script Not Finding Module

**Error:** `Module key 'xyz' not found`

**Solution:** Check available module keys:
```bash
grep -oP "<!-- progress:\K[a-z-]+" docs/STATUS_v2.md | sort -u
```

### Progress Not Updating in PR

**Check:**
1. PR description contains `progress:MODULE=VALUE` on its own line
2. Module key is valid
3. Percentage is 0-100 or +N
4. PR is merged (not just closed)

### Automation Not Running

**Check:**
1. GitHub Action has necessary permissions
2. Branch is `yolo` or `main`
3. `[skip ci]` is not in commit message (unless intentional)

---

## Advanced Usage

### Bulk Updates

Update multiple modules at once:

```bash
for module in auth profiles onboarding; do
  ./scripts/update-progress.sh "${module}" +5 "Polish and bug fixes"
done
```

### Custom Reports

Extract progress for specific paths:

```bash
grep "progress:path-" docs/STATUS_v2.md
```

### Progress Analytics

Track progress over time:

```bash
git log -p STATUS/progress-log.md | grep "^+"
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│         PR Merged with progress:auth=+10        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│    auto-progress-update.yml (GitHub Action)     │
│  - Extracts progress markers from PR body       │
│  - Calls update-progress.sh for each update     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         update-progress.sh (Script)             │
│  - Updates docs/STATUS_v2.md                    │
│  - Appends to STATUS/progress-log.md            │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│    generate-progress-report.sh (Manual/Hook)    │
│  - Gathers project metrics                      │
│  - Creates milestone snapshot                   │
│  - Appends to progress-log.md                   │
└─────────────────────────────────────────────────┘
```

---

## Summary

TogetherOS progress tracking is:
- **Automated** via GitHub Actions on PR merges
- **Scriptable** via shell scripts for manual updates
- **Multi-layered** with quick updates (percentages) and detailed reports
- **Integrated** with CI/CD and contributor workflows

Use the automation to keep status current without overhead, and generate comprehensive reports at milestones.

---

**Questions or Issues?**
- Check `docs/OPERATIONS.md` for contributor workflow
- See `.github/workflows/auto-progress-update.yml` for automation details
- Open an issue or discussion if scripts need enhancements
