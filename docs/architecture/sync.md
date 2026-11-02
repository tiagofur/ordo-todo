# Sync architecture

Portable sync core with per-app wiring. The queue loop, retry accounting,
and conflict strategies live in `@ordo-todo/stores`; each app injects its
storage, transport, and UI. Apps never share queue state with each other.

## Core (`packages/stores`)

- `createSyncEngine({ adapter, execute, isOnline, maxRetries, events })`
  owns the loop: sequential execution, one attempt per action per pass,
  per-action retry counting, `onAction`/`onProgress` events. It never touches
  UI, storage APIs, or HTTP directly.
- `SyncQueueAdapter` (`load`/`save`/`remove`/`updateRetry`) persists the
  queue. Field contract: `url`, `data`, `createdAt` (`PendingAction`).
- `createConflictRegistry({ applyResolution })` owns the strategies:
  update merges with local fields winning (server timestamps kept, tags and
  custom fields unioned), delete defers to manual, merge suggests local
  title/description. Detection and application stay app-side. Resolved
  records are discarded by the registry; apps that show history keep their
  own marked copies. Manual resolution without merged data throws (fail
  closed) instead of writing `undefined` to both sides.

## Web (`apps/web/src/stores/sync-store.ts`)

- `createWebSyncQueueAdapter` maps IndexedDB (`endpoint`/`payload`/
  `timestamp`) to the contract. New actions get the web default
  `maxRetries: 3`.
- `execute` reuses the existing fetch path (CSRF + cookies).
- Progress events feed `syncProgress`/`currentAction`; toasts, events
  (`ordo-todo:action-queued`, `ordo-todo:sync-complete`), and `lastSyncTime`
  stay in the store.

## Desktop (`apps/desktop/src/stores/offline-sync-store.ts`)

- `createDesktopSyncQueueAdapter` works over zustand state (persisted,
  inspector-visible), not a separate storage module:
  - `load` returns pending operations only; failed ones wait for manual
    `retryOperation`, as before;
  - `remove` marks operations completed instead of deleting them, so the
    queue inspector and `clearCompletedOperations` keep working;
  - `updateRetry` marks failed immediately (`maxRetries: 1`: desktop never
    had a multi-retry threshold).
- `execute` reuses `executeSyncOperation` (per-entity apiClient dispatch).
  Errors mentioning a conflict still open a resolution conflict before the
  retry is recorded.
- `resolveConflict` computes through the registry with a dual-write
  `applyResolution` (local wins remotely, remote wins locally,
  merge/manual write both sides) and keeps the record marked with
  `resolution`/`resolvedAt` for the dialog. `resolveAllConflicts`,
  background sync, metrics, and the conflict toasts are unchanged.

## Out of scope

- The Electron-bridge `sync-store.ts` on desktop (main-process sync API)
  is untouched by this unification.
- Conflict *detection* (comparing local vs remote revisions) is still
  app-side; the registry only resolves what apps report.
