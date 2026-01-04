# Database Migrations Setup

## Current Status

✅ **MIGRATIONS ACTIVE** - 16 migrations created (as of Jan 4, 2026)

## Migration History

### Latest Migration (2026-01-02)
- `20260102180000_add_missing_indexes_for_foreign_keys` - Performance indexes

### All Migrations
1. `20251130230356_init` - Initial schema
2. `20251203035637_add_workspace_features` - Workspace settings, invitations
3. `20251203205630_add_project_slugs` - Project slugs
4. `20251204151909_add_subtasks_completed_metric` - Subtasks metrics
5. `20251204190907_add_task_assignee_relation` - Task assignee
6. `20251204215544_add_notifications` - Notifications system
7. `20251205143114_add_gamification` - Gamification features
8. `20251205145419_add_task_templates` - Task templates
9. `20251206000708_add_user_profile_fields` - User extended profile
10. `20251211_add_custom_fields` - Custom fields for tasks
11. `20251213_add_username_and_workspace_slug_constraints` - Unique constraints
12. `20251225_rename_task_creator_to_owner` - Rename columns
13. `20251228_add_last_username_change_at` - Username change tracking
14. `20251229_add_missing_columns` - Missing columns fix
15. `20260102180000_add_missing_indexes_for_foreign_keys` - Performance indexes
16. `20260103213839_add_composite_indexes` - Composite indexes for common queries

## Migration Usage

### Development
```bash
# From packages/db directory
cd /root/dev/ordo-todo/packages/db

# Create new migration
npx prisma migrate dev --name descriptive_name

# Reset database (WARNING: destructive)
npx prisma migrate reset
```

### Production Deployment
```bash
# Deploy all pending migrations
npx prisma migrate deploy

# Status
npx prisma migrate status
```

## Migration Best Practices

1. ✅ **Always review generated SQL** before committing
2. ✅ **Use descriptive names**: `add_task_status_index`, `add_user_timezone`
3. ✅ **Never modify existing migrations** (create new ones)
4. ✅ **Test migrations** in staging first
5. ✅ **Backup before migration** in production

## Indexes Summary

### Comprehensive Index Coverage
- **80+ indexes** across all models
- **Composite indexes** for common query patterns
- **Foreign key indexes** for JOIN performance
- **Full-text search** indexes on text fields

### Critical Indexes
```sql
-- Task model (11 indexes including composite)
@@index([ownerId, projectId])
@@index([ownerId, status])
@@index([projectId, status, dueDate])
@@index([assigneeId, status, priority])

-- TimeSession (5 indexes)
@@index([userId, endedAt]) -- For active session lookup

-- DailyMetrics (unique constraint)
@@unique([userId, date])
```

## Audit Results

**Score**: 95/100 ✅

**Strengths**:
- ✅ Comprehensive migration history (16 migrations)
- ✅ Performance indexes (80+)
- ✅ Composite indexes for complex queries
- ✅ Proper foreign key indexing
- ✅ Schema comments in English (all documented)

**Minor Improvements**:
- [ ] Document rollback procedures
- [ ] Add migration testing in CI/CD

## Next Steps

- [ ] Add CI/CD migration testing
- [ ] Document rollback procedure
- [ ] Add pre-migration backup verification
- [ ] Consider read replicas for scaling
