-- Add username column to User table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'username'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "username" TEXT;
    END IF;
END $$;

-- Add unique constraint for username if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'User_username_key'
    ) THEN
        CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
    END IF;
END $$;

-- Update existing users to have a username based on their email
UPDATE "User"
SET "username" = LOWER(SPLIT_PART("email", '@', 1))
WHERE "username" IS NULL OR "username" = '';

-- Make username column NOT NULL after populating it
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