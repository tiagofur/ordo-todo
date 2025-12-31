# 📦 Ordo-Todo Packages - Auditoría Completa

> **Última actualización:** 31 Diciembre 2025
> **Score Global:** 65/100 🟡 **EN MEJORA**
> **Leer primero:** [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md) | [ROADMAP.md](./ROADMAP.md) | [VIOLACIONES-POR-PAQUETE/](./VIOLACIONES-POR-PAQUETE/)

## 📊 Puntuaciones por Paquete

| Paquete                    | Score  | Estado     | Prioridad |
| -------------------------- | ------ | ---------- | --------- |
| packages/typescript-config | 78/100 | 🟡 BUENO   | Baja      |
| packages/eslint-config     | 75/100 | 🟡 BUENO   | Baja      |
| packages/api-client        | 72/100 | 🟡 BUENO   | Media     |
| packages/config            | 72/100 | 🟡 BUENO   | Media     |
| packages/i18n              | 72/100 | 🟡 BUENO   | Media     |
| packages/db                | 62/100 | 🟠 REGULAR | Alta      |
| packages/hooks             | 62/100 | 🟠 REGULAR | Alta      |
| packages/core              | 70/100 | 🟠 REGULAR | Alta      |
| packages/stores            | 58/100 | 🟠 REGULAR | Alta      |
| packages/styles            | 58/100 | 🔴 CRÍTICO | CRÍTICA   |
| packages/ui                | 42/100 | 🔴 CRÍTICO | CRÍTICA   |

## 📁 Documentos de Auditoría

```
docs/packages/
├── README.md                        # Este archivo
├── RESUMEN-EJECUTIVO.md           # Resumen de 5 minutos
├── PLAN-ACCION.md                  # Plan detallado por fases
├── VIOLACIONES-POR-PAQUETE/       # Análisis individual por paquete
│   ├── packages-core.md            # Violaciones detalladas de core
│   ├── packages-ui.md              # Violaciones detalladas de ui
│   ├── packages-hooks.md           # Violaciones detalladas de hooks
│   ├── packages-api-client.md      # Violaciones detalladas de api-client
│   ├── packages-stores.md          # Violaciones detalladas de stores
│   ├── packages-i18n.md           # Violaciones detalladas de i18n
│   ├── packages-db.md             # Violaciones detalladas de db
│   ├── packages-styles.md          # Violaciones detalladas de styles
│   ├── packages-config.md          # Violaciones detalladas de config
│   ├── packages-typescript-config.md # Violaciones detalladas de ts-config
│   └── packages-eslint-config.md  # Violaciones detalladas de eslint-config
└── METRICAS-POR-PAQUETE.md      # Tabla comparativa de métricas
```

---

## 🎯 Plan de Acción Rápido

### Cambios Recientes (Diciembre 2025) ✅

1. **OAuth Implementation** - Backend + Mobile
   - Google OAuth Strategy (passport-google-oauth20)
   - GitHub OAuth Strategy (passport-github2)
   - Método `oauthLogin()` en AuthService
   - Métodos OAuth en UserRepository: `findByProvider()`, `linkOAuthAccount()`, `create(props: any)`

2. **Mobile Parity Progress** - 🟡 61% → 65%
   - Gap Analysis creado: docs/mobile/WEB_VS_MOBILE_GAP_ANALYSIS.md
   - 60+ features comparados entre Web y Mobile
   - Tags page implementada en Mobile

3. **Packages Integration** - Sprint 9 Completado ✅
   - Mobile: Hooks, i18n, stores, styles integrados
   - Desktop: Shared hooks migrados
   - Tokens de diseño para React Native

### Fase 1: CRÍTICO (4-6 semanas) → 75/100

1. **packages/ui** - Refactorización completa (3-4 semanas)
   - Eliminar `'use client'` y hooks de TODOS los componentes
   - Eliminar transparencias y gradientes
2. **packages/core + api-client** - Eliminar tipos `any` (1 semana)
   - 14 usos en core, 16 en api-client (reducido recientemente)
3. **packages/db** - Agregar índices críticos (2 días)
   - 6 foreign keys sin índices

### Fase 2: ALTA (3-4 semanas) → 88/100

4. **packages/hooks + stores** - Testing (2 semanas)
   - 0% test coverage actual
5. **packages/ui** - Accessibility (2 semanas)
   - ARIA labels, keyboard navigation
6. **packages/i18n** - Completar traducciones (1 semana)
   - 104 keys faltantes

**Meta Producción (85+/100):** 7-10 semanas

---

Documentación de los packages compartidos del monorepo.

> **IMPORTANT**: See [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) for MANDATORY patterns when creating new components.

---

## 🏗️ Estructura General

```
packages/
├── core/           # 🎯 Lógica de dominio (DDD)
├── db/             # 🗄️ Prisma Client + Schema
├── api-client/     # 🔌 Cliente HTTP tipado
├── ui/             # 🎨 Componentes UI compartidos (91+ components)
├── hooks/          # 🪝 React Hooks compartidos (100+ hooks)
├── stores/         # 🏪 Zustand stores compartidos
├── i18n/           # 🌍 Internacionalización (3 idiomas)
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
 │       ├── register-user.usecase.ts
 │       ├── change-user-name.usecase.ts
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
import { Task, TaskStatus, Priority } from "@ordo-todo/core";

// Crear una tarea
const task = Task.create({
  title: "Nueva tarea",
  projectId: "proj_123",
  creatorId: "user_456",
  priority: Priority.HIGH,
});

// Validar cambios
task.updateStatus(TaskStatus.IN_PROGRESS);
task.complete();

// OAuth (new methods)
await userRepository.create({
  name: "John Doe",
  email: "john@example.com",
  username: "johndoe",
  avatar: "https://...",
  provider: "google",
  providerId: "123456789",
});

await userRepository.findByProvider("google", "123456789");

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
import { PrismaClient } from "@ordo-todo/db";

const prisma = new PrismaClient();

// Queries
const tasks = await prisma.task.findMany({
  where: { projectId: "proj_123" },
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
import { apiClient, Task, CreateTaskDto } from "@ordo-todo/api-client";

// Configurar base URL
apiClient.defaults.baseURL = "http://localhost:3101";

// Configurar token
apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Hacer requests
const tasks = await apiClient.get<Task[]>("/tasks");
const newTask = await apiClient.post<Task>("/tasks", createTaskDto);
```

### Con React Query (en apps)

```typescript
// apps/web/src/lib/api-hooks.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient, Task } from "@ordo-todo/api-client";

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => apiClient.get<Task[]>(`/tasks?projectId=${projectId}`),
  });
}

export function useCreateTask() {
  return useMutation({
    mutationFn: (data: CreateTaskDto) => apiClient.post("/tasks", data),
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });
}

// Tags (new in mobile)
export function useTags(workspaceId: string) {
  return useQuery({
    queryKey: ["tags", workspaceId],
    queryFn: () => apiClient.getTags(workspaceId),
  });
}
```

---

## 📍 @ordo-todo/ui

**Componentes UI compartidos** entre web y desktop. ✅ **Fases 1-4 Completadas (2025-12-09)**

> **MANDATORY**: See [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) for creating new components.

### Estado de Migración

| Categoría    | Componentes | Estado      |
| ------------ | ----------- | ----------- |
| `ui/`        | 31          | ✅ Completo |
| `timer/`     | 4           | ✅ Completo |
| `task/`      | 15          | ✅ Completo |
| `project/`   | 11          | ✅ Completo |
| `analytics/` | 7           | ✅ Completo |
| `tag/`       | 3           | ✅ Completo |
| `workspace/` | 3           | ✅ Completo |
| `dashboard/` | 5           | ✅ Completo |
| `ai/`        | 2           | ✅ Completo |
| `auth/`      | 1           | ✅ Completo |
| `layout/`    | 2           | ✅ Completo |
| `shared/`    | 7           | ✅ Completo |

**Total: 91+ componentes**

### Mobile Integration ✅

**Estado:** Componentes UI NO son compatibles con React Native (usan DOM APIs). Para Mobile se usan componentes nativos.

**Patrón para Mobile:**

```typescript
// apps/mobile/app/screens/(internal)/tags.tsx
import { useTags, useDeleteTag } from "../../lib/shared-hooks";
import { Feather } from "@expo/vector-icons";

// Usar shared hooks (data layer) pero componentes RN (presentation layer)
const { data: tags } = useTags(workspaceId);

// UI components específicos de React Native (no reutilizar de @ordo-todo/ui)
```

### Build Status

```bash
npm run build --filter=@ordo-todo/ui  # ✅ Compila sin errores
```

### Estructura Actual

```
packages/ui/src/
├── components/
│   ├── ui/          # 31 componentes base (button, input, dialog, etc.)
│   ├── timer/       # 4 componentes (pomodoro-timer, session-history, etc.)
│   ├── task/        # 15 componentes (task-card, task-form, subtask-list, etc.)
│   ├── project/     # 11 componentes (project-card, kanban-board, etc.)
│   ├── analytics/   # 7 componentes (weekly-chart, focus-score, etc.)
│   ├── workspace/   # 3 componentes (workspace-card, workspace-selector, etc.)
│   ├── tag/         # 3 componentes (tag-badge, tag-selector, create-tag-dialog)
│   ├── dashboard/   # 5 componentes (stats-card, upcoming-tasks, etc.)
│   ├── ai/          # 2 componentes (generate-report-dialog, report-card)
│   ├── auth/        # 1 componente (auth-form)
│   ├── layout/      # 2 componentes (sidebar, topbar)
│   ├── shared/      # 7 componentes (breadcrumbs, loading, etc.)
│   └── index.ts
├── utils/
│   ├── index.ts     # cn() helper
│   └── colors.ts    # Color constants
└── index.ts
```

### Patrón de Abstracción (MANDATORY)

**TODOS los componentes DEBEN ser platform-agnostic**. Dependencias de plataforma se pasan via props:

```typescript
// ✅ Patrón OBLIGATORIO en todos los componentes
interface CreateTaskDialogProps {
  // State
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;

  // Data (from parent, NOT from hooks)
  projects?: ProjectOption[];

  // Callbacks (from parent)
  onSubmit: (data: CreateTaskFormData) => Promise<void>;
  onGenerateAIDescription?: (title: string) => Promise<string>;

  // i18n Labels (from parent, NOT from useTranslations)
  labels?: {
    title?: string;
    formTitle?: string;
  };
}

// NO hooks inside component:
// - NO useTasks()
// - NO useTranslations()
// - NO useStore()
// - NO API calls
```

### Usage in Apps

```typescript
// apps/web/src/components/task/create-task-container.tsx
'use client';

import { CreateTaskDialog } from '@ordo-todo/ui';
import { useAllProjects, useCreateTask } from '@/lib/api-hooks';
import { useTranslations } from 'next-intl';

export function CreateTaskContainer() {
  const { data: projects } = useAllProjects();
  const createTask = useCreateTask();
  const t = useTranslations('CreateTaskDialog');

  return (
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
  );
}
```

### Import

```typescript
import {
  Button,
  Card,
  TaskCard,
  TagBadge,
  CreateTaskDialog,
  ProjectBoard,
  ActivityFeed,
  cn,
} from "@ordo-todo/ui";
```

> **Estado:** 🟢 Fases 1-4 completadas. Fase 5: Integración completa en apps.

### Mobile Integration ✅

**Apps integradas:**

- ✅ Web - usa @ordo-todo/ui (91+ componentes)
- ✅ Desktop - usa @ordo-todo/ui (91+ componentes)
- 🟡 Mobile - usa componentes nativos RN + shared hooks

**Shared Hooks Implementation ✅:**

```typescript
// packages/hooks/src/hooks.ts - createHooks() factory
export function createHooks(apiClient: OrdoApiClient, queryClient: QueryClient) {
  return {
    useCurrentUser: () => useQuery(...),
    useLogin: () => useMutation(...),
    useTags: (workspaceId: string) => useQuery(...),
    useCreateTag: () => useMutation(...),
    useDeleteTag: () => useMutation(...),
    // ... 90+ more hooks
  };
}
```

**Mobile Shared Hooks:**

```typescript
// apps/mobile/app/lib/shared-hooks.ts
export const sharedHooks = createHooks(apiClient, queryClient);
```

---

## 📍 @ordo-todo/hooks

**React Hooks compartidos** para lógica común.

### Hooks Disponibles

```typescript
// Debounce
import { useDebounce } from "@ordo-todo/hooks";
const debouncedSearch = useDebounce(searchTerm, 300);

// Local Storage
import { useLocalStorage } from "@ordo-todo/hooks";
const [value, setValue] = useLocalStorage("key", defaultValue);

// Media Query
import { useMediaQuery } from "@ordo-todo/hooks";
const isMobile = useMediaQuery("(max-width: 768px)");

// Click Outside
import { useClickOutside } from "@ordo-todo/hooks";
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
import baseConfig from "@ordo-todo/eslint-config";

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
