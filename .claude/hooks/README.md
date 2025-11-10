# TogetherOS Claude Code Hooks

Documentation-side hooks for automating documentation quality checks and compliance.

## Hook Categories

### 1. Documentation Validation Hooks
- Markdown linting
- Link checking
- Format validation

### 2. Compliance Hooks
- CI/CD proof line requirements
- Path label validation
- Category taxonomy checks

### 3. Protection Hooks
- Critical file protection
- Sensitive path blocking

### 4. Audit Hooks
- Documentation edit logging
- Change tracking

## Hook Scripts

All hook scripts are located in `.claude/hooks/scripts/`:
- `validate-markdown.sh` - Runs markdownlint on changed docs
- `check-links.sh` - Validates internal and external links
- `protect-critical-docs.sh` - Blocks edits to protected files
- `log-doc-changes.sh` - Logs documentation modifications
- `validate-proof-lines.sh` - Ensures PR descriptions have proof lines

## Configuration

Hooks are configured in `.claude/settings.local.json` under the `hooks` key.

## Usage

Hooks run automatically at configured lifecycle events:
- **PreToolUse(Edit)** - Before editing documentation files
- **PreToolUse(Write)** - Before creating new documentation
- **PostToolUse(Edit)** - After documentation edits complete
- **UserPromptSubmit** - When user submits prompts mentioning docs

## See Also

- [Claude Code Hooks Documentation](https://docs.claude.com/en/docs/claude-code/hooks-guide)
- [TogetherOS CI/CD Discipline](./../knowledge/ci-cd-discipline.md)
