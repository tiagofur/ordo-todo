# 🏠 Análisis Profundo: Dashboard / Inicio

> Investigación completa de la pantalla Dashboard en las 3 aplicaciones: Web, Desktop y Mobile

---

## 📍 Ubicación del Código

| App | Archivo Principal | Tamaño |
|-----|------------------|--------|
| **Web** | `apps/web/src/app/[locale]/(pages)/dashboard/page.tsx` | 655 líneas |
| **Desktop** | `apps/desktop/src/pages/Dashboard.tsx` | 581 líneas |
| **Mobile** | `apps/mobile/app/screens/(internal)/(tabs)/index.tsx` | 530 líneas |

---

## 📊 Comparación de Funcionalidades

### Datos que muestra cada app

| Funcionalidad | Web | Desktop | Mobile | Notas |
|---------------|:---:|:-------:|:------:|-------|
| **Tareas Completadas Hoy** | ✅ | ✅ | ✅ | Web/Desktop usan métricas del backend |
| **Subtareas Completadas** | ✅ | ✅ | ❌ | Mobile no muestra esto |
| **Tiempo Trabajado** | ✅ | ✅ | ❌ | Mobile no tiene Timer |
| **Productividad %** | ✅ | ✅ | ❌ | Mobile no calcula esto |
| **Streak de Productividad** | ✅ Widget | ✅ Widget | ❌ | Mobile no tiene |
| **Timer Widget** | ✅ | ✅ | ❌ | Desktop/Web integran timer |
| **Hábitos Widget** | ✅ | ✅ | ❌ | Mobile tiene tab separada |
| **OKRs Widget** | ✅ | ✅ | ✅ | Mobile tiene botón acceso rápido |
| **AI Insights Widget** | ✅ | ✅ | ❌ | Mobile no tiene |
| **Lista de Tareas** | ✅ | ✅ | ✅ | Las 3 apps |
| **Filtros de Tareas** | Vista/Orden | Vista/Orden | Todos/Hoy/Próximas/Completadas |
| **FAB Quick Actions** | ✅ | ✅ | ✅ (solo crear tarea) |
| **Onboarding** | ✅ | ❌ | ❌ | Solo Web tiene onboarding |

---

## 🔌 Endpoints del Backend Utilizados

### Web/Desktop usan:

```typescript
// Timer Stats para el día actual
useTimerStats({ startDate, endDate })
// → GET /api/v1/timers/stats?startDate=...&endDate=...

// Métricas diarias (tareas y subtareas completadas)
useDailyMetrics({ startDate, endDate })
// → GET /api/v1/analytics/daily?startDate=...&endDate=...

// Todas las tareas (filtradas localmente)
useTasks()
// → GET /api/v1/tasks

// Streak de productividad
useProductivityStreak()
// → GET /api/v1/analytics/productivity-streak

// Dashboard de OKRs
useObjectivesDashboard() / useObjectivesDashboardSummary()
// → GET /api/v1/objectives/dashboard
```

### Mobile usa:

```typescript
// Tareas
useTasks()
// → GET /api/v1/tasks

// Resumen de OKRs
useObjectivesDashboardSummary()
// → GET /api/v1/objectives/dashboard
```

---

## 🧩 Componentes y Widgets

### Estructura de Widgets en packages/ui

```
packages/ui/src/components/dashboard/
├── index.ts                      # Exporta solo algunos widgets
├── stats-card.tsx                # ✅ Compartido
├── productivity-streak-widget.tsx # ✅ Compartido
├── active-projects-widget.tsx    # ✅ Compartido
├── upcoming-tasks-widget.tsx     # ✅ Compartido
├── weekly-activity-widget.tsx    # ✅ Compartido
├── ai-insights-widget.tsx        # ⚠️ Existe pero NO se exporta
├── dashboard-timer-widget.tsx    # ⚠️ Existe pero NO se exporta
└── habits-widget.tsx             # ⚠️ Existe pero NO se exporta
```

### Uso de Componentes por App

| Widget | packages/ui | Web Local | Desktop Local | Mobile |
|--------|:-----------:|:---------:|:-------------:|:------:|
| **StatsCard** | ✅ | Usa packages | Usa packages | ❌ Custom inline |
| **ProductivityStreak** | ✅ | ❌ Local | ❌ Local | ❌ No tiene |
| **TimerWidget** | ⚠️ No export | ✅ Local | ✅ Local | ❌ No tiene |
| **HabitsWidget** | ⚠️ No export | ✅ Local | ✅ Local | ❌ No tiene |
| **OkrWidget** | ❌ | ✅ Local | ✅ Local | ✅ Botón acceso |
| **AIInsightsWidget** | ⚠️ No export | ✅ Local | ✅ Local | ❌ No tiene |
| **TaskCard** | ✅ packages | Web compact | Desktop | Mobile custom |

---

## 🚨 Problemas Identificados

### 1. **Duplicación de Widgets (CRÍTICO)**

Los siguientes widgets existen DUPLICADOS entre Web y Desktop:

| Widget | Web | Desktop | ¿Iguales? |
|--------|-----|---------|-----------|
| `ProductivityStreakWidget` | `apps/web/src/components/dashboard/productivity-streak-widget.tsx` | `apps/desktop/src/components/dashboard/ProductivityStreakWidget.tsx` | ⚠️ Muy similares pero diferentes |
| `OkrWidget` | `apps/web/src/components/dashboard/okr-widget.tsx` | `apps/desktop/src/components/dashboard/OkrWidget.tsx` | ⚠️ Diferentes implementaciones |
| `HabitsWidget` | `apps/web/src/components/dashboard/habits-widget.tsx` | `apps/desktop/src/components/dashboard/HabitsWidget.tsx` | ⚠️ Diferentes implementaciones |
| `AIInsightsWidget` | `apps/web/src/components/dashboard/ai-insights-widget.tsx` | `apps/desktop/src/components/dashboard/AIInsightsWidget.tsx` | ⚠️ Muy similares |
| `DashboardTimerWidget` | `apps/web/src/components/dashboard/dashboard-timer-widget.tsx` | `apps/desktop/src/components/dashboard/TimerWidget.tsx` | ⚠️ Diferentes |

**Impacto**: Mantenimiento doble, bugs pueden arreglarse en uno y no en otro.

### 2. **packages/ui tiene widgets pero no los exporta**

El archivo `packages/ui/src/components/dashboard/index.ts` NO exporta:
- `ai-insights-widget.tsx`
- `dashboard-timer-widget.tsx`
- `habits-widget.tsx`

**Impacto**: No se pueden reusar en apps, cada app tiene su propia versión.

### 3. **Mobile carece de widgets importantes**

Mobile NO tiene:
- ProductivityStreakWidget
- TimerWidget
- HabitsWidget (tiene tab pero no widget en home)
- AIInsightsWidget
- Stats Cards (usa inline styling)

**Impacto**: Experiencia inconsistente entre plataformas.

### 4. **Diferente lógica de filtrado de tareas**

**Web/Desktop**:
```typescript
// Filtra tareas con lógica compleja:
// - dueDate = hoy
// - completadas hoy (completedAt o updatedAt)
// - pendientes sin fecha o vencidas
```

**Mobile**:
```typescript
// Filtros más simples:
const FILTER_KEYS = ["all", "today", "upcoming", "completed"]
// "all" = tareas no completadas
// "today" = dueDate = hoy
// etc.
```

### 5. **Hooks diferentes por app**

| App | Archivo de Hooks | Implementación |
|-----|-----------------|----------------|
| Web | `apps/web/src/lib/api-hooks.ts` | Crea hooks con `createHooks()` de `@ordo-todo/hooks` |
| Desktop | `apps/desktop/src/hooks/api/index.ts` | Crea hooks con `createHooks()` de `@ordo-todo/hooks` |
| Mobile | `apps/mobile/app/lib/shared-hooks.ts` | Bridge que wrappea `createHooks()` de `@ordo-todo/hooks` ✅ |

**Buena noticia**: Las 3 apps usan `@ordo-todo/hooks` como base.

---

## 💡 Recomendaciones de Mejora

### Fase 1: Unificar Widgets en `packages/ui` (Alta Prioridad)

1. **Exportar widgets existentes en packages/ui**:
   ```typescript
   // packages/ui/src/components/dashboard/index.ts
   export * from './stats-card.js';
   export * from './active-projects-widget.js';
   export * from './productivity-streak-widget.js';
   export * from './upcoming-tasks-widget.js';
   export * from './weekly-activity-widget.js';
   // AGREGAR:
   export * from './ai-insights-widget.js';
   export * from './dashboard-timer-widget.js';
   export * from './habits-widget.js';
   // CREAR:
   export * from './okr-widget.js';
   ```

2. **Crear OkrWidget compartido** tomando lo mejor de Web y Desktop:
   - Props: `{ onNavigate, labels }`
   - Usar el hook compartido `useObjectivesDashboard`
   - Diseño consistente

3. **Eliminar duplicados locales** en Web y Desktop

### Fase 2: Crear widgets Mobile-friendly

1. **Crear `packages/ui-mobile/src/components/dashboard/`**:
   ```
   packages/ui-mobile/src/components/dashboard/
   ├── stats-card.component.tsx      # Card de estadísticas
   ├── quick-stats-row.component.tsx # Fila de 3 stats (Pendientes, Completadas, Hoy)
   ├── okr-quick-access.component.tsx # Botón de acceso a OKRs
   ├── streak-badge.component.tsx     # Badge de streak (compacto)
   └── index.ts
   ```

2. **Agregar widgets a Mobile Home**:
   - Streak badge en header (junto a stats)
   - Mini Timer Widget (expandible)
   - Hábitos del día (collapsible section)

### Fase 3: Unificar lógica de Dashboard

1. **Crear hook `useDashboardData`** en `packages/hooks`:
   ```typescript
   export function useDashboardData() {
     const { data: tasks } = useTasks();
     const { data: dailyMetrics } = useDailyMetrics({ today: true });
     const { data: timerStats } = useTimerStats({ today: true });
     const { data: streak } = useProductivityStreak();
     const { data: okrSummary } = useObjectivesDashboard();
     const { data: todayHabits } = useTodayHabits();
     
     return {
       todaysTasks: filterTodaysTasks(tasks),
       stats: {
         completed: dailyMetrics?.tasksCompleted ?? 0,
         subtasks: dailyMetrics?.subtasksCompleted ?? 0,
         timeWorked: timerStats?.totalMinutesWorked ?? 0,
         productivity: timerStats?.completionRate ?? 0,
       },
       streak,
       okrSummary,
       habits: todayHabits,
     };
   }
   ```

2. **Usar este hook en las 3 apps** para consistencia.

### Fase 4: Mejorar Mobile Dashboard

**Nuevo diseño propuesto para Mobile Home**:

```
┌─────────────────────────────────┐
│ [Header con Gradiente]          │
│ Buenos días 👋                  │
│ Mis Tareas                      │
│ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │  5  │ │  3  │ │  2  │ 🔥 12  │ ← Streak badge
│ │Pend.│ │Comp.│ │ Hoy │        │
│ └─────┘ └─────┘ └─────┘        │
├─────────────────────────────────┤
│ [OKRs Quick Access Card]        │
│ 🎯 OKRs & Goals    78% →       │
├─────────────────────────────────┤
│ [Hábitos del día] (collapsible) │
│ ☑️ Meditar   ☑️ Ejercicio       │
├─────────────────────────────────┤
│ [Filtros] All | Today | Up | ✓  │
├─────────────────────────────────┤
│ [Lista de Tareas]               │
│ ...                             │
└─────────────────────────────────┘
            [+ Nueva Tarea]
```

---

## 📋 Checklist de Implementación

### ✅ COMPLETADO (2026-01-14)

- [x] **Exportar widgets faltantes en `packages/ui` index**
  - Agregados: `ai-insights-widget`, `dashboard-timer-widget`, `habits-widget`, `okr-widget`
  
- [x] **Crear OkrWidget compartido en packages/ui**
  - Nuevo archivo: `packages/ui/src/components/dashboard/okr-widget.tsx`
  - Acepta `summary`, `isLoading`, `onNavigate`, `labels`, `accentColor`
  
- [x] **Refactorizar widgets de Desktop para usar packages/ui**
  - `OkrWidget.tsx` → wrapper que usa `SharedOkrWidget`
  - `HabitsWidget.tsx` → wrapper que usa `SharedHabitsWidget`
  - `ProductivityStreakWidget.tsx` → wrapper que usa `SharedProductivityStreakWidget`
  - `AIInsightsWidget.tsx` → wrapper que usa `SharedAIInsightsWidget`
  - `TimerWidget.tsx` → wrapper que usa `SharedTimerWidget`
  
- [x] **Refactorizar widgets de Web para usar packages/ui**
  - `okr-widget.tsx` → wrapper que usa `SharedOkrWidget`
  - `habits-widget.tsx` → wrapper que usa `SharedHabitsWidget`
  - `productivity-streak-widget.tsx` → wrapper que usa `SharedProductivityStreakWidget`
  - `ai-insights-widget.tsx` → wrapper que usa `SharedAIInsightsWidget`
  - `dashboard-timer-widget.tsx` → wrapper que usa `SharedTimerWidget`

- [x] **Agregar Streak badge a Mobile Home**
  - Agregado hook `useProductivityStreak` a mobile shared-hooks
  - Badge de racha visible en header cuando hay streak > 0

- [x] **Agregar sección hábitos a Mobile Home**
  - Sección horizontal con chips de hábitos del día
  - Toggle de completar/descompletar hábitos
  - Muestra streak por hábito

- [x] **Crear `useDashboardData` hook compartido**
  - Nuevo archivo: `packages/hooks/src/dashboard/use-dashboard-data.ts`
  - Factory function `createUseDashboardData` que acepta bundle de hooks
  - Exporta tipos: `DashboardStats`, `DashboardStreak`, `DashboardObjectivesSummary`, etc.
  - Lógica centralizada para filtrar "tareas de hoy"
  - Implementado como hook local en Mobile (`apps/mobile/app/lib/shared-hooks.ts`)

- [x] **Agregar mini-timer widget a Mobile**
  - Nuevo componente: `apps/mobile/app/components/dashboard/MiniTimerWidget.tsx`
  - Muestra timer activo con tiempo transcurrido
  - Controles play/pause integrados
  - Se oculta cuando no hay timer activo
  - Navega a pantalla completa de timer al tap

- [x] **Verificar builds**
  - packages/ui: ✅ Build exitoso
  - packages/hooks: ✅ Build exitoso  
  - apps/desktop: ✅ TypeCheck exitoso
  - apps/web: ✅ Build exitoso

- [x] **Soporte de Layout para Tablets (Mobile)**
  - Implementado `useMediaQuery` hook (`apps/mobile/app/lib/hooks/use-media-query.ts`)
  - Refactorizado Dashboard (`index.tsx`) para renderizado condicional responsivo
  - **Layout Tablet**: 
    - Header extendido
    - Grid de 2 columnas (Izquierda: Tareas + Filtros, Derecha: Widgets)
    - Widgets adaptados a columna lateral

### 🔄 Próximos Pasos

- [ ] Test de consistencia visual cross-platform
- [x] **Agregar AI Insights widget a Mobile (mini versión)**
  - Nuevo hook `useAIInsights` en shared-hooks
  - Nuevo componente: `MiniAIInsightsWidget` (Smartphone: compacto y expandible, animado)
  - Nuevo componente: `TabletAIInsightsWidget` (Tablet: versión expandida con lista)
  - Integrado de forma adaptativa en Mobile (header) y Tablet (sidebar)
- [x] **Optimización de UX/Animaciones (Mobile)**
  - Implementada entrada en cascada (staggered) para elementos del dashboard.
  - Transiciones de layout fluidas al rotar o cambiar tamaño de pantalla via `LinearTransition`.

### 🔄 Próximos Pasos (Web/Desktop)

- [x] **Mejorar UX con Framer Motion**
  - Implementada entrada en cascada en Dashboard (`apps/web/src/app/[locale]/(pages)/dashboard/page.tsx`).
  - Animación de Header, Stats, Widgets y Task List orquestada.
- [x] **Implementar colores de acento por sección (Multiapp)**.
    - Definidos tokens `-theme-` en CSS y `colors.section` en JS.
    - **Dashboard**: Cyan (`#06B6D4`) en las 3 plataformas.
    - **Tasks**: Violeta (`#8B5CF6`) en las 3 plataformas.
    - **Projects**: Rosa (`#EC4899`) en las 3 plataformas.
    - Unificada la lógica de aplicación de tokens en Web, Desktop y Mobile.
  - Verificada consistencia de border radius y espaciado (16px/1rem).


---

## 🎨 Consistencia de Diseño

### Colores del Dashboard

| Elemento | Color | Hex | Usadoen |
|----------|-------|-----|---------|
| Accent principal | Cyan | `#06b6d4` | Header, FAB |
| Subtareas | Purple | `#8b5cf6` | Stats card |
| Tiempo | Amber | `#f59e0b` | Stats card, Timer |
| Productividad | Emerald | `#10b981` | Stats card |
| Streak activo | Orange | `#f97316` | Streak widget |
| OKRs | Pink/Blue | `#ec4899` / `#3B82F6` | OKR widget |

### Elementos de UI consistentes

| Elemento | Web | Desktop | Mobile |
|----------|-----|---------|--------|
| Border radius | `rounded-2xl` (16px) | `rounded-2xl` | 16px |
| Shadows | `shadow-lg` hover | `shadow-lg` hover | elevation: 5 |
| Animaciones | framer-motion | framer-motion | reanimated |
| Loading states | Spinner | Spinner | ActivityIndicator |

---

## 📁 Archivos a Modificar

### packages/ui
```
packages/ui/src/components/dashboard/index.ts  ← Agregar exports
packages/ui/src/components/dashboard/okr-widget.tsx  ← CREAR nuevo
```

### apps/web
```
apps/web/src/components/dashboard/okr-widget.tsx  ← ELIMINAR (usar packages)
apps/web/src/components/dashboard/habits-widget.tsx  ← ELIMINAR
apps/web/src/components/dashboard/productivity-streak-widget.tsx  ← ELIMINAR
apps/web/src/components/dashboard/ai-insights-widget.tsx  ← ELIMINAR
```

### apps/desktop
```
apps/desktop/src/components/dashboard/*.tsx  ← ELIMINAR locales
apps/desktop/src/components/dashboard/index.ts  ← Solo re-export packages
```

### apps/mobile
```
apps/mobile/app/screens/(internal)/(tabs)/index.tsx  ← Agregar widgets
apps/mobile/app/components/dashboard/  ← CREAR carpeta con widgets mobile
```

---

*Documento generado el 2026-01-14*
