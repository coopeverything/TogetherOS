#!/bin/bash
set -euo pipefail

# TogetherOS Database Migration Runner
# Applies schema.sql and all migrations in db/migrations/ directory
# Idempotent: Safe to run multiple times

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}TogetherOS Migration Runner${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Default PostgreSQL connection parameters
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-togetheros}"
DB_USER="${DB_USER:-postgres}"

# Parse DATABASE_URL if provided
if [ -n "${DATABASE_URL:-}" ]; then
  echo -e "${BLUE}Using DATABASE_URL for connection${NC}"
  PSQL_CMD="psql $DATABASE_URL"
else
  echo -e "${BLUE}Using individual connection parameters${NC}"
  PSQL_CMD="psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER"
fi

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
if ! $PSQL_CMD -c '\q' 2>/dev/null; then
  echo -e "${RED}❌ Cannot connect to database${NC}"
  echo -e "${RED}Connection details: $DB_HOST:$DB_PORT/$DB_NAME as $DB_USER${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Database connection successful${NC}"
echo ""

# Create migrations tracking table if it doesn't exist
echo -e "${YELLOW}Setting up migrations tracking table...${NC}"
$PSQL_CMD -q <<EOF
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW()
);
EOF
echo -e "${GREEN}✅ Migrations tracking table ready${NC}"
echo ""

# Check if base schema has been applied (check for users table)
echo -e "${YELLOW}Checking if base schema exists...${NC}"
TABLE_EXISTS=$($PSQL_CMD -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');")

if [ "$TABLE_EXISTS" = "f" ]; then
  echo -e "${YELLOW}Base schema not found. Applying db/schema.sql...${NC}"

  if [ ! -f "db/schema.sql" ]; then
    echo -e "${RED}❌ db/schema.sql not found${NC}"
    exit 1
  fi

  $PSQL_CMD -f db/schema.sql
  echo -e "${GREEN}✅ Base schema applied${NC}"

  # Record base schema application
  $PSQL_CMD -q <<EOF
INSERT INTO schema_migrations (filename) VALUES ('000_base_schema.sql')
ON CONFLICT (filename) DO NOTHING;
EOF
else
  echo -e "${GREEN}✅ Base schema already exists${NC}"
fi
echo ""

# Apply migrations from db/migrations/ directory
echo -e "${YELLOW}Scanning for migrations in db/migrations/...${NC}"

if [ ! -d "db/migrations" ]; then
  echo -e "${RED}❌ db/migrations directory not found${NC}"
  exit 1
fi

# Get all .sql files sorted by filename
MIGRATION_FILES=$(find db/migrations -name "*.sql" -type f | sort)

if [ -z "$MIGRATION_FILES" ]; then
  echo -e "${YELLOW}No migration files found${NC}"
  exit 0
fi

APPLIED_COUNT=0
SKIPPED_COUNT=0

for MIGRATION_FILE in $MIGRATION_FILES; do
  FILENAME=$(basename "$MIGRATION_FILE")

  # Check if migration has already been applied
  ALREADY_APPLIED=$($PSQL_CMD -tAc "SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE filename = '$FILENAME');")

  if [ "$ALREADY_APPLIED" = "t" ]; then
    echo -e "${BLUE}⏭️  Skipping $FILENAME (already applied)${NC}"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi

  echo -e "${YELLOW}▶️  Applying $FILENAME...${NC}"

  # Apply migration
  if $PSQL_CMD -f "$MIGRATION_FILE"; then
    # Record successful application
    $PSQL_CMD -q <<EOF
INSERT INTO schema_migrations (filename) VALUES ('$FILENAME')
ON CONFLICT (filename) DO NOTHING;
EOF
    echo -e "${GREEN}✅ $FILENAME applied successfully${NC}"
    APPLIED_COUNT=$((APPLIED_COUNT + 1))
  else
    echo -e "${RED}❌ Failed to apply $FILENAME${NC}"
    exit 1
  fi
done

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ Migration complete${NC}"
echo -e "${BLUE}Applied: $APPLIED_COUNT | Skipped: $SKIPPED_COUNT${NC}"
echo -e "${BLUE}=========================================${NC}"
