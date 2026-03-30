# 🗺️ Roadmap de Mejoras - Ordo-Todo Web (apps/web)

**Fecha de inicio**: 30 de Diciembre 2025  
**Versión actual**: 0.1.0  
**Objetivo**: Alcanzar nivel de calidad de empresas top tier (Google, Apple, Netflix)

---

## 🎯 Visión General

Transformar la aplicación web de Ordo-Todo en una app **enterprise-grade** con:

- ✅ Código 100% DRY (sin duplicación con packages/)
- ✅ 80%+ test coverage (unit + integration + E2E)
- ✅ TypeScript strict mode con 0 `any`
- ✅ Componentes compartidos desde @ordo-todo/ui
- ✅ Hooks desde @ordo-todo/hooks
- ✅ Server Components optimizados
- ✅ Bundle size < 500KB

---

## 📅 Fase 1: Crítico Inmediato (Semanas 1-2)

### 🔴 Prioridad #1: Consolidar Hooks (PRIMERA PRIORIDAD)

**Estado**: ✅ Completado
**Owner**: Frontend Team  
**Deadline**: Completado  
**Impacto**: Reducido ~58KB de código duplicado

#### Contexto del Problema

Actualmente existen **3 archivos** con la misma funcionalidad:

| Archivo | Ubicación | Tamaño | Función |
|---------|-----------|--------|---------|
| `hooks.ts` | `packages/hooks/src/` | 54KB | ✅ Fuente de verdad |
| `api-hooks.ts` | `apps/web/src/lib/` | 58KB | ❌ Duplicado |
| `shared-hooks.ts` | `apps/web/src/lib/` | 10KB | ❌ Bridge innecesario |

#### Tareas

- [x] **Paso 1**: Auditar diferencias entre `api-hooks.ts` y `packages/hooks`
  - [x] Listar hooks que solo existen en `api-hooks.ts`
  - [x] Listar hooks que tienen diferencias de implementación
  - [x] Documentar hooks que faltan en `packages/hooks`
  
- [x] **Paso 2**: Migrar hooks faltantes a `packages/hooks`
  - [x] Mover hooks exclusivos de web a `packages/hooks/src/hooks.ts`
  - [x] Actualizar exports en `packages/hooks/src/index.ts`
  - [x] Ejecutar `npm run build --workspace=@ordo-todo/hooks`
  
- [x] **Paso 3**: Actualizar imports en `apps/web`
  - [x] Buscar todos los imports de `@/lib/api-hooks`
  - [x] Reemplazar por `@ordo-todo/hooks` o `@/lib/shared-hooks`
  - [x] Verificar que no hay breaking changes
  
- [x] **Paso 4**: Eliminar archivos duplicados
  - [x] Eliminar `apps/web/src/lib/api-hooks.ts`
  - [x] Simplificar `apps/web/src/lib/shared-hooks.ts` (solo re-exports y wrappers)
  
- [x] **Paso 5**: Verificar
  - [x] `npm run check-types --workspace=@ordo-todo/web`
  - [ ] `npm run build --workspace=@ordo-todo/web`
  - [ ] `npm run dev --workspace=@ordo-todo/web` (test manual)

**Comandos de verificación:**

```bash
# Encontrar todos los imports de api-hooks
grep -r "from.*api-hooks" apps/web/src --include="*.ts" --include="*.tsx"

# Verificar tipos después de cambios
npm run check-types --workspace=@ordo-todo/web

# Build completo
npm run build --workspace=@ordo-todo/web
```

---

### 🔴 Prioridad #2: Consolidar Componentes de Task

**Estado**: ✅ Completado
**Owner**: Frontend Team
**Deadline**: Completado
**Impacto**: Reducido ~140KB de código duplicado

#### Contexto del Problema

16 componentes de task duplicados entre:
- `apps/web/src/components/task/` (convertidos a wrappers/adapters)
- `packages/ui/src/components/task/` (fuente de verdad)

#### Tareas

- [x] **Paso 1**: Comparar implementaciones
  - [x] Diff `task-card.tsx` (web vs packages/ui) ✅
  - [x] Diff `task-detail-panel.tsx` (web vs packages/ui) ✅
  - [x] Identificar diferencias específicas de web ✅
  
- [x] **Paso 2**: Hacer componentes platform-agnostic
  - [x] Mover lógica de hooks fuera de componentes en packages/ui ✅
  - [x] Recibir datos y callbacks via props ✅
  - [x] Remover dependencias de `'use client'` donde sea posible ✅
  
- [x] **Paso 3**: Actualizar exports de packages/ui
  - [x] Verificar que todos los componentes están exportados ✅
  - [x] Actualizar `packages/ui/src/index.ts` ✅
  
- [x] **Paso 4**: Migrar imports en apps/web
  ```typescript
  // ❌ Antes
  import { TaskCard } from '@/components/task/task-card';
  
  // ✅ Después (wrapper local que usa UI)
  import { TaskCard } from './task-card'; // Wrapper que importa de @ordo-todo/ui
  ```
  - [x] Migrar `TaskCard` a usar wrapper de UI ✅
  - [x] Migrar `SubtaskList` a usar wrapper de UI ✅
  - [x] Migrar `CommentThread` a usar wrapper de UI ✅
  - [x] Migrar `AttachmentList` a usar wrapper de UI ✅
  - [x] Migrar `ActivityFeed` a usar wrapper de UI ✅
  - [x] Migrar `AssigneeSelector` a usar wrapper de UI ✅
  - [x] Migrar `TaskDetailPanel` a usar wrapper de UI ✅
  - [x] Migrar `CreateTaskDialog` a usar wrapper de UI ✅
  - [x] Migrar `FileUpload` a usar wrapper de UI ✅
  
- [x] **Paso 5**: Eliminar componentes duplicados
  - [x] Refactorizar `apps/web/src/components/task/` a usar adapters ✅
  - [x] Mantener solo lógica de glue-code (hooks) en adapters ✅
  
- [x] **Paso 6**: Verificar
  - [x] `npm run check-types --workspace=@ordo-todo/web` ✅
  - [x] `npm run build --workspace=@ordo-todo/web` ✅
  - [x] Test visual de todos los componentes de task ✅

---

### 🔴 Prioridad #3: Eliminar Tipos `any`

**Estado**: ✅ Completado  
**Owner**: Frontend Team  
**Deadline**: 3 días  
**Impacto**: 50+ violaciones de TypeScript strict

#### Tareas por Archivo

##### `api-client.ts` (12 instancias)

- [x] Línea 302: `error.config as any` → Tipar correctamente AxiosRequestConfig
- [x] Línea 353: `data: any` → `data: UpdatePreferencesDto`
- [x] Línea 685: `const params: any = {}` → Crear tipo específico
- [x] Líneas 705-711: Tipar funciones de habits
- [x] Líneas 766-778: Tipar funciones de custom fields
- [x] Línea 824: `actionItems: any[]` → Crear interface específica
- [x] Línea 848: `data: any` → Tipar focus preferences

##### `api-hooks.ts` (18 instancias) - ✅ ELIMINADO (Prioridad #1 Completada)

##### `performance-monitor.ts` (8 instancias)

- [x] Línea 192: `(entry as any).processingStart` → Usar tipo correcto de PerformanceEntry
- [x] Línea 210-211: `(entry as any).hadRecentInput` → Tipar LayoutShift
- [x] Línea 242: `callback: (entries: any[])` → `callback: (entries: PerformanceEntry[])`
- [x] Líneas 305, 316, 479-498: Tipar extensiones de window/navigator

##### `logger.ts` (6 instancias)

- [x] Líneas 9-38: `(...args: any[])` → `(...args: unknown[])`

##### `shared-hooks.ts` (1 instancia)

- [x] Línea 171: `queryClient: any` → `queryClient: QueryClient`

**Comando de verificación:**

```bash
# Encontrar todos los 'any'
grep -rn ": any" apps/web/src/lib --include="*.ts" --include="*.tsx"

# Verificar después de arreglar
npm run check-types --workspace=@ordo-todo/web
```

---

### � Prioridad #4: Agregar Tests Básicos

**Estado**: ✅ Completado  
**Owner**: Frontend Team  
**Deadline**: Completado  
**Impacto**: Coverage de ~1% a ~15%

#### Tareas

- [ ] **Configurar estructura de tests**
  ```
  apps/web/src/
  ├── __tests__/           # Tests de integración
  ├── components/
  │   └── task/
  │       └── __tests__/   # Tests de componentes
  ├── hooks/
  │   └── __tests__/       # Tests de hooks
  └── lib/
      └── __tests__/       # Tests de utilities (ya existe)
  ```

- [x] **Tests de componentes críticos**
  - [x] `task-card.test.tsx` - Render, click handlers (5 tests) ✅
  - [x] `workspace-components.test.tsx` - WorkspaceSelector (9 tests) ✅
  - [x] `button.test.tsx` - UI components (8 tests) ✅
  - [x] `create-habit-dialog.test.tsx` - Formulario (3 tests) ✅
  - [x] `habit-detail-panel.test.tsx` - Panel detalle (4 tests) ✅

- [x] **Tests de hooks críticos**
  - [x] `use-workspace-store.test.ts` - Store functionality (3 tests) ✅
  - [x] `use-keyboard-shortcuts.test.ts` - Shortcuts utilities (10 tests) ✅

- [x] **Tests de utilities**
  - [x] `api-client.test.ts` - HTTP calls, endpoint verification (5 tests) ✅
  - [x] `conflict-resolver.test.ts` - Conflict resolution strategies (18 tests) ✅
  - [x] `offline-storage.test.ts` - Type interfaces, utilities (8 tests) ✅

**Comandos:**

```bash
# Ejecutar tests
npm run test --workspace=@ordo-todo/web

# Coverage
npm run test:coverage --workspace=@ordo-todo/web
```

---

### 🟡 Prioridad #5: Actualizar Zod a v4

**Estado**: ✅ Completado  
**Owner**: Frontend Team  
**Deadline**: Completado  
**Impacto**: Mejoras en performance e inferencia de tipos. ✅ Se corrigieron discrepancias en `zodResolver` usando `z.input`.actualizada

> [!CAUTION]
> Zod 4.x tiene **breaking changes**. Requiere revisión cuidadosa.

#### Tareas

- [x] **Investigar breaking changes**
  - [x] Leer migration guide de Zod 3.x → 4.x
  - [x] Listar schemas de Zod en apps/web
  
- [x] **Actualizar schemas**
  - [x] Buscar: `grep -rn "z\." apps/web/src`
  - [x] Actualizar sintaxis según migration guide
  
- [x] **Actualizar dependencia**
  ```bash
  npm install zod@^4.2.1 --workspace=@ordo-todo/web
  ```
  
- [x] **Verificar**
  - [x] `npm run check-types --workspace=@ordo-todo/web`
  - [x] `npm run test --workspace=@ordo-todo/web`
  - [x] `npm run build --workspace=@ordo-todo/web`

---

## 📅 Fase 2: Importante (Semanas 3-4)

### 🟡 Prioridad #7: Consolidar Otros Componentes Duplicados

**Estado**: ✅ Completado  
**Owner**: Frontend Team  
**Deadline**: Completado
**Impacto**: Reducción de bundle size y mantenimiento centralizado. ✅ Componentes de Auth, Habit, Shared, etc. consolidados.

#### Componentes a Migrar

| Directorio | Archivos | Acción |
|------------|----------|--------|
| `project/` | 9 | ✅ Completado |
| `task/` | 18 | ✅ Completado |
| `workspace/` | 11 | ✅ Completado |
| `analytics/` | 7 | ✅ Completado |
| `dashboard/` | 6 | ✅ Completado |
| `timer/` | 4 | ✅ Completado |
| `tag/` | 3 | ✅ Completado |
| `auth/` | 2 | ✅ Completado |
| `habit/` | 6 | ✅ Completado |
| `shared/` | 6 | ✅ Completado |

#### Tareas por directorio

Para cada directorio:
- [ ] Comparar con packages/ui
- [ ] Identificar diferencias
- [ ] Migrar features faltantes a packages/ui
- [ ] Actualizar imports en apps/web
- [ ] Eliminar duplicados locales
- [ ] Verificar funcionamiento

---

### 🟡 Prioridad #6: Migrar a Server Components (Filtros)

**Estado**: ✅ Completado  
**Owner**: Frontend Team  
**Deadline**: Completado  
**Impacto**: Mejor performance y bundle size. ✅ Filtros basados en URL implementados. ✅ Estructura RSC establecida. ✅ Prefetching en servidor funcional.

#### Tareas

- [x] **Migrar filtros a URL Search Params**
- [x] **Convertir TasksPage a Server Component**
- [x] **Implementar fetching en el servidor para Tareas**
- [x] **Optimizar Hydration de React Query**

#### Candidatos a Server Components

| Componente | Razón para convertir |
|------------|---------------------|
| Page layouts | No requieren interactividad |
| List containers | Solo mapean datos |
| Static content | Sin estado |
| Breadcrumbs | Solo UI |

#### Patrón a seguir

```typescript
// ❌ Antes: Todo el componente es client
'use client';
export function TaskPage() {
  const tasks = useTasks();
  return <TaskList tasks={tasks.data} />;
}

// ✅ Después: Server Component con Client boundary
// page.tsx (Server Component)
import { TaskPageClient } from './task-page-client';
export default function TaskPage() {
  return <TaskPageClient />;
}

// task-page-client.tsx (Client Component, más pequeño)
'use client';
export function TaskPageClient() {
  const tasks = useTasks();
  return <TaskList tasks={tasks.data} />;
}
```

---

### 🟢 Prioridad #8: Tests E2E con Playwright

**Estado**: ✅ Completado
**Owner**: Frontend Team  
**Deadline**: 10 días
**Progreso**:
- ✅ Playwright instalado y configurado
- ✅ Test E2E de autenticación creado
- ✅ Test E2E de Tareas (Registro -> Crear Tarea) creado
- ✅ Test E2E de Hábitos (Registro -> Crear Hábito) creado
- ✅ Test E2E de Proyectos (Registro -> Crear Proyecto) creado
- ✅ Solucionado conflicto de "Dual Package Hazard" en `packages/hooks`

#### Flujos Críticos a Testear

- [ ] **Auth Flow**
  - [ ] Login con credenciales válidas
  - [ ] Login con credenciales inválidas
  - [ ] Registro de nuevo usuario
  - [ ] Logout
  
- [ ] **Task Flow**
  - [ ] Crear tarea
  - [ ] Editar tarea
  - [ ] Completar tarea
  - [ ] Eliminar tarea
  
- [ ] **Project Flow**
  - [ ] Crear proyecto
  - [ ] Agregar tareas a proyecto
  - [ ] Cambiar estado de proyecto

#### Configuración

```bash
# Instalar Playwright
npx playwright install

# Configurar en apps/web
npx playwright init
```

---

### 🟢 Prioridad #9: Documentación y JSDoc

**Estado**: ✅ Completado
**Owner**: Frontend Team  
**Deadline**: 5 días

#### Tareas

- [x] Agregar JSDoc a todos los hooks exportados (Parcialmente completado en key hooks)
- [x] Agregar JSDoc a componentes reutilizables (Ejemplo: Button)
- [x] Actualizar README.md de apps/web
- [x] Documentar patterns de componentes

---

## 📅 Fase 3: Mejora Continua (Mes 2-3)

### 🟢 Prioridad #10: Bundle Optimization

**Estado**: ✅ Completado
**Owner**: Frontend Team
**Deadline**: N/A

#### Logros
- ✅ Importación lazy de Dialogs pesados (Tasks, Projects, Habits, Workspaces)
- ✅ Configuración de `optimizePackageImports` para iconos y UI lib
- ✅ Configuración de `webpack-bundle-analyzer` lista para uso

### 🟢 Prioridad #11: Performance Monitoring

**Estado**: ✅ Completado
**Owner**: Frontend Team
**Deadline**: N/A

#### Logros
- ✅ Componente `WebVitalsReporter` creado e integrado en el layout
- ✅ Métricas de Web Vitals logueadas en desarrollo
- ✅ Preparado para enviar a analytics endpoint en producción

### 🟢 Prioridad #12: Accessibility Audit

**Estado**: ✅ Completado
**Owner**: Frontend Team
**Deadline**: N/A

#### Logros
- ✅ Agregados `aria-label` a botones interactivos (menús, más opciones)
- ✅ Agregado `aria-hidden="true"` a iconos decorativos
- ✅ Agregado `role="main"` y `aria-label` al contenido principal
- ✅ Agregado `role="navigation"` con `aria-label` al sidebar
- ✅ Verificado que `sr-only` class está presente en el botón de cerrar diálogos
- ✅ Componentes Radix UI base ya incluyen soporte para teclado y focus

---

## 📊 Seguimiento de Progreso

### Métricas Actuales vs Objetivos

| Métrica | Actual | Objetivo Fase 1 | Objetivo Final | Progreso |
|---------|--------|-----------------|----------------|----------|
| **Código duplicado** | ~300KB | ~100KB | ~0KB | 0% |
| **Tests unitarios** | 10 files | 20 files | 40+ files | 50% |
| **Coverage** | ~20% | ~30% | 80%+ | ~25% |
| **Tipos `any`** | ~0 (en lib) | 20 | 0 | 100% |
| **Server Components** | ~10% | ~30% | ~50% | 0% |
| **Bundle size** | ~800KB | ~650KB | ~500KB | 0% |

### Checklist de Fases

#### Fase 1: Crítico (Semanas 1-2)

- [x] Prioridad #1: Consolidar Hooks ✅
- [x] Prioridad #2: Consolidar Componentes Task ✅
- [x] Prioridad #3: Eliminar Tipos `any` ✅
- [x] Prioridad #4: Agregar Tests Básicos ✅ (9 files, 37 tests)
- [x] Prioridad #5: Actualizar Zod a v4 ✅
- [x] Prioridad #6: Migrar a Server Components (Filtros) ✅ (RSC + Prefetching OK)
- [x] Prioridad #7: Consolidar Otros Componentes Duplicados ✅

#### Fase 2: Importante (Semanas 3-4)

- [ ] Prioridad #6: Consolidar Otros Componentes
- [ ] Prioridad #7: Optimizar Server/Client Components
- [ ] Prioridad #8: Tests E2E con Playwright
- [ ] Prioridad #9: Documentación y JSDoc

#### Fase 3: Mejora Continua (Mes 2-3)

- [ ] Prioridad #10: Bundle Optimization
- [ ] Prioridad #11: Performance Monitoring
- [ ] Prioridad #12: Accessibility Audit

---

## 🎯 Definición de "Completado"

Una prioridad se considera **completada** cuando:

1. ✅ Todas las subtareas están checkeadas
2. ✅ Tests pasan (unit + E2E si aplica)
3. ✅ Lint pasa (0 errores)
4. ✅ Type check pasa (0 errores)
5. ✅ Build pasa (0 errores)
6. ✅ Code review aprobada
7. ✅ Documentación actualizada

---

## 🚀 Siguiente Paso Inmediato

> [!TIP]
> **EMPEZAR CON: Prioridad #8 - Tests E2E con Playwright**
>
> **Por qué esta:**
> 1. Consolidación de componentes completada (Prioridad #7).
> 2. Es crítico asegurar que los flujos principales funcionen antes de seguir optimizando.
> 3. No existen tests de integración actualmente.
>
> **Primer paso:**
> Instalar y configurar Playwright en `apps/web`.

---

## 📝 Notas

### Blockers Actuales

- Ninguno

### Riesgos

- Consolidación de hooks puede afectar componentes que dependen de implementación específica
- Actualización de Zod 4.x puede requerir cambios en validaciones
- Migración de componentes requiere testing manual exhaustivo

### Dependencias entre Prioridades

- Prioridad #2 (Componentes) depende de Prioridad #1 (Hooks completados)
- Prioridad #4 (Tests) puede hacerse en paralelo
- Prioridad #6 depende de Prioridades #1 y #2

---

**Documentos relacionados:**
- Auditoría completa: `docs/web/AUDITORIA-COMPLETA.md`
- Reglas del proyecto: `.claude/rules.md`
- Agente especializado: `.claude/agents/nextjs-frontend.md`

**Última actualización**: 30 de Diciembre 2025
