# 🏗️ Ordo-Todo Architecture Document

## Decision Record: DDD + Clean Architecture Monorepo

**Fecha**: Diciembre 2025  
**Estado**: ✅ Implementado  
**Stack**: NestJS + Next.js + React Native + Electron

---

## 1. Resumen Ejecutivo

Ordo-Todo adopta una arquitectura de **monorepo con Turborepo** siguiendo los principios de **Domain-Driven Design (DDD)** y **Clean Architecture**.

### Beneficios Clave

| Beneficio | Descripción |
|-----------|-------------|
| **Código compartido** | Core de dominio reutilizable entre web, mobile y desktop |
| **Type-safety** | TypeScript end-to-end desde DB hasta UI |
| **Testing puro** | Core testeable sin infraestructura |
| **Escalabilidad** | Fácil agregar nuevas apps/servicios |
| **Mantenibilidad** | Separación clara de responsabilidades |

---

## 2. Estructura del Monorepo

```
ordo-todo/
├── apps/
│   ├── web/                # Next.js 16 (App Router)
│   │   ├── src/
│   │   │   ├── app/        # Pages + API Routes
│   │   │   ├── components/ # React components
│   │   │   ├── lib/        # API client, utils
│   │   │   └── server/     # Server-side repos
│   │   └── messages/       # i18n translations
│   │
│   ├── backend/            # NestJS REST API (Puerto 3101)
│   │   └── src/
│   │       ├── modules/    # Feature modules
│   │       ├── repositories/
│   │       └── common/     # Guards, filters, pipes
│   │
│   ├── mobile/             # React Native + Expo
│   │   ├── app/            # Expo Router
│   │   └── components/
│   │
│   └── desktop/            # Electron + React + Vite
│       ├── electron/       # Main process
│       └── src/            # Renderer (React)
│
├── packages/
│   ├── core/               # 🎯 NÚCLEO DDD
│   │   └── src/
│   │       ├── shared/     # Base classes + Value Objects
│   │       ├── users/      # User Domain
│   │       ├── workspaces/ # Workspace Domain
│   │       ├── projects/   # Project Domain
│   │       ├── tasks/      # Task Domain (Aggregate Root)
│   │       ├── timer/      # Timer/Pomodoro Domain
│   │       └── analytics/  # Analytics Domain
│   │
│   ├── db/                 # Prisma Client + Schema
│   │   └── prisma/
│   │       └── schema.prisma
│   │
│   ├── api-client/         # Cliente HTTP tipado
│   ├── ui/                 # Componentes UI compartidos
│   ├── hooks/              # React Hooks compartidos
│   ├── i18n/               # Internacionalización
│   └── config/             # ESLint, TypeScript configs
│
├── docs/                   # Documentación
├── turbo.json              # Turborepo config
└── package.json
```

---

## 3. Capas de la Arquitectura

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (Web/Mobile/Desktop → React Components)                     │
│                           │                                  │
│                    API Client / Hooks                        │
└─────────────────────────────│────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  (NestJS Controllers + Services)                             │
│                           │                                  │
│                      Use Cases                               │
└─────────────────────────────│────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                             │
│  (@ordo-todo/core)                                           │
│  - Entities        - Value Objects                          │
│  - Repositories    - Domain Events                          │
│  - Use Cases       - Business Rules                         │
└─────────────────────────────│────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│  (Prisma Repositories, External APIs)                        │
│                           │                                  │
│                    PostgreSQL + Redis                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Dominios (packages/core)

### 4.1 Estructura de un Dominio

```
src/tasks/
├── model/
│   ├── task.entity.ts         # Entidad principal
│   ├── subtask.entity.ts      # Entidades relacionadas
│   └── task-status.vo.ts      # Value Objects
├── provider/
│   └── task.repository.ts     # Interface del repositorio
└── usecase/
    ├── create-task.usecase.ts
    ├── update-task.usecase.ts
    ├── complete-task.usecase.ts
    └── delete-task.usecase.ts
```

### 4.2 Estado de los Dominios

| Dominio | Estado | Entities | Use Cases |
|---------|--------|----------|-----------|
| `users` | ✅ | User | Register, Login, UpdateProfile |
| `workspaces` | ✅ | Workspace, Member, Invitation | CRUD, Invite, Accept |
| `projects` | ✅ | Project | CRUD, Archive |
| `tasks` | ✅ | Task, Subtask | CRUD, Complete, Dependencies |
| `timer` | ✅ | TimerSession | Start, Pause, Complete |
| `analytics` | ✅ | DailyMetrics | Calculate, Report |
| `ai` | 🔜 | AIProfile | Suggestions (futuro) |

---

## 5. API Layer (NestJS)

### Estructura de Módulos

```
apps/backend/src/
├── modules/
│   ├── auth/           # JWT + OAuth
│   ├── users/          # User management
│   ├── workspaces/     # Workspace CRUD
│   ├── projects/       # Project CRUD
│   ├── tasks/          # Task CRUD + subtasks
│   ├── tags/           # Tag management
│   ├── timer/          # Pomodoro timer
│   ├── analytics/      # Metrics + reports
│   ├── notifications/  # Push + in-app
│   ├── gamification/   # XP, levels, achievements
│   └── ai/             # AI suggestions
│
├── repositories/       # Prisma implementations
├── common/
│   ├── guards/         # Auth guards
│   ├── filters/        # Exception filters
│   └── pipes/          # Validation pipes
└── main.ts
```

### Endpoints Principales

| Módulo | Base Path | Métodos |
|--------|-----------|---------|
| Auth | `/api/v1/auth` | login, register, refresh, logout |
| Tasks | `/api/v1/tasks` | CRUD, complete, subtasks |
| Projects | `/api/v1/projects` | CRUD, archive, members |
| Workspaces | `/api/v1/workspaces` | CRUD, invite, accept |
| Timer | `/api/v1/timer` | start, stop, pause, active |
| Analytics | `/api/v1/analytics` | daily, weekly, monthly |

---

## 6. Decisiones Arquitectónicas

| Decisión | Elección | Razón |
|----------|----------|-------|
| Monorepo | Turborepo | Build caching, code sharing |
| Arquitectura | DDD + Clean | Testabilidad, mantenibilidad |
| API | NestJS REST | Estándar, escalable |
| Database | PostgreSQL | Full-text search, relaciones complejas |
| ORM | Prisma | Type-safe, excelente DX |
| State (client) | Zustand | Ligero, simple |
| State (server) | TanStack Query | Caching, optimistic updates |
| Styling | TailwindCSS + Radix | Utility-first, accesible |
| Mobile | Expo | Cross-platform, rapid dev |
| Desktop | Electron | Experiencia nativa |

---

## 7. Patrones Utilizados

### Repository Pattern
```typescript
// Interface en Core
export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
}

// Implementación en Backend
export class PrismaTaskRepository implements TaskRepository {
  constructor(private prisma: PrismaService) {}
  
  async findById(id: string): Promise<Task | null> {
    const data = await this.prisma.task.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }
}
```

### Use Case Pattern
```typescript
export class CreateTaskUseCase {
  constructor(private taskRepo: TaskRepository) {}
  
  async execute(input: CreateTaskInput): Promise<Task> {
    const task = Task.create(input);
    return this.taskRepo.save(task);
  }
}
```

---

## 8. Guías de Desarrollo

### Agregar un nuevo dominio

1. Crear carpeta en `packages/core/src/[domain]/`
2. Definir entidades en `model/`
3. Definir repository interface en `provider/`
4. Crear use cases en `usecase/`
5. Exportar desde `index.ts`
6. Implementar repository en backend
7. Crear controller y endpoints

### Agregar un nuevo endpoint

1. Crear DTO en `dto/`
2. Crear método en Service
3. Crear endpoint en Controller
4. Agregar método en `api-client`
5. Crear hook en frontend

---

## 9. Referencias

- [PRD.md](./PRD.md) - Product Requirements
- [TECHNICAL_DESIGN.md](./TECHNICAL_DESIGN.md) - Especificaciones técnicas
- [WIREFRAMES.md](./WIREFRAMES.md) - Diseños UI/UX

---

**Versión**: 2.0  
**Última actualización**: Diciembre 2025
