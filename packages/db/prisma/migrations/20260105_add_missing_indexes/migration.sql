-- Migration: 20260105_add_missing_indexes
-- Description: Add missing performance indexes for common query patterns

-- 1. Tag.workspaceId - Filter tags by workspace
CREATE INDEX IF NOT EXISTS "Tag_workspaceId_idx" ON "Tag"("workspaceId");

-- 2. Project.completed - Filter completed projects
CREATE INDEX IF NOT EXISTS "Project_completed_idx" ON "Project"("completed");

-- 3. Project.archived - Filter archived projects
CREATE INDEX IF NOT EXISTS "Project_archived_idx" ON "Project"("archived");

-- 4. Project.status - Filter projects by status
CREATE INDEX IF NOT EXISTS "Project_status_idx" ON "Project"("status");

-- Note: KeyResultTask and KeyResult tables removed from migration
-- These tables don't exist in the migration history yet
-- A separate migration will be created for them when needed

-- 5. Notification.resourceId + resourceType - Query notifications by resource (composite)
CREATE INDEX IF NOT EXISTS "Notification_resourceId_resourceType_idx" ON "Notification"("resourceId", "resourceType");
