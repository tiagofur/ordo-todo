# @ordo-todo/db

Shared database package for Ordo-Todo using Prisma ORM with PostgreSQL.

## Setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure your PostgreSQL connection in `.env`

3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

4. Push schema to database:
   ```bash
   npm run db:push
   ```

5. (Optional) Seed with sample data:
   ```bash
   npm run db:seed
   ```

## Usage

```typescript
import { prisma } from "@ordo-todo/db";
// or
import { db } from "@ordo-todo/db";

// Query example
const tasks = await prisma.task.findMany({
  where: { userId: "..." },
  include: { project: true }
});
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes |
| `npm run db:migrate` | Create migration |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database |

## Schema

The database follows DDD aggregates:

- **User** - Authentication + settings
- **Workspace** - Top-level organization
- **Project** - Task container
- **Task** - Main entity with subtasks
- **Tag** - Labeling system
- **PomodoroSession** - Timer tracking
