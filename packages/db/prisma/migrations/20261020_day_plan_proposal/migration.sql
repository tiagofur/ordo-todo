-- ODD 005 T3b: DayPlanProposal + DayPlanProposalStatus.
-- Hand-written (isolated): `prisma migrate dev` on this HEAD also emits
-- pre-existing schema-vs-migrations drift from other branches (dropped
-- Content*/Idea* tables, ProjectType enum values). That drift is OUT of
-- scope for T3 (roadmap rule 6: hallazgos != alcance) and is intentionally
-- excluded here. Verified with `migrate deploy` on a scratch DB.
-- CreateEnum
CREATE TYPE "DayPlanProposalStatus" AS ENUM ('PROPOSED', 'APPLIED', 'DISMISSED');

-- CreateTable
CREATE TABLE "DayPlanProposal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "blocks" JSONB NOT NULL,
    "frozenTaskIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "changes" JSONB NOT NULL DEFAULT '[]',
    "status" "DayPlanProposalStatus" NOT NULL DEFAULT 'PROPOSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayPlanProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DayPlanProposal_userId_date_idx" ON "DayPlanProposal"("userId", "date");

-- CreateIndex
CREATE INDEX "DayPlanProposal_userId_status_idx" ON "DayPlanProposal"("userId", "status");

-- AddForeignKey
ALTER TABLE "DayPlanProposal" ADD CONSTRAINT "DayPlanProposal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
