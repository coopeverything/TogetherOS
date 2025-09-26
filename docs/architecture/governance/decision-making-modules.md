# Decision-Making Modules (Integration Plan)

**Status:** Considering the below, but we're open to other suggestions.

## Approach (integrate, don’t reinvent)
We will NOT build a full governance suite from scratch. We’ll integrate mature OSS modules behind our Next.js shell, using SSO, shared branding, a unified activity pipeline (for rewards), and a combined “news” feed.

### Backbone + specialties (current pick)
- **Backbone:** Decidim (enable only: Proposals, Debates, Participatory Budgets).  
- **Upstream sense-making:** Polis (conversation mapping; feed consensus statements into proposals).  
- **Working groups:** Loomio (threads + quick polls for committees).  
- **Special ballots (as needed):** Helios (auditable secret ballots), LiquidFeedback (delegations) in limited scopes.

> Rationale: Avoid overlap, keep admin load sane, and maximize APIs/logs for analytics and rewards.

## Identity & UX
- **SSO:** OIDC (Keycloak/NextAuth). One session across modules.
- **Branding & theming:**  
  - **Decidim:** SCSS + view overrides for header/footer; optional headless reads via GraphQL.  
  - **Loomio:** group theme + environment color variables (self-host); deeper styling if needed.  
  - **Polis:** embed in our pages; render our own summaries around it.
- **Navigation:** Mount under subpaths (e.g., `/gov`, `/groups`, `/convos`) with our global top bar; hide native headers where possible.

## Activity, Rewards, and Feed
- **Event ingestion:**  
  - Decidim → ActionLog/notifications (and/or GraphQL reads).  
  - Loomio → Webhooks to our collector.  
  - Polis → Periodic exports or DB (if self-hosted).  
- **Common event schema:** `actor_id, verb, object, context, ts, weight`.  
- **Points/Badges:** Map verbs to points with anti-gaming rules; mirror/extend Decidim badges.  
- **Unified feed:** Transform events into readable cards; show globally and per-user; send digest emails.

## MVP switchboard (enable now)
- Decidim: Proposals, Debates, Budgets (others off).  
- Loomio: enable webhooks → our collector.  
- Polis: embed + nightly export for consensus snapshots.  
- Our app: SSO, feed UI, points engine, analytics dashboards.

## Notes
- We can later go “headless” for key Decidim/CONSUL surfaces if we want tighter UI control.
- If PB or legislation needs city-style deployments, CONSUL remains a viable backbone alternative.

## Open questions
- Do we need cryptographically auditable ballots from day one?  
- Do we want delegations (LiquidFeedback) in MVP or as a pilot?
