-- CreateTable
CREATE TABLE "SlackWorkspaceMap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT,
    "slackUserId" TEXT,
    "channelId" TEXT,
    "projectId" TEXT,
    "dailySummary" BOOLEAN NOT NULL DEFAULT false,
    "summaryHour" INTEGER,
    "focusSync" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlackWorkspaceMap_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SlackWorkspaceMap" ADD CONSTRAINT "SlackWorkspaceMap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "SlackWorkspaceMap_userId_teamId_channelId_projectId_key" ON "SlackWorkspaceMap"("userId", "teamId", "channelId", "projectId");

-- CreateIndex
CREATE INDEX "SlackWorkspaceMap_userId_idx" ON "SlackWorkspaceMap"("userId");

-- CreateIndex
CREATE INDEX "SlackWorkspaceMap_teamId_idx" ON "SlackWorkspaceMap"("teamId");
