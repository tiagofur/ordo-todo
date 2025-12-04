# 🔄 Guía de Migración al Core Package

## 📋 Resumen

Esta guía explica cómo migrar el código existente de las aplicaciones (Web, Mobile, Desktop) para usar el nuevo `@ordo-todo/core` package y eliminar duplicación de código.

## 🎯 Objetivos

1. ✅ Eliminar constantes duplicadas
2. ✅ Reemplazar validaciones inline con esquemas del Core
3. ✅ Usar utilidades compartidas en lugar de código custom
4. ✅ Mantener type safety completo
5. ✅ Mejorar mantenibilidad del código

---
en, ahora quiero 
## 📦 Web App - Plan de Migración

### Fase 1: Constantes (1-2 horas)

#### 1.1 Colores de Proyectos

**Archivos afectados:**
- `apps/web/src/components/project/create-project-dialog.tsx`
- `apps/web/src/components/project/project-settings.tsx`
- `apps/web/src/components/project/project-settings-dialog.tsx`

**Antes:**
```typescript
const projectColors = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6", 
  "#8B5CF6", "#EC4899", "#6B7280"
];
```

**Después:**
```typescript
import { PROJECT_COLORS } from '@ordo-todo/core';

const projectColors = PROJECT_COLORS;
```

#### 1.2 Colores de Tags

**Archivos afectados:**
- `apps/web/src/components/tag/create-tag-dialog.tsx`

**Antes:**
```typescript
const tagColors = [
  "#EF4444", "#F59E0B", "#10B981", ...
];
```

**Después:**
```typescript
import { TAG_COLORS } from '@ordo-todo/core';

const tagColors = TAG_COLORS;
```

#### 1.3 Tipos de Workspace

**Archivos afectados:**
- `apps/web/src/components/workspace/create-workspace-dialog.tsx`

**Antes:**
```typescript
const workspaceTypes = ["PERSONAL", "WORK", "TEAM"] as const;
```

**Después:**
```typescript
import { WORKSPACE_TYPES } from '@ordo-todo/core/validation';

const workspaceTypes = WORKSPACE_TYPES;
```

---

### Fase 2: Validaciones (2-3 horas)

#### 2.1 Task Validation

**Archivos afectados:**
- `apps/web/src/components/task/create-task-dialog.tsx`
- `apps/web/src/components/task/task-detail-dialog.tsx`

**Antes:**
```typescript
const createTaskSchema = z.object({
  title: z.string().min(1, t('validation.titleRequired')),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  projectId: z.string().min(1, t('validation.projectRequired')),
});
```

**Después:**
```typescript
import { createTaskSchema } from '@ordo-todo/core';

// Usar directamente el schema del core
const form = useForm({
  resolver: zodResolver(createTaskSchema),
});
```

**Nota:** Si necesitas mensajes de error personalizados con i18n, puedes extender el schema:
```typescript
import { createTaskSchema } from '@ordo-todo/core';

const localizedSchema = createTaskSchema.extend({
  title: z.string().min(1, t('validation.titleRequired')),
});
```

#### 2.2 Project Validation

**Archivos afectados:**
- `apps/web/src/components/project/create-project-dialog.tsx`
- `apps/web/src/components/project/project-settings.tsx`

**Antes:**
```typescript
const createProjectSchema = z.object({
  name: z.string().min(1, t('form.name.required')),
  description: z.string().optional(),
  color: z.string().optional(),
});
```

**Después:**
```typescript
import { createProjectSchema } from '@ordo-todo/core';

const form = useForm({
  resolver: zodResolver(createProjectSchema),
});
```

#### 2.3 Workspace Validation

**Archivos afectados:**
- `apps/web/src/components/workspace/create-workspace-dialog.tsx`
- `apps/web/src/components/workspace/invite-member-dialog.tsx`

**Antes:**
```typescript
const createWorkspaceSchema = z.object({
  name: z.string().min(1, t('validation.nameRequired')),
  description: z.string().optional(),
  type: z.enum(["PERSONAL", "WORK", "TEAM"]),
  color: z.string().optional(),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});
```

**Después:**
```typescript
import { createWorkspaceSchema, inviteMemberSchema } from '@ordo-todo/core';

// Workspace
const workspaceForm = useForm({
  resolver: zodResolver(createWorkspaceSchema),
});

// Invite
const inviteForm = useForm({
  resolver: zodResolver(inviteMemberSchema),
});
```

#### 2.4 User Validation

**Archivos afectados:**
- `apps/web/src/app/api/auth/signup/route.ts`

**Antes:**
```typescript
if (!name || !email || !password) {
  return NextResponse.json(
    { error: 'Todos los campos son requeridos' },
    { status: 400 }
  );
}

if (password.length < 6) {
  return NextResponse.json(
    { error: 'La contraseña debe tener al menos 6 caracteres' },
    { status: 400 }
  );
}
```

**Después:**
```typescript
import { registerUserSchema } from '@ordo-todo/core';

const result = registerUserSchema.safeParse(req.body);
if (!result.success) {
  return NextResponse.json(
    { error: result.error.flatten() },
    { status: 400 }
  );
}

const { name, email, password } = result.data;
```

---

### Fase 3: Utilidades (1-2 horas)

#### 3.1 Formateo de Fechas

**Archivos afectados:**
- Todos los componentes que muestran fechas

**Antes:**
```typescript
const formattedDate = new Date(date).toLocaleDateString();
const relativeTime = formatDistanceToNow(date);
```

**Después:**
```typescript
import { formatDate, formatRelativeTime, isOverdue } from '@ordo-todo/core';

const formattedDate = formatDate(date);
const relativeTime = formatRelativeTime(date);
const overdue = isOverdue(task.dueDate);
```

#### 3.2 Formateo de Tiempo (Timer)

**Archivos afectados:**
- `apps/web/src/components/timer/pomodoro-timer.tsx`
- `apps/web/src/hooks/use-timer.ts`

**Antes:**
```typescript
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
```

**Después:**
```typescript
import { formatTimerDisplay } from '@ordo-todo/core';

const display = formatTimerDisplay(seconds);
```

#### 3.3 Cálculos de Progreso

**Archivos afectados:**
- `apps/web/src/components/project/project-card.tsx`
- `apps/web/src/components/analytics/productivity-chart.tsx`

**Antes:**
```typescript
const progress = Math.round((completed / total) * 100);
```

**Después:**
```typescript
import { calculateProgress, calculateProductivityScore } from '@ordo-todo/core';

const progress = calculateProgress(completed, total);
const productivityScore = calculateProductivityScore(
  completedTasks,
  totalTasks,
  focusMinutes
);
```

#### 3.4 Manipulación de Strings

**Archivos afectados:**
- Componentes que generan slugs o truncan texto

**Antes:**
```typescript
const slug = name.toLowerCase().replace(/\s+/g, '-');
const truncated = text.length > 100 ? text.slice(0, 100) + '...' : text;
```

**Después:**
```typescript
import { generateSlug, truncate } from '@ordo-todo/core';

const slug = generateSlug(name);
const truncated = truncate(text, 100);
```

---

## 📱 Mobile App - Plan de Migración

### Implementación Directa

Como la Mobile App está en desarrollo, puede usar el Core Package desde el inicio:

```typescript
// src/screens/Tasks/CreateTaskScreen.tsx
import { createTaskSchema, TASK_PRIORITIES } from '@ordo-todo/core';
import { zodResolver } from '@hookform/resolvers/zod';

export function CreateTaskScreen() {
  const form = useForm({
    resolver: zodResolver(createTaskSchema),
  });

  // Usar constantes
  const priorities = Object.values(TASK_PRIORITIES);

  return (
    <View>
      {/* UI components */}
    </View>
  );
}
```

---

## 💻 Desktop App - Plan de Migración

### Reutilizar Componentes de Web

La Desktop App puede importar componentes directamente de la Web App:

```typescript
// src/renderer/App.tsx
import { TaskList, PomodoroTimer } from '@web/components';
import { createTaskSchema, PROJECT_COLORS } from '@ordo-todo/core';

export function DesktopApp() {
  return (
    <div>
      <PomodoroTimer />
      <TaskList />
    </div>
  );
}
```

---

## ⚙️ Backend - Plan de Migración

### Validación de Requests

**Archivos afectados:**
- `apps/backend/src/modules/tasks/tasks.controller.ts`
- `apps/backend/src/modules/projects/projects.controller.ts`
- Todos los controllers

**Antes:**
```typescript
@Post()
async create(@Body() createTaskDto: CreateTaskDto) {
  // Validación manual o con class-validator
  return this.tasksService.create(createTaskDto);
}
```

**Después:**
```typescript
import { createTaskSchema } from '@ordo-todo/core';

@Post()
async create(@Body() body: unknown) {
  // Validar con Zod
  const result = createTaskSchema.safeParse(body);
  
  if (!result.success) {
    throw new BadRequestException(result.error.flatten());
  }
  
  return this.tasksService.create(result.data);
}
```

**Mejor opción:** Crear un Pipe de validación global:

```typescript
// src/common/pipes/zod-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    
    return result.data;
  }
}

// Usar en controllers
@Post()
async create(
  @Body(new ZodValidationPipe(createTaskSchema)) createTaskDto
) {
  return this.tasksService.create(createTaskDto);
}
```

---

## ✅ Checklist de Migración

### Web App
- [ ] Reemplazar `projectColors` con `PROJECT_COLORS`
- [ ] Reemplazar `tagColors` con `TAG_COLORS`
- [ ] Reemplazar `createTaskSchema` con schema del Core
- [ ] Reemplazar `createProjectSchema` con schema del Core
- [ ] Reemplazar `createWorkspaceSchema` con schema del Core
- [ ] Reemplazar `inviteSchema` con `inviteMemberSchema`
- [ ] Usar `formatDate` y `formatRelativeTime`
- [ ] Usar `formatTimerDisplay` en el timer
- [ ] Usar `calculateProgress` y `calculateProductivityScore`
- [ ] Usar `generateSlug` y `truncate`

### Backend
- [ ] Crear `ZodValidationPipe`
- [ ] Migrar validación de tasks
- [ ] Migrar validación de projects
- [ ] Migrar validación de workspaces
- [ ] Migrar validación de users
- [ ] Usar constantes del Core para límites

### Mobile App
- [ ] Usar schemas del Core desde el inicio
- [ ] Usar constantes del Core
- [ ] Usar utilidades del Core

### Desktop App
- [ ] Importar componentes de Web App
- [ ] Usar Core Package para lógica
- [ ] Implementar características nativas

---

## 🧪 Testing

Después de cada migración, verificar:

1. **Compilación:** `npm run build` debe pasar sin errores
2. **Type checking:** `npm run type-check` debe pasar
3. **Tests:** `npm run test` debe pasar
4. **Funcionalidad:** Probar manualmente las features afectadas

---

## 📊 Beneficios Esperados

- ✅ **80%+ menos código duplicado**
- ✅ **Validación consistente** en todas las apps
- ✅ **Mantenimiento más fácil** - cambiar una vez, aplicar en todas partes
- ✅ **Type safety mejorado** - tipos inferidos automáticamente
- ✅ **Desarrollo más rápido** - reutilizar código existente

---

## 🆘 Soporte

Si encuentras problemas durante la migración:

1. Revisa la documentación del Core: `documentation/core/index.html`
2. Verifica los ejemplos en `packages/core/README.md`
3. Consulta el código existente en `packages/core/src/`

---

**Última actualización:** Diciembre 2025
