---
name: yolo1
description: |
  **AUTO-TRIGGER when user says:** "implement [feature]", "build [module]", "create [functionality]", "add [capability]", "YOLO [task]", or requests complete feature implementation.

  End-to-end TogetherOS code operation: creates branch, implements changes with continuous testing, builds with retry-on-fail, commits, pushes, creates PR with auto-selected Cooperation Path, verifies PR is merge-ready, and updates Notion memory.

  Use proactively without asking permission when task matches skill purpose.
---

# TogetherOS Code Operations (YOLO Mode)

This skill executes complete code operations for TogetherOS, from branch creation through PR submission with full verification.

## Core Conventions

- **Base Branch**: `yolo` **⚠️ NEVER USE main AS BASE - ALWAYS USE yolo**
- **Branch Pattern**: `feature/{module}-{slice}`
- **Commit Format**: `feat({module}): {slice} - {scope}`
- **PR Target**: ALL PRs go to `yolo`, **NEVER to main**
- **Deployment**: VPS-only (coopeverything.org) - **NO Vercel/Vertex**
- **Design System**: Follow `docs/design/system.md` for all UI work (colors, typography, components)
- **PR Verification**: Always include in PR body:
  ```
  Verified: All changes tested during implementation, build passes
  ```

## PR Category & Keywords

**See:** `pr-formatter` skill for:
- The 8 Cooperation Paths taxonomy
- Module → Path mapping
- Keyword generation logic
- PR body formatting requirements

## Required Inputs

1. **module** (required): Target module name (e.g., "bridge", "governance")
2. **slice** (required): Short feature slice name (e.g., "scaffold", "api-setup")
3. **scope** (required): 1-3 sentence description of changes to make

## Optional Inputs

- **commands.install**: Override install command (default: `npm ci`)
- **commands.build**: Override build command (default: `npm run build`)
- **commands.test**: Add test command if needed (default: none in YOLO mode)
- **progress**: Estimated progress increase percentage (e.g., "10" or "+10", default: auto-calculate based on work)
- **skip_progress**: Set to "true" to skip progress tracking (default: false)

## Workflow Steps

### 1. Preparation
- Ensure repo is on `yolo` branch and up to date
- Create feature branch: `feature/{module}-{slice}`

### 2. Implementation (Test as You Go)
- Apply scoped edits described in the `scope` parameter
- **CRITICAL**: Test your work continuously during implementation:
  - Read files you create/modify to verify correctness
  - Check syntax and logic as you write
  - Verify imports and dependencies
  - Ensure type safety
- List each file touched with a brief reason
- Keep changes strictly within scope (no scope creep)

### 3. Dependency Installation
- Run install command (default: `npm ci`)
- Verify dependencies installed correctly

### 4. Build with Auto-Retry
- Run build command (default: `npm run build`)
- **If build fails:**
  1. Read error output carefully
  2. Identify the specific issue (type error, import error, syntax error, etc.)
  3. Fix the issue
  4. Re-run build
  5. Repeat until build succeeds
- **Never give up on build failures** - keep correcting until build passes

### 5. Optional Testing
- If `commands.test` is provided, run tests
- Fix any test failures using the same retry approach as builds

### 6. Validation (Optional but Recommended)
- If `scripts/validate.sh` exists, run it to get proof lines
- This runs linting and validation checks
- Outputs: `LINT=OK` and `VALIDATORS=GREEN`
- If validation fails, fix issues and retry
- These proof lines should be included in PR body

### 7. Git Operations
- Commit with message: `feat({module}): {slice} - {scope}`
- Push branch: `git push -u origin feature/{module}-{slice}`

### 8. Progress & Next Steps Update

**Use `status-tracker` skill** to:
- Calculate estimated progress increase based on work completed
- Update module's Next Steps using `scripts/update-module-next-steps.sh`
- Mark completed tasks as done
- Add any new tasks discovered during implementation
- Prepare progress marker for PR body (e.g., `progress:bridge=+10`)

### 9. PR Creation with Auto-Category & Progress

**Use `pr-formatter` skill** to:
- Auto-select Cooperation Path from module
- Generate 3-5 relevant keywords
- Format PR body with exact structure
- Include progress marker from step 8
- Create PR with `gh pr create --base yolo`

**Then monitor post-push:**
- Wait ~30 seconds for AI reviewers (Copilot/Codex)
- Check for comments: `gh pr view <PR#> --comments`
- Address all feedback until checks are green
- **Note:** Lint/smoke disabled on yolo branch

Output PR URL and status summary

## Safety Guidelines

1. **Never commit secrets** — Use environment variables or CI secrets
2. **Stay within scope** — No unrelated refactoring or feature creep
3. **Minimal diffs** — Change only what's necessary
4. **Test continuously** — Verify your work as you implement, not just at the end
5. **Fix all build errors** — Never open a PR with a failing build
6. **One concern per PR** — No bundling unrelated changes

## Example Usage

### Example 1: Bridge Scaffold
```
Use Skill: togetheros-code-ops
Inputs:
  module: bridge
  slice: scaffold
  scope: Create /bridge route, stub component in packages/ui, docs/modules/bridge/README.md
```

**Expected Behavior**:
- Branch: `feature/bridge-scaffold`
- Commit: `feat(bridge): scaffold - Create /bridge route, stub component in packages/ui, docs/modules/bridge/README.md`
- PR formatted via `pr-formatter` skill (auto-selected category & keywords)

### Example 2: Governance Integration
```
Use Skill: togetheros-code-ops
Inputs:
  module: governance
  slice: oss-integration
  scope: Integrate selected governance OSS with auth/DB and CI
```

**Expected Behavior**:
- Branch: `feature/governance-oss-integration`
- Commit: `feat(governance): oss-integration - Integrate selected governance OSS with auth/DB and CI`
- PR formatted via `pr-formatter` skill (auto-selected category & keywords)

## Testing Philosophy (YOLO Mode)

In YOLO mode, **you (Claude) are the primary quality gate**:
- No formal linting required before commit (you check code quality as you write)
- No separate test phase (you verify correctness during implementation)
- Build must pass (automated check for syntax/type correctness)
- Optional validation via `scripts/validate.sh` (recommended for proof lines)
- Continuous self-testing replaces traditional QA pipeline

**This means**: Read your code, check your logic, verify your types, and ensure correctness at every step. The build is your final verification that everything compiles correctly.

**About Validation Scripts**: While YOLO mode emphasizes self-testing, running `scripts/validate.sh` before committing provides proof lines (`LINT=OK`, `VALIDATORS=GREEN`) that CI checks look for. These checks are advisory-only and won't block merges, but including them shows good practice.

## Related Skills

- **pr-formatter**: PR creation, formatting, validation, AI feedback loop
- **status-tracker**: Progress tracking, next steps management, Notion memory

**See those skills for:**
- Keyword generation details → `pr-formatter`
- Progress estimation guide → `status-tracker`
- Module progress keys → `status-tracker`
- Notion memory updates → `status-tracker`
- PR verification checklist → `pr-formatter`
