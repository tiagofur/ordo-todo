# Component Generation Guidelines

**Single Source of Truth** for creating new components, pages, and UI elements in Ordo-Todo.

> **IMPORTANT**: This document defines the MANDATORY patterns for ALL new components. All AI assistants (Claude, Copilot, Gemini) and developers MUST follow these guidelines.

---

## Quick Reference

| Step | Action | Required |
|------|--------|----------|
| 1 | Check if component exists in `@ordo-todo/ui` | YES |
| 2 | If not, create in `packages/ui/src/components/` | YES |
| 3 | Make component **platform-agnostic** (props-driven) | YES |
| 4 | Export from barrel files (`index.ts`) | YES |
| 5 | Import in apps from `@ordo-todo/ui` | YES |
| 6 | Never create app-specific UI components | YES |

---

## Core Principle: Shared Components First

```
┌─────────────────────────────────────────────────────────────┐
│  ALL UI components MUST live in packages/ui               │
│  Apps only contain: pages, layouts, app-specific providers │
└─────────────────────────────────────────────────────────────┘
```

### What Goes Where

| Location | Contents |
|----------|----------|
| `packages/ui/` | All reusable UI components, base components, domain components |
| `packages/hooks/` | React Query hooks factory, custom hooks |
| `packages/stores/` | Zustand stores |
| `packages/i18n/` | Translations (JSON files) |
| `packages/api-client/` | API client, types, DTOs |
| `apps/web/` | Pages, Next.js-specific layouts, providers |
| `apps/desktop/` | Pages, Electron-specific code, providers |
| `apps/mobile/` | Screens, React Native-specific code |

---

## Component Creation Pattern

### Step 1: Check Existing Components

Before creating any component, check if it already exists:

```bash
# Search in packages/ui
ls packages/ui/src/components/

# Search by name
find packages/ui -name "*task*" -o -name "*button*"
```

### Step 2: Create Platform-Agnostic Component

**CRITICAL**: All components MUST be platform-agnostic. Dependencies are passed via props.

```typescript
// packages/ui/src/components/task/create-task-dialog.tsx

// IMPORTS: Only from packages or relative paths
import { Button } from '../ui/button.js';
import { Dialog } from '../ui/dialog.js';
import { cn } from '../../utils/index.js';

// TYPES: Define all external dependencies as props
interface CreateTaskDialogProps {
  // State
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;

  // Data (fetched by parent)
  projects?: ProjectOption[];
  tags?: TagOption[];

  // Callbacks (implemented by parent)
  onSubmit: (data: CreateTaskFormData) => Promise<void>;
  onGenerateAIDescription?: (title: string) => Promise<string>;

  // i18n Labels (passed by parent using their i18n system)
  labels?: {
    title?: string;
    submitButton?: string;
    cancelButton?: string;
    // ... more labels
  };
}

// COMPONENT: Pure presentation + local UI state only
export function CreateTaskDialog({
  open,
  onOpenChange,
  projects = [],
  tags = [],
  onSubmit,
  onGenerateAIDescription,
  isPending = false,
  labels = {},
}: CreateTaskDialogProps) {
  // Local UI state only (form state, validation)
  const [title, setTitle] = useState('');

  // NO hooks from @ordo-todo/hooks here
  // NO store access here
  // NO API calls here

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Component implementation */}
    </Dialog>
  );
}
```

### Step 3: Export from Barrel Files

```typescript
// packages/ui/src/components/task/index.ts
export { CreateTaskDialog } from './create-task-dialog.js';
export { TaskCard } from './task-card.js';
export { TaskList } from './task-list.js';
// ... all task components

// packages/ui/src/components/index.ts
export * from './ui/index.js';
export * from './task/index.js';
export * from './project/index.js';
// ... all categories

// packages/ui/src/index.ts
export * from './components/index.js';
export * from './utils/index.js';
```

### Step 4: Use in Apps

```typescript
// apps/web/src/components/task/create-task-container.tsx
'use client';

import { CreateTaskDialog } from '@ordo-todo/ui';
import { useAllProjects, useCreateTask } from '@/lib/api-hooks';
import { useTags } from '@/lib/api-hooks';
import { useTranslations } from 'next-intl';
import { notify } from '@/lib/notify';

export function CreateTaskContainer() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('CreateTaskDialog');

  // Fetch data
  const { data: projects } = useAllProjects();
  const { data: tags } = useTags();

  // Mutations
  const createTask = useCreateTask();

  return (
    <CreateTaskDialog
      open={open}
      onOpenChange={setOpen}
      projects={projects?.map(p => ({ id: p.id, name: p.name }))}
      tags={tags?.map(t => ({ id: t.id, name: t.name, color: t.color }))}
      onSubmit={async (data) => {
        await createTask.mutateAsync(data);
        notify.success(t('success'));
        setOpen(false);
      }}
      isPending={createTask.isPending}
      labels={{
        title: t('title'),
        submitButton: t('submit'),
        cancelButton: t('cancel'),
      }}
    />
  );
}
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | `kebab-case.tsx` | `create-task-dialog.tsx` |
| Hooks | `use-kebab-case.ts` | `use-timer-notifications.ts` |
| Utils | `kebab-case.ts` | `conflict-resolver.ts` |
| Types | `kebab-case.types.ts` | `task.types.ts` |
| Index | `index.ts` | `index.ts` |

---

## Import Conventions

### In packages/ui (Relative Imports with .js Extension)

```typescript
// CORRECT
import { Button } from '../ui/button.js';
import { cn } from '../../utils/index.js';
import { TaskCard } from './task-card.js';

// INCORRECT
import { Button } from '@/components/ui/button';  // No path aliases
import { cn } from '../../utils';                  // Missing .js
```

### In apps (Package Imports)

```typescript
// CORRECT
import { Button, Card, TaskCard } from '@ordo-todo/ui';
import { useTasks, useCreateTask } from '@/lib/api-hooks'; // Local instantiation
import { useUIStore } from '@ordo-todo/stores';

// INCORRECT
import { Button } from '@ordo-todo/ui/components/ui/button'; // Don't go deep
```

---

## Component Categories

### Base UI (`packages/ui/src/components/ui/`)

Radix UI primitives + TailwindCSS styling. Used as building blocks.

| Component | Usage |
|-----------|-------|
| `button` | All buttons |
| `input`, `textarea`, `select` | Form inputs |
| `dialog`, `sheet`, `alert-dialog` | Modals |
| `card`, `badge`, `avatar` | Display |
| `dropdown-menu`, `popover`, `command` | Menus |
| `table`, `tabs`, `calendar` | Data display |
| `form`, `label`, `checkbox`, `switch` | Form controls |

### Domain Components (`packages/ui/src/components/[domain]/`)

Business-specific components organized by domain:

| Domain | Components |
|--------|------------|
| `task/` | TaskCard, TaskList, TaskForm, CreateTaskDialog, SubtaskList, etc. |
| `project/` | ProjectCard, ProjectBoard, KanbanTaskCard, ProjectSettings, etc. |
| `timer/` | PomodoroTimer, TimerWidget, SessionHistory, TaskSelector |
| `analytics/` | WeeklyChart, FocusScoreGauge, DailyMetricsCard, etc. |
| `workspace/` | WorkspaceCard, WorkspaceSelector, CreateWorkspaceDialog |
| `tag/` | TagBadge, TagSelector, CreateTagDialog |
| `dashboard/` | StatsCard, UpcomingTasksWidget, ProductivityStreakWidget |
| `ai/` | GenerateReportDialog, ReportCard |
| `auth/` | AuthForm |
| `layout/` | Sidebar, Topbar |
| `shared/` | Breadcrumbs, ConfirmDelete, Loading, SyncStatusIndicator |

---

## Props Design Patterns

### 1. State Props

```typescript
interface Props {
  // Required state
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Optional loading states
  isLoading?: boolean;
  isPending?: boolean;
  isError?: boolean;
}
```

### 2. Data Props

```typescript
interface Props {
  // Data fetched by parent
  tasks: Task[];
  projects: ProjectOption[];

  // Optional with defaults
  selectedTaskId?: string;
  filterStatus?: TaskStatus;
}
```

### 3. Callback Props

```typescript
interface Props {
  // Required callbacks
  onSubmit: (data: FormData) => Promise<void>;

  // Optional callbacks
  onCancel?: () => void;
  onDelete?: (id: string) => Promise<void>;
  onGenerateAI?: (input: string) => Promise<string>;
}
```

### 4. i18n Labels Props

```typescript
interface Props {
  labels?: {
    title?: string;
    description?: string;
    submitButton?: string;
    cancelButton?: string;
    emptyState?: string;
    // Provide sensible English defaults
  };
}
```

### 5. Render Props (for complex composition)

```typescript
interface Props {
  renderHeader?: () => React.ReactNode;
  renderFooter?: (data: Data) => React.ReactNode;
  renderItem?: (item: Item, index: number) => React.ReactNode;
}
```

---

## Anti-Patterns (DO NOT DO)

### 1. NO Hooks Inside Shared Components

```typescript
// WRONG - hooks inside shared component
export function TaskList() {
  const { data: tasks } = useTasks();  // NO!
  const t = useTranslations();         // NO!
  return <div>{tasks.map(...)}</div>;
}

// CORRECT - data via props
export function TaskList({ tasks, labels }: TaskListProps) {
  return <div>{tasks.map(...)}</div>;
}
```

### 2. NO Direct Store Access

```typescript
// WRONG - direct store access
export function Sidebar() {
  const { collapsed } = useUIStore();  // NO!
  return <nav className={collapsed ? 'w-16' : 'w-64'}>...</nav>;
}

// CORRECT - via props
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return <nav className={collapsed ? 'w-16' : 'w-64'}>...</nav>;
}
```

### 3. NO Path Aliases in packages/

```typescript
// WRONG - path alias
import { cn } from '@/lib/utils';

// CORRECT - relative with .js
import { cn } from '../../utils/index.js';
```

### 4. NO App-Specific Components in apps/

```typescript
// WRONG - creating new UI component in app
// apps/web/src/components/ui/fancy-button.tsx

// CORRECT - add to packages/ui
// packages/ui/src/components/ui/fancy-button.tsx
```

---

## Testing Requirements

Every new component should have:

1. **Unit Test** - Component renders correctly with props
2. **Accessibility Test** - Keyboard navigation, ARIA labels
3. **Visual Regression** - Storybook story (optional but recommended)

```typescript
// packages/ui/src/components/task/__tests__/task-card.test.tsx
import { render, screen } from '@testing-library/react';
import { TaskCard } from '../task-card';

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={mockTask} onTaskClick={jest.fn()} />);
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
  });

  it('calls onTaskClick when clicked', () => {
    const onClick = jest.fn();
    render(<TaskCard task={mockTask} onTaskClick={onClick} />);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledWith(mockTask.id);
  });
});
```

---

## Migration Checklist

When migrating an existing component to packages/ui:

- [ ] Copy component to `packages/ui/src/components/[category]/`
- [ ] Remove all hooks (useTasks, useTranslations, etc.)
- [ ] Add props for all external data/callbacks
- [ ] Add `labels` prop for i18n strings
- [ ] Update imports to relative paths with `.js`
- [ ] Export from category `index.ts`
- [ ] Export from `components/index.ts`
- [ ] Update imports in apps to use `@ordo-todo/ui`
- [ ] Delete original file from app
- [ ] Add tests

---

## Quick Commands

```bash
# Build packages/ui
npm run build --filter=@ordo-todo/ui

# Type check packages/ui
npm run check-types --filter=@ordo-todo/ui

# Run all tests
npm run test

# Development (all apps)
npm run dev
```

---

## Related Documentation

- [CLAUDE.md](/CLAUDE.md) - Main project guide
- [packages/ui/README.md](/packages/ui/README.md) - UI package details
- [docs/packages/README.md](/docs/packages/README.md) - All packages overview
- [docs/design/DESIGN_GUIDELINES.md](/docs/design/DESIGN_GUIDELINES.md) - Visual design rules

---

**Last Updated**: 2025-12-09
**Status**: Active
