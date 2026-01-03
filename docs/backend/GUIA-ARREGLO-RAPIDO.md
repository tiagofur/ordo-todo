# 🚨 Problemas Comunes del Backend - Guía Rápida

**Basado en**: Auditoría de Calidad del 2 de Enero 2025

---

## 🔴 Problema #1: Testing Coverage Baja

### Estado

- **Coverage actual**: ~16%
- **Objetivo**: 70% (estándar Google/Apple)
- **Módulos sin tests**: tasks, users, timers, tags, workflows, search

### Solución Rápida

#### 1. Crear test básico para servicio

```typescript
// modules/servicio/servicio.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { ServicioService } from "./servicio.service";

describe("ServicioService", () => {
  let service: ServicioService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServicioService],
    }).compile();

    service = module.get<ServicioService>(ServicioService);
  });

  describe("metodo", () => {
    it("should return expected result", async () => {
      // Arrange
      const input = "test";

      // Act
      const result = await service.metodo(input);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual("expected");
    });
  });
});
```

#### 2. Ejecutar tests

```bash
# Ejecutar tests
npm run test

# Ver coverage
npm run test:cov

# Ejecutar tests de módulo específico
npm run test -- servicio
```

#### 3. Configurar cobertura mínima en Jest

```javascript
// jest.config.js
module.exports = {
  // ...
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

---

## 🔴 Problema #2: Uso de `any` Type

### Estado

- **Ocurrencias**: 80 en 14 archivos
- **ESLint**: `'@typescript-eslint/no-explicit-any': 'off'`

### Solución Rápida

#### 1. Crear interface específica

```typescript
// ❌ ANTES
async metodo(context: any): Promise<any> {
  return context.data.title;  // Error en runtime si no existe
}

// ✅ DESPUÉS
interface Contexto {
  data: {
    title: string;
    description?: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

async metodo(context: Contexto): Promise<Resultado> {
  return context.data.title;  // TypeScript valida que existe
}
```

#### 2. Crear DTO para controller

```typescript
// ❌ ANTES
@Post()
async crear(@Body() body: any) {
  return this.servicio.crear(body);
}

// ✅ DESPUÉS
class CrearDto {
  @IsString()
  @MinLength(1)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

@Post()
async crear(@Body() dto: CrearDto) {
  return this.servicio.crear(dto);  // Validación automática
}
```

#### 3. Activar warning en ESLint

```javascript
// eslint.config.mjs
// ❌ ANTES
'@typescript-eslint/no-explicit-any': 'off',

// ✅ DESPUÉS
'@typescript-eslint/no-explicit-any': 'warn',
```

---

## 🔴 Problema #3: Bypass del Patrón Repository

### Estado

- **Servicios afectados**: templates, attachments, newsletter, ai, tasks
- **Problema**: Acceso directo a `this.prisma`

### Solución Rápida

#### 1. Crear Repository

```typescript
// ❌ ANTES - Servicio con Prisma directo
@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTemplateDto) {
    return this.prisma.taskTemplate.create({
      data: dto,
    });
  }
}

// ✅ DESPUÉS - Repository separado
// repositories/templates.repository.ts
@Injectable()
export class TemplatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTemplateDto): Promise<TaskTemplate> {
    return this.prisma.taskTemplate.create({
      data: dto,
    });
  }

  async findById(id: string): Promise<TaskTemplate | null> {
    return this.prisma.taskTemplate.findUnique({
      where: { id },
    });
  }

  async findAll(workspaceId: string): Promise<TaskTemplate[]> {
    return this.prisma.taskTemplate.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<TaskTemplate> {
    return this.prisma.taskTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string): Promise<TaskTemplate> {
    return this.prisma.taskTemplate.delete({
      where: { id },
    });
  }
}

// templates/templates.service.ts
@Injectable()
export class TemplatesService {
  constructor(private readonly templatesRepository: TemplatesRepository) {}

  async create(
    dto: CreateTemplateDto,
    workspaceId: string,
  ): Promise<TaskTemplate> {
    return this.templatesRepository.create({ ...dto, workspaceId });
  }

  async findOne(id: string): Promise<TaskTemplate> {
    const template = await this.templatesRepository.findById(id);

    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }

    return template;
  }

  async findAll(workspaceId: string): Promise<TaskTemplate[]> {
    return this.templatesRepository.findAll(workspaceId);
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<TaskTemplate> {
    return this.templatesRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.templatesRepository.delete(id);
  }
}
```

#### 2. Registrar Repository en Module

```typescript
// templates/templates.module.ts
@Module({
  imports: [DatabaseModule],
  controllers: [TemplatesController],
  providers: [
    TemplatesService,
    TemplatesRepository, // ✅ Registrar repository
  ],
  exports: [TemplatesService],
})
export class TemplatesModule {}
```

---

## 🟡 Problema #4: Validaciones Manuales en Controladores

### Estado

- **Ubicación**: tasks.controller.ts, comments.service.ts
- **Problema**: Validación de permisos duplicada

### Solución Rápida

```typescript
// ❌ ANTES - Validación manual en controller
@Get(':id')
@UseGuards(TaskGuard)
async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
  const task = await this.tasksService.findOne(id);
  if (task.ownerId !== user.id) {  // ❌ Duplicado
    throw new ForbiddenException('...');
  }
  return task;
}

// ✅ DESPUÉS - Usar guard existente
@Get(':id')
@UseGuards(TaskGuard)  // ✅ Guard ya maneja la validación
async findOne(@Param('id') id: string) {
  return this.tasksService.findOne(id);
}

// ✅ Para comentarios específicos, crear guard
// common/guards/comment-author.guard.ts
@Injectable()
export class CommentAuthorGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const commentId = request.params.id;

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment || comment.authorId !== user.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return true;
  }
}

// comments.controller.ts
@Put(':id')
@UseGuards(JwtAuthGuard, CommentAuthorGuard)  // ✅ Guard dedicado
async update(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
  return this.commentsService.update(id, dto);  // Sin validación manual
}
```

---

## 🟡 Problema #5: `console.log` en Producción

### Estado

- **Ubicación**: GlobalExceptionFilter, main.ts, tasks.service.ts
- **Problema**: No se puede controlar el nivel de log

### Solución Rápida

```typescript
// ❌ ANTES
console.log("Application running on: http://localhost:" + port);

// ✅ DESPUÉS - Usar Logger de NestJS
import { Logger } from "@nestjs/common";

@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(
      `Exception caught: ${exception instanceof Error ? exception.message : exception}`,
      exception instanceof Error ? exception.stack : "",
    );

    // ...
  }
}

// main.ts
import { Logger } from "@nestjs/common";

const bootstrapLogger = new Logger("Bootstrap");

bootstrapLogger.log(`Application running on: http://localhost:${port}`);
bootstrapLogger.log(`API available at: http://localhost:${port}/${apiPrefix}`);
```

---

## 🟡 Problema #6: Hardcoded Strings y Numbers

### Estado

- **Ubicación**: main.ts, ai.service.ts, app.module.ts, tasks.dto.ts
- **Problema**: Magic numbers y strings repetidos

### Solución Rápida

#### 1. Crear archivo de constantes

```typescript
// config/constants.ts
export const APP_CONFIG = {
  BODY_LIMIT_BYTES: 1024 * 1024, // 1MB
  DEFAULT_PORT: 3101,
  RATE_LIMIT_THRESHOLD: 100,
  RATE_LIMIT_TTL: 60000,
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: 3,
  CIRCUIT_BREAKER_RESET_TIMEOUT: 30000,
};

export const AI_CONFIG = {
  COMPLEXITY: {
    MIN_MESSAGE_LENGTH: 200,
    MIN_HISTORY_LENGTH: 5,
  },
};
```

#### 2. Crear Enums

```typescript
// enums/task-status.enum.ts
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// enums/priority.enum.ts
export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}
```

#### 3. Usar en código

```typescript
// ❌ ANTES
@Get()
findAll() {
  return this.prisma.task.findMany({
    where: { status: { in: ['TODO', 'IN_PROGRESS'] } },  // String hardcoded
    take: 10,  // Magic number
  });
}

// ✅ DESPUÉS
import { TaskStatus } from '../enums/task-status.enum';
import { APP_CONFIG } from '../config/constants';

@Get()
findAll() {
  return this.prisma.task.findMany({
    where: {
      status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },  // Enum tipado
    },
    take: APP_CONFIG.DEFAULT_PAGE_SIZE,  // Constante documentada
  });
}
```

---

## 📋 Checklist Rápida de Arreglo

Antes de hacer commit, verificar:

### Testing

- [ ] Nuevo código tiene tests
- [ ] Tests pasan con `npm run test`
- [ ] Coverage no ha disminuido

### Type Safety

- [ ] No se ha usado `any` sin justificación
- [ ] TypeScript compila sin errores: `npm run check-types`
- [ ] Linting pasa: `npm run lint`

### Code Quality

- [ ] No hay `console.log` en producción
- [ ] No hay código comentado de debug
- [ ] No hay hardcoded strings/numbers sin constante
- [ ] Service usa repository (no `this.prisma` directo)

### Security

- [ ] Validación de DTOs completa
- [ ] Guards en endpoints protegidos
- [ ] No hay validación manual en controller (usar guard)

---

## 🚀 Comandos Útiles

### Verificar calidad antes de commit

```bash
# Type checking
npm run check-types

# Linting
npm run lint

# Tests
npm run test

# Coverage
npm run test:cov

# Build
npm run build
```

### Crear nuevo módulo con tests

```bash
# Generar módulo con NestJS CLI
nest g module nombre-modulo

# Generar servicio
nest g service nombre-servicio

# Generar controller
nest g controller nombre-controller

# Generar DTO manualmente
# crear: nombre-modulo/dto/create-nombre.dto.ts
```

---

## 📚 Recursos

- [Auditoría Completa](./AUDITORIA-2025-01-02.md)
- [Roadmap Detallado](./ROADMAP-MEJORAS-2025.md)
- [Backend Rules](../backend-rules.md)
- [NestJS Best Practices](https://docs.nestjs.com/techniques/performance)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**¿Necesitas ayuda con algún problema específico?** Consulta la auditoría completa para ejemplos detallados.
