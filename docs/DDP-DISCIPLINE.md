\# --- CONFIG (adjust only if your repo isn't TheEpicuros/ddp) ---

$owner='TheEpicuros'; $repoName='ddp'; $repo="$owner/$repoName"

$path='docs/DDP-DISCIPLINE.md'

$branchPrefix='docs-discipline'

$H=@{ Authorization="Bearer $env:CODEX\_PAT"; Accept="application/vnd.github+json"; "User-Agent"="codex-agent" }



\# --- FILE CONTENT (full Markdown) ---

$md = @'

\# DDP Discipline — Applied Operations (v2)



\## Goals

\- Advance in tiny, verified steps.

\- Keep state clean; never assume success without proof.

\- Diagnose by evidence (HTTP codes / specific log lines), not guesses.



\## Principles

1\. One step at a time; request one proof line after each step.

2\. Don’t repeat steps unless evidence shows they didn’t complete.

3\. For workflow edits, provide \*\*full-file\*\* YAML (no partial patches).

4\. Shells are brittle: prefer single-line commands or here-strings.

5\. Be explicit about where to look (exact step / field).

6\. Classify errors before acting (401 vs 403 vs 422 vs 204).

7\. Least privilege + explicit allowlists.



\## PowerShell Discipline

\- Use `Invoke-RestMethod`; avoid `curl` alias.

\- Headers shape:



