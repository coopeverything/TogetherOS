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
- Branch from `main`: `feature/<short-topic>` or `docs/<short-topic>`.
- Commit messages (imperative, concise), for example:
docs: align overview with contributor hub
feat(governance): add proposal scoring util
fix(ci): correct docs workflow include paths


## 3) Pull Requests
- **Scope:** exactly one tiny change.
- **Description:** what/why, list of touched files, and the two proof lines.
- **Labels:** add the relevant Path label (e.g., `path:cooperative-technology`, `path:social-economy`).

### PR template snippet (copy/paste into your PR body)
What & Why

Smallest change: <one sentence>

Touchpoints

files: <list>

Proof

LINT=OK
SMOKE=OK


## 4) Required Checks & CI
- Branch protection requires **`ci/lint`** (and **`ci/smoke`** if enabled).
- Docs-only edits are ignored by `ci/lint` and validated by **`ci/docs`**.
- Details: [CI/Actions_Playbook.md](./CI/Actions_Playbook.md)

## 5) Local Preflight (recommended)
Before opening a PR:
```bash
# from repo root
./scripts/validate.sh
# expect at the end:
# LINT=OK
# SMOKE=OK
If your change is docs-only, run your local markdown checks if available; otherwise include the proof lines once CI passes.

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

— End of OPERATIONS —
