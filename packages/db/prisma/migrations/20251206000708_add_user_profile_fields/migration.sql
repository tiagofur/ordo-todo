-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('GOOGLE_CALENDAR', 'GOOGLE_TASKS', 'SLACK', 'GITHUB', 'MICROSOFT_TEAMS', 'NOTION', 'ZAPIER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "locale" TEXT DEFAULT 'es',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "timezone" TEXT DEFAULT 'America/Mexico_City';

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "aiSuggestPriorities" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "aiSuggestScheduling" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "aiSuggestTaskDurations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "aiWeeklyReports" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "completedTasksRetention" INTEGER,
ADD COLUMN     "marketingEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareAnalytics" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showActivityStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "taskRemindersEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeSessionsRetention" INTEGER,
ADD COLUMN     "weeklyDigestEmail" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "UserIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "providerUserId" TEXT,
    "providerEmail" TEXT,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserIntegration_userId_idx" ON "UserIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserIntegration_userId_provider_key" ON "UserIntegration"("userId", "provider");

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
