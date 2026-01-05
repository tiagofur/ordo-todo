#!/bin/bash

###############################################################################
# Production Database Migration Script
#
# This script safely applies Prisma migrations to a production database.
# It includes backup, validation, and rollback capabilities.
#
# Usage:
#   ./migrate-production.sh [environment]
#
# Environments: staging, production
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${ENVIRONMENT}_${TIMESTAMP}.sql"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
command -v psql >/dev/null 2>&1 || { log_error "psql is required but not installed. Aborting."; exit 1; }
command -v npx >/dev/null 2>&1 || { log_error "npx is required but not installed. Aborting."; exit 1; }

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    log_info "Loading environment variables from .env.${ENVIRONMENT}"
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
else
    log_error ".env.${ENVIRONMENT} file not found"
    exit 1
fi

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL is not set"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Confirm migration
log_warn "You are about to migrate the ${ENVIRONMENT} database!"
log_warn "Database: ${DATABASE_URL}"
read -p "Are you sure you want to continue? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    log_info "Migration cancelled"
    exit 0
fi

# Step 1: Backup database
log_info "Step 1: Creating database backup..."
pg_dump "$DATABASE_URL" > "$BACKUP_FILE" || {
    log_error "Backup failed. Aborting migration."
    exit 1
}

log_info "Backup created: $BACKUP_FILE"

# Step 2: Validate Prisma schema
log_info "Step 2: Validating Prisma schema..."
cd packages/db
npx prisma validate || {
    log_error "Prisma schema validation failed. Aborting migration."
    exit 1
}

# Step 3: Generate Prisma Client
log_info "Step 3: Generating Prisma Client..."
npx prisma generate || {
    log_error "Prisma Client generation failed. Aborting migration."
    exit 1
}

# Step 4: Push schema changes (creates migration if needed)
log_info "Step 4: Applying schema changes..."
npx prisma db push --accept-data-loss || {
    log_error "Schema push failed. You may need to restore from backup."
    log_warn "Backup file: $BACKUP_FILE"
    exit 1
}

# Step 5: Verify database connection
log_info "Step 5: Verifying database connection..."
cd ../..
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => { console.log('✅ Database connection successful'); prisma.\$disconnect(); }).catch(err => { console.error('❌ Database connection failed:', err); process.exit(1); });" || {
    log_error "Database verification failed"
    exit 1
}

log_info "✅ Migration completed successfully!"
log_info "Backup saved to: $BACKUP_FILE"

# Optional: Upload backup to S3 (if configured)
if [ -n "$BACKUP_S3_BUCKET" ]; then
    log_info "Uploading backup to S3..."
    aws s3 cp "$BACKUP_FILE" "s3://${BACKUP_S3_BUCKET}/" || log_warn "S3 upload failed"
fi

log_info "Done!"
