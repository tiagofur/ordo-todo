/**
 * Task Management Components
 *
 * Platform-agnostic components for task viewing and display.
 * Container components with state management have been moved to apps/web.
 */
// Platform-agnostic presentational components
export * from "./activity-feed.js";
export * from "./task-card.js";
export * from "./task-detail-view.js";
// NOTE: The following components have been moved to apps/web/src/components/task/:
// - assignee-selector (uses useState)
// - attachment-list (uses useState)
// - comment-thread (uses useState)
// - create-task-dialog (uses useState, useForm)
// - file-upload (uses useState, useEffect, useCallback)
// - recurrence-selector (uses useState, useEffect)
// - subtask-list (uses useState)
// - task-card-compact (uses useState)
// - task-detail-panel (uses useState, useEffect)
// - task-filters (uses useState)
// - task-form (uses useState)
// - task-list (uses useState)
