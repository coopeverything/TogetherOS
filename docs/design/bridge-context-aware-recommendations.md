# Bridge Context-Aware Recommendations System

**Status:** Design Phase
**Priority:** High
**Dependencies:** User profiles, Groups, Events, Feed, Support Points
**Author:** System Design
**Date:** 2025-11-04

---

## Vision

Transform Bridge from a passive Q&A assistant into an active community engagement coach that:
- Has context about the user's activity, location, and interests
- Knows what's happening in the user's city (groups, events, discussions)
- Makes personalized recommendations for participation
- Incentivizes engagement with Reward Points (RPs)
- Guides users through progressive levels of involvement

---

## Core Capabilities

### 1. Context Bridge Has Access To

**User Context:**
- Profile data (location, interests, skills)
- Activity history (posts, comments, reactions)
- Group memberships
- Event attendance
- Feed interactions (topics viewed, posts liked)
- Support Points allocated (shows what they care about)
- Onboarding stage/completeness
- Last active date/time

**City Context:**
- Active groups in user's city
- Upcoming events
- Popular discussion topics
- Member count and growth trends
- Recent posts in city feed
- Available volunteer opportunities
- Active group chats/sub-forums

**Global Context:**
- National thematic groups (e.g., "Cooperative Housing - USA")
- Global topic-based groups (e.g., "Climate Action Network")
- Trending discussions across the platform
- Success stories from similar cities
- Recommended activities by city size

---

## 2. Recommendation Types

### A. Local Group Discovery

**Scenario:** User lives in a city with active groups they haven't joined

**Bridge Behavior:**
```
"I noticed there's a Cooperative Housing group in [City] with 23 members.
Based on your interest in sustainable living, this might be a good fit.
Want to check it out?"
```

**Data Required:**
- User's city/location
- Groups in that city (with member counts)
- User's expressed interests
- User's current group memberships

**Nudge Triggers:**
- User asks about housing/sustainability
- User mentions feeling isolated
- User asks "what can I do?"
- User is active but not in any groups

---

### B. Event Participation

**Scenario:** Upcoming event in user's city that matches their interests

**Bridge Behavior:**
```
"There's a community garden meetup this Saturday in [City].
You've shown interest in local food systems. 12 people have RSVP'd.
RSVPing will earn you 5 RPs. Interested?"
```

**Data Required:**
- Events in user's city (date, time, location)
- User's interest tags
- RSVP count
- Whether user has seen it in feed
- RP reward amount

**Nudge Triggers:**
- User asks about weekend activities
- Event is within 7 days
- Event matches user's interests (70%+ match)
- User hasn't RSVP'd yet

---

### C. Discussion/Forum Engagement

**Scenario:** Active discussion in a group chat or sub-forum relevant to user

**Bridge Behavior:**
```
"The [City] Cooperative Housing group is having a lively discussion
about starting a community land trust. You have experience with this—
your input would be valuable. Want to jump in?"
```

**Data Required:**
- Active threads in user's groups
- User's expertise/experience tags
- Thread participation counts
- Recency of activity

**Nudge Triggers:**
- User's expertise matches discussion topic
- High-engagement thread (10+ comments in 24h)
- User has relevant experience (from profile/posts)

---

### D. Activity Suggestions by City Size

**Scenario:** User asks "What can [N] people do in my city?"

**Bridge's Knowledge Base:**

| City Size | Suggested Activities | Prerequisites | RP Rewards |
|-----------|---------------------|---------------|------------|
| 5-15 people | • Organize coffee meetup<br>• Start skill-share group<br>• Create WhatsApp/Signal group | None | 10 RPs |
| 15-30 people | • Host community dinner<br>• Launch local project (garden, tool library)<br>• Organize monthly gathering | Group formed | 25 RPs |
| 30-50 people | • Form housing co-op<br>• Start timebank<br>• Create mutual aid network | Formal structure | 50 RPs |
| 50-100 people | • Launch cooperative business<br>• Organize larger events<br>• Establish community space | Legal entity | 100 RPs |
| 100+ people | • Form neighborhood council<br>• Create cooperative credit union<br>• Run for local office | Governance structure | 200 RPs |

**Bridge Behavior:**
```
"With 23 active members in [City], you could organize a monthly community
dinner. I see you have a kitchen space listed—that's perfect!
Hosting your first dinner earns 25 RPs. Want me to help you plan it?"
```

---

### E. National/Global Group Recommendations

**Scenario:** User interested in a topic without local group, or wants broader connection

**Bridge Behavior:**
```
"While there isn't a climate action group in [City] yet, there's a
national Climate Resilience Network with 347 members across 42 cities.
They share best practices and coordinate campaigns. Want to join?"
```

**Recommendation Logic:**
1. Check for local group first (always prioritize local)
2. If no local group, suggest regional/national
3. If user is already in 3+ local groups, suggest thematic global groups
4. Match based on user's expressed interests + activity patterns

---

### F. Social Media Amplification

**Scenario:** User posts about a successful project/event

**Bridge Behavior:**
```
"That community dinner was a success! 🎉
Want to share it on social media to inspire others?
Post with #TogetherOS and you'll earn 15 RPs.
I can help you draft a post if you'd like."
```

**Incentive Structure:**
- Share event/success: 15 RPs
- Share project launch: 25 RPs
- Share impact story: 50 RPs
- Tag #TogetherOS: +5 RPs bonus
- Link back to platform: +10 RPs bonus

**Verification:**
- Self-reported (honor system initially)
- Future: Social media API integration for verification
- Fraud detection: Monitor unusual RP claiming patterns

---

## 3. Interest Inference & Recommendation Engine

### Interest Graph

**Explicit Interests** (user-declared):
- Profile tags: ["housing", "climate", "food systems"]
- Onboarding selections
- Group memberships

**Implicit Interests** (behavior-derived):
- Topics user reads about (feed interactions)
- Keywords in user's posts/comments
- Support Points allocation targets
- Events attended
- Time spent on different content types

### Similarity Matching

**User-to-User:**
```
If User A and User B share 3+ interests, and User B joined Group X,
recommend Group X to User A.
```

**User-to-Content:**
```
If User posted about "community gardens" and "local food",
suggest events/groups tagged with:
- permaculture
- urban agriculture
- food sovereignty
- CSA (Community Supported Agriculture)
```

**Semantic Clustering:**
```
Interest Categories:
├─ Housing & Land
│  ├─ cooperative housing
│  ├─ community land trusts
│  ├─ tiny homes
│  └─ co-living
├─ Food Systems
│  ├─ community gardens
│  ├─ food cooperatives
│  ├─ urban farming
│  └─ CSAs
├─ Mutual Support
│  ├─ timebanking
│  ├─ mutual aid
│  ├─ skill sharing
│  └─ tool libraries
└─ (etc.)
```

---

## 4. System Architecture

### Data Models

#### User Context Profile
```typescript
interface UserContext {
  userId: string;

  // Location
  city: string;
  region: string;
  country: string;

  // Interests
  explicitInterests: string[]; // From profile
  implicitInterests: InterestScore[]; // Derived from behavior

  // Activity
  groupMemberships: GroupMembership[];
  eventAttendance: EventAttendance[];
  feedInteractions: FeedInteraction[];
  supportPointsAllocated: SupportPointAllocation[];
  postsCount: number;
  commentsCount: number;
  lastActiveAt: Date;

  // Engagement level
  engagementScore: number; // 0-100
  onboardingComplete: boolean;

  // Recommendations history
  recommendationsSeen: RecommendationLog[];
  recommendationsActedOn: RecommendationLog[];
}

interface InterestScore {
  topic: string;
  score: number; // 0-100 confidence
  derivedFrom: 'post' | 'comment' | 'feed_view' | 'support_points' | 'event_attendance';
  lastUpdated: Date;
}
```

#### City Context Profile
```typescript
interface CityContext {
  city: string;
  region: string;

  // Groups
  activeGroups: GroupSummary[];
  totalGroupMembers: number;

  // Events
  upcomingEvents: EventSummary[];
  recentEvents: EventSummary[];

  // Activity
  recentPosts: PostSummary[];
  activeDiscussions: DiscussionSummary[];

  // Trends
  trendingTopics: string[];
  growthRate: number; // Month-over-month

  // Recommendations
  suggestedActivitiesByCitySize: Activity[];
}
```

#### Recommendation
```typescript
interface Recommendation {
  id: string;
  userId: string;
  type: 'group' | 'event' | 'discussion' | 'activity' | 'social_share' | 'thematic_group';

  // Content
  title: string;
  description: string;
  targetId: string; // Group ID, Event ID, etc.

  // Context
  relevanceScore: number; // 0-100
  matchedInterests: string[];
  cityContext?: string;

  // Incentives
  rewardPoints?: number;
  urgency?: 'low' | 'medium' | 'high'; // e.g., event in 2 days

  // State
  status: 'pending' | 'shown' | 'acted_on' | 'dismissed';
  shownAt?: Date;
  actedOnAt?: Date;

  // Tracking
  nudgeCount: number; // How many times we've mentioned this
  maxNudges: number; // Don't be annoying
}
```

### Context Injection System

**When Bridge Receives a Question:**

```typescript
async function buildBridgeContext(userId: string, question: string): Promise<BridgeContext> {
  // 1. Fetch user context
  const userContext = await getUserContext(userId);

  // 2. Fetch city context
  const cityContext = await getCityContext(userContext.city);

  // 3. Determine intent from question
  const intent = await classifyIntent(question); // "seeking_activity", "asking_about_groups", etc.

  // 4. Generate relevant recommendations
  const recommendations = await generateRecommendations({
    userContext,
    cityContext,
    intent,
  });

  // 5. Build enhanced prompt
  return {
    systemPrompt: buildSystemPrompt(userContext, cityContext, recommendations),
    conversationHistory: [...existingHistory],
    recommendations,
  };
}
```

**Enhanced System Prompt:**
```typescript
function buildSystemPrompt(
  user: UserContext,
  city: CityContext,
  recommendations: Recommendation[]
): string {
  return `You are Bridge, the engagement coach for TogetherOS.

CONTEXT ABOUT THIS USER:
- Location: ${user.city}, ${user.region}
- Interests: ${user.explicitInterests.join(', ')}
- Group memberships: ${user.groupMemberships.length}
- Engagement level: ${user.engagementScore}/100

WHAT'S HAPPENING IN ${user.city.toUpperCase()}:
- ${city.activeGroups.length} active groups (${city.totalGroupMembers} total members)
- ${city.upcomingEvents.length} upcoming events this month
- Trending topics: ${city.trendingTopics.join(', ')}

SUGGESTED ACTIVITIES FOR ${city.totalGroupMembers} MEMBERS:
${city.suggestedActivitiesByCitySize.map(a => `- ${a.name} (${a.rewardPoints} RPs)`).join('\n')}

PERSONALIZED RECOMMENDATIONS FOR THIS USER:
${recommendations.map(r => `- [${r.type}] ${r.title} (${r.rewardPoints} RPs) - ${r.relevanceScore}% match`).join('\n')}

YOUR ROLE:
1. Answer their question naturally
2. If relevant, suggest 1-2 recommendations from the list above
3. Explain WHY you're suggesting it (based on their interests/context)
4. Mention RP rewards when applicable
5. Be conversational, not salesy
6. If they show interest, offer to help them take action

EXAMPLES:
- User asks "What can I do?" → Suggest highest-relevance recommendation + explain match
- User mentions feeling isolated → Recommend local group with similar interests
- User asks about event → Check if it's in their city, provide details + RSVP link
- User completes an action → Congratulate + suggest next step

Remember: Guide, don't push. Help them discover opportunities, don't spam them.`;
}
```

---

## 5. Recommendation Rules Engine

### Triggering Logic

```typescript
interface RecommendationRule {
  name: string;
  trigger: TriggerCondition;
  recommendations: RecommendationType[];
  priority: number;
  maxFrequency: FrequencyLimit;
}

// Example rules
const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    name: "New user local group discovery",
    trigger: {
      userGroupCount: { max: 0 },
      cityGroupCount: { min: 1 },
      daysActive: { min: 3 },
    },
    recommendations: ['local_group'],
    priority: 10,
    maxFrequency: { times: 1, per: 'week' },
  },
  {
    name: "Event in user's city within 7 days",
    trigger: {
      upcomingEventInCity: true,
      eventMatchesInterests: { minScore: 70 },
      eventDaysUntil: { max: 7 },
      userHasRSVPd: false,
    },
    recommendations: ['event'],
    priority: 8,
    maxFrequency: { times: 2, per: 'week' },
  },
  {
    name: "Active discussion in user's interest area",
    trigger: {
      discussionActivity: { minComments: 10, within: '24h' },
      discussionMatchesInterests: { minScore: 80 },
      userHasCommented: false,
    },
    recommendations: ['discussion'],
    priority: 6,
    maxFrequency: { times: 3, per: 'day' },
  },
  {
    name: "City size activity suggestions",
    trigger: {
      questionContains: ['what can', 'people do', 'organize'],
      userHasNoClearIntent: true,
    },
    recommendations: ['activity_by_city_size'],
    priority: 7,
    maxFrequency: { times: 1, per: 'conversation' },
  },
  {
    name: "Thematic group for active users",
    trigger: {
      userGroupCount: { min: 2 },
      userEngagementScore: { min: 60 },
      noLocalGroupForInterest: true,
    },
    recommendations: ['thematic_group'],
    priority: 5,
    maxFrequency: { times: 1, per: 'month' },
  },
  {
    name: "Social media amplification",
    trigger: {
      userCompletedActivity: true,
      activityWorthSharing: true, // event attendance, project launch
      userHasntSharedRecently: { within: '7d' },
    },
    recommendations: ['social_share'],
    priority: 4,
    maxFrequency: { times: 1, per: 'event' },
  },
];
```

### Anti-Spam Protection

**Frequency Limits:**
- Max 3 recommendations per conversation
- Max 1 of same type per week
- Track dismissals: if user dismisses 3 times, stop suggesting that type
- Respect "don't show again" user preference

**Relevance Thresholds:**
- Don't recommend if relevanceScore < 60
- Prioritize by: urgency → relevanceScore → RP reward

---

## 6. Privacy Considerations

### What Bridge Sees
- ✅ Public profile information
- ✅ User's own activity (posts, comments, group memberships)
- ✅ Aggregated city statistics (not individual user data)
- ✅ Public events and groups

### What Bridge Doesn't See
- ❌ Private messages
- ❌ Other users' private profiles
- ❌ Unpublished drafts
- ❌ Financial transaction details (only RP amounts)

### User Controls
- Opt-out of recommendations entirely
- Opt-out by category (e.g., "no event recommendations")
- "Don't show me this again" per recommendation
- Privacy settings: hide activity from Bridge context

---

## 7. Implementation Phases

### Phase 1: Context Foundation (4 weeks)
**Goal:** Give Bridge read access to user/city context

- [ ] Create `UserContext` data model
- [ ] Create `CityContext` data model
- [ ] Build context fetching service
- [ ] Update Bridge API to accept `userId` parameter
- [ ] Inject basic context into system prompt
- [ ] Test: Bridge can reference user's city and interests

**Deliverable:** Bridge can say "I see you're in [City] and interested in [topics]"

---

### Phase 2: Static Recommendations (3 weeks)
**Goal:** Bridge can reference pre-defined recommendation lists

- [ ] Create activity recommendations by city size (static data)
- [ ] Add recommendation templates to Bridge knowledge base
- [ ] Implement simple matching: if user asks about activities, show list
- [ ] Track when recommendations are shown (analytics)

**Deliverable:** Bridge can suggest activities based on city member count

---

### Phase 3: Dynamic Recommendations (5 weeks)
**Goal:** Bridge generates personalized recommendations in real-time

- [ ] Build recommendation generator service
- [ ] Implement interest inference algorithm
- [ ] Create group discovery recommendations
- [ ] Create event recommendations
- [ ] Implement relevance scoring
- [ ] Add RP reward integration

**Deliverable:** Bridge suggests specific groups/events based on user interests

---

### Phase 4: Engagement Tracking (3 weeks)
**Goal:** Track if users act on recommendations

- [ ] Create `Recommendation` entity with tracking
- [ ] Log when recommendations are shown
- [ ] Track when users click through
- [ ] Track when users complete actions (join group, RSVP, etc.)
- [ ] Analytics dashboard for recommendation effectiveness

**Deliverable:** Metrics on recommendation conversion rates

---

### Phase 5: Rules Engine (4 weeks)
**Goal:** Sophisticated triggering and frequency management

- [ ] Implement recommendation rules DSL
- [ ] Build rules evaluation engine
- [ ] Add frequency limits and anti-spam
- [ ] Implement dismissal tracking
- [ ] Add user preference controls (opt-out)

**Deliverable:** Smart, non-annoying recommendation timing

---

### Phase 6: Social Media Integration (3 weeks)
**Goal:** Incentivize platform promotion

- [ ] Create social share recommendation type
- [ ] Implement RP reward claiming flow
- [ ] Track social shares (self-reported)
- [ ] Analytics: platform mentions, referral traffic
- [ ] Future: Social media API verification

**Deliverable:** Users can earn RPs for sharing on social media

---

### Phase 7: Advanced Personalization (4 weeks)
**Goal:** ML-powered recommendations

- [ ] Build interest inference ML model
- [ ] Implement collaborative filtering (user-to-user similarity)
- [ ] Add semantic topic clustering
- [ ] A/B test recommendation strategies
- [ ] Optimize relevance scoring

**Deliverable:** Continuously improving recommendation accuracy

---

## 8. Success Metrics

### Engagement Metrics
- **Recommendation Click-Through Rate:** % of shown recommendations clicked
- **Recommendation Conversion Rate:** % of recommendations that led to action
- **Average Recommendations per User:** Track spam levels
- **User Dismissal Rate:** Track if we're being annoying

### Community Growth Metrics
- **Group Discovery:** Users joining groups via Bridge recommendations
- **Event Participation:** RSVP rate from Bridge nudges
- **Content Creation:** Posts/comments after Bridge suggestions
- **Social Amplification:** Social media shares with #TogetherOS

### Business Metrics
- **User Retention:** Users who receive recommendations vs control group
- **Activation Rate:** Onboarding completion with vs without recommendations
- **Engagement Score:** Average user engagement over time
- **RP Distribution:** Total RPs earned via recommendation actions

### Quality Metrics
- **Recommendation Relevance Score:** Self-reported by users
- **User Satisfaction:** NPS for Bridge recommendations
- **Privacy Concerns:** Track opt-out rates, support tickets

---

## 9. Example Scenarios

### Scenario A: New User, Active City
```
User: "I just moved to Portland. What can I do?"

Bridge Context:
- User: New (3 days), no groups, interests: ["housing", "climate"]
- City: Portland has 87 members, 4 active groups, 2 upcoming events

Bridge Response:
"Welcome to Portland! There's a vibrant community here with 87 members.

I see you're interested in housing and climate. Perfect timing—there's
a Housing Cooperative Formation Workshop next Tuesday (April 15) with
23 people already signed up. This could be a great way to meet others
and learn about co-housing options.

Portland also has an active Climate Action group with 34 members.
They meet monthly and coordinate local projects.

Want to RSVP for the workshop or join the Climate Action group?
Both actions earn you Reward Points you can use to support projects."
```

---

### Scenario B: Active User, Expertise Match
```
User: "How do I help organize a tool library?"

Bridge Context:
- User: Active (6 months), 3 groups, has organized 2 events
- Expertise: community organizing, mutual aid
- City: Discussion thread about tool library (18 comments, 2 hours old)

Bridge Response:
"Great question! I actually noticed the Mutual Aid Network group in
[City] is discussing exactly this right now—there's a lively thread
with 18 comments in the last 2 hours.

Given your experience organizing community events, your input would
be really valuable. Sarah mentioned needing help with logistics, and
Tom asked about insurance—both areas you've dealt with before.

Want to jump into that discussion? I can link you directly to it."
```

---

### Scenario C: City Size Activity Suggestion
```
User: "We have about 30 people in my city. What can we realistically do?"

Bridge Context:
- City: 28 active members
- No formal structure yet (no registered co-op)

Bridge Response:
"With 28 active members, you're at a great size for launching a
community project! Here are some proven activities for your size:

🍽️ **Community Dinner Series (25 RPs)**
Host monthly potlucks. Builds relationships, low commitment.
[City X] did this and grew to 45 members in 6 months.

🌱 **Community Garden (50 RPs)**
If you have land access, this creates ongoing engagement.
[City Y] started with 22 people, now has a thriving garden.

⏰ **Timebanking System (75 RPs)**
Exchange skills without money. Needs coordination but high impact.
[City Z] has 30 active timebankers.

Which of these sounds most interesting to you? I can help you
plan the first steps."
```

---

## 10. Technical Considerations

### Performance
- Cache user context (refresh every 5 minutes)
- Cache city context (refresh every hour)
- Pre-compute recommendations for active users (batch job)
- Rate limit recommendation generation (max 1 req/second per user)

### Scalability
- Recommendation generation is async (don't block chat responses)
- Use message queue for recommendation processing
- Partition by city for efficient queries
- Index on: userId, city, interests, lastActiveAt

### Data Pipeline
```
User Activity → Event Stream → Context Aggregator → User/City Context DB
                                       ↓
                            Recommendation Generator
                                       ↓
                          Recommendation Storage (scored, ranked)
                                       ↓
                            Bridge Query Service (runtime)
```

---

## 11. Open Questions / Future Research

1. **How do we prevent echo chambers?**
   - Should Bridge recommend groups/events OUTSIDE user's comfort zone?
   - Balance between relevance and diversity

2. **How do we handle seasonal/temporal interests?**
   - User interested in "gardening" in spring, not winter
   - Track interest seasonality?

3. **How do we recommend when to START a group?**
   - "No housing co-op in your city yet—want to start one?"
   - When is critical mass reached?

4. **How do we incentivize cross-city collaboration?**
   - Connect similar-sized cities for peer learning
   - Regional coordination (e.g., housing campaign across 5 cities)

5. **How do we handle user burnout?**
   - Detect over-engagement, suggest taking breaks
   - "You've been very active—want to focus on fewer projects?"

6. **How do we measure recommendation quality without spam?**
   - A/B testing without annoying users
   - Implicit signals (time spent, return rate) vs explicit feedback

---

## 12. Documentation & Knowledge Base

### Bridge's Internal Knowledge
Create structured data files for Bridge to reference:

**`bridge-knowledge/activities-by-city-size.json`**
```json
{
  "5-15": [
    {
      "name": "Coffee Meetup",
      "description": "Informal gathering at local cafe",
      "difficulty": "easy",
      "reward_points": 10,
      "time_commitment": "2 hours",
      "prerequisites": "none"
    },
    // ...
  ],
  "15-30": [...],
  // etc.
}
```

**`bridge-knowledge/interest-clusters.json`**
```json
{
  "housing": {
    "related": ["cooperative housing", "community land trusts", "co-living", "tiny homes"],
    "semantic_neighbors": ["urban planning", "real estate", "architecture"],
    "common_pairs": ["climate", "mutual aid"]
  },
  // etc.
}
```

**`bridge-knowledge/recommendation-templates.json`**
```json
{
  "local_group_discovery": {
    "template": "I noticed there's a {group_name} in {city} with {member_count} members. Based on your interest in {matched_interest}, this might be a good fit. Want to check it out?",
    "variables": ["group_name", "city", "member_count", "matched_interest"],
    "tone": "helpful, not pushy"
  },
  // etc.
}
```

---

## 13. Summary

This system transforms Bridge from a knowledge bot into an engagement coach that:

✅ **Knows** the user's context (location, interests, activity)
✅ **Sees** what's happening in their city (groups, events, discussions)
✅ **Suggests** personalized next steps based on relevance
✅ **Incentivizes** action with Reward Points
✅ **Guides** users through progressive engagement levels
✅ **Respects** privacy and anti-spam limits

**Key Innovation:** Context-aware recommendations that feel natural, not algorithmic.

**Implementation Time:** ~26 weeks (6-7 months) for full system
**MVP:** Phase 1-3 (12 weeks) for basic context-aware recommendations

---

## Next Steps

1. **Review & refine** this design with team
2. **Prioritize** phases based on user research
3. **Build** Phase 1 (Context Foundation) first
4. **Test** with small group of active users
5. **Iterate** based on feedback and metrics

---

**Questions? Additions? Feedback?**
This is a living document. Update as we learn.
