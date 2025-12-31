# 📦 Plan de Acción Detallado

**Objetivo:** Llevar los paquetes de 61/100 a 99/100 en 5-7.5 meses

---

## 📊 Proyección de Mejoras

| Fase                | Score       | Mejora | Tiempo       | Prioridad   |
| ------------------- | ----------- | ------ | ------------ | ----------- |
| Actual              | **61/100**  | -      | -            | -           |
| Fase 1              | **75/100**  | +14    | 4-6 semanas  | **CRÍTICA** |
| Fase 2              | **88/100**  | +13    | 3-4 semanas  | **ALTA**    |
| Fase 3              | **96/100**  | +8     | 5-8 semanas  | **MEDIA**   |
| Fase 4              | **99/100**  | +3     | 8-12 semanas | **BAJA**    |
| **Meta Producción** | **85+/100** | +24    | 7-10 semanas | **MÍNIMA**  |

---

## 🚀 FASE 1: CRÍTICO (Semanas 1-6)

### Objetivo: 75/100

**Enfoque:** Resolver problemas arquitectónicos y de seguridad críticos

---

### Tarea 1: packages/ui - Refactorización Arquitectónica (3-4 semanas)

**Responsable:** Equipo UI (2-3 senior developers)

**Problema:**

- Componentes NO son platform-agnostic
- Usan hooks (useState, useEffect, useMemo)
- Tienen `'use client'` en TODOS los componentes
- No pueden reutilizarse en mobile/desktop

**Solución:**

#### Semana 1-2: Planificación y Pilotos

- [ ] Auditar todos los componentes de packages/ui (113 archivos)
- [ ] Identificar componentes más críticos (top 20 por uso)
- [ ] Crear guía de arquitectura platform-agnostic
- [ ] Refactorizar 5 componentes piloto:
  - Button (components/ui/button.tsx)
  - Card (components/ui/card.tsx)
  - Input (components/ui/input.tsx)
  - TaskCard (components/task/task-card.tsx)
  - WorkspaceCard (components/workspace/workspace-card.tsx)

**Reglas de refactorización:**

1. Eliminar `'use client'` directive
2. Eliminar TODOS los hooks (useState, useEffect, useMemo, useCallback)
3. Toda data recibida vía props
4. Todos los callbacks recibidos vía props
5. Mover state management a consuming apps via hooks/stores
6. Eliminar `createPortal` usage
7. Componentes deben ser puros y presentacionales

**Ejemplo de refactorización:**

```typescript
// ❌ ANTES (viola Rule 19)
"use client"

import { useState } from 'react';

export function TaskCard({ task }: { task: Task }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {task.title}
      </button>
      {isExpanded && <p>{task.description}</p>}
    </div>
  );
}

// ✅ DESPUÉS (cumple Rule 19)
export interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: (taskId: string) => void;
  labels?: {
    expand?: string;
    collapse?: string;
  };
}

export function TaskCard({ task, isExpanded, onToggleExpand, labels }: TaskCardProps) {
  return (
    <div>
      <button
        onClick={() => onToggleExpand(task.id)}
        aria-label={isExpanded ? labels?.collapse : labels?.expand}
      >
        {task.title}
      </button>
      {isExpanded && <p>{task.description}</p>}
    </div>
  );
}
```

#### Semana 3-4: Refactorización Masiva

- [ ] Refactorizar 30 componentes de dominio (task, project, workspace)
- [ ] Refactorizar 25 componentes base (ui)
- [ ] Refactorizar 20 componentes restantes
- [ ] Code reviews cruzados por dominio
- [ ] Testing manual de componentes refactorizados

#### Semana 5-6: Validación y Limpieza

- [ ] Validar que NO hay hooks en ningún componente
- [ ] Validar que NO hay `'use client'` directives
- [ ] Validar que NO hay imports de platform-specific libs
- [ ] Actualizar documentación de componentes
- [ ] Demo al equipo completo

**Entregables:**

- ✅ 113 componentes refactorizados (platform-agnostic)
- ✅ Zero hooks en packages/ui
- ✅ Zero `'use client'` directives
- ✅ Guía de arquitectura documentada
- ✅ Ejemplos de uso para consuming apps

**Metrica de éxito:**

- Packages/ui score: 42/100 → 65/100 (+23 puntos)

---

### Tarea 2: packages/ui - Eliminar Transparencias (2 semanas)

**Responsable:** Equipo UI (2 developers)

**Problema:**

- 100+ instancias de transparencias (Rule 13 violada)
- `bg-transparent`, `opacity-*`, `/XX` modifiers
- Gradientes en decoraciones

**Solución:**

#### Semana 1: Análisis y Reemplazo

- [ ] Crear paleta de colores sólidos para reemplazar transparencias
- [ ] Mapear cada transparencia a color sólido equivalente
- [ ] Reemplazar 70% de transparencias en componentes base

**Paleta de reemplazo:**

```typescript
// Crear: packages/ui/src/constants/colors.ts

export const SOLID_VARIANTS = {
  // Reemplazos para bg-transparent
  transparentToWhite: "#ffffff",
  transparentToMuted: "#f4f4f5",
  transparentToBorder: "#e4e4e7",

  // Reemplazos para /10, /20, /30, /50 modifiers
  primary10: "#e0f2fe",
  primary20: "#bae6fd",
  primary30: "#7dd3fc",
  primary50: "#38bdf8",

  // Reemplazos para opacity-50, etc.
  disabledText: "#9ca3af",
  disabledBackground: "#f3f4f6",

  // ... mapeo completo
};
```

#### Semana 2: Validación y Resto

- [ ] Reemplazar 30% restante de transparencias
- [ ] Validar consistencia visual en light/dark mode
- [ ] Eliminar gradientes y blur-3xl
- [ ] Reemplazar opacity animations con transform animations

**Ejemplo de reemplazo:**

```css
/* ❌ ANTES */
.btn {
  background-color: rgba(59, 130, 246, 0.9);
  opacity: 0.5;
  transition: opacity 0.2s;
}

/* ✅ DESPUÉS */
.btn {
  background-color: #3b82f6;
  color: #ffffff;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.btn:disabled {
  background-color: #d1d5db;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

**Entregables:**

- ✅ Zero `bg-transparent` classes
- ✅ Zero `opacity-*` classes (except disabled states)
- ✅ Zero `/XX` modifiers
- ✅ Zero gradient definitions
- ✅ Paleta de colores sólidos documentada
- ✅ Visual consistency validated

**Metrica de éxito:**

- Packages/ui score: 65/100 → 72/100 (+7 puntos)

---

### Tarea 3: Eliminar tipos `any` en packages/core (1 semana)

**Responsable:** Equipo Core/Backend (1 developer)

**Problema:**

- 14 usos de tipo `any` en dominio (Rule 4 violada)
- En entidades, repositorios, use cases
- Pérdida de type safety

**Solución:**

**Lista de archivos con `any` types:**

```
src/shared/entity.ts (2 usos)
src/shared/use-case.ts (1 uso)
src/shared/value-object.ts (1 uso)
src/tasks/model/task.entity.ts (1 uso)
src/habits/provider/habit.repository.ts (6 usos)
src/tasks/usecase/get-deleted-tasks.usecase.ts (1 uso)
src/projects/usecase/get-deleted-projects.usecase.ts (1 uso)
src/ai/ai-service.ts (2 usos)
src/ai/usecase/generate-weekly-report.usecase.ts (1 uso)
```

**Semana 1:**

1. **Crear tipos faltantes:**

   ```typescript
   // Crear: src/shared/types/user-context.ts
   export interface LoggedUser {
     id: string;
     email: string;
     username: string;
     role: UserRole;
     timezone: string;
   }

   // Crear: src/habits/model/habit.entity.ts
   export class Habit extends Entity<HabitProps> {
     // Implementar entidad completa
   }
   ```

2. **Reemplazar `any` en entities:**

   ```typescript
   // ❌ ANTES
   export class Task extends Entity<TaskProps> {
     tags?: any[];
   }

   // ✅ DESPUÉS
   export class Task extends Entity<TaskProps> {
     tags?: TagId[]; // o tags?: Tag[] (evitar circular deps)
   }
   ```

3. **Reemplazar `any` en repositories:**

   ```typescript
   // ❌ ANTES
   export interface IHabitRepository {
     create(habit: any): Promise<any>;
     findAll(): Promise<any[]>;
   }

   // ✅ DESPUÉS
   export interface IHabitRepository {
     create(habit: Habit): Promise<Habit>;
     findAll(): Promise<Habit[]>;
   }
   ```

4. **Reemplazar `any` en use cases:**

   ```typescript
   // ❌ ANTES
   export class GetDeletedTasksUseCase implements UseCase<void, any[]> {
     async execute(loggedUser?: any): Promise<any[]> {
     }

   // ✅ DESPUÉS
   export class GetDeletedTasksUseCase implements UseCase<void, Task[]> {
     async execute(loggedUser?: LoggedUser): Promise<Task[]> {
   ```

**Entregables:**

- ✅ Zero tipos `any` en packages/core
- ✅ Typed LoggedUser context
- ✅ Habit entity completamente tipada
- ✅ Todos los repositories tipados
- ✅ Todos los use cases tipados

**Metrica de éxito:**

- Packages/core score: 65/100 → 75/100 (+10 puntos)

---

### Tarea 4: Eliminar tipos `any` en packages/api-client (1 semana)

**Responsable:** Equipo Core/Backend (1 developer)

**Problema:**

- 16 usos de tipo `any` en API client (Rule 4 violada)
- En endpoints, types
- Falta de type safety en HTTP layer

**Solución:**

**Lista de archivos con `any` types:**

```
src/client.ts (12 usos)
src/types/chat.types.ts (4 usos)
```

**Semana 1:**

1. **Crear tipos faltantes para wellbeing/burnout:**

   ```typescript
   // Crear: src/types/wellbeing.types.ts
   export interface BurnoutAnalysis {
     riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
     riskFactors: string[];
     metrics: {
       avgDailyFocusTime: number;
       avgDailyBreakTime: number;
       consecutiveWorkingDays: number;
       weekendWorkFrequency: number;
     };
     recommendations: string[];
   }

   export interface WorkPatterns {
     peakHours: number[];
     peakDays: number[];
     avgSessionDuration: number;
     mostProductiveTime: string;
   }

   export interface WeeklyWellbeingSummary {
     score: number;
     trend: "IMPROVING" | "STABLE" | "DECLINING";
     focusTime: number;
     breakTime: number;
     tasksCompleted: number;
     stressLevel: number;
   }

   export interface BurnoutIntervention {
     needsIntervention: boolean;
     severity: "MILD" | "MODERATE" | "SEVERE";
     suggestedActions: string[];
     immediateBreakNeeded: boolean;
   }
   ```

2. **Crear tipos faltantes para workload:**

   ```typescript
   // Crear: src/types/workload.types.ts
   export interface WorkspaceWorkload {
     workspaceId: string;
     workspaceName: string;
     totalTasks: number;
     totalHours: number;
     averagePerMember: number;
     distribution: MemberWorkload[];
   }

   export interface MemberWorkload {
     userId: string;
     userName: string;
     tasksAssigned: number;
     hoursEstimated: number;
     hoursCompleted: number;
     overdueTasks: number;
     upcomingDeadlines: number[];
   }

   export interface WorkloadSuggestion {
     type: "REDISTRIBUTE" | "DEADLINE_EXTENSION" | "ASSIGN_MORE";
     fromUserId?: string;
     toUserId?: string;
     taskId?: string;
     reason: string;
   }
   ```

3. **Reemplazar `any` en client.ts:**

   ```typescript
   // ❌ ANTES
   async getTasks(params?: any): Promise<Task[]> {
     const queryParams: any = {};
     // ...
   }

   // ✅ DESPUÉS
   async getTasks(params?: GetTasksParams): Promise<Task[]> {
     const queryParams: GetTasksParams = { ... };
     // ...
   }
   ```

4. **Fix chat.types.ts:**

   ```typescript
   // ❌ ANTES
   export interface ChatMessageResponse {
     metadata: {
       actions?: { data?: any; result?: any }[];
     };
   }

   // ✅ DESPUÉS
   export interface ChatAction {
     type: string;
     data?: Record<string, unknown>;
     result?: Record<string, unknown>;
   }

   export interface ChatMessageResponse {
     metadata: {
       actions?: ChatAction[];
     };
   }
   ```

**Entregables:**

- ✅ Zero tipos `any` en packages/api-client
- ✅ wellbeing.types.ts creado con 5 tipos
- ✅ workload.types.ts creado con 4 tipos
- ✅ ChatAction tipado correctamente
- ✅ Query params tipados en client.ts

**Metrica de éxito:**

- Packages/api-client score: 72/100 → 82/100 (+10 puntos)

---

### Tarea 5: packages/db - Agregar Índices Críticos (2 días)

**Responsable:** Equipo DB (1 developer)

**Problema:**

- 6 foreign keys sin índices (CRITICAS para performance)
- Consultas lentas en producción

**Solución:**

**Día 1: Análisis y Creación de Schema**

- [ ] Identificar 6 foreign keys sin índices:
  1. `WorkspaceInvitation.invitedById`
  2. `WorkspaceAuditLog.actorId`
  3. `Habit.workspaceId`
  4. `Objective.workspaceId`
  5. `BlogComment.userId`
  6. `BlogComment.postId`

- [ ] Agregar índices en schema.prisma:

  ```prisma
  // WorkspaceInvitation
  @@index([invitedById])

  // WorkspaceAuditLog
  @@index([actorId])

  // Habit
  @@index([workspaceId])

  // Objective
  @@index([workspaceId])

  // BlogComment
  @@index([userId])
  @@index([postId])
  ```

- [ ] Agregar índice compuesto en Notification:
  ```prisma
  // Notification
  @@index([userId, isRead, createdAt DESC])
  ```

**Día 2: Migración y Validación**

- [ ] Crear migración: `npx prisma migrate dev --name add-critical-indexes`
- [ ] Validar índices creados: `npx prisma db pull`
- [ ] Test performance de queries críticas:
  - `db.workspaceInvitation.findMany({ where: { invitedById } })`
  - `db.workspaceAuditLog.findMany({ where: { actorId } })`
  - `db.notification.findMany({ where: { userId, isRead }, orderBy: { createdAt: 'desc' } })`
- [ ] Documentar mejoras de performance

**Entregables:**

- ✅ 6 índices en foreign keys
- ✅ 1 índice compuesto en Notification
- ✅ Migración creada y validada
- ✅ Performance tests mostrando mejoras
- ✅ Documentación de cambios

**Metrica de éxito:**

- Packages/db score: 62/100 → 70/100 (+8 puntos)

---

## 📊 Resumen de Fase 1

| Tarea                               | Tiempo  | Responsables    | Score Impact | Prioridad |
| ----------------------------------- | ------- | --------------- | ------------ | --------- |
| 1. packages/ui - Refactorización    | 3-4 sem | 2-3 senior devs | +15          | CRÍTICA   |
| 2. packages/ui - Sin Transparencias | 2 sem   | 2 devs          | +7           | CRÍTICA   |
| 3. packages/core - Sin `any`        | 1 sem   | 1 dev           | +10          | CRÍTICA   |
| 4. packages/api-client - Sin `any`  | 1 sem   | 1 dev           | +10          | CRÍTICA   |
| 5. packages/db - Índices Críticos   | 2 días  | 1 dev           | +8           | CRÍTICA   |

**Total Fase 1:**

- **Tiempo:** 4-6 semanas
- **Equipo:** 2-3 devs full-time
- **Score:** 61/100 → **75/100** (+14 puntos)

---

## ✅ Checklist Final de Fase 1

Antes de declarar Fase 1 completa, verificar:

- [ ] **packages/ui**:
  - [ ] Zero `'use client'` directives
  - [ ] Zero hooks (useState, useEffect, useMemo, etc.)
  - [ ] Zero `createPortal` usage
  - [ ] Zero `bg-transparent` classes
  - [ ] Zero `opacity-*` classes (except disabled)
  - [ ] Zero `/XX` modifiers
  - [ ] Zero gradient definitions
  - [ ] All components accept data via props
  - [ ] All components accept callbacks via props
  - [ ] All components documented with JSDoc

- [ ] **packages/core**:
  - [ ] Zero `any` types (grep -r "any" src/)
  - [ ] All entities fully typed
  - [ ] All repositories fully typed
  - [ ] All use cases fully typed
  - [ ] Habit entity implemented

- [ ] **packages/api-client**:
  - [ ] Zero `any` types (grep -r "any" src/)
  - [ ] wellbeing.types.ts created
  - [ ] workload.types.ts created
  - [ ] ChatAction properly typed
  - [ ] All query params typed

- [ ] **packages/db**:
  - [ ] All foreign keys have indexes
  - [ ] Notification has composite index
  - [ ] Migration created and tested
  - [ ] Performance validated
  - [ ] Schema has `///` documentation

- [ ] **Quality Gates**:
  - [ ] `npm run lint` passes (0 errors, 0 warnings)
  - [ ] `npm run check-types` passes (0 errors)
  - [ ] `npm run build` succeeds
  - [ ] Visual regression tests pass (light/dark mode)

---

## 📅 Próximos Pasos: Fase 2

Ver documentación de Fase 2 en el siguiente archivo (por crear).

---

**Última actualización:** 31 de Diciembre 2025
**Estado:** Pendiente de inicio
