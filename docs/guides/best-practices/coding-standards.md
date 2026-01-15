# Coding Standards

**Global coding standards for ORDO: The Creator's OS**

## 📋 Table of Contents

1. [General Standards](#general-standards)
2. [TypeScript Standards](#typescript-standards)
3. [React Standards](#react-standards)
4. [NestJS Standards](#nestjs-standards)
5. [Naming Conventions](#naming-conventions)
6. [Code Organization](#code-organization)
7. [Comments & Documentation](#comments--documentation)

---

## 📐 General Standards

### File Names

- **Components**: `kebab-case.tsx` (e.g., `idea-card.tsx`)
- **Services**: `kebab-case.service.ts` (e.g., `ideas.service.ts`)
- **Repositories**: `kebab-case.repository.ts` (e.g., `idea.repository.ts`)
- **Use Cases**: `kebab-case.use-case.ts` (e.g., `create-idea.use-case.ts`)
- **DTOs**: `kebab-case.dto.ts` (e.g., `create-idea.dto.ts`)

```bash
# ✅ CORRECT
idea-card.tsx
ideas.service.ts
create-idea.use-case.ts

# ❌ WRONG
IdeaCard.tsx
IdeasService.ts
CreateIdeaUseCase.ts
```

### Line Length

Maximum line length: **100 characters**

```typescript
// ✅ CORRECT
const result = await this.contentService.publish(content, platforms);

// ❌ WRONG
const result = await this.contentService.publish(
  content,
  platforms,
  additionalOptions,
  moreOptions,
  evenMoreOptions,
);
```

### Indentation

Use **2 spaces**, not tabs

```typescript
// ✅ CORRECT
function hello() {
  if (condition) {
    return "world";
  }
}

// ❌ WRONG
function hello() {
  if (condition) {
    return "world";
  }
}
```

---

## 🔷 TypeScript Standards

### Strict Mode

All packages/apps MUST use strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### NO `any` Type

Use proper types:

```typescript
// ✅ CORRECT
interface Idea {
  id: string;
  title: string;
  status: IdeaStatus;
}

function processIdea(idea: Idea): void {
  // ...
}

// ❌ WRONG
function processIdea(idea: any): void {
  // ...
}
```

### Interface vs Type

- Use **interface** for object shapes
- Use **type** for unions, intersections, primitives

```typescript
// ✅ CORRECT: Interface for object
interface Idea {
  id: string;
  title: string;
}

// ✅ CORRECT: Type for unions
type Status = "IDEA" | "ARCHIVED" | "PUBLISHED";

// ✅ CORRECT: Type for intersections
type IdeaWithContent = Idea & { content: string };

// ❌ WRONG: Type for object shape
type Idea = {
  id: string;
  title: string;
};
```

### Readonly Properties

Mark properties as `readonly` when possible:

```typescript
// ✅ CORRECT
interface IdeaProps {
  readonly id: string;
  readonly title: string;
  readonly createdAt: Date;
}

// ❌ WRONG
interface IdeaProps {
  id: string;
  title: string;
  createdAt: Date;
}
```

---

## ⚛️ React Standards

### Functional Components

Use functional components with hooks:

```typescript
// ✅ CORRECT
export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return <div onClick={() => onClick(idea.id)}>{idea.title}</div>;
}

// ❌ WRONG: Class components
export class IdeaCard extends React.Component {
  // ...
}
```

### Props Interface

Define props interface:

```typescript
// ✅ CORRECT
interface IdeaCardProps {
  idea: Idea;
  onClick: (id: string) => void;
  labels?: {
    edit?: string;
    delete?: string;
  };
  className?: string;
}

export function IdeaCard({
  idea,
  onClick,
  labels = {},
  className = "",
}: IdeaCardProps) {
  // ...
}

// ❌ WRONG: No interface
export function IdeaCard(idea: any, onClick: any) {
  // ...
}
```

### Destructuring Props

Destructure props:

```typescript
// ✅ CORRECT
export function IdeaCard({ idea, onClick, labels = {}, className = '' }: IdeaCardProps) {
  return <div className={className}>{idea.title}</div>;
}

// ❌ WRONG
export function IdeaCard(props: IdeaCardProps) {
  return <div className={props.className}>{props.idea.title}</div>;
}
```

### Default Props

Use default values in destructuring:

```typescript
// ✅ CORRECT
export function IdeaCard({
  idea,
  onClick,
  labels = {},
  className = "",
}: IdeaCardProps) {
  // ...
}

// ❌ WRONG: defaultProps
export function IdeaCard({ idea, onClick, labels, className }: IdeaCardProps) {
  // ...
}
IdeaCard.defaultProps = {
  labels: {},
  className: "",
};
```

### Event Handlers

Use arrow functions or `.bind`:

```typescript
// ✅ CORRECT: Arrow function
export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  return <div onClick={() => onClick(idea.id)}>{idea.title}</div>;
}

// ✅ CORRECT: Bind
export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const handleClick = () => onClick(idea.id);

  return <div onClick={handleClick}>{idea.title}</div>;
}

// ❌ WRONG: Inline function in render
export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  return <div onClick={function() { onClick(idea.id) }}>{idea.title}</div>;
}
```

---

## 🐘 NestJS Standards

### Dependency Injection

Use constructor injection:

```typescript
// ✅ CORRECT
@Injectable()
export class IdeasService {
  constructor(
    private readonly ideaRepo: IdeaRepository,
    private readonly contentRepo: ContentPieceRepository,
  ) {}
}

// ❌ WRONG: Property injection
@Injectable()
export class IdeasService {
  @Inject() private ideaRepo: IdeaRepository;
}
```

### Controller Organization

Group by feature:

```typescript
// ✅ CORRECT: Feature-based
ideas/
├── ideas.controller.ts
├── ideas.service.ts
├── dto/
│   ├── create-idea.dto.ts
│   └── update-idea.dto.ts
└── ideas.module.ts

// ❌ WRONG: Layer-based
controllers/
├── ideas.controller.ts
├── content.controller.ts
services/
├── ideas.service.ts
├── content.service.ts
```

### Async/Await

Use `async/await` consistently:

```typescript
// ✅ CORRECT
async findAll(userId: string): Promise<Idea[]> {
  const ideas = await this.ideaRepo.findAll(userId);
  return ideas;
}

// ❌ WRONG: Mixing promises
async findAll(userId: string): Promise<Idea[]> {
  return this.ideaRepo.findAll(userId).then(ideas => ideas);
}
```

---

## 🏷️ Naming Conventions

### Variables & Functions

Use `camelCase`:

```typescript
// ✅ CORRECT
const userName = "John";
function createUser() {}
const getIdeas = () => {};

// ❌ WRONG
const UserName = "John";
function create_user() {}
const GetIdeas = () => {};
```

### Classes & Interfaces

Use `PascalCase`:

```typescript
// ✅ CORRECT
class IdeaService {}
interface IdeaProps {}
type IdeaStatus = "IDEA" | "ARCHIVED";

// ❌ WRONG
class ideaService {}
interface ideaProps {}
type ideaStatus = "IDEA" | "ARCHIVED";
```

### Constants

Use `UPPER_SNAKE_CASE`:

```typescript
// ✅ CORRECT
const MAX_TITLE_LENGTH = 100;
const DEFAULT_PAGE_SIZE = 20;
const API_BASE_URL = "https://api.ordocreators.com";

// ❌ WRONG
const maxTitleLength = 100;
const MaxTitleLength = 100;
```

### Private Properties

Use `_camelCase`:

```typescript
// ✅ CORRECT
class IdeaService {
  private _cache: Map<string, Idea>;

  constructor() {
    this._cache = new Map();
  }
}

// ❌ WRONG
class IdeaService {
  private cache: Map<string, Idea>;
  private __cache: Map<string, Idea>;
}
```

### Files

Use `kebab-case`:

```typescript
// ✅ CORRECT
idea-card.tsx
ideas.service.ts
create-idea.use-case.ts

// ❌ WRONG
IdeaCard.tsx
IdeasService.ts
CreateIdeaUseCase.ts
```

---

## 📂 Code Organization

### Import Order

```typescript
// 1. External libraries (no node_modules)
import React from "react";
import { useState } from "react";

// 2. Internal packages (@ordo-todo/*)
import { Idea } from "@ordo-todo/core";
import { Button } from "@ordo-todo/ui";

// 3. Relative imports (./)
import { IdeaCard } from "./idea-card";
import { formatDate } from "../utils/date";

// 4. Types
import type { IdeaProps } from "./idea-card.types";
```

### Barrel Exports

Use `index.ts` for barrel exports:

```typescript
// packages/ui/src/components/idea/index.ts
export { IdeaCard } from "./idea-card";
export { IdeaForm } from "./idea-form";
export { IdeaGraveyard } from "./idea-graveyard";

// packages/ui/src/components/index.ts
export * from "./ui";
export * from "./idea";
export * from "./content";
export * from "./series";
```

---

## 💬 Comments & Documentation

### JSDoc Comments

All exported functions MUST have JSDoc:

````typescript
/**
 * Creates a new idea.
 *
 * @param input - The idea input data
 * @param input.title - The idea title (3-100 characters)
 * @param input.description - Optional description (max 1000 characters)
 * @param input.userId - The user ID who owns the idea
 * @returns Promise that resolves to the created idea
 * @throws {Error} If title is too short or too long
 *
 * @example
 * ```ts
 * const idea = await createIdea({
 *   title: 'New idea',
 *   description: 'Detailed description',
 *   userId: 'user-123',
 * });
 * ```
 */
export async function createIdea(input: CreateIdeaInput): Promise<Idea> {
  // ...
}
````

### Inline Comments

Use inline comments for complex logic:

```typescript
export function calculateConsistencyScore(metrics: DailyMetrics[]): number {
  // Calculate total days in range
  const totalDays = metrics.length;

  if (totalDays === 0) return 0;

  // Count days with published content
  const publishedDays = metrics.filter((m) => m.publishedCount > 0).length;

  // Calculate consistency ratio (0-1)
  const consistency = publishedDays / totalDays;

  // Apply bonus for streaks (10% bonus per streak)
  const currentStreak = getCurrentStreak(metrics);
  const streakBonus = Math.min(currentStreak * 0.1, 0.5); // Max 50% bonus

  // Final score: 0-1 range
  return Math.min(consistency + streakBonus, 1);
}
```

### TODO Comments

Use TODO for planned improvements:

```typescript
export function calculateScore(metrics: DailyMetrics[]): number {
  // TODO: Refactor to use Map for better performance
  const publishedDays = metrics.filter((m) => m.publishedCount > 0).length;

  // TODO: Add caching for expensive calculations
  const score = publishedDays / metrics.length;

  return score;
}
```

---

## 🎯 Quality Gates

Before pushing code, ensure:

```bash
# 1. Linting (0 errors, 0 warnings)
npm run lint

# 2. Type checking (0 errors)
npm run check-types

# 3. Tests (100% pass)
npm run test

# 4. Build (successful)
npm run build
```

---

## 📚 Further Reading

- [Architecture Overview](../architecture/overview.md)
- [Testing Strategy](./testing-strategy.md)
- [Security Guidelines](./security-guidelines.md)
