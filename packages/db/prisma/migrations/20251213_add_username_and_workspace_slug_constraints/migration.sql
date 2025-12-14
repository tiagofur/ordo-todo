-- Make username required (NOT NULL)
-- First, ensure all existing users have a username (generate from email if needed)
UPDATE "User"
SET "username" = LOWER(SPLIT_PART("email", '@', 1))
WHERE "username" IS NULL OR "username" = '';

-- Now make the column NOT NULL
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- Add unique constraint on workspace (ownerId, slug) if it doesn't exist
-- First drop any existing index on slug alone
DROP INDEX IF EXISTS "Workspace_slug_idx";

-- Ensure unique constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Workspace_ownerId_slug_key'
    ) THEN
        ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_slug_key" UNIQUE ("ownerId", "slug");
    END IF;
END $$;

-- Re-create individual indexes for query performance
CREATE INDEX IF NOT EXISTS "Workspace_slug_idx" ON "Workspace"("slug");
