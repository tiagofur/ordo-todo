# 🤝 Guía de Contribución - Ordo-Todo

¡Gracias por contribuir a **Ordo-Todo**! Esta guía te ayudará a mantener la calidad y consistencia del proyecto.

## 📋 Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Setup Inicial](#setup-inicial)
- [Workflow de Desarrollo](#workflow-de-desarrollo)
- [Standards de Código](#standards-de-código)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Commit Messages](#commit-messages)

---

## 🚀 Stack Tecnológico

- **Frontend Web**: Next.js 16 + React 19 + TailwindCSS 4 + TanStack Query
- **Frontend Mobile**: React Native + Expo SDK 52+
- **Frontend Desktop**: Electron + React + Vite
- **Backend**: NestJS 11+ (TypeScript 5+)
- **Database**: PostgreSQL 16 + Prisma 6
- **Cache**: Redis (opcional)
- **Auth**: JWT con Passport.js
- **Monorepo**: Turborepo con workspaces

## 🔧 Setup Inicial

### Requisitos Previos

- Node.js 20+
- npm 10+
- PostgreSQL 16 (o Docker)
- Git

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tiagofur/ordo-todo.git
cd ordo-todo

# Instalar dependencias (todas las apps y packages)
npm install

# Configurar variables de entorno
cp apps/backend/.env.example apps/backend/.env
# Editar .env con tus valores

# Levantar PostgreSQL con Docker
docker-compose up -d

# Generar cliente Prisma y aplicar schema
cd packages/db
npx prisma generate
npx prisma db push
cd ../..

# Iniciar desarrollo (todas las apps)
npm run dev
```

### Desarrollo por App

```bash
# Backend (NestJS) - http://localhost:3001
cd apps/backend
npm run start:dev

# Web (Next.js) - http://localhost:3100
cd apps/web
npm run dev

# Desktop (Electron)
cd apps/desktop
npm run dev

# Mobile (Expo)
cd apps/mobile
npm run start
```

### Variables de Entorno Requeridas

```env
# Backend (.env)
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ordo_todo
JWT_SECRET=your-secret-here    # Generar: openssl rand -hex 32
JWT_REFRESH_SECRET=your-refresh-secret

# Web (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🔄 Workflow de Desarrollo

### 1. Crear Branch

```bash
# Features
git checkout -b feature/nombre-descriptivo

# Bugfixes
git checkout -b fix/descripcion-del-bug

# Refactoring
git checkout -b refactor/area-a-refactorizar
```

### 2. Desarrollo

- ✅ Sigue los [Standards de Código](#standards-de-código)
- ✅ Escribe tests para lógica nueva
- ✅ Valida con linters (`npm run lint`)
- ✅ Prueba manualmente la funcionalidad

### 3. Commit

```bash
# Commits atómicos y descriptivos
git commit -m "feat(auth): add password reset endpoint"
git commit -m "fix(timer): resolve pause button state issue"
git commit -m "refactor(components): extract StatCard component"
```

### 4. Pull Request

- ✅ Usa el template de PR
- ✅ Completa el checklist
- ✅ Asigna reviewers
- ✅ Linkea issues relacionados

---

## 💻 Standards de Código

### React/Next.js (Web)

#### ✅ SIEMPRE hacer:

```typescript
// 1. Server Components por defecto
async function TasksPage() {
  const tasks = await getTasks();
  return <TaskList tasks={tasks} />;
}

// 2. TailwindCSS para estilos
<div className="bg-background p-4 rounded-lg shadow-sm">
  <h2 className="text-xl font-semibold">{title}</h2>
</div>

// 3. React Query para server state
const { data: tasks, isLoading } = useTasks();

// 4. Componentes < 150 líneas
// Si supera, extraer subcomponentes

// 5. TypeScript estricto
interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}
```

#### ❌ NUNCA hacer:

```typescript
// 1. 'use client' innecesario
"use client"; // ❌ Si no necesitas interactividad

// 2. Inline styles
<div style={{ backgroundColor: 'blue' }}> // ❌

// 3. Componentes gigantes (> 150 líneas)

// 4. Duplicar código
// Si ves el mismo patrón 2+ veces, extráelo
```

### React Native (Mobile)

#### ✅ SIEMPRE hacer:

```typescript
// 1. Usar StyleSheet
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background,
  },
});

// 2. Componentes reutilizables
<Button variant="primary" onPress={handleSubmit}>
  Submit
</Button>

// 3. Expo SDK features
import * as Haptics from 'expo-haptics';
```

### Electron (Desktop)

#### ✅ SIEMPRE hacer:

```typescript
// 1. Separar main/renderer process
// main/index.ts - Node.js environment
// src/ - React/Vite environment

// 2. IPC communication seguro
ipcMain.handle('get-tasks', async () => {
  return await taskService.getAll();
});

// 3. Preload scripts para APIs expuestas
contextBridge.exposeInMainWorld('api', {
  getTasks: () => ipcRenderer.invoke('get-tasks'),
});
```

### NestJS/TypeScript (Backend)

#### ✅ SIEMPRE hacer:

```typescript
// 1. DTOs con validación
export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'Complete documentation' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// 2. userId del JWT (NUNCA del body)
@Post('tasks')
async createTask(
  @CurrentUser() user: RequestUser,
  @Body() createTaskDto: CreateTaskDto,
) {
  return this.tasksService.create(user.id, createTaskDto);
}

// 3. @Public() para endpoints públicos
@Post('login')
@Public() // ✅ Excluir del guard global
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}

// 4. Type-safe error handling
try {
  await this.operation();
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  this.logger.error(`Failed: ${errorMessage}`);
  throw new BadRequestException(errorMessage);
}

// 5. Swagger documentation
@ApiOperation({ summary: 'Create new task' })
@ApiResponse({ status: 201, description: 'Task created' })
@Post('tasks')
async createTask() { }
```

#### ❌ NUNCA hacer:

```typescript
// 1. userId del body (VULNERABILIDAD)
@Post('tasks')
async createTask(@Body() dto: CreateTaskDto) {
  const userId = dto.userId; // ❌ Puede ser falsificado
}

// 2. Olvidar @Public() en login
@Post('login')
async login(@Body() dto: LoginDto) {
  // ❌ Retornará 401 Unauthorized
}

// 3. console.log (usar Logger inyectado)
console.log('debug'); // ❌
this.logger.debug('debug'); // ✅

// 4. Hardcodear secrets
const jwtSecret = 'my-secret-key'; // ❌ Usar .env
```

### Database (PostgreSQL + Prisma)

#### ✅ SIEMPRE hacer:

```typescript
// 1. Migraciones con Prisma
npx prisma migrate dev --name add_avatar_to_users

// 2. Índices para queries frecuentes
@@index([userId])
@@index([status])

// 3. Transacciones para operaciones críticas
await prisma.$transaction(async (tx) => {
  const task = await tx.task.create({ data: taskData });
  await tx.activity.create({ data: { taskId: task.id, action: 'created' } });
  return task;
});

// 4. Select solo campos necesarios
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true },
});
```

---

## 🧪 Testing

### Backend Tests

```bash
cd apps/backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

**Cobertura mínima**: 70%

### Frontend Tests

```bash
# Web
cd apps/web
npm run test        # Unit tests
npm run lint        # ESLint

# Desktop
cd apps/desktop
npm run lint
```

**Reglas**:
- ✅ Tests para toda lógica de negocio
- ✅ Component tests para componentes reutilizables
- ✅ Integration tests para flows críticos (login, task CRUD)

---

## 📝 Pull Requests

### Checklist (Obligatorio)

- [ ] **Código**
  - [ ] Sigue standards de código del proyecto
  - [ ] Sin valores hardcodeados (colores, secrets)
  - [ ] Componentes < 150 líneas (React/RN)
  - [ ] DTOs validados (Backend)
  
- [ ] **Testing**
  - [ ] Tests unitarios para lógica nueva
  - [ ] Tests pasan localmente
  - [ ] `npm run lint` sin errores
  
- [ ] **Seguridad**
  - [ ] No expone datos sensibles
  - [ ] userId del JWT, nunca del body (Backend)
  - [ ] @Public() en endpoints públicos (Backend)
  - [ ] Validación de inputs
  
- [ ] **Documentación**
  - [ ] Comentarios útiles en código complejo
  - [ ] README actualizado si cambia setup
  - [ ] Swagger docs actualizadas (Backend)
  
- [ ] **Performance**
  - [ ] Sin queries N+1 (Backend)
  - [ ] Índices en columnas de búsqueda
  - [ ] Server Components donde sea posible (Web)
  
- [ ] **Accesibilidad**
  - [ ] Touch targets mínimo 44x44px (Mobile)
  - [ ] Contraste mínimo 4.5:1
  - [ ] aria-labels en iconos sin texto

### Tamaño de PR

- ✅ **Pequeño**: < 300 líneas (ideal)
- ⚠️ **Mediano**: 300-500 líneas (requiere justificación)
- ❌ **Grande**: > 500 líneas (dividir en PRs más pequeños)

### Review Process

1. **Self-review**: Revisa tu propio código antes de solicitar review
2. **Automated checks**: CI debe pasar (tests, linter)
3. **Code review**: Al menos 1 aprobación requerida
4. **Testing**: Validar manualmente en dev
5. **Merge**: Squash and merge (commits limpios en main)

---

## 📬 Commit Messages

### Formato

```
<tipo>(<scope>): <descripción corta>

[Descripción larga opcional]

[Footer: refs, breaking changes]
```

### Tipos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **refactor**: Refactorización sin cambiar funcionalidad
- **style**: Cambios de formato (no afectan código)
- **docs**: Cambios en documentación
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento (deps, config)
- **perf**: Mejoras de performance

### Ejemplos

```bash
# Features
git commit -m "feat(auth): add password reset endpoint"
git commit -m "feat(timer): implement pause functionality"
git commit -m "feat(ui): create reusable StatCard component"

# Fixes
git commit -m "fix(api): handle missing auth token gracefully"
git commit -m "fix(timer): resolve state inconsistency on pause"

# Refactoring
git commit -m "refactor(dashboard): extract widgets into components"
git commit -m "refactor(auth): apply theme system to login screen"

# Docs
git commit -m "docs(readme): update setup instructions"
git commit -m "docs(api): add Swagger annotations to tasks endpoints"

# Breaking Changes
git commit -m "feat(api): change task status enum

BREAKING CHANGE: Task status now uses 'pending' instead of 'todo'"
```

---

## 🔗 Referencias

- **Guía completa**: `.github/copilot-instructions.md`
- **React/Next.js Expert**: `.github/agents/react-frontend.md`
- **NestJS Expert**: `.github/agents/nest-backend.md`
- **PostgreSQL Expert**: `.github/agents/postgres-db-specialist.md`
- **Prompts**: `.github/prompts/README.md`

---

## ❓ Preguntas

Si tienes dudas:

1. Consulta la [documentación del proyecto](../docs/)
2. Revisa los archivos en `.github/`
3. Abre un issue con la etiqueta `question`

---

**¡Gracias por contribuir a Ordo-Todo!** 🚀
