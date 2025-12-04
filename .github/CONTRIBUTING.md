# 🤝 Guía de Contribución - PPN

¡Gracias por contribuir a **Pepinillo Pomodoro (PPN)**! Esta guía te ayudará a mantener la calidad y consistencia del proyecto.

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

- **Frontend**: Flutter 3.24+ (Dart 3.5+)
- **Backend**: NestJS 11+ (TypeScript 5.7+)
- **Database**: PostgreSQL 15+
- **Cache**: Redis
- **Payments**: Stripe
- **Auth**: JWT con Passport.js

## 🔧 Setup Inicial

### Backend

```bash
cd backend
npm install

# Configurar .env (copiar de .env.example)
cp .env.example .env

# Levantar PostgreSQL
docker-compose -f docker-compose-db.yml up -d

# Ejecutar migraciones
npm run migration:run

# Iniciar desarrollo
npm run start:dev
```

### Flutter

```bash
cd flutter
flutter pub get
flutter run -d chrome  # o windows, android, ios
```

### Variables de Entorno Requeridas

```env
# Backend (.env)
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=pepinillo_db
JWT_SECRET=your-secret-here
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
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
- ✅ Valida con linters (`npm run lint` / `flutter analyze`)
- ✅ Prueba manualmente la funcionalidad

### 3. Commit

```bash
# Commits atómicos y descriptivos
git commit -m "feat(auth): add password reset endpoint"
git commit -m "fix(timer): resolve pause button state issue"
git commit -m "refactor(widgets): extract StatCard component"
```

### 4. Pull Request

- ✅ Usa el template de PR
- ✅ Completa el checklist
- ✅ Asigna reviewers
- ✅ Linkea issues relacionados

---

## 💻 Standards de Código

### Flutter/Dart

#### ✅ SIEMPRE hacer:

```dart
// 1. Usar theme system
final theme = Theme.of(context);
Container(
  color: theme.componentColors.surface,
  padding: EdgeInsets.all(AppConstants.spacingM),
)

// 2. Componentizar widgets (máx 200 líneas)
class ProfileScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          ProfileHeader(),
          ProfileStats(),
          ProfileActivity(),
        ],
      ),
    );
  }
}

// 3. const constructors
const Text('Static content')
const Icon(Icons.star)

// 4. Documentar componentes reutilizables
/// [StatCard] - Muestra una estadística con icono, valor y label
///
/// Ejemplo:
/// ```dart
/// StatCard(
///   icon: Icons.timer,
///   value: '142',
///   label: 'Sesiones',
/// )
/// ```
class StatCard extends StatelessWidget { }
```

#### ❌ NUNCA hacer:

```dart
// 1. Hardcodear colores/spacing
Container(
  color: Colors.blue,  // ❌
  padding: EdgeInsets.all(16),  // ❌
)

// 2. Widgets gigantes
class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // 500+ líneas aquí ❌
      ],
    );
  }
}

// 3. Duplicar código
// Si ves el mismo patrón 2+ veces, extráelo a un componente ❌
```

#### Accesibilidad (Obligatorio)

```dart
// Touch targets mínimo 48x48dp
InkWell(
  onTap: onPressed,
  child: Container(
    constraints: BoxConstraints(minHeight: 48, minWidth: 48),
    child: Icon(icon),
  ),
)

// Semantics para screen readers
Semantics(
  button: true,
  label: 'Eliminar tarea',
  child: IconButton(onPressed: onDelete, icon: Icon(Icons.delete)),
)
```

### NestJS/TypeScript

#### ✅ SIEMPRE hacer:

```typescript
// 1. DTOs con validación
export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @ApiProperty({ example: 'Completar informe' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// 2. userId del JWT (NUNCA del body)
@Post('tasks')
async createTask(
  @Req() req: AuthenticatedRequest,
  @Body() createTaskDto: CreateTaskDto,
) {
  const userId = req.user.userId; // ✅ Del token JWT
  return this.tasksService.create(userId, createTaskDto);
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
@ApiOperation({ summary: 'Crear nueva tarea' })
@ApiResponse({ status: 201, description: 'Tarea creada' })
@ApiResponse({ status: 400, description: 'Datos inválidos' })
@Post('tasks')
async createTask() { }
```

#### ❌ NUNCA hacer:

```typescript
// 1. userId del body (VULNERABILIDAD)
@Post('tasks')
async createTask(@Body() createTaskDto: CreateTaskDto) {
  const userId = createTaskDto.userId; // ❌ Puede ser falsificado
}

// 2. Olvidar @Public() en login
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // ❌ Retornará 401 Unauthorized
}

// 3. Unsafe error handling
catch (error) {
  this.logger.error(error.message); // ❌ TypeScript error
}

// 4. Hardcodear secrets
const jwtSecret = 'my-secret-key'; // ❌ Usar .env
```

### Database (PostgreSQL + TypeORM)

#### ✅ SIEMPRE hacer:

```typescript
// 1. Migraciones reversibles
export class CreateTasksTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'tasks',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'title', type: 'varchar', length: '255', isNullable: false },
        { name: 'user_id', type: 'uuid', isNullable: false },
      ],
    }));

    // Índices para queries frecuentes
    await queryRunner.createIndex('tasks', new TableIndex({
      name: 'idx_tasks_user_id',
      columnNames: ['user_id'],
    }));

    // Foreign keys
    await queryRunner.createForeignKey('tasks', new TableForeignKey({
      columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tasks');
  }
}

// 2. Transacciones para operaciones críticas
async createTaskWithProject(userId: string, data: CreateTaskDto) {
  return this.dataSource.transaction(async (manager) => {
    const project = await manager.save(Project, data.project);
    const task = await manager.save(Task, { ...data, projectId: project.id, userId });
    return { project, task };
  });
}
```

---

## 🧪 Testing

### Backend Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

**Cobertura mínima**: 70%

### Flutter Tests

```bash
# Unit + Widget tests
flutter test

# Integration tests
flutter test integration_test/

# Analyzer
flutter analyze
```

**Reglas**:
- ✅ Tests para toda lógica de negocio
- ✅ Widget tests para componentes reutilizables
- ✅ Integration tests para flows críticos (login, checkout)

---

## 📝 Pull Requests

### Checklist (Obligatorio)

- [ ] **Código**
  - [ ] Sigue standards de código del proyecto
  - [ ] Sin valores hardcodeados (colores, spacing, secrets)
  - [ ] Componentes < 200 líneas (Flutter)
  - [ ] DTOs validados (Backend)
  
- [ ] **Testing**
  - [ ] Tests unitarios para lógica nueva
  - [ ] Tests pasan localmente
  - [ ] `npm run lint` / `flutter analyze` sin errores
  
- [ ] **Seguridad**
  - [ ] No expone datos sensibles
  - [ ] userId del JWT, nunca del body
  - [ ] @Public() en endpoints públicos
  - [ ] Validación de inputs
  
- [ ] **Documentación**
  - [ ] Comentarios útiles en código complejo
  - [ ] README actualizado si cambia setup
  - [ ] Swagger docs actualizadas (Backend)
  
- [ ] **Performance**
  - [ ] Sin queries N+1
  - [ ] Índices en columnas de búsqueda
  - [ ] const widgets donde sea posible (Flutter)
  
- [ ] **Accesibilidad**
  - [ ] Touch targets mínimo 48x48dp
  - [ ] Contraste mínimo 4.5:1
  - [ ] Semantics labels

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
git commit -m "feat(widgets): create reusable StatCard component"

# Fixes
git commit -m "fix(stripe): handle missing customer_id gracefully"
git commit -m "fix(timer): resolve state inconsistency on pause"

# Refactoring
git commit -m "refactor(profile): extract widgets into components"
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
- **Flutter Expert**: `.github/agents/flutter-ui-ux.md`
- **NestJS Expert**: `.github/agents/nest-backend.md`
- **PostgreSQL Expert**: `.github/agents/postgres-db-specialist.md`
- **Prompts**: `.github/prompts/prompts.prompt.md`

---

## ❓ Preguntas

Si tienes dudas:

1. Consulta la [documentación del proyecto](../docs/)
2. Revisa los archivos en `.github/`
3. Usa `@ppnFlutter` o `@ppnBackend` en Copilot Chat
4. Abre un issue con la etiqueta `question`

---

**¡Gracias por contribuir a PPN!** 🚀
