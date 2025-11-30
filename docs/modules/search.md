# Search & Tags

**Purpose:** Help members discover content, filter by cooperation paths and keywords, and find relevant discussions, proposals, and resources across TogetherOS.

**Status:** 100% — Production Ready

---

## Overview

The Search module makes it easy to find what you need:

1. **Global Search** — Find proposals, forum topics, posts, and member profiles
2. **Path Filtering** — Filter results by any of the 8 Cooperation Paths
3. **Keyword Tags** — Discover content through community-driven tags
4. **Saved Searches** — Save and reuse your frequent searches
5. **Search History** — Review your recent searches (with privacy controls)

### Design Principles

- **Privacy-first:** Your search queries are never stored in plain text
- **Relevant results:** Newest and most-engaged content ranks higher
- **Cooperative taxonomy:** All content maps to the 8 Cooperation Paths
- **Simple to powerful:** Basic search is easy, advanced filters are discoverable

---

## Our Values in Action

### Transparency

Search is clear and fair:

- **Open ranking:** See how results are ordered (relevance + recency + engagement)
- **No hidden algorithms:** Ranking factors are documented
- **Public taxonomy:** The 8 Cooperation Paths organize all content

### Open Source

The search system is fully open:

- **Inspect the code:** See how search works under the hood
- **Community-driven tags:** Keywords come from member contributions
- **No black box:** Every search feature is documented

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **Search features:** Community decides what to prioritize
- **Tag management:** Members propose and vote on new keywords
- **Privacy policies:** Vote on how search data is handled
- **Your voice matters:** From ranking weights to retention periods, members decide

---

## How to Search

### Basic Search

Type anything in the search bar:
- Keywords from titles or content
- Member names or handles
- Specific topics or proposals

### Filter by Type

Narrow results to specific content:
- **All** — Everything
- **Proposals** — Governance proposals
- **Topics** — Forum discussions
- **Posts** — Individual forum posts
- **Profiles** — Member profiles

### Filter by Cooperation Path

Find content in specific areas:
- Collaborative Education
- Social Economy
- Common Wellbeing
- Cooperative Technology
- Collective Governance
- Community Connection
- Collaborative Media & Culture
- Common Planet

---

## Saved Searches

Save searches you use frequently:
- Click "Save Search" on any search
- Access saved searches from your profile
- Up to 25 saved searches per member
- Remove anytime

---

## Privacy

Your search activity is protected:

- **Query hashing:** Raw search text is never stored
- **Your data, your control:** Export or delete your search history anytime
- **90-day retention:** Search data automatically expires
- **GDPR compliant:** Full data portability and deletion rights

---

## Related Modules

- [Governance](./governance.md) — Search proposals
- [Forum](./forum.md) — Search discussions
- [Groups](./groups.md) — Find communities

---

## Technical Implementation

For developers interested in the database schemas, API endpoints, ranking algorithms, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/search-technical.md)

---

<!-- progress:search=100 -->
