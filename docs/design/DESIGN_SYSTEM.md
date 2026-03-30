# Design System Reference

## Ordo-Todo Visual Identity & Component Guide

**Last Updated**: March 30, 2026

---

## 1. Brand Identity

### Typography

| Property | Value |
|----------|-------|
| **Primary Font** | Montserrat (Google Fonts) |
| **Type** | Sans-serif |
| **Rendering** | Antialiased |
| **Fallback** | system-ui, -apple-system, sans-serif |

### Font Scale

| Token | Size | Use |
|-------|------|-----|
| `text-xs` | 12px | Captions, badges |
| `text-sm` | 14px | Secondary text, labels |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Subtitles |
| `text-xl` | 20px | Section headers |
| `text-2xl` | 24px | Page titles |
| `text-3xl` | 30px | Hero text |
| `text-4xl` | 36px | Large display |

### Font Weights

| Token | Weight | Use |
|-------|--------|-----|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, buttons |
| `font-semibold` | 600 | Headings, emphasis |
| `font-bold` | 700 | Strong emphasis |

---

## 2. Color System

### Design Philosophy

> **Solid, Flat, and Vibrant.** No transparencies. No gradients. No blur effects.

Colors use **OKLCh** color space (perceptually uniform) defined as CSS custom properties. The system supports light and dark themes via the `.dark` class.

### Core Semantic Colors

#### Light Theme

| Token | OKLCh Value | Approximate Hex | Use |
|-------|-------------|------------------|-----|
| `--background` | `oklch(1 0 0)` | `#FFFFFF` | Page background |
| `--foreground` | `oklch(0.141 0.005 285.823)` | `#0A0A0B` | Primary text |
| `--primary` | `oklch(0.45 0.24 275)` | `#7C3AED` | **Vibrant Violet** - Buttons, links, active states |
| `--primary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Text on primary |
| `--secondary` | `oklch(0.96 0.01 275)` | `#F5F3FF` | Light purple backgrounds |
| `--secondary-foreground` | `oklch(0.2 0.02 275)` | Dark | Text on secondary |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `#EF4444` | Delete, errors |
| `--muted` | `oklch(0.96 0.01 275)` | Light | Disabled, placeholder |
| `--accent` | `oklch(0.96 0.01 275)` | Light | Hover, highlight |
| `--border` | `oklch(0.92 0.01 275)` | Light gray-purple | Borders |
| `--ring` | `oklch(0.45 0.24 275)` | `#7C3AED` | Focus rings |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | Card backgrounds |
| `--sidebar` | `oklch(0.985 0.005 275)` | Near white | Sidebar background |

#### Dark Theme

| Token | OKLCh Value | Approximate Hex | Use |
|-------|-------------|------------------|-----|
| `--background` | `oklch(0.1 0.01 275)` | `#0F0F14` | Page background |
| `--foreground` | `oklch(0.98 0.01 275)` | `#FAFAFA` | Primary text |
| `--primary` | `oklch(0.7 0.15 280)` | `#A78BFA` | **Bright Violet** |
| `--primary-foreground` | `oklch(0.1 0.05 280)` | Dark | Text on primary |
| `--destructive` | Dark red variant | `#DC2626` | Delete, errors |
| `--border` | `oklch(0.25 0.02 275)` | Dark | Borders |
| `--card` | `oklch(0.15 0.01 275)` | Dark | Card backgrounds |
| `--sidebar` | Dark variant | `#18181B` | Sidebar background |

### Vibrant Accent Palette

For data visualization, tags, and accent elements:

| Name | Hex | Light Variant | Dark Variant |
|------|-----|---------------|-------------|
| **Cyan** | `#06B6D4` | `#67E8F9` | `#0891B2` |
| **Purple** | `#A855F7` | `#D8B4FE` | `#7C3AED` |
| **Pink** | `#EC4899` | `#F9A8D4` | `#DB2777` |
| **Orange** | `#F97316` | `#FDBA74` | `#EA580C` |
| **Green** | `#10B981` | `#6EE7B7` | `#059669` |

### Semantic Status Colors

| Name | Color | Hex |
|------|-------|-----|
| **Success** | Green | `#10B981` |
| **Warning** | Amber | `#F59E0B` |
| **Error** | Red | `#EF4444` |
| **Info** | Blue | `#3B82F6` |

### Priority Colors

| Priority | Color | Hex |
|----------|-------|-----|
| **URGENT** | Red | `#EF4444` |
| **HIGH** | Orange | `#F97316` |
| **MEDIUM** | Blue | `#3B82F6` |
| **LOW** | Slate/Gray | `#64748B` |

### Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| **TODO** | Slate | `#64748B` |
| **IN_PROGRESS** | Blue | `#3B82F6` |
| **COMPLETED** | Green | `#10B981` |
| **CANCELLED** | Gray | `#9CA3AF` |

### Project Colors (18 options)

Red, Orange, Amber, Yellow, Lime, Green, Emerald, Teal, Cyan, Sky, Blue, Indigo, Violet, Purple, Fuchsia, Pink, Rose, Stone

### Tag Colors (18 options with Tailwind classes)

Each tag color provides `bg`, `text`, and `hex` values for consistent rendering.

### Focus Score Colors

| Range | Color | Meaning |
|-------|-------|---------|
| 80-100% | Green | Excellent focus |
| 50-79% | Yellow | Moderate focus |
| 0-49% | Red | Needs improvement |

### Chart Colors

5 distinct colors for data visualization charts, with separate light and dark theme variants.

---

## 3. Strict Design Rules

### DO NOT USE

| Rule | Bad Example | Good Alternative |
|------|-------------|-----------------|
| **No transparencies** | `bg-blue-500/10`, `opacity: 0.9` | `bg-blue-50` (light), `bg-blue-900` (dark) |
| **No gradients** | `bg-gradient-to-r from-blue to-purple` | `bg-blue-500` (solid) |
| **No blur effects** | `backdrop-blur`, glassmorphism | Solid backgrounds |
| **No alpha channels** | `rgba(255,255,255,0.5)` | `#FFFFFF` solid |

### DO USE

- **Solid colors** for all backgrounds, always
- **Flat design** with clean lines and solid borders
- **Vibrant colors** for accents, badges, and important elements
- **Subtle shadows** for depth on cards and dropdowns (clean, not excessive)
- **Consistent dark mode** using the `.dark` class strategy

### Badge/Tag Pattern

```
WRONG: bg-blue-500/10 text-blue-500
RIGHT (light): bg-blue-100 text-blue-700
RIGHT (dark):  bg-blue-900 text-blue-100
```

---

## 4. Spacing & Layout

### Spacing Scale (4px grid)

| Token | Value | Use |
|-------|-------|-----|
| `xs` | 4px | Tight spacing |
| `sm` | 8px | Compact elements |
| `md` | 16px | Default spacing |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Major sections |
| `2xl` | 48px | Page-level gaps |
| `3xl` | 64px | Hero sections |

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `rounded-sm` | 6px | Small elements, badges |
| `rounded-md` | 8px | Inputs, buttons |
| `rounded-lg` | 10px | Cards, dialogs (**base radius**) |
| `rounded-xl` | 14px | Large cards |
| `rounded-2xl` | 18px | Modals |
| `rounded-full` | 9999px | Avatars, pills |

### Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| Default | 320px+ | Mobile |
| `md` | 641px+ | Tablet |
| `lg` | 1025px+ | Desktop |

**ALL components MUST be responsive across all three breakpoints.**

---

## 5. Component Library

### 5.1 Base UI Components (35)

Located in `packages/ui/src/components/ui/`:

| Component | Based On | Description |
|-----------|----------|-------------|
| `Button` | CVA | 6 variants (default, destructive, outline, secondary, ghost, link), 4 sizes |
| `Input` | Native | Text input with focus ring |
| `Textarea` | Native | Multi-line text |
| `Label` | Radix | Form labels |
| `Card` | Custom | Container with Header, Title, Description, Content, Footer |
| `Badge` | CVA | default, secondary, destructive, outline variants |
| `Alert` | Custom | Info/warning/error alerts |
| `Dialog` | Radix | Modal dialogs |
| `Sheet` | Radix | Drawer/sidebar panels |
| `Dropdown Menu` | Radix | Context menus |
| `Select` | Radix | Dropdown selection |
| `Popover` | Radix | Floating content |
| `Tooltip` | Radix | Hover information |
| `Hover Card` | Radix | Rich hover previews |
| `Alert Dialog` | Radix | Confirmation dialogs |
| `Tabs` | Radix | Tab navigation |
| `Checkbox` | Radix | Toggle checkbox |
| `Switch` | Radix | Toggle switch |
| `Slider` | Radix | Range slider |
| `Progress` | Radix | Progress bar |
| `Avatar` | Radix | User images |
| `Separator` | Radix | Divider lines |
| `Scroll Area` | Radix | Custom scrollbars |
| `Collapsible` | Radix | Expandable sections |
| `Skeleton` | Custom | Loading placeholders |
| `Table` | Native | Data tables |
| `Calendar` | react-day-picker | Date selection |
| `Date Picker` | Custom | Calendar + input |
| `Command` | cmdk | Command palette |
| `Form` | react-hook-form | Form integration |
| `Mention Textarea` | Custom | @ mentions |
| `Empty State` | Custom | No data states |
| `Sonner/Toast` | Sonner | Notifications |
| `Custom Icons` | Custom | App-specific icons |
| `Visually Hidden` | Custom | Accessibility utility |

### 5.2 Domain Components (53)

| Category | Count | Components |
|----------|-------|------------|
| **Task** | 4 | TaskCard, TaskDetailView, ActivityFeed, EisenhowerMatrix |
| **Project** | 7 | ProjectCard, ProjectBoard, BoardColumn, KanbanTaskCard, ProjectTimeline, ProjectList, ProjectFiles |
| **Dashboard** | 8 | StatsCard, ActiveProjectsWidget, ProductivityStreakWidget, UpcomingTasksWidget, WeeklyActivityWidget, HabitsWidget, AIInsightsWidget, DashboardTimerWidget |
| **Analytics** | 7 | WeeklyChart, DailyMetricsCard, FocusScoreGauge, PeakHoursChart, DistributionCharts, ProductivityInsights, AIWeeklyReport |
| **Timer** | 4 | PomodoroTimer, TimerWidget, TaskSelector, SessionHistory |
| **Layout** | 3 | Sidebar, MobileSidebar, Topbar |
| **Shared** | 8 | Breadcrumbs, Loading, ConfirmDelete, AboutDialog, ShortcutsDialog, SyncStatusIndicator, FeatureOnboarding, LazyLoad |
| **Workspace** | 3 | WorkspaceCard, WorkspaceMembersSettings, InviteMemberDialog |
| **Auth** | 2 | AuthForm, UsernameInput |
| **Habit** | 2 | StreakBadge, ProgressRing |
| **Note** | 2 | StickyNote, NotesCanvas |
| **AI** | 1 | ReportCard |
| **Tag** | 1 | TagBadge |
| **User** | 1 | UserProfileCard |

### 5.3 Component Rules

All shared components in `packages/ui` MUST be:

1. **Platform-agnostic**: No hooks, no stores, no API calls, no i18n hooks
2. **Props-driven**: Receive all data and callbacks via props
3. **Typed**: Full TypeScript interfaces for all props
4. **Exported**: Via barrel files (`index.ts`)
5. **Dark mode aware**: Support both themes

```typescript
// CORRECT pattern for packages/ui
interface TaskCardProps {
  task: Task;                          // Data from parent
  onTaskClick: (id: string) => void;   // Callback from parent
  labels?: { complete?: string };      // i18n from parent
  className?: string;                  // Styling override
}

export function TaskCard({ task, onTaskClick, labels, className }: TaskCardProps) {
  return (
    <Card onClick={() => onTaskClick(task.id)} className={className}>
      <h3>{task.title}</h3>
    </Card>
  );
}
```

Container components with hooks/state live in `apps/[app]/src/components/`.

---

## 6. Icon System

### Primary: Lucide React

```typescript
import { Check, X, Plus, Trash2, Edit, Calendar, Clock } from 'lucide-react';
```

- Default size: 16px (sm), 20px (md), 24px (lg)
- Color: `currentColor` (inherits text color)
- Stroke width: 2 (default)

### Secondary: Tabler Icons

Used for specialized icons not available in Lucide:

```typescript
import { IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';
```

---

## 7. Animation

### Framework: Framer Motion

- Used for page transitions, component mount/unmount, and micro-interactions
- Respect `prefers-reduced-motion` media query
- Keep animations subtle and purposeful

### Key Animations

| Animation | Use | Duration |
|-----------|-----|----------|
| Fade in/out | Component mount/unmount | 150-200ms |
| Slide | Panels, sheets, sidebars | 200-300ms |
| Scale | Button press feedback | 100ms |
| Confetti | Achievement/streak celebrations | 1-2s |
| Progress | Bars, rings, gauges | 300-500ms |

---

## 8. Form Patterns

### Stack: React Hook Form + Zod

```typescript
const schema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.date().optional(),
});

const form = useForm({ resolver: zodResolver(schema) });
```

### Validation Limits

| Field | Min | Max |
|-------|-----|-----|
| Task title | 1 | 200 |
| Task description | - | 5000 |
| Estimated minutes | 1 | 480 |
| Project name | 1 | 100 |
| Project description | - | 2000 |
| Workspace name | 1 | 100 |
| Workspace description | - | 500 |
| Password | 8 | - |

---

## 9. Accessibility Requirements

### WCAG 2.1 AA Compliance

| Requirement | Standard |
|-------------|----------|
| Color contrast (text) | ≥ 4.5:1 |
| Color contrast (large text/UI) | ≥ 3:1 |
| Keyboard navigation | All interactive elements |
| Focus indicators | Visible ring on all focusable elements |
| ARIA labels | All buttons and inputs |
| Semantic HTML | Proper headings, landmarks |
| Screen reader | Compatible with major readers |
| Reduced motion | Respect `prefers-reduced-motion` |

### Focus Ring Style

```css
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

---

## 10. PWA Manifest

| Property | Value |
|----------|-------|
| Name | Ordo-Todo |
| Display | standalone |
| Theme color | `#4F46E5` (Indigo) |
| Background | `#FFFFFF` |
| Categories | productivity, utilities |
| Shortcuts | "New Task", "Quick Timer" |

---

## 11. App Layout Structure

### Desktop Layout (lg+)

```
┌─ Topbar ─────────────────────────────────────────┐
│ [Workspace Selector] [Breadcrumbs]  [Search] [🔔] [👤] │
├─────────┬────────────────────────────────────────┤
│ Sidebar │ Main Content Area                       │
│         │                                         │
│ Today   │  (Page content)                         │
│ Tasks   │                                         │
│ Habits  │                                         │
│ Calendar│                                         │
│ Projects│                                         │
│ Goals   │                                         │
│ Timer   │                                         │
│ Analytics│                                        │
│ ...     │                                         │
│         │                                         │
│ [Timer  │                                         │
│  Widget]│                                         │
└─────────┴────────────────────────────────────────┘
```

### Mobile Layout (< md)

```
┌─ Topbar ──────────────┐
│ [☰] [Title]    [🔔] [👤] │
├───────────────────────┤
│                       │
│  Main Content Area    │
│  (Full width)         │
│                       │
│                       │
│                       │
├───────────────────────┤
│ [☰ Drawer Sidebar]    │
└───────────────────────┘
```

### Sidebar Navigation Items

| Item | Icon | Route |
|------|------|-------|
| Dashboard | LayoutDashboard | `/dashboard` |
| Today | CalendarCheck | `/tasks` |
| Calendar | Calendar | `/calendar` |
| Projects | FolderKanban | `/projects` |
| Goals | Target | `/goals` |
| Habits | Repeat | `/habits` |
| Timer | Clock | `/timer` |
| Analytics | BarChart3 | `/analytics` |
| Tags | Tags | `/tags` |
| Meetings | Users | `/meetings` |
| Eisenhower | Grid2X2 | `/eisenhower` |
| Wellbeing | Heart | `/wellbeing` |
| Workload | Activity | `/workload` |
| Reports | FileText | `/reports` |
| Settings | Settings | `/settings` |

---

## 12. Theme Implementation

### Switching Mechanism

- Library: `next-themes`
- Strategy: CSS class (`.dark` on `<html>`)
- Options: Light, Dark, System (auto-detect)
- Persisted in localStorage

### Usage in Components

```tsx
// Solid colors with dark mode variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <Card className="bg-card border-border">
    <h3 className="text-foreground">Title</h3>
    <p className="text-muted-foreground">Description</p>
  </Card>
</div>
```

---

**This document is the single source of truth for all visual design decisions in Ordo-Todo.**
