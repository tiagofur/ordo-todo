# Design Guidelines

**Core Principle**: Solid, Flat, and Vibrant Colors.

> **IMPORTANT**: All UI components MUST be created in `packages/ui`. See [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) for MANDATORY patterns.

---

## 🚫 DO NOT USE
- **Transparencies**: Avoid `opacity`, `bg-opacity`, or colors with alpha channel (e.g., `bg-blue-500/10`). Use solid lighter shades instead (e.g., `bg-blue-50`).
- **Gradients**: Do not use background gradients. Use solid background colors.
- **Blur Effects**: Avoid `backdrop-blur` or glassmorphism effects.

## ✅ USE
- **Solid Colors**: Use the full range of Tailwind colors but always solid.
- **Flat Design**: Clean lines, solid borders, solid backgrounds.
- **Vibrant Colors**: Use vibrant colors for accents, badges, and important elements.
- **Shadows**: Subtle shadows are allowed for depth (cards, dropdowns), but keep them clean.

---

## Component Architecture (MANDATORY)

### Location Rules

| Type | Location | Example |
|------|----------|---------|
| Reusable UI | `packages/ui/src/components/ui/` | button, card, dialog |
| Domain components | `packages/ui/src/components/[domain]/` | TaskCard, ProjectBoard |
| Pages | `apps/[app]/src/app/` | page.tsx |
| Container components | `apps/[app]/src/components/` | TaskListContainer |

### Platform-Agnostic Pattern

ALL components in packages/ui MUST be platform-agnostic:

```typescript
// packages/ui/src/components/task/task-card.tsx

// NO: Don't use hooks, stores, or API calls
// const { data } = useTasks();  // WRONG!
// const t = useTranslations();   // WRONG!

// YES: Receive everything via props
interface TaskCardProps {
  task: Task;                       // Data from parent
  onTaskClick: (id: string) => void; // Callback from parent
  labels?: {                        // i18n from parent
    complete?: string;
  };
}

export function TaskCard({ task, onTaskClick, labels }: TaskCardProps) {
  return (
    <Card onClick={() => onTaskClick(task.id)}>
      <h3>{task.title}</h3>
    </Card>
  );
}
```

### Import Convention

```typescript
// In apps: import from @ordo-todo/ui
import { Button, Card, TaskCard, cn } from '@ordo-todo/ui';

// In packages/ui: use relative imports with .js
import { Button } from '../ui/button.js';
import { cn } from '../../utils/index.js';
```

---

## Component Specifics

### Cards
- Background: Solid (e.g., `bg-card` or `bg-white` / `bg-zinc-900`).
- Border: Solid, subtle (e.g., `border-border` or `border-zinc-200`).
- Hover: Solid color change (e.g., `hover:bg-accent`).

### Badges / Tags
- Instead of `bg-blue-500/10 text-blue-500`, use:
  - Light mode: `bg-blue-100 text-blue-700` (Solid light background).
  - Dark mode: `bg-blue-900 text-blue-100` (Solid dark background).

### Icons
- Use solid colors for icons.
- Avoid icon containers with transparent backgrounds. Use solid circles/squares.

---

## Color Constants

Use predefined colors from `@ordo-todo/ui`:

```typescript
import { PROJECT_COLORS, TAG_COLORS, PRIORITY_COLORS, STATUS_COLORS } from '@ordo-todo/ui';

// Project colors
const projectColor = PROJECT_COLORS[0]; // '#3B82F6' (blue)

// Tag colors
const tagColor = TAG_COLORS[2]; // '#10B981' (green)

// Priority colors
const priorityColor = PRIORITY_COLORS['HIGH']; // '#EF4444' (red)

// Status colors
const statusColor = STATUS_COLORS['IN_PROGRESS']; // '#3B82F6' (blue)
```

---

## Related Documentation

- [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) - **MANDATORY** patterns
- [CLAUDE.md](/CLAUDE.md) - Main project guide
- [packages/ui/README.md](/packages/ui/README.md) - UI package details
