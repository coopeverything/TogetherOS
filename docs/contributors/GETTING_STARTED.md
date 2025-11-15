# Getting Started with TogetherOS

Welcome! This guide will help you make your first contribution.

## Prerequisites

- **Node.js 20+** (LTS version)
- **pnpm** (package manager)
- **Git**
- Code editor (VS Code recommended)

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/coopeverything/TogetherOS.git
cd TogetherOS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Making Your First Change

### 1. Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-change-name
```

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only

### 2. Make Your Changes

Edit files and save. The dev server will auto-reload.

### 3. Test Your Changes

```bash
# Run validation
./scripts/validate.sh

# Expected output:
# LINT=OK
# VALIDATORS=GREEN
# SMOKE=OK
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: brief description of your change"
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructure
- `test:` - Adding tests
- `chore:` - Maintenance

### 5. Push Your Branch

```bash
git push -u origin feature/your-change-name
```

### 6. Open a Pull Request

1. Go to https://github.com/coopeverything/TogetherOS/pulls
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Include proof lines from validation output

**PR must include:**
- Summary of changes
- Category (one of 8 Cooperation Paths)
- Keywords
- Proof lines: `LINT=OK`, `VALIDATORS=GREEN`, `SMOKE=OK`

## Need Help?

- **Documentation:** Check `/docs` directory
- **Architecture:** [docs/architecture.md](../architecture.md)
- **Workflow Details:** [WORKFLOW.md](WORKFLOW.md)
- **Questions:** Open a discussion on GitHub

## Next Steps

- Read [WORKFLOW.md](WORKFLOW.md) for detailed git workflow
- Review [docs/cooperation-paths.md](../cooperation-paths.md) for project taxonomy
- Check [docs/modules/](../modules/) for module specifications
