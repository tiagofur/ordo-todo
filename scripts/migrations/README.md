# Database Migrations Guide

This guide covers how to safely apply database migrations for the Ordo-Todo project.

## Available Migrations

### Sprint 1 - Fase 2: Data Integrity (January 2025)

#### 1. `20260105_fix_on_delete_behaviors`
**Status**: ✅ Created (Ready for deployment)
**Purpose**: Fix 7 critical data integrity issues with `onDelete` behaviors
**Risk**: Low (only affects future DELETE operations)
**Downtime**: Zero
**Documentation**: [20260105_fix_on_delete_behaviors.md](./20260105_fix_on_delete_behaviors.md)

**Changes**:
- Task.ownerId → `onDelete: Cascade`
- Task.assigneeId → `onDelete: SetNull`
- Comment.authorId → `onDelete: Cascade`
- Activity.userId → `onDelete: Cascade`
- Attachment.uploadedById → `onDelete: SetNull`
- WorkspaceInvitation.invitedById → `onDelete: SetNull`
- WorkspaceAuditLog.actorId → `onDelete: SetNull`

#### 2. `20260105_add_missing_indexes`
**Status**: ✅ Created (Ready for deployment)
**Purpose**: Add 6 performance indexes for common query patterns
**Risk**: Minimal (indexes only, no data changes)
**Downtime**: Zero
**Documentation**: [20260105_add_missing_indexes.md](./20260105_add_missing_indexes.md)

**Indexes Added**:
- Tag.workspaceId
- Project.completed
- Project.archived
- Project.status
- KeyResultTask.taskId
- Notification.(resourceId, resourceType) - composite

## Pre-Migration Checklist

Before running any migration in production:

- [ ] **Backup Created**: Run `./scripts/migrations/backup-db.sh production`
- [ ] **Tested in Development**: Migration tested on development database
- [ ] **Tested in Staging**: Migration tested on staging environment
- [ ] **Rollback Plan Reviewed**: Know how to rollback if issues arise
- [ ] **Team Notified**: Inform team about upcoming database migration
- [ ] **Monitoring Ready**: Set up monitoring for post-migration

## Development Workflow

### Local Development

```bash
# 1. Apply migration to local database
cd packages/db
npx prisma migrate dev

# 2. Generate Prisma client
npx prisma generate

# 3. Test your changes
npm run dev
```

### Creating a New Migration

```bash
# 1. Update schema.prisma
# 2. Create migration (creates SQL in prisma/migrations/)
cd packages/db
npx prisma migrate dev --name your_migration_name

# 3. Review the generated SQL
cat prisma/migrations/MIGRATION_ID/migration.sql

# 4. Test thoroughly
```

## Production Deployment

### Step 1: Backup

```bash
# Create backup before migration
./scripts/migrations/backup-db.sh production
```

### Step 2: Apply Migration

**Option A: Automated Script (Recommended)**

```bash
# Apply migration with all safety checks
./scripts/migrations/migrate-production.sh 20260105_fix_on_delete_behaviors
```

**Option B: Manual Application**

```bash
# Set database URL
export DATABASE_URL="postgresql://user:pass@host:5432/database"

# Apply migration manually
psql $DATABASE_URL -f packages/db/prisma/migrations/20260105_fix_on_delete_behaviors/migration.sql

# Mark as applied in Prisma
cd packages/db
npx prisma migrate resolve --applied "20260105_fix_on_delete_behaviors"
```

### Step 3: Verify

```bash
# Check application works
curl -f https://api.ordotodo.com/health || exit 1

# Run smoke tests
npm run test:e2e

# Monitor database logs
# Check Cloud dashboard for errors
```

## Rollback Procedure

If issues arise after migration:

### Option A: Restore from Backup

```bash
# Find latest backup
ls -lt backups/backup_production_*.sql.gz | head -1

# Restore database
gunzip -c backups/backup_production_TIMESTAMP.sql.gz | psql $DATABASE_URL
```

### Option B: Manual Rollback

Some migrations support manual rollback (see individual migration docs).

**Example: Rollback onDelete behaviors**

```sql
-- Reverse order (7 to 1)
ALTER TABLE "WorkspaceAuditLog" DROP CONSTRAINT IF EXISTS "WorkspaceAuditLog_actorId_fkey";
ALTER TABLE "WorkspaceAuditLog" ADD CONSTRAINT "WorkspaceAuditLog_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id");

-- ... (see migration doc for full SQL)
```

### Option C: Revert Migration State

```bash
# Mark migration as rolled back in Prisma
cd packages/db
npx prisma migrate resolve --rolled-back "20260105_fix_on_delete_behaviors"
```

## Troubleshooting

### Issue: Migration fails with constraint error

**Cause**: Migration tries to create constraint that already exists

**Solution**:
```sql
-- Check existing constraints
SELECT conname, conrelid::regclass
FROM pg_constraint
WHERE conrelid::regclass::text IN ('"Task"', '"Comment"', '"Activity"');

-- Drop conflicting constraints if needed
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_ownerId_fkey";

-- Re-run migration
```

### Issue: Index creation fails

**Cause**: Index already exists

**Solution**:
```sql
-- Check existing indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname LIKE '%_idx';

-- Drop if needed (our migrations use IF NOT EXISTS)
DROP INDEX IF EXISTS "Tag_workspaceId_idx";
```

### Issue: Prisma client outdated

**Cause**: Schema changed but client not regenerated

**Solution**:
```bash
cd packages/db
npx prisma generate
```

## Best Practices

### 1. Always Test First
- Test in development → staging → production
- Never apply untested migrations to production

### 2. Use Transactions
- All migrations should be atomic
- If any step fails, entire migration rolls back

### 3. Non-Blocking Operations
- Use `CREATE INDEX CONCURRENTLY` for large tables
- Avoid locking tables during peak hours

### 4. Monitor After Deployment
- Check query performance
- Monitor database metrics
- Review application logs

### 5. Document Changes
- Update migration documentation
- Note any breaking changes
- Record rollback procedures

## Migration Status Tracking

| ID | Name | Status | Date | Notes |
|----|------|--------|------|-------|
| 20260105_fix_on_delete_behaviors | Fix onDelete Behaviors | ✅ Ready | 2025-01-05 | Sprint 1, Fase 2 |
| 20260105_add_missing_indexes | Add Missing Indexes | ✅ Ready | 2025-01-05 | Sprint 1, Fase 2 |

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/ddl.html)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Database Best Practices](https://www.postgresql.org/docs/current/best-practices.html)

## Support

If you encounter issues during migration:

1. Check the specific migration documentation
2. Review error messages carefully
3. Consult the troubleshooting section above
4. Restore from backup if critical
5. Contact the database team
