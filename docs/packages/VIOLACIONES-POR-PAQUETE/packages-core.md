# 📦 Análisis Detallado: packages/core

**Score:** 65/100
**Estado:** 🟠 REGULAR - Requiere mejoras ALTA prioridad

---

## 📊 Resumen de Violaciones

| Severidad    | Cantidad | Líneas | Archivos Afectados |
| ------------ | -------- | ------ | ------------------ |
| **CRÍTICAS** | 10       | 14+    | 7 archivos         |
| **ALTAS**    | 8        | 20+    | 5 archivos         |
| **MEDIAS**   | 15       | 52+    | 20+ archivos       |
| **BAJAS**    | 5        | 8+     | 3 archivos         |

**Total Violaciones:** 38

---

## 🚨 Violaciones CRÍTICAS

### 1. TypeScript Strict Mode - `any` type usage

**Violaciones:**

#### 1.1 src/shared/entity.ts:22, 52

```typescript
// ❌ ACTUAL
sameId(other: Entity): boolean {
  const id: any = this.id as any;
  // ...
}

// ✅ DEBERÍA SER
sameId(other: Entity): boolean {
  const id = this.id;
  // ...
}
```

#### 1.2 src/shared/use-case.ts:2

```typescript
// ❌ ACTUAL
export interface UseCase<IN, OUT> {
  execute(data: IN, loggedUser?: any): Promise<OUT>;
}

// ✅ DEBERÍA SER
export interface LoggedUser {
  id: string;
  email: string;
  role: string;
}

export interface UseCase<IN, OUT> {
  execute(data: IN, loggedUser?: LoggedUser): Promise<OUT>;
}
```

#### 1.3 src/shared/value-object.ts:1

```typescript
// ❌ ACTUAL
export abstract class ValueObject<T, V = any> {
  // ...
}

// ✅ DEBERÍA SER
export abstract class ValueObject<T, V = unknown> {
  // ...
}
```

#### 1.4 src/tasks/model/task.entity.ts:24

```typescript
// ❌ ACTUAL
export class Task extends Entity<TaskProps> {
  tags?: any[];
  // ...
}

// ✅ DEBERÍA SER
export class Task extends Entity<TaskProps> {
  tags?: TagId[]; // o tags?: Tag[] (evitar circular deps)
  // ...
}
```

#### 1.5 src/habits/provider/habit.repository.ts:2-13

```typescript
// ❌ ACTUAL
export interface IHabitRepository {
  create(habit: any): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any>;
  update(habit: any): Promise<any>;
  delete(id: string): Promise<void>;
  // ...
}

// ✅ DEBERÍA SER
// Primero crear habit.entity.ts:
export class Habit extends Entity<HabitProps> {
  // ...
}

// Luego tipar el repository:
export interface IHabitRepository {
  create(habit: Habit): Promise<Habit>;
  findAll(): Promise<Habit[]>;
  findById(id: string): Promise<Habit | null>;
  update(habit: Habit): Promise<Habit>;
  delete(id: string): Promise<void>;
  // ...
}
```

#### 1.6 src/tasks/usecase/get-deleted-tasks.usecase.ts:9

```typescript
// ❌ ACTUAL
export class GetDeletedTasksUseCase implements UseCase<void, any[]> {
  // ...
}

// ✅ DEBERÍA SER
export class GetDeletedTasksUseCase implements UseCase<void, Task[]> {
  // ...
}
```

#### 1.7 src/projects/usecase/get-deleted-projects.usecase.ts:9

```typescript
// ❌ ACTUAL
export class GetDeletedProjectsUseCase implements UseCase<void, any[]> {
  // ...
}

// ✅ DEBERÍA SER
export class GetDeletedProjectsUseCase implements UseCase<void, Project[]> {
  // ...
}
```

#### 1.8 src/ai/ai-service.ts:9, src/ai/usecase/generate-weekly-report.usecase.ts

```typescript
// ❌ ACTUAL
async generateWeeklyReport(context?: any): Promise<AIReport> {
  // ...
}

// ✅ DEBERÍA SER
export interface AIReportContext {
  userId: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  workspaceId?: string;
}

async generateWeeklyReport(context?: AIReportContext): Promise<AIReport> {
  // ...
}
```

**Regla violada:** Rule 4 - TypeScript Strict Mode

**Impacto:** Pérdida de type safety, errores en tiempo de ejecución

**Prioridad:** CRÍTICA

**Tiempo estimado para corregir:** 1 semana

---

## 🟠 Violaciones ALTAS

### 2. DRY Violations - Code Duplication

#### 2.1 Soft Delete Pattern Duplicated

**Archivos afectados:**

- src/tasks/model/task.entity.ts:91-105
- src/projects/model/project.entity.ts:99-113
- src/workspaces/model/workspace.entity.ts:62-76

```typescript
// ❌ DUPLICADO en 3 archivos
softDelete(): this {
  return this.clone({
    isDeleted: true,
    deletedAt: new Date(),
    updatedAt: new Date(),
  });
}

restore(): this {
  return this.clone({
    isDeleted: false,
    deletedAt: undefined,
    updatedAt: new Date(),
  });
}
```

**✅ SOLUCIÓN:**

```typescript
// Crear: src/shared/soft-delete.mixin.ts
export interface SoftDeleteable<T> {
  softDelete(): T;
  restore(): T;
}

export const withSoftDelete = <T extends Entity<any>>(
  constructor: new (props: any) => T,
) => {
  constructor.prototype.softDelete = function () {
    return this.clone({
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  };

  constructor.prototype.restore = function () {
    return this.clone({
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date(),
    });
  };
};

// Usar en entidades:
// src/tasks/model/task.entity.ts
export class Task extends Entity<TaskProps> implements SoftDeleteable<Task> {
  // softDelete y restore automáticamente agregados por mixin
}
```

#### 2.2 Updated Timestamp Duplicated

**Archivos afectados:** 32 instancias en todas las entidades

```typescript
// ❌ DUPLICADO en todas las entidades
complete(): Task {
  return this.clone({
    status: "COMPLETED",
    updatedAt: new Date(), // Repeated 32+ times
  });
}
```

**✅ SOLUCIÓN:**

```typescript
// src/shared/entity.ts
clone(newProps: Partial<PROPS>, newMode: EntityMode = this.mode): this {
  return new (this.constructor as any)({
    ...this.props,
    ...newProps,
    updatedAt: new Date(), // Auto-update on clone
  } as PROPS, newMode);
}
```

#### 2.3 Slug Generation Duplicated

**Archivos afectados:**

- src/workspaces/usecase/create-workspace.usecase.ts:47-53

```typescript
// ❌ DUPLICADO
private generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

**✅ SOLUCIÓN:**

```typescript
// Ya existe en: src/shared/utils/string.utils.ts:9-16
// Solo importarlo:
import { generateSlug } from '../../shared/utils/string.utils';

// Usarlo:
async execute(dto: CreateWorkspaceDto, loggedUser?: LoggedUser): Promise<Workspace> {
  const workspace = Workspace.create({
    // ...
    slug: generateSlug(dto.name), // ✅ Usar shared utility
    // ...
  });
}
```

**Regla violada:** DRY Principle

**Impacto:** Code duplication, mantenimiento difícil

**Prioridad:** ALTA

**Tiempo estimado para corregir:** 3 días

---

## 🟡 Violaciones MEDIAS

### 3. Missing JSDoc Documentation

**Archivos afectados:** 52 use cases, 14 entidades, 10+ repositorios

**Cobertura:**

- Use cases: 4% (2/52 tienen JSDoc)
- Entidades: 0% (0/14 tienen JSDoc)
- Repositorios: 10% (1/10+ tienen JSDoc)

**Ejemplo sin JSDoc:**

````typescript
// ❌ SIN JSDOC
complete(): Task {
  return this.clone({
    status: "COMPLETED",
    updatedAt: new Date(),
  });
}

// ✅ CON JSDOC
/**
 * Marks the task as completed
 *
 * @returns A new Task instance with COMPLETED status
 *
 * @example
 * ```typescript
 * const completedTask = task.complete();
 * console.log(completedTask.status); // 'COMPLETED'
 * ```
 */
complete(): Task {
  return this.clone({
    status: "COMPLETED",
    updatedAt: new Date(),
  });
}
````

**Regla violada:** Rule 28 - JSDoc Comments

**Impacto:** Documentación incompleta, difícil de usar

**Prioridad:** MEDIA

**Tiempo estimado para corregir:** 1 semana

---

### 4. Error Handling Patterns

**Archivos afectados:** ~80 instancias

```typescript
// ❌ GENÉRICO
throw new Error("Usuário já existe");

// ✅ RECOMENDADO
throw new ConflictException("USER_EXISTS", "Usuário já existe");
```

**Crear: src/shared/exceptions.ts**

```typescript
export class DomainException extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "DomainException";
  }
}

export class ValidationException extends DomainException {}
export class ConflictException extends DomainException {}
export class NotFoundException extends DomainException {}
```

**Regla violada:** Rule 5 - Error Handling

**Prioridad:** MEDIA

---

## 🟢 Violaciones BAJAS

### 5. Naming Convention Inconsistencies

**Archivos afectados:**

- src/users/usecase/register-user.usecase.ts:1
- src/users/usecase/user-login.usecase.ts:1
- src/users/provider/user.repository.ts:1

```typescript
// ❌ DEFAULT EXPORT
export default class RegisterUser implements UseCase<Input, void> {}

// ✅ NAMED EXPORT
export class RegisterUserUseCase implements UseCase<Input, void> {}
```

**Prioridad:** BAJA

---

## ✅ Fortalezas

1. **Clean Architecture** ✅
   - Dominio bien separado
   - 9 dominios organizados
   - Entities, Use Cases, Repositories separados

2. **No Framework Dependencies** ✅
   - Zero Prisma imports
   - Zero NestJS decorators
   - Pure domain logic

3. **Repository Abstraction** ✅
   - Todos los repositorios abstractos
   - Interfaces bien definidas

4. **Value Objects** ✅
   - Email, Id, PersonName bien implementados
   - Validation en VOs

5. **SOLID Principles** ✅
   - 46/50 (92%) compliance
   - Single Responsibility: 9/10
   - Open/Closed: 8/10
   - Liskov Substitution: 10/10
   - Interface Segregation: 9/10
   - Dependency Inversion: 10/10

---

## 📊 Score Detallado

| Categoría              | Score      | Peso     | Peso Score |
| ---------------------- | ---------- | -------- | ---------- |
| Clean Architecture     | 8/10       | 25%      | 2.0        |
| Domain Logic Purity    | 7/10       | 20%      | 1.4        |
| TypeScript Strict Mode | 3/10       | 15%      | 0.45       |
| DRY Compliance         | 5/10       | 10%      | 0.5        |
| Naming Conventions     | 9/10       | 5%       | 0.45       |
| Code Organization      | 10/10      | 10%      | 1.0        |
| JSDoc Documentation    | 2/10       | 5%       | 0.1        |
| SOLID Principles       | 9/10       | 10%      | 0.9        |
| **TOTAL**              | **65/100** | **100%** | **6.8/10** |

---

## 🎯 Plan de Corrección Priorizado

### SEMANA 1: CRÍTICO

**Día 1-2: Eliminar `any` en shared**

- [ ] entity.ts (2 usos)
- [ ] use-case.ts (1 uso)
- [ ] value-object.ts (1 uso)

**Día 3-4: Eliminar `any` en entidades/repositorios**

- [ ] task.entity.ts (1 uso)
- [ ] habit.repository.ts (6 usos)
- [ ] Crear Habit entity

**Día 5: Eliminar `any` en use cases**

- [ ] get-deleted-tasks.usecase.ts
- [ ] get-deleted-projects.usecase.ts
- [ ] AI service (2 usos)

### SEMANA 2: ALTA

**Día 1: DRY - Soft Delete**

- [ ] Crear soft-delete.mixin.ts
- [ ] Aplicar a Task, Project, Workspace

**Día 2: DRY - Updated Timestamp**

- [ ] Modificar Entity.clone() para auto-update
- [ ] Validar que no rompa nada

**Día 3: DRY - Slug Generation**

- [ ] Reemplazar duplicado con import de string.utils.ts

**Día 4-5: Code review y testing**

### SEMANA 3-4: MEDIA

**Día 1-5: JSDoc completo**

- [ ] Agregar JSDoc a todos los use cases
- [ ] Agregar JSDoc a todas las entidades
- [ ] Agregar JSDoc a todos los repositorios

---

## 📞 Recursos

- [RESUMEN-EJECUTIVO.md](../RESUMEN-EJECUTIVO.md)
- [PLAN-ACCION.md](../PLAN-ACCION.md)
- [.claude/rules.md](../../.claude/rules.md)

---

**Última actualización:** 31 de Diciembre 2025
