-- Tarea express: projectId pasa a ser opcional (ODD 021, issue #430)
-- Migración aditiva: ninguna fila existente cambia de valor.

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "projectId" DROP NOT NULL;
