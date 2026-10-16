# Architecture Overview

**The technical foundation of ORDO: The Creator's OS**

## 📋 Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Monorepo Structure](#monorepo-structure)
3. [Tech Stack](#tech-stack)
4. [Clean Architecture Layers](#clean-architecture-layers)
5. [Platform-Specific Apps](#platform-specific-apps)
6. [Shared Packages](#shared-packages)
7. [Data Flow](#data-flow)
8. [UI Architecture Strategy](#ui-architecture-strategy)

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Platform Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │    Web       │  │   Mobile     │  │   Desktop    │             │
│  │  (Next.js)   │  │ (React Native) │ │  (Electron)  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Application Layer                              │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                 Shared Packages (packages/)                   │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │   core   │ │   db     │ │   hooks  │ │  stores  │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │  styles  │ │ui-shared │ │    ui    │ │ui-mobile │ │ │
│  │  │ (tokens) │ │ (logic)  │ │(Radix)  │ │(NativeW) │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│  │  ┌──────────┐ ┌──────────┐                          │ │
│  │  │api-client│ │   i18n   │                          │ │
│  │  └──────────┘ └──────────┘                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │    Backend   │  │  PostgreSQL   │  │   External    │             │
│  │  (NestJS)    │  │   (Prisma)    │ │   Services    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                      (AI Services, Social APIs, etc.)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Monorepo Structure

```
ordo-creators/
│
├── apps/                          # Platform-specific applications
│   ├── backend/                   # NestJS REST API
│   │   ├── src/
│   │   │   ├── [domain]/          # Feature-based organization
│   │   │   ├── common/            # Shared backend code
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   ├── web/                       # Next.js 16 web app
│   │   ├── app/                  # App Router
│   │   ├── components/            # Web-specific components
│   │   ├── lib/                  # Web-specific utilities
│   │   └── package.json
│   │
│   ├── mobile/                    # React Native + Expo
│   │   ├── app/                  # Expo Router
│   │   ├── components/            # Mobile-specific components
│   │   └── package.json
│   │
│   └── desktop/                   # Electron + Vite
│       ├── src/
│       │   ├── main/
│       │   └── renderer/
│       └── package.json
│
└── packages/                     # Shared packages
    ├── core/                      # Domain logic (DDD)
    │   ├── src/
    │   │   ├── shared/
    │   │   ├── [domain]/
    │   │   └── index.ts
    │   └── package.json
    │
    ├── db/                        # Database (Prisma)
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── migrations/
    │   └── package.json
    │
    ├── styles/                    # ✅ Design Tokens (Single Source of Truth)
    │   ├── src/
    │   │   ├── tokens.ts          # Colors, spacing, typography, radii
    │   │   ├── theme.ts           # Theme definitions
    │   │   └── index.ts
    │   └── package.json
    │
    ├── ui-shared/                 # ✅ Shared UI Logic (No primitives)
    │   ├── src/
    │   │   ├── types/             # Shared component types
    │   │   ├── hooks/             # Shared UI hooks (useHover, etc.)
    │   │   ├── utils/             # CVA configs, accessibility logic
    │   │   └── index.ts
    │   └── package.json
    │
    ├── ui/                        # ✅ Web/Desktop UI (Radix + Tailwind)
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── primitives/     # Button, Input, Card (Web)
    │   │   │   ├── composition/    # Dialog, Menu, Tooltip (Radix)
    │   │   │   └── content/       # Content-specific components
    │   │   └── index.ts
    │   └── package.json
    │
    ├── ui-mobile/                 # ✅ Mobile UI (React Native + NativeWind)
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── primitives/     # Button, Input, Card (Native)
    │   │   │   ├── composition/    # Dialog, Modal (Native)
    │   │   │   └── content/       # Content-specific components
    │   │   └── index.ts
    │   └── package.json
    │
    ├── hooks/                     # React Query Hooks Factory
    │   ├── src/
    │   │   ├── ideas.ts
    │   │   ├── content-pieces.ts
    │   │   └── index.ts
    │   └── package.json
    │
    ├── stores/                    # Zustand Stores
    │   ├── src/
    │   │   ├── ui.ts
    │   │   ├── content.ts
    │   │   └── index.ts
    │   └── package.json
    │
    ├── api-client/                # REST API Client
    │   ├── src/
    │   │   ├── client.ts
    │   │   └── index.ts
    │   └── package.json
    │
    ├── i18n/                      # Translations
    │   ├── src/
    │   │   ├── locales/
    │   │   └── index.ts
    │   └── package.json
    │
    ├── config/                    # Shared configs
    ├── eslint-config/             # ESLint Configuration
    └── typescript-config/         # TypeScript Configuration
```

---

## 🛠️ Tech Stack

| Layer                  | Technology                     | Purpose                             |
| ---------------------- | ------------------------------ | ----------------------------------- |
| **Monorepo**           | Turborepo                      | Build caching, task orchestration   |
| **Web**                | Next.js 16 + React 19          | App Router, Server Components, RSC  |
| **Mobile**             | React Native + Expo 52         | iOS/Android, file-based routing     |
| **Desktop**            | Electron + Vite                | Cross-platform desktop              |
| **Backend**            | NestJS 11                      | Modular, TypeScript, REST API       |
| **Database**           | PostgreSQL 16 + Prisma 6       | Relational, type-safe ORM           |
| **Auth**               | Passport.js + JWT              | Authentication, authorization       |
| **State**              | React Query + Zustand          | Server & client state               |
| **Design Tokens**      | `@ordo-todo/styles`            | Single source of truth              |
| **UI Logic**           | `@ordo-todo/ui-shared`         | Hooks, types, utils (no primitives) |
| **Web UI**             | Radix UI + TailwindCSS v4      | Accessible components               |
| **Mobile UI**          | React Native + NativeWind v4   | Tailwind-like classes for RN        |
| **Desktop UI**         | Radix UI + TailwindCSS v4      | Same as web                         |
| **Variant Management** | class-variance-authority (CVA) | Component variants                  |
| **Testing**            | Vitest + Playwright + Detox    | Unit, E2E testing                   |

---

## 🏛️ Clean Architecture Layers

ORDO follows **Domain-Driven Design (DDD)** + **Clean Architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                       Presentation Layer                            │
│  (Apps: Web, Mobile, Desktop)                                      │
│  • Next.js Pages/React Native Screens                               │
│  • React Components (from packages/ui or packages/ui-mobile)         │
│  • Hooks & Stores (from packages/)                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                              │
│  (Backend: NestJS Services)                                        │
│  • Controllers (HTTP)                                               │
│  • Services (Business Logic)                                        │
│  • Use Cases (from packages/core)                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Domain Layer                                 │
│  (packages/core - Pure TypeScript)                                  │
│  • Entities (Idea, ContentPiece, Series)                           │
│  • Value Objects (Title, Status, DateRange)                        │
│  • Use Cases (CreateIdea, PublishContent)                         │
│  • NO infrastructure dependencies                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Infrastructure Layer                            │
│  (Backend: Repositories, External APIs)                            │
│  • Prisma (Database)                                                │
│  • OpenAI API (AI features)                                        │
│  • Social APIs (Twitter, LinkedIn, YouTube)                        │
│  • Webhook Handlers (WhatsApp, Telegram)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Platform-Specific Apps

### Web App (apps/web)

**Primary Dashboard for Creators**

**Responsibilities:**

- Content Pipeline (Kanban board)
- Detailed content editing
- Analytics & consistency scores
- Settings & preferences
- Social previews (Twitter/LinkedIn)

**UI Stack:**

- `@ordo-todo/ui` (Radix + Tailwind v4)
- `@ordo-todo/styles` (Design tokens)
- `@ordo-todo/ui-shared` (UI logic)

### Mobile App (apps/mobile)

**On-the-Go Capture & Quick Actions**

**Responsibilities:**

- Quick idea capture
- View content pipeline
- Publish to social media
- Push notifications (reminders)

**UI Stack:**

- `@ordo-todo/ui-mobile` (React Native + NativeWind v4)
- `@ordo-todo/styles` (Design tokens)
- `@ordo-todo/ui-shared` (UI logic)

### Desktop App (apps/desktop)

**Deep Work Environment**

**Responsibilities:**

- Distraction-free writing
- Pomodoro timer integration
- Keyboard shortcuts
- Offline mode

**UI Stack:**

- `@ordo-todo/ui` (Same as web: Radix + Tailwind v4)
- `@ordo-todo/styles` (Design tokens)
- `@ordo-todo/ui-shared` (UI logic)

---

## 📦 Shared Packages

### packages/styles

**Design Tokens (Single Source of Truth)**

**Contains:**

- Colors (primary, danger, neutral)
- Spacing (xs, sm, md, lg, xl)
- Radii (rounded corners)
- Typography (font families, sizes, weights)
- Shadows
- Z-index values

**Key Rule:** ONLY tokens, NO components, NO logic

```typescript
// packages/styles/src/tokens.ts
export const colors = {
  primary: {
    50: "#e6fffa",
    100: "#bff7ef",
    500: "#06b6d4",
    700: "#0891b2",
  },
  bg: {
    DEFAULT: "#0b1020",
    surface: "#0f1724",
  },
  text: {
    primary: "#e6eef8",
    muted: "#9aa4b2",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 6,
  md: 12,
  lg: 18,
};
```

### packages/ui-shared

**Shared UI Logic (No primitives)**

**Contains:**

- Component types (ButtonProps, InputProps, etc.)
- Shared hooks (useHover, useFocus, usePress)
- CVA configs (variant definitions)
- Accessibility utilities (ARIA helpers)
- Platform detection utilities

**Key Rule:** NO DOM primitives, NO RN primitives, ONLY logic

```typescript
// packages/ui-shared/src/types/button.ts
export interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  // Platform-specific callbacks
  onClick?: () => void; // Web
  onPress?: () => void; // Mobile/Native
  className?: string; // Web
  style?: object; // Mobile/Native
}
```

### packages/ui

**Web/Desktop UI (Radix + Tailwind)**

**Contains:**

- **Primitives**: Button, Input, Card, Text, Box
- **Composition**: Dialog, Menu, Tooltip, Dropdown
- **Content Components**: ContentPipeline, IdeaCard, SocialPreview
- **Platform-specific files**: `.web.tsx` only

**Key Rule:** Web-specific, uses `@ordo-todo/styles` + `@ordo-todo/ui-shared`

```typescript
// packages/ui/src/components/primitives/Button.web.tsx
import React from 'react';
import { cva } from 'class-variance-authority';
import { colors, spacing, radii } from '@ordo-todo/styles';
import type { ButtonProps } from '@ordo-todo/ui-shared';

const buttonVariants = cva('', {
  variants: {
    variant: {
      primary: `bg-[${colors.primary.500}] text-white`,
      ghost: 'bg-transparent text-cyan-300',
    },
    size: {
      sm: `px-3 py-1 text-sm rounded-[${radii.sm}px]`,
      md: `px-4 py-2 rounded-[${radii.md}px]`,
    },
  },
});

export default function Button({ title, children, variant = 'primary', size = 'md', onClick, disabled, className }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      onClick={onClick}
      disabled={disabled}
    >
      {title ?? children}
    </button>
  );
}
```

### packages/ui-mobile

**Mobile UI (React Native + NativeWind)**

**Contains:**

- **Primitives**: Button, Input, Card, Text, Box
- **Composition**: Modal, ActionSheet, BottomSheet
- **Content Components**: ContentPipeline, IdeaCard
- **Platform-specific files**: `.native.tsx` only

**Key Rule:** Mobile-specific, uses `@ordo-todo/styles` + `@ordo-todo/ui-shared`

```typescript
// packages/ui-mobile/src/components/primitives/Button.native.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styled } from 'nativewind';
import { colors, spacing, radii } from '@ordo-todo/styles';
import type { ButtonProps } from '@ordo-todo/ui-shared';

const StyledTouchable = styled(TouchableOpacity);
const StyledText = styled(Text);

export default function Button({ title, children, variant = 'primary', size = 'md', onPress, disabled }: ButtonProps) {
  const variantClass = variant === 'primary' ? `bg-[${colors.primary.500}]` : 'bg-transparent';
  const sizeClass = size === 'md' ? `px-4 py-2 rounded-[${radii.md}px]` : `px-3 py-1 rounded-[${radii.sm}px]`;

  return (
    <StyledTouchable
      className={`${variantClass} ${sizeClass}`}
      onPress={onPress}
      disabled={disabled}
    >
      <StyledText className="text-white font-medium">{title ?? children}</StyledText>
    </StyledTouchable>
  );
}
```

---

## 🔄 Data Flow

### Creating an Idea

```
User Input (Web/Mobile)
    ↓
Form Submit (Client Component)
    ↓
useCreateIdea Hook (packages/hooks)
    ↓
API Client POST /ideas (packages/api-client)
    ↓
Backend Controller (apps/backend)
    ↓
Backend Service → CreateIdeaUseCase (packages/core)
    ↓
Repository → Prisma (packages/db)
    ↓
PostgreSQL
    ↓
Return Idea
    ↓
React Query Cache Updated
    ↓
UI Re-renders (Web: Radix, Mobile: NativeWind)
```

---

## 🎨 UI Architecture Strategy

ORDO uses a **hybrid UI architecture** that maximizes code reuse while respecting platform differences.

### The Strategy

1. **Single Source of Truth** (`@ordo-todo/styles`): Design tokens only
2. **Shared UI Logic** (`@ordo-todo/ui-shared`): Types, hooks, utils (no primitives)
3. **Platform-Specific UI**:
   - `@ordo-todo/ui` (Web/Desktop): Radix + Tailwind v4
   - `@ordo-todo/ui-mobile` (Mobile): React Native + NativeWind v4

### Component Layer Structure

```
Layer 1: Design Tokens (@ordo-todo/styles)
  ↓ Colors, spacing, typography, radii
  ↓
Layer 2: UI Logic (@ordo-todo/ui-shared)
  ↓ Types, hooks, CVA configs, accessibility
  ↓
Layer 3: Platform Components
  ↓ @ordo-todo/ui (Web/Desktop: Radix + Tailwind)
  ↓ @ordo-todo/ui-mobile (Mobile: NativeWind)
  ↓
Layer 4: Content Components
  ↓ ContentPipeline, IdeaCard, SocialPreview
  ↓
Layer 5: Apps (Web/Mobile/Desktop)
  ↓ Pages, screens, features
```

### Platform-Specific File Resolution

Using `.web.tsx` and `.native.tsx` extensions:

```typescript
// packages/ui-shared/src/Button.tsx
// Re-exports platform-specific implementation
export { default as Button } from "./platform/Button";

// packages/ui-shared/src/platform/Button.web.tsx
// Web implementation (Radix + Tailwind)

// packages/ui-shared/src/platform/Button.native.tsx
// Mobile implementation (NativeWind)
```

### Identical Component API

Both platforms use the same props interface:

```typescript
interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void; // Web
  onPress?: () => void; // Mobile
  className?: string; // Web
  style?: object; // Mobile
}
```

---

## 📚 Further Reading

- [Clean Architecture Guide](./clean-architecture.md)
- [Monorepo Structure Guide](./monorepo.md)
- [Design Tokens Guide](../packages/design-tokens.md)
- [UI Architecture Strategy](../packages/ui-architecture.md)
- [Web Development Guide](../development/web-development.md)
- [Mobile Development Guide](../development/mobile-development.md)
