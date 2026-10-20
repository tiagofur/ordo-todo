-- AlterTable
ALTER TABLE "Task" ADD COLUMN "doDate" TIMESTAMP(3);

-- Backfill: existing tasks inherit their deadline as the planned do date
UPDATE "Task" SET "doDate" = "dueDate" WHERE "dueDate" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Task_doDate_idx" ON "Task"("doDate");
