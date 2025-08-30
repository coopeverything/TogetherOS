DDP Knowledge
Purpose
Coopeverything is an online Direct Democracy Platform (DDP) that enables people to
organize into communities, propose ideas, deliberate, vote, fund, and coordinate action.
The platform promotes trust, mutual aid, and financial empowerment while remaining
inclusive, transparent, and resilient.
Key Product Concepts
⦁	Community spaces → Topics, projects, and working groups with clear scopes and resources.
⦁	Identity → Pseudonymous-by-default accounts; progressive disclosure of identity; portable profiles.
⦁	Deliberation → Structured discussions, pros/cons capture, argument mapping, fact-checking prompts.
⦁	Decision-making → Multiple voting methods (approval, ranked, quadratic, conviction) selectable per group.
⦁	Resource allocation → Support Points / time-banking / pledge systems for labor and funds.
⦁	Legitimacy & auditability → Public logs of proposals, votes, and rule changes (privacy-aware).
⦁	Safety → Moderation tools, reputation signals, restorative workflows, and transparent appeals.
⦁	Accessibility → WCAG 2.2 AA targets; readable typography; keyboard and screen-reader support.
⦁	Internationalization → Copy and formats localizable; country/region fields normalized.
Psychology & Governance Principles
⦁	Bias mitigation → Pre-vote prompts to read opposing views; structured steelmanning checkpoints.
⦁	Cohesion → Small-group formation, rotating facilitators, rituals, and shared milestones.
⦁	Fairness → Explainability on outcomes; minority reports recorded alongside decisions.
⦁	Motivation → Visible personal and group progress; “learn-by-doing” onboarding.
Authentication & Onboarding (current focus)
⦁	Join flow: display name, email, location (City/Country/State), password, terms acceptance.
⦁	Social sign-in entry points (Google, Facebook, Twitter/X, GitHub).
⦁	Accessibility: clear labels, 44px targets, error summaries, and status messages.
⦁	Responsiveness: page fits 100% of any viewport, two-panel layout, card-internal scrolling if needed.
Data & Privacy
⦁	Data minimization; location coarse (City/Country/State) unless users opt-in for precision.
⦁	Transparent consent for analytics and A/B experiments.
⦁	Default retention limits and export/download tools for the user.
Quality Bars
⦁	Page rendering deterministically includes styles (Tailwind v4 pipeline validated in CI).
⦁	Zero blocking console errors; <100ms TTFB on cached pages; <2.5s LCP on 3G Fast.
⦁	Each feature has measurable success metrics and rollback plan.
⦁	“Stylesheet Certainty” checks: CI and VPS redeploy verify that /signup HTML includes a CSS
link and compiled CSS contains .signup and 100dvh layout rules.
