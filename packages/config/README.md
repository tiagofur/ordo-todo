# @ordo-todo/config

Shared configuration package for Ordo-Todo applications.

Provides default configuration values, constants, and types used across Web, Mobile, and Desktop applications.

## Features

- Centralized configuration defaults
- Type-safe configuration types
- Timer settings (Pomodoro)
- App limits and constraints
- UI defaults
- Auth configuration
- Task/project/workspace constants

## Installation

```bash
npm install @ordo-todo/config
```

## Quick Start

### Create App Configuration

```typescript
import { createConfig } from "@ordo-todo/config";

const appConfig = createConfig({
  api: {
    baseURL: "http://localhost:3001/api/v1",
    timeout: 30000,
  },
  timer: {
    pomodoroDuration: 25 * 60, // 25 minutes
  },
  ui: {
    defaultTheme: "system",
    defaultView: "LIST",
  },
});

export default appConfig;
```

### Use Constants

```typescript
import {
  TASK_STATUS,
  TASK_PRIORITY,
  WORKSPACE_TYPE,
  MEMBER_ROLE,
  PROJECT_COLORS,
} from "@ordo-todo/config";

// Task status
if (task.status === TASK_STATUS.COMPLETED) {
  // Task is completed
}

// Task priority
if (task.priority === TASK_PRIORITY.URGENT) {
  // Show urgent badge
}

// Workspace type
if (workspace.type === WORKSPACE_TYPE.TEAM) {
  // Show team features
}

// Member role
if (member.role === MEMBER_ROLE.ADMIN) {
  // Show admin controls
}

// Project colors
const color = PROJECT_COLORS[0]; // '#3B82F6'
```

## Configuration

### API Configuration

```typescript
interface ApiConfig {
  baseURL: string; // API base URL
  timeout?: number; // Request timeout in milliseconds (default: 30000)
}
```

**Example:**

```typescript
{
  api: {
    baseURL: 'https://api.ordotodo.app/api/v1',
    timeout: 30000,
  }
}
```

### Auth Configuration

```typescript
interface AuthConfig {
  tokenKey?: string; // Local storage key for access token
  refreshTokenKey?: string; // Local storage key for refresh token
}
```

**Defaults:**

```typescript
{
  tokenKey: 'ordo_auth_token',
  refreshTokenKey: 'ordo_refresh_token',
}
```

### Timer Configuration

```typescript
interface TimerConfig {
  pomodoroDuration: number; // Pomodoro duration in seconds
  shortBreakDuration: number; // Short break duration in seconds
  longBreakDuration: number; // Long break duration in seconds
  pomodorosUntilLongBreak: number; // Number of pomodoros before long break
}
```

**Defaults:**

```typescript
{
  pomodoroDuration: 25 * 60,      // 25 minutes
  shortBreakDuration: 5 * 60,      // 5 minutes
  longBreakDuration: 15 * 60,      // 15 minutes
  pomodorosUntilLongBreak: 4,
}
```

**Custom Timer Config:**

```typescript
{
  timer: {
    pomodoroDuration: 50 * 60,      // 50 minutes
    shortBreakDuration: 10 * 60,     // 10 minutes
    longBreakDuration: 30 * 60,      // 30 minutes
    pomodorosUntilLongBreak: 2,       // Long break after 2 pomodoros
  }
}
```

### Limits Configuration

```typescript
interface LimitsConfig {
  maxProjectsPerWorkspace: number; // Max projects per workspace
  maxTasksPerProject: number; // Max tasks per project
  maxSubtasksPerTask: number; // Max subtasks per task
  maxTagsPerWorkspace: number; // Max tags per workspace
  maxAttachmentsPerTask: number; // Max attachments per task
  maxFileSizeMB: number; // Max file size in MB
}
```

**Defaults:**

```typescript
{
  maxProjectsPerWorkspace: 50,
  maxTasksPerProject: 500,
  maxSubtasksPerTask: 20,
  maxTagsPerWorkspace: 100,
  maxAttachmentsPerTask: 10,
  maxFileSizeMB: 25,
}
```

### UI Configuration

```typescript
interface UIConfig {
  defaultTheme: "light" | "dark" | "system"; // Default theme
  defaultView: "LIST" | "KANBAN" | "CALENDAR" | "TIMELINE" | "FOCUS";
  sidebarCollapsedByDefault: boolean; // Sidebar initial state
}
```

**Defaults:**

```typescript
{
  defaultTheme: 'system',
  defaultView: 'LIST',
  sidebarCollapsedByDefault: false,
}
```

## Constants

### Task Status

```typescript
import { TASK_STATUS } from "@ordo-todo/config";

TASK_STATUS.TODO; // 'TODO'
TASK_STATUS.IN_PROGRESS; // 'IN_PROGRESS'
TASK_STATUS.COMPLETED; // 'COMPLETED'
TASK_STATUS.CANCELLED; // 'CANCELLED'
```

### Task Priority

```typescript
import { TASK_PRIORITY } from "@ordo-todo/config";

TASK_PRIORITY.LOW; // 'LOW'
TASK_PRIORITY.MEDIUM; // 'MEDIUM'
TASK_PRIORITY.HIGH; // 'HIGH'
TASK_PRIORITY.URGENT; // 'URGENT'
```

**Priority Values (for sorting):**

```typescript
import { PRIORITY_VALUES } from "@ordo-todo/config";

PRIORITY_VALUES.LOW; // 1
PRIORITY_VALUES.MEDIUM; // 2
PRIORITY_VALUES.HIGH; // 3
PRIORITY_VALUES.URGENT; // 4
```

### Workspace Type

```typescript
import { WORKSPACE_TYPE } from "@ordo-todo/config";

WORKSPACE_TYPE.PERSONAL; // 'PERSONAL'
WORKSPACE_TYPE.WORK; // 'WORK'
WORKSPACE_TYPE.TEAM; // 'TEAM'
```

### Member Role

```typescript
import { MEMBER_ROLE } from "@ordo-todo/config";

MEMBER_ROLE.OWNER; // 'OWNER'
MEMBER_ROLE.ADMIN; // 'ADMIN'
MEMBER_ROLE.MEMBER; // 'MEMBER'
MEMBER_ROLE.VIEWER; // 'VIEWER'
```

### Project Colors

```typescript
import { PROJECT_COLORS } from "@ordo-todo/config";

// Array of 10 project colors
PROJECT_COLORS[0]; // '#3B82F6' (blue)
PROJECT_COLORS[1]; // '#10B981' (green)
PROJECT_COLORS[2]; // '#F59E0B' (amber)
PROJECT_COLORS[3]; // '#EF4444' (red)
PROJECT_COLORS[4]; // '#8B5CF6' (purple)
PROJECT_COLORS[5]; // '#EC4899' (pink)
PROJECT_COLORS[6]; // '#06B6D4' (cyan)
PROJECT_COLORS[7]; // '#F97316' (orange)
PROJECT_COLORS[8]; // '#84CC16' (lime)
PROJECT_COLORS[9]; // '#6366F1' (indigo)
```

**Get project color by index:**

```typescript
const color = PROJECT_COLORS[index % PROJECT_COLORS.length];
```

### Timer Type

```typescript
import { TIMER_TYPE } from "@ordo-todo/config";

TIMER_TYPE.POMODORO; // 'POMODORO'
TIMER_TYPE.SHORT_BREAK; // 'SHORT_BREAK'
TIMER_TYPE.LONG_BREAK; // 'LONG_BREAK'
TIMER_TYPE.CONTINUOUS; // 'CONTINUOUS'
```

## Platform-Specific Configuration

### Web Configuration

```typescript
// apps/web/src/config/index.ts
import { createConfig } from "@ordo-todo/config";

export const config = createConfig({
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  },
  auth: {
    tokenKey: "ordo_auth_token",
    refreshTokenKey: "ordo_refresh_token",
  },
});
```

### Mobile Configuration

```typescript
// apps/mobile/app/config/index.ts
import { createConfig } from "@ordo-todo/config";

export const config = createConfig({
  api: {
    baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api/v1",
    timeout: 60000, // Longer timeout for mobile
  },
  ui: {
    defaultView: "LIST", // Mobile prefers list view
  },
});
```

### Desktop Configuration

```typescript
// apps/desktop/src/config/index.ts
import { createConfig } from "@ordo-todo/config";

export const config = createConfig({
  api: {
    baseURL: "http://localhost:3001/api/v1",
  },
  timer: {
    pomodoroDuration: 25 * 60,
  },
});
```

## Environment Variables

### Web (.env)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Optional: Override defaults
NEXT_PUBLIC_DEFAULT_THEME=dark
NEXT_PUBLIC_DEFAULT_VIEW=LIST
```

### Mobile (.env)

```bash
# API
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1

# Optional: Override defaults
EXPO_PUBLIC_DEFAULT_THEME=system
```

### Desktop (.env)

```bash
# API
API_URL=http://localhost:3001/api/v1

# Optional: Override defaults
DEFAULT_THEME=system
```

## Complete Configuration Example

```typescript
import { createConfig } from "@ordo-todo/config";

const fullConfig = createConfig({
  api: {
    baseURL: "https://api.ordotodo.app/api/v1",
    timeout: 30000,
  },
  auth: {
    tokenKey: "ordo_auth_token",
    refreshTokenKey: "ordo_refresh_token",
  },
  timer: {
    pomodoroDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    pomodorosUntilLongBreak: 4,
  },
  limits: {
    maxProjectsPerWorkspace: 50,
    maxTasksPerProject: 500,
    maxSubtasksPerTask: 20,
    maxTagsPerWorkspace: 100,
    maxAttachmentsPerTask: 10,
    maxFileSizeMB: 25,
  },
  ui: {
    defaultTheme: "system",
    defaultView: "LIST",
    sidebarCollapsedByDefault: false,
  },
});
```

## Development

```bash
# Build package
npm run build --filter=@ordo-todo/config

# Watch mode
cd packages/config && npm run dev

# Type check
npm run check-types --filter=@ordo-todo/config
```

## Related Documentation

- [Core Package](/packages/core/README.md) - Business logic and validation
- [API Client](/packages/api-client/README.md) - API client
- [SHARED-CODE-ARCHITECTURE.md](/docs/SHARED-CODE-ARCHITECTURE.md) - Architecture overview

## License

Part of the Ordo-Todo monorepo.
