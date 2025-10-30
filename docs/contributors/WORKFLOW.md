# Contributor Workflow

Detailed guide for contributing to TogetherOS.

## The "Tiny Verifiable Steps" Philosophy

**Core principle:** Every change should be the smallest shippable increment.

- ✅ One feature, one PR
- ✅ Clear, focused changes
- ✅ Documented and tested
- ❌ No bundling unrelated changes
- ❌ No "kitchen sink" PRs

## Git Workflow

### Branch Strategy

**main** - Production-ready code, protected

**Your feature branch** - Created from main

```bash
git checkout main
git pull origin main
git checkout -b feature/descriptive-name
```

### Branch Naming Conventions

```
feature/add-user-profile     # New features
fix/broken-login-button      # Bug fixes
docs/update-architecture     # Documentation
refactor/simplify-auth       # Code improvements
test/add-unit-tests          # Testing
chore/update-dependencies    # Maintenance
```

### Commit Messages

**Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Examples:**
```
feat(auth): add password reset flow
fix(ui): correct button alignment on mobile
docs: update contributing guidelines
refactor(api): simplify error handling
test(bridge): add unit tests for Q&A endpoint
chore(deps): bump next to 14.2.0
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, whitespace
- `refactor` - Code change (no bug fix, no feature)
- `test` - Add/update tests
- `chore` - Build, dependencies, tooling

**Guidelines:**
- Use imperative mood ("add" not "added")
- Keep first line under 72 characters
- Explain "why" in body if needed
- Reference issues: "closes #123"

## Pull Request Process

### 1. Before Opening PR

**Run validation:**
```bash
./scripts/validate.sh
```

**Capture proof lines from output:**
```
LINT=OK
VALIDATORS=GREEN
SMOKE=OK
```

### 2. Open Pull Request

Use the PR template. Required sections:

**Summary**
- What changed and why
- 1-3 sentences, clear and concise

**Category** (pick one of 8 Cooperation Paths)
- Collaborative Education
- Social Economy
- Common Wellbeing
- Cooperative Technology
- Collective Governance
- Community Connection
- Collaborative Media & Culture
- Common Planet

**Keywords**
- Comma-separated
- Relevant to your changes

**Proof**
```
LINT=OK
VALIDATORS=GREEN
SMOKE=OK
```

**Files Changed**
- List files with brief description

### 3. Code Review

- Address reviewer feedback
- Keep discussions focused and respectful
- Make requested changes in new commits
- Request re-review when ready

### 4. Merge Requirements

**Required:**
- ✅ All CI checks passing (lint, docs, smoke)
- ✅ Proof lines in PR body
- ✅ At least 1 approval
- ✅ No merge conflicts
- ✅ Category and keywords provided

**CI Checks:**
- `ci/lint` - YAML/workflow validation
- `ci/docs` - Markdown/link validation
- `ci/smoke` - Repository health checks

### 5. After Merge

- Delete your feature branch (GitHub will prompt)
- Pull latest main: `git checkout main && git pull`
- Celebrate! 🎉

## Validation & Proof Lines

### Local Validation

**Full validation suite:**
```bash
./scripts/validate.sh
```

**Individual tools:**
```bash
# YAML linting
yamllint .

# Workflow validation
actionlint

# Markdown linting
markdownlint-cli2 "**/*.md"

# Link checking
lychee --exclude-mail "**/*.md"
```

### What Gets Validated

- **YAML files:** Syntax, formatting, GitHub Actions workflows
- **Markdown files:** Style, formatting, heading structure
- **Links:** Internal and external links (broken links fail)
- **Repo health:** Tool availability, basic checks

### Understanding Proof Lines

**LINT=OK** - All linters passed (yamllint, actionlint, markdownlint)
**VALIDATORS=GREEN** - All validation scripts passed
**SMOKE=OK** - Smoke tests passed (repo health)
**DOCS=OK** - Documentation validation passed (for docs PRs)

These prove your changes meet quality standards.

## 8 Cooperation Paths (Required)

Every PR must be tagged with ONE of these paths:

1. **Collaborative Education** - Learning, teaching, skill-building
2. **Social Economy** - Cooperatives, mutual aid, timebanking
3. **Common Wellbeing** - Health, nutrition, care networks
4. **Cooperative Technology** - Open-source, privacy, federation
5. **Collective Governance** - Decision-making, deliberation, consensus
6. **Community Connection** - Events, local hubs, volunteer matching
7. **Collaborative Media & Culture** - Storytelling, archives, media
8. **Common Planet** - Regeneration, sustainability, climate resilience

See [docs/cooperation-paths.md](.cooperation-paths.md) for details.

## Common Tasks

### Sync Your Branch with Main

```bash
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main
# Resolve conflicts if any
git push
```

### Update Your Last Commit

```bash
# Make additional changes
git add .
git commit --amend --no-edit
git push --force-with-lease
```

### Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

### View Changed Files

```bash
git status
git diff
```

### Check Branch Status

```bash
git branch -v           # Local branches
git branch -r           # Remote branches
git log --oneline -10   # Recent commits
```

## Best Practices

### DO

✅ **Small, focused changes** - One concern per PR
✅ **Clear commit messages** - Explain what and why
✅ **Run validation locally** - Catch issues before pushing
✅ **Respond to feedback** - Be open to suggestions
✅ **Test your changes** - Verify functionality
✅ **Update documentation** - Keep docs in sync with code

### DON'T

❌ **Bundle unrelated changes** - Separate PRs for separate concerns
❌ **Commit secrets** - Use environment variables
❌ **Force push to main** - main is protected
❌ **Skip validation** - Always run scripts
❌ **Make huge PRs** - Break into smaller pieces
❌ **Ignore feedback** - Collaborate respectfully

## Troubleshooting

### CI Checks Failing

1. Check the **Checks** tab on your PR
2. Click the failing check
3. Read the error message
4. Fix locally and push again

### Merge Conflicts

```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
# Resolve conflicts in your editor
git add .
git commit
git push
```

### Validation Failing Locally

```bash
# See detailed error
./scripts/validate.sh

# Fix the reported issues
# Re-run until passing
```

### Push Rejected

```bash
# Your branch is out of date
git pull --rebase origin your-branch
git push
```

## Getting Help

- **Documentation:** Browse `/docs` directory
- **Discussions:** GitHub Discussions for questions
- **Issues:** Report bugs or request features
- **Code Review:** Ask reviewers for clarification

## Related Docs

- [GETTING_STARTED.md](GETTING_STARTED.md) - Setup and first contribution
- [CODE_REVIEW.md](CODE_REVIEW.md) - Review process and expectations
- [docs/architecture.md](.architecture.md) - Technical architecture
- [docs/tech-stack.md](.tech-stack.md) - Frameworks and tools
- [docs/cooperation-paths.md](.cooperation-paths.md) - Project taxonomy
