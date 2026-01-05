#!/bin/bash

# ============================================
# Pre-Migration Database Backup Script
# ============================================
#
# Usage:
#   ./scripts/migrations/backup-db.sh [environment]
#
# Examples:
#   ./scripts/migrations/backup-db.sh development
#   ./scripts/migrations/backup-db.sh production
#
# Requirements:
#   - pg_dump installed
#   - Database credentials in .env or environment variables
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${ENVIRONMENT}_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Database Backup${NC}"
echo -e "${YELLOW}================================${NC}"
echo -e "Environment: ${GREEN}${ENVIRONMENT}${NC}"
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

# Confirmation
echo -e "${YELLOW}This will create a backup of your database.${NC}"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Backup cancelled${NC}"
  exit 1
fi

# Create backup
echo ""
echo -e "${YELLOW}Creating backup...${NC}"
pg_dump $DATABASE_URL > "${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
  # Compress backup
  gzip "${BACKUP_FILE}"
  BACKUP_FILE="${BACKUP_FILE}.gz"

  # Get file size
  FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)

  echo -e "${GREEN}✓ Backup created successfully!${NC}"
  echo -e "File: ${BACKUP_FILE}"
  echo -e "Size: ${FILE_SIZE}"
  echo ""
  echo -e "${YELLOW}To restore:${NC}"
  echo -e "  gunzip -c ${BACKUP_FILE} | psql $DATABASE_URL"
else
  echo -e "${RED}✗ Backup failed!${NC}"
  exit 1
fi
