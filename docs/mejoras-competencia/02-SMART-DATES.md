# 🔢 Smart Dates: Start Date + Scheduled Date

## 📋 Resumen

Agregar distinción entre **tres tipos de fechas** para cada tarea:

| Fecha | Propósito | Ejemplo |
|-------|-----------|---------|
| **Start Date** | Cuándo puedo empezar a trabajar en esto | "No puedo empezar hasta el lunes" |
| **Scheduled Date** | Cuándo planeo hacerlo | "Lo haré el miércoles" |
| **Due Date** | Fecha límite real | "Debe entregarse el viernes" |

> **Problema que resuelve:** Todoist users se quejan de que tareas aparecen como "vencidas" cuando en realidad aún no pueden comenzarse.

---

## 🎯 Cómo Encaja en el Flujo Actual

### Vista "Hoy" (Today)
```
┌─────────────────────────────────────────┐
│  HOY - 10 Diciembre                     │
├─────────────────────────────────────────┤
│  📅 PROGRAMADAS PARA HOY                │
│  ├─ ✅ Revisar código (scheduled: hoy)  │
│  └─ ✅ Reunión 1:1 (scheduled: hoy)     │
│                                         │
│  ⚡ DISPONIBLES (pueden comenzarse)     │
│  ├─ 📝 Diseñar mockups (start: ayer)    │
│  └─ 📝 Actualizar docs (start: hoy)     │
│                                         │
│  ⏰ VENCEN HOY                          │
│  └─ 🔴 Entregar reporte (due: hoy)      │
│                                         │
│  🔒 AÚN NO DISPONIBLES                  │
│  (collapsed by default)                 │
│  └─ 📝 Preparar demo (start: mañana)    │
└─────────────────────────────────────────┘
```

### Vista "Upcoming" (Próximas)
```
Muestra solo tareas donde:
- start_date <= hoy (ya pueden comenzarse)
- O scheduled_date existe

Oculta tareas donde start_date > hoy
```

---

## 🗄️ Cambios en Base de Datos

### Schema Prisma (Ya existe parcialmente)

```prisma
model Task {
  // ... campos existentes ...
  
  // Scheduling - YA EXISTE startDate y dueDate
  dueDate       DateTime?  // Fecha límite
  startDate     DateTime?  // Cuándo puede comenzarse
  scheduledDate DateTime?  // NUEVO: Cuándo está programada
  scheduledTime String?    // NUEVO: Hora específica (ej: "14:30")
  
  completedAt   DateTime?
  
  // Índices para queries eficientes
  @@index([scheduledDate])
}
```

> ✅ **Buenas noticias:** `startDate` ya existe en el schema actual. Solo falta `scheduledDate`.

---

## 📦 Cambios en packages/core

### 1. Actualizar Task Entity

```typescript
// packages/core/src/tasks/model/task.entity.ts

export interface TaskProps extends EntityProps {
    // ... existentes ...
    dueDate?: Date;
    startDate?: Date;         // Ya existe
    scheduledDate?: Date;     // NUEVO
    scheduledTime?: string;   // NUEVO: "HH:mm"
}
```

### 2. Actualizar Validación

```typescript
// packages/core/src/shared/validation/task.validation.ts

export const taskBaseSchema = z.object({
    // ... existentes ...
    dueDate: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),      // Agregar
    scheduledDate: z.string().optional().nullable(),  // Agregar
    scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
});

// Validación cruzada
export const taskDatesSchema = taskBaseSchema.refine(
    (data) => {
        if (data.startDate && data.dueDate) {
            return new Date(data.startDate) <= new Date(data.dueDate);
        }
        return true;
    },
    { message: "Start date must be before due date" }
);
```

### 3. Utilidades de Fecha

```typescript
// packages/core/src/shared/utils/date.utils.ts

/**
 * Determina si una tarea está disponible para trabajar
 */
export function isTaskAvailable(task: { startDate?: Date | null }): boolean {
    if (!task.startDate) return true;
    return new Date(task.startDate) <= new Date();
}

/**
 * Determina si una tarea está programada para hoy
 */
export function isScheduledForToday(task: { scheduledDate?: Date | null }): boolean {
    if (!task.scheduledDate) return false;
    return isToday(new Date(task.scheduledDate));
}

/**
 * Categoriza tareas por disponibilidad
 */
export function categorizeTasksByAvailability(tasks: TaskProps[]) {
    const today = startOfToday();
    
    return {
        overdue: tasks.filter(t => t.dueDate && isBefore(t.dueDate, today) && t.status !== 'COMPLETED'),
        dueToday: tasks.filter(t => t.dueDate && isToday(t.dueDate)),
        scheduledToday: tasks.filter(t => t.scheduledDate && isToday(t.scheduledDate)),
        available: tasks.filter(t => isTaskAvailable(t) && !isScheduledForToday(t)),
        notYetAvailable: tasks.filter(t => !isTaskAvailable(t)),
    };
}
```

---

## 🖥️ Cambios en UI

### 1. Task Form (Crear/Editar Tarea)

```tsx
// Diseño del formulario de fechas
┌─────────────────────────────────────────┐
│  📅 FECHAS                              │
├─────────────────────────────────────────┤
│                                         │
│  Puede comenzar desde                   │
│  ┌─────────────────────────┐            │
│  │ 📆  Sin fecha de inicio │ ▼         │
│  └─────────────────────────┘            │
│                                         │
│  Programada para                        │
│  ┌─────────────────────────┐ ┌────────┐ │
│  │ 📆  Seleccionar...     │ │ 14:00  │ │
│  └─────────────────────────┘ └────────┘ │
│                                         │
│  Fecha límite                           │
│  ┌─────────────────────────┐            │
│  │ 📆  Viernes, 15 Dic    │ ▼         │
│  └─────────────────────────┘            │
│                                         │
│  💡 AI: Esta tarea tomará ~2h.         │
│     Sugiero programarla para el jueves. │
└─────────────────────────────────────────┘
```

### 2. Task Card (Vista Compacta)

```tsx
// Badges de fecha en TaskCard
┌─────────────────────────────────────────┐
│ ✅ Preparar presentación                │
│    ⚡ Alta prioridad  🏷️ Marketing      │
│                                         │
│    📅 Programada: Mié 14:00             │
│    ⏰ Vence: Vie 15 Dic                 │
│    🔓 Disponible desde: Lun 11 Dic ✓    │
└─────────────────────────────────────────┘
```

### 3. Quick Add (NLP Enhancement)

```
Input: "Revisar código desde el lunes para el miércoles, entrega viernes"

Parsed:
- title: "Revisar código"
- startDate: 2025-12-16 (lunes)
- scheduledDate: 2025-12-18 (miércoles)  
- dueDate: 2025-12-20 (viernes)
```

**Keywords NLP:**
- "desde", "a partir de", "starting" → startDate
- "para el", "scheduled", "programada" → scheduledDate
- "entrega", "due", "deadline", "vence" → dueDate

---

## 🔌 Cambios en Backend (NestJS)

### 1. Task DTOs

```typescript
// apps/backend/src/modules/tasks/dto/create-task.dto.ts

export class CreateTaskDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;
    
    @IsOptional()
    @IsDateString()
    scheduledDate?: string;
    
    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/)
    scheduledTime?: string;
    
    @IsOptional()
    @IsDateString()
    dueDate?: string;
}
```

### 2. Task Queries

```typescript
// Filtrar tareas disponibles
async findAvailableTasks(userId: string) {
    return this.prisma.task.findMany({
        where: {
            creatorId: userId,
            status: { not: 'COMPLETED' },
            OR: [
                { startDate: null },
                { startDate: { lte: new Date() } }
            ]
        }
    });
}

// Filtrar tareas programadas para hoy
async findScheduledForToday(userId: string) {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    
    return this.prisma.task.findMany({
        where: {
            creatorId: userId,
            scheduledDate: {
                gte: today,
                lt: tomorrow
            }
        }
    });
}
```

---

## 📱 Integración Mobile

### React Native Date Picker

```tsx
// Usar el mismo componente compartido de @ordo-todo/ui

import { DatePickerField } from '@ordo-todo/ui';

<DatePickerField
    label={t('task.startDate')}
    value={startDate}
    onChange={setStartDate}
    placeholder={t('task.noStartDate')}
    icon="calendar-start"
/>
```

---

## ✅ Checklist de Implementación

> **Estado: ✅ COMPLETADO** (Diciembre 2025)

### Fase 1: Backend + Core (2 días) ✅
- [x] Agregar `scheduledDate` y `scheduledTime` al schema Prisma
- [x] Run migration (`prisma db push`)
- [x] Actualizar TaskProps en packages/core
- [x] Actualizar validaciones en task.validation.ts
- [x] Agregar utilidades de fecha en date.utils.ts
- [x] Actualizar DTOs en backend

### Fase 2: API (1 día) ✅
- [x] Actualizar TaskController para aceptar nuevos campos
- [x] Agregar endpoints: `/tasks/today`, `/tasks/scheduled`, `/tasks/available`
- [x] Actualizar api-client package con `getTasksToday()`, `getScheduledTasks()`, `getAvailableTasks()`
- [x] Agregar tipo `TodayTasksResponse`

### Fase 3: Web UI (3 días) ✅
- [x] Actualizar TaskCard con badges de fecha (scheduled: blue, due: orange, start: gray)
- [x] Actualizar TaskDetailPanel con 3 campos de fecha + auto-save
- [x] Fix TS error en create-task-dialog.tsx

### Fase 4: Desktop + Mobile (2 días) ✅
- [x] Desktop: TaskCard con badges Smart Dates
- [x] Desktop: TaskDetailPanel con 3 campos de fecha + auto-save
- [x] Mobile: task.tsx con 3 date pickers (dueDate, startDate, scheduledDate)

---

## 🎨 Diseño Visual

### Colores de Badge

| Tipo | Color | Icono |
|------|-------|-------|
| Start Date | Verde (`#10B981`) | `calendar-check` |
| Scheduled | Azul (`#3B82F6`) | `calendar-clock` |
| Due Date | Naranja/Rojo | `clock` |

### Estados Visuales

```
🔒 No disponible aún  → Gris, opacidad reducida
🔓 Disponible         → Normal
📅 Programada hoy     → Badge azul destacado
⏰ Vence hoy          → Badge naranja
🔴 Vencida            → Badge rojo
```

---

## 📊 Impacto Esperado

| Métrica | Antes | Después (esperado) |
|---------|-------|-------------------|
| Tareas "vencidas" falsas | 30% | 5% |
| Usuarios usando fechas | 60% | 85% |
| Satisfacción con scheduling | 3.2/5 | 4.5/5 |

---

**Esfuerzo total estimado:** 8 días de desarrollo
**Complejidad:** Media
**Riesgo:** Bajo (cambio aditivo, no rompe nada existente)
