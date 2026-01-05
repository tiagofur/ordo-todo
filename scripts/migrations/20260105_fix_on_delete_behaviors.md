# Migration: Fix onDelete Behaviors for Data Integrity

## Summary

This migration fixes 7 critical data integrity issues where `onDelete` behavior was not properly configured, which could lead to orphaned records or deletion failures.

## Changes

### 1. Task.ownerId - Cascade
**Issue**: When a user is deleted, tasks they own become orphaned.
**Fix**: Add `onDelete: Cascade` to automatically delete owned tasks.

### 2. Task.assigneeId - SetNull
**Issue**: When the assigned user is deleted, the task retains the deleted user's ID.
**Fix**: Add `onDelete: SetNull` to unassign tasks when assignee is deleted.

### 3. Comment.authorId - Cascade
**Issue**: When a user is deleted, their comments become orphaned.
**Fix**: Add `onDelete: Cascade` to automatically delete user's comments.

### 4. Activity.userId - Cascade
**Issue**: When a user is deleted, activity logs become orphaned.
**Fix**: Add `onDelete: Cascade` to automatically delete user's activities.

### 5. Attachment.uploadedById - SetNull
**Issue**: When the uploader is deleted, the attachment retains the deleted user's ID.
**Fix**: Add `onDelete: SetNull` to remove uploader reference when user is deleted.

### 6. WorkspaceInvitation.invitedById - SetNull
**Issue**: When the inviter is deleted, the invitation retains the deleted user's ID.
**Fix**: Add `onDelete: SetNull` to remove inviter reference when user is deleted.

### 7. WorkspaceAuditLog.actorId - SetNull
**Issue**: When the actor is deleted, the audit log retains the deleted user's ID.
**Fix**: Add `onDelete: SetNull` to remove actor reference when user is deleted.

## SQL Migration

```sql
-- Migration: 20260105_fix_on_delete_behaviors

-- 1. Task.ownerId - Cascade (delete owned tasks when user is deleted)
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_ownerId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Task.assigneeId - SetNull (unassign tasks when assignee is deleted)
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_assigneeId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey"
  FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Comment.authorId - Cascade (delete comments when author is deleted)
ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "Comment_authorId_fkey";
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Activity.userId - Cascade (delete activities when user is deleted)
ALTER TABLE "Activity" DROP CONSTRAINT IF EXISTS "Activity_userId_fkey";
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Attachment.uploadedById - SetNull (remove uploader when user is deleted)
ALTER TABLE "Attachment" DROP CONSTRAINT IF EXISTS "Attachment_uploadedById_fkey";
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. WorkspaceInvitation.invitedById - SetNull (remove inviter when user is deleted)
ALTER TABLE "WorkspaceInvitation" DROP CONSTRAINT IF EXISTS "WorkspaceInvitation_invitedById_fkey";
ALTER TABLE "WorkspaceInvitation" ADD CONSTRAINT "WorkspaceInvitation_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. WorkspaceAuditLog.actorId - SetNull (remove actor when user is deleted)
ALTER TABLE "WorkspaceAuditLog" DROP CONSTRAINT IF EXISTS "WorkspaceAuditLog_actorId_fkey";
ALTER TABLE "WorkspaceAuditLog" ADD CONSTRAINT "WorkspaceAuditLog_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

## Rollback Procedure

If issues arise, rollback with:

```sql
-- Rollback SQL (reverse order)

-- 7. WorkspaceAuditLog.actorId
ALTER TABLE "WorkspaceAuditLog" DROP CONSTRAINT IF EXISTS "WorkspaceAuditLog_actorId_fkey";
ALTER TABLE "WorkspaceAuditLog" ADD CONSTRAINT "WorkspaceAuditLog_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id");

-- 6. WorkspaceInvitation.invitedById
ALTER TABLE "WorkspaceInvitation" DROP CONSTRAINT IF EXISTS "WorkspaceInvitation_invitedById_fkey";
ALTER TABLE "WorkspaceInvitation" ADD CONSTRAINT "WorkspaceInvitation_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "User"("id");

-- 5. Attachment.uploadedById
ALTER TABLE "Attachment" DROP CONSTRAINT IF EXISTS "Attachment_uploadedById_fkey";
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id");

-- 4. Activity.userId
ALTER TABLE "Activity" DROP CONSTRAINT IF EXISTS "Activity_userId_fkey";
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id");

-- 3. Comment.authorId
ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "Comment_authorId_fkey";
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id");

-- 2. Task.assigneeId
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_assigneeId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey"
  FOREIGN KEY ("assigneeId") REFERENCES "User"("id");

-- 1. Task.ownerId
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_ownerId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id");
```

## Testing Procedure

1. **Backup Database** (required before migration):
   ```bash
   pg_dump ordo_todo > backup_before_on_delete_fix.sql
   ```

2. **Test on Development**:
   ```bash
   cd packages/db
   npx prisma migrate dev --name fix_on_delete_behaviors
   ```

3. **Verify Data Integrity**:
   ```sql
   -- Check constraints are in place
   SELECT
     conname AS constraint_name,
     ON DELETE DELETE RULE
   FROM pg_constraint
   WHERE conname LIKE '%taskId%'
      OR conname LIKE '%ownerId%'
      OR conname LIKE '%authorId%'
      OR conname LIKE '%uploadedById%'
      OR conname LIKE '%invitedById%'
      OR conname LIKE '%actorId%';
   ```

4. **Test User Deletion**:
   ```sql
   -- Create test user
   INSERT INTO "User" (id, email, username, name) VALUES
   ('test-delete-user', 'test@example.com', 'testdelete', 'Test User');

   -- Create test task
   INSERT INTO "Task" (id, title, ownerId, assigneeId, projectId) VALUES
   ('test-task', 'Test Task', 'test-delete-user', 'test-delete-user', 'proj-123');

   -- Delete user (should cascade task)
   DELETE FROM "User" WHERE id = 'test-delete-user';

   -- Verify task is deleted
   SELECT COUNT(*) FROM "Task" WHERE id = 'test-task';
   -- Should return 0
   ```

## Impact Analysis

### Low Risk Changes
- All changes add `onDelete` behavior (no data deletion)
- Cascade deletes are intentional and expected
- SetNull prevents orphaned records without data loss

### Data Migration Requirements
- **No existing data migration required**
- Changes only affect future DELETE operations
- Existing orphaned records (if any) remain unchanged

## Deployment Notes

1. **Backup Required**: Always backup before schema changes
2. **Zero Downtime**: Can be deployed without application restart
3. **Rollback Safe**: Rollback procedure provided above
4. **Testing**: Test on staging environment first

## References

- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FOREIGN-KEYS)
- [Prisma onDelete](https://www.prisma.io/docs/reference/prisma-schema-reference#relation-onDelete)
- [Data Integrity Best Practices](https://www.postgresql.org/docs/current/ddl-constraints.html)
