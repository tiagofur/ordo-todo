# 🎯 Sistema de OKRs y Goals

## 📋 Resumen

Implementar un sistema de **Objectives and Key Results (OKRs)** que permita a los usuarios vincular sus tareas diarias con metas de alto nivel, dando contexto y motivación a su trabajo.

> **Por qué importa:** Los usuarios quieren ver cómo sus tareas contribuyen a metas mayores. Asana, ClickUp y Lattice lo tienen.

---

## 🎯 Filosofía de Integración

### Jerarquía Propuesta

```
Objetivo (Objective)
├── Key Result 1 (medible)
│   ├── Linked Task A
│   └── Linked Task B
├── Key Result 2 (medible)
│   ├── Linked Task C
│   └── Linked Task D
└── Key Result 3 (medible)
    └── Linked Task E
```

### Principio Clave
> Los OKRs son una **capa de contexto** sobre las tareas existentes, no un sistema paralelo.

---

## 🗄️ Diseño de Base de Datos

### Schema Prisma

```prisma
// ============ OKRs & GOALS ============

model Objective {
  id          String    @id @default(cuid())
  
  // Básicos
  title       String
  description String?   @db.Text
  
  // Owner & Scope
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  workspaceId String?
  workspace   Workspace? @relation(fields: [workspaceId], references: [id])
  
  // Timeframe
  startDate   DateTime  @default(now())
  endDate     DateTime
  period      OKRPeriod @default(QUARTERLY)
  
  // Status
  status      ObjectiveStatus @default(ACTIVE)
  progress    Float           @default(0) // 0-100, calcualted from KRs
  
  // Relationships
  keyResults  KeyResult[]
  
  // Metadata
  color       String    @default("#3B82F6")
  icon        String?
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([userId])
  @@index([workspaceId])
  @@index([endDate])
}

model KeyResult {
  id          String    @id @default(cuid())
  
  // Parent
  objective   Objective @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  objectiveId String
  
  // Básicos
  title       String
  description String?
  
  // Measurement
  metricType  MetricType @default(PERCENTAGE)
  startValue  Float      @default(0)
  targetValue Float
  currentValue Float     @default(0)
  unit        String?    // "users", "revenue", "tasks", etc.
  
  // Progress (calculated)
  progress    Float      @default(0) // 0-100
  
  // Relationships
  linkedTasks KeyResultTask[]
  
  // Timestamps  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([objectiveId])
}

// Tabla de unión para vincular tareas a Key Results
model KeyResultTask {
  keyResult   KeyResult @relation(fields: [keyResultId], references: [id], onDelete: Cascade)
  keyResultId String
  
  task        Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId      String
  
  // Contribution weight (how much completing this task contributes to KR)
  weight      Float     @default(1)
  
  @@id([keyResultId, taskId])
}

enum OKRPeriod {
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
  CUSTOM
}

enum ObjectiveStatus {
  DRAFT
  ACTIVE
  COMPLETED
  CANCELLED
  AT_RISK
}

enum MetricType {
  PERCENTAGE    // 0-100%
  NUMBER        // Absolute number
  CURRENCY      // Money
  BOOLEAN       // Done/Not done
  TASK_COUNT    // Auto-calculated from linked tasks
}
```

### Actualizaciones a Task

```prisma
model Task {
  // ... existing fields ...
  
  // NEW: Link to Key Results
  keyResults  KeyResultTask[]
}
```

---

## 📦 Nuevo Dominio en packages/core

### Estructura

```
packages/core/src/okrs/
├── model/
│   ├── objective.entity.ts
│   ├── key-result.entity.ts
│   └── okr-period.vo.ts
├── provider/
│   ├── objective.repository.ts
│   └── key-result.repository.ts
├── usecase/
│   ├── create-objective.usecase.ts
│   ├── update-progress.usecase.ts
│   ├── link-task-to-kr.usecase.ts
│   └── calculate-objective-progress.usecase.ts
└── index.ts
```

### Lógica de Progreso

```typescript
// Cálculo automático de progreso

function calculateKeyResultProgress(kr: KeyResult): number {
    if (kr.metricType === 'BOOLEAN') {
        return kr.currentValue > 0 ? 100 : 0;
    }
    
    if (kr.metricType === 'TASK_COUNT') {
        const completedTasks = kr.linkedTasks.filter(lt => lt.task.status === 'COMPLETED');
        return (completedTasks.length / kr.linkedTasks.length) * 100;
    }
    
    // For percentage, number, currency
    const range = kr.targetValue - kr.startValue;
    if (range === 0) return kr.currentValue >= kr.targetValue ? 100 : 0;
    
    const progress = ((kr.currentValue - kr.startValue) / range) * 100;
    return Math.min(Math.max(progress, 0), 100);
}

function calculateObjectiveProgress(objective: Objective): number {
    const keyResults = objective.keyResults;
    if (keyResults.length === 0) return 0;
    
    const totalProgress = keyResults.reduce((sum, kr) => sum + kr.progress, 0);
    return totalProgress / keyResults.length;
}
```

---

## 🖥️ Diseño de UI

### 1. Navegación

```
┌─────────────────────────────────────────┐
│  SIDEBAR                                │
├─────────────────────────────────────────┤
│  🏠 Dashboard                           │
│  📋 Today                               │
│  📅 Calendar                            │
│  🔄 Habits                              │
│  ─────────────────────────              │
│  🎯 Goals  ← NUEVO                      │
│  ─────────────────────────              │
│  📁 Projects                            │
└─────────────────────────────────────────┘
```

### 2. Vista Principal de OKRs

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 MIS OBJETIVOS                          [+ Nuevo OKR]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Q4 2025                                 [Q3] [Q4] [Y]   │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🚀 Lanzar MVP de la App               Progress: 65%    ││
│  │  ██████████████░░░░░░░░                                 ││
│  │                                                         ││
│  │  Key Results:                                           ││
│  │  ├─ ✅ Completar backend API              100% (3/3)   ││
│  │  ├─ 🟡 Implementar features críticos       70% (7/10)  ││
│  │  └─ ⬜ Beta testing con 50 usuarios        25% (12/50) ││
│  │                                                         ││
│  │  📋 12 tareas vinculadas  ⏱️ 45 días restantes         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📈 Mejorar productividad personal      Progress: 40%   ││
│  │  ████████░░░░░░░░░░░░░░                                 ││
│  │                                                         ││
│  │  Key Results:                                           ││
│  │  ├─ 🟡 Mantener 80% tasa completación     65% (65/80)  ││
│  │  ├─ ⬜ 30 días de streak en hábitos       20% (6/30)   ││
│  │  └─ ⬜ Reducir overtime 50%               35% (-35%)   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Detalle de Objetivo

```
┌─────────────────────────────────────────────────────────────┐
│  ← 🚀 Lanzar MVP de la App                      [⚙️] [🗑️] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Progreso General                                           │
│  ████████████████████░░░░░░░░░░  65%                       │
│                                                             │
│  📅 Oct 1 - Dec 31, 2025        ⏱️ 45 días restantes       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  🎯 KEY RESULTS                                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. Completar backend API                    100%       ││
│  │     ████████████████████████████████████████████████    ││
│  │     Meta: 3 endpoints → Actual: 3 ✅                    ││
│  │                                                         ││
│  │     📋 Tareas vinculadas (3 completadas):               ││
│  │     ├─ ✅ Implementar auth API                          ││
│  │     ├─ ✅ Implementar tasks API                         ││
│  │     └─ ✅ Implementar timer API                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  2. Implementar features críticos             70%       ││
│  │     ██████████████████████████████░░░░░░░░░░░░░░        ││
│  │     Meta: 10 features → Actual: 7                       ││
│  │                                                         ││
│  │     📋 Tareas vinculadas (7/10):                        ││
│  │     ├─ ✅ Dashboard                                     ││
│  │     ├─ ✅ Task management                               ││
│  │     ├─ 🔄 Notifications (in progress)                   ││
│  │     └─ ... 7 más                                        ││
│  │                                                         ││
│  │     [+ Vincular tarea]  [📊 Actualizar progreso]        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Crear OKR - Modal

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ Nuevo Objetivo                                    [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PASO 1/3: Define tu Objetivo                               │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ¿Qué quieres lograr?                                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Lanzar MVP de la App                                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Descripción (opcional)                                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Completar y lanzar la versión mínima viable...         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Período                                                    │
│  [Este Trimestre ▼]  📅 Oct 1 - Dec 31                     │
│                                                             │
│                             [Cancelar]  [Siguiente →]       │
├─────────────────────────────────────────────────────────────┤
│  PASO 2/3: Define Key Results                               │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ¿Cómo sabrás que lo lograste? (métricas específicas)       │
│                                                             │
│  Key Result 1:                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Completar 10 features críticos                          ││
│  │ Tipo: [Número ▼]  Meta: [10]  Actual: [0]  Unidad: [ ] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Key Result 2:                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Conseguir 50 beta testers                               ││
│  │ Tipo: [Número ▼]  Meta: [50]  Actual: [0]  Unidad: [us]││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [+ Agregar otro Key Result]                                │
│                                                             │
│                           [← Atrás]  [Siguiente →]          │
├─────────────────────────────────────────────────────────────┤
│  PASO 3/3: Vincular Tareas Existentes                       │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  (Opcional) Vincula tareas que contribuyan a estos KRs:     │
│                                                             │
│  🔍 Buscar tareas...                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ☑️ Implementar auth API      → KR: Features críticos   ││
│  │ ☑️ Diseñar landing page      → KR: Beta testers        ││
│  │ ☐ Revisar código             → Seleccionar KR...        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  💡 Tip: También puedes vincular tareas después             │
│                                                             │
│                       [← Atrás]  [🎯 Crear Objetivo]        │
└─────────────────────────────────────────────────────────────┘
```

### 5. Vincular Tarea a KR (desde Task Detail)

```
┌─────────────────────────────────────────────────────────────┐
│  ✏️ Editar Tarea                                            │
├─────────────────────────────────────────────────────────────┤
│  ...otros campos...                                         │
│                                                             │
│  🎯 CONTRIBUYE A                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  [+ Vincular a un objetivo]                             ││
│  │                                                         ││
│  │  Objetivos activos:                                     ││
│  │  ├─ 🚀 Lanzar MVP                                       ││
│  │  │   ├─ ⬜ Completar features (7/10)                    ││
│  │  │   └─ ⬜ Beta testers (12/50)                         ││
│  │  │                                                      ││
│  │  └─ 📈 Mejorar productividad                            ││
│  │      └─ ⬜ Tasa completación (65/80)                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Widget en Dashboard

```
┌─────────────────────────────────────────┐
│  🎯 OBJETIVOS Q4                Ver más │
├─────────────────────────────────────────┤
│                                         │
│  🚀 Lanzar MVP                    65%   │
│  ████████████████░░░░░░░░               │
│                                         │
│  📈 Mejorar productividad         40%   │
│  ████████░░░░░░░░░░░░░░░               │
│                                         │
│  📌 3 KRs necesitan atención           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔌 Backend Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/objectives` | Listar objetivos |
| POST | `/api/v1/objectives` | Crear objetivo |
| GET | `/api/v1/objectives/:id` | Detalle de objetivo |
| PATCH | `/api/v1/objectives/:id` | Actualizar objetivo |
| DELETE | `/api/v1/objectives/:id` | Eliminar objetivo |
| GET | `/api/v1/objectives/:id/key-results` | Listar KRs |
| POST | `/api/v1/objectives/:id/key-results` | Agregar KR |
| PATCH | `/api/v1/key-results/:id` | Actualizar KR |
| DELETE | `/api/v1/key-results/:id` | Eliminar KR |
| POST | `/api/v1/key-results/:id/tasks` | Vincular tarea |
| DELETE | `/api/v1/key-results/:id/tasks/:taskId` | Desvincular tarea |
| GET | `/api/v1/objectives/current-period` | OKRs del período actual |
| GET | `/api/v1/objectives/dashboard-summary` | Resumen para dashboard |

---

## 🤖 Integración con IA

### Sugerencias Inteligentes

```typescript
// La IA puede sugerir:

1. "Esta tarea parece relacionada con tu objetivo 'Lanzar MVP'"
2. "Tu KR 'Beta testers' está en riesgo. Considera estas acciones..."
3. "Basado en tu progreso, podrías alcanzar este objetivo 2 semanas antes"
4. "Este objetivo no tiene tareas vinculadas. ¿Quieres que sugiera algunas?"
```

---

## ✅ Checklist de Implementación

### Fase 1: Backend + Core (4 días)
- [ ] Crear schema Prisma para Objective, KeyResult, KeyResultTask
- [ ] Run migration
- [ ] Crear dominio okrs en packages/core
- [ ] Implementar cálculo de progreso
- [ ] Crear módulo NestJS

### Fase 2: API + Hooks (2 días)
- [ ] Agregar endpoints a api-client
- [ ] Crear hooks
- [ ] Testing

### Fase 3: Web UI (5 días)
- [ ] Crear componentes en packages/ui
- [ ] Vista de lista de OKRs
- [ ] Detalle de objetivo
- [ ] Modal de creación (wizard)
- [ ] Vincular tareas desde task detail
- [ ] Dashboard widget

### Fase 4: Desktop + Mobile (3 días)
- [ ] Replicar UI
- [ ] Optimizar para mobile

---

**Esfuerzo total estimado:** 14 días
**Complejidad:** Alta
**Riesgo:** Medio
