-- Actualizar workspaces "Carros" para que aparezcan en la papelera
-- Ejecuta esto en Prisma Studio o en tu cliente PostgreSQL

-- Marcar "Carros" como eliminado
UPDATE "Workspace"
SET "isDeleted" = true,
    "deletedAt" = NOW()
WHERE LOWER(name) = 'carros';

-- Marcar "carros2" como eliminado
UPDATE "Workspace"
SET "isDeleted" = true,
    "deletedAt" = NOW()
WHERE LOWER(name) = 'carros2';

-- Marcar "Carros3" como eliminado
UPDATE "Workspace"
SET "isDeleted" = true,
    "deletedAt" = NOW()
WHERE LOWER(name) = 'carros3';

-- Verificar los cambios
SELECT id, name, slug, "isDeleted", "deletedAt", "ownerId"
FROM "Workspace"
WHERE LOWER(name) LIKE '%carros%';
