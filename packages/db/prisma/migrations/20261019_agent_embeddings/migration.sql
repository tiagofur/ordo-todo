-- Enable pgvector extension for embedding similarity search (ODD 004 T2a)
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "AiEmbedding" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "embedding" vector(768),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiEmbedding_contentType_contentId_chunkIndex_key" ON "AiEmbedding"("contentType", "contentId", "chunkIndex");

-- CreateIndex
CREATE INDEX "AiEmbedding_contentType_contentId_idx" ON "AiEmbedding"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "AiEmbedding_contentId_idx" ON "AiEmbedding"("contentId");

-- HNSW cosine; not tracked by Prisma schema (drift): do not remove
CREATE INDEX "AiEmbedding_embedding_idx" ON "AiEmbedding" USING hnsw ("embedding" vector_cosine_ops);
