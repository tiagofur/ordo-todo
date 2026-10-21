-- ODD 006 T4: ritual reminder preferences on UserPreferences +
-- RITUAL_MORNING/RITUAL_EVENING notification types.
-- Hand-written (isolated): `prisma migrate dev` on this HEAD also emits
-- pre-existing schema-vs-migrations drift from other branches. That drift is
-- OUT of scope (roadmap rule 6: hallazgos != alcance) and is intentionally
-- excluded here. Verified with `migrate deploy` on a scratch DB.
-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN "ritualMorningReminder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "ritualEveningReminder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "ritualMorningTime" TEXT NOT NULL DEFAULT '08:00',
ADD COLUMN "ritualEveningTime" TEXT NOT NULL DEFAULT '21:00';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'RITUAL_MORNING';
ALTER TYPE "NotificationType" ADD VALUE 'RITUAL_EVENING';
