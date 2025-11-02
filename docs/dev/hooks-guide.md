# Claude Code Hooks Guide for TogetherOS

## Overview

This guide explains the documentation-side hooks implemented for TogetherOS to automate documentation quality checks and enforce CI/CD compliance.

## What Are Claude Code Hooks?

Hooks are user-defined shell commands that execute at specific points during Claude Code's lifecycle. They provide deterministic control over behavior by ensuring certain actions always occur rather than relying on the LLM to choose whether to run them.

## Hooks Directory Structure

```
.claude/
├── hooks/
│   ├── README.md                          # Hooks overview
│   └── scripts/
│       ├── protect-critical-docs.sh       # Block edits to protected files
│       ├── log-doc-changes.sh             # Audit trail for doc changes
│       ├── check-links.sh                 # Validate internal links
│       ├── validate-markdown.sh           # Markdown linting
│       └── validate-proof-lines.sh        # PR description validation
└── settings.local.json                    # Hooks configuration
```

## Implemented Hooks

### 1. Critical Document Protection

**Script:** `.claude/hooks/scripts/protect-critical-docs.sh`
**Events:** PreToolUse(Edit), PreToolUse(Write)
**Purpose:** Block accidental modification of critical documentation

**Protected Files:**
- `docs/Manifesto.md` - Project vision and principles
- `docs/TogetherOS_WhitePaper.md` - Technical architecture
- `docs/TogetherOS_CATEGORIES_AND_KEYWORDS.md` - Taxonomy documentation
- `codex/taxonomy/CATEGORY_TREE.json` - Machine-readable taxonomy
- `CLAUDE.md` - Session guide
- `.claude/knowledge/togetheros-kb.md` - Core knowledge base
- `.claude/knowledge/ci-cd-discipline.md` - CI/CD rules

**Behavior:**
- Exit code 1 (blocks operation) for protected files
- Exit code 0 (allows operation) for non-protected files
- Provides clear instructions on how to proceed if modification is needed

**Example Output:**
```
🚫 BLOCKED: docs/Manifesto.md is a protected critical document
Protected files require explicit user approval and documentation of why changes are needed.

If you need to modify this file:
1. Explain the reason for the change to the user
2. Get explicit approval
3. Document the change rationale in the commit message
4. Consider creating a backup first
```

### 2. Documentation Change Logging

**Script:** `.claude/hooks/scripts/log-doc-changes.sh`
**Events:** PostToolUse(Edit), PostToolUse(Write)
**Purpose:** Create audit trail of all documentation modifications

**Log Location:** `logs/hooks/doc-changes-YYYY-MM-DD.ndjson`

**Log Format:**
```json
{
  "timestamp": "2025-11-01T14:30:00Z",
  "event_type": "doc_change",
  "tool": "Edit",
  "file": "docs/modules/feed.md",
  "user": "groda"
}
```

**Behavior:**
- Only logs changes to `docs/**/*.md` files
- Creates NDJSON (newline-delimited JSON) audit logs
- Automatically creates logs directory if it doesn't exist
- One log file per day

### 3. Internal Link Validation

**Script:** `.claude/hooks/scripts/check-links.sh`
**Events:** PostToolUse(Edit), PostToolUse(Write)
**Purpose:** Detect broken internal links in documentation

**Features:**
- Extracts links from markdown files (`[text](link)` and `[text]: link` patterns)
- Validates internal file paths exist
- Skips external links (http/https/mailto)
- Skips anchor links (#section)
- Warns about broken links but doesn't block operation

**Example Output:**
```
⚠️  Broken link in docs/modules/feed.md: ../api/README.md
```

### 4. Markdown Validation

**Script:** `.claude/hooks/scripts/validate-markdown.sh`
**Events:** PreToolUse(Edit), PreToolUse(Write)
**Purpose:** Enforce markdown style consistency

**Prerequisites:**
```bash
npm install -g markdownlint-cli2
```

**Behavior:**
- Runs markdownlint-cli2 on modified docs
- Uses `.markdownlint.jsonc` configuration
- Exit code 1 blocks operation if linting fails
- Suggests auto-fix command if errors found

### 5. PR Proof Lines Validation

**Script:** `.claude/hooks/scripts/validate-proof-lines.sh`
**Events:** PreToolUse(Bash)
**Matcher:** `gh pr create*`
**Purpose:** Ensure PRs include required CI/CD proof lines

**Required Proof Lines:**
- `LINT=OK`
- One of: `VALIDATORS=GREEN`, `SMOKE=OK`, `DOCS=OK`

**Behavior:**
- Parses PR body from `gh pr create` commands
- Validates presence of required proof lines
- Exits with code 1 if validation fails
- Warns about heredoc format (cannot parse automatically)

## Configuration

Hooks are registered in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/scripts/protect-critical-docs.sh"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/scripts/protect-critical-docs.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/scripts/log-doc-changes.sh"
          },
          {
            "type": "command",
            "command": ".claude/hooks/scripts/check-links.sh"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/scripts/log-doc-changes.sh"
          },
          {
            "type": "command",
            "command": ".claude/hooks/scripts/check-links.sh"
          }
        ]
      }
    ]
  }
}
```

## Hook Lifecycle Events

### PreToolUse
Runs **before** tool execution. Can block the operation by exiting with code 1.

**Use cases:**
- Protection (critical file blocking)
- Validation (markdown linting)
- Pre-flight checks

### PostToolUse
Runs **after** tool execution completes. Cannot block the operation.

**Use cases:**
- Logging (audit trails)
- Validation (link checking)
- Post-processing

### Other Events
Currently unused in TogetherOS but available:
- `UserPromptSubmit` - When users submit prompts
- `SessionStart` / `SessionEnd` - Session lifecycle
- `Stop` / `SubagentStop` - Response completion
- `Notification` - Claude sends notifications
- `PreCompact` - Before compact operations

## Testing Hooks

### Test Critical Document Protection

```bash
# Should BLOCK (exit 1)
echo '{"tool_name": "Edit", "tool_input": {"file_path": "docs/Manifesto.md"}}' | \
  .claude/hooks/scripts/protect-critical-docs.sh

# Should ALLOW (exit 0)
echo '{"tool_name": "Edit", "tool_input": {"file_path": "docs/STATUS_v2.md"}}' | \
  .claude/hooks/scripts/protect-critical-docs.sh
```

### Test Documentation Logging

```bash
# Creates log entry in logs/hooks/doc-changes-YYYY-MM-DD.ndjson
echo '{"tool_name": "Edit", "tool_input": {"file_path": "docs/test.md"}}' | \
  .claude/hooks/scripts/log-doc-changes.sh

# View logs
cat logs/hooks/doc-changes-$(date +%Y-%m-%d).ndjson | jq .
```

### Test Link Validation

```bash
# Check a file with links
echo '{"tool_name": "Edit", "tool_input": {"file_path": "docs/OPERATIONS.md"}}' | \
  .claude/hooks/scripts/check-links.sh
```

## Modifying Protected Files

If you need to modify a protected file:

1. **Explain** to the user why the change is needed
2. **Get explicit approval** from the user
3. **Temporarily disable** the protection hook:
   ```bash
   # Comment out the hook in .claude/settings.local.json
   # Or use a different tool that bypasses hooks
   ```
4. **Make the change** with careful documentation
5. **Re-enable** the protection hook
6. **Commit** with detailed rationale in message

## Best Practices

### Adding New Protected Files

Edit `.claude/hooks/scripts/protect-critical-docs.sh`:

```bash
PROTECTED_DOCS=(
  "docs/Manifesto.md"
  "docs/TogetherOS_WhitePaper.md"
  "your/new/protected/file.md"  # Add here
)
```

### Creating Custom Hooks

1. Create script in `.claude/hooks/scripts/`
2. Make it executable: `chmod +x script.sh`
3. Accept JSON on stdin, extract `tool_input`
4. Exit 0 to allow, Exit 1 to block (PreToolUse only)
5. Register in `.claude/settings.local.json`

### Hook Input Format

All hooks receive JSON on stdin:

```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/absolute/path/to/file.md",
    "old_string": "...",
    "new_string": "..."
  }
}
```

Extract with `jq`:
```bash
FILE_PATH=$(jq -r '.tool_input.file_path // ""')
```

## Security Considerations

**CRITICAL WARNING:** Hooks run automatically with your current environment's credentials. Malicious hooks can:
- Exfiltrate data
- Modify sensitive files
- Execute arbitrary code
- Access environment variables and secrets

**Always review hook implementations before registering them.**

## Troubleshooting

### Hook Not Running

1. Check hook is registered in `.claude/settings.local.json`
2. Verify script is executable: `chmod +x script.sh`
3. Test script manually with sample JSON input
4. Check Claude Code session logs

### Hook Blocking Legitimate Operations

1. Review hook logic
2. Add exception to matcher or hook script
3. Temporarily disable hook by commenting out in settings
4. Report issue in project discussions

### Logs Not Created

1. Ensure logs directory exists: `mkdir -p logs/hooks`
2. Check script permissions
3. Verify jq is installed: `command -v jq`
4. Test script with manual input

## Future Enhancements

Potential hooks to add:

1. **Automatic Formatting:**
   - Prettier for TypeScript/JavaScript
   - Black for Python
   - Auto-format on save

2. **Security Scanning:**
   - Check for hardcoded secrets
   - Validate environment variable usage
   - Detect SQL injection patterns

3. **Dependency Validation:**
   - Block modifications to package-lock.json
   - Validate npm/pip package versions
   - Check for known vulnerabilities

4. **Desktop Notifications:**
   - Alert when Claude awaits input
   - Notify on long-running operations
   - Status updates for deployments

## Related Documentation

- [Claude Code Hooks Official Guide](https://docs.claude.com/en/docs/claude-code/hooks-guide)
- [TogetherOS CI/CD Discipline](../.claude/knowledge/ci-cd-discipline.md)
- [TogetherOS Knowledge Base](../.claude/knowledge/togetheros-kb.md)
- [Hooks README](../.claude/hooks/README.md)

## Support

For questions or issues with hooks:
1. Check this guide first
2. Review `.claude/hooks/README.md`
3. Test hooks manually with sample inputs
4. Post in [GitHub Discussions](https://github.com/coopeverything/TogetherOS/discussions)
