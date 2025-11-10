#!/usr/bin/env bash
#
# Health Check Cron Script
#
# Checks system health and sends alerts on failures
# Run via cron: */5 * * * * /path/to/health-check.sh
#
# Required environment variables:
# - ALERT_DISCORD_WEBHOOK (optional)
# - ALERT_SLACK_WEBHOOK (optional)
# - HEALTH_CHECK_URL (default: https://coopeverything.org/api/health)

set -euo pipefail

# Configuration
HEALTH_URL="${HEALTH_CHECK_URL:-https://coopeverything.org/api/health}"
ALERT_DISCORD="${ALERT_DISCORD_WEBHOOK:-}"
ALERT_SLACK="${ALERT_SLACK_WEBHOOK:-}"
LOG_FILE="/tmp/health-check.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check health endpoint
check_health() {
  local response
  local http_code
  local status

  # Make request with timeout
  response=$(curl -s -w "\n%{http_code}" --max-time 10 "$HEALTH_URL" 2>&1) || {
    log "${RED}CRITICAL: Failed to reach health endpoint${NC}"
    return 2
  }

  # Parse response
  http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')

  if [[ "$http_code" != "200" ]]; then
    log "${RED}CRITICAL: Health endpoint returned $http_code${NC}"
    log "Response: $body"
    return 2
  fi

  # Parse status from JSON
  status=$(echo "$body" | jq -r '.status' 2>/dev/null || echo "unknown")

  case "$status" in
    "ok")
      log "${GREEN}OK: System healthy${NC}"
      return 0
      ;;
    "degraded")
      log "${YELLOW}WARNING: System degraded${NC}"
      log "Details: $body"
      return 1
      ;;
    "unhealthy")
      log "${RED}CRITICAL: System unhealthy${NC}"
      log "Details: $body"
      return 2
      ;;
    *)
      log "${RED}CRITICAL: Unknown status: $status${NC}"
      return 2
      ;;
  esac
}

# Send Discord alert
send_discord_alert() {
  local severity=$1
  local message=$2

  if [[ -z "$ALERT_DISCORD" ]]; then
    return 0
  fi

  local emoji
  case "$severity" in
    "critical") emoji="🔴" ;;
    "warning") emoji="🟡" ;;
    *) emoji="🔵" ;;
  esac

  local payload=$(cat <<EOF
{
  "content": "$emoji **${severity^^}**: Health Check Failed",
  "embeds": [{
    "description": "$message",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
    "color": $([[ "$severity" == "critical" ]] && echo "16711680" || echo "16776960")
  }]
}
EOF
)

  curl -s -X POST "$ALERT_DISCORD" \
    -H "Content-Type: application/json" \
    -d "$payload" > /dev/null 2>&1 || {
    log "Failed to send Discord alert"
  }
}

# Send Slack alert
send_slack_alert() {
  local severity=$1
  local message=$2

  if [[ -z "$ALERT_SLACK" ]]; then
    return 0
  fi

  local emoji
  case "$severity" in
    "critical") emoji=":red_circle:" ;;
    "warning") emoji=":large_yellow_circle:" ;;
    *) emoji=":large_blue_circle:" ;;
  esac

  local payload=$(cat <<EOF
{
  "text": "$emoji *${severity^^}*: Health Check Failed\n\n$message"
}
EOF
)

  curl -s -X POST "$ALERT_SLACK" \
    -H "Content-Type: application/json" \
    -d "$payload" > /dev/null 2>&1 || {
    log "Failed to send Slack alert"
  }
}

# Main execution
main() {
  log "Starting health check for $HEALTH_URL"

  if check_health; then
    # Success - system is healthy
    exit 0
  else
    local exit_code=$?

    if [[ $exit_code -eq 2 ]]; then
      # Critical failure
      send_discord_alert "critical" "System health check failed. Please investigate immediately."
      send_slack_alert "critical" "System health check failed. Please investigate immediately."
    elif [[ $exit_code -eq 1 ]]; then
      # Warning - degraded
      send_discord_alert "warning" "System is degraded. Monitor closely."
      send_slack_alert "warning" "System is degraded. Monitor closely."
    fi

    exit $exit_code
  fi
}

# Run main function
main "$@"
