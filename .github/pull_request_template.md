# PR Title

## Summary
Brief description of the change and why it’s needed. Focus on user value.

## Smallest change
Exactly one sentence describing the tiniest viable change you made.

## Category & Keywords (REQUIRED)
- **Category:** <!-- one of the 8 canonical categories -->
- **Keywords:** <!-- comma-separated canonical keywords -->

## Module / Labels
- **module:** <slug> (e.g., governance)
- **labels to add:** `module:<slug>`, `type:increment`, `size:<S|M|L>`, `slice:<UI|API|Data|Docs|Infra>`

## Linked Issue(s)
- closes #<issue-id> <!-- use the “Module Increment” issue -->

## Touchpoints
- files:
  - <path/one>
  - <path/two>

## Proof (paste exact lines after running validators)
LINT=OK  
VALIDATORS=GREEN  
SMOKE=OK  

## Checklist
- [ ] Small, verifiable diff
- [ ] Docs updated (module page or hub link)
- [ ] Empty/loading/error states covered (if UI)
- [ ] Tests added or updated (if domain/API)
- [ ] Screenshots/Storybook link attached (if UI)
- [ ] CI passes (or draft PR to run checks)
- [ ] No secrets or PII added; tokens remain in GitHub Secrets

## Links
- Related Issue/Task: <!-- e.g., codex/* or GitHub issue -->
