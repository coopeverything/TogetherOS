---
name: togetheros-code-ops
description: End-to-end TogetherOS YOLO code operation - creates branch, makes changes, tests throughout implementation, builds with retry-on-fail, commits, pushes, and opens PR with auto-selected Cooperation Path category and keywords
---

# TogetherOS Code Operations (YOLO Mode)

This skill executes complete code operations for TogetherOS, from branch creation through PR submission.

## Core Conventions

- **Base Branch**: `claude-yolo`
- **Branch Pattern**: `feature/{module}-{slice}`
- **Commit Format**: `feat({module}): {slice} - {scope}`
- **PR Verification**: Always include in PR body:
  ```
  Verified: All changes tested during implementation, build passes
  ```

## The 8 Cooperation Paths

Every PR must be tagged with ONE of these paths:

1. **Collaborative Education** — Learning, co-teaching, peer mentorship, skill documentation
2. **Social Economy** — Cooperatives, timebanking, mutual aid, repair/reuse networks
3. **Common Wellbeing** — Health, nutrition, mental health, community clinics, care networks
4. **Cooperative Technology** — Open-source software, privacy tools, federated services, human-centered AI
5. **Collective Governance** — Direct legislation, deliberation, empathic moderation, consensus tools
6. **Community Connection** — Local hubs, events, volunteer matching, skill exchanges
7. **Collaborative Media & Culture** — Storytelling, documentaries, cultural restoration, commons media
8. **Common Planet** — Regeneration, local agriculture, circular materials, climate resilience

## Module → Path Mapping

Use this mapping to auto-select the appropriate Cooperation Path:

- **bridge** → Cooperative Technology
- **governance** → Collective Governance
- **social-economy**, **timebank**, **support-points** → Social Economy
- **moderation**, **discourse** → Collective Governance
- **community**, **events**, **volunteer** → Community Connection
- **education**, **learning**, **mentorship** → Collaborative Education
- **health**, **wellness**, **care** → Common Wellbeing
- **media**, **culture**, **storytelling** → Collaborative Media & Culture
- **environment**, **sustainability**, **agriculture** → Common Planet
- **infrastructure**, **monorepo**, **ci-cd**, **api** → Cooperative Technology (default for tech work)

## Required Inputs

1. **module** (required): Target module name (e.g., "bridge", "governance")
2. **slice** (required): Short feature slice name (e.g., "scaffold", "api-setup")
3. **scope** (required): 1-3 sentence description of changes to make

## Optional Inputs

- **commands.install**: Override install command (default: `npm ci`)
- **commands.build**: Override build command (default: `npm run build`)
- **commands.test**: Add test command if needed (default: none in YOLO mode)

## Workflow Steps

### 1. Preparation
- Ensure repo is on `claude-yolo` branch and up to date
- Create feature branch: `feature/{module}-{slice}-yolo`

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

### 6. Git Operations
- Commit with message: `feat({module}): {slice} - {scope}`
- Push branch: `git push -u origin feature/{module}-{slice}`

### 7. PR Creation with Auto-Category
- Auto-select Cooperation Path using module→path mapping above
- Generate 3-5 relevant keywords from:
  - Module name
  - Slice description
  - Key technologies used
  - Scope keywords
- Create PR to `claude-yolo` with body containing:
  - **Summary**: What changed and why
  - **Files Modified**: List with brief description
  - **Category**: Selected Cooperation Path
  - **Keywords**: Generated keyword list
  - **Verification**: `Verified: All changes tested during implementation, build passes`
- Output PR URL and 5-line action summary

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
- Path: **Cooperative Technology**
- Keywords: `bridge`, `scaffold`, `ui-component`, `routing`, `ai-assistant`
- Commit: `feat(bridge): scaffold - Create /bridge route, stub component in packages/ui, docs/modules/bridge/README.md`

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
- Path: **Collective Governance**
- Keywords: `governance`, `oss-integration`, `authentication`, `database`, `ci-cd`
- Commit: `feat(governance): oss-integration - Integrate selected governance OSS with auth/DB and CI`

## Testing Philosophy (YOLO Mode)

In YOLO mode, **you (Claude) are the primary quality gate**:
- No formal linting required before commit (you check code quality as you write)
- No separate test phase (you verify correctness during implementation)
- Build must pass (automated check for syntax/type correctness)
- Continuous self-testing replaces traditional QA pipeline

**This means**: Read your code, check your logic, verify your types, and ensure correctness at every step. The build is your final verification that everything compiles correctly.

## Keyword Generation Logic

Generate 3-5 keywords by combining:
1. **Module name** (always include)
2. **Technical components**: API, UI, database, routing, auth, etc.
3. **Action type**: scaffold, integration, refactor, feature, bugfix
4. **Domain concepts**: From the 8 Paths and their subcategories (see CATEGORY_TREE.json)

Example for bridge module:
- `bridge`, `ai-assistant`, `streaming`, `citations`, `knowledge-base`

Example for governance module:
- `governance`, `proposals`, `voting`, `consensus`, `deliberation`
