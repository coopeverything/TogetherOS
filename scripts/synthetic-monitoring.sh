#!/usr/bin/env bash
#
# Synthetic Monitoring Script
#
# Runs Playwright E2E tests to verify critical user journeys
# Run via cron: */15 * * * * /path/to/synthetic-monitoring.sh
#
# Required environment variables:
# - BASE_URL (default: https://coopeverything.org)
# - ALERT_DISCORD_WEBHOOK (optional)
# - ALERT_SLACK_WEBHOOK (optional)

set -euo pipefail

# Configuration
BASE_URL="${BASE_URL:-https://coopeverything.org}"
ALERT_DISCORD="${ALERT_DISCORD_WEBHOOK:-}"
ALERT_SLACK="${ALERT_SLACK_WEBHOOK:-}"
RESULTS_FILE="/tmp/synthetic-results.json"
LOG_FILE="/tmp/synthetic-monitoring.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Send alert
send_alert() {
  local severity=$1
  local message=$2

  # Discord
  if [[ -n "$ALERT_DISCORD" ]]; then
    local emoji=$([[ "$severity" == "critical" ]] && echo "🔴" || echo "🟡")
    local payload=$(cat <<EOF
{
  "content": "$emoji **${severity^^}**: Synthetic Test Failed",
  "embeds": [{
    "description": "$message",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
  }]
}
EOF
)
    curl -s -X POST "$ALERT_DISCORD" \
      -H "Content-Type: application/json" \
      -d "$payload" > /dev/null 2>&1 || true
  fi

  # Slack
  if [[ -n "$ALERT_SLACK" ]]; then
    local emoji=$([[ "$severity" == "critical" ]] && echo ":red_circle:" || echo ":large_yellow_circle:")
    local payload=$(cat <<EOF
{
  "text": "$emoji *${severity^^}*: Synthetic Test Failed\n\n$message"
}
EOF
)
    curl -s -X POST "$ALERT_SLACK" \
      -H "Content-Type: application/json" \
      -d "$payload" > /dev/null 2>&1 || true
  fi
}

# Run tests
run_tests() {
  log "Running synthetic tests against $BASE_URL"

  # Run Playwright tests
  if npx playwright test tests/e2e/synthetic --reporter=json > "$RESULTS_FILE" 2>&1; then
    log "${GREEN}SUCCESS: All synthetic tests passed${NC}"
    return 0
  else
    log "${RED}FAILURE: Synthetic tests failed${NC}"

    # Parse failures
    local failed_tests=$(jq -r '.suites[].specs[] | select(.ok == false) | .title' "$RESULTS_FILE" 2>/dev/null || echo "Unknown")

    send_alert "critical" "Synthetic monitoring tests failed:\n$failed_tests"
    return 1
  fi
}

# Main
main() {
  log "Starting synthetic monitoring"

  if run_tests; then
    exit 0
  else
    exit 1
  fi
}

main "$@"
