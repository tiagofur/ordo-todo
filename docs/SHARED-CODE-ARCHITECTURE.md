# 📦 Arquitectura de Código Compartido en Ordo-Todo

> **Última actualización**: 2025-12-17  
> **Estado**: Documentación activa

## Resumen Ejecutivo

El proyecto **Ordo-Todo** utiliza una **arquitectura de monorepo** con **11 paquetes compartidos** en la carpeta `packages/` que permiten reutilizar código entre las tres plataformas: **Web**, **Desktop** y **Mobile**.

---

## 🏗️ Estructura de Paquetes Compartidos

```
packages/
├── api-client/        # Cliente REST API unificado
├── config/            # Configuraciones compartidas
├── core/              # Lógica de negocio (DDD)
├── db/                # Prisma database (backend)
├── eslint-config/     # Configuración ESLint
├── hooks/             # React Query hooks compartidos
├── i18n/              # Traducciones centralizadas
├── stores/            # Estado global (Zustand)
├── styles/            # CSS/Tailwind 4 compartido
├── typescript-config/ # Configuración TypeScript
└── ui/                # Componentes UI compartidos
```

---

## 📊 Detalle por Paquete

### 1. 🎨 `@ordo-todo/styles` - Estilos CSS y Tailwind 4

**Propósito**: Sistema de diseño centralizado con variables CSS y mapeo a Tailwind v4.

| Archivo | Contenido |
|---------|-----------|
| `variables.css` | Variables CSS (colores, radios, themes light/dark usando OKLCH) |
| `theme.css` | Mapeo de variables a Tailwind v4 `@theme inline` |
| `base.css` | Estilos base globales |
| `components.css` | Utilidades para componentes |

**Uso en las apps**:

```css
/* apps/web/src/app/globals.css */
@import "tailwindcss";
@import "../../../../packages/styles/src/variables.css";
@import "../../../../packages/styles/src/theme.css";
@import "../../../../packages/styles/src/base.css";
@import "../../../../packages/styles/src/components.css";
```

```css
/* apps/desktop/src/index.css */
@import "tailwindcss";
@import "@ordo-todo/styles/src/variables.css";
@import "@ordo-todo/styles/src/theme.css";
@import "@ordo-todo/styles/src/base.css";
@import "@ordo-todo/styles/src/components.css";
```

**Paleta de colores principal**:
- Primary: `oklch(0.45 0.24 275)` (Vibrant Violet)
- Destructive: `oklch(0.577 0.245 27.325)` (Red)
- Colores vibrantes: Cyan, Purple, Pink, Orange, Green

---

### 2. 🌐 `@ordo-todo/i18n` - Traducciones

**Propósito**: Única fuente de verdad para todas las traducciones.

**Estructura**:
```
packages/i18n/src/
├── index.ts           # Exporta locales y utilidades
├── locales/
│   ├── en.json        # Inglés
│   ├── es.json        # Español
│   └── pt-br.json     # Portugués BR
├── types.ts           # Tipos TypeScript
└── utils.ts           # Transformadores para i18next/next-intl
```

**Uso**:

```typescript
// Web (next-intl) - usa JSON directo
import en from '@ordo-todo/i18n/locales/en';

// Desktop/Mobile (i18next) - transforma formato si es necesario
import { transformTranslations } from '@ordo-todo/i18n';
const i18nextTranslations = transformTranslations(en, 'i18next');
```

---

### 3. 🪝 `@ordo-todo/hooks` - React Query Hooks

**Propósito**: Hooks de React Query compartidos para fetching de datos.

**Patrón de uso (Factory Pattern)**:

```typescript
// El paquete exporta una fábrica de hooks
import { createHooks, queryKeys } from '@ordo-todo/hooks';

// En cada app, se crean los hooks vinculados a su cliente API
const hooks = createHooks({ apiClient });

// Usar los hooks
const { data: tasks } = hooks.useTasks();
const createTask = hooks.useCreateTask();
```

**Hooks disponibles** (60+):
- Auth: `useLogin`, `useRegister`, `useLogout`
- User: `useCurrentUser`, `useUpdateProfile`, `useUserPreferences`
- Workspace: `useWorkspaces`, `useCreateWorkspace`, `useWorkspaceMembers`
- Project: `useProjects`, `useCreateProject`, `useArchiveProject`
- Task: `useTasks`, `useCreateTask`, `useCompleteTask`, `useSubtasks`
- Timer: `useActiveTimer`, `useStartTimer`, `useStopTimer`, `useSessionHistory`
- Analytics: `useDailyMetrics`, `useWeeklyMetrics`, `useDashboardStats`
- AI: `useAIProfile`, `useOptimalSchedule`, `useGenerateWeeklyReport`
- Y más...

---

### 4. 💼 `@ordo-todo/core` - Lógica de Negocio

**Propósito**: Domain-Driven Design (DDD) con reglas de negocio, validación y utilidades.

**Estructura**:
```
packages/core/src/
├── shared/
│   ├── constants/     # Colores, prioridades, estados, límites
│   ├── utils/         # Fecha, tiempo, string, cálculos
│   ├── validation/    # Schemas Zod
│   └── entity.ts      # Base Entity class
├── tasks/             # Dominio de tareas
├── projects/          # Dominio de proyectos
├── workspaces/        # Dominio de workspaces
├── timer/             # Dominio de timer
├── analytics/         # Dominio de analytics
├── ai/                # Dominio de AI
├── habits/            # Dominio de hábitos
└── ... más dominios
```

**Exports principales**:

```typescript
// Constantes
import { 
  PROJECT_COLORS,      // 7 colores predefinidos
  TAG_COLORS,          // 10 colores de etiquetas
  TASK_PRIORITIES,     // LOW, MEDIUM, HIGH con colores
  TASK_STATUS,         // TODO, IN_PROGRESS, COMPLETED, CANCELLED
  TIMER_MODES,         // WORK, SHORT_BREAK, LONG_BREAK
  TASK_LIMITS,         // Límites de caracteres
} from '@ordo-todo/core';

// Validación (Zod)
import { 
  createTaskSchema, 
  createProjectSchema,
  registerUserSchema,
} from '@ordo-todo/core';

// Utilidades
import { 
  formatDate, formatDuration, formatTimerDisplay,
  isOverdue, isToday,
  generateSlug, truncate,
  calculateProgress, calculateProductivityScore,
  hexToRgba, getContrastColor,
} from '@ordo-todo/core';

// Entidades
import { Task, Project, Workspace } from '@ordo-todo/core';
```

---

### 5. 🧩 `@ordo-todo/ui` - Componentes UI

**Propósito**: Componentes React reutilizables para Web y Desktop.

**Componentes por categoría** (91+):

| Categoría | Cant. | Ejemplos |
|-----------|-------|----------|
| `ui/` | 31 | Button, Card, Dialog, Input, Select, Tabs |
| `task/` | 15 | TaskCard, TaskList, TaskForm, CreateTaskDialog |
| `project/` | 11 | ProjectCard, ProjectBoard, KanbanColumn |
| `timer/` | 4 | PomodoroTimer, TimerWidget, SessionHistory |
| `analytics/` | 7 | WeeklyChart, FocusScoreGauge, DailyMetricsCard |
| `workspace/` | 3 | WorkspaceCard, WorkspaceSelector |
| `tag/` | 3 | TagBadge, TagSelector, CreateTagDialog |
| `dashboard/` | 5 | StatsCard, UpcomingTasksWidget |
| `ai/` | 2 | GenerateReportDialog, ReportCard |
| `auth/` | 1 | AuthForm |
| `layout/` | 2 | Sidebar, Topbar |
| `shared/` | 7 | Breadcrumbs, Loading, ConfirmDelete |

**Principio arquitectónico**:

```typescript
// CORRECTO: Componente platform-agnostic
interface TaskCardProps {
  task: Task;                           // Data via props
  onTaskClick: (id: string) => void;    // Callback via props
  labels?: { complete?: string };       // i18n via props
}

export function TaskCard({ task, onTaskClick, labels }: TaskCardProps) {
  // NO hooks de API, NO routing, NO i18n directos
  return <Card onClick={() => onTaskClick(task.id)}>{task.title}</Card>;
}
```

---

### 6. 📡 `@ordo-todo/api-client` - Cliente API

**Propósito**: Cliente REST unificado con tipos compartidos.

```typescript
import { OrdoApiClient, LocalStorageTokenStorage } from '@ordo-todo/api-client';

const apiClient = new OrdoApiClient({
  baseURL: 'https://api.ordotodo.app/api/v1',
  tokenStorage: new LocalStorageTokenStorage(), // o AsyncStorageTokenStorage en Mobile
});

// Uso
const tasks = await apiClient.getTasks();
await apiClient.createTask({ title: 'Nueva tarea', projectId: '...' });
```

**DTOs exportados**: LoginDto, RegisterDto, CreateTaskDto, UpdateTaskDto, CreateProjectDto, y 40+ más.

---

### 7. 🗃️ `@ordo-todo/stores` - Estado Global

**Propósito**: Stores Zustand compartidos para estado global.

```typescript
import { 
  useWorkspaceStore,  // Workspace activo
  useUIStore,         // Estado de UI (sidebar, modals)
  useTimerStore,      // Estado del pomodoro
  useSyncStore,       // Estado de sincronización
} from '@ordo-todo/stores';
```

---

## 📱 Compatibilidad por Plataforma

| Paquete | Web | Desktop | Mobile | Notas |
|---------|:---:|:-------:|:------:|-------|
| `@ordo-todo/styles` | ✅ | ✅ | ❌ | React Native no soporta CSS |
| `@ordo-todo/i18n` | ✅ | ✅ | ⚠️ | Mobile debería usarlo pero no lo hace |
| `@ordo-todo/hooks` | ✅ | ⚠️ | ⚠️ | Mobile tiene hooks duplicados |
| `@ordo-todo/core` | ✅ | ✅ | ✅ | Funciona en todas |
| `@ordo-todo/ui` | ✅ | ✅ | ❌ | React Native necesita UI nativa |
| `@ordo-todo/api-client` | ✅ | ✅ | ✅ | Funciona en todas |
| `@ordo-todo/stores` | ✅ | ✅ | ⚠️ | Mobile debería usarlo pero no lo hace |

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                         APPS                                 │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐                     │
│  │   Web   │  │  Desktop │  │  Mobile │                     │
│  └────┬────┘  └────┬─────┘  └────┬────┘                     │
│       │            │             │                           │
└───────┼────────────┼─────────────┼──────────────────────────┘
        │            │             │
        ▼            ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    SHARED PACKAGES                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  @ordo-todo  │  │  @ordo-todo  │  │  @ordo-todo  │       │
│  │    /hooks    │──│  /api-client │──│    /core     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                                    │               │
│         ▼                                    ▼               │
│  ┌──────────────┐                     ┌──────────────┐       │
│  │  @ordo-todo  │                     │  @ordo-todo  │       │
│  │   /stores    │                     │    /i18n     │       │
│  └──────────────┘                     └──────────────┘       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  @ordo-todo  │  │  @ordo-todo  │  (Solo Web/Desktop)     │
│  │     /ui      │  │   /styles    │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Backend    │
                    │   (NestJS)   │
                    └──────────────┘
```

---

## 📝 Guía para Agregar Nuevas Features

### 1. Definir el modelo en `@ordo-todo/core`

```typescript
// packages/core/src/new-feature/model/feature.entity.ts
export interface FeatureProps extends EntityProps {
  name: string;
  // ...
}

export class Feature extends Entity<FeatureProps> {
  // ...
}
```

### 2. Agregar validación en `@ordo-todo/core`

```typescript
// packages/core/src/new-feature/validation/feature.validation.ts
import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z.string().min(1).max(100),
  // ...
});
```

### 3. Agregar tipos en `@ordo-todo/api-client`

```typescript
// packages/api-client/src/types/feature.types.ts
export interface CreateFeatureDto {
  name: string;
}

export interface Feature {
  id: string;
  name: string;
  createdAt: string;
}
```

### 4. Agregar métodos al cliente API

```typescript
// packages/api-client/src/client.ts
async getFeatures(): Promise<Feature[]> { /* ... */ }
async createFeature(dto: CreateFeatureDto): Promise<Feature> { /* ... */ }
```

### 5. Agregar hooks en `@ordo-todo/hooks`

```typescript
// packages/hooks/src/hooks.ts
useFeatures: () => useQuery({
  queryKey: queryKeys.features.all,
  queryFn: () => apiClient.getFeatures(),
}),

useCreateFeature: () => useMutation({
  mutationFn: (dto: CreateFeatureDto) => apiClient.createFeature(dto),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.features.all }),
}),
```

### 6. Agregar traducciones en `@ordo-todo/i18n`

```json
// packages/i18n/src/locales/en.json
{
  "Feature": {
    "title": "Features",
    "create": "Create Feature",
    "name": "Feature Name"
  }
}
```

### 7. Crear componentes UI en `@ordo-todo/ui`

```typescript
// packages/ui/src/components/feature/feature-card.tsx
interface FeatureCardProps {
  feature: Feature;
  onEdit: (id: string) => void;
  labels?: { edit?: string };
}

export function FeatureCard({ feature, onEdit, labels }: FeatureCardProps) {
  return (
    <Card>
      <h3>{feature.name}</h3>
      <Button onClick={() => onEdit(feature.id)}>
        {labels?.edit ?? 'Edit'}
      </Button>
    </Card>
  );
}
```

### 8. Integrar en cada app

```typescript
// apps/web/src/app/[locale]/features/page.tsx
import { FeatureCard } from '@ordo-todo/ui';
import { useFeatures } from '@/lib/shared-hooks';

export default function FeaturesPage() {
  const { data: features } = useFeatures();
  const t = useTranslations('Feature');
  
  return features?.map(f => (
    <FeatureCard 
      key={f.id} 
      feature={f}
      onEdit={(id) => router.push(`/features/${id}`)}
      labels={{ edit: t('edit') }}
    />
  ));
}
```

---

## 📚 Documentación Relacionada

- [ROADMAP.md](./ROADMAP.md) - Plan de mejoras
- [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) - Guías de componentes
- [packages/core/README.md](../packages/core/README.md) - Documentación del core
- [packages/ui/README.md](../packages/ui/README.md) - Documentación de UI
- [packages/api-client/README.md](../packages/api-client/README.md) - Documentación del API client

---

**Mantenido por**: Equipo Ordo-Todo
