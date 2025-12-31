# 🗺️ Roadmap - Packages Ordo-Todo

> **Estado Actual:** Score 61/100 ⚠️ **REQUIERE MEJORAS SIGNIFICATIVAS**
> **Objetivo:** 85+/100 en 10 semanas
> **Última actualización:** 31 de Diciembre 2025

---

## 📊 Resumen Ejecutivo

| Fase            | Duración    | Score Meta | Estado       |
| --------------- | ----------- | ---------- | ------------ |
| Fase 1: CRÍTICA | 4-6 semanas | 75/100     | 🔴 Pendiente |
| Fase 2: ALTA    | 3-4 semanas | 85/100     | 🔴 Pendiente |
| Fase 3: MEDIA   | 2-3 semanas | 90+/100    | 🔴 Pendiente |

**Total estimado:** 9-13 semanas

---

## 🎯 Fase 1: CRÍTICA (4-6 semanas) → 75/100

### Objetivos

1. Eliminar arquitectura incorrecta en `packages/ui`
2. Eliminar todos los tipos `any` en `packages/core` y `packages/api-client`
3. Agregar índices críticos en `packages/db`
4. Establecer base de testing en `packages/hooks`

### Semana 1-2: packages/ui - Refactorización Arquitectónica

**Prioridad:** CRÍTICA
**Responsable:** 2-3 Senior Developers
**Impacto:** Bloquea reutilización en web, mobile, desktop

#### Tarea 1.1: Eliminar `'use client'` de todos los componentes

- **Archivos:** ~100 componentes
- **Acción:** Remover directiva `'use client'` de todos los componentes en `packages/ui`
- **Tiempo:** 3 días
- **Verificación:** `grep -r "use client" packages/ui/src/` retorna 0 resultados

#### Tarea 1.2: Eliminar React Hooks de componentes

- **Archivos:** ~90 componentes
- **Acción:**
  - Mover todo el estado (`useState`, `useEffect`, `useMemo`) a consuming apps
  - Crear componentes "container" en `apps/web`, `apps/desktop`, `apps/mobile`
  - Componentes en `packages/ui` deben ser puramente presentacionales
- **Tiempo:** 7 días
- **Verificación:** `grep -r "useState\|useEffect\|useMemo" packages/ui/src/` retorna 0 resultados

#### Tarea 1.3: Crear patrones de abstracción platform-agnostic

- **Acción:**
  - Documentar patrón de props-based data passing
  - Crear ejemplos para 20 componentes más críticos
  - Refactorizar 5 componentes piloto
- **Tiempo:** 3 días
- **Entregables:** `docs/packages/PLATFORM-AGNOSTIC-PATTERN.md`

#### Tarea 1.4: Refactorización masiva de componentes

- **Categorías a refactorizar:**
  - 31 componentes base (ui/)
  - 15 componentes task/
  - 11 componentes project/
  - 7 componentes analytics/
  - 3 componentes workspace/
  - Resto de componentes de dominio
- **Tiempo:** 5 días
- **Code review obligatorio en cada PR**

#### Tarea 1.5: Eliminar createPortal usage

- **Archivos:** `project-board.tsx`, otros
- **Acción:** Remover `createPortal`, dejar que consuming app maneje portales
- **Tiempo:** 2 horas

**Entregables Semana 1-2:**

- [ ] Todos los componentes sin `'use client'`
- [ ] Todos los componentes sin React hooks
- [ ] 0 violaciones de Rule 19 (Platform-Specific Code)
- [ ] Documentación de patrones creada

---

### Semana 2-3: packages/core + api-client - Eliminar `any` types

**Prioridad:** CRÍTICA
**Responsable:** 1 Senior Developer
**Impacto:** Pérdida de type safety, errores en runtime

#### Tarea 2.1: packages/core - Eliminar `any` en shared

- **Archivos:**
  - `src/shared/entity.ts` (2 usos)
  - `src/shared/use-case.ts` (1 uso)
  - `src/shared/value-object.ts` (1 uso)
- **Acción:**
  - Crear `LoggedUser` interface en `src/shared/types.ts`
  - Reemplazar `any` con tipos apropiados
  - Actualizar todos los use cases afectados
- **Tiempo:** 1 día

#### Tarea 2.2: packages/core - Crear entidades faltantes

- **Acción:**
  - Crear `habit.entity.ts` con props completos
  - Tipar `habit.repository.ts` con entidad `Habit`
  - Eliminar 6 usos de `any` en repository
- **Tiempo:** 1 día

#### Tarea 2.3: packages/core - Eliminar `any` en use cases

- **Archivos:**
  - `get-deleted-tasks.usecase.ts` (1 uso)
  - `get-deleted-projects.usecase.ts` (1 uso)
  - AI service (2 usos)
- **Acción:**
  - Tipar return types como `Task[]`, `Project[]`
  - Crear `AIReportContext` interface
- **Tiempo:** 1 día

#### Tarea 2.4: packages/api-client - Eliminar `any` types

- **Violaciones:** 16 usos de `any`
- **Acción:**
  - Revisar todos los types en `src/types/`
  - Crear interfaces DTOs faltantes
  - Tipar todas las responses
- **Tiempo:** 2 días

**Entregables Semana 2-3:**

- [ ] 0 usos de `any` en `packages/core`
- [ ] 0 usos de `any` en `packages/api-client`
- [ ] TypeScript strict mode compliance: 100%

---

### Semana 2-3 (Paralelo): packages/db - Índices Críticos

**Prioridad:** CRÍTICA
**Responsable:** 1 Backend Developer
**Impacto:** Performance en producción

#### Tarea 3.1: Agregar 6 índices a foreign keys

- **Índices a crear:**
  ```prisma
  model WorkspaceInvitation {
    @@index([invitedById])
  }
  model WorkspaceAuditLog {
    @@index([actorId])
  }
  model Habit {
    @@index([workspaceId])
  }
  model Objective {
    @@index([workspaceId])
  }
  model BlogComment {
    @@index([userId])
    @@index([postId])
  }
  ```
- **Acción:**
  - Modificar `prisma/schema.prisma`
  - Crear migración: `npx prisma migrate dev --name add_critical_indexes`
  - Testear en dev environment
- **Tiempo:** 4 horas

#### Targa 3.2: Agregar documentación a modelos críticos

- **Acción:**
  - Agregar `///` comments a los 49 modelos
  - Documentar campos principales
- **Tiempo:** 2 días

**Entregables Semana 2-3:**

- [ ] 6 índices agregados
- [ ] Migración creada y validada
- [ ] 50% de modelos con documentación

---

### Semana 3-4: packages/ui - Eliminar Transparencias y Gradients

**Prioridad:** CRÍTICA
**Responsable:** 1-2 Frontend Developers
**Impacto:** Violación de reglas de diseño

#### Tarea 4.1: Crear paleta de colores sólidos

- **Acción:**
  - Documentar equivalencias: `opacity-60` → `#e5e7eb`
  - Crear clases custom para reemplazar transparencias
  - Actualizar `packages/ui/src/utils/colors.ts`
- **Tiempo:** 4 horas

#### Tarea 4.2: Eliminar `bg-transparent`

- **Archivos:** 20+ componentes
- **Acción:**
  - Reemplazar `bg-transparent` con colores sólidos
  - Asegurar dark mode: `bg-white dark:bg-gray-800`
- **Tiempo:** 2 días

#### Tarea 4.3: Eliminar `opacity-*` classes

- **Archivos:** 50+ componentes
- **Acción:**
  - Reemplazar `opacity-50`, `opacity-60`, `opacity-70` con colores sólidos
  - Mantener solo `disabled:opacity-50` para estados de deshabilitado
- **Tiempo:** 3 días

#### Tarea 4.4: Eliminar `/XX` modifiers de Tailwind

- **Archivos:** 30+ componentes
- **Acción:**
  - Reemplazar `bg-primary/20`, `bg-black/10`, etc. con colores sólidos
  - Crear paleta de colores para estos casos
- **Tiempo:** 2 días

#### Tarea 4.5: Eliminar gradients y blur effects

- **Archivos:** 5 componentes
- **Acción:**
  - Remover `blur-3xl` + `opacity`
  - Reemplazar con colores sólidos o eliminar efecto
- **Tiempo:** 1 día

**Entregables Semana 3-4:**

- [ ] 0 violaciones de Rule 13 (Transparencias)
- [ ] 0 violaciones de Rule 14 (Gradients)
- [ ] Paleta de colores sólidos documentada

---

### Semana 4-5: packages/hooks - Testing Suite

**Prioridad:** CRÍTICA
**Responsable:** 1 Frontend Developer
**Impacto:** Sin garantías de calidad

#### Tarea 5.1: Crear test suite base

- **Acción:**
  - Configurar Vitest para React Query hooks
  - Crear mocks para `apiClient`
  - Crear helpers para testing mutations
- **Tiempo:** 1 día

#### Tarea 5.2: Tests para hooks críticos

- **Hooks a testear:**
  - `useTasks` (CRUD completo)
  - `useProjects` (CRUD completo)
  - `useWorkspaces` (CRUD completo)
  - `useCreateTask` (mutation)
  - `useUpdateTask` (mutation)
  - `useDeleteTask` (mutation)
- **Meta:** 100% coverage para paths críticos
- **Tiempo:** 3 días

#### Tarea 5.3: Tests para hooks restantes

- **Acción:**
  - Testear todos los hooks restantes (~35 hooks)
  - Meta: >80% coverage total
- **Tiempo:** 4 días

**Entregables Semana 4-5:**

- [ ] Test suite configurado
- [ ] 80%+ coverage en hooks
- [ ] 100% coverage en paths críticos

---

### Semana 5-6: packages/core - DRY Violations

**Prioridad:** ALTA (transitioning to CRÍTICA after initial work)
**Responsable:** 1 Senior Developer
**Impacto:** Code duplication, mantenimiento difícil

#### Tarea 6.1: Crear Soft Delete mixin

- **Acción:**
  - Crear `src/shared/soft-delete.mixin.ts`
  - Implementar `withSoftDelete` helper
  - Aplicar a Task, Project, Workspace
- **Tiempo:** 1 día

#### Tarea 6.2: Auto-update timestamps en Entity.clone()

- **Acción:**
  - Modificar `Entity.clone()` para auto-update `updatedAt`
  - Remover 32 instancias duplicadas
  - Validar que no rompa comportamiento existente
- **Tiempo:** 1 día

#### Tarea 6.3: Eliminar duplicación de slug generation

- **Acción:**
  - Reemplazar `generateSlug` duplicado en `create-workspace.usecase.ts`
  - Importar de `src/shared/utils/string.utils.ts`
- **Tiempo:** 2 horas

**Entregables Semana 5-6:**

- [ ] 0 violaciones de duplicación de soft delete
- [ ] 32 instancias de `updatedAt` consolidadas
- [ ] 0 duplicaciones de slug generation

---

## ✅ Checkpoint Fase 1 (Fin Semana 6)

**Validaciones requeridas:**

```bash
# packages/ui - Platform-agnostic
grep -r "use client" packages/ui/src/  # Must return 0
grep -r "useState\|useEffect\|useMemo" packages/ui/src/  # Must return 0

# packages/core + api-client - No any types
grep -r ": any" packages/core/src/  # Must return 0
grep -r ": any" packages/api-client/src/  # Must return 0

# packages/db - Indexes
npx prisma studio  # Verify indexes exist

# packages/hooks - Testing
npm run test --filter=@ordo-todo/hooks  # >80% coverage

# packages/ui - No transparencias/gradients
grep -r "bg-transparent\|opacity-\|/" packages/ui/src/components/ | grep -v "disabled"  # Minimal results
```

**Score esperado:** 70-75/100

---

## 🚀 Fase 2: ALTA (3-4 semanas) → 85/100

### Objetivos

1. Completar accessibility en `packages/ui`
2. Implementar dark mode completo
3. Optimizar React Query en `packages/hooks`
4. Testing en `packages/stores`

### Semana 7-8: packages/ui - Accessibility

**Prioridad:** ALTA
**Responsable:** 1 Frontend Developer
**Impacto:** Accesibilidad para todos los usuarios

#### Tarea 7.1: Agregar ARIA labels a botones icon-only

- **Archivos:** 50+ componentes
- **Acción:**
  - Agregar `aria-label` a todos los botones sin texto
  - Agregar `aria-expanded` a dropdowns/menus
  - Agregar `aria-pressed` a toggles
- **Tiempo:** 2 días

#### Tarea 7.2: Implementar keyboard navigation

- **Componentes a actualizar:**
  - `dropdown-menu.tsx` - Arrow keys, Escape, Enter
  - `dialog.tsx` - Escape, Focus trap
  - `task-selector.tsx` - Combobox keyboard support
- **Tiempo:** 3 días

#### Tarea 7.3: Agregar roles semánticos

- **Acción:**
  - `role="button"` en elementos div que actúan como botones
  - `role="dialog"` en modales
  - `role="list"`, `role="listitem"` en listas
- **Tiempo:** 1 día

#### Tarea 7.4: Test con screen reader

- **Acción:**
  - Testear navegación con NVDA/VoiceOver
  - Verificar anuncios correctos
  - Corregir issues encontrados
- **Tiempo:** 2 días

**Entregables Semana 7-8:**

- [ ] 100% de botones icon-only con ARIA labels
- [ ] Keyboard navigation en componentes interactivos
- [ ] Test con screen reader aprobado
- [ ] WCAG 2.1 Level AA compliance

---

### Semana 8-9: packages/ui - Dark Mode

**Prioridad:** ALTA
**Responsable:** 1 Frontend Developer
**Impacto:** Experiencia en modo oscuro

#### Tarea 8.1: Completar dark mode en componentes base

- **Componentes:**
  - `card.tsx` - Fondo y bordes
  - `alert.tsx` - Colores de alertas
  - `button.tsx` - Todos los variants
  - `input.tsx`, `textarea.tsx`, `select.tsx` - Inputs
- **Acción:**
  - Agregar `dark:` classes a todos los colores
  - Testear en dark mode
- **Tiempo:** 2 días

#### Tarea 8.2: Dark mode en componentes de dominio

- **Componentes:**
  - `task-card.tsx`
  - `workspace-card.tsx`
  - `project-board.tsx`
  - Otros componentes de dominio
- **Tiempo:** 3 días

#### Tarea 8.3: Validar consistencia visual

- **Acción:**
  - Testear toda la app en dark mode
  - Ajustar contrast ratios (<4.5:1 es fail)
  - Documentar palette de colores dark mode
- **Tiempo:** 1 día

**Entregables Semana 8-9:**

- [ ] Dark mode completo en 91+ componentes
- [ ] Contrast ratios WCAG compliant
- [ ] Documentación de colores dark mode

---

### Semana 9: packages/ui - Responsive Design

**Prioridad:** ALTA
**Responsable:** 1 Frontend Developer
**Impacto:** Experiencia móvil

#### Tarea 9.1: Eliminar fixed widths

- **Archivos:**
  - `sidebar.tsx` - `w-64` → `w-full md:w-64`
  - `auth-form.tsx` - `w-96` → `w-full max-w-md`
  - `task-card.tsx` - `max-w-[180px]` → responsive
- **Tiempo:** 1 día

#### Tarea 9.2: Agregar responsive text sizing

- **Acción:**
  - `text-xl` → `text-lg md:text-xl lg:text-2xl`
  - Implementar para headings principales
- **Tiempo:** 2 días

#### Tarea 9.3: Test en breakpoints

- **Breakpoints:**
  - Mobile: 320px, 640px
  - Tablet: 768px, 1024px
  - Desktop: 1280px+
- **Tiempo:** 1 día

**Entregables Semana 9:**

- [ ] Responsive design en 91+ componentes
- [ ] Validado en todos los breakpoints
- [ ] Mobile-first approach implementado

---

### Semana 9-10: packages/hooks - React Query Best Practices

**Prioridad:** ALTA
**Responsable:** 1 Frontend Developer
**Impacto:** Performance de data fetching

#### Tarea 10.1: Agregar staleTime/gcTime a queries

- **Acción:**
  - Definir políticas de cache por tipo de query
  - `staleTime: 5 * 60 * 1000` para datos de referencia
  - `gcTime: 10 * 60 * 1000` para datos cacheados
- **Tiempo:** 2 horas

#### Tarea 10.2: Agregar onError handlers en mutations

- **Acción:**
  - Crear error toast helper
  - Agregar `onError` a todas las mutations
  - Mensajes de error amigables
- **Tiempo:** 4 horas

#### Tarea 10.3: Fix runtime errors en hooks

- **Archivos:** 10 instancias
- **Acción:**
  - Reemplazar `throw new Error` con conditional `queryFn`
  - Usar `enabled: Boolean(condition)`
- **Tiempo:** 2 horas

#### Tarea 10.4: Optimistic updates

- **Acción:**
  - Implementar optimistic updates para:
    - `useCreateTask`
    - `useUpdateTask`
    - `useDeleteTask`
    - `useArchiveTask`
- **Tiempo:** 2 días

**Entregables Semana 9-10:**

- [ ] Todos los queries con cache configuration
- [ ] Todas las mutations con error handling
- [ ] 0 runtime errors en hooks
- [ ] Optimistic updates en operaciones críticas

---

### Semana 10: packages/stores - Testing Suite

**Prioridad:** ALTA
**Responsable:** 1 Frontend Developer
**Impacto:** Estado global sin pruebas

#### Tarea 11.1: Crear test suite base

- **Acción:**
  - Configurar Vitest para Zustand stores
  - Crear helpers para testing stores
- **Tiempo:** 1 día

#### Tarea 11.2: Tests para stores principales

- **Stores a testear:**
  - `useWorkspaceStore`
  - `useTaskStore`
  - `useTimerStore`
  - `useAuthStore`
- **Meta:** 80%+ coverage
- **Tiempo:** 3 días

**Entregables Semana 10:**

- [ ] Test suite configurado
- [ ] 80%+ coverage en stores
- [ ] Tests para mutations y selectors

---

## ✅ Checkpoint Fase 2 (Fin Semana 10)

**Score esperado:** 80-85/100

**Validaciones:**

```bash
# packages/ui - Accessibility
npm run test:a11y  # Debe pasar

# packages/ui - Dark mode
# Testear visualmente en dark mode

# packages/hooks - React Query
grep -r "staleTime\|gcTime" packages/hooks/src/hooks.ts  # Must have configs

# packages/stores - Testing
npm run test --filter=@ordo-todo/stores  # >80% coverage
```

---

## 📈 Fase 3: MEDIA (2-3 semanas) → 90+/100

### Objetivos

1. JSDoc completo en todos los packages
2. Completar i18n en `packages/i18n`
3. Mejoras menores en `packages/core`
4. Code review final

### Semana 11: JSDoc Documentation

**Prioridad:** MEDIA
**Responsable:** 1-2 Developers
**Impacto:** Developer experience

#### Tarea 12.1: JSDoc en packages/core

- **Archivos:**
  - 52 use cases
  - 14 entidades
  - 10+ repositorios
- **Meta:** 100% de exports públicos con JSDoc
- **Tiempo:** 3 días

#### Tarea 12.2: JSDoc en packages/ui

- **Componentes:**
  - 91+ componentes
  - Todos los props interfaces
- **Tiempo:** 2 días

#### Tarea 12.3: JSDoc en packages/hooks

- **Hooks:**
  - 40+ hooks
  - QueryKeys exports
- **Tiempo:** 1 día

#### Tarea 12.4: JSDoc en packages/stores

- **Stores:**
  - 10+ stores
  - Actions y selectors
- **Tiempo:** 1 día

**Entregables Semana 11:**

- [ ] JSDoc en 100% de exports públicos
- [ ] Generar docs con TypeDoc
- [ ] Publicar en `/docs/packages/api-reference`

---

### Semana 11-12: packages/i18n - Completar traducciones

**Prioridad:** MEDIA
**Responsable:** 1 Developer + Traductor
**Impacto:** Soporte multiidioma

#### Tarea 13.1: Completar traducciones faltantes

- **Estado:** 104 keys faltantes
- **Idiomas:**
  - English (en) - Complete
  - Español (es) - 52 keys faltantes
  - Português (pt-BR) - 52 keys faltantes
- **Tiempo:** 2 días

#### Tarea 13.2: Validar traducciones

- **Acción:**
  - Ejecutar script de validación
  - Revisar por traducciones incorrectas
  - Testear en UI
- **Tiempo:** 1 día

**Entregables Semana 11-12:**

- [ ] 0 keys faltantes
- [ ] Validación automática aprobada
- [ ] Test manual en UI

---

### Semana 12: packages/core - Error Handling Patterns

**Prioridad:** MEDIA
**Responsable:** 1 Senior Developer
**Impacto:** Consistencia de errores

#### Tarea 14.1: Crear excepciones de dominio

- **Acción:**
  - Crear `src/shared/exceptions.ts`
  - Implementar: `DomainException`, `ValidationException`, `ConflictException`, `NotFoundException`
- **Tiempo:** 1 día

#### Tarea 14.2: Reemplazar Error genérico

- **Archivos:** ~80 instancias
- **Acción:**
  - Reemplazar `throw new Error("message")`
  - Usar excepciones tipadas con codes
- **Tiempo:** 2 días

**Entregables Semana 12:**

- [ ] Excepciones de dominio implementadas
- [ ] 0 errores genéricos `throw new Error`
- [ ] Codes de error documentados

---

### Semana 12: packages/ui - Code Duplication

**Prioridad:** MEDIA
**Responsable:** 1 Frontend Developer
**Impacto:** Mantenimiento

#### Tarea 15.1: Extraer patrones comunes

- **Patrones a extraer:**
  - Button patterns repeated
  - Badge styling duplicated
  - Status/priority configs
- **Tiempo:** 1 día

**Entregables Semana 12:**

- [ ] 0 duplicaciones de código
- [ ] Sub-components creados para patrones comunes

---

### Semana 13: Code Review Final + Quality Gates

**Prioridad:** CRÍTICA
**Responsable:** Tech Lead + Senior Developers
**Impacto:** Garantía de calidad

#### Tarea 16.1: Ejecutar quality gates

- **Comandos:**
  ```bash
  npm run lint          # Debe pasar
  npm run check-types   # Debe pasar
  npm run test          # Debe pasar con >80% coverage
  npm run build         # Debe pasar sin errores
  ```
- **Tiempo:** 2 horas

#### Tarea 16.2: Validar score final

- **Criterios:**
  - packages/ui: ≥75/100
  - packages/core: ≥85/100
  - packages/api-client: ≥85/100
  - packages/db: ≥75/100
  - packages/hooks: ≥80/100
  - packages/stores: ≥80/100
  - packages/i18n: ≥80/100
  - packages/styles: ≥70/100
- **Tiempo:** 1 día

#### Tarea 16.3: Documentación final

- **Acción:**
  - Actualizar `README.md` en cada package
  - Crear ejemplos de uso actualizados
  - Documentar breaking changes
- **Tiempo:** 2 días

**Entregables Semana 13:**

- [ ] Quality gates aprobados
- [ ] Score final ≥85/100
- [ ] Documentación completa
- [ ] Breaking changes documentados

---

## ✅ Checkpoint Final (Fin Semana 13)

**Score objetivo:** 85-90/100

**Validaciones finales:**

```bash
# Build
npm run build  # ✅ Sin errores

# Linting
npm run lint  # ✅ Sin warnings/errores

# TypeScript
npm run check-types  # ✅ Sin errores

# Testing
npm run test  # ✅ >80% coverage global

# Platform-agnostic
grep -r "use client\|useState" packages/ui/src/  # 0 resultados

# No any types
grep -r ": any" packages/core/src/ packages/api-client/src/  # 0 resultados

# Documentation
npm run docs:generate  # ✅ Docs completas
```

---

## 📊 Score por Paquete (Objetivos)

| Paquete             | Actual     | Meta Fase 1 | Meta Fase 2 | Meta Final |
| ------------------- | ---------- | ----------- | ----------- | ---------- |
| packages/ui         | 42/100     | 60/100      | 75/100      | 75/100     |
| packages/core       | 65/100     | 75/100      | 85/100      | 90/100     |
| packages/api-client | 72/100     | 80/100      | 90/100      | 90/100     |
| packages/db         | 62/100     | 70/100      | 75/100      | 75/100     |
| packages/hooks      | 62/100     | 75/100      | 85/100      | 85/100     |
| packages/stores     | 58/100     | 65/100      | 75/100      | 80/100     |
| packages/i18n       | 72/100     | 75/100      | 85/100      | 90/100     |
| packages/styles     | 58/100     | 65/100      | 70/100      | 75/100     |
| packages/config     | 72/100     | 75/100      | 80/100      | 85/100     |
| packages/ts-config  | 78/100     | 80/100      | 85/100      | 90/100     |
| packages/eslint     | 75/100     | 80/100      | 85/100      | 90/100     |
| **GLOBAL**          | **61/100** | **72/100**  | **82/100**  | **87/100** |

---

## 📅 Timeline Resumido

| Semana | Fase    | Paquetes             | Tareas Clave                                  |
| ------ | ------- | -------------------- | --------------------------------------------- |
| 1-2    | CRÍTICA | ui                   | Eliminar 'use client' y React hooks           |
| 2-3    | CRÍTICA | core, api-client, db | Eliminar `any`, agregar índices               |
| 3-4    | CRÍTICA | ui                   | Eliminar transparencias/gradients             |
| 4-5    | CRÍTICA | hooks                | Testing suite                                 |
| 5-6    | CRÍTICA | core                 | DRY violations                                |
| 7-8    | ALTA    | ui                   | Accessibility                                 |
| 8-9    | ALTA    | ui                   | Dark mode                                     |
| 9      | ALTA    | ui, hooks            | Responsive design, React Query best practices |
| 10     | ALTA    | stores               | Testing suite                                 |
| 11     | MEDIA   | todos                | JSDoc documentation                           |
| 11-12  | MEDIA   | i18n                 | Completar traducciones                        |
| 12     | MEDIA   | core, ui             | Error handling, code duplication              |
| 13     | FINAL   | todos                | Code review, quality gates                    |

---

## 🎁 Deliverables Finales

### Technical Deliverables

- [ ] 91+ componentes platform-agnostic en `packages/ui`
- [ ] 0 usos de `any` en `packages/core` y `packages/api-client`
- [ ] 6 índices críticos agregados en `packages/db`
- [ ] Test suite con >80% coverage en `packages/hooks` y `packages/stores`
- [ ] Accessibility WCAG 2.1 Level AA compliant
- [ ] Dark mode completo en todos los componentes
- [ ] Responsive design implementado
- [ ] JSDoc completo en todos los packages
- [ ] i18n 100% completado en 3 idiomas

### Documentation Deliverables

- [ ] `docs/packages/PLATFORM-AGNOSTIC-PATTERN.md`
- [ ] `docs/packages/API-REFERENCE.md` (TypeDoc)
- [ ] `docs/packages/BREAKING-CHANGES.md`
- [ ] README.md actualizado en cada package

### Quality Deliverables

- [ ] Score global: 85-90/100
- [ ] Linting: 0 errors, 0 warnings
- [ ] TypeScript: 100% strict mode compliance
- [ ] Tests: >80% coverage global
- [ ] Build: Sin errores

---

## 🔄 Gestión del Proyecto

### Roles y Responsabilidades

| Rol                         | Responsabilidades                                    |
| --------------------------- | ---------------------------------------------------- |
| **Tech Lead**               | Priorizar tareas, code review, validar quality gates |
| **Senior Developers (2-3)** | Refactorización crítica (ui, core), arquitectura     |
| **Frontend Developers (2)** | Accessibility, dark mode, responsive design          |
| **Backend Developer (1)**   | Database indexing, core improvements                 |
| **QA Engineer (1)**         | Testing validation, accessibility testing            |

### Metodología

- **Sprints:** 2 semanas (semana 1-2, 3-4, 5-6, 7-8, 9-10, 11-12, 13)
- **Daily Standups:** 15 minutos por mañana
- **Code Review:** Todo PR requiere mínimo 1 approval de senior dev
- **Quality Gates:** Validar al final de cada fase
- **Retrospectives:** Al final de cada sprint

### Herramientas

- **Project Management:** GitHub Projects / Linear
- **Code Review:** GitHub PRs
- **CI/CD:** GitHub Actions
- **Testing:** Vitest, Playwright
- **Linting:** ESLint, Prettier
- **Type Checking:** TypeScript
- **Accessibility:** axe DevTools, NVDA/VoiceOver

### Métricas de Éxito

**Técnicas:**

- Score global: 85-90/100
- Test coverage: >80%
- Linting: 0 errors, 0 warnings
- TypeScript: 100% strict mode compliance
- Build time: <5 minutos
- Bundle size: Sin incremento significativo

**Business:**

- Velocity: 20-25 story points por sprint
- Lead time: <2 días para PRs pequeños, <1 semana para grandes
- Deployment readiness: Listo para producción al final de Fase 2 (semana 10)

---

## ⚠️ Risks y Mitigations

| Risk                                   | Probabilidad | Impacto | Mitigación                                                   |
| -------------------------------------- | ------------ | ------- | ------------------------------------------------------------ |
| Scope creep en packages/ui             | Alta         | Alto    | Strict scope definition, code reviews                        |
| Regresiones en consuming apps          | Media        | Alto    | Integration tests, gradual rollout                           |
| Tiempo insuficiente para accessibility | Media        | Medio   | Priorizar WCAG Level AA, outsoucing si necesario             |
| Dificultad en dark mode consistency    | Baja         | Medio   | Design system guidelines, visual regression tests            |
| Testing coverage no alcanza 80%        | Media        | Medio   | Focus en paths críticos primero, manual QA para complementar |

---

## 📞 Soporte y Recursos

### Documentación

- [AGENTS.md](../../AGENTS.md) - Build commands y code style guidelines
- [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md) - Resumen de auditoría
- [VIOLACIONES-POR-PAQUETE/](./VIOLACIONES-POR-PAQUETE/) - Detalle de violaciones por paquete

### Scripts Útiles

```bash
# Validar platform-agnostic en packages/ui
npm run validate:ui:platform

# Validar no any types
npm run validate:no-any

# Validar accessibility
npm run validate:a11y

# Validar dark mode
npm run validate:dark-mode

# Ejecutar todos los quality gates
npm run validate:all
```

---

**Última actualización:** 31 de Diciembre 2025
**Próxima revisión:** Al finalizar Fase 1 (Semana 6)
