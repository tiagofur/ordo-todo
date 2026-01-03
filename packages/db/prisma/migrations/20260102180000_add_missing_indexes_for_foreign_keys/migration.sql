-- CreateIndex: Add missing indexes for foreign keys
-- These indexes improve query performance on JOINs and lookups

-- WorkspaceInvitation.invitedById
CREATE INDEX IF NOT EXISTS "WorkspaceInvitation_invitedById_idx" ON "WorkspaceInvitation"("invitedById");

-- WorkspaceAuditLog.actorId
CREATE INDEX IF NOT EXISTS "WorkspaceAuditLog_actorId_idx" ON "WorkspaceAuditLog"("actorId");

-- BlogComment.userId
CREATE INDEX IF NOT EXISTS "BlogComment_userId_idx" ON "BlogComment"("userId");

-- BlogComment.postId
CREATE INDEX IF NOT EXISTS "BlogComment_postId_idx" ON "BlogComment"("postId");
