# Domain Logic (packages/core)

**DDD Domain: Entities, Use Cases, Value Objects**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Entities](#entities)
4. [Value Objects](#value-objects)
5. [Use Cases](#use-cases)
6. [Repositories](#repositories)
7. [Testing](#testing)

---

## 🏛️ Overview

`packages/core` contains **pure domain logic** with NO external dependencies. This is the heart of ORDO's business logic following Domain-Driven Design (DDD).

### Key Principles

1. **Pure TypeScript**: NO infrastructure dependencies (Prisma, NestJS, etc.)
2. **Immutable Updates**: Always use `entity.clone()` to update
3. **Domain Validation**: Entities validate themselves in constructor
4. **Business Rules**: Domain logic stays in domain layer
5. **Testable**: 100% unit testable (no mocks needed)

### Dependencies

```json
{
  "dependencies": {
    "uuid": "workspace:*"
  }
}
```

Only `uuid` for ID generation. Everything else is pure TypeScript.

---

## 📁 Directory Structure

```
packages/core/src/
├── shared/
│   ├── entity.ts                 # Base entity class
│   ├── value-object.ts          # Base value object class
│   ├── use-case.ts             # Use case interface
│   ├── errors.ts               # Domain errors
│   └── index.ts
│
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
│
├── content/
│   ├── entities/
│   │   ├── content-piece.aggregate.ts
│   │   └── content-status.vo.ts
│   ├── use-cases/
│   │   ├── create-content.use-case.ts
│   │   ├── move-content-pipeline.use-case.ts
│   │   ├── publish-content.use-case.ts
│   │   └── atomize-content.use-case.ts
│   ├── interfaces/
│   │   └── content-piece.repository.ts
│   └── index.ts
│
├── series/
│   ├── entities/
│   │   ├── series.aggregate.ts
│   │   └── series-status.vo.ts
│   ├── use-cases/
│   │   └── ...
│   └── index.ts
│
└── index.ts
```

---

## 🧩 Entities

### Base Entity Class

```typescript
// shared/entity.ts
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

    // Only validate in 'valid' mode (skip for forms)
    if (mode === "valid") {
      this.validate();
    }
  }

  // Immutable update - creates new instance
  clone(newProps: Partial<TProps>): this {
    const Constructor = this.constructor as any;
    return new Constructor({ ...this.props, ...newProps }, "valid");
  }

  // Convert to draft (no validation - for forms)
  asDraft(): this {
    const Constructor = this.constructor as any;
    return new Constructor(this.props, "draft");
  }

  // Convert to valid (validate - for persistence)
  asValid(): this {
    const Constructor = this.constructor as any;
    return new Constructor(this.props, "valid");
  }

  // Compare by ID
  equals(entity: Entity<any>): boolean {
    return this.id === entity.id;
  }

  // Abstract validation method (must implement)
  protected abstract validate(): void;
}

function generateId(): string {
  return crypto.randomUUID();
}
```

### Example: Idea Entity

```typescript
// idea/entities/idea.entity.ts
import { Entity, EntityMode } from "../../shared/entity";

export enum IdeaStatus {
  IDEA = "IDEA",
  ARCHIVED = "ARCHIVED",
}

export interface IdeaProps {
  id?: string;
  title: string;
  description?: string;
  status: IdeaStatus;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Idea extends Entity<IdeaProps> {
  constructor(props: IdeaProps, mode: EntityMode = "valid") {
    super(props, mode);
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): IdeaStatus {
    return this.props.status;
  }

  get userId(): string {
    return this.props.userId;
  }

  // Domain validation
  protected validate(): void {
    if (!this.props.title || this.props.title.trim().length < 3) {
      throw new Error("Title must be at least 3 characters");
    }

    if (this.props.title.length > 100) {
      throw new Error("Title must be less than 100 characters");
    }

    if (this.props.description && this.props.description.length > 1000) {
      throw new Error("Description must be less than 1000 characters");
    }
  }

  // Domain behavior: Update title
  updateTitle(title: string): Idea {
    return this.clone({ title });
  }

  // Domain behavior: Update description
  updateDescription(description: string): Idea {
    return this.clone({ description });
  }

  // Domain behavior: Archive idea
  archive(): Idea {
    return this.clone({ status: IdeaStatus.ARCHIVED });
  }

  // Domain behavior: Check if stale (> 30 days old)
  isStale(): boolean {
    const daysSinceCreation = Math.floor(
      (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceCreation > 30;
  }

  // Domain behavior: Can move to content pipeline
  canMoveToContent(): boolean {
    return this.status === IdeaStatus.IDEA && this.props.title.length >= 3;
  }
}
```

### Example: ContentPiece Aggregate

```typescript
// content/entities/content-piece.aggregate.ts
import { Entity, EntityMode } from "../../shared/entity";

export enum ContentStatus {
  IDEA = "IDEA",
  SCRIPTING = "SCRIPTING",
  FILMING = "FILMING",
  EDITING = "EDITING",
  SCHEDULED = "SCHEDULED",
  PUBLISHED = "PUBLISHED",
}

export interface ContentPieceProps {
  id?: string;
  title: string;
  content: string;
  status: ContentStatus;
  ideaId?: string;
  userId: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ContentPiece extends Entity<ContentPieceProps> {
  constructor(props: ContentPieceProps, mode: EntityMode = "valid") {
    super(props, mode);
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get status(): ContentStatus {
    return this.props.status;
  }

  protected validate(): void {
    if (!this.props.title || this.props.title.trim().length < 3) {
      throw new Error("Title must be at least 3 characters");
    }

    if (!this.props.content || this.props.content.trim().length < 10) {
      throw new Error("Content must be at least 10 characters");
    }
  }

  // Domain behavior: Move to next stage in pipeline
  moveToNextStage(): ContentPiece {
    const stageOrder = [
      ContentStatus.IDEA,
      ContentStatus.SCRIPTING,
      ContentStatus.FILMING,
      ContentStatus.EDITING,
      ContentStatus.SCHEDULED,
      ContentStatus.PUBLISHED,
    ];

    const currentIndex = stageOrder.indexOf(this.status);
    if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
      throw new Error("Cannot move to next stage");
    }

    return this.clone({ status: stageOrder[currentIndex + 1] });
  }

  // Domain behavior: Publish
  publish(): ContentPiece {
    if (this.status !== ContentStatus.SCHEDULED) {
      throw new Error("Content must be scheduled before publishing");
    }

    return this.clone({
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    });
  }

  // Domain behavior: Schedule
  schedule(date: Date): ContentPiece {
    if (this.status !== ContentStatus.EDITING) {
      throw new Error("Content must be in editing stage before scheduling");
    }

    return this.clone({
      status: ContentStatus.SCHEDULED,
      scheduledAt: date,
    });
  }

  // Domain behavior: Check if can publish
  canPublish(): boolean {
    return this.status === ContentStatus.SCHEDULED;
  }
}
```

---

## 💎 Value Objects

### Base Value Object

```typescript
// shared/value-object.ts
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

### Example: ContentStatus Value Object

```typescript
// content/entities/content-status.vo.ts
import { ValueObject } from "../../shared/value-object";

export class ContentStatus extends ValueObject<ContentStatusValue> {
  constructor(value: ContentStatusValue) {
    super(value);
  }

  protected validate(value: ContentStatusValue): void {
    const validStatuses: ContentStatusValue[] = [
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
  }

  // Domain behavior: Can publish?
  canPublish(): boolean {
    return this.value === "SCHEDULED";
  }

  // Domain behavior: Is published?
  isPublished(): boolean {
    return this.value === "PUBLISHED";
  }

  // Domain behavior: Is editable?
  isEditable(): boolean {
    return ["IDEA", "SCRIPTING", "FILMING", "EDITING"].includes(this.value);
  }
}

export type ContentStatusValue =
  | "IDEA"
  | "SCRIPTING"
  | "FILMING"
  | "EDITING"
  | "SCHEDULED"
  | "PUBLISHED";
```

---

## 🎯 Use Cases

### Use Case Interface

```typescript
// shared/use-case.ts
export interface UseCase<IN, OUT> {
  execute(data: IN, loggedUser?: any): Promise<OUT>;
}
```

### Example: CreateIdeaUseCase

```typescript
// idea/use-cases/create-idea.use-case.ts
import { UseCase } from "../../shared/use-case";
import { Idea, IdeaStatus } from "../entities/idea.entity";
import { IdeaRepository } from "../interfaces/idea.repository";

export interface CreateIdeaInput {
  title: string;
  description?: string;
  userId: string;
}

export class CreateIdeaUseCase implements UseCase<CreateIdeaInput, Idea> {
  constructor(private readonly ideaRepo: IdeaRepository) {}

  async execute(input: CreateIdeaInput): Promise<Idea> {
    // Create domain entity (validates automatically)
    const idea = new Idea({
      title: input.title,
      description: input.description,
      status: IdeaStatus.IDEA,
      userId: input.userId,
    });

    // Persist via repository
    await this.ideaRepo.save(idea);

    return idea;
  }
}
```

### Example: MoveIdeaToContentUseCase

```typescript
// idea/use-cases/move-idea-to-content.use-case.ts
import { UseCase } from "../../shared/use-case";
import { Idea } from "../entities/idea.entity";
import {
  ContentPiece,
  ContentStatus,
} from "../../content/entities/content-piece.aggregate";
import { IdeaRepository } from "../interfaces/idea.repository";
import { ContentPieceRepository } from "../../content/interfaces/content-piece.repository";

export class MoveIdeaToContentInput {
  ideaId: string;
  userId: string;
}

export class MoveIdeaToContentUseCase implements UseCase<
  MoveIdeaToContentInput,
  ContentPiece
> {
  constructor(
    private readonly ideaRepo: IdeaRepository,
    private readonly contentRepo: ContentPieceRepository,
  ) {}

  async execute(input: MoveIdeaToContentInput): Promise<ContentPiece> {
    // Get idea
    const idea = await this.ideaRepo.findById(input.ideaId);

    if (!idea) {
      throw new Error("Idea not found");
    }

    // Verify ownership
    if (idea.userId !== input.userId) {
      throw new Error("You do not own this idea");
    }

    // Verify can move
    if (!idea.canMoveToContent()) {
      throw new Error("Idea cannot be moved to content");
    }

    // Create content piece from idea
    const content = new ContentPiece({
      title: idea.title,
      content: idea.description || "",
      status: ContentStatus.SCRIPTING,
      ideaId: idea.id,
      userId: idea.userId,
    });

    // Save content piece
    await this.contentRepo.save(content);

    // Archive idea
    const archivedIdea = idea.archive();
    await this.ideaRepo.save(archivedIdea);

    return content;
  }
}
```

### Example: PublishContentUseCase

```typescript
// content/use-cases/publish-content.use-case.ts
import { UseCase } from "../../shared/use-case";
import { ContentPiece } from "../entities/content-piece.aggregate";
import { ContentPieceRepository } from "../interfaces/content-piece.repository";

export interface PublishContentInput {
  contentId: string;
  userId: string;
}

export class PublishContentUseCase implements UseCase<
  PublishContentInput,
  ContentPiece
> {
  constructor(private readonly contentRepo: ContentPieceRepository) {}

  async execute(input: PublishContentInput): Promise<ContentPiece> {
    // Get content
    const content = await this.contentRepo.findById(input.contentId);

    if (!content) {
      throw new Error("Content not found");
    }

    // Verify ownership
    if (content.userId !== input.userId) {
      throw new Error("You do not own this content");
    }

    // Publish (domain validation)
    const published = content.publish();

    // Save
    await this.contentRepo.save(published);

    return published;
  }
}
```

---

## 🗃️ Repositories

### Repository Interface (Domain)

```typescript
// idea/interfaces/idea.repository.ts
import { Idea, IdeaStatus } from "../entities/idea.entity";

export interface IdeaRepository {
  save(idea: Idea): Promise<Idea>;
  findById(id: string): Promise<Idea | null>;
  findAll(userId: string): Promise<Idea[]>;
  findByStatus(userId: string, status: IdeaStatus): Promise<Idea[]>;
  delete(id: string): Promise<void>;
}
```

---

## 🧪 Testing

### Unit Test for Entity

```typescript
// idea/entities/__tests__/idea.entity.test.ts
import { describe, it, expect } from "vitest";
import { Idea, IdeaStatus } from "../idea.entity";

describe("Idea Entity", () => {
  it("should create idea with valid data", () => {
    const idea = new Idea({
      title: "Test Idea",
      description: "Test description",
      status: IdeaStatus.IDEA,
      userId: "user-1",
    });

    expect(idea.title).toBe("Test Idea");
    expect(idea.description).toBe("Test description");
    expect(idea.status).toBe(IdeaStatus.IDEA);
  });

  it("should throw error if title is too short", () => {
    expect(() => {
      new Idea({
        title: "AB",
        status: IdeaStatus.IDEA,
        userId: "user-1",
      });
    }).toThrow("Title must be at least 3 characters");
  });

  it("should update title immutably", () => {
    const idea = new Idea({
      title: "Original Title",
      status: IdeaStatus.IDEA,
      userId: "user-1",
    });

    const updated = idea.updateTitle("Updated Title");

    expect(idea.title).toBe("Original Title"); // Original unchanged
    expect(updated.title).toBe("Updated Title");
    expect(updated.id).toBe(idea.id); // Same ID
  });

  it("should check if stale after 30 days", () => {
    const idea = new Idea({
      title: "Old Idea",
      status: IdeaStatus.IDEA,
      userId: "user-1",
      createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
    });

    expect(idea.isStale()).toBe(true);
  });
});
```

### Unit Test for Use Case

```typescript
// idea/use-cases/__tests__/create-idea.use-case.test.ts
import { describe, it, expect, vi } from "vitest";
import { CreateIdeaUseCase } from "../create-idea.use-case";
import { IdeaRepository } from "../../interfaces/idea.repository";
import { Idea } from "../../entities/idea.entity";

describe("CreateIdeaUseCase", () => {
  let useCase: CreateIdeaUseCase;
  let mockRepo: IdeaRepository;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByStatus: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new CreateIdeaUseCase(mockRepo);
  });

  it("should create idea and save to repository", async () => {
    const input = {
      title: "Test Idea",
      description: "Test description",
      userId: "user-1",
    };

    const result = await useCase.execute(input);

    expect(mockRepo.save).toHaveBeenCalled();
    expect(result.title).toBe("Test Idea");
  });

  it("should throw error if title is too short", async () => {
    const input = {
      title: "AB",
      userId: "user-1",
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      "Title must be at least 3 characters",
    );
  });
});
```

---

## 🎯 Best Practices

### ✅ DO

1. **Pure domain logic**: NO infrastructure dependencies
2. **Immutable updates**: Always use `entity.clone()`
3. **Validate in entities**: Domain validation in constructor
4. **Use value objects**: For concepts without identity
5. **Business rules in use cases**: Orchestration logic
6. **Test everything**: 100% unit test coverage
7. **Use draft mode**: For forms (skip validation)
8. **Use valid mode**: For persistence (validate)

### ❌ DON'T

1. **Use Prisma in domain**: No infrastructure
2. **Mutate entities**: Always clone
3. **Skip validation**: Validate in both domain and app
4. **Put business logic in UI**: Keep in domain
5. **Use `any` type**: Create proper interfaces
6. **Mix concerns**: Keep layers separate

---

## 📚 Further Reading

- [Clean Architecture Guide](../architecture/clean-architecture.md)
- [Architecture Overview](../architecture/overview.md)
- [Backend Development Guide](../development/backend-development.md)
