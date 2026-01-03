# Ordo-Todo Project Rules

**Mandatory rules for all agents working on the Ordo-Todo project.**

## 📋 Table of Contents

1. [Architecture Rules](#architecture-rules)
2. [Code Quality Rules](#code-quality-rules)
3. [Testing Rules](#testing-rules)
4. [UI/UX Rules](#uiux-rules)
5. [Platform & Domain Rules](#platform--domain-rules)
6. [Performance Rules](#performance-rules)
7. [Security Rules](#security-rules)
8. [Documentation Rules](#documentation-rules)

---

## 🏗️ Architecture Rules

### Monorepo Structure (Turborepo)

```
ordo-todo/
├── apps/
│   ├── backend/      # NestJS REST API (@ordo-todo/backend)
│   ├── web/          # Next.js 15 web app (@ordo-todo/web)
│   ├── mobile/       # React Native + Expo (@ordo-todo/mobile)
│   └── desktop/      # Electron + Vite (@ordo-todo/desktop)
│
└── packages/
    ├── core/         # Domain logic, entities, use cases (@ordo-todo/core)
    ├── db/           # Prisma schema & migrations (@ordo-todo/db)
    ├── ui/           # Shared React components (@ordo-todo/ui)
    ├── hooks/        # React Query hooks factory (@ordo-todo/hooks)
    ├── stores/       # Zustand stores (@ordo-todo/stores)
    ├── api-client/   # REST API client (@ordo-todo/api-client)
    ├── i18n/         # Translations (3 languages) (@ordo-todo/i18n)
    └── styles/       # Shared Tailwind config (@ordo-todo/styles)
```

### Rule 1: Code Placement Decision Tree

```
Is this feature-specific?
├─ YES → Place in the app (apps/backend, apps/web, etc.)
└─ NO → Is it used by 2+ apps?
    ├─ YES → Place in packages/
    │   ├─ Business logic? → packages/core
    │   ├─ UI component? → packages/ui
    │   ├─ Data fetching? → packages/hooks
    │   ├─ State management? → packages/stores
    │   ├─ API calls? → packages/api-client
    │   └─ Translations? → packages/i18n
    └─ NO → Keep local
```

### Rule 2: Clean Architecture Layers

**For Backend (NestJS):**
```
Controller (HTTP) → Service (Business Logic) → Repository (Data)
     ↓                    ↓                          ↓
  DTOs & Validation    Use Cases (from core)    Prisma (packages/db)
```

**For Frontend (Next.js):**
```
Page/Layout → Container Component → UI Component (from packages/ui)
     ↓              ↓                           ↓
  Server Actions   React Query Hook       Pure UI (no hooks)
  (API calls)    (packages/hooks)        (from packages/ui)
```

### Rule 3: Import Rules

```typescript
// ✅ CORRECT: Use workspace protocol for shared packages
import { Button } from '@ordo-todo/ui';
import { useTasks } from '@ordo-todo/hooks';
import { Task } from '@ordo-todo/core';

// ❌ WRONG: Relative imports for packages
import { Button } from '../../../ui/src/components/button';

// ✅ CORRECT: Relative imports within same app/package
import { LocalComponent } from './local-component';
import { util } from '../utils/helper';

// ❌ WRONG: Absolute imports for local files
import { LocalComponent } from '@/components/local-component';
```

---

## ✅ Code Quality Rules

### Rule 4: TypeScript Strict Mode

**ALL packages/apps MUST:**
- Enable `strict: true` in `tsconfig.json`
- Enable `noImplicitAny`, `strictNullChecks`
- NO `any` types without compelling reason
- Proper interface/type exports

```typescript
// ✅ CORRECT
interface TaskProps {
  title: string;
  status: TaskStatus;
  onToggle: (id: string) => void;
}

// ❌ WRONG
interface TaskProps {
  title: any;
  status: any;
  onToggle: (id: any) => void;
}
```

### Rule 5: Error Handling

**Backend (NestJS):**
```typescript
// ✅ CORRECT: Use NestJS built-in exceptions
throw new BadRequestException('Title is required');
throw new UnauthorizedException();
throw new NotFoundException('Task not found');

// ❌ WRONG: Generic errors
throw new Error('Something went wrong');
```

**Frontend (React):**
```typescript
// ✅ CORRECT: Handle errors gracefully
const { error, data } = useTasks();
if (error) {
  return <ErrorState message={error.message} />;
}

// ❌ WRONG: Ignore errors
const { data } = useTasks(); // error is lost
```

### Rule 6: Naming Conventions

- **Files**: `kebab-case.ts` or `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private properties**: `_camelCase`

### Rule 7: Code Formatting

**ALL code MUST:**
- Use Prettier with `@ordo-todo/eslint-config`
- Pass ESLint with zero warnings
- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons

---

## 🧪 Testing Rules (NON-NEGOTIABLE)

### Rule 8: Test Coverage Requirements

**Minimum Coverage:**
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

**Critical Paths (100% Required):**
- Authentication & authorization
- Payment processing (if applicable)
- Data persistence (database operations)
- Input validation
- Error handling

### Rule 9: Test Types Required

**For EVERY feature, MUST have:**

1. **Unit Tests** (70%)
   - Pure functions
   - Components in isolation
   - Hooks, utilities

2. **Integration Tests** (20%)
   - API + Database
   - Component + Hooks
   - Multiple units working together

3. **E2E Tests** (10%)
   - Critical user flows only
   - Login → Create Task → Complete Task
   - Playwright for web, Detox for mobile

### Rule 10: Test Before Completion

**Agents MUST NOT consider a task complete until:**
```bash
# All these commands MUST pass:
npm run lint           # Zero errors, zero warnings
npm run check-types    # Zero type errors
npm run test           # All tests pass
npm run build          # Zero build errors
```

---

## 🎨 UI/UX Rules

### Rule 13: NO Transparecies (Strict)

**Backgrounds MUST be solid colors:**
```css
/* ✅ CORRECT: Solid colors */
background-color: #ffffff;
background-color: #f3f4f6;

/* ❌ WRONG: Transparencies */
background-color: rgba(255, 255, 255, 0.5);
opacity: 0.9;
```

### Rule 14: NO Gradients (Strict)

**Backgrounds MUST be solid:**
```css
/* ✅ CORRECT: Solid color */
background-color: #3b82f6;

/* ❌ WRONG: Gradients */
background: linear-gradient(90deg, #3b82f6, #8b5cf6);
```

### Rule 15: Perfect Responsiveness (Mandatory)

**ALL components MUST support:**
- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

### Rule 16: Accessibility (WCAG AA)

**ALL UI components MUST:**
1. **Keyboard Navigation**: All interactive elements accessible via Tab
2. **ARIA Labels**: All buttons, inputs have aria-label or visible text
3. **Color Contrast**: Minimum 4.5:1 for text
4. **Focus Indicators**: Visible focus outline
5. **Semantic HTML**: Correct headings, landmarks

### Rule 17: Dark Mode Support

**ALL components MUST support dark mode.**

---

## 📁 Platform & Domain Rules

**Refer to these specific files for detailed rules:**

- **Backend (NestJS)**: [rules/backend.md](backend.md)
- **Frontend (Next.js)**: [rules/frontend.md](frontend.md)
- **Mobile (React Native)**: [rules/mobile.md](mobile.md)
- **Desktop (Electron)**: [rules/desktop.md](desktop.md)
- **Shared Packages**: [rules/packages.md](packages.md)

**Agents MUST consult these rules before working on specific platforms/domains.**

---

## ⚡ Performance Rules

### Rule 22: Web Vitals Targets

**ALL pages MUST meet:**
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Rule 23: Image Optimization

**ALL images MUST:**
- Use `next/image` (web) or optimized equivalents
- Have explicit width/height
- Use appropriate formats (WebP, AVIF)
- Implement lazy loading for below-fold images

### Rule 24: Code Splitting

**Use dynamic imports for:**
- Heavy components, Charts, Modals, Admin panels

---

## 🔒 Security Rules

### Rule 25: Input Validation

**ALL user input MUST be validated:**
- Backend: `class-validator`
- Frontend: `zod`

### Rule 26: Authentication & Authorization

- ✅ All endpoints protected by `@UseGuards(JwtAuthGuard)`
- ✅ Public endpoints marked with `@Public()`
- ✅ Authorization checks (user owns resource)

### Rule 27: Environment Variables

**Secrets MUST be in environment variables.** NEVER hardcode secrets.

---

## 📚 Documentation Rules

### Rule 28: JSDoc Comments

**ALL exported functions MUST have JSDoc.**

### Rule 29: README Files

**Each package/app MUST have a `README.md`.**

### Rule 30: API Documentation

**Backend APIs MUST have Swagger/OpenAPI documentation.**

---

## 🎯 Agent Workflow Rules

### Rule 31: Mandatory Development Cycle

**ALL agents MUST follow this sequence:**

1. **RESEARCH** (5 min)
2. **IMPLEMENT** (varies)
3. **TEST** (mandatory)
4. **VALIDATE** (mandatory)
5. **REFACTOR** (if needed)
6. **DOCUMENT** (mandatory)
7. **REPEAT** (until all quality gates pass)

**Agents MUST NOT declare task complete until ALL quality gates pass.**

---

## 🚫 Forbidden Patterns

### ❌ NEVER Do:

1. **Skip tests**: "I'll add tests later" → NO! Add tests now
2. **Use `any` type**: "It's too complicated" → NO! Create proper types
3. **Hardcode values**: "Just this once" → NO! Use constants or env vars
4. **Copy-paste code**: "It's similar but not the same" → NO! Extract shared logic
5. **Ignore warnings**: "It's just a warning" → NO! Fix it
6. **Push failing tests**: "I'll fix it in the next commit" → NO! All tests must pass
7. **Skip documentation**: "The code is self-explanatory" → NO! Add JSDoc
8. **Use transparencies**: "It looks cool" → NO! Use solid colors
9. **Use gradients**: "It makes it pop" → NO! Use solid colors
10. **Ignore mobile**: "Nobody uses mobile" → NO! Perfect responsiveness required

### ✅ ALWAYS Do:

1. **Write tests first** (TDD when possible)
2. **Type everything** (no implicit any)
3. **Extract shared logic** (packages/ui, packages/core, etc.)
4. **Fix all warnings** (zero tolerance)
5. **Run all tests** before committing
6. **Document code** (JSDoc, README, examples)
7. **Use solid colors** (no transparencies)
8. **Test on mobile** (320px - 640px)
9. **Check accessibility** (keyboard, screen reader)
10. **Validate performance** (Lighthouse, Web Vitals)
