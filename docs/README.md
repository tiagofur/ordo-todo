# ORDO: The Creator's OS - Documentation

**The Operating System for Content Creators**

## 📖 Table of Contents

### Getting Started

- [Quick Start](./guides/development/getting-started.md)
- [Development Setup](./guides/development/getting-started.md)

### Architecture Guides

- [Architecture Overview](./guides/architecture/overview.md) - High-level architecture & hybrid UI strategy
- [Clean Architecture & DDD](./guides/architecture/clean-architecture.md) - Domain-driven design principles
- [Monorepo Structure](./guides/architecture/monorepo.md) - Turborepo monorepo with UI packages

### Development Guides

- [Web Development (Next.js)](./guides/development/web-development.md)
- [Backend Development (NestJS)](./guides/development/backend-development.md)
- [Mobile Development (React Native)](./guides/development/mobile-development.md) - Coming soon
- [Desktop Development (Electron)](./guides/development/desktop-development.md) - Coming soon

### Package Guides

- [Design Tokens](./guides/packages/design-tokens.md) - Single source of truth
- [UI Architecture Strategy](./guides/packages/ui-architecture.md) - Hybrid 3-layer architecture
- [UI Components](./guides/packages/ui-components.md) - Building platform-specific components
- [Domain Logic (packages/core)](./guides/packages/core.md) - DDD entities & use cases
- [Data Fetching Hooks (packages/hooks)](./guides/packages/hooks.md) - React Query factory pattern
- [State Management (packages/stores)](./guides/packages/stores.md) - Coming soon
- [API Client (packages/api-client)](./guides/packages/api-client.md) - Coming soon

### Best Practices

- [Coding Standards](./guides/best-practices/coding-standards.md)
- [Testing Strategy](./guides/best-practices/testing-strategy.md) - Coming soon
- [Performance Optimization](./guides/best-practices/performance-optimization.md) - Coming soon
- [Security Guidelines](./guides/best-practices/security-guidelines.md) - Coming soon
- [Accessibility Guidelines](./guides/best-practices/accessibility-guidelines.md) - Coming soon

### Features Documentation

- [The Content Pipeline](./features/content-pipeline.md) - ORDO's killer feature
- [Frictionless Capture (Bot)](./features/frictionless-capture.md) - Coming soon
- [The Remix Engine (Atomization)](./features/remix-engine.md) - Coming soon
- [Consistency Score (Gamification)](./features/consistency-score.md) - Coming soon
- [AI Copilot]((./features/ai-copilot.md) - Coming soon
- [Idea Graveyard](./features/idea-graveyard.md) - Coming soon

### Reference

- [API Reference](./reference/api-reference.md) - Coming soon
- [Database Schema](./reference/database-schema.md) - Coming soon
- [Design Tokens](./reference/design-tokens.md) - Coming soon

---

## 🎯 What is ORDO?

ORDO is **NOT** another generic to-do app. It is an **Operating System for Content Creators** designed to solve specific problems creators face:

- **Chaos**: Ideas are scattered across notes, emails, and random thoughts
- **Inconsistency**: Great content exists, but publishing is irregular
- **Overwhelm**: Too many ideas lead to decision paralysis
- **Atomization**: Long-form content isn't repurposed efficiently

Our mission: **Ship More, Manage Less.**

---

## 💡 Core Philosophy

### Opinionated Software

ORDO doesn't give you a blank canvas—it gives you a **proven workflow**:

```
Idea → Scripting → Filming → Editing → Scheduled → Published
```

This is **The Content Pipeline**, our killer feature designed to move content from ideation to publication consistently.

### Built for Creators

Every feature in ORDO is purpose-built for content creators:

| Feature              | Problem Solved                                         |
| -------------------- | ------------------------------------------------------ |
| Content Pipeline     | Visualizes content journey from idea to published      |
| Frictionless Capture | Captures ideas instantly (no friction = no lost ideas) |
| Remix Engine         | Atomizes one piece of content into 10+ micro-content   |
| Consistency Score    | Gamifies publishing consistency, not productivity      |
| AI Copilot           | Breaks writer's block with AI assistance               |
| Idea Graveyard       | Reduces visual clutter by auto-archiving stale ideas   |

---

## 🏗️ Architecture Overview

ORDO uses a **monorepo** structure with **Turborepo** for efficient builds and caching:

### Tech Stack

| Layer        | Technology               | Purpose                            |
| ------------ | ------------------------ | ---------------------------------- |
| **Monorepo** | Turborepo                | Build caching, task orchestration  |
| **Web**      | Next.js 16 + React 19    | App Router, Server Components, RSC |
| **Mobile**   | React Native + Expo 52   | iOS/Android, file-based routing    |
| **Desktop**  | Electron + Vite          | Cross-platform desktop             |
| **Backend**  | NestJS 11                | Modular, TypeScript, REST API      |
| **Database** | PostgreSQL 16 + Prisma 6 | Relational, type-safe ORM          |
| **Auth**     | Passport.js + JWT        | Authentication, authorization      |
| **State**    | React Query + Zustand    | Server & client state              |

### Hybrid UI Architecture

ORDO uses a **3-layer hybrid UI architecture** for maximum code reuse:

```
Layer 1: @ordo-todo/styles (Design Tokens)
  ↓ Colors, spacing, typography, radii
  ↓
Layer 2: @ordo-todo/ui-shared (UI Logic)
  ↓ Types, hooks, CVA configs, accessibility
  ↓
Layer 3: Platform Components
  ↓ @ordo-todo/ui (Web/Desktop: Radix + Tailwind v4)
  ↓ @ordo-todo/ui-mobile (Mobile: React Native + NativeWind v4)
```

**Key Benefits:**

- ✅ Single source of truth for design tokens
- ✅ Maximum code reuse across platforms
- ✅ Platform-optimized performance (Native on mobile, Radix on web)
- ✅ Identical component API on all platforms

### Monorepo Structure

```
ordo-creators/
├── apps/
│   ├── backend/       # NestJS REST API (@ordo-todo/backend)
│   ├── web/           # Next.js 16 web app (@ordo-todo/web)
│   ├── mobile/        # React Native + Expo (@ordo-todo/mobile)
│   └── desktop/       # Electron + Vite (@ordo-todo/desktop)
│
└── packages/
    ├── core/          # DDD Domain: Entities, Use Cases (pure TS)
    ├── db/            # Prisma Schema & Migrations
    ├── styles/        # ✅ Design Tokens (Single Source of Truth)
    ├── ui-shared/     # ✅ UI Logic (Types, hooks, utils)
    ├── ui/            # ✅ Web/Desktop UI (Radix + Tailwind v4)
    ├── ui-mobile/      # ✅ Mobile UI (React Native + NativeWind v4)
    ├── hooks/         # React Query Hooks Factory
    ├── stores/        # Zustand Stores
    ├── api-client/    # REST API Client (Axios)
    ├── i18n/          # Translations (3 languages)
    ├── config/        # Shared configs (ESLint, TSConfig)
    ├── eslint-config/ # ESLint Configuration
    └── typescript-config/ # TypeScript Configuration
```

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/tiagofur/ordo-creators.git
cd ordo-creators

# Install dependencies
pnpm install

# Setup environment
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your DATABASE_URL, OPENAI_API_KEY, JWT_SECRET

# Setup database
docker-compose up -d
cd apps/web
npx prisma db push
npx prisma generate

# Run development servers
cd ../..
pnpm dev
```

**Access Points:**

- Web App: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

---

## 🔑 Key Packages

### packages/styles

**Design Tokens (Single Source of Truth)**

- Colors (primary, danger, neutral)
- Spacing, radii, typography
- NO components, NO logic

### packages/ui-shared

**Shared UI Logic (No primitives)**

- Component types (ButtonProps, InputProps, etc.)
- Shared hooks (useHover, useFocus, usePress)
- CVA configs, accessibility utilities

### packages/ui

**Web/Desktop UI (Radix + Tailwind)**

- Primitives: Button, Input, Card
- Composition: Dialog, Menu, Tooltip (Radix)
- Content Components: ContentPipeline, IdeaCard

### packages/ui-mobile

**Mobile UI (React Native + NativeWind)**

- Primitives: Button, Input, Card
- Composition: Modal, ActionSheet (Native)
- Content Components: ContentPipeline, IdeaCard

### packages/core

**Domain Logic (DDD)**

- Entities: Idea, ContentPiece, Series
- Use Cases: CreateIdea, PublishContent
- Pure TypeScript (no infrastructure)

### packages/hooks

**Data Fetching with React Query**

- Factory pattern for creating hooks
- Type-safe API calls
- Automatic caching & invalidation

---

## 🛠️ Development Workflow

### For Backend Developers

1. **Add Feature to Domain (`packages/core`)**
   - Create entity (e.g., `Idea`, `ContentPiece`)
   - Create use case (e.g., `CreateIdeaUseCase`)
   - Write unit tests

2. **Create API Endpoint (`apps/backend`)**
   - Create controller (e.g., `IdeasController`)
   - Create service (use domain use cases)
   - Add DTOs with class-validator
   - Write integration tests

3. **Add Frontend Hook (`packages/hooks`)**
   - Create hook factory for endpoint
   - Add to `api-hooks.ts`

4. **Build UI Components**
   - Create shared types in `packages/ui-shared`
   - Create web implementation in `packages/ui`
   - Create mobile implementation in `packages/ui-mobile`
   - Use design tokens from `packages/styles`

### For Frontend Developers

1. **Use Shared Components**
   - Import from `@ordo-todo/ui` (web) or `@ordo-todo/ui-mobile` (mobile)
   - Use design tokens from `@ordo-todo/styles`
   - Use types from `@ordo-todo/ui-shared`

2. **Use Shared Hooks**
   - Import from `@ordo-todo/hooks`
   - React Query handles caching/invalidation

3. **Create Pages (Apps)**
   - Use App Router (Next.js)
   - Server Components by default
   - Client Components for interactivity

---

## 📚 Best Practices

### Global Companies Standards

We follow best practices from industry leaders:

| Company       | Practice               | Implementation                   |
| ------------- | ---------------------- | -------------------------------- |
| **Google**    | Clean Architecture     | DDD layers, dependency injection |
| **Apple**     | Platform-First Design  | Platform-agnostic packages       |
| **Microsoft** | TypeScript Strict Mode | Zero `any`, full type safety     |
| **Anthropic** | Code Quality           | 80%+ test coverage mandatory     |
| **OpenAI**    | API Design             | RESTful, versioned, documented   |

### Our Standards

- **TypeScript Strict Mode**: All packages/apps MUST use strict mode
- **100% Type Safety**: NO `any` types without compelling reason
- **80%+ Test Coverage**: Unit, integration, E2E tests required
- **Code Reviews**: All code must be reviewed before merging
- **Zero Warnings**: Lint must pass (0 errors, 0 warnings)
- **Documentation**: All exported functions need JSDoc

### UI/UX Standards

- **NO Transparencies**: Solid colors only
- **NO Gradients**: Solid backgrounds
- **Perfect Responsiveness**: Mobile (320px-640px), Tablet (641px-1024px), Desktop (1025px+)
- **Dark Mode**: All components must support dark mode
- **WCAG AA**: 4.5:1 contrast ratio minimum
- **Keyboard Navigation**: All interactive elements accessible via Tab

---

## 🧪 Testing Strategy

### Unit Tests (70%)

- Pure functions, utilities
- Domain logic (entities, use cases)
- Components in isolation
- Run with `npm run test`

### Integration Tests (20%)

- API + Database
- Components + Hooks
- Multiple units working together
- Run with `npm run test:integration`

### E2E Tests (10%)

- Critical user flows only
- Playwright (web), Detox (mobile)
- Run with `npm run test:e2e`

---

## 📖 Additional Resources

- [Architecture Deep Dive](./guides/architecture/overview.md)
- [Design Tokens Guide](./guides/packages/design-tokens.md)
- [UI Architecture Strategy](./guides/packages/ui-architecture.md)
- [UI Components Guide](./guides/packages/ui-components.md)
- [Component Guidelines](./guides/packages/ui-components.md)
- [API Reference](./reference/api-reference.md)
- [Database Schema](./reference/database-schema.md)

---

## 📚 Further Reading

- [Architecture Overview](./guides/architecture/overview.md)
- [Clean Architecture Guide](./guides/architecture/clean-architecture.md)
- [Component Guidelines](./guides/packages/ui-components.md)
- [API Reference](./reference/api-reference.md)

---

**Built with ❤️ for Content Creators**

> _"No construyas para todos. Construye para alguien. Si a ese alguien le encanta, has ganado."_
>
> — Equipo Ordo
