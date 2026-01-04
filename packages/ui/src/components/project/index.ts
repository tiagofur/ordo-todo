/**
 * Project Management Components
 *
 * Platform-agnostic components for project viewing and display.
 * Container components with state management have been moved to apps/web.
 */

// Platform-agnostic presentational components
export * from "./board-column.js";
export * from "./kanban-task-card.js";
export * from "./project-board.js";
export * from "./project-card.js";
export * from "./project-timeline.js";

// NOTE: The following components have been moved to apps/web/src/components/project/:
// - create-project-dialog (uses useState, useEffect, useForm)
// - project-files (no hooks, platform-agnostic)
// - project-list (no hooks, platform-agnostic)
// - project-settings-dialog (uses useState, useEffect, useForm)
// - project-settings (uses useState, useEffect, useForm)
