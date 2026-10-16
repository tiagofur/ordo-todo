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
// packages/core/src/idea/entities/idea.entity.ts
export class Idea extends Entity<IdeaProps> {
  constructor(props: IdeaProps, mode: EntityMode = "valid") {
    super(props, mode);
  }

  // Domain behavior
  moveToContentPiece(): ContentPiece {
    return new ContentPiece({
      title: this.title,
      content: this.description,
      status: ContentStatus.IDEA,
      ideaId: this.id,
    });
  }

  archive(): Idea {
    return this.clone({
      status: IdeaStatus.ARCHIVED,
      archivedAt: new Date(),
    });
  }

  isStale(): boolean {
    const daysSinceCreation = differenceInDays(new Date(), this.createdAt);
    return daysSinceCreation > 30;
  }
}
```

### 2. Value Objects

Objects defined by their attributes, no identity.

```typescript
// packages/core/src/shared/value-objects/content-status.vo.ts
export class ContentStatus {
  readonly value:
    | "IDEA"
    | "SCRIPTING"
    | "FILMING"
    | "EDITING"
    | "SCHEDULED"
    | "PUBLISHED";

  constructor(value: string) {
    const validStatuses = [
      "IDEA",
      "SCRIPTING",
      "FILMING",
      "EDITING",
      "SCHEDULED",
      "PUBLISHED",
    ];
    if (!validStatuses.includes(value)) {
      throw new Error(`Invalid content status: ${value}`);
    }
    this.value = value as any;
  }

  // Domain behavior
  canPublish(): boolean {
    return this.value === "SCHEDULED";
  }

  moveToPublished(): ContentStatus {
    return new ContentStatus("PUBLISHED");
  }
}
```

### 3. Aggregates

Cluster of entities treated as a unit.

```typescript
// packages/core/src/content/entities/content-piece.aggregate.ts
export class ContentPiece extends Entity<ContentPieceProps> {
  constructor(props: ContentPieceProps, mode: EntityMode = "valid") {
    super(props, mode);
  }

  // Aggregate root behavior
  addAttachment(attachment: Attachment): ContentPiece {
    const updatedAttachments = [...this.attachments, attachment];
    return this.clone({ attachments: updatedAttachments });
  }

  removeAttachment(attachmentId: string): ContentPiece {
    const updatedAttachments = this.attachments.filter(
      (a) => a.id !== attachmentId,
    );
    return this.clone({ attachments: updatedAttachments });
  }

  publish(platforms: Platform[]): ContentPiece {
    if (!this.canPublish()) {
      throw new Error("Content cannot be published");
    }

    return this.clone({
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      platforms,
    });
  }

  private canPublish(): boolean {
    return (
      this.status === ContentStatus.SCHEDULED && this.title && this.content
    );
  }
}
```

### 4. Use Cases

Application-specific business rules.

```typescript
// packages/core/src/idea/use-cases/create-idea.use-case.ts
export interface CreateIdeaInput {
  title: string;
  description?: string;
  userId: string;
}

export class CreateIdeaUseCase implements UseCase<CreateIdeaInput, Idea> {
  constructor(private readonly ideaRepo: IdeaRepository) {}

  async execute(input: CreateIdeaInput): Promise<Idea> {
    // Domain validation
    const idea = new Idea({
      title: input.title,
      description: input.description,
      status: IdeaStatus.IDEA,
      userId: input.userId,
    });

    // Persistence
    await this.ideaRepo.save(idea);

    // Domain event (if needed)
    // ideaDomainEventBus.publish(new IdeaCreatedEvent(idea.id));

    return idea;
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
├── idea/
│   ├── entities/
│   │   ├── idea.entity.ts
│   │   └── idea-status.vo.ts
│   ├── value-objects/
│   │   └── idea-priority.vo.ts
│   ├── use-cases/
│   │   ├── create-idea.use-case.ts
│   │   ├── move-idea-to-content.use-case.ts
│   │   └── archive-idea.use-case.ts
│   ├── interfaces/
│   │   └── idea.repository.ts
│   └── index.ts
├── content/
│   ├── entities/
│   │   ├── content-piece.aggregate.ts
│   │   └── content-status.vo.ts
│   ├── use-cases/
│   │   ├── create-content.use-case.ts
│   │   ├── move-content-pipeline.use-case.ts
│   │   └── publish-content.use-case.ts
│   └── interfaces/
│       └── content-piece.repository.ts
└── index.ts
```

### Application Layer (apps/backend)

**Orchestrates domain logic, handles HTTP**

```typescript
// apps/backend/src/idea/idea.service.ts
@Injectable()
export class IdeaService {
  constructor(
    private readonly createIdeaUseCase: CreateIdeaUseCase,
    private readonly moveIdeaUseCase: MoveIdeaToContentUseCase,
    private readonly ideaRepo: IdeaRepository,
  ) {}

  async create(dto: CreateIdeaDto, userId: string): Promise<Idea> {
    return await this.createIdeaUseCase.execute({
      title: dto.title,
      description: dto.description,
      userId,
    });
  }

  async moveToContent(ideaId: string, userId: string): Promise<ContentPiece> {
    return await this.moveIdeaUseCase.execute(ideaId, userId);
  }
}
```

### Presentation Layer (apps/web, apps/mobile, apps/desktop)

**UI components, user interaction**

```typescript
// apps/web/src/app/dashboard/ideas/create-idea-form.tsx
'use client';

import { useCreateIdea } from '@/lib/api-hooks';
import { Button } from '@ordo-todo/ui';

export function CreateIdeaForm() {
  const createIdea = useCreateIdea();
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createIdea.mutateAsync({ title });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <Button type="submit">Create Idea</Button>
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

### Example: Publish Content

```typescript
// packages/core/src/content/use-cases/publish-content.use-case.ts
export interface PublishContentInput {
  contentId: string;
  platforms: Platform[];
  userId: string;
}

export class PublishContentUseCase implements UseCase<
  PublishContentInput,
  ContentPiece
> {
  constructor(
    private readonly contentRepo: ContentPieceRepository,
    private readonly socialService: SocialService,
  ) {}

  async execute(input: PublishContentInput): Promise<ContentPiece> {
    // 1. Get content
    const content = await this.contentRepo.findById(input.contentId);

    if (!content) {
      throw new NotFoundException("Content not found");
    }

    if (content.userId !== input.userId) {
      throw new ForbiddenException("You do not own this content");
    }

    // 2. Domain validation
    const publishedContent = content.publish(input.platforms);

    // 3. Persistence
    await this.contentRepo.save(publishedContent);

    // 4. External integration
    await this.socialService.publish(publishedContent, input.platforms);

    // 5. Trigger atomization (optional)
    // await atomizeContentUseCase.execute(publishedContent);

    return publishedContent;
  }
}
```

---

## 🗃️ Repositories

Repositories abstract data access.

### Repository Interface (Domain)

```typescript
// packages/core/src/idea/interfaces/idea.repository.ts
export interface IdeaRepository {
  save(idea: Idea): Promise<Idea>;
  findById(id: string): Promise<Idea | null>;
  findAll(userId: string): Promise<Idea[]>;
  findByStatus(userId: string, status: IdeaStatus): Promise<Idea[]>;
  delete(id: string): Promise<void>;
}
```

### Repository Implementation (Infrastructure)

```typescript
// apps/backend/src/repositories/idea.repository.impl.ts
@Injectable()
export class PrismaIdeaRepository implements IdeaRepository {
  constructor(private prisma: PrismaService) {}

  async save(idea: Idea): Promise<Idea> {
    const saved = await this.prisma.idea.create({
      data: {
        id: idea.id,
        title: idea.title,
        description: idea.description,
        status: idea.status,
        userId: idea.userId,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      },
    });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Idea | null> {
    const found = await this.prisma.idea.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  private toDomain(prismaIdea: any): Idea {
    return new Idea({
      id: prismaIdea.id,
      title: prismaIdea.title,
      description: prismaIdea.description,
      status: prismaIdea.status,
      userId: prismaIdea.userId,
      createdAt: prismaIdea.createdAt,
      updatedAt: prismaIdea.updatedAt,
    });
  }
}
```

---

## 💡 Implementation Examples

### Complete Flow: Create Idea

**1. Domain Layer (packages/core)**

```typescript
// Entity
export class Idea extends Entity<IdeaProps> {
  protected validate(): void {
    if (!this.title || this.title.length < 3) {
      throw new Error("Title must be at least 3 characters");
    }
  }
}

// Use Case
export class CreateIdeaUseCase implements UseCase<CreateIdeaInput, Idea> {
  constructor(private readonly ideaRepo: IdeaRepository) {}

  async execute(input: CreateIdeaInput): Promise<Idea> {
    const idea = new Idea({
      title: input.title,
      description: input.description,
      status: IdeaStatus.IDEA,
      userId: input.userId,
    });

    await this.ideaRepo.save(idea);
    return idea;
  }
}
```

**2. Application Layer (apps/backend)**

```typescript
// Controller
@Controller("ideas")
@UseGuards(JwtAuthGuard)
@ApiTags("ideas")
export class IdeasController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post()
  @ApiOperation({ summary: "Create a new idea" })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateIdeaDto,
  ): Promise<Idea> {
    return this.ideaService.create(dto, user.id);
  }
}

// Service
@Injectable()
export class IdeaService {
  constructor(
    private readonly createIdeaUseCase: CreateIdeaUseCase,
    private readonly ideaRepo: IdeaRepository,
  ) {}

  async create(dto: CreateIdeaDto, userId: string): Promise<Idea> {
    return await this.createIdeaUseCase.execute({
      title: dto.title,
      description: dto.description,
      userId,
    });
  }
}
```

**3. Presentation Layer (apps/web)**

```typescript
// Client Component
'use client';

import { useCreateIdea } from '@/lib/api-hooks';
import { IdeaCard } from '@ordo-todo/ui';

export function IdeaList() {
  const { data: ideas } = useIdeas();
  const createIdea = useCreateIdea();

  return (
    <div>
      <Button onClick={() => createIdea.mutate({ title: 'New Idea' })}>
        Add Idea
      </Button>
      {ideas?.map(idea => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          onClick={id => router.push(`/ideas/${id}`)}
          labels={{ edit: 'Edit', delete: 'Delete' }}
        />
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
4. **Use value objects**: For concepts without identity (e.g., `ContentStatus`)
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
