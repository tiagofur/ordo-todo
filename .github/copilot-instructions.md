# 🚀 Ordo-Todo Full-Stack Development Guide

Este documento define el comportamiento del agente de GitHub Copilot para el proyecto **Ordo-Todo**.

## 📋 Navegación Rápida

---

## 🏗️ Arquitectura del Proyecto

**Stack Técnico**:

- **Frontend Web**: Next.js 16 + React 19 + TailwindCSS 4 + TanStack Query
- **Frontend Mobile**: React Native + Expo SDK 52+
- **Frontend Desktop**: Electron + React + Vite
- **Backend**: NestJS + TypeScript + PostgreSQL 16 + Prisma 6
- **Auth**: JWT global con Passport.js + `@Public()` decorator
- **Monorepo**: Turborepo con workspaces

**Estructura**:

```
ordo-todo/
├── apps/
│   ├── web/           # Next.js 16 App Router
│   ├── mobile/        # React Native + Expo
│   ├── desktop/       # Electron + React
│   └── backend/       # NestJS API
├── packages/
│   ├── core/          # DDD Domain (Entities, Use Cases)
│   ├── db/            # Prisma schema & client
│   ├── api-client/    # Shared API client
│   ├── eslint-config/ # Shared ESLint
│   └── typescript-config/ # Shared TSConfig
└── docs/              # Documentación técnica
```

---

## Developer Workflows

### Root Commands (Turborepo)

```powershell
# Install dependencies
npm install

# Development - all apps
npm run dev

# Development - specific app
npm run dev --filter=@ordo-todo/web
npm run dev --filter=@ordo-todo/backend
npm run dev --filter=@ordo-todo/mobile
npm run dev --filter=@ordo-todo/desktop

# Building
npm run build                  # Build all packages and apps
npm run build --filter=@ordo-todo/core

# Quality Checks
npm run lint                   # Lint all workspaces
npm run check-types            # Type check all workspaces
npm run format                 # Format with Prettier
npm run test                   # Run all tests
```

### Backend Setup (NestJS)

```powershell
cd apps/backend
npm install

# Configurar variables de entorno
Copy-Item .env.example .env
# Editar .env: DATABASE_URL, JWT_SECRET

# Base de datos (PostgreSQL)
npx prisma db push             # Push schema to database
npx prisma generate            # Generate Prisma client
npx prisma studio              # Open Prisma Studio GUI
npx prisma migrate dev         # Create and apply migration

# Desarrollo
npm run start:dev              # http://localhost:3001
# Swagger docs: http://localhost:3001/api/docs

# Testing
npm run test                   # Unit tests
npm run test:e2e               # Integration tests
npm run test:cov               # Coverage

# Linting y build
npm run lint                   # ESLint + auto-fix
npm run build                  # Compilar TypeScript
```

**Variables de entorno críticas**:

```env
NODE_ENV=development           # development | production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ordo_todo
JWT_SECRET=your-secret-here    # Generar: openssl rand -hex 32
NEXTAUTH_SECRET=your-secret    # Para NextAuth
NEXTAUTH_URL=http://localhost:3000
```

### Web Setup (Next.js)

```powershell
cd apps/web

# Desarrollo
npm run dev                    # http://localhost:3100

# Testing
npm run test                   # Unit y widget tests
npm run lint                   # ESLint

# Build
npm run build                  # Production build
```

### Mobile Setup (Tauri 2 — rebuild en curso, ODD 020)

```powershell
cd apps/mobile

# Desarrollo
npm run dev                    # Vite dev server (puerto 1421)
npm run build                  # Build del frontend
npm run tauri android init     # Generar proyecto Android (ya hecho)
# APK debug: requiere cargo de rustup primero en PATH (el de Homebrew no
# tiene std de Android) + JAVA_HOME/ANDROID_HOME/NDK_HOME
```

### Desktop Setup (Tauri)

```powershell
cd apps/desktop

# Desarrollo
npm run dev                    # Vite dev server
npm run electron:dev           # Dev with Electron

# Build
npm run build:win              # Build for Windows
npm run build:mac              # Build for macOS
npm run build:linux            # Build for Linux
npm run build:all              # Build for all platforms
```

### Database Commands

```powershell
# Desde apps/web o apps/backend
npx prisma db push             # Push schema
npx prisma generate            # Generate client
npx prisma studio              # Open GUI
npx prisma migrate dev         # Create migration
npx prisma migrate deploy      # Apply migrations (prod)
```

### Docker Setup

```powershell
# PostgreSQL con Docker
docker run --name ordo-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ordo_todo \
  -p 5432:5432 \
  -d pgvector/pgvector:0.8.7-pg16

# O usar docker-compose
docker-compose up -d
```

---

# React/Next.js Frontend: UI/UX Architecture

## 👤 Perfil del Agente

Soy un **experto en React/Next.js Frontend** especializado en:

- ✨ Diseño UI/UX moderno con Radix UI + TailwindCSS
- 🧩 Arquitectura basada en componentes
- 🎨 Sistemas de theming y diseño
- ♿ Accesibilidad y mejores prácticas
- 🚀 Performance y Server Components

## 🎯 Filosofía de Diseño

### Principios Visuales

- **Moderno y Minimalista**: Interfaces limpias con aire contemporáneo
- **Colorido y Alegre**: Uso de colores vibrantes pero balanceados
- **Espacioso**: Respiración visual generosa (breathing room)
- **Consistente**: Mismo lenguaje visual en toda la app
- **Accesible**: WCAG AA como mínimo en contraste y tamaños

### Principios Técnicos

- **Componentización**: Pequeños componentes reutilizables
- **DRY (Don't Repeat Yourself)**: Reutilizar código agresivamente
- **Single Responsibility**: Cada componente hace una cosa bien
- **Performance First**: Server Components, lazy loading, memoization
- **Type Safety**: TypeScript estricto en todo momento

## 📐 Reglas de Componentización

> **IMPORTANT**: ALL new UI components MUST go to `packages/ui`. See [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) for MANDATORY patterns.

### ✅ SIEMPRE Extraer Componente Cuando:

1. El código supera **100-150 líneas**
2. Se repite el mismo patrón **2+ veces**
3. Tiene **lógica compleja** propia
4. Puede ser **reutilizado** en otras pantallas
5. Tiene su **propio estado**
6. Mejora la **legibilidad** general

### 🏗️ Ubicación de Componentes (MANDATORY)

| Tipo | Ubicación | Descripción |
|------|-----------|-------------|
| Componentes UI base | `packages/ui/src/components/ui/` | button, card, dialog |
| Componentes de dominio | `packages/ui/src/components/[domain]/` | TaskCard, ProjectBoard |
| Páginas/Routes | `apps/[app]/src/app/` | page.tsx, layout.tsx |
| Containers | `apps/[app]/src/components/` | TaskListContainer |

### 🏗️ Patrón Platform-Agnostic (MANDATORY)

```typescript
// packages/ui/src/components/task/task-card.tsx

// NO hooks, NO stores, NO API calls
// Solo datos via props

interface TaskCardProps {
  task: Task;                           // Data from parent
  onTaskClick: (id: string) => void;    // Callback from parent
  labels?: { complete?: string };       // i18n from parent
}

export function TaskCard({ task, onTaskClick, labels }: TaskCardProps) {
  return <Card onClick={() => onTaskClick(task.id)}>{task.title}</Card>;
}
```

### 🏗️ Imports

```typescript
// En apps: import desde @ordo-todo/ui
import { Button, Card, TaskCard, cn } from '@ordo-todo/ui';

// En packages/ui: imports relativos con .js
import { Button } from '../ui/button.js';
```

## 🎨 Sistema de Diseño - Ordo-Todo

### Styling con TailwindCSS

```typescript
// Usar siempre clases de Tailwind, NO estilos inline
// ✅ CORRECTO
<div className="bg-background p-4 rounded-lg shadow-sm">

// ❌ INCORRECTO
<div style={{ backgroundColor: 'white', padding: '16px' }}>
```

### Component Variants con CVA

```typescript
import { cva } from "class-variance-authority";

const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-500 text-white hover:bg-gray-600",
      ghost: "bg-transparent hover:bg-gray-100",
    },
    size: {
      sm: "px-2 py-1 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
```

### Form Handling con React Hook Form + Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Title required"),
  dueDate: z.date().optional(),
});

function TaskForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} />
      {errors.title && <span>{errors.title.message}</span>}
    </form>
  );
}
```

## 💻 Patrones de Código

### ✅ BIEN: Server Components por defecto

```typescript
// app/tasks/page.tsx - Server Component (default)
async function TasksPage() {
  const tasks = await getTasks(); // Fetch en servidor

  return (
    <div>
      <TaskList tasks={tasks} />
      <CreateTaskButton /> {/* Client Component */}
    </div>
  );
}

// components/create-task-button.tsx
"use client"; // Solo cuando necesitas interactividad

function CreateTaskButton() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

### ✅ BIEN: Data Fetching con React Query

```typescript
// lib/api-hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: apiClient.getTasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
```

### ❌ MAL: Client Component innecesario

```typescript
// ❌ INCORRECTO - No necesita ser Client Component
"use client";

function TaskCard({ task }) {
  return (
    <div className="p-4 bg-white rounded">
      <h3>{task.title}</h3>
    </div>
  );
}
```

## 🚀 Performance

### Optimizaciones

1. **Server Components** por defecto (no 'use client' innecesario)
2. **Lazy loading** para componentes pesados
3. **Memoización** con useMemo/useCallback cuando es necesario
4. **Image optimization** con next/image
5. **Font optimization** con next/font

```typescript
// ✅ Lazy loading
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./heavy-chart"), {
  loading: () => <Skeleton />,
});

// ✅ Memoización apropiada
const expensiveValue = useMemo(() => computeExpensive(data), [data]);

// ✅ Image optimization
import Image from "next/image";
<Image src="/hero.png" width={800} height={600} alt="Hero" priority />;
```

## ♿ Accesibilidad

### Checklist Obligatorio

- [ ] Touch targets mínimo **44x44px**
- [ ] Contraste de texto mínimo **4.5:1** (WCAG AA)
- [ ] Labels para todos los inputs
- [ ] Estados de foco visibles
- [ ] Navegación por teclado
- [ ] aria-labels en iconos sin texto

### Implementación con Radix UI

```typescript
import * as Dialog from "@radix-ui/react-dialog";

// Radix UI maneja automáticamente:
// - Focus trapping
// - Escape to close
// - Click outside to close
// - aria-* attributes
```

## 📱 Responsive Design

### Breakpoints de Tailwind

```typescript
// Tailwind breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {tasks.map(task => <TaskCard key={task.id} task={task} />)}
</div>
```

## 📚 Tareas Comunes

### Al Crear una Nueva Página

1. ✅ Usar Server Component si no necesita interactividad
2. ✅ Dividir en componentes lógicos
3. ✅ Implementar estados (loading, error, empty)
4. ✅ Considerar responsive design
5. ✅ Validar accesibilidad
6. ✅ Agregar metadata para SEO

### Al Crear Componente Reutilizable

1. 📋 Definir props con TypeScript
2. 🎨 Usar CVA para variants
3. 📖 Documentar con JSDoc
4. ♿ Validar accesibilidad
5. ⚡ Optimizar renders

---

# NestJS Backend: API Architecture

## 🎯 Principios de Diseño Backend

### Arquitectura

- **Modular**: Cada feature es un módulo independiente
- **DTOs Estrictos**: Validación con `class-validator` en TODOS los endpoints
- **Type-Safe**: TypeScript estricto (`strict: true` en tsconfig)
- **Dependency Injection**: Usar constructores, NO instanciar servicios manualmente
- **Repository Pattern**: Acceso a datos a través de Prisma services

### Convenciones de Código

- **Naming**: `kebab-case` para archivos, `PascalCase` para clases, `camelCase` para variables
- **Decorators**: Agrupar por categoría (`@Controller`, `@UseGuards`, `@ApiTags`)
- **Error Handling**: Usar excepciones NestJS (`NotFoundException`, `BadRequestException`)
- **Logging**: Logger inyectado por módulo, NO `console.log`
- **Async/Await**: SIEMPRE preferir sobre Promises `.then()`

## Seguridad y Autenticación

### Global JWT Guard

**CRÍTICO**: El proyecto usa JWT como guard GLOBAL:

```typescript
// apps/backend/src/auth/auth.module.ts
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard, // ← TODOS los endpoints requieren JWT por defecto
}
```

### Patrón @Public() Decorator

Para endpoints públicos (login, register), usar el decorator `@Public()`:

```typescript
// ✅ CORRECTO: Endpoint público
@Post('login')
@Public() // ← Excluye del guard global
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}

// ✅ CORRECTO: Endpoint protegido (no necesita decorators adicionales)
@Get('profile')
async getProfile(@CurrentUser() user: RequestUser) {
  return this.usersService.findById(user.id);
}

// ❌ INCORRECTO: Olvidar @Public() en login
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // ERROR: Retornará 401 Unauthorized
}
```

**Decorators de seguridad comunes**:

```typescript
@Public()                    // Excluir de JwtAuthGuard global
@UseGuards(JwtAuthGuard)     // Explícito (redundante si es global)
@ApiBearerAuth()             // Swagger: requiere token
```

### Extracción de Usuario del JWT

**SIEMPRE extraer `userId` del token JWT**, NUNCA del body:

```typescript
// ✅ CORRECTO: userId del JWT con @CurrentUser()
@Post('tasks')
async createTask(
  @CurrentUser() user: RequestUser,
  @Body() createTaskDto: CreateTaskDto,
) {
  return this.tasksService.create(user.id, createTaskDto);
}

// ❌ INCORRECTO: userId del body (VULNERABILIDAD)
@Post('tasks')
async createTask(@Body() createTaskDto: CreateTaskDto) {
  const userId = createTaskDto.userId; // ❌ Puede ser falsificado
  return this.tasksService.create(userId, createTaskDto);
}
```

## 🧩 Patrones de Código Backend

### DTO Pattern con class-validator

**SIEMPRE usar DTOs** con validación:

```typescript
// ✅ CORRECTO: DTO con validación
import { IsString, IsOptional, IsEmail, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({
    description: "Título de la tarea",
    example: "Completar documentación",
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    description: "Descripción de la tarea",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "ID del proyecto",
    required: false,
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}
```

### Error Handling

**Pattern estándar** para catch blocks:

```typescript
// ✅ CORRECTO: Type-safe error handling
try {
  await this.someOperation();
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  this.logger.error(`Operation failed: ${errorMessage}`);
  throw new BadRequestException(`Failed to process: ${errorMessage}`);
}

// ❌ INCORRECTO: Unsafe member access
catch (error) {
  this.logger.error(`Error: ${error.message}`); // TS error
}
```

### Service Pattern con Prisma

```typescript
// ✅ CORRECTO: Service con Prisma
@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger
  ) {}

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        userId,
        status: "TODO",
      },
    });
  }

  async findAllByUser(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
```

### Controller Pattern

```typescript
// ✅ CORRECTO: Thin Controller
@Controller("tasks")
@ApiTags("tasks")
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: "Create new task" })
  @ApiResponse({ status: 201, description: "Task created" })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateTaskDto
  ): Promise<Task> {
    return this.tasksService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all tasks for current user" })
  async findAll(@CurrentUser() user: RequestUser): Promise<Task[]> {
    return this.tasksService.findAllByUser(user.id);
  }
}
```

## 📚 Tareas Comunes Backend

### Crear Nuevo Endpoint Protegido

1. ✅ Crear DTO con validaciones `class-validator`
2. ✅ Agregar `@ApiProperty()` para Swagger
3. ✅ Extraer `userId` con `@CurrentUser()` decorator
4. ✅ Usar try-catch con type-safe error handling
5. ✅ Documentar con `@ApiOperation()` y `@ApiResponse()`

### Crear Endpoint Público

1. ✅ Agregar `@Public()` decorator
2. ✅ Validar inputs exhaustivamente
3. ✅ Rate limiting si es sensible
4. ✅ Logging de intentos fallidos

### Debugging Issues Comunes

**401 Unauthorized en todos los endpoints**:

- ✅ Verificar que endpoints públicos tengan `@Public()`
- ✅ Revisar que JWT_SECRET esté configurado
- ✅ Validar que el token no esté expirado

**TypeScript errors en catch blocks**:

- ✅ Usar pattern: `error instanceof Error ? error.message : String(error)`
- ✅ NO acceder a `error.message` directamente

## 🔗 Referencias Backend

### Archivos Clave

- `apps/backend/src/auth/` - Sistema de autenticación
- `apps/backend/src/*/` - Controllers y services por dominio
- `apps/backend/src/repositories/` - Prisma implementations
- `packages/db/prisma/schema.prisma` - Database schema

### Variables de Entorno Críticas

```env
NODE_ENV=production              # dev vs production behavior
DATABASE_URL=postgresql://...    # PostgreSQL connection
JWT_SECRET=your-secret-key       # Firma de tokens
NEXTAUTH_SECRET=your-secret      # NextAuth
NEXTAUTH_URL=http://localhost:3000
```

---

**Versión**: 2.0.0
**Última actualización**: 2025-12-04
**Proyecto**: Ordo-Todo
