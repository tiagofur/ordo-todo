-- ODD 019 / limpieza Creator OS (autorizada por el usuario el 2026-10-23).
-- Creator OS se extrajo al repositorio `ordo-creators` (docs/MATRIZ-MADUREZ-AUDITORIA-2026.md
-- §81) pero dejaron residuos: las tablas que su migración de 2025 creó y que ningún
-- modelo del schema usa desde entonces, la columna `Project.type` que el backend jamás
-- leyó ni escribió (siempre STANDARD), y el enum `ProjectType`.
-- Escrita a mano por la misma razón que `20261023_invite_codes_user_status`: el barrido
-- de `prisma migrate dev` arrastraría drift ajeno (índice hnsw de pgvector, etc.).

-- DropColumn
ALTER TABLE "Project" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Task" DROP COLUMN IF EXISTS "contentStatus";

-- DropTable (residuos Creator OS; CASCADE por las FKs entre ellas)
DROP TABLE IF EXISTS "AtomizedContent" CASCADE;
DROP TABLE IF EXISTS "ConsistencyScore" CASCADE;
DROP TABLE IF EXISTS "ContentAsset" CASCADE;
DROP TABLE IF EXISTS "ContentPiece" CASCADE;
DROP TABLE IF EXISTS "Idea" CASCADE;
DROP TABLE IF EXISTS "IdeaTag" CASCADE;
DROP TABLE IF EXISTS "Series" CASCADE;
DROP TABLE IF EXISTS "SocialPost" CASCADE;
DROP TABLE IF EXISTS "ContentMetadata" CASCADE;

-- DropEnum (solo valores vivos en tablas ya eliminadas o en la columna borrada)
DROP TYPE IF EXISTS "ProjectType";
DROP TYPE IF EXISTS "ContentStatus";
DROP TYPE IF EXISTS "ContentPlatform";
DROP TYPE IF EXISTS "ContentType";
DROP TYPE IF EXISTS "IdeaSource";
DROP TYPE IF EXISTS "IdeaStatus";
DROP TYPE IF EXISTS "ContentPipelineStatus";
DROP TYPE IF EXISTS "SeriesType";
DROP TYPE IF EXISTS "SocialPostStatus";
DROP TYPE IF EXISTS "AssetType";
DROP TYPE IF EXISTS "AssetRole";
DROP TYPE IF EXISTS "AtomType";
DROP TYPE IF EXISTS "ConsistencyPeriod";
