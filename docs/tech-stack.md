# TogetherOS Tech Stack

## Frontend Stack

### Core Framework
- **Next.js 14** — React framework with App Router
- **React 18+** — UI library
- **TypeScript** — Type-safe development (strict mode)

### Styling & UI
- **Tailwind CSS v4** — Utility-first styling
- **shadcn/ui** — Component library (planned, not yet installed)
- **Design tokens** — Tailwind config with TogetherOS brand colors
- **Dark mode** — Configurable theme support (planned)

### Component Development
- **Storybook** — Component documentation and testing (planned)
- **Component patterns:**
  - Loading skeletons
  - Empty states
  - Error boundaries
  - Accessibility (a11y) required

---

## Backend Stack

### API Layer
- **tRPC** or **REST APIs** — Typed endpoints (tRPC preferred)
- **Node.js 20+** — Runtime environment
- **Zod** — Schema validation for all inputs/outputs

### Background Jobs
- **Workers** — Queue pattern for async tasks
- **NDJSON logging** — Append-only audit trails

### Data Layer (MVP Phase)
- **In-memory repositories** — Fixture-based data (no database yet)
- **Fixture repos** — `packages/{module}-fixtures/`
- **Future:** Database layer (not yet specified)

---

## Monorepo Structure

### Package Manager
- **pnpm** — Fast, disk-efficient package manager
- **Workspace pattern:**
  ```
  pnpm-workspace.yaml
  apps/
    ├── web/           # Next.js frontend
    └── api/           # Backend services
  packages/
    ├── ui/            # Shared components
    ├── types/         # TypeScript types
    ├── validators/    # Zod schemas
    ├── fixtures/      # Test data
    └── config/        # Shared configs
  ```

### Build Tool
- **Turbo** (optional) — Monorepo build orchestration
- **Next.js compiler** — Built-in Rust-based bundler

---

## Development Tools

### Code Quality
- **ESLint** — JavaScript/TypeScript linting
- **Prettier** — Code formatting
- **TypeScript** — Type checking (`tsc --noEmit`)

### YAML & Markdown
- **yamllint** — YAML validation (`.yamllint.yaml` config)
- **actionlint** — GitHub Actions workflow validation
- **markdownlint-cli2** — Markdown style checks (`.markdownlint.jsonc` config)
- **lychee** — Link validation (internal & external)

### Validation Scripts
- **scripts/validate.sh** — Main validator (checks tool presence, runs lint suite)
- **scripts/lint.sh** — Multi-tool linting
- **Expected output:**
  ```
  LINT=OK
  VALIDATORS=GREEN
  SMOKE=OK
  ```

---

## Testing Stack

### Test Framework
- **Vitest** — Fast unit test runner
- **Contract tests** — Zod schema validation in tests
- **Fixture-based testing** — Deterministic test data

### Test Patterns
- **Unit tests** — For entities, repos, handlers
- **Contract tests** — API endpoint schemas
- **Storybook stories** — Visual component testing
- **Integration tests** — End-to-end flows (planned)

---

## Infrastructure & DevOps

### Containerization
- **Docker** — Development and production containers
- **Docker Compose** — Multi-container orchestration
- **Dev Container** — VS Code + Node.js 20 + Git + GitHub CLI

### CI/CD
- **GitHub Actions** — 16 workflows total
- **Required checks:**
  - `ci/lint` — YAML validation (yamllint, actionlint)
  - `ci/docs` — Markdown + link validation
  - `ci/smoke` — Validator scripts (optional but recommended)

### Deployment
- **VPS deployment** — Rsync to remote server
- **GitHub Actions secrets:**
  - `SSH_PRIVATE_KEY`
  - `VPS_HOST`
  - `VPS_USER`
  - `VPS_PATH`
- **Deployment trigger:** Push to main or manual workflow dispatch

---

## Logging & Observability

### Log Format
- **NDJSON** (Newline-Delimited JSON)
- **Required fields:**
  ```json
  {
    "id": "uuid",
    "timestamp": "ISO8601",
    "event_type": "qa|tidy|moderation|transaction",
    "metadata": {}
  }
  ```
- **Privacy:** IP hashing, PII redaction, no raw prompts

### Log Validation
- **Integrity checks:** SHA-256 chain validation
- **CI validation:** `scripts/validate.sh` checks:
  - File exists
  - Last non-empty line parses as JSON
  - Required fields present

### Observability (Planned)
- **Error boundaries** — React error catching
- **Uptime monitoring** — Simple health checks
- **Public dashboards** — Activity metrics, delivery reports
- **Third-party options:** Self-hosted or external service (TBD)

---

## Security & Privacy Tools

### Security
- **Least-privilege tokens** — Minimal GitHub Actions permissions
- **Secrets management** — GitHub Actions secrets only
- **No secrets in logs** — Never echo secret values
- **Dependency scans** — Regular updates via Dependabot (planned)

### Privacy
- **PII redaction** — Emails, phones, handles removed from logs
- **IP hashing** — Anonymous usage tracking
- **No raw prompts stored** — Bridge AI logs only metadata
- **Data minimization** — Store least required information

---

## Database (Future)

### Planned Approach
- **MVP phase:** In-memory/fixture repos only
- **Phase 2:** Database layer (not yet specified)
- **Options being considered:**
  - PostgreSQL with Prisma
  - SQLite for local/small groups
  - Distributed options for federation

### Data Access Patterns
- **Repository pattern** — `packages/{module}-domain/repos/`
- **Entity models** — Domain-driven design
- **Fixtures first** — All features start with fixture data

---

## AI/LLM Integration (Bridge)

### Bridge AI Assistant
- **LLM provider:** Hosted API (specific provider not specified)
- **No tools yet** — Simple Q&A and summarization
- **Citation required** — 100% of answers must include sources
- **Rate limiting:** 30 requests/hour/IP (landing pilot)
- **Streaming responses** — Progressive UI updates

### Future AI Capabilities
- **Local LLM** — Ollama integration (optional, behind flag)
- **Moderation assist** — Tone cues, de-escalation suggestions
- **Thread tidying** — Structured summaries (problem → options → trade-offs)

---

## Federation (Future)

### Inter-Group Protocols
- **Group handles** — Unique identifiers
- **Proposal sync** — Cross-group initiatives
- **Result mirroring** — Shared decision outcomes
- **Local autonomy** — Per-group data silos with opt-in federation

### Technical Requirements
- **APIs:** Typed endpoints for federation
- **Webhooks:** External tool integrations
- **Data portability:** Exportable decision histories

---

## Environment Configuration

### Environment Variables (Planned)
```bash
# API
API_URL=http://localhost:3000
TRPC_URL=/api/trpc

# Bridge
BRIDGE_ENABLED=true
BRIDGE_TIDY_ENABLED=false
BRIDGE_FIXTURES=/path/to/docs.jsonl
BRIDGE_LOG_DIR=/path/to/logs/bridge/
BRIDGE_LOG_KEY=<secret>

# LLM Provider (TBD)
LLM_API_KEY=<secret>
LLM_ENDPOINT=<url>

# Deployment
VPS_HOST=<host>
VPS_USER=<user>
VPS_PATH=/var/www/togetheros
```

### Configuration Files
- **pnpm-workspace.yaml** — Monorepo package definition
- **tsconfig.base.json** — Shared TypeScript config
- **tailwind.config.ts** — Design tokens
- **.yamllint.yaml** — YAML linting rules
- **.markdownlint.jsonc** — Markdown linting rules
- **next.config.js** — Next.js configuration

---

## Development Environment

### Dev Container Specs
- **Base image:** TypeScript-Node:20
- **Includes:**
  - Git
  - GitHub CLI (`gh`)
  - pnpm
  - Docker Compose
- **Extensions:** VS Code recommended extensions (TBD)

### Local Setup
```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run validation
./scripts/validate.sh

# Run linters
./scripts/lint.sh
```

---

## Path Aliases (TypeScript)

### Planned Aliases
```json
{
  "@togetheros/ui": ["packages/ui/src"],
  "@togetheros/types": ["packages/types/src"],
  "@togetheros/validators": ["packages/validators/src"],
  "@togetheros/fixtures": ["packages/fixtures/src"]
}
```

---

## Dependency Management

### Package Versions
- **Node.js:** 20+ (LTS)
- **pnpm:** Latest stable
- **Next.js:** 14.x
- **React:** 18.x
- **TypeScript:** 5.x
- **Tailwind CSS:** v4 (latest alpha/beta)

### Update Strategy
- **Regular updates** — Dependabot or manual checks
- **Lock files committed** — `pnpm-lock.yaml` tracked
- **Breaking changes** — Document in changelog

---

## Browser Support

### Target Browsers (Planned)
- **Modern browsers:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile:** iOS Safari, Chrome Mobile
- **Accessibility:** WCAG 2.1 Level AA compliance

---

## Performance Targets (Planned)

### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Bridge AI Assistant
- **Time-to-first-useful-answer (p95):** < 800ms (fixture mode)
- **Streaming latency:** < 200ms to first token

---

## Useful Commands Reference

### Package Management
```bash
# Install all workspace dependencies
pnpm install

# Add dependency to specific package
pnpm --filter @togetheros/ui add react

# Run command in all packages
pnpm -r run build
```

### Validation
```bash
# Full validation suite
./scripts/validate.sh

# YAML only
yamllint .

# Actions only
actionlint

# Markdown only
markdownlint-cli2 "**/*.md"

# Links only
lychee --exclude-mail "**/*.md"
```

### Git Operations
```bash
# Create feature branch
git checkout -b feature/bridge-qa-endpoint

# Push with upstream
git push -u origin feature/bridge-qa-endpoint

# Fetch specific branch
git fetch origin main
```

---

## Related KB Files

- [Main KB](togetheros-kb.md) — Core identity and workflow
- [Architecture](architecture.md) — Monorepo structure, patterns
- [CI/CD Discipline](../contributors/WORKFLOW.md) — Proof lines, validation workflows
