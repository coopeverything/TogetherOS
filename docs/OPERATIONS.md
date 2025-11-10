# docs/OPERATIONS.md
# TogetherOS — OPERATIONS (Start Here)

This is the practical playbook for contributors and maintainers to ship tiny, verifiable changes safely and fast.

- 💬 **Start here:** introduce yourself and your first tiny change in [GitHub Discussions #88](https://github.com/coopeverything/TogetherOS/discussions/88)
- 📜 **Vision:** see the [Manifesto](./Manifesto.md)
- 🧭 **Taxonomy:** canonical Paths & keywords in [TogetherOS_CATEGORIES_AND_KEYWORDS.md](./TogetherOS_CATEGORIES_AND_KEYWORDS.md)
- 🧪 **CI Playbook:** see [CI/Actions_Playbook.md](./CI/Actions_Playbook.md)
- 🔐 **Maintainers deploy details:** see [OPS/MAINTAINERS_DEPLOY.md](./OPS/MAINTAINERS_DEPLOY.md)

---

## 1) Cadence — Tiny, Verifiable Steps
- Ship **one smallest change** at a time.
- Each PR includes two proof lines in the description:
LINT=OK
SMOKE=OK
- Docs-only changes: the code-lint job is skipped (via `paths-ignore`); a lightweight docs job checks markdown and links.

## 2) Branching & Commits
```bash
- Branch from `main`: `feature/<short-topic>` or `docs/<short-topic>`.
- Commit messages (imperative, concise), for example:
docs: align overview with contributor hub
feat(governance): add proposal scoring util
fix(ci): correct docs workflow include paths
```

## 3) Pull Requests
```bash
- **Description:** what/why, list of touched files, and the two proof lines.
- **Labels:** add the relevant Path label (e.g., `path:cooperative-technology`, `path:social-economy`).

### PR template snippet (copy/paste into your PR body)
```
## What & Why
<1–3 sentences>

## Smallest change

<1 sentence>

## Touchpoints
- files:
  - <path/one>
  - <path/two>

## Proof


LINT=OK
SMOKE=OK


## 4) Required Checks & CI
```bash
- Branch protection requires **`ci/lint`** (and **`ci/smoke`** if enabled).
- Docs-only edits are ignored by `ci/lint` and validated by **`ci/docs`**.
- Details: [CI/Actions_Playbook.md](./CI/Actions_Playbook.md)
```

## 5) Local Preflight (recommended)
Before opening a PR:
```bash
# from repo root
./scripts/validate.sh
# expect at the end:
# LINT=OK
# SMOKE=OK
If your change is docs-only, run your local markdown checks if available; otherwise include the proof lines once CI passes.
```

## 6) Security & Access

Least-privilege tokens only (Contents/PR/Actions as needed).

Never echo secret values in logs.

Deployment keys and server details are in the Maintainers Playbook (internal link above).

## 7) Docs-First Rule

Any change that affects behavior, config, or contributor experience must update the relevant doc (this file, the CI playbook, or a Path-specific doc). Keep INDEX.md aligned with new/renamed docs.

## 8) Path Labels & Taxonomy

Use the canonical Path names/labels when filing issues and PRs. If you add a new keyword, update TogetherOS_CATEGORIES_AND_KEYWORDS.md with a short rationale.

## 9) After Merge

If your change affects onboarding or contributor flow, drop a short note in Discussions #88 so newcomers see the latest path.

Quick Checklist (copy/paste)

Smallest possible change

Correct Path label(s)

PR includes LINT=OK and SMOKE=OK

Relevant docs updated

CI green where applicable

## 10) Device-Specific Workflows

TogetherOS can be developed on different devices with varying capabilities:

### PC (Windows/Mac/Linux)
- ✅ Full development environment
- ✅ Local PostgreSQL database
- ✅ Docker support
- ✅ `npm run dev` with live reload
- ✅ Full IDE (VS Code, etc.)
- ✅ All scripts and tools

**Standard workflow:**
```bash
git checkout -b feature/module-description
# Full development with npm run dev, database, tests
npm run build && npm run dev
# Create PR when ready
```

### Tablet (Android Termux)
- ✅ Code editing (nano/vim)
- ✅ Git operations
- ✅ npm build & typecheck
- ✅ PR creation via GitHub CLI
- ❌ Local PostgreSQL database (uses remote VPS instead)
- ❌ Docker
- ❌ Full IDE

**Recommended use:**
- Documentation updates
- TypeScript type definitions
- Quick bug fixes
- PR reviews & management
- When away from desk

**See:** `docs/_device-notes/TERMUX_SETUP.md` for tablet setup and `docs/_device-notes/CROSS_DEVICE_WORKFLOW.md` for coordinating work across devices.

### Hybrid Workflow
For features developed across multiple devices:
1. PC: Initial feature implementation
2. Tablet: Documentation & types
3. PC: Final review & merge

**Key rule:** Always `git pull` before starting on a new device to avoid conflicts.

**Details:** See `docs/_device-notes/CROSS_DEVICE_WORKFLOW.md`

— End of OPERATIONS —

