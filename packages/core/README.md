# @ordo-todo/core - Shared Core Library

## 📦 Overview

The `@ordo-todo/core` package contains all shared business logic, validation schemas, constants, and utilities used across all Ordo-Todo applications (Web, Mobile, Desktop, and Backend).

This package follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles, ensuring that business logic is completely independent of infrastructure concerns.

## 🎯 Purpose

The core package serves as the **single source of truth** for:
- ✅ **Validation Schemas** - Zod schemas for all entities
- ✅ **Constants** - Colors, priorities, statuses, limits
- ✅ **Utilities** - Date, time, string, calculation, and color helpers
- ✅ **Domain Logic** - Use cases and business rules
- ✅ **Value Objects** - Email, ID, PersonName, etc.

## 📁 Structure

```
packages/core/src/
├── shared/
│   ├── constants/          # Shared constants
│   │   ├── colors.constants.ts
│   │   ├── priorities.constants.ts
│   │   ├── status.constants.ts
│   │   ├── timer.constants.ts
│   │   └── limits.constants.ts
│   ├── utils/              # Utility functions
│   │   ├── date.utils.ts
│   │   ├── time.utils.ts
│   │   ├── string.utils.ts
│   │   ├── calculation.utils.ts
│   │   └── color.utils.ts
│   ├── validation/         # Zod validation schemas
│   │   ├── task.validation.ts
│   │   ├── project.validation.ts
│   │   ├── workspace.validation.ts
│   │   ├── tag.validation.ts
│   │   ├── user.validation.ts
│   │   └── comment.validation.ts
│   ├── value-object.ts     # Base Value Object
│   ├── entity.ts           # Base Entity
│   └── use-case.ts         # Base Use Case
├── tasks/                  # Task domain
├── projects/               # Project domain
├── workspaces/             # Workspace domain
├── users/                  # User domain
├── timer/                  # Timer domain
├── analytics/              # Analytics domain
└── ...other domains
```

## 🚀 Usage Examples

### Constants

```typescript
import {
  PROJECT_COLORS,
  TAG_COLORS,
  TASK_PRIORITIES,
  TASK_STATUS,
  TIMER_MODES,
  TASK_LIMITS,
} from '@ordo-todo/core';

// Use predefined colors
const projectColor = PROJECT_COLORS[0]; // "#EF4444"

// Get priority configuration
const highPriority = TASK_PRIORITIES.HIGH;
console.log(highPriority.label); // "High"
console.log(highPriority.color); // "#EF4444"

// Check task limits
if (title.length > TASK_LIMITS.TITLE_MAX_LENGTH) {
  throw new Error('Title too long');
}

// Get timer mode color
const workColor = TIMER_MODES.WORK.color; // "#EF4444"
```

### Validation Schemas

```typescript
import { createTaskSchema, createProjectSchema, registerUserSchema } from '@ordo-todo/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// In a React component
const form = useForm({
  resolver: zodResolver(createTaskSchema),
  defaultValues: {
    title: '',
    description: '',
    priority: 'MEDIUM',
    projectId: '',
  },
});

// In backend validation
const result = createTaskSchema.safeParse(requestBody);
if (!result.success) {
  return { errors: result.error.flatten() };
}
```

### Utility Functions

```typescript
import {
  formatDate,
  formatRelativeTime,
  isOverdue,
  formatDuration,
  formatTimerDisplay,
  generateSlug,
  truncate,
  calculateProgress,
  calculateProductivityScore,
  hexToRgba,
  getContrastColor,
} from '@ordo-todo/core';

// Date utilities
const formattedDate = formatDate(new Date()); // "December 4, 2025"
const relativeTime = formatRelativeTime(task.createdAt); // "2 hours ago"
const overdue = isOverdue(task.dueDate); // true/false

// Time utilities
const duration = formatDuration(150); // "2h 30m"
const timerDisplay = formatTimerDisplay(125); // "02:05"

// String utilities
const slug = generateSlug("My Project Name"); // "my-project-name"
const short = truncate("Long description...", 50); // "Long description..."

// Calculation utilities
const progress = calculateProgress(5, 10); // 50
const productivityScore = calculateProductivityScore(8, 10, 180, 240); // 77

// Color utilities
const rgba = hexToRgba("#EF4444", 0.1); // "rgba(239, 68, 68, 0.1)"
const contrast = getContrastColor("#EF4444"); // "#FFFFFF"
```

## 📊 Constants Reference

### Colors

- **PROJECT_COLORS**: 7 predefined project colors
- **TAG_COLORS**: 10 predefined tag colors
- **WORKSPACE_COLORS**: Colors for PERSONAL, WORK, TEAM workspaces

### Priorities

- **TASK_PRIORITIES**: LOW, MEDIUM, HIGH with colors and labels
- Helper functions: `getPriorityColor()`, `getPriorityLabel()`

### Status

- **TASK_STATUS**: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED
- **PROJECT_STATUS**: ACTIVE, ARCHIVED, ON_HOLD
- Helper functions: `isTaskCompleted()`, `isTaskInProgress()`

### Timer

- **TIMER_MODES**: WORK, SHORT_BREAK, LONG_BREAK, CONTINUOUS
- **DEFAULT_POMODORO_SETTINGS**: Default timer configuration
- Helper function: `shouldTakeLongBreak()`

### Limits

- **TASK_LIMITS**: Title, description, estimated minutes limits
- **PROJECT_LIMITS**: Name, description, max tasks limits
- **WORKSPACE_LIMITS**: Name, members, slug limits
- **FILE_LIMITS**: Max file size, allowed types
- **USER_LIMITS**: Name, password, bio limits

## 🛡️ Validation Schemas

All validation schemas are built with **Zod** and provide:
- Type-safe validation
- Automatic TypeScript type inference
- Consistent error messages
- Reusable across all apps

### Available Schemas

- **Task**: `createTaskSchema`, `updateTaskSchema`, `taskFilterSchema`
- **Project**: `createProjectSchema`, `updateProjectSchema`, `projectFilterSchema`
- **Workspace**: `createWorkspaceSchema`, `updateWorkspaceSchema`, `inviteMemberSchema`
- **Tag**: `createTagSchema`, `updateTagSchema`
- **User**: `registerUserSchema`, `loginUserSchema`, `updateUserProfileSchema`
- **Comment**: `createCommentSchema`, `updateCommentSchema`

## 🔧 Utility Functions

### Date Utils

- `formatDate()`, `formatDateShort()`, `formatRelativeTime()`
- `isToday()`, `isPast()`, `isFuture()`, `isOverdue()`
- `getDaysDiff()`, `startOfDay()`, `endOfDay()`, `startOfWeek()`, `endOfWeek()`
- `addDays()`, `addHours()`, `addMinutes()`

### Time Utils

- `formatDuration()`, `formatDurationFromSeconds()`
- `formatTimerDisplay()`, `formatTimerDisplayExtended()`
- `minutesToHours()`, `hoursToMinutes()`, `secondsToMinutes()`
- `calculateTotalTimeWorked()`, `calculateAverageTime()`

### String Utils

- `generateSlug()`, `truncate()`, `capitalize()`, `capitalizeWords()`
- `getInitials()`, `generateRandomString()`, `generateId()`
- `isValidEmail()`, `isValidUrl()`, `sanitizeHtml()`
- `countWords()`, `pluralize()`, `formatNumber()`

### Calculation Utils

- `calculateProgress()`, `calculateCompletionRate()`
- `calculateProductivityScore()`, `calculateFocusScore()`
- `calculateVelocity()`, `calculateBurndownRate()`
- `calculateProjectHealth()`, `calculateEfficiency()`
- `calculateStreak()`, `calculatePercentile()`

### Color Utils

- `hexToRgb()`, `rgbToHex()`, `hexToRgba()`
- `getContrastColor()`, `lightenColor()`, `darkenColor()`
- `isLightColor()`, `isDarkColor()`, `mixColors()`
- `generatePalette()`, `getColorWithOpacity()`

## 🎨 Benefits

### For Web App
- Consistent validation across forms
- Reusable color constants
- Shared utility functions
- Type-safe DTOs

### For Mobile App
- Same business logic as web
- Consistent date/time formatting
- Shared validation rules
- Offline-ready calculations

### For Desktop App
- Identical behavior to web/mobile
- Shared timer logic
- Consistent color schemes
- Unified validation

### For Backend
- Validate requests with same schemas
- Consistent business rules
- Shared constants
- Type-safe responses

## 📝 Type Safety

All exports are fully typed with TypeScript:

```typescript
import type {
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskFilter,
  CreateProjectDTO,
  WorkspaceType,
  MemberRole,
  TaskPriority,
  TaskStatus,
  TimerMode,
} from '@ordo-todo/core';
```

## 🔄 Migration Guide

### Before (Duplicated Code)

```typescript
// In create-project-dialog.tsx
const projectColors = ["#EF4444", "#F59E0B", ...];

const createProjectSchema = z.object({
  name: z.string().min(1, "Required"),
  // ...
});
```

### After (Using Core)

```typescript
import { PROJECT_COLORS, createProjectSchema } from '@ordo-todo/core';

// Use shared constants and validation
const colors = PROJECT_COLORS;
const schema = createProjectSchema;
```

## 📦 Installation

The core package is already installed in the monorepo. To use it in any app:

```typescript
import { /* what you need */ } from '@ordo-todo/core';
```

## 🚀 Development

```bash
# Build the core package
cd packages/core
npm run build

# Watch for changes
npm run dev
```

## 📄 License

MIT

---

**Note**: This package is part of the Ordo-Todo monorepo and is designed to be used internally across all applications. It provides a single source of truth for business logic, ensuring consistency and reducing code duplication.
