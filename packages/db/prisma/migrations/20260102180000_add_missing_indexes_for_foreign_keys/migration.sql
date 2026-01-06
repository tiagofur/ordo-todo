-- CreateIndex: Add missing indexes for foreign keys
-- These indexes improve query performance on JOINs and lookups

-- WorkspaceInvitation.invitedById
CREATE INDEX IF NOT EXISTS "WorkspaceInvitation_invitedById_idx" ON "WorkspaceInvitation"("invitedById");

-- WorkspaceAuditLog.actorId
CREATE INDEX IF NOT EXISTS "WorkspaceAuditLog_actorId_idx" ON "WorkspaceAuditLog"("actorId");

-- BlogComment indexes (only when table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND LOWER(table_name) = 'blogcomment'
  ) THEN
    CREATE INDEX IF NOT EXISTS "BlogComment_userId_idx" ON "BlogComment"("userId");
    CREATE INDEX IF NOT EXISTS "BlogComment_postId_idx" ON "BlogComment"("postId");
  END IF;
END
$$ LANGUAGE plpgsql;
