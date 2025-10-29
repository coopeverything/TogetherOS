# Code Review Guide

How code review works in TogetherOS.

## Purpose of Code Review

Code review helps us:
- **Maintain quality** - Catch bugs and improve design
- **Share knowledge** - Learn from each other
- **Ensure consistency** - Follow conventions
- **Build trust** - Collaborative improvement

## For Contributors (PR Authors)

### Before Requesting Review

**Self-review checklist:**
- [ ] Code follows project conventions
- [ ] Changes are well-documented
- [ ] All tests pass locally
- [ ] Validation passes (`./scripts/validate.sh`)
- [ ] PR description is clear
- [ ] Proof lines included
- [ ] No secrets or sensitive data
- [ ] Category and keywords provided

### During Review

**Be responsive:**
- Respond to comments promptly
- Ask questions if feedback is unclear
- Explain your reasoning when needed
- Be open to suggestions

**Making changes:**
- Address feedback in new commits
- Mark conversations as resolved when fixed
- Request re-review when ready
- Thank reviewers for their time

**If you disagree:**
- Explain your perspective respectfully
- Provide technical reasoning
- Seek compromise or clarification
- Escalate to maintainers if needed

## For Reviewers

### Review Checklist

**Functionality:**
- [ ] Does it work as intended?
- [ ] Are edge cases handled?
- [ ] Are errors handled gracefully?
- [ ] Is the UI responsive (if applicable)?

**Code Quality:**
- [ ] Is the code readable and clear?
- [ ] Are names descriptive?
- [ ] Is complexity justified?
- [ ] Are there unnecessary dependencies?
- [ ] Is it maintainable?

**Testing:**
- [ ] Are critical paths tested?
- [ ] Do tests cover edge cases?
- [ ] Are tests readable?

**Documentation:**
- [ ] Is code commented where needed?
- [ ] Are docs updated?
- [ ] Is the PR description clear?
- [ ] Are API changes documented?

**Security:**
- [ ] No secrets committed?
- [ ] Input validation present?
- [ ] No SQL injection risks?
- [ ] No XSS vulnerabilities?

**Performance:**
- [ ] No obvious performance issues?
- [ ] Database queries optimized?
- [ ] Large datasets handled well?

**TogetherOS Specific:**
- [ ] Follows "tiny verifiable steps" philosophy?
- [ ] Category and keywords appropriate?
- [ ] Proof lines present and valid?
- [ ] One concern per PR?

### Providing Feedback

**Be kind and constructive:**
- ✅ "Consider extracting this into a helper function for reusability"
- ✅ "This could be simplified using array.map()"
- ✅ "Great approach! One suggestion..."
- ❌ "This is wrong"
- ❌ "Why would you do it this way?"
- ❌ "This is terrible code"

**Be specific:**
- ✅ "On line 42, this variable name could be more descriptive. Suggest `userEmail` instead of `e`"
- ❌ "Variable naming needs work"

**Distinguish must-fix from suggestions:**
- **🔴 Must fix:** "This will cause a crash when email is null"
- **🟡 Suggestion:** "Consider adding error logging here for debugging"
- **💡 Optional:** "Nice-to-have: Could add a loading state"

**Ask questions:**
- "What happens if the API returns null?"
- "Is this condition always true?"
- "Could you explain this logic?"

**Acknowledge good work:**
- "Nice refactoring!"
- "Great test coverage"
- "This handles the edge case well"

### Review Priorities

**P0 - Must fix before merge:**
- Security vulnerabilities
- Crashes or data loss
- Breaking changes without migration
- Secrets committed
- Validation failing

**P1 - Should fix:**
- Bugs (non-critical)
- Poor error handling
- Missing tests for critical paths
- Confusing code
- Documentation gaps

**P2 - Nice to have:**
- Code style improvements
- Additional test coverage
- Performance optimizations
- Refactoring suggestions

**P3 - Future work:**
- Feature enhancements
- Long-term improvements
- Follow-up tasks

### Types of Review Comments

**Comment** - General feedback, doesn't block merge
```
💡 Consider extracting this into a utility function
```

**Request changes** - Must be addressed before merge
```
🔴 This will throw an error when user is undefined. Add null check.
```

**Approve** - LGTM (Looks Good To Me)
```
✅ Approved! Great work on the error handling.
```

## Review Process

### 1. Initial Review

Reviewer checks:
- PR description and proof lines
- CI checks status
- Files changed
- Overall approach

### 2. Line-by-Line Review

Reviewer examines:
- Code logic
- Edge cases
- Error handling
- Tests
- Documentation

### 3. Feedback & Discussion

- Reviewer leaves comments
- Author responds or makes changes
- Conversation continues until resolved

### 4. Approval

When satisfied, reviewer approves:
- All concerns addressed
- Code meets standards
- Tests pass
- Documentation updated

### 5. Merge

After approval(s):
- Maintainer or author merges
- Branch is deleted
- Changes go to main

## Common Review Scenarios

### Scenario: Breaking Change

**Reviewer:** "This changes the API response format. How will existing clients handle this?"

**Good response:** "Good catch! I'll add a version parameter and keep the old format for v1 clients. Will update in next commit."

### Scenario: Missing Tests

**Reviewer:** "The error path isn't tested. Can you add a test case?"

**Good response:** "Absolutely! Added test in commit abc123. Does that cover it?"

### Scenario: Unclear Code

**Reviewer:** "This logic is hard to follow. Can you simplify or add comments?"

**Good response:** "You're right, it's convoluted. Refactored into smaller functions with descriptive names. Much clearer now."

### Scenario: Performance Concern

**Reviewer:** "This queries the database in a loop. Consider batching?"

**Good response:** "Great suggestion! Changed to a single query with WHERE IN. 10x faster in testing."

### Scenario: Scope Creep

**Reviewer:** "This PR adds feature X but also refactors unrelated code Y. Can we split it?"

**Good response:** "Good point! I'll move the refactoring to a separate PR. This one will focus only on feature X."

## Review Etiquette

### For Authors

**DO:**
- ✅ Thank reviewers for their time
- ✅ Respond to all comments
- ✅ Mark resolved conversations
- ✅ Re-request review when ready
- ✅ Be patient with feedback

**DON'T:**
- ❌ Take feedback personally
- ❌ Ignore comments
- ❌ Get defensive
- ❌ Rush reviewers
- ❌ Merge without approval

### For Reviewers

**DO:**
- ✅ Be respectful and constructive
- ✅ Explain reasoning
- ✅ Acknowledge good work
- ✅ Review promptly (within 1-2 days)
- ✅ Be thorough but not pedantic

**DON'T:**
- ❌ Be dismissive or rude
- ❌ Nitpick style without reason
- ❌ Approve without reviewing
- ❌ Demand perfection
- ❌ Ghost the PR

## When Reviews Get Stuck

### Long Discussion

If a conversation goes beyond 3-4 exchanges:
1. Hop on a call or discussion thread
2. Seek input from maintainers
3. Document the decision
4. Move forward

### Disagreement

If reviewer and author disagree:
1. Both explain reasoning clearly
2. Seek third opinion from maintainer
3. Defer to maintainer decision
4. Document the tradeoff

### Slow Review

If review is taking too long:
1. Ping reviewer politely after 2-3 days
2. Ask for estimated timeline
3. Request alternate reviewer if needed
4. Escalate to maintainers if urgent

## Review Timeline

**Target response times:**
- **Initial review:** Within 2 business days
- **Re-review after changes:** Within 1 business day
- **Small/urgent PRs:** Within 24 hours
- **Large PRs:** Up to 1 week

**Note:** These are targets, not guarantees. Be patient with volunteer reviewers.

## For Maintainers

### Additional Responsibilities

- **Final approval** - Ensure quality and consistency
- **Merge PRs** - After all checks pass
- **Resolve conflicts** - Mediate disagreements
- **Set standards** - Define and evolve conventions
- **Mentor contributors** - Help people grow

### When to Merge

**Must have:**
- ✅ At least 1 approval from maintainer or trusted reviewer
- ✅ All CI checks passing
- ✅ Proof lines in PR body
- ✅ No unresolved conversations
- ✅ Follows project conventions
- ✅ Category and keywords present

**Can have:**
- ⚠️ Minor suggestions (address in follow-up)
- ⚠️ Nice-to-have improvements (future work)

## Resources

- [GETTING_STARTED.md](GETTING_STARTED.md) - Setup guide
- [WORKFLOW.md](WORKFLOW.md) - Git workflow
- [docs/architecture.md](.architecture.md) - Technical design
- [docs/cooperation-paths.md](.cooperation-paths.md) - Project taxonomy

---

**Remember:** Code review is about improving code and learning together, not finding fault. We're all on the same team working toward the same goal: building a cooperation-first platform.
