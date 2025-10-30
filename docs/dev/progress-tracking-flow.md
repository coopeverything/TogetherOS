# Progress Tracking Flow

**Last Updated:** 2025-10-30

This document explains how progress tracking flows through TogetherOS from code commits to the live website.

---

## The Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. DEVELOPER CREATES PR                                    │
│  ─────────────────────                                      │
│  PR body includes: progress:ui=+15                          │
│  (means "increment ui module by 15%")                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. PR MERGED TO YOLO/MAIN                                  │
│  ──────────────────────                                     │
│  GitHub Actions trigger: auto-progress-update.yml           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. WORKFLOW EXTRACTS PROGRESS MARKERS                      │
│  ──────────────────────────────────────                     │
│  Regex: /progress:([a-z-]+)=(\+?\d+)/g                      │
│  Finds: ui=+15                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. RUNS update-progress.sh SCRIPT                          │
│  ───────────────────────────────                            │
│  ./scripts/update-progress.sh ui +15 "Auto from PR #123"   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. UPDATES TWO FILES                                       │
│  ──────────────────                                         │
│  docs/STATUS_v2.md:                                         │
│    <!-- progress:ui=80 --> 80% → <!-- progress:ui=95 --> 95%│
│                                                              │
│  STATUS/progress-log.md:                                    │
│    - 2025-10-30 14:30 UTC - ui: 95% - Auto from PR #123    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6. COMMITS AND PUSHES CHANGES                              │
│  ──────────────────────────                                 │
│  git commit -m "chore(status): auto-update progress for ui"│
│  git push origin yolo                                       │
│  [skip ci] tag prevents infinite loop                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  7. WEBSITE READS UPDATED DATA                              │
│  ──────────────────────────                                 │
│  User visits: coopeverything.org/status                     │
│  StatusClient component calls: /api/status                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  8. API PARSES STATUS_v2.md                                 │
│  ───────────────────────                                    │
│  apps/web/app/api/status/route.ts:                          │
│  - Reads docs/STATUS_v2.md from filesystem                  │
│  - Extracts: <!-- progress:ui=95 -->                        │
│  - Returns JSON with module data                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  9. WEBSITE DISPLAYS LIVE DATA                              │
│  ──────────────────────────                                 │
│  StatusClient renders:                                       │
│  - UI System: 95% ████████████████░                         │
│  - Visual progress bars and stats                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Sources (After Cleanup)

### 1. `docs/STATUS_v2.md`
**Purpose:** Single source of truth for current progress

**Format:**
```markdown
| Module | Progress |
|--------|----------|
| **UI System** | <!-- progress:ui=95 --> 95% |
```

**Updated by:**
- `scripts/update-progress.sh` (automated via CI)
- Manual edits (for corrections)

**Consumed by:**
- `apps/web/app/api/status/route.ts` → Website status page
- Developers reading docs
- CI workflows

---

### 2. `STATUS/progress-log.md`
**Purpose:** Append-only changelog of progress updates

**Format:**
```markdown
- **2025-10-30 14:30:00 UTC** - ui: 95% - Auto-update from PR #123
```

**Updated by:**
- `scripts/update-progress.sh` (when description provided)
- `scripts/generate-progress-report.sh`

**Consumed by:**
- Developers tracking history
- Project managers reviewing velocity

---

## Key Files and Their Roles

| File | Role | Auto-Updated? |
|------|------|---------------|
| `docs/STATUS_v2.md` | Current state (single source of truth) | ✅ Yes (via CI) |
| `STATUS/progress-log.md` | Historical changelog | ✅ Yes (via CI) |
| `status.md` | Entry point / index | ❌ Manual only |
| `.github/workflows/auto-progress-update.yml` | CI automation | ❌ Manual only |
| `scripts/update-progress.sh` | Update script | ❌ Manual only |
| `apps/web/app/api/status/route.ts` | Website API | ❌ Manual only |

---

## How to Update Progress

### Method 1: Automatic (Recommended)

**In PR body, add:**
```
progress:ui=+15
```

**When PR merges:**
- CI automatically updates STATUS_v2.md
- Logs entry to progress-log.md
- Website updates immediately

### Method 2: Manual

**For immediate updates:**
```bash
./scripts/update-progress.sh ui 95 "Completed all 25 components"
git add docs/STATUS_v2.md STATUS/progress-log.md
git commit -m "docs(status): update ui to 95%"
git push
```

---

## Verification Checklist

✅ **Flow is Sound:**
- ✅ STATUS_v2.md is single source of truth
- ✅ API reads from STATUS_v2.md
- ✅ Website displays data from API
- ✅ CI auto-updates STATUS_v2.md on PR merge
- ✅ progress-log.md tracks history
- ✅ No references to deleted progress-report.md
- ✅ No circular dependencies
- ✅ No stale data sources

✅ **After Removing progress-report.md:**
- ✅ CI workflows don't reference it
- ✅ Scripts don't reference it
- ✅ API doesn't reference it
- ✅ Website doesn't reference it
- ✅ All docs updated

---

## Troubleshooting

### Website shows outdated data

**Root Cause:** Website needs manual update after pushing to yolo

**The website deploys from the `yolo` branch:**
- Default branch: `yolo`
- Update script: `scripts/update-vps.sh` pulls from `origin/yolo`
- API reads: `docs/STATUS_v2.md` from repo root ✅

**To update production after pushing to yolo:**
```bash
# SSH into VPS
ssh root@72.60.27.167

# Run update script
/var/www/togetheros/scripts/update-vps.sh

# Or manually:
cd /var/www/togetheros
git pull origin yolo
cd apps/web
npm install && npm run build
pm2 restart togetheros
```

**Check:**
1. Is STATUS_v2.md up to date in the yolo branch? ✅
2. Has the VPS been updated since the push? (run update-vps.sh)
3. Is the API path correct? (`apps/web/app/api/status/route.ts:63`) ✅

### CI not updating progress

**Check:**
1. Does PR body have correct format? `progress:module-key=+10`
2. Did PR merge to yolo or main? (not other branches)
3. Check workflow run logs in GitHub Actions

### Progress marker not found

**Check:**
1. Is the module key correct? See STATUS_v2.md for valid keys
2. Does the HTML comment exist in STATUS_v2.md?

---

## Future Improvements

- [ ] Add progress validation in CI (catch invalid percentages)
- [ ] Add progress visualization in PR comments
- [ ] Cache API responses for faster status page loads
- [ ] Add historical progress graphs to website
- [ ] Create dashboard showing progress velocity

---

**Related Docs:**
- [Progress Tracking Automation](./progress-tracking-automation.md)
- [PR Checklist](./pr-checklist.md)
- [STATUS_v2.md](../STATUS_v2.md)
