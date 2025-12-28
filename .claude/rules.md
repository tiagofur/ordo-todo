# Ordo-Todo Project Rules

**Mandatory rules for all agents working on the Ordo-Todo project.**

## 📋 Table of Contents

1. [Architecture Rules](#architecture-rules)
2. [Code Quality Rules](#code-quality-rules)
3. [Testing Rules](#testing-rules)
4. [UI/UX Rules](#uiux-rules)
5. [Shared Packages Rules](#shared-packages-rules)
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

```typescript
// ✅ CORRECT
const MAX_TASKS = 100;
interface TaskCardProps { }
export function TaskCard() { }
private _logger: Logger;

// ❌ WRONG
const maxTasks = 100;
interface taskCardProps { }
export function taskCard() { }
```

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

**If ANY test fails:**
1. Fix the code OR fix the test
2. Re-run tests
3. Repeat until ALL tests pass
4. NO EXCEPTIONS

### Rule 11: Test Quality Standards

```typescript
// ✅ GOOD: Tests behavior, not implementation
test('submits form when button clicked', async () => {
  render(<LoginForm onSubmit={handleSubmit} />);
  await userEvent.click(screen.getByRole('button', { name: /login/i }));
  expect(handleSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
});

// ❌ BAD: Tests implementation details
test('calls setState with isOpen true', () => {
  const component = new LoginForm();
  component.setState({ isOpen: true });
  expect(component.state.isOpen).toBe(true);
});
```

### Rule 12: No Flaky Tests

**ALL tests MUST be deterministic:**
- ✅ Use `waitFor()`, `findBy*`, NOT `setTimeout()`
- ✅ Mock external dependencies (APIs, databases, time)
- ✅ Isolate tests (no shared state)
- ✅ Clean up after each test

```typescript
// ✅ GOOD
await waitFor(() => expect(screen.getByText('Success')).toBeVisible());

// ❌ BAD
await sleep(1000); // Arbitrary wait
```

---

## 🎨 UI/UX Rules

### Rule 13: NO Transparecies (Strict)

**Backgrounds MUST be solid colors:**
```css
/* ✅ CORRECT: Solid colors */
background-color: #ffffff;
background-color: #f3f4f6;
background: rgb(255, 255, 255);

/* ❌ WRONG: Transparencies */
background-color: rgba(255, 255, 255, 0.5);
background: rgba(0, 0, 0, 0.1);
opacity: 0.9;
```

**Exception:** Only for disabled states with solid backing:
```css
/* ✅ ACCEPTABLE: Disabled with solid container */
button:disabled {
  opacity: 0.5;
}
.parent-container:disabled {
  background-color: #f3f4f6; /* Solid backing */
}
```

### Rule 14: NO Gradients (Strict)

**Backgrounds MUST be solid:**
```css
/* ✅ CORRECT: Solid color */
background-color: #3b82f6;

/* ❌ WRONG: Gradients */
background: linear-gradient(90deg, #3b82f6, #8b5cf6);
background: radial-gradient(circle, #3b82f6, #1d4ed8);
```

**Use Tailwind solid colors:**
```tsx
{/* ✅ CORRECT */}
<div className="bg-blue-500 text-white" />

{/* ❌ WRONG */}
<div className="bg-gradient-to-r from-blue-500 to-purple-500" />
```

### Rule 15: Perfect Responsiveness (Mandatory)

**ALL components MUST support:**
- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

```tsx
// ✅ CORRECT: Mobile-first responsive design
<div className="
  grid
  grid-cols-1          /* Mobile: 1 column */
  md:grid-cols-2       /* Tablet: 2 columns */
  lg:grid-cols-3       /* Desktop: 3 columns */
  gap-4
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// ✅ CORRECT: Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive heading
</h1>

// ✅ CORRECT: Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  Content with responsive padding
</div>
```

### Rule 16: Accessibility (WCAG AA)

**ALL UI components MUST:**
1. **Keyboard Navigation**: All interactive elements accessible via Tab
2. **ARIA Labels**: All buttons, inputs have aria-label or visible text
3. **Color Contrast**: Minimum 4.5:1 for text
4. **Focus Indicators**: Visible focus outline
5. **Semantic HTML**: Correct headings, landmarks

```tsx
// ✅ CORRECT: Accessible button
<button
  type="button"
  onClick={handleClick}
  aria-label="Close dialog"
  className="focus:ring-2 focus:ring-blue-500"
>
  <XIcon />
</button>

// ✅ CORRECT: Accessible form
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
  aria-describedby="email-hint"
/>
<span id="email-hint" className="text-sm text-gray-600">
  We'll never share your email
</span>
```

### Rule 17: Dark Mode Support

**ALL components MUST support dark mode:**

```tsx
// ✅ CORRECT: Dark mode classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content that works in both light and dark mode
</div>

// ✅ CORRECT: Dark mode for components
<Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
  <h3 className="text-gray-900 dark:text-gray-100">Title</h3>
</Card>

// ✅ CORRECT: Dark mode for images (if needed)
<Image
  src="/logo.png"
  alt="Logo"
  className="invert dark:invert-0"
/>
```

---

## 📦 Shared Packages Rules

### Rule 18: UI Components Location

**ALL shared UI components MUST be in `packages/ui/`:**

```
packages/ui/src/
├── components/
│   ├── ui/              # Base components (Button, Input, Card)
│   ├── task/            # Task-specific components
│   ├── project/         # Project-specific components
│   ├── workspace/       # Workspace-specific components
│   └── shared/          # Other shared components
└── index.ts             # Barrel exports
```

**Rule: If component is used by 2+ features, move to packages/ui**

### Rule 19: Platform-Agnostic Components

**Components in packages/ui MUST:**
- ✅ Have NO platform-specific code
- ✅ Accept data via props (not fetch it)
- ✅ Accept callbacks via props (not use hooks)
- ✅ Be usable in web, mobile, desktop

```tsx
// ✅ CORRECT: Platform-agnostic
interface TaskCardProps {
  task: Task;                          // Data from parent
  onTaskClick: (id: string) => void;   // Callback from parent
  labels?: {                           // i18n from parent
    complete?: string;
    delete?: string;
  };
}

export function TaskCard({ task, onTaskClick, labels }: TaskCardProps) {
  return (
    <Card onClick={() => onTaskClick(task.id)}>
      <h3>{task.title}</h3>
    </Card>
  );
}

// ❌ WRONG: Uses hooks (platform-specific)
import { useTasks } from '@ordo-todo/hooks'; // WRONG!
import { useTranslation } from 'next-intl';  // WRONG!
```

### Rule 20: Core Package (Domain Logic)

**`packages/core/` MUST:**
- Contain ONLY domain entities and use cases
- Have NO external dependencies (except testing libs)
- Be platform-agnostic
- Be testable without infrastructure

```typescript
// ✅ CORRECT: Pure domain logic
// packages/core/src/task/entities/task.entity.ts
export class Task extends Entity<TaskProps> {
  constructor(props: TaskProps, mode: EntityMode = "valid") {
    super(props, mode);
    // Validation happens in constructor
  }

  complete(): Task {
    return this.clone({ status: 'DONE' });
  }
}

// ❌ WRONG: Has infrastructure dependencies
import { Prisma } from '@prisma/client'; // WRONG in core!
```

### Rule 21: Hooks Package (Data Fetching)

**`packages/hooks/` MUST:**
- Provide factory functions for React Query hooks
- Accept API client instance
- Return typed data

```typescript
// ✅ CORRECT: Hook factory
// packages/hooks/src/tasks.ts
export function createTaskHooks(apiClient: ApiClient) {
  return {
    useTasks: () =>
      useQuery({
        queryKey: ['tasks'],
        queryFn: apiClient.tasks.getAll,
      }),

    useCreateTask: () =>
      useMutation({
        mutationFn: apiClient.tasks.create,
      }),
  };
}
```

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

```tsx
// ✅ CORRECT
import Image from 'next/image';

<Image
  src="/task-image.png"
  alt="Task preview"
  width={400}
  height={300}
  placeholder="blur"
  loading="lazy"
/>

// ❌ WRONG
<img src="/task-image.png" alt="Task" />
```

### Rule 24: Code Splitting

**Use dynamic imports for:**
- Heavy components
- Charts
- Modals
- Admin panels

```tsx
// ✅ CORRECT
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// ❌ WRONG
import { HeavyChart } from './HeavyChart';
```

---

## 🔒 Security Rules

### Rule 25: Input Validation

**ALL user input MUST be validated:**

```typescript
// ✅ CORRECT: Backend validation with class-validator
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}

// ✅ CORRECT: Frontend validation with Zod
const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});
```

### Rule 26: Authentication & Authorization

**Backend:**
- ✅ All endpoints protected by `@UseGuards(JwtAuthGuard)`
- ✅ Public endpoints marked with `@Public()`
- ✅ Authorization checks (user owns resource)

```typescript
// ✅ CORRECT
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    // Only returns user's own tasks
    return this.tasksService.findAll(user.id);
  }
}
```

### Rule 27: Environment Variables

**Secrets MUST be in environment variables:**
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `NEXTAUTH_SECRET`
- ❌ NEVER hardcoded in code

---

## 📚 Documentation Rules

### Rule 28: JSDoc Comments

**ALL exported functions MUST have JSDoc:**

```typescript
/**
 * Creates a new task for the user
 *
 * @param dto - Task creation data with validation
 * @param userId - ID of the user creating the task
 * @returns The created task with generated ID
 *
 * @throws {BadRequestException} If validation fails
 *
 * @example
 * ```typescript
 * const task = await createTask(
 *   { title: 'Complete project' },
 *   'user-123'
 * );
 * ```
 */
async function createTask(dto: CreateTaskDto, userId: string): Promise<Task>
```

### Rule 29: README Files

**Each package/app MUST have:**
- `README.md` with:
  - Description
  - Installation
  - Usage examples
  - API documentation (if applicable)
  - Contributing guidelines

### Rule 30: API Documentation

**Backend APIs MUST have:**
- Swagger/OpenAPI documentation
- All endpoints documented
- Request/response schemas
- Error codes

---

## 🎯 Agent Workflow Rules

### Rule 31: Mandatory Development Cycle

**ALL agents MUST follow this sequence:**

1. **RESEARCH** (5 min)
   - Search for latest package versions
   - Check for breaking changes
   - Review best practices

2. **IMPLEMENT** (varies)
   - Write clean, typed code
   - Follow project rules
   - Use existing shared packages

3. **TEST** (mandatory)
   - Write unit tests
   - Write integration tests
   - Write E2E tests for critical flows

4. **VALIDATE** (mandatory)
   - Run `npm run lint` - must pass
   - Run `npm run check-types` - must pass
   - Run `npm run test` - all tests must pass
   - Run `npm run build` - must succeed

5. **REFACTOR** (if needed)
   - Improve code quality
   - Fix any issues
   - Optimize performance

6. **DOCUMENT** (mandatory)
   - Add JSDoc comments
   - Update README
   - Add examples

7. **REPEAT** (until all quality gates pass)

**Agents MUST NOT declare task complete until ALL quality gates pass.**

### Rule 32: Quality Gates Checklist

Before completing ANY task, verify:

```bash
# Run these commands in order:
npm run lint           # ✅ Must pass (0 errors, 0 warnings)
npm run check-types    # ✅ Must pass (0 type errors)
npm run test           # ✅ Must pass (100% success rate)
npm run build          # ✅ Must succeed (0 errors)

# Additional checks:
# - Code coverage >80% (100% for critical paths)
# - Lighthouse score >90 (for web)
# - Accessibility: 0 violations
# - Bundle size: No regressions
# - Documentation: Complete
```

**If ANY check fails:**
1. Do NOT mark task as complete
2. Fix the issue
3. Re-run ALL checks
4. Repeat until ALL pass

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

---

## 📊 Project-Specific Standards

### Database (Prisma)

- **Location**: `packages/db/prisma/schema.prisma`
- **Migrations**: Run all migrations via `npx prisma migrate`
- **Client generation**: Run `npx prisma generate` after schema changes

### Backend (NestJS)

- **Location**: `apps/backend/src/`
- **Structure**: By feature domain (tasks/, projects/, workspaces/)
- **Validation**: Use class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI required

### Frontend (Next.js)

- **Location**: `apps/web/src/`
- **Router**: App Router (not Pages Router)
- **Styling**: TailwindCSS + shadcn/ui from packages/ui
- **State**: Zustand for local, React Query for server

### Mobile (React Native)

- **Location**: `apps/mobile/src/`
- **Navigation**: Expo Router (file-based)
- **Styling**: NativeWind (Tailwind for React Native)

### Desktop (Electron)

- **Location**: `apps/desktop/src/`
- **IPC**: Type-safe communication
- **Security**: Context Isolation enabled, Node integration disabled

---

## 🎓 Summary

**The Golden Rule:**
> "If it's used in 2+ places, extract it to packages. If it's not tested, it's broken. If it has warnings, fix them. Quality is non-negotiable."

**Agent Motto:**
> "Research → Implement → Test → Validate → Refactor → Document → Repeat until perfect."

**Success Criteria:**
- ✅ All tests pass (100%)
- ✅ Zero type errors
- ✅ Zero linting warnings
- ✅ Coverage >80% (100% critical)
- ✅ All apps build successfully
- ✅ All code documented
- ✅ Perfect responsiveness (mobile, tablet, desktop)
- ✅ Accessibility: WCAG AA compliant
- ✅ Performance: Lighthouse >90
- ✅ No transparencies or gradients

---

**Built with ❤️ for Ordo-Todo**

*These rules ensure consistency, quality, and maintainability across the entire monorepo.*
