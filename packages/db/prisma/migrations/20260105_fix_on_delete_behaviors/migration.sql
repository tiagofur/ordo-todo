-- Migration: 20260105_fix_on_delete_behaviors
-- Description: Fix onDelete behaviors for data integrity (7 critical fixes)

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
