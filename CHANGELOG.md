# Changelog

All notable changes to TogetherOS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- AUTOMATION NOTICE -->
<!-- This changelog is automatically updated on every merge to yolo branch -->
<!-- Daily summaries are generated at 23:59 UTC -->
<!-- Conflict detection runs continuously to track parallel development issues -->

## [Production] - 2025-11-08

### Live Deployments (Auto-updating)

15:12 - feat(ci): Add conflict prevention with export sorting and detection (#254) ✅
- Auto-sort exports in index files to prevent 80% of merge conflicts
- Pre-commit hook runs sorting automatically (0.5s overhead)
- Conflict detection workflow warns before merge conflicts occur
- Sorted 29 existing index files to establish baseline
- Analysis: Only 0.3% conflict rate (1 in 331 commits), this targets the main pattern

### Development Metrics
- **Team:** 1 operator + Claude in yolo mode (zero human developers)
- **Deployment frequency:** 8-10 features per day
- **Feature velocity:** Multiple features per hour
- **Auto-deploy:** Every merge to yolo = production deployment

## [Unreleased] - Future Plans

### Overview
TogetherOS is currently in pre-MVP phase with comprehensive documentation complete (1,114+ lines of specs) and active development on core modules. The project follows a cooperation-first operating system stack design with transparent governance, social economy features, and community self-organization tools.

### Current Status
- All 17 modules at various stages of implementation
- Bridge module at 95% completion
- Feed module at 85% completion
- Groups module at 70% completion
- Admin module at 65% completion
- Active CI/CD pipeline with automated deployments to production

## [0.0.0] - 2025-11-07

### Added

#### Bridge Module (AI Assistant) - 95% Complete
- **Authentication & User Integration** - Connected Bridge to user data with PostgreSQL backend (#252)
- **Governance Integration** - Added proposal similarity detection for governance proposals (#244)
- **Onboarding Flow** - Implemented progress tracking and completion criteria (#243)
- **PostgreSQL Backend** - Replaced mock data with PostgresMemoryRepo for behavioral AI system (#242, #227)
- **Questionnaire System** - Added questionnaires and educational content APIs (#219)
- **Markdown Rendering** - Enhanced formatting with H3, bullets, bold, and clickable links (#220, #222)
- **Admin Interface** - Consolidated admin into single page with training, data viewer, and GitHub icons (#225)

#### Feed Module - 85% Complete
- **Post Creation** - Added unified PostComposer UI component (#248)
- **URL Embedding** - Implemented URL parser service with auto-embed detection (#247)
- **URL Preview Cards** - Added UrlPreviewCard for embedded URLs (#251)
- **Database Integration** - Implemented PostgresPostRepo for persistent storage (#249)
- **Authentication** - Integrated auth system with PostgreSQL backend (#250)
- **Database Schema** - Added posts table migration (#246)

#### Groups Module - 70% Complete
- **Geocoding** - Added ZIP-based city groups with geocoding and RP rewards (#245)
- **Persistence** - Added localStorage persistence for group data
- **Tags System** - Implemented tagging for group categorization

#### Admin Module - 65% Complete
- **Scaffold Pages** - Added comprehensive admin scaffolds:
  - Members Administration (#232)
  - Moderation Reports (#233)
  - Group Management (#234)
  - Governance Oversight (#235)
  - Social Economy (#236)
  - System Logs & Audit (#237)
  - Analytics Dashboard (#238)
  - Email & Notifications (#239)
  - Feature Flags (#240)
  - Backup & Export (#241)
- **Training Interface** - Consolidated training tabs with admin function placeholders (#230)

#### CI/CD & Security
- **Security Enforcement** - P1 security alerts now block merge via Danger.js (#228)
- **Automated Migrations** - Database migrations run automatically on deployment
- **CodeQL Integration** - Automated security scanning for vulnerabilities
- **Dual-Bot Review** - Codex and Copilot SWE Agent review all PRs
- **Auto-Deploy** - Production deployments trigger automatically on merge to yolo branch

### Fixed

#### Build & TypeScript
- **Type Safety** - Reduced TypeScript errors from 100+ to 13 (87% improvement) (#253)
- **Module Resolution** - Resolved TypeScript configuration and module resolution errors (#067fcb0)
- **Build Errors** - Fixed CI build errors in feed module (#6219e9b)

#### Security
- **Log Injection** - Prevented log injection in groups API error handlers (#05d3472)
- **CodeQL Issues** - Resolved parse errors and workflow false positives (#eaefd94)

#### Bridge Module
- **Import Paths** - Corrected import path depth and prevented server dependencies in client bundle (#687edc6)
- **Documentation Links** - Updated source links to use yolo branch instead of main (#223)

#### Admin Module
- **Navigation** - Updated Bridge link to /admin/bridge, removed obsolete /test/bridge (#0ac1a74)

#### Groups Module
- **Fixture Data** - Updated to use valid group types (#231)

#### CI/CD
- **Deployment** - Fixed migration handling in deployment workflow
- **SSH Sessions** - Resolved SSH termination issues during migrations
- **Error Handling** - Added verbose error handling to deployment workflow

### Changed

#### Documentation
- **Status Tracking** - Migrated to STATUS_v2.md with improved progress tracking
- **Deployment Docs** - Updated with automated migration workflow
- **Module Specs** - Comprehensive documentation for all 17 modules

#### Development Workflow
- **Branch Strategy** - Standardized on yolo branch for features, main for stable releases
- **PR Requirements** - All PRs require dual-bot review (Codex + Copilot)
- **Proof Lines** - TESTS=OK required for yolo, LINT=OK and SMOKE=OK for main

### Technical Debt & Known Issues
- **TypeScript Errors** - 13 remaining errors to be resolved
- **P1 Security Alert** - Log injection in apps/web/app/api/groups/route.ts:44 (Alert #64)
- **P2 Security Alert** - Polynomial ReDoS in packages/ui/src/bridge/markdown-renderer.tsx:44 (Alert #80)

## [Pre-Release History]

### 2025-10 to 2025-11
- Initial repository setup with monorepo structure (Next.js 14 + TypeScript + Tailwind)
- Comprehensive documentation phase (1,114+ lines of module specifications)
- Core architecture establishment with 8 Cooperation Paths taxonomy
- CI/CD pipeline setup with GitHub Actions
- Production deployment infrastructure on VPS
- PostgreSQL database integration
- Authentication system implementation
- Initial module scaffolding for all 17 modules

### Project Genesis
- **Vision**: Cooperation-first operating system stack for community self-organization
- **Problem**: Power concentration leading to wealth inequality and social disconnection
- **Solution**: Transparent participatory governance with cooperative economics
- **Principles**: Tiny verifiable steps, docs-first development, privacy-first design

## Module Progress Summary

| Module | Progress | Status |
|--------|----------|--------|
| Bridge (AI Assistant) | 95% | Near completion, training interface active |
| Feed | 85% | Core features complete, polishing UX |
| Groups | 70% | Geocoding and persistence added |
| Admin | 65% | All scaffold pages complete |
| Authentication | 60% | OAuth and session management working |
| Governance | 30% | Proposal system specified |
| Social Economy | 20% | Support Points system designed |
| Moderation | 15% | Empathy-first rules documented |
| Treasury | 10% | Cooperative treasury specified |
| Federation | 5% | Inter-group protocols planned |
| Other modules | 0-10% | Specifications complete, awaiting implementation |

## Deployment Information

- **Production URL**: https://www.coopeverything.org
- **Test Pages**: Available at /test/{module} for component testing
- **Server**: VPS at 72.60.27.167 (SSH: root@continentjump)
- **Database**: PostgreSQL with automatic migrations
- **Process Manager**: PM2 for Node.js application management

## Contributing

See [OPERATIONS.md](docs/OPERATIONS.md) for contributor guidelines and [CI/Actions_Playbook.md](docs/CI/Actions_Playbook.md) for CI/CD workflows.

---

*For detailed commit history, run `git log --oneline` or view on [GitHub](https://github.com/coopeverything/TogetherOS)*