# @ordo-todo/stores

Shared Zustand stores for Ordo-Todo applications (Web, Mobile, Desktop).

Provides global state management with persistence support for workspace selection, UI state, timer, and sync status.

## Features

- Platform-agnostic Zustand stores
- Built-in persistence with storage middleware
- Type-safe state and actions
- Cross-platform state sharing
- Optimized for performance

## Installation

```bash
npm install @ordo-todo/stores
```

## Quick Start

### Web Application

```typescript
// apps/web/src/app/providers.tsx
'use client';

import { useUIStore, useTimerStore, startTimerInterval } from '@ordo-todo/stores';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Start timer interval on app mount
    startTimerInterval();
  }, []);

  return <>{children}</>;
}
```

### Mobile Application

```typescript
// apps/mobile/app/lib/stores.ts
import { useUIStore, useWorkspaceStore } from "@ordo-todo/stores";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

// Create persistent stores with AsyncStorage
const useUIStoreWithPersistence = create<UIStore>()(
  persist((set) => ({ ...defaultUIState, ...uiActions(set) }), {
    name: "ui-storage",
    storage: createJSONStorage(() => AsyncStorage),
  }),
);

export { useUIStoreWithPersistence as useUIStore };
export { useWorkspaceStore, useTimerStore } from "@ordo-todo/stores";
```

### Desktop Application

```typescript
// apps/desktop/src/index.tsx
import {
  useTimerStore,
  startTimerInterval,
  setTimerCallbacks,
} from "@ordo-todo/stores";
import { Tray } from "./tray";

// Setup platform-specific callbacks
setTimerCallbacks({
  onPomodoroComplete: () => Tray.showNotification("Pomodoro complete!"),
  onStateChange: (state) => Tray.updateIcon(state),
});

// Start timer
startTimerInterval();
```

## Available Stores

### Workspace Store

Manages the currently selected workspace across the application.

```typescript
import { useWorkspaceStore } from '@ordo-todo/stores';

function WorkspaceSelector() {
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();

  return (
    <select
      value={selectedWorkspaceId || ''}
      onChange={(e) => setSelectedWorkspaceId(e.target.value || null)}
    >
      <option value="">Select workspace</option>
      {workspaces.map(ws => (
        <option key={ws.id} value={ws.id}>{ws.name}</option>
      ))}
    </select>
  );
}
```

**State:**

- `selectedWorkspaceId: string | null` - Currently selected workspace

**Actions:**

- `setSelectedWorkspaceId(id: string | null)` - Set the selected workspace

**Utility Functions:**

- `getSelectedWorkspaceId()` - Get selected workspace ID without subscribing
- `setSelectedWorkspaceId(id: string | null)` - Set selected workspace ID imperatively

---

### UI Store

Manages UI state including sidebar, dialogs, panels, view preferences, and sort/filter settings.

```typescript
import { useUIStore } from '@ordo-todo/stores';

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside className={sidebarCollapsed ? 'collapsed' : ''}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

**State:**

| Property                    | Type                      | Description                        |
| --------------------------- | ------------------------- | ---------------------------------- |
| `sidebarCollapsed`          | `boolean`                 | Sidebar collapsed state            |
| `sidebarWidth`              | `number`                  | Sidebar width in pixels            |
| `createTaskDialogOpen`      | `boolean`                 | Create task dialog visibility      |
| `createProjectDialogOpen`   | `boolean`                 | Create project dialog visibility   |
| `createWorkspaceDialogOpen` | `boolean`                 | Create workspace dialog visibility |
| `settingsDialogOpen`        | `boolean`                 | Settings dialog visibility         |
| `shortcutsDialogOpen`       | `boolean`                 | Shortcuts dialog visibility        |
| `aboutDialogOpen`           | `boolean`                 | About dialog visibility            |
| `taskDetailPanelOpen`       | `boolean`                 | Task detail panel visibility       |
| `selectedTaskId`            | `string \| null`          | Currently selected task ID         |
| `quickActionsOpen`          | `boolean`                 | Quick actions menu visibility      |
| `quickTaskInputOpen`        | `boolean`                 | Quick task input visibility        |
| `tasksViewMode`             | `'list' \| 'board'`       | Tasks view mode                    |
| `projectsViewMode`          | `'list' \| 'board'`       | Projects view mode                 |
| `dashboardLayout`           | `'compact' \| 'expanded'` | Dashboard layout                   |
| `tasksSortBy`               | `string`                  | Tasks sort field                   |
| `tasksSortOrder`            | `'asc' \| 'desc'`         | Tasks sort order                   |
| `showCompletedTasks`        | `boolean`                 | Show completed tasks               |

**Actions:**

**Sidebar:**

- `toggleSidebar()` - Toggle sidebar collapsed state
- `setSidebarCollapsed(collapsed: boolean)` - Set sidebar collapsed state
- `setSidebarWidth(width: number)` - Set sidebar width

**Dialogs:**

- `openCreateTaskDialog()`, `closeCreateTaskDialog()`
- `openCreateProjectDialog()`, `closeCreateProjectDialog()`
- `openCreateWorkspaceDialog()`, `closeCreateWorkspaceDialog()`
- `openSettingsDialog()`, `closeSettingsDialog()`
- `openShortcutsDialog()`, `closeShortcutsDialog()`
- `openAboutDialog()`, `closeAboutDialog()`

**Panels:**

- `openTaskDetailPanel(taskId: string)` - Open task detail panel
- `closeTaskDetailPanel()` - Close task detail panel

**Quick Actions:**

- `toggleQuickActions()` - Toggle quick actions menu
- `openQuickTaskInput()` - Open quick task input
- `closeQuickTaskInput()` - Close quick task input

**View:**

- `setTasksViewMode(mode: 'list' \| 'board')` - Set tasks view mode
- `setProjectsViewMode(mode: 'list' \| 'board')` - Set projects view mode
- `setDashboardLayout(layout: 'compact' \| 'expanded')` - Set dashboard layout

**Sort:**

- `setTasksSort(sortBy: string, order?: 'asc' \| 'desc')` - Set tasks sort

**Filter:**

- `toggleShowCompletedTasks()` - Toggle completed tasks visibility
- `setShowCompletedTasks(show: boolean)` - Set completed tasks visibility

**Reset:**

- `resetUI()` - Reset all UI state to defaults

---

### Timer Store

Manages Pomodoro timer state and configuration.

```typescript
import { useTimerStore, setTimerCallbacks, startTimerInterval } from '@ordo-todo/stores';

// Set platform-specific callbacks (optional)
setTimerCallbacks({
  onPomodoroComplete: () => console.log('Pomodoro complete!'),
  onStateChange: (state) => console.log('State changed:', state),
});

// Start timer interval (call once on app mount)
startTimerInterval();

function Timer() {
  const {
    timeLeft,
    isRunning,
    mode,
    completedPomodoros,
    start,
    pause,
    stop,
    skip,
    getTimeFormatted,
    getProgress,
  } = useTimerStore();

  return (
    <div>
      <span>{getTimeFormatted()}</span>
      <div>Mode: {mode}</div>
      <div>Pomodoros: {completedPomodoros}</div>
      <button onClick={isRunning ? pause : start}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button onClick={stop}>Stop</button>
      <button onClick={skip}>Skip</button>
    </div>
  );
}
```

**State:**

| Property             | Type                                                | Description                   |
| -------------------- | --------------------------------------------------- | ----------------------------- |
| `mode`               | `'IDLE' \| 'WORK' \| 'SHORT_BREAK' \| 'LONG_BREAK'` | Current timer mode            |
| `isRunning`          | `boolean`                                           | Timer running state           |
| `isPaused`           | `boolean`                                           | Timer paused state            |
| `timeLeft`           | `number`                                            | Time remaining in seconds     |
| `completedPomodoros` | `number`                                            | Number of completed pomodoros |
| `pauseCount`         | `number`                                            | Number of pauses              |
| `selectedTaskId`     | `string \| null`                                    | Associated task ID            |
| `selectedTaskTitle`  | `string \| null`                                    | Associated task title         |
| `config`             | `TimerConfig`                                       | Timer configuration           |

**TimerConfig:**

| Property                  | Type      | Default | Description                     |
| ------------------------- | --------- | ------- | ------------------------------- |
| `workDuration`            | `number`  | 25      | Work duration in minutes        |
| `shortBreakDuration`      | `number`  | 5       | Short break duration in minutes |
| `longBreakDuration`       | `number`  | 15      | Long break duration in minutes  |
| `pomodorosUntilLongBreak` | `number`  | 4       | Pomodoros before long break     |
| `autoStartBreaks`         | `boolean` | false   | Auto-start breaks               |
| `autoStartPomodoros`      | `boolean` | false   | Auto-start pomodoros            |
| `soundEnabled`            | `boolean` | true    | Sound notifications             |
| `notificationsEnabled`    | `boolean` | true    | Push notifications              |

**Actions:**

- `start()` - Start or resume timer
- `pause()` - Pause timer
- `resume()` - Resume paused timer
- `stop()` - Stop timer
- `skip()` - Skip to next session
- `reset()` - Reset current session
- `tick()` - Called every second (internal)
- `setMode(mode: TimerMode)` - Set timer mode
- `setSelectedTask(taskId: string \| null, taskTitle: string \| null)` - Set associated task
- `updateConfig(partialConfig: Partial<TimerConfig>)` - Update configuration

**Computed:**

- `getTimeFormatted()` - Get formatted time string (MM:SS)
- `getProgress()` - Get progress percentage (0-100)

**Utility Functions:**

- `startTimerInterval()` - Start timer interval (call on app mount)
- `stopTimerInterval()` - Stop timer interval (call on app unmount)
- `setTimerCallbacks(callbacks: TimerCallbacks)` - Set platform-specific callbacks

---

### Sync Store

Manages offline-first synchronization state.

```typescript
import { useSyncStore, formatLastSyncTime } from '@ordo-todo/stores';

function SyncStatus() {
  const { status, isSyncing, lastSyncTime, pendingCount } = useSyncStore();

  return (
    <div>
      <span>Status: {status}</span>
      {isSyncing && <span>Syncing...</span>}
      <span>Last sync: {formatLastSyncTime(lastSyncTime)}</span>
      {pendingCount > 0 && <span>{pendingCount} pending changes</span>}
    </div>
  );
}
```

**State:**

| Property        | Type                                          | Description               |
| --------------- | --------------------------------------------- | ------------------------- |
| `status`        | `'idle' \| 'syncing' \| 'offline' \| 'error'` | Sync status               |
| `isOnline`      | `boolean`                                     | Online status             |
| `pendingCount`  | `number`                                      | Number of pending changes |
| `lastSyncTime`  | `number \| null`                              | Last sync timestamp       |
| `error`         | `string \| null`                              | Error message             |
| `isSyncing`     | `boolean`                                     | Currently syncing         |
| `currentAction` | `string \| null`                              | Current sync action       |
| `syncProgress`  | `number`                                      | Sync progress (0-100)     |

**Actions:**

- `setStatus(status: SyncStatus)` - Set sync status
- `setOnline(online: boolean)` - Set online status
- `setPendingCount(count: number)` - Set pending count
- `setLastSyncTime(time: number \| null)` - Set last sync time
- `setError(error: string \| null)` - Set error
- `setSyncing(syncing: boolean, currentAction?: string)` - Set syncing state
- `setSyncProgress(progress: number)` - Set sync progress

**Utility Functions:**

- `createSyncStore(overrides?: Partial<SyncStoreState>)` - Create custom sync store
- `formatLastSyncTime(lastSyncTime: number \| null)` - Format last sync time

## Persistence

### Web (LocalStorage)

Stores use localStorage for persistence by default. Persisted data includes:

- **Workspace Store**: `selectedWorkspaceId`
- **UI Store**: Sidebar state, view modes, sort settings
- **Timer Store**: Timer configuration (duration, preferences)
- **Sync Store**: Not persisted by default

### Mobile (AsyncStorage)

For React Native, create custom persistent stores:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useUIStore = create<UIStore>()(
  persist((set) => ({ ...defaultUIState, ...uiActions(set) }), {
    name: "ui-storage",
    storage: createJSONStorage(() => AsyncStorage),
  }),
);
```

### Desktop (Electron Store)

For Electron, use electron-store:

```typescript
import Store from "electron-store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const electronStore = new Store();

export const useUIStore = create<UIStore>()(
  persist((set) => ({ ...defaultUIState, ...uiActions(set) }), {
    name: "ui-storage",
    storage: {
      getItem: (name) => electronStore.get(name),
      setItem: (name, value) => electronStore.set(name, value),
      removeItem: (name) => electronStore.delete(name),
    },
  }),
);
```

## Selectors

Optimize performance by selecting only the state you need:

```typescript
// Select specific state
const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

// Select multiple state values
const { sidebarCollapsed, sidebarWidth } = useUIStore((state) => ({
  sidebarCollapsed: state.sidebarCollapsed,
  sidebarWidth: state.sidebarWidth,
}));

// Select computed values
const timerFormatted = useTimerStore((state) => state.getTimeFormatted());
```

## Development

```bash
# Build the package
npm run build --filter=@ordo-todo/stores

# Watch mode
cd packages/stores && npm run dev

# Type check
npm run check-types --filter=@ordo-todo/stores
```

## Dependencies

- `zustand` - State management
- `zustand/middleware` - Persistence middleware

## Related Documentation

- [SHARED-CODE-ARCHITECTURE.md](/docs/SHARED-CODE-ARCHITECTURE.md) - Architecture overview
- [Hooks Package](/packages/hooks/README.md) - React Query hooks
- [Core Package](/packages/core/README.md) - Business logic

## License

Part of the Ordo-Todo monorepo.
