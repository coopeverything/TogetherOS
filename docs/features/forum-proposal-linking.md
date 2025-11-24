# Forum-to-Proposal Promotion

**Status:** Phase 1 - API Foundation Complete
**Progress:** 40%

## Overview

Enables seamless transition from informal forum discussions to formal governance proposals, implementing the user flow:

**Discussion → Commotion → Promotion → Proposal → Deliberation → Vote**

## Implementation

### Phase 1: API Foundation (✅ Complete)

**Database Schema (Migration 034):**
- Added `linked_proposal_id` to topics table
- Added `promotion_status` to topics table (`eligible`, `promoted`, `declined`)
- Added `supporter_count` to topics table
- Added `source_topic_id` to proposals table
- Added `source_type` to proposals table (`manual`, `forum`, `bridge`)

**TypeScript Types:**
- Updated `Topic` interface with promotion fields
- Updated `Proposal` interface with source tracking fields

**API Endpoint:**
- `POST /api/forum/topics/[topicId]/promote` - Promotes topic to proposal
  - Auto-populates proposal from topic data
  - Links topic ↔ proposal bidirectionally
  - Sets proposal status to `draft`
  - Marks topic as `promoted`

**Usage Example:**
```bash
curl -X POST https://coopeverything.org/api/forum/topics/{topicId}/promote \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Optional override title",
    "summary": "Optional override summary",
    "cooperationPath": "collective-governance"
  }'
```

### Phase 2: Automatic Eligibility (Planned - 60%)

**Threshold Logic:**
- Monitor `supporter_count` via topic reactions
- Auto-set `promotion_status = 'eligible'` when >= 20 unique supporters
- Show "Promote to Proposal" button when eligible

**Bridge AI Integration:**
- Detect actionable consensus in discussions
- Suggest promotion with auto-generated proposal draft
- Extract key points, options, and evidence from thread

### Phase 3: UI Integration (Planned - 80%)

**Topic View Enhancements:**
- "Promote to Proposal" button (when eligible)
- Promotion status badge
- Link to created proposal (when promoted)

**Proposal View Enhancements:**
- "Source Discussion" link back to forum topic
- Import thread participants as initial reviewers
- Display origin badge ("Promoted from Forum")

### Phase 4: Workflow Automation (Planned - 100%)

**Post-Promotion:**
- Notify topic participants about proposal creation
- Auto-subscribe topic participants to proposal updates
- Preserve discussion context in proposal evidence
- Lock topic or redirect new replies to proposal

## Architecture Decisions

### Why Separate Tables?

Following the analysis in the architectural review, we maintain separate `topics` and `proposals` tables because:

1. **Different Domains**: Discussion (exploration) vs Decision (accountability)
2. **Different Lifecycles**: Forums can meander; proposals need structured phases
3. **Different Data Models**: Threading vs evidence/options/votes
4. **Performance**: Each optimized independently

### Seamless User Experience

Despite separate tables, the user experience is unified through:
1. Bidirectional linking (`linked_proposal_id` ↔ `source_topic_id`)
2. Automatic data population (title, description, path)
3. Status tracking (promotion badges, navigation hints)
4. Context preservation (link back to source discussion)

## Benefits

**For Community Members:**
- Natural flow from casual discussion to formal decision
- No need to manually re-type information
- Maintains discussion history and context
- Visible path from idea → decision

**For Coordinators:**
- Track proposal origins
- Understand community sentiment before voting
- Preserve deliberation context
- Measure idea-to-decision conversion

## Future Enhancements

- **Batch Promotion**: Merge multiple related topics into one proposal
- **Partial Promotion**: Convert specific posts (not entire topic) to proposal options
- **Reverse Flow**: Link proposal outcomes back to topic for follow-up discussion
- **Analytics**: Track promotion rates, time-to-promotion, community engagement patterns

## Related Documentation

- [Forum Module](../modules/forum.md)
- [Governance Module](../modules/governance.md)
- [Architecture Analysis](../architecture/forum-vs-proposals.md) (if created)
