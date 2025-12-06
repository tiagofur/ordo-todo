# 📦 Ordo-Todo Packages

Documentación de los packages compartidos del monorepo.

---

## 🏗️ Estructura General

```
packages/
├── core/           # 🎯 Lógica de dominio (DDD)
├── db/             # 🗄️ Prisma Client + Schema
├── api-client/     # 🔌 Cliente HTTP tipado
├── ui/             # 🎨 Componentes UI compartidos
├── hooks/          # 🪝 React Hooks compartidos
├── i18n/           # 🌍 Internacionalización
└── config/         # ⚙️ ESLint, TypeScript configs
```

---

## 📍 @ordo-todo/core

**El corazón del proyecto.** Contiene toda la lógica de negocio siguiendo DDD.

### Estructura

```
packages/core/src/
├── shared/                 # Base classes
│   ├── entity.base.ts      # Base Entity class
│   ├── value-object.base.ts
│   └── types.ts            # Shared types
│
├── users/                  # User Domain
│   ├── model/
│   │   └── user.entity.ts
│   ├── provider/
│   │   └── user.repository.ts
│   └── usecase/
│       ├── create-user.usecase.ts
│       └── update-user.usecase.ts
│
├── workspaces/             # Workspace Domain
│   ├── model/
│   │   ├── workspace.entity.ts
│   │   ├── workspace-member.entity.ts
│   │   └── workspace-invitation.entity.ts
│   ├── provider/
│   │   ├── workspace.repository.ts
│   │   └── workspace-invitation.repository.ts
│   └── usecase/
│       ├── create-workspace.usecase.ts
│       ├── invite-member.usecase.ts
│       └── accept-invitation.usecase.ts
│
├── projects/               # Project Domain
├── tasks/                  # Task Domain (Aggregate Root)
├── timer/                  # Timer/Pomodoro Domain
├── analytics/              # Analytics Domain
└── index.ts                # Public exports
```

### Uso

```typescript
// Importar entidades
import { Task, TaskStatus, Priority } from '@ordo-todo/core';

// Crear una tarea
const task = Task.create({
  title: 'Nueva tarea',
  projectId: 'proj_123',
  creatorId: 'user_456',
  priority: Priority.HIGH,
});

// Validar cambios
task.updateStatus(TaskStatus.IN_PROGRESS);
task.complete();

// Para el backend: implementar repository
class PrismaTaskRepository implements TaskRepository {
  async findById(id: string): Promise<Task | null> {
    const data = await this.prisma.task.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }
  
  async save(task: Task): Promise<Task> {
    // Persistir en DB
  }
}
```

### Build

```bash
cd packages/core
npm run build    # Compila TypeScript a dist/
npm run test     # Ejecuta tests
```

---

## 📍 @ordo-todo/db

**Prisma Client y Schema.** Punto único de acceso a la base de datos.

### Estructura

```
packages/db/
├── prisma/
│   ├── schema.prisma       # Schema completo
│   └── migrations/         # Migraciones
├── src/
│   └── index.ts            # Re-exports
├── .env                    # DATABASE_URL
└── package.json
```

### Schema Highlights

```prisma
// Modelos principales
model User { ... }
model Workspace { ... }
model WorkspaceMember { ... }
model Project { ... }
model Task { ... }
model Subtask { ... }
model TimeSession { ... }
model Tag { ... }
model Comment { ... }
model Notification { ... }
model DailyMetrics { ... }
model Achievement { ... }
model AIReport { ... }
```

### Comandos

```bash
cd packages/db

# Desarrollo
npx prisma generate          # Generar cliente
npx prisma db push           # Aplicar schema (dev)
npx prisma studio            # GUI de base de datos

# Migraciones (producción)
npx prisma migrate dev       # Crear migración
npx prisma migrate deploy    # Aplicar migraciones

# Inspección
npx prisma db pull           # Reverse engineer DB
npx prisma format            # Formatear schema
```

### Uso en aplicaciones

```typescript
// apps/backend/src/prisma.service.ts
import { PrismaClient } from '@ordo-todo/db';

const prisma = new PrismaClient();

// Queries
const tasks = await prisma.task.findMany({
  where: { projectId: 'proj_123' },
  include: { subtasks: true },
});
```

---

## 📍 @ordo-todo/api-client

**Cliente HTTP tipado** para comunicarse con el backend.

### Estructura

```
packages/api-client/
├── src/
│   ├── client.ts           # Axios instance
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── workspace.types.ts
│   │   ├── project.types.ts
│   │   ├── task.types.ts
│   │   ├── timer.types.ts
│   │   └── analytics.types.ts
│   └── index.ts
└── package.json
```

### Uso

```typescript
import { apiClient, Task, CreateTaskDto } from '@ordo-todo/api-client';

// Configurar base URL
apiClient.defaults.baseURL = 'http://localhost:3101';

// Configurar token
apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Hacer requests
const tasks = await apiClient.get<Task[]>('/tasks');
const newTask = await apiClient.post<Task>('/tasks', createTaskDto);
```

### Con React Query (en apps)

```typescript
// apps/web/src/lib/api-hooks.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, Task } from '@ordo-todo/api-client';

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => apiClient.get<Task[]>(`/tasks?projectId=${projectId}`),
  });
}

export function useCreateTask() {
  return useMutation({
    mutationFn: (data: CreateTaskDto) => apiClient.post('/tasks', data),
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });
}
```

---

## 📍 @ordo-todo/ui

**Componentes UI compartidos** entre web y desktop. ✅ **Fase 2 Completada (2024-12-06)**

### Estado de Migración

| Categoría | Componentes | Estado |
|-----------|-------------|--------|
| `ui/` | 30 | ✅ Completo |
| `timer/` | 4 | ✅ Completo (props-driven) |
| `task/` | 15 | ✅ Completo (props-driven) |
| `project/` | 11 | ✅ Completo (props-driven) |
| `analytics/` | 7 | ✅ Completo (props-driven) |
| `tag/` | 3 | ✅ Completo |
| `workspace/` | 0 | 🔴 Pendiente (Fase 3) |
| `layout/` | 0 | 🔴 Pendiente (Fase 3) |

### Build Status

```bash
npm run build  # ✅ Compila sin errores
```

### Estructura Actual

```
packages/ui/src/
├── components/
│   ├── ui/          # 30 componentes base (button, input, dialog, etc.)
│   ├── timer/       # 4 componentes (pomodoro-timer, session-history, etc.)
│   ├── task/        # 15 componentes (task-card, task-form, subtask-list, etc.)
│   ├── project/     # 11 componentes (project-card, kanban-board, etc.)
│   ├── analytics/   # 7 componentes (weekly-chart, focus-score, etc.)
│   ├── tag/         # 3 componentes (tag-badge, tag-selector, create-tag-dialog)
│   └── index.ts
├── utils/
│   ├── index.ts     # cn() helper
│   └── colors.ts
└── index.ts
```

### Patrón de Abstracción (Implementado)

Todos los componentes son **platform-agnostic**. Dependencias de plataforma se pasan via props:

```typescript
// ✅ Patrón implementado en todos los componentes
interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects?: ProjectOption[];
  onSubmit: (data: CreateTaskFormData) => Promise<void>;
  onGenerateAIDescription?: (title: string) => Promise<string>;
  isPending?: boolean;
  labels?: {
    title?: string;
    formTitle?: string;
    // ... más labels para i18n
  };
}

// En apps/web - el componente padre maneja hooks y traducciones
const { data: projects } = useAllProjects();
const createTask = useCreateTask();
const t = useTranslations('CreateTaskDialog');

<CreateTaskDialog
  open={open}
  onOpenChange={setOpen}
  projects={projects}
  onSubmit={async (data) => {
    await createTask.mutateAsync(data);
    notify.success(t('success'));
  }}
  isPending={createTask.isPending}
  labels={{
    title: t('title'),
    formTitle: t('form.title'),
  }}
/>
```

### Componentes Refactorizados (Fase 2)

| Componente | Cambios Principales |
|------------|---------------------|
| `task/create-task-dialog.tsx` | `onSubmit`, `projects`, `labels` via props |
| `task/task-detail-panel.tsx` | Render props para sub-componentes |
| `task/activity-feed.tsx` | `activities`, `locale`, `labels` via props |
| `task/comment-thread.tsx` | `onCreate`, `onUpdate`, `onDelete` callbacks |
| `task/attachment-list.tsx` | `resolveUrl`, `onDelete` via props |
| `task/assignee-selector.tsx` | `members`, `onAssign` via props |
| `task/file-upload.tsx` | `onUpload` callback con progress |
| `project/project-board.tsx` | `tasks`, `onUpdateTask` via props |
| `project/project-card.tsx` | `onProjectClick`, `onArchive`, `onDelete` callbacks |
| `project/project-settings.tsx` | `onUpdate`, `onArchive`, `onDelete` callbacks |
| `analytics/ai-weekly-report.tsx` | `onGenerateReport` callback |

### Uso

```typescript
import { 
  Button, 
  Card, 
  TaskCard, 
  TagBadge,
  CreateTaskDialog,
  ProjectBoard,
  ActivityFeed
} from '@ordo-todo/ui';
```

> **Estado:** 🟢 Fase 2 completada. Próximo: Fase 3 (workspace, layout, auth, ai) y Fase 4 (integración en apps).

---

## 📍 @ordo-todo/hooks

**React Hooks compartidos** para lógica común.

### Hooks Disponibles

```typescript
// Debounce
import { useDebounce } from '@ordo-todo/hooks';
const debouncedSearch = useDebounce(searchTerm, 300);

// Local Storage
import { useLocalStorage } from '@ordo-todo/hooks';
const [value, setValue] = useLocalStorage('key', defaultValue);

// Media Query
import { useMediaQuery } from '@ordo-todo/hooks';
const isMobile = useMediaQuery('(max-width: 768px)');

// Click Outside
import { useClickOutside } from '@ordo-todo/hooks';
const ref = useClickOutside(() => setOpen(false));
```

---

## 📍 @ordo-todo/i18n

**Internacionalización** compartida.

### Estructura

```
packages/i18n/
├── src/
│   ├── locales/
│   │   ├── es.json         # Español
│   │   ├── en.json         # English
│   │   └── pt-br.json      # Português
│   ├── config.ts           # i18n config
│   └── index.ts
└── package.json
```

### Agregar traducciones

```json
// locales/es.json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar"
  },
  "tasks": {
    "title": "Tareas",
    "create": "Crear tarea",
    "empty": "No hay tareas"
  }
}
```

---

## 📍 @ordo-todo/config

**Configuraciones compartidas** de ESLint y TypeScript.

### ESLint

```javascript
// apps/web/eslint.config.js
import baseConfig from '@ordo-todo/eslint-config';

export default [
  ...baseConfig,
  // Reglas específicas de web
];
```

### TypeScript

```json
// apps/web/tsconfig.json
{
  "extends": "@ordo-todo/typescript-config/nextjs.json",
  "compilerOptions": {
    // Overrides específicos
  }
}
```

---

## 🔄 Flujo de Dependencias

```
                    ┌─────────────┐
                    │   config    │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────┐       ┌─────────┐       ┌─────────┐
    │  core   │       │   db    │       │  i18n   │
    └────┬────┘       └────┬────┘       └────┬────┘
         │                 │                 │
         └────────┬────────┘                 │
                  │                          │
                  ▼                          │
           ┌────────────┐                    │
           │ api-client │                    │
           └─────┬──────┘                    │
                 │                           │
    ┌────────────┼────────────┐              │
    │            │            │              │
    ▼            ▼            ▼              ▼
┌───────┐   ┌─────────┐   ┌─────────┐   ┌───────┐
│  web  │   │ desktop │   │ mobile  │   │  ui   │
└───────┘   └─────────┘   └─────────┘   └───────┘
```

---

## 🛠️ Comandos Globales

```bash
# Desde la raíz del proyecto

# Build todos los packages
npm run build

# Build un package específico
npm run build --filter=@ordo-todo/core
npm run build --filter=@ordo-todo/db

# Lint todos
npm run lint

# TypeScript check
npm run check-types
```

---

## 📝 Agregar un Nuevo Package

1. Crear carpeta en `packages/`
2. Inicializar con `package.json`:

```json
{
  "name": "@ordo-todo/nuevo-package",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```

3. Agregar a `turbo.json` si necesita build pipeline
4. Importar desde otras apps: `import { ... } from '@ordo-todo/nuevo-package'`
