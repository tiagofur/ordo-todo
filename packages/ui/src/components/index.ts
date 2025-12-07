/**
 * Shared UI Components for Ordo-Todo
 *
 * Organized by domain:
 * - ui: Base components (Radix UI primitives)
 * - timer: Timer/Pomodoro components
 * - task: Task management components
 * - project: Project and Kanban components
 * - workspace: Workspace management
 * - dashboard: Dashboard widgets
 * - tag: Tag/label components
 * - analytics: Charts and metrics
 * - ai: AI assistant components
 * - auth: Authentication
 * - layout: App layout components
 * - shared: Shared utilities
 */

// Base UI Components
export * from './ui/index.js';

// Domain-specific components (Phase 2)
export * from './timer/index.js';
export * from './task/index.js';
export * from './project/index.js';
export * from './analytics/index.js';

// Phase 3 components
export * from './tag/index.js';
export * from './workspace/index.js';
export * from './auth/index.js';
export * from './ai/index.js';
export * from './layout/index.js';
export * from './shared/index.js';
export * from './dashboard/index.js';

