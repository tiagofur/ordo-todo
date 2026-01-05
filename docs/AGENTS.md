# Build, Test & Quality Commands

## Root Level (Turborepo)
- `npm run build` - Build all packages and apps
- `npm run lint` - Lint all workspaces
- `npm run check-types` - Type check all workspaces
- `npm run format` - Format with Prettier (single quotes, trailing commas, 2 spaces)
- `npm run test` - Run all tests
- `npm run dev --filter=@ordo-todo/web` - Run specific app (web/backend/mobile/desktop)

## Single Test Commands
- Backend (Jest): `cd apps/backend && npm run test -- -t "testName"` or `jest -t "testName"`
- Web (Vitest): `cd apps/web && vitest run path/to/test.test.ts`
- Desktop (Vitest): `cd apps/desktop && vitest run path/to/test.test.ts`
- E2E tests: `cd apps/backend && npm run test:e2e`

# Code Style Guidelines

## General Conventions
- Files: `kebab-case` (e.g., `user-login.usecase.ts`)
- Classes: `PascalCase` (e.g., `class RegisterUser`)
- Variables/Functions: `camelCase` (e.g., `const userRepo`, `async execute()`)
- Imports: Use `.js` extensions for relative imports in packages

## TypeScript
- Strict mode enabled (`strict: true`)
- Interfaces for types, type aliases for unions
- Error handling: `error instanceof Error ? error.message : String(error)`
- Always use type annotations for function parameters and return types

## Backend (NestJS)
- Use `@Public()` decorator for public endpoints (JWT is global guard)
- Extract `userId` from JWT with `@CurrentUser()` decorator, never from body
- DTOs with `class-validator` decorators for all inputs
- Constructor injection only, never manual instantiation
- Logger injected via `private readonly logger = new Logger(ClassName.name)`
- Use NestJS exceptions (`NotFoundException`, `BadRequestException`)

## Frontend (Next.js/React)
- Server Components by default, add `"use client"` only when interactive
- Platform-agnostic UI components in `packages/ui` (no hooks, no stores)
- TailwindCSS classes only, no inline styles
- Use CVA (class-variance-authority) for component variants
- Forms: React Hook Form + Zod validation
- Data fetching: TanStack Query with proper cache invalidation

## Imports Pattern
```typescript
// Apps: Import from workspace packages
import { Button, TaskCard } from '@ordo-todo/ui';

// Packages: Relative imports with .js extension
import { Button } from '../ui/button.js';
import { UserService } from './user.service.js';
```
