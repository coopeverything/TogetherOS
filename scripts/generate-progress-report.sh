#!/usr/bin/env bash
set -euo pipefail

# generate-progress-report.sh
#
# Generates a comprehensive progress report for TogetherOS
# Updates STATUS/progress-log.md and STATUS/What_we_finished_What_is_left_v2.txt
#
# Usage: ./scripts/generate-progress-report.sh [milestone-description]
#
# Example:
#   ./scripts/generate-progress-report.sh "Completed OAuth integration"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
cd "${repo_root}"

MILESTONE="${1:-Periodic progress update}"
TIMESTAMP=$(date -u +"%Y-%m-%d")
FULL_TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

echo "============================================"
echo "TogetherOS Progress Report Generator"
echo "============================================"
echo "Timestamp: ${FULL_TIMESTAMP}"
echo "Milestone: ${MILESTONE}"
echo ""

# Function to extract progress percentages from STATUS_v2.md
extract_progress() {
  local module_key="$1"
  local percentage=$(grep -oP "<!-- progress:${module_key}=\K[0-9]+" docs/STATUS_v2.md 2>/dev/null || echo "0")
  echo "${percentage}"
}

# Gather statistics
echo "Gathering project statistics..."

# Count files
TS_FILES=$(find apps lib packages -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
PAGES=$(find apps/web/app -name "page.tsx" 2>/dev/null | wc -l)
API_ROUTES=$(find apps/web/app/api -name "route.ts" 2>/dev/null | wc -l)
DB_TABLES=$(grep -c "CREATE TABLE" db/schema.sql 2>/dev/null || echo "0")

# Count components
COMPONENTS=$(find packages/ui -name "*.tsx" 2>/dev/null | wc -l)

# Get recent commits
RECENT_COMMITS=$(git log --oneline -10 --no-decorate 2>/dev/null || echo "")

# Extract module progress
AUTH_PROGRESS=$(extract_progress "auth")
SCAFFOLD_PROGRESS=$(extract_progress "scaffold")
UI_PROGRESS=$(extract_progress "ui")
PROFILES_PROGRESS=$(extract_progress "profiles")
ONBOARDING_PROGRESS=$(extract_progress "onboarding")
REPUTATION_PROGRESS=$(extract_progress "reputation")

# Calculate average progress for started modules
STARTED_MODULES=0
TOTAL_PROGRESS=0

for module in auth scaffold ui profiles onboarding reputation; do
  progress=$(extract_progress "${module}")
  if [[ ${progress} -gt 0 ]]; then
    STARTED_MODULES=$((STARTED_MODULES + 1))
    TOTAL_PROGRESS=$((TOTAL_PROGRESS + progress))
  fi
done

if [[ ${STARTED_MODULES} -gt 0 ]]; then
  AVG_PROGRESS=$((TOTAL_PROGRESS / STARTED_MODULES))
else
  AVG_PROGRESS=0
fi

echo "✓ Statistics gathered"
echo ""

# Update progress-log.md with milestone entry
echo "Updating STATUS/progress-log.md..."

PROGRESS_LOG="STATUS/progress-log.md"
mkdir -p STATUS

# Create header entry for this milestone
cat >> "${PROGRESS_LOG}" <<EOF

---

## ${TIMESTAMP} - ${MILESTONE}

**Timestamp:** ${FULL_TIMESTAMP}

### Module Progress Summary
- **Authentication & Auth:** ${AUTH_PROGRESS}%
- **Scaffolding & Routing:** ${SCAFFOLD_PROGRESS}%
- **UI System:** ${UI_PROGRESS}%
- **Profiles:** ${PROFILES_PROGRESS}%
- **Onboarding:** ${ONBOARDING_PROGRESS}%
- **Reputation:** ${REPUTATION_PROGRESS}%

### Project Metrics
- **TypeScript Files:** ${TS_FILES}
- **Pages:** ${PAGES}
- **API Routes:** ${API_ROUTES}
- **Database Tables:** ${DB_TABLES}
- **UI Components:** ${COMPONENTS}
- **Average Progress (Started Modules):** ${AVG_PROGRESS}%

### Recent Activity
\`\`\`
${RECENT_COMMITS}
\`\`\`

EOF

echo "✓ Updated ${PROGRESS_LOG}"
echo ""

# Generate summary statistics
echo "============================================"
echo "Progress Summary"
echo "============================================"
echo "Authentication: ${AUTH_PROGRESS}%"
echo "Scaffolding: ${SCAFFOLD_PROGRESS}%"
echo "UI System: ${UI_PROGRESS}%"
echo "Profiles: ${PROFILES_PROGRESS}%"
echo "Onboarding: ${ONBOARDING_PROGRESS}%"
echo "Reputation: ${REPUTATION_PROGRESS}%"
echo ""
echo "Average Progress: ${AVG_PROGRESS}%"
echo "TypeScript Files: ${TS_FILES}"
echo "Pages: ${PAGES}"
echo "API Routes: ${API_ROUTES}"
echo "Database Tables: ${DB_TABLES}"
echo "UI Components: ${COMPONENTS}"
echo ""
echo "✓ Report generation complete"
echo ""
echo "Files updated:"
echo "  - ${PROGRESS_LOG}"
echo ""
echo "To view the progress log:"
echo "  cat STATUS/progress-log.md"
echo ""
echo "To update module progress:"
echo "  ./scripts/update-progress.sh <module> <percentage> [description]"
echo ""
echo "PROGRESS_REPORT=OK"
