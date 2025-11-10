#!/usr/bin/env bash
set -euo pipefail

# sync-to-github-project.sh
#
# Syncs module progress from docs/STATUS_v2.md to GitHub Projects
# Creates or updates project items with current progress percentages
#
# Usage: ./scripts/sync-to-github-project.sh [--dry-run]

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
cd "${repo_root}"

# GitHub Project settings
PROJECT_NUMBER=3
PROJECT_OWNER="coopeverything"
PROJECT_ID="PVT_kwHOB-LUOM4BFUE9"
PROGRESS_FIELD_ID="PVTF_lAHOB-LUOM4BFUE9zg3myrg"
STATUS_FIELD_ID="PVTSSF_lAHOB-LUOM4BFUE9zg2r-Ho"
MODULE_FIELD_ID="PVTSSF_lAHOB-LUOM4BFUE9zg2sDnU"

# Status options
STATUS_TODO="f75ad846"
STATUS_IN_PROGRESS="47fc9ee4"
STATUS_DONE="98236657"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "DRY RUN MODE - No changes will be made"
fi

# Module name mapping (STATUS key → Display name)
declare -A MODULE_NAMES=(
  ["scaffold"]="Monorepo & Scaffolding"
  ["ui"]="UI System"
  ["auth"]="Identity & Auth"
  ["profiles"]="Profiles"
  ["groups"]="Groups & Orgs"
  ["feed"]="Feed"
  ["forum"]="Forum / Deliberation"
  ["governance"]="Proposals & Decisions"
  ["social-economy"]="Social Economy Primitives"
  ["reputation"]="Support Points & Reputation"
  ["onboarding"]="Onboarding (Bridge)"
  ["search"]="Search & Tags"
  ["notifications"]="Notifications & Inbox"
  ["docs-hooks"]="Docs Site Hooks"
  ["observability"]="Observability"
  ["security"]="Security & Privacy"
)

# Module key → Project Module field option ID mapping
declare -A MODULE_OPTION_IDS=(
  ["scaffold"]="0b13fc89"
  ["ui"]="7fd753d7"
  ["auth"]="96fb86f4"
  ["profiles"]="4faa8d68"
  ["groups"]="082991c7"
  ["feed"]=""
  ["forum"]="e02070a0"
  ["governance"]="456fc4ce"
  ["social-economy"]="8ed1b5a4"
  ["reputation"]="aa29e3a5"
  ["onboarding"]="a174b543"
  ["search"]="3a14a258"
  ["notifications"]="951e5958"
  ["docs-hooks"]="1a5d85cb"
  ["observability"]="4c3f27e6"
  ["security"]="d57bbd2b"
)

get_status_id() {
  local progress=$1
  if [[ $progress -eq 0 ]]; then
    echo "$STATUS_TODO"
  elif [[ $progress -eq 100 ]]; then
    echo "$STATUS_DONE"
  else
    echo "$STATUS_IN_PROGRESS"
  fi
}

get_status_name() {
  case $1 in
    "$STATUS_TODO") echo "Todo" ;;
    "$STATUS_IN_PROGRESS") echo "In Progress" ;;
    "$STATUS_DONE") echo "Done" ;;
    *) echo "Unknown" ;;
  esac
}

# Cache existing project items
echo "Fetching existing project items..."
declare -A EXISTING_ITEMS

# Query all items from the project
ITEMS_RESPONSE=$(gh api graphql -f query="
  query {
    node(id: \"${PROJECT_ID}\") {
      ... on ProjectV2 {
        items(first: 100) {
          nodes {
            id
            content {
              ... on DraftIssue {
                title
              }
            }
          }
        }
      }
    }
  }
")

# Parse items and cache by title (using process substitution to avoid subshell)
while IFS='|' read -r title item_id; do
  EXISTING_ITEMS["$title"]="$item_id"
  echo "  Found existing: $title"
done < <(echo "$ITEMS_RESPONSE" | jq -r '.data.node.items.nodes[] | select(.content.title != null) | "\(.content.title)|\(.id)"')

echo ""
echo "Loaded ${#EXISTING_ITEMS[@]} existing items"
echo ""

# Parse STATUS_v2.md and extract module progress
echo "Parsing docs/STATUS_v2.md..."
declare -A MODULE_PROGRESS

while IFS= read -r line; do
  if [[ $line =~ \<\!--\ progress:([a-z-]+)=([0-9]+)\ --\> ]]; then
    module_key="${BASH_REMATCH[1]}"
    progress="${BASH_REMATCH[2]}"

    # Only process modules that have display names (core modules)
    if [[ -n "${MODULE_NAMES[$module_key]:-}" ]]; then
      MODULE_PROGRESS[$module_key]=$progress
      echo "  Found: $module_key = ${progress}%"
    fi
  fi
done < docs/STATUS_v2.md

echo ""
echo "Found ${#MODULE_PROGRESS[@]} modules to sync"
echo ""

# Function to find existing item by title
find_item_id() {
  local title=$1
  # Check if item exists in our cache
  for key in "${!EXISTING_ITEMS[@]}"; do
    if [[ "$key" == "$title" ]]; then
      echo "${EXISTING_ITEMS[$key]}"
      return 0
    fi
  done
  return 1
}

# Function to create or update project item
sync_module() {
  local module_key=$1
  local progress=${MODULE_PROGRESS[$module_key]}
  local display_name="${MODULE_NAMES[$module_key]}"
  local module_option_id="${MODULE_OPTION_IDS[$module_key]:-}"
  local status_id=$(get_status_id $progress)

  echo "Syncing: $display_name (${module_key}) - ${progress}%"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [DRY RUN] Would set Progress: ${progress}%, Status: $(get_status_name $status_id)"
    return
  fi

  local item_id=""

  # Try to find existing item
  if item_id=$(find_item_id "$display_name"); then
    echo "  Updating existing item: $item_id"
  else
    # Create new draft issue
    echo "  Creating new item..."
    local item_response=$(gh api graphql -f query="
      mutation {
        addProjectV2DraftIssue(input: {
          projectId: \"${PROJECT_ID}\"
          title: \"${display_name}\"
        }) {
          projectItem {
            id
          }
        }
      }
    ")

    item_id=$(echo "$item_response" | jq -r '.data.addProjectV2DraftIssue.projectItem.id')

    if [[ -z "$item_id" ]] || [[ "$item_id" == "null" ]]; then
      echo "  ERROR: Failed to create item"
      echo "  Response: $item_response"
      return 1
    fi

    echo "  Created item: $item_id"
  fi

  # Set Progress % field
  gh api graphql -f query="
    mutation {
      updateProjectV2ItemFieldValue(input: {
        projectId: \"${PROJECT_ID}\"
        itemId: \"${item_id}\"
        fieldId: \"${PROGRESS_FIELD_ID}\"
        value: {
          number: ${progress}
        }
      }) {
        projectV2Item {
          id
        }
      }
    }
  " > /dev/null
  echo "  Set Progress: ${progress}%"

  # Set Status field
  gh api graphql -f query="
    mutation {
      updateProjectV2ItemFieldValue(input: {
        projectId: \"${PROJECT_ID}\"
        itemId: \"${item_id}\"
        fieldId: \"${STATUS_FIELD_ID}\"
        value: {
          singleSelectOptionId: \"${status_id}\"
        }
      }) {
        projectV2Item {
          id
        }
      }
    }
  " > /dev/null
  echo "  Set Status: $(get_status_name $status_id)"

  # Set Module field if we have the option ID
  if [[ -n "$module_option_id" ]]; then
    gh api graphql -f query="
      mutation {
        updateProjectV2ItemFieldValue(input: {
          projectId: \"${PROJECT_ID}\"
          itemId: \"${item_id}\"
          fieldId: \"${MODULE_FIELD_ID}\"
          value: {
            singleSelectOptionId: \"${module_option_id}\"
          }
        }) {
          projectV2Item {
            id
          }
        }
      }
    " > /dev/null
    echo "  Set Module: ${module_key}"
  fi

  echo "  ✓ Synced successfully"
  echo ""
}

# Sync all modules
for module_key in "${!MODULE_PROGRESS[@]}"; do
  sync_module "$module_key"
done

echo "✓ Sync complete!"
echo "View project: https://github.com/users/${PROJECT_OWNER}/projects/${PROJECT_NUMBER}"
echo "PROJECT_SYNC=OK"
