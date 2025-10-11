# docs/INDEX.md
# TogetherOS — Docs Index (Canon)

This page lists the **canonical docs**. If you rename or add a doc, update this index in the same PR.

---

## Canon (start here)
- [OPERATIONS.md](./OPERATIONS.md) — contributor playbook (tiny, verifiable steps)
- [Manifesto.md](./Manifesto.md) — vision and purpose
- [TogetherOS_CATEGORIES_AND_KEYWORDS.md](./TogetherOS_CATEGORIES_AND_KEYWORDS.md) — 8 Paths & keywords
- [CI/Actions_Playbook.md](./CI/Actions_Playbook.md) — CI checks, logs, common fixes
- [OPS/MAINTAINERS_DEPLOY.md](./OPS/MAINTAINERS_DEPLOY.md) — internal deploy notes (names of secrets only)

## Status & Planning
- Public status explainer: [STATUS_v2.md](./STATUS_v2.md)
- Tracker file (append-only log): [STATUS/What_we_finished_What_is_left_v2.txt](../STATUS/What_we_finished_What_is_left_v2.txt)
- Tech roadmap: [roadmap/TECH_ROADMAP.md](./roadmap/TECH_ROADMAP.md)

## Contributor Hubs
- Discussions landing: https://github.com/coopeverything/TogetherOS/discussions/88
- Repository README: [../README.md](../README.md)

## 8 Paths (quick reference)
- Collaborative Education  
- Social Economy  
- Common Wellbeing  
- Cooperative Technology  
- Collective Governance  
- Community Connection  
- Collaborative Media & Culture  
- Common Planet

> Use the exact Path labels and keywords from
> [TogetherOS_CATEGORIES_AND_KEYWORDS.md](./TogetherOS_CATEGORIES_AND_KEYWORDS.md).

## OPS Docs (short & practical)
- OPS ground rules: [OPS/TogetherOS_OPS_Project_Knowledge.md](./OPS/TogetherOS_OPS_Project_Knowledge.md)
- CI specifics: [CI/Actions_Playbook.md](./CI/Actions_Playbook.md)


## How to propose a docs change
1. One smallest change per PR.
2. Update this index if the change adds/renames/removes a doc.
3. Include proof lines in the PR body:

LINT=OK
VALIDATORS=GREEN
SMOKE=OK

4. If docs-only, ensure `ci/docs` passes (markdown + links).

— End of Index —
