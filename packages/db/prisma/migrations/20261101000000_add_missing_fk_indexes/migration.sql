-- Missing FK / filter indexes (ODD 027 T6). Generated from schema.prisma;
-- verified against the naming used by 20260105_add_missing_indexes.
-- No database was available in this environment, so `migrate diff` could
-- not render this file: review the statements before deploying.

CREATE INDEX IF NOT EXISTS "Task_parentTaskId_idx" ON "Task"("parentTaskId");
CREATE INDEX IF NOT EXISTS "KBArticle_categoryId_idx" ON "KBArticle"("categoryId");
CREATE INDEX IF NOT EXISTS "RoadmapVote_userId_idx" ON "RoadmapVote"("userId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "TaskDependency_blockedTaskId_idx" ON "TaskDependency"("blockedTaskId");
CREATE INDEX IF NOT EXISTS "TaskTag_tagId_idx" ON "TaskTag"("tagId");
CREATE INDEX IF NOT EXISTS "InviteCode_createdById_idx" ON "InviteCode"("createdById");
CREATE INDEX IF NOT EXISTS "UserAchievement_achievementId_idx" ON "UserAchievement"("achievementId");
CREATE INDEX IF NOT EXISTS "Meeting_workspaceId_idx" ON "Meeting"("workspaceId");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
