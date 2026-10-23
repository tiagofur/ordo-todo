-- ODD 019: invite-only registration gate + platform account state.
-- Hand-written on purpose: `prisma migrate dev` on this repo sweeps in
-- pre-existing schema/history drift (Creator OS tables, ProjectType values,
-- the hnsw AiEmbedding index) that is NOT part of this change.

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- AlterEnum: admin + invite audit events
ALTER TYPE "AuthEventType" ADD VALUE 'ADMIN_USER_BLOCKED';
ALTER TYPE "AuthEventType" ADD VALUE 'ADMIN_USER_UNBLOCKED';
ALTER TYPE "AuthEventType" ADD VALUE 'ADMIN_PRO_GRANTED';
ALTER TYPE "AuthEventType" ADD VALUE 'ADMIN_PRO_REVOKED';
ALTER TYPE "AuthEventType" ADD VALUE 'INVITE_CODE_CREATED';
ALTER TYPE "AuthEventType" ADD VALUE 'INVITE_CODE_DEACTIVATED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "InviteCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteRedemption" (
    "id" TEXT NOT NULL,
    "inviteCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_code_key" ON "InviteCode"("code");

-- CreateIndex
CREATE INDEX "InviteCode_isActive_idx" ON "InviteCode"("isActive");

-- CreateIndex
CREATE INDEX "InviteCode_createdAt_idx" ON "InviteCode"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InviteRedemption_userId_key" ON "InviteRedemption"("userId");

-- CreateIndex
CREATE INDEX "InviteRedemption_inviteCodeId_idx" ON "InviteRedemption"("inviteCodeId");

-- AddForeignKey
ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteRedemption" ADD CONSTRAINT "InviteRedemption_inviteCodeId_fkey" FOREIGN KEY ("inviteCodeId") REFERENCES "InviteCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteRedemption" ADD CONSTRAINT "InviteRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
