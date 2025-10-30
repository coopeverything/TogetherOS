# Bridge Module - Progress Report

**Last Updated:** 2025-10-30
**Current Status:** 40% complete (Onboarding/Landing Pilot phase)
**Phase:** Landing Pilot (Internal MVP)

---

## Overview

Bridge is TogetherOS's AI-powered cooperation amplifier. The current focus is completing the **Landing Pilot** - a minimal `/bridge` page where visitors can ask "What is TogetherOS?" and get a calm, mission-first streamed answer.

---

## ✅ Completed (Phase 1 - Landing Pilot Foundation)

### Infrastructure & API
- [x] **Streaming API endpoint** - `POST /api/bridge/ask` with NDJSON streaming
- [x] **NDJSON logging** - Append-only logs to `logs/bridge/actions-YYYY-MM-DD.ndjson`
- [x] **Rate limiting** - IP-based throttling (30 req/hour configurable)
- [x] **Error taxonomy** - Proper HTTP status codes (204, 401, 429, 500)
- [x] **PII protection** - IP hashing, no raw prompts stored

### UI Components
- [x] **BridgeChat component** - React component with streaming support
- [x] **Basic styling** - Clean, accessible interface
- [x] **Loading states** - Animated indicators during streaming

### Configuration & Docs
- [x] **OpenAI integration** - API key setup and configuration
- [x] **Configuration docs** - `docs/modules/bridge/configuration.md`
- [x] **Enhanced error handling** - Fallbacks and user-friendly messages
- [x] **Module spec** - Complete spec in `docs/modules/bridge.md`
- [x] **Landing pilot spec** - Detailed plan in `docs/modules/bridge/landing-pilot.md`

---

## 🔄 In Progress

Currently no active work items. Ready for next phase tasks.

---

## 🎯 Next Steps (To Complete Landing Pilot)

### 1. Test with Real API Key
**Status:** To Do
**Size:** XS
**Description:**
- Test Bridge endpoint with actual OpenAI API key
- Verify end-to-end streaming works
- Validate NDJSON logs write correctly
- Test rate limiting behavior

**Acceptance:**
- Live `/bridge` page successfully streams answers
- NDJSON logs confirm requests are logged
- Rate limiting prevents abuse

---

### 2. Add Storybook Stories
**Status:** To Do
**Size:** S
**Description:**
- Create Storybook stories for BridgeChat component
- Cover all UI states:
  - Empty state (placeholder)
  - Loading/streaming (animated dots)
  - Success (answer displayed)
  - Error states (204, 401, 429, 500)

**Acceptance:**
- Storybook URL shows all states
- Stories pass accessibility checks
- Visual regression tests pass

---

### 3. Accessibility Audit
**Status:** To Do
**Size:** XS
**Description:**
- Run axe/lighthouse audit on `/bridge` page
- Fix any a11y issues:
  - Proper labels on inputs
  - Visible focus ring
  - Keyboard navigation (Enter to submit)
  - Reduced motion support

**Acceptance:**
- axe audit passes with no critical issues
- Lighthouse accessibility score ≥ 90
- Keyboard-only navigation works

---

### 4. Seed FAQ from Testers
**Status:** To Do
**Size:** S
**Description:**
- Collect 10-30 good questions from internal testers
- Curate into `docs/modules/bridge/faq-seed.md`
- Identify common question patterns
- Note any answer quality issues

**Acceptance:**
- `faq-seed.md` contains ≥10 high-quality Q&A pairs
- Helpful rating from testers ≥70%
- p95 time-to-first-token < 800ms

---

## 📋 Backlog (Future Phases)

### Phase 2: Citations & Grounded Answers
- [ ] MCP server integration (`docs.search`, `docs.get`)
- [ ] Source chips UI component
- [ ] Citation format: `{ path, lines[] }`
- [ ] Knowledge dataset (JSONL) from docs
- [ ] Fixture-first retrieval system

### Phase 3: Thread Tidy
- [ ] Thread summarization endpoint
- [ ] Structured output (Problem → Options → Trade-offs → Next Steps)
- [ ] Tag extraction (e.g., `type:increment`, `size:S`)
- [ ] Action item extraction with links

### Phase 4: Moderation Assist
- [ ] Tone detection (non-punitive)
- [ ] Reframe suggestions
- [ ] Appeal process UI
- [ ] Oversight Circle workflow

### Phase 5: Federation & Learning
- [ ] Per-group knowledge indices
- [ ] Anonymized insight cards
- [ ] Feedback tagging (helpful/bias/off-topic)
- [ ] Monthly audit reports

---

## 📊 Metrics (Landing Pilot)

### Performance
- **Time-to-first-token (p95):** Target < 800ms
- **Streaming latency:** Target < 200ms to first chunk

### Quality
- **Helpful rating:** Target ≥70% from testers
- **FAQ seed size:** Target 10-30 curated questions

### Reliability
- **Rate limiting:** 30 req/hour/IP (configurable)
- **Error rate:** Monitor 5xx responses
- **Uptime:** Track availability on VPS

---

## 🔗 Related Files

- **Main spec:** `docs/modules/bridge.md`
- **Landing pilot spec:** `docs/modules/bridge/landing-pilot.md`
- **Configuration:** `docs/modules/bridge/configuration.md`
- **API implementation:** `apps/web/app/api/bridge/ask/route.ts`
- **UI component:** `packages/ui/src/bridge/BridgeChat.tsx`
- **Logs:** `logs/bridge/actions-YYYY-MM-DD.ndjson`

---

## 🚀 Quick Start (For Contributors)

**To work on Bridge:**
1. Read `docs/modules/bridge/landing-pilot.md` for current scope
2. Check this file for status of each task
3. Pick a "Next Steps" item marked "To Do"
4. Follow acceptance criteria
5. Update this file when complete

**To test locally:**
1. Set `OPENAI_API_KEY` in `.env`
2. Run `pnpm dev`
3. Visit `http://localhost:3000/bridge`
4. Ask a question and verify streaming works
5. Check `logs/bridge/` for NDJSON entries

---

*This file is manually updated. Last edit: 2025-10-30*
