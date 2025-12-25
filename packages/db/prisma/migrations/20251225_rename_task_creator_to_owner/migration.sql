-- Rename creatorId to ownerId in Task table
ALTER TABLE "Task" RENAME COLUMN "creatorId" TO "ownerId";

-- Update index name
DROP INDEX IF EXISTS "Task_creatorId_idx";
CREATE INDEX "Task_ownerId_idx" ON "Task"("ownerId");
