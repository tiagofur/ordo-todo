-- ODD 006 T1: RitualDay + RitualStatus.
-- Hand-written (isolated): `prisma migrate dev` on this HEAD also emits
-- pre-existing schema-vs-migrations drift from other branches. That drift is
-- OUT of scope (roadmap rule 6: hallazgos != alcance) and is intentionally
-- excluded here. Verified with `migrate deploy` on a scratch DB.
-- CreateEnum
CREATE TYPE "RitualStatus" AS ENUM ('PENDING', 'DONE', 'SKIPPED');

-- CreateTable
CREATE TABLE "RitualDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "morningStatus" "RitualStatus" NOT NULL DEFAULT 'PENDING',
    "morningAt" TIMESTAMP(3),
    "morningTop3" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "morningPlannedAt" TIMESTAMP(3),
    "eveningStatus" "RitualStatus" NOT NULL DEFAULT 'PENDING',
    "eveningAt" TIMESTAMP(3),
    "eveningMoves" JSONB NOT NULL DEFAULT '[]',
    "streakDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RitualDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RitualDay_userId_date_key" ON "RitualDay"("userId", "date");

-- CreateIndex
CREATE INDEX "RitualDay_userId_morningStatus_idx" ON "RitualDay"("userId", "morningStatus");

-- CreateIndex
CREATE INDEX "RitualDay_userId_eveningStatus_idx" ON "RitualDay"("userId", "eveningStatus");

-- AddForeignKey
ALTER TABLE "RitualDay" ADD CONSTRAINT "RitualDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
