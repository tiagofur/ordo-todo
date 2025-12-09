---
applyTo: "**"
---

# 🤖 Ordo-Todo Copilot Chat Instructions

Estas instrucciones definen el comportamiento de GitHub Copilot Chat para el proyecto **Ordo-Todo**.

## 🎯 Contexto del Proyecto

**Proyecto**: Ordo-Todo - Plataforma moderna de gestión de tareas
**Stack**: Next.js + React Native + Electron + NestJS + PostgreSQL + Prisma
**Repositorio**: tiagofur/ordo-todo
**Arquitectura**: DDD + Clean Architecture en Turborepo monorepo

## 📁 Estructura del Proyecto

```
ordo-todo/
├── apps/
│   ├── web/           # Next.js 16 (App Router)
│   ├── mobile/        # React Native + Expo
│   ├── desktop/       # Electron + React
│   └── backend/       # NestJS API
├── packages/
│   ├── core/          # DDD Domain (Entities, Use Cases)
│   ├── db/            # Prisma schema & client
│   ├── api-client/    # Shared API client
│   ├── eslint-config/ # Shared ESLint
│   └── typescript-config/ # Shared TSConfig
└── docs/              # Documentación
```

## 🎨 Estilo de Comunicación

### Preferencias del Usuario

- **Idioma principal**: Español (para discusiones técnicas)
- **Código**: Inglés (nombres de variables, funciones, comentarios)
- **Documentación**: Español para docs internas, Inglés para código
- **Formato**: Directo, conciso, sin fluff innecesario
- **Emojis**: ✅ Usar para mejor legibilidad (pero no abusar)

### Tono y Enfoque

- **Proactivo**: Sugerir mejoras sin esperar a que las pidan
- **Educativo**: Explicar el "por qué" de las decisiones
- **Técnico**: Fundamentos en mejores prácticas
- **Práctico**: Soluciones implementables, no teóricas

## 💻 Reglas de Código

> **IMPORTANT**: ALL new UI components MUST go to `packages/ui`. See [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) for MANDATORY patterns.

### Component Location (MANDATORY)

| Tipo | Ubicación |
|------|-----------|
| UI Components | `packages/ui/src/components/ui/` |
| Domain Components | `packages/ui/src/components/[domain]/` |
| Pages | `apps/[app]/src/app/` |
| Containers | `apps/[app]/src/components/` |

### React/Next.js

```typescript
// ✅ SIEMPRE hacer:
- Server Components por defecto (sin 'use client' innecesario)
- TailwindCSS para estilos (no inline styles)
- React Query para server state
- TypeScript estricto
- Componentes < 150 líneas
- Crear componentes en packages/ui (platform-agnostic)
- Pasar datos via props (no hooks en shared components)

// ❌ NUNCA hacer:
- 'use client' cuando no es necesario
- Inline styles
- Componentes gigantes (> 150 líneas)
- Duplicar patrones de código
- Ignorar accesibilidad
- Crear componentes UI en apps/ (deben ir en packages/ui)
- Usar hooks en componentes de packages/ui
```

### NestJS/TypeScript

```typescript
// ✅ SIEMPRE hacer:
- DTOs con validación class-validator
- userId del JWT (@CurrentUser), NUNCA del body
- @Public() decorator para endpoints públicos
- Try-catch con type-safe error handling
- Prisma para base de datos

// ❌ NUNCA hacer:
- Confiar en userId del body (vulnerabilidad) ❌
- Olvidar @Public() en login/register ❌
- console.log (usar Logger inyectado) ❌
- Hardcodear secrets (usar .env) ❌
```

**Pattern de Seguridad**:

```typescript
// ✅ CORRECTO: userId del JWT
@Post('tasks')
async createTask(
  @CurrentUser() user: RequestUser,
  @Body() createTaskDto: CreateTaskDto,
) {
  return this.tasksService.create(user.id, createTaskDto);
}

// ❌ INCORRECTO: userId del body
@Post('tasks')
async createTask(@Body() createTaskDto: CreateTaskDto) {
  const userId = createTaskDto.userId; // ❌ VULNERABILIDAD
}
```

## 🔐 Seguridad Crítica

### JWT Guard Global

**IMPORTANTE**: El backend usa JWT como guard GLOBAL. Todos los endpoints requieren autenticación por defecto.

```typescript
// ✅ Endpoint público (login, register)
@Post('login')
@Public() // ← CRÍTICO: Excluir del guard global
async login(@Body() loginDto: LoginDto) {}

// ✅ Endpoint protegido (automático)
@Get('profile')
async getProfile(@CurrentUser() user: RequestUser) {}
```

## 🛠️ Comandos Frecuentes

### Root (Turborepo)

```powershell
npm run dev                    # All apps
npm run dev --filter=@ordo-todo/web
npm run dev --filter=@ordo-todo/backend
npm run build
npm run lint
npm run test
```

### Backend (NestJS)

```powershell
cd apps/backend
npm run start:dev              # Hot reload
npm run test                   # Unit tests
npm run test:e2e               # E2E tests
```

### Web (Next.js)

```powershell
cd apps/web
npm run dev                    # http://localhost:3100
npm run build
```

### Database (Prisma)

```powershell
npx prisma generate            # Generate client
npx prisma db push             # Push schema
npx prisma migrate dev         # Create migration
npx prisma studio              # GUI
```

## 📚 Referencias Rápidas

### Variables de Entorno Críticas

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ordo_todo
JWT_SECRET=your-secret-here
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

## 🎯 Workflow de Trabajo

### Al Crear Nuevo Endpoint (Backend)

1. ✅ Crear DTO con validaciones `class-validator`
2. ✅ Agregar `@ApiProperty()` para Swagger
3. ✅ Extraer `userId` con `@CurrentUser()` decorator
4. ✅ Agregar `@Public()` si es endpoint público
5. ✅ Documentar con `@ApiOperation()`

### Al Crear Nueva Página (Next.js)

1. ✅ Usar Server Component si no necesita interactividad
2. ✅ Dividir en componentes lógicos
3. ✅ Implementar estados (loading, error, empty)
4. ✅ Considerar responsive design
5. ✅ Validar accesibilidad

### Al Refactorizar Código

1. 🔍 Identificar código duplicado
2. 📦 Extraer a componentes/servicios reutilizables
3. 🏷️ Mejorar nombres (descriptivos y claros)
4. ✅ Validar que funciona igual
5. 📝 Documentar cambios

## 🐛 Debugging Issues Comunes

### Backend

**401 Unauthorized en todos los endpoints**:
- ✅ Verificar `@Public()` en endpoints públicos
- ✅ Validar JWT_SECRET configurado
- ✅ Token no expirado

**TypeScript errors en catch**:
- ✅ Usar: `error instanceof Error ? error.message : String(error)`

### Frontend

**Hydration errors**:
- ✅ Verificar que Server/Client components sean correctos
- ✅ No usar hooks en Server Components

## 📖 Documentación Completa

Para información detallada, consultar:

- **Guía completa**: `.github/copilot-instructions.md`
- **React/Next.js Expert**: `.github/agents/flutter-ui-ux.md`
- **NestJS Expert**: `.github/agents/nest-backend.md`
- **Database Expert**: `.github/agents/postgres-db-specialist.md`
- **CLAUDE.md**: Guía completa del proyecto

## ✨ Filosofía de Trabajo

> **Código limpio, componentizado y seguro.
> Diseño moderno y accesible.
> Documentación clara, ejemplos prácticos.
> DDD + Clean Architecture.**

---

**Versión**: 2.0.0
**Última actualización**: 2025-12-04
**Proyecto**: Ordo-Todo
