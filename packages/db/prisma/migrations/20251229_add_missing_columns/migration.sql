-- Migration: Add missing columns to Task and Project tables
-- This migration adds columns that exist in schema.prisma but were not previously migrated

-- ============================================================================
-- TASK TABLE - Add missing scheduling and soft delete fields
-- ============================================================================

-- Add scheduling columns
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "scheduledDate" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "scheduledTime" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "scheduledEndTime" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "isTimeBlocked" BOOLEAN NOT NULL DEFAULT false;

-- Add sharing column
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "publicToken" TEXT;

-- Add soft delete columns
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Add unique constraint for Task publicToken
CREATE UNIQUE INDEX IF NOT EXISTS "Task_publicToken_key" ON "Task"("publicToken");

-- Add index for scheduledDate
CREATE INDEX IF NOT EXISTS "Task_scheduledDate_idx" ON "Task"("scheduledDate");

-- ============================================================================
-- PROJECT TABLE - Add missing soft delete fields 
-- Note: Other Project columns were added in 20251203205630_add_project_slugs
-- ============================================================================

-- Add soft delete columns (these were missing from the slugs migration)
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
-- Note: deletedAt was already added in 20251203205630_add_project_slugs

-- ============================================================================
-- Update ownerId constraint on Task for proper cascade behavior
-- ============================================================================

-- Ensure the foreign key constraint exists with proper settings
DO $$ BEGIN
    -- First attempt to drop old constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Task_creatorId_fkey' AND table_name = 'Task') THEN
        ALTER TABLE "Task" DROP CONSTRAINT "Task_creatorId_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Task_ownerId_fkey' AND table_name = 'Task') THEN
        ALTER TABLE "Task" DROP CONSTRAINT "Task_ownerId_fkey";
    END IF;
    -- Add the constraint with proper behavior
    ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN undefined_object THEN null;
    WHEN duplicate_object THEN null;
END $$;
