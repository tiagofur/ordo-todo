-- Fix existing projects to have completed = false instead of null
UPDATE "Project" 
SET completed = false, "updatedAt" = NOW()
WHERE completed IS NULL;
