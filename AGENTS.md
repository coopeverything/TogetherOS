# Agents Loop — Planner → Cline → CI → Staging

**Output order for every task**
A) TESTS FIRST  
B) UNIFIED DIFF (repo-relative paths)  
C) SELF-CRITIQUE (edge cases, a11y, perf, rollback)

**Rules**
- Tailwind v4 conventions.
- `/signup` must be 100dvh & fully responsive.
- Provide small, reviewable diffs.

**Cline usage**
- Paste A/B/C into Cline.
- Let Cline run tests & open a PR.
- When CI is green, label PR: `staging-ok`.