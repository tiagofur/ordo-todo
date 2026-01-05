#!/bin/bash

# ============================================
# Production Migration Script
# ============================================
#
# Usage:
#   ./scripts/migrations/migrate-production.sh [migration_name]
#
# Examples:
#   ./scripts/migrations/migrate-production.sh 20260105_fix_on_delete_behaviors
#   ./scripts/migrations/migrate-production.sh 20260105_add_missing_indexes
#
# Requirements:
#   - PostgreSQL database connection
#   - Backup completed before running
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33M'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIGRATION_NAME=${1:-}
MIGRATIONS_DIR="./packages/db/prisma/migrations"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Check migration name
if [ -z "$MIGRATION_NAME" ]; then
  echo -e "${RED}Error: Migration name required${NC}"
  echo "Usage: ./migrate-production.sh [migration_name]"
  echo ""
  echo "Available migrations:"
  ls -1 "${MIGRATIONS_DIR}" | grep -v "migration_lock.toml"
  exit 1
fi

MIGRATION_PATH="${MIGRATIONS_DIR}/${MIGRATION_NAME}"

# Check migration exists
if [ ! -d "${MIGRATION_PATH}" ]; then
  echo -e "${RED}Error: Migration '${MIGRATION_NAME}' not found${NC}"
  echo "Path: ${MIGRATION_PATH}"
  exit 1
fi

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Production Migration${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Migration: ${GREEN}${MIGRATION_NAME}${NC}"
echo -e "Timestamp: ${TIMESTAMP}"
echo ""

# Load database URL from .env if exists
if [ -f ".env" ]; then
  echo -e "${YELLOW}Loading database URL from .env...${NC}"
  export $(grep -v '^#' .env | xargs)
fi

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}Error: DATABASE_URL not set${NC}"
  echo "Please set DATABASE_URL environment variable or add to .env file"
  exit 1
fi

echo -e "${YELLOW}Database URL:${NC} ${DATABASE_URL}"
echo ""

# Pre-flight checks
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Pre-flight Checks${NC}"
echo -e "${YELLOW}================================${NC}"

# 1. Check if backup exists
echo -n "Checking for recent backup... "
LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/backup_production_*.sql.gz 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
  BACKUP_AGE=$((($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 60))
  if [ $BACKUP_AGE -lt 1440 ]; then  # 24 hours
    echo -e "${GREEN}✓ Found backup (${BACKUP_AGE} minutes old)${NC}"
  else
    echo -e "${YELLOW}⚠ Warning: Backup is ${BACKUP_AGE} minutes old (recommend <24h)${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
else
  echo -e "${RED}✗ No recent backup found${NC}"
  read -p "Create backup now? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/migrations/backup-db.sh production
  else
    echo -e "${RED}Cannot proceed without backup${NC}"
    exit 1
  fi
fi

# 2. Display migration details
echo ""
echo -e "${YELLOW}Migration Details:${NC}"
if [ -f "${MIGRATION_PATH}/migration.sql" ]; then
  LINES=$(wc -l < "${MIGRATION_PATH}/migration.sql")
  echo "  SQL lines: ${LINES}"
  echo ""
  echo "  SQL Preview (first 10 lines):"
  head -10 "${MIGRATION_PATH}/migration.sql" | sed 's/^/    /'
fi

# 3. Confirmation
echo ""
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Ready to Apply Migration${NC}"
echo -e "${YELLOW}================================${NC}"
echo -e "${RED}WARNING: This will modify your production database${NC}"
echo ""
read -p "Apply migration '${MIGRATION_NAME}' to production? (type 'yes' to confirm): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo -e "${RED}Migration cancelled${NC}"
  exit 1
fi

# Apply migration
echo ""
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Applying Migration${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""

# Execute migration SQL
if [ -f "${MIGRATION_PATH}/migration.sql" ]; then
  echo -e "${YELLOW}Executing migration SQL...${NC}"

  # Use psql to execute migration
  psql "$DATABASE_URL" -f "${MIGRATION_PATH}/migration.sql"

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migration applied successfully!${NC}"
  else
    echo -e "${RED}✗ Migration failed!${NC}"
    echo -e "${YELLOW}Check the error above. You may need to restore from backup.${NC}"
    exit 1
  fi
else
  echo -e "${RED}Error: migration.sql not found${NC}"
  exit 1
fi

# Post-migration verification
echo ""
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Post-Migration Verification${NC}"
echo -e "${YELLOW}================================${NC}"

# Mark migration as applied in Prisma
echo -n "Updating Prisma migration lock... "
cd packages/db
npx prisma migrate resolve --applied "${MIGRATION_NAME}" 2>/dev/null || true
cd ../..
echo -e "${GREEN}✓ Done${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Migration Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. ${YELLOW}Verify application works correctly${NC}"
echo -e "  2. ${YELLOW}Monitor database performance${NC}"
echo -e "  3. ${YELLOW}Check logs for any errors${NC}"
echo ""
echo -e "If issues arise, restore from backup:"
echo -e "  ${BLUE}gunzip -c ${LATEST_BACKUP} | psql \$DATABASE_URL${NC}"
echo ""
