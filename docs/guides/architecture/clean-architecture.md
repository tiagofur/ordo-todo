# Clean Architecture & DDD

**Domain-Driven Design principles for ORDO**

## 📋 Table of Contents

1. [What is Clean Architecture?](#what-is-clean-architecture)
2. [DDD Core Concepts](#ddd-core-concepts)
3. [Layers in ORDO](#layers-in-ordo)
4. [Entities and Value Objects](#entities-and-value-objects)
5. [Use Cases](#use-cases)
6. [Repositories](#repositories)
7. [Implementation Examples](#implementation-examples)

---

## 🏛️ What is Clean Architecture?

Clean Architecture is a software design philosophy that separates concerns into distinct layers, with dependencies pointing inward.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Presentation Layer                            │
│         (Web, Mobile, Desktop - React Components)               │
│                 Depends on Application & Domain                   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│              (Backend - NestJS Services, Controllers)            │
│                      Depends on Domain                           │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Domain Layer                             │
│            (packages/core - Pure Business Logic)                 │
│                      No Dependencies                            │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                          │
│       (Prisma, External APIs, Database, File System)            │
│                Implements Domain Interfaces                       │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Dependency Rule**: Dependencies only point inward
2. **Pure Domain**: Business logic has NO dependencies
3. **Testability**: Pure logic is 100% testable
4. **Scalability**: Easy to add new platforms

---

## 🧩 DDD Core Concepts

### 1. Entities

Objects with identity, lifecycle, and behavior.

```typescript
// packages/core/src/tasks/model/task.entity.ts
export class Task extends Entity<TaskProps> {
  static create(
    props: Omit<
      TaskProps,
      "id" | "createdAt" | "updatedAt" | "status" | "isDeleted" | "deletedAt"
    >,
  ): Task {
    return new Task({
      ...props,
      status: "TODO",
      priority: props.priority ?? "MEDIUM",
      isDeleted: false,
      deletedAt: undefined,
    });
  }

  // Domain behavior: immutable transitions via clone()
  complete(): Task {
    return this.clone({
      status: "COMPLETED",
      updatedAt: new Date(),
    });
  }

  softDelete(): Task {
    return this.clone({
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
```

### 2. Value Objects

Objects defined by their attributes, no identity.

```typescript
// packages/core/src/tasks/model/task.entity.ts
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
```

Closed unions next to the entity: no class needed, the compiler
rejects anything outside the set at every boundary.

### 3. Aggregates

Cluster of entities treated as a unit.

`Task` is the aggregate root: it clusters `subTasks`, tags and
recurrence under one identity. Every transition (`complete()`,
`updateStatus()`, `softDelete()`, `restore()`) goes through `clone()`,
so the aggregate is never mutated in place:

```typescript
// packages/core/src/tasks/model/task.entity.ts
const done = task.complete(); // new Task, status COMPLETED
const renamed = task.update({ title: "New title" }); // new Task
```

### 4. Use Cases

Application-specific business rules.

```typescript
// packages/core/src/tasks/usecase/create-task.usecase.ts
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  projectId?: string | null;
  ownerId: string;
  // ...dates, assignee, recurrence
}

export class CreateTaskUseCase implements UseCase<CreateTaskInput, Task> {
  constructor(private readonly repository: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    if (!input.title) {
      throw new Error("Title is required");
    }

    const task = Task.create({
      title: input.title,
      description: input.description,
      priority: input.priority ?? "MEDIUM",
      projectId: input.projectId ?? null, // null = express task, no project
      ownerId: input.ownerId,
    });

    await this.repository.save(task);
    return task;
  }
}
```

---

## 📂 Layers in ORDO

### Domain Layer (packages/core)

**Pure business logic, no dependencies**

```
packages/core/src/
├── shared/
│   ├── entity.ts                 # Base entity class
│   ├── value-object.ts          # Base value object class
│   └── use-case.ts             # Use case interface
├── tasks/
│   ├── model/
│   │   ├── task.entity.ts
│   │   └── task-dependency.entity.ts
│   ├── provider/
│   │   └── task.repository.ts    # Port (interface)
│   ├── usecase/
│   │   ├── create-task.usecase.ts
│   │   ├── complete-task.usecase.ts
│   │   ├── soft-delete-task.usecase.ts
│   │   ├── restore-task.usecase.ts
│   │   └── permanent-delete-task.usecase.ts
│   └── index.ts
└── index.ts
```

### Application Layer (apps/backend)

**Orchestrates domain logic, handles HTTP**

```typescript
// apps/backend/src/tasks/tasks.service.ts
@Injectable()
export class TasksService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    if (createTaskDto.projectId) {
      await this.assertAssigneeIsWorkspaceMember(
        createTaskDto.assigneeId,
        createTaskDto.projectId,
      );
    }
    const createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    return createTaskUseCase.execute({
      ...createTaskDto,
      ownerId: userId,
    });
  }
}
```

### Presentation Layer (apps/web, apps/mobile, apps/desktop)

**UI components, user interaction**

```typescript
// apps/web/src/app/dashboard/tasks/create-task-form.tsx
'use client';

import { useCreateTask } from '@/lib/api-hooks';
import { Button } from '@ordo-todo/ui';

export function CreateTaskForm() {
  const createTask = useCreateTask();
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createTask.mutateAsync({ title });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <Button type="submit">Create Task</Button>
    </form>
  );
}
```

---

## 🔗 Entities and Value Objects

### Entity Pattern

All entities extend from `Entity` base class:

```typescript
// packages/core/src/shared/entity.ts
export type EntityMode = "draft" | "valid";

export abstract class Entity<TProps> {
  readonly id: string;
  readonly props: TProps;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: TProps, mode: EntityMode = "valid") {
    this.id = generateId();
    this.props = props;
    this.createdAt = new Date();
    this.updatedAt = new Date();

    // Only validate in 'valid' mode
    if (mode === "valid") {
      this.validate();
    }
  }

  // Immutable update
  clone(newProps: Partial<TProps>): this {
    const Constructor = this.constructor as any;
    return new Constructor({ ...this.props, ...newProps }, "valid");
  }

  // Convert to draft (no validation)
  asDraft(): this {
    const Constructor = this.constructor as any;
    return new Constructor(this.props, "draft");
  }

  // Abstract validation method
  protected abstract validate(): void;

  // Compare by ID
  equals(entity: Entity<any>): boolean {
    return this.id === entity.id;
  }
}
```

### Value Object Pattern

```typescript
// packages/core/src/shared/value-object.ts
export abstract class ValueObject<TValue> {
  readonly value: TValue;

  constructor(value: TValue) {
    this.validate(value);
    this.value = value;
  }

  protected abstract validate(value: TValue): void;

  equals(vo: ValueObject<TValue>): boolean {
    return this.value === vo.value;
  }

  toString(): string {
    return String(this.value);
  }
}
```

---

## 🎯 Use Cases

Use cases represent the application's business rules.

### Use Case Interface

```typescript
// packages/core/src/shared/use-case.ts
export interface UseCase<IN, OUT> {
  execute(data: IN, loggedUser?: User): Promise<OUT>;
}
```

### Example: Complete Task

```typescript
// packages/core/src/tasks/usecase/complete-task.usecase.ts
export interface CompleteTaskInput {
  taskId: string;
  userId?: string;
}

export class CompleteTaskUseCase implements UseCase<CompleteTaskInput, Task> {
  constructor(private readonly repository: TaskRepository) {}

  async execute(input: CompleteTaskInput): Promise<Task> {
    // 1. Load aggregate
    const task = await this.repository.findById(input.taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    // 2. Ownership check
    const actingUserId = input.userId;
    const isOwner = task.props.ownerId === actingUserId;
    const isAssignee = task.props.assigneeId === actingUserId;

    if (actingUserId && !isOwner && !isAssignee) {
      throw new Error("Unauthorized");
    }

    // 3. Immutable transition + persistence
    const completedTask = task.complete();
    await this.repository.update(completedTask);

    return completedTask;
  }
}
```

---

## 🗃️ Repositories

Repositories abstract data access.

### Repository Interface (Domain)

```typescript
// packages/core/src/tasks/provider/task.repository.ts
export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findByIds(ids: string[]): Promise<Map<string, Task>>;
  // ...filtering, search, soft delete
}
```

### Repository Implementation (Infrastructure)

```typescript
// apps/backend/src/repositories/task.repository.ts
@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Task | null> {
    const found = await this.prisma.task.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  // toDomain maps Prisma enums to domain unions (TaskStatus,
  // TaskPriority) and rebuilds the aggregate with subTasks.
  private toDomain(prismaTask: PrismaTask): Task {
    return new Task({ ... });
  }
}
```

---

## 💡 Implementation Examples

### Complete Flow: Create Task

**1. Domain Layer (packages/core)**

```typescript
// Entity (packages/core/src/tasks/model/task.entity.ts)
export class Task extends Entity<TaskProps> {
  static create(props: ...): Task {
    return new Task({
      ...props,
      status: "TODO",
      priority: props.priority ?? "MEDIUM",
      isDeleted: false,
    });
  }
}

// Use Case (packages/core/src/tasks/usecase/create-task.usecase.ts)
export class CreateTaskUseCase implements UseCase<CreateTaskInput, Task> {
  constructor(private readonly repository: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    if (!input.title) {
      throw new Error("Title is required");
    }
    const task = Task.create({ ...input, projectId: input.projectId ?? null });
    await this.repository.save(task);
    return task;
  }
}
```

**2. Application Layer (apps/backend)**

```typescript
// Controller (apps/backend/src/tasks/tasks.controller.ts)
@Controller("tasks")
@UseGuards(JwtAuthGuard)
@ApiTags("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: "Create a new task" })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(dto, user.id);
  }
}

// Service (apps/backend/src/tasks/tasks.service.ts)
@Injectable()
export class TasksService {
  async create(createTaskDto: CreateTaskDto, userId: string) {
    const createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    return createTaskUseCase.execute({ ...createTaskDto, ownerId: userId });
  }
}
```

**3. Presentation Layer (apps/web)**

```typescript
// Client Component
'use client';

import { useCreateTask, useTasks } from '@/lib/api-hooks';

export function TaskList() {
  const { data: tasks } = useTasks();
  const createTask = useCreateTask();

  return (
    <div>
      <Button onClick={() => createTask.mutate({ title: 'New Task' })}>
        Add Task
      </Button>
      {tasks?.map(task => (
        <div key={task.id} onClick={() => router.push(`/tasks/${task.id}`)}>
          {task.title}
        </div>
      ))}
    </div>
  );
}
```

---

## 📚 Best Practices

### ✅ DO

1. **Keep domain pure**: No infrastructure dependencies in `packages/core`
2. **Use immutable updates**: Always use `entity.clone()` to update
3. **Validate in entities**: Domain validation in constructor
4. **Use value objects**: For concepts without identity (e.g., `TaskStatus`, `TaskPriority`)
5. **Repository pattern**: Abstract data access behind interfaces
6. **Test domain logic**: Pure functions are 100% testable

### ❌ DON'T

1. **Put HTTP calls in domain**: Use use cases in application layer
2. **Use `any` type**: Create proper interfaces
3. **Mutate entities**: Always clone, never mutate
4. **Skip validation**: Validate in both domain and application layer
5. **Mix concerns**: Keep layers separate

---

## 📚 Further Reading

- [Architecture Overview](./overview.md)
- [Domain Logic Guide](../packages/core.md)
- [Backend Development Guide](../development/backend-development.md)
