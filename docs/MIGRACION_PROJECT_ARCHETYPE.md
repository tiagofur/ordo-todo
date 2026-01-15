# 🔄 MIGRACIÓN: Sistema de Arquetipos de Proyecto

> **Fecha**: 14 de Enero, 2025
> **Objetivo**: Agregar modos FOCUS y CREATOR a proyectos sin romper existente
> **Estado**: ✅ Schema actualizado, listo para migrar

---

## 📋 RESUMEN DE CAMBIOS

### ✅ LO QUE CAMBIAMOS

**Archivo**: `packages/db/prisma/schema.prisma`

**Cambio**: Extender el enum `ProjectType`

```prisma
// ANTES (2 valores)
enum ProjectType {
  STANDARD
  SERIES
}

// DESPUÉS (5 valores) ✅
enum ProjectType {
  STANDARD      // Classic To-Do (checkbox, lista simple)
  SERIES        // Episodic content management
  FOCUS         // ← NUEVO: Modo专注 para productividad personal
  CREATOR       // ← NUEVO: Modo Creator OS con pipeline
  HYBRID        // ← NUEVO: Ambos modos disponibles
}
```

---

## ✅ GARANTÍAS DE SEGURIDAD

### 1. **BACKWARD COMPATIBLE** ✅

- ✅ **NO borramos** valores existentes (`STANDARD`, `SERIES`)
- ✅ **NO modificamos** el default (`@default(STANDARD)`)
- ✅ **SOLO agregamos** 3 nuevos valores
- ✅ Proyectos existentes **no se afectan**

### 2. **PROYECTOS EXISTENTES** ✅

**Todos los proyectos existentes** mantienen su valor `STANDARD` o `SERIES`.

**NO hay migración de datos necesaria** porque:
- Los proyectos ya tienen valores válidos
- Solo agregamos opciones nuevas
- El default sigue siendo `STANDARD`

---

## 🚀 PASOS PARA EJECUTAR LA MIGRACIÓN

### Paso 1: Generar Migración

```bash
cd packages/db

# Generar la migración
npx prisma migrate dev --name add_project_focus_and_creator_types
```

**Esto crea**: `packages/db/prisma/migrations/XXXXXXXXXXXXXX_add_project_focus_and_creator_types/migration.sql`

**Contenido esperado**:
```sql
-- AlterEnum
ALTER TYPE "ProjectType" ADD VALUE IF NOT EXISTS 'FOCUS';
ALTER TYPE "ProjectType" ADD VALUE IF NOT EXISTS 'CREATOR';
ALTER TYPE "ProjectType" ADD VALUE IF NOT EXISTS 'HYBRID';
```

### Paso 2: Verificar Migración

```bash
# Ver que la migración se ve correcta
cat prisma/migrations/*/migration.sql
```

### Paso 3: Aplicar Migración (si usas DB local)

```bash
# Opción A: Push directo (desarrollo)
npx prisma db push

# Opción B: Migrate + Deploy (producción)
npx prisma migrate deploy
```

### Paso 4: Regenerar Cliente Prisma

```bash
cd packages/db

# Regenerar el cliente de Prisma
npx prisma generate
```

**Esto actualiza**: `packages/db/src/index.d.ts` con los nuevos tipos TypeScript

---

## 🧪 TESTING POST-MIGRACIÓN

### Verificar que no se rompió nada

```typescript
// packages/db/src/index.ts (auto-generado)

export type ProjectType = {
  STANDARD: "STANDARD",
  SERIES: "SERIES",
  FOCUS: "FOCUS",       // ← NUEVO
  CREATOR: "CREATOR",   // ← NUEVO
  HYBRID: "HYBRID"      // ← NUEVO
}
```

### Probar en TypeScript

```typescript
import { ProjectType } from '@ordo-todo/db';

// ✅ Esto DEBERÍA funcionar (código existente)
const standardProject: ProjectType = "STANDARD";
const seriesProject: ProjectType = "SERIES";

// ✅ Esto ES NUEVO (nuevo código)
const focusProject: ProjectType = "FOCUS";
const creatorProject: ProjectType = "CREATOR";
const hybridProject: ProjectType = "HYBRID";

// ✅ Proyectos existentes NO se ven afectados
```

---

## 📊 IMPACTO EN CÓDIGO EXISTENTE

### **NO REQUIERE CAMBIOS** en:

- ✅ **Frontend (Web/Desktop/Mobile)** - Todo sigue igual
- ✅ **Backend (NestJS)** - No necesita cambios inmediatos
- ✅ **Componentes existentes** - Funcionan igual

### **SÍ REQUIERE CAMBIOS** en:

- ❌ **CreateProjectDialog** - Agregar selector de tipo
- ❌ **Project View** - Switcher según tipo
- ❌ **Tests** - Agregar tests para nuevos tipos

---

## 🎯 PLAN DE IMPLEMENTACIÓN (Fases siguientes)

### ✅ Fase 1: Schema (ESTA FASE)
- [x] Extender enum `ProjectType`
- [ ] Generar migración
- [ ] Aplicar migración
- [ ] Regenerar cliente Prisma

### ⏳ Fase 2: Frontend (Próxima)
- [ ] Actualizar `CreateProjectDialog` con selector
- [ ] Crear `ProjectViewSwitcher`
- [ ] Integrar en apps/web y desktop

### ⏳ Fase 3: Testing (Futura)
- [ ] Tests unitarios de switcher
- [ ] Tests E2E de creación de proyectos
- [ ] Verificar backward compatibility

---

## ⚠️ ROLLBACK PLAN (si algo sale mal)

### Opción 1: Revertir migración
```bash
# Revertir última migración
npx prisma migrate resolve --rolled-back [migration-name]

# O editar schema manualmente
git checkout HEAD~1 packages/db/prisma/schema.prisma
```

### Opción 2: Marcar proyectos (manual)
```sql
-- Si algo sale mal, puedes marcar proyectos existentes manualmente
UPDATE "Project" SET type = 'STANDARD' WHERE type IS NULL;
```

---

## 🎉 BENEFICIOS

### Para ti (desarrollador):
1. ✅ **Migración segura** - Solo agrega valores al enum
2. ✅ **Backward compatible** - No rompe código existente
3. ✅ **Zero downtime** - No requiere borrar datos
4. ✅ **TypeScript safe** - Tipos se actualizan automáticamente

### Para el usuario:
1. ✅ **Flexibilidad** - Puede elegir modo por proyecto
2. ✅ **Progresivo** - Empieza con STANDARD, migra a CREATOR cuando quiera
3. ✅ **Híbrido** - Puede tener ambos modos en mismo workspace

---

## 📋 CHECKLIST ANTES DE CONTINUAR

- [x] Schema actualizado
- [ ] Migración generada
- [ ] Migración aplicada
- [ ] Cliente Prisma regenerado
- [ ] Tests pasan
- [ ] Deploy en staging

---

**¿Listo para ejecutar la migración?** 🚀

Una vez que confirmes, ejecutamos:
```bash
cd packages/db
npx prisma migrate dev --name add_project_focus_and_creator_types
```
