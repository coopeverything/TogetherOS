#!/usr/bin/env bash
set -euo pipefail

# Migration Pre-Flight Checklist
# Usage: ./scripts/check-migration.sh <migration-file>
#
# This script validates that a new migration follows TogetherOS naming conventions
# and doesn't create table name collisions.

MIGRATION_FILE="$1"

if [ -z "$MIGRATION_FILE" ]; then
  echo "Usage: $0 <migration-file>"
  echo "Example: $0 db/migrations/030_add_feed_reactions.sql"
  exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: File not found: $MIGRATION_FILE"
  exit 1
fi

echo "=== Migration Pre-Flight Checklist ==="
echo "Checking: $MIGRATION_FILE"
echo

# 1. Extract table names from new migration
echo "1. Tables in this migration:"
TABLES=$(grep -E "CREATE TABLE( IF NOT EXISTS)?" "$MIGRATION_FILE" | \
  sed 's/CREATE TABLE IF NOT EXISTS //;s/CREATE TABLE //;s/ (.*//;s/"//g' || true)

if [ -z "$TABLES" ]; then
  echo "   No tables found in this migration"
else
  echo "$TABLES" | while read -r table; do
    [ -n "$table" ] && echo "   - $table"
  done
fi
echo

# 2. Check for existing tables
echo "2. Checking for collisions..."
EXISTING_TABLES=$(find db/migrations -name "*.sql" ! -name "$(basename "$MIGRATION_FILE")" \
  -exec grep -h "CREATE TABLE" {} \; 2>/dev/null | \
  sed 's/CREATE TABLE IF NOT EXISTS //;s/CREATE TABLE //;s/ (.*//;s/"//g' | sort -u || true)

if [ -z "$TABLES" ]; then
  echo "   Skipping collision check (no tables in migration)"
else
  COLLISION_FOUND=0
  echo "$TABLES" | while read -r table; do
    if [ -n "$table" ]; then
      if echo "$EXISTING_TABLES" | grep -q "^$table$"; then
        echo "   ❌ COLLISION: Table '$table' already exists!"
        COLLISION_FOUND=1
      else
        echo "   ✅ Table '$table' is unique"
      fi
    fi
  done

  # Exit if collision found (note: this won't work inside while loop due to subshell)
  if echo "$TABLES" | while read -r table; do
    [ -n "$table" ] && echo "$EXISTING_TABLES" | grep -q "^$table$" && exit 1
  done; then
    echo
    echo "❌ COLLISION DETECTED - Please rename table(s) to avoid conflicts"
    exit 1
  fi
fi
echo

# 3. Check for module prefixes
echo "3. Verifying module prefixes..."
if [ -z "$TABLES" ]; then
  echo "   Skipping prefix check (no tables in migration)"
else
  echo "$TABLES" | while read -r table; do
    if [ -n "$table" ]; then
      # Allowed non-prefixed tables
      if [[ "$table" =~ ^(users|groups|migrations|verification_tokens)$ ]]; then
        echo "   ✅ '$table' is an allowed shared table"
      elif [[ "$table" =~ ^[a-z]+_[a-z_]+$ ]]; then
        echo "   ✅ '$table' has module prefix"
      else
        echo "   ⚠️  WARNING: '$table' might need a module prefix"
        echo "      Shared tables: users, groups, migrations, verification_tokens"
        echo "      Module tables should use: {module}_{entity} format"
      fi
    fi
  done
fi
echo

# 4. Check foreign key references
echo "4. Foreign key dependencies:"
REFERENCES=$(grep -E "REFERENCES [a-z_]+\(" "$MIGRATION_FILE" | \
  sed 's/.*REFERENCES //;s/(.*//;s/"//g' | sort -u || true)

if [ -z "$REFERENCES" ]; then
  echo "   No foreign key references found"
else
  echo "$REFERENCES" | while read -r ref_table; do
    [ -n "$ref_table" ] && echo "   → References: $ref_table"
  done
fi
echo

echo "=== Pre-Flight Check Complete ==="
