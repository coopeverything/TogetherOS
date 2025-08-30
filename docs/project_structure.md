# Project Structure

## Repo layout (recommended)
```
.
├── apps/
│   └── frontend/                     (Next.js 14 + Tailwind v4)
│       ├── docker-compose.yml
│       ├── Dockerfile
│       ├── src/
│       │   ├── pages/
│       │   │   ├── _app.tsx
│       │   │   └── signup.tsx
│       │   └── styles/globals.css
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       └── public/
├── packages/
│   └── ui/                           (future shared components, tokens)
├── scripts/
│   └── smoke.sh                      (basic repo checks; runs in CI)
├── .github/
│   └── workflows/
│       ├── ci.yml                    (build/lint/test/smoke; skips install if no package.json)
│       └── deploy.yml                (rsync + VPS redeploy on PR label 'staging-ok')
└── docs/
    ├── DDP_Knowledge.md
    ├── DDP_Tech_Roadmap.md
    └── OPERATIONS.md
```

## CSS update playbook (short version)
1. Edit `src/styles/globals.css` (scoped `.signup` rules).  
2. Run: `docker compose build --no-cache && docker compose up -d`  
3. Verify:
   ```bash
   curl -s "http://127.0.0.1:3010/signup?nocache=$(date +%s)" | grep -n '<link rel="stylesheet"'
   ```
   Then fetch CSS URL and check `.signup|100dvh|hero-title|hero-circle`.

## Future-proofing
- Add `apps/backend` with shared API types in `packages/types`.  
- Expand CI with CSS verification and e2e smoke.  
