-- CreateTable
CREATE TABLE "AiCreditAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "trialUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiCreditAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsageEvent" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiCreditAccount_userId_key" ON "AiCreditAccount"("userId");

-- CreateIndex
CREATE INDEX "AiCreditAccount_userId_idx" ON "AiCreditAccount"("userId");

-- CreateIndex
CREATE INDEX "AiUsageEvent_accountId_createdAt_idx" ON "AiUsageEvent"("accountId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiCreditAccount" ADD CONSTRAINT "AiCreditAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsageEvent" ADD CONSTRAINT "AiUsageEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "AiCreditAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
