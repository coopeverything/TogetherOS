# Agents & PR Discipline

## PR metadata (required in every PR description)
Add **both** lines to your PR description:


- Canonical categories & palette (human-readable): `docs/DDP_CATEGORIES_AND_KEYWORDS.md`
- Machine-readable taxonomy (authoritative): `codex/taxonomy/CATEGORY_TREE.json`
- Contributor runbook & proof-lines: `docs/OPERATIONS_v2.md`

Notes:
- Use exactly one Category.
- Choose 2–6 Keywords from the palette for routing/search/analytics.
- PRs without the two lines will be asked to update their description before review (automation enforcement lands next).
