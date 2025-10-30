# Dual-Branch Documentation Strategy
**Date:** 2025-10-29
**Purpose:** Structure TogetherOS for both human contributors (main) and AI automation (yolo)

---

## EXECUTIVE SUMMARY

**Problem:** yolo contains valuable features BUT also automation docs that would confuse human contributors

**Solution:** Create shared knowledge structure + branch-specific automation

**Result:**
- **main** = Clean, human-friendly, no automation clutter
- **yolo** = Full automation + all features
- **docs/knowledge/** = Shared source of truth

---

## ANALYSIS OF CLAUDE KB

### Claude/Automation-SPECIFIC (Keep ONLY in yolo)

1. **`.claude/preferences.md`** - Claude Code preferences, YOLO mode, Notion updates
2. **`.claude/skills/togetheros-code-ops.md`** - YOLO skill automation
3. **Parts of ci-cd-discipline** - Claude branch naming (`claude/{module}-{sessionId}`)

### GENERAL PROJECT DOCS (Move to shared location)

1. **architecture.md** - Technical architecture, domain-driven design ✅ 100% general
2. **bridge-module.md** - Bridge AI module spec ✅ 100% general
3. **tech-stack.md** - Frameworks, tools, dependencies ✅ 100% general
4. **cooperation-paths.md** - 8 Cooperation Paths taxonomy ✅ 100% general
5. **data-models.md** - Entity specifications ✅ 100% general (likely)
6. **governance-module.md** - Governance spec ✅ 100% general (likely)
7. **social-economy.md** - Social economy features ✅ 100% general (likely)
8. **togetheros-kb.md** - Core project identity ⚠️ Mixed (needs splitting)

---

## PROPOSED STRUCTURE

### Shared Across Both Branches

```
docs/
├── knowledge/                    # NEW: General project knowledge
│   ├── README.md                 # Index of knowledge docs
│   ├── architecture.md           # From .claude/knowledge/
│   ├── tech-stack.md             # From .claude/knowledge/
│   ├── cooperation-paths.md      # From .claude/knowledge/
│   ├── data-models.md            # From .claude/knowledge/
│   ├── project-overview.md       # NEW: Cleaned togetheros-kb.md
│   │
│   ├── modules/                  # Module specifications
│   │   ├── bridge.md             # From .claude/knowledge/bridge-module.md
│   │   ├── governance.md         # From .claude/knowledge/governance-module.md
│   │   └── social-economy.md     # From .claude/knowledge/social-economy.md
│   │
│   └── guides/                   # How-to guides
│       ├── contributing.md       # For human contributors
│       ├── git-workflow.md       # Branch/commit conventions
│       └── code-review.md        # PR review process
│
├── CI/
│   └── Actions_Playbook.md       # Different versions per branch
│
└── ... (existing docs remain)
```

### MAIN Branch ONLY (Human Contributors)

```
main branch excludes:
├── .claude/                      # ❌ REMOVE entirely
├── codex/                        # ❌ REMOVE or make docs-only
├── .github/workflows/
│   ├── codex-*.yml               # ❌ REMOVE all Codex workflows
│   ├── claude-specific.yml       # ❌ REMOVE Claude automation
│   └── (Keep: lint, docs, smoke, security checks)
│
└── docs/contributors/            # ✅ ADD human-friendly guides
    ├── GETTING_STARTED.md
    ├── FIRST_CONTRIBUTION.md
    └── REVIEW_PROCESS.md
```

### CLAUDE-YOLO Branch ONLY (Full Automation)

```
yolo branch keeps:
├── .claude/                      # ✅ KEEP all automation
│   ├── knowledge/                # Can symlink to docs/knowledge/ OR keep separate
│   ├── preferences.md
│   └── skills/
│       └── togetheros-code-ops.md
│
├── codex/                        # ✅ KEEP automation system
│   ├── taxonomy/
│   └── notes/
│
└── .github/workflows/            # ✅ KEEP all workflows
    ├── codex-gateway.yml
    ├── codex-preflight.yml
    └── ... (all automation)
```

---

## FILE-BY-FILE MIGRATION PLAN

### Phase 1: Create Shared Knowledge Structure

**Create `docs/knowledge/` with these files:**

| Source | Destination | Changes |
|--------|-------------|---------|
| `.claude/knowledge/architecture.md` | `docs/knowledge/architecture.md` | None (100% general) |
| `.claude/knowledge/tech-stack.md` | `docs/knowledge/tech-stack.md` | None (100% general) |
| `.claude/knowledge/cooperation-paths.md` | `docs/knowledge/cooperation-paths.md` | None (100% general) |
| `.claude/knowledge/data-models.md` | `docs/knowledge/data-models.md` | None (100% general) |
| `.claude/knowledge/bridge-module.md` | `docs/knowledge/modules/bridge.md` | None (100% general) |
| `.claude/knowledge/governance-module.md` | `docs/knowledge/modules/governance.md` | None (100% general) |
| `.claude/knowledge/social-economy.md` | `docs/knowledge/modules/social-economy.md` | None (100% general) |
| `.claude/knowledge/togetheros-kb.md` | `docs/knowledge/project-overview.md` | ⚠️ Remove Claude-specific sections |
| `.claude/knowledge/ci-cd-discipline.md` | Split into two versions | See below |

### Phase 2: Split CI/CD Discipline

**Current:** `.claude/knowledge/ci-cd-discipline.md` has mixed content

**Split into:**

1. **`docs/knowledge/guides/ci-cd-for-contributors.md`** (main branch)
   - General git workflow
   - Commit message format
   - PR requirements
   - Proof lines concept
   - Branch protection
   - ❌ Remove: Claude branch naming, YOLO mode, automation specifics

2. **`.claude/knowledge/ci-cd-discipline.md`** (yolo branch)
   - Keep all automation details
   - Claude session branches
   - YOLO workflow
   - Automation retry logic

### Phase 3: Create Human-Friendly Guides

**New files for main branch:**

1. **`docs/contributors/GETTING_STARTED.md`**
   - Clone repo
   - Install dependencies
   - Run locally
   - Make first change
   - Submit PR
   - No automation mentioned

2. **`docs/contributors/WORKFLOW.md`**
   - Branch from main
   - Naming conventions (feature/*, fix/*, docs/*)
   - Commit message format
   - Run validation locally
   - Open PR with proof lines
   - Code review process

3. **`docs/contributors/CODE_REVIEW.md`**
   - What reviewers look for
   - How to respond to feedback
   - Approval process
   - Merge requirements

### Phase 4: Main Branch Cleanup

**Remove from main:**

```bash
# Directories to remove
.claude/                          # Entire directory
codex/                            # Or make read-only docs

# Workflows to remove
.github/workflows/codex-gateway.yml
.github/workflows/codex-preflight.yml
.github/workflows/codex-autolabel.yml
.github/workflows/auto-progress-update.yml  # (if Claude-specific)
.github/workflows/sync-github-project.yml   # (if Claude-specific)

# Keep these workflows
.github/workflows/lint.yml
.github/workflows/ci_docs.yml
.github/workflows/smoke.yml
.github/workflows/pr-proof-check.yml
.github/workflows/pr-metadata-preflight.yml
.github/workflows/pr-codex-guard.yml  # Or rename to pr-path-guard.yml
.github/workflows/deploy.yml
.github/workflows/admin-delete-runs.yml
```

### Phase 5: Update Cross-References

**Files with internal links to update:**

1. **README.md** - Point to `docs/knowledge/` instead of `.claude/knowledge/`
2. **docs/OPERATIONS.md** - Update KB references
3. **All module docs** - Update cross-references
4. **CI workflows** - Update validation paths if needed

---

## MERGE STRATEGY: yolo → main

### What to Merge

✅ **Include:**
- All application code (apps/web/, packages/)
- Database schema and migrations
- Auth system (Supabase integration)
- User onboarding and dashboard
- Bridge module UI/API
- Design system
- Production config
- Test improvements
- Documentation improvements in `docs/`
- Workflow improvements (lint, docs, smoke)

❌ **Exclude:**
- `.claude/` directory
- `codex/` directory (or make docs-only)
- Codex automation workflows
- Claude-specific workflows
- Auto-progress-update workflow
- GitHub project sync workflow
- Any scripts that reference Claude/Codex automation

### Merge Commands

```bash
# 1. Create merge branch
git checkout -b merge/yolo-to-main main
git fetch origin yolo

# 2. Selective merge (exclude automation)
git merge origin/yolo --no-commit --no-ff

# 3. Unstage automation directories
git reset HEAD .claude/
git reset HEAD codex/
git reset HEAD .github/workflows/codex-*.yml
git reset HEAD .github/workflows/auto-progress-update.yml
git reset HEAD .github/workflows/sync-github-project.yml

# 4. Review and commit
git status  # Verify what's being merged
git commit -m "merge: integrate yolo features without automation

Merges application features from yolo:
- Auth system and user onboarding
- Dashboard and profile pages
- Bridge module UI/API
- Design system implementation
- Production configuration
- Workflow optimizations

Excludes automation systems:
- Claude Code automation (.claude/)
- Codex automation (codex/)
- Automation-specific workflows

This creates a clean main branch for human contributors while
preserving full automation in yolo branch."

# 5. Handle conflicts if any
# 6. Test thoroughly
# 7. Merge to main
git checkout main
git merge merge/yolo-to-main
git push origin main
```

---

## POST-MERGE TASKS

### 1. Migrate Knowledge Files

```bash
# On both branches, move files
mkdir -p docs/knowledge/modules
mkdir -p docs/knowledge/guides

# Move general docs
git mv .claude/knowledge/architecture.md docs/knowledge/
git mv .claude/knowledge/tech-stack.md docs/knowledge/
git mv .claude/knowledge/cooperation-paths.md docs/knowledge/
git mv .claude/knowledge/data-models.md docs/knowledge/
git mv .claude/knowledge/bridge-module.md docs/knowledge/modules/bridge.md
git mv .claude/knowledge/governance-module.md docs/knowledge/modules/governance.md
git mv .claude/knowledge/social-economy.md docs/knowledge/modules/social-economy.md

# Create new files
# - docs/knowledge/project-overview.md (clean version of togetheros-kb.md)
# - docs/knowledge/guides/ci-cd-for-contributors.md
# - docs/contributors/GETTING_STARTED.md
# - docs/contributors/WORKFLOW.md
# - docs/contributors/CODE_REVIEW.md
```

### 2. Update README.md

**Main branch version:**

```markdown
# TogetherOS

Cooperation-first operating system for communities to self-organize.

## For Contributors

- **Getting Started:** [docs/contributors/GETTING_STARTED.md](docs/contributors/GETTING_STARTED.md)
- **Workflow:** [docs/contributors/WORKFLOW.md](docs/contributors/WORKFLOW.md)
- **Project Knowledge:** [docs/knowledge/](docs/knowledge/)

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Documentation

- [Project Overview](docs/knowledge/project-overview.md)
- [Architecture](docs/knowledge/architecture.md)
- [Tech Stack](docs/knowledge/tech-stack.md)
- [8 Cooperation Paths](docs/knowledge/cooperation-paths.md)

## Contributing

See [GETTING_STARTED.md](docs/contributors/GETTING_STARTED.md) for your first contribution.
```

### 3. Update `.gitignore` (main branch)

```gitignore
# Automation systems (not in main branch)
.claude/
codex/
```

### 4. Create Knowledge Index

**`docs/knowledge/README.md`:**

```markdown
# TogetherOS Knowledge Base

General project documentation for all contributors.

## Core Concepts

- [Project Overview](project-overview.md) - Mission, principles, and philosophy
- [Architecture](architecture.md) - Technical design and patterns
- [Tech Stack](tech-stack.md) - Frameworks, tools, and dependencies
- [8 Cooperation Paths](cooperation-paths.md) - Taxonomy and organization

## Modules

- [Bridge](modules/bridge.md) - AI assistant for cooperation
- [Governance](modules/governance.md) - Transparent decision-making
- [Social Economy](modules/social-economy.md) - Mutual aid and timebanking

## Guides

- [CI/CD for Contributors](guides/ci-cd-for-contributors.md) - Validation and proof lines
- [Getting Started](../contributors/GETTING_STARTED.md) - First contribution
- [Workflow](../contributors/WORKFLOW.md) - Git workflow and conventions
```

### 5. Branch Protection Updates

**Configure on GitHub:**

**main branch:**
- Require PR reviews: 1 approval
- Require status checks: `ci/lint`, `ci/docs`, `ci/smoke`
- Require proof lines in PR body (via pr-proof-check workflow - make it blocking!)
- No direct pushes to main

**yolo branch:**
- Same protections as main
- Can have looser requirements for rapid iteration

---

## BENEFITS OF THIS STRUCTURE

### For Human Contributors (main branch)

✅ **Clean, inviting repository:**
- No confusing automation directories
- Clear getting started path
- Human-friendly documentation
- Standard git workflow

✅ **Preserved checks and balances:**
- Lint checks (YAML, Markdown)
- Proof line requirements
- PR metadata validation
- Code review process

✅ **Easy to understand:**
- `/docs/knowledge/` = project knowledge
- `/docs/contributors/` = how to contribute
- No `.claude/` or `codex/` confusion

### For AI Automation (yolo branch)

✅ **Full automation preserved:**
- All Codex features
- Claude YOLO mode
- Notion integration
- Automated progress tracking

✅ **Access to shared knowledge:**
- Can read `/docs/knowledge/` for general docs
- Can keep `.claude/knowledge/` for automation-specific

✅ **Dual structure works:**
- Both automation AND human-readable docs
- Symlinks or copies as needed

### For Project Maintenance

✅ **Single source of truth:**
- General docs in `/docs/knowledge/`
- No duplication between branches
- Updates propagate to both

✅ **Clear branch purposes:**
- main = production, human contributors
- yolo = development, full automation

✅ **Easy to explain:**
- "Want to contribute? Use main branch"
- "Want full automation? Use yolo branch"

---

## IMPLEMENTATION TIMELINE

### Week 1: Preparation
- Day 1-2: Create `/docs/knowledge/` structure
- Day 3-4: Migrate general docs from `.claude/knowledge/`
- Day 5: Create human contributor guides

### Week 2: Main Branch Cleanup
- Day 1-2: Selective merge from yolo
- Day 3: Remove automation directories
- Day 4: Update cross-references
- Day 5: Test and verify

### Week 3: Polish & Documentation
- Day 1-2: Update README, docs index
- Day 3: Create migration guide for contributors
- Day 4-5: Final testing, branch protection setup

---

## DECISION NEEDED

### Option A: Shared Knowledge via Copy (RECOMMENDED)

**Both branches have:** `docs/knowledge/`

**Pros:**
- Independent branches
- No symlink complexity
- Easy to understand
- Main can diverge if needed

**Cons:**
- Docs can drift between branches
- Updates must be made twice

**Mitigation:** Periodic sync from yolo → main for docs only

### Option B: Shared Knowledge via Symlinks

**Both branches have:** `docs/knowledge/` (real)
**yolo has:** `.claude/knowledge/` → symlinks to `docs/knowledge/`

**Pros:**
- No duplication
- Single source of truth
- Automatic sync

**Cons:**
- Symlinks can be confusing
- Git symlink support varies
- More complex to maintain

**Recommendation:** Use **Option A** for simplicity

---

## NEXT STEPS

1. **Review this proposal** - Does this structure make sense?

2. **Decide on merge timing** - Ready to merge yolo → main now?

3. **Choose knowledge strategy** - Copy or symlinks?

4. **Create migration branches:**
   - `feature/shared-knowledge-structure` - Create `/docs/knowledge/`
   - `feature/contributor-guides` - Create `/docs/contributors/`
   - `merge/yolo-to-main-clean` - Selective merge without automation

5. **Execute in order:**
   - First: Create shared structure (both branches)
   - Second: Migrate docs to shared location (both branches)
   - Third: Merge yolo features to main (selective)
   - Fourth: Remove automation from main
   - Fifth: Update cross-references and indexes

---

## QUESTIONS FOR YOU

1. **Ready to merge yolo to main?** (You said not yet, but now?)

2. **Keep codex/ in main as docs-only?** Or remove entirely?
   - Option A: Remove entirely
   - Option B: Keep `codex/taxonomy/CATEGORY_TREE.json` (just the taxonomy)
   - Option C: Keep all codex docs but remove automation

3. **Knowledge structure preference?**
   - Option A: Copy docs to both branches (recommended)
   - Option B: Symlinks (complex)

4. **Should I implement this now?** Or create as a plan document first?

---

**This structure lets main be clean and welcoming for humans while preserving full automation power in yolo. Both branches benefit from shared knowledge, neither duplicates work unnecessarily.**

Ready to proceed?
