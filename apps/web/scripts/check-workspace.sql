-- Verificar workspace "Carros"
SELECT id, name, slug, "isDeleted", "deletedAt", "isArchived", "ownerId"
FROM "Workspace"
WHERE LOWER(name) LIKE '%carros%';

-- Verificar todos los workspaces eliminados
SELECT id, name, slug, "isDeleted", "deletedAt", "ownerId"
FROM "Workspace"
WHERE "isDeleted" = true;
