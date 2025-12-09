# @ordo-todo/ui

Shared UI components, utilities, and providers for Ordo-Todo applications across Web, Desktop, and Mobile platforms.

> **IMPORTANT**: See [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) for mandatory patterns when creating new components.

---

## Migration Status (2025-12-09)

| Phase | Status | Components |
|-------|--------|------------|
| Phase 1: Base UI | ✅ Complete | 31 components |
| Phase 2: Domain | ✅ Complete | 37 components |
| Phase 3: Workspace, Tag, Auth, AI | ✅ Complete | 16 components |
| Phase 4: Layout, Shared, Dashboard | ✅ Complete | 14 components |
| Phase 5: Integration | 🚧 In Progress | - |

**Total Components**: 91+

---

## Installation

This package is automatically available in the monorepo:

```json
{
  "dependencies": {
    "@ordo-todo/ui": "*"
  }
}
```

---

## Usage

### Import Components

```typescript
// All components from single import
import {
  Button,
  Card,
  Dialog,
  TaskCard,
  TaskList,
  ProjectBoard,
  PomodoroTimer,
  TagBadge,
  cn,
} from '@ordo-todo/ui';
```

### Component Categories

| Category | Components | Import |
|----------|------------|--------|
| **ui/** | button, card, dialog, input, select, etc. | `@ordo-todo/ui` |
| **task/** | TaskCard, TaskList, TaskForm, CreateTaskDialog | `@ordo-todo/ui` |
| **project/** | ProjectCard, ProjectBoard, KanbanTaskCard | `@ordo-todo/ui` |
| **timer/** | PomodoroTimer, TimerWidget, SessionHistory | `@ordo-todo/ui` |
| **analytics/** | WeeklyChart, FocusScoreGauge, DailyMetricsCard | `@ordo-todo/ui` |
| **workspace/** | WorkspaceCard, WorkspaceSelector | `@ordo-todo/ui` |
| **tag/** | TagBadge, TagSelector, CreateTagDialog | `@ordo-todo/ui` |
| **dashboard/** | StatsCard, UpcomingTasksWidget | `@ordo-todo/ui` |
| **ai/** | GenerateReportDialog, ReportCard | `@ordo-todo/ui` |
| **auth/** | AuthForm | `@ordo-todo/ui` |
| **layout/** | Sidebar, Topbar | `@ordo-todo/ui` |
| **shared/** | Breadcrumbs, Loading, ConfirmDelete | `@ordo-todo/ui` |

### Utilities

```typescript
import { cn } from '@ordo-todo/ui';
import { PROJECT_COLORS, TAG_COLORS, getFocusScoreColor } from '@ordo-todo/ui';

// cn() merges Tailwind classes
<div className={cn('base-class', isActive && 'active-class')} />

// Color constants
const color = PROJECT_COLORS[0]; // '#3B82F6'
```

---

## Component Architecture

### Platform-Agnostic Design

ALL components are designed to be platform-agnostic. They receive data and callbacks via props:

```typescript
// CORRECT: Platform-agnostic component
interface TaskCardProps {
  task: Task;                           // Data from parent
  onTaskClick: (id: string) => void;    // Callback from parent
  labels?: {                            // i18n from parent
    complete?: string;
  };
}

export function TaskCard({ task, onTaskClick, labels }: TaskCardProps) {
  // Only local UI state, NO hooks, NO API calls
  return <Card onClick={() => onTaskClick(task.id)}>{task.title}</Card>;
}
```

### Using Components in Apps

```typescript
// apps/web/src/components/task/task-container.tsx
'use client';

import { TaskCard } from '@ordo-todo/ui';
import { useTasks } from '@/lib/api-hooks';
import { useTranslations } from 'next-intl';

export function TaskContainer() {
  const { data: tasks } = useTasks();
  const t = useTranslations('Task');

  return tasks?.map(task => (
    <TaskCard
      key={task.id}
      task={task}
      onTaskClick={(id) => router.push(`/tasks/${id}`)}
      labels={{ complete: t('complete') }}
    />
  ));
}
```

---

## File Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── ui/              # 31 base components (Radix UI)
│   │   ├── task/            # 15 task components
│   │   ├── project/         # 11 project components
│   │   ├── timer/           # 4 timer components
│   │   ├── analytics/       # 7 analytics components
│   │   ├── workspace/       # 3 workspace components
│   │   ├── tag/             # 3 tag components
│   │   ├── dashboard/       # 5 dashboard components
│   │   ├── ai/              # 2 AI components
│   │   ├── auth/            # 1 auth component
│   │   ├── layout/          # 2 layout components
│   │   ├── shared/          # 7 shared components
│   │   └── index.ts         # Barrel export
│   ├── utils/
│   │   ├── index.ts         # cn() utility
│   │   └── colors.ts        # Color constants
│   └── index.ts             # Main export
├── package.json
├── tsconfig.json
└── README.md
```

---

## Development

### Build

```bash
# Build package
npm run build --filter=@ordo-todo/ui

# Watch mode
cd packages/ui && npm run dev

# Type check
npm run check-types --filter=@ordo-todo/ui
```

### Adding New Components

1. Create component in appropriate category folder
2. Export from category `index.ts`
3. Component must be platform-agnostic (no hooks, no API calls)
4. Use relative imports with `.js` extension

```typescript
// packages/ui/src/components/task/new-component.tsx
import { Button } from '../ui/button.js';
import { cn } from '../../utils/index.js';

interface NewComponentProps {
  data: SomeData;
  onAction: () => void;
  labels?: { title?: string };
}

export function NewComponent({ data, onAction, labels }: NewComponentProps) {
  return (
    <div>
      <h1>{labels?.title ?? 'Default Title'}</h1>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}

// packages/ui/src/components/task/index.ts
export { NewComponent } from './new-component.js';
```

---

## Dependencies

### Runtime

- `react`, `react-dom` (peer)
- `@radix-ui/*` - Accessible primitives
- `@tanstack/react-query` (peer) - Server state
- `tailwind-merge`, `clsx` - Class utilities
- `class-variance-authority` - Variants
- `lucide-react` - Icons
- `recharts` - Charts
- `@dnd-kit/*` - Drag and drop
- `framer-motion` - Animations
- `sonner` - Toasts
- `react-hook-form`, `zod` - Forms

### Peer Dependencies

```json
{
  "react": ">=19.0.0",
  "react-dom": ">=19.0.0",
  "@tanstack/react-query": ">=5.0.0"
}
```

---

## Related Documentation

- [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) - **MANDATORY** patterns
- [Design Guidelines](/docs/design/DESIGN_GUIDELINES.md) - Visual design rules
- [CLAUDE.md](/CLAUDE.md) - Main project guide
- [Hooks Package](/packages/hooks/README.md)
- [Stores Package](/packages/stores/README.md)

---

**Last Updated**: 2025-12-09
**Status**: Active
**Version**: 1.0.0
