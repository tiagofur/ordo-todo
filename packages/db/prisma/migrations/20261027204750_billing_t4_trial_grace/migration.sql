-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "graceEndsAt" TIMESTAMP(3),
ADD COLUMN     "trialReminderSentAt" TIMESTAMP(3);
