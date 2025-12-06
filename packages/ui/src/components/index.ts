/**
 * Shared UI Components for Ordo-Todo
 *
 * Organized by domain:
 * - ui: Base components (Radix UI primitives)
 * - timer: Timer/Pomodoro components
 * - task: Task management components
 * - project: Project and Kanban components
 * - workspace: Workspace management
 * - workflow: Workflow organization
 * - tag: Tag/label components
 * - analytics: Charts and metrics
 * - ai: AI assistant components
 * - auth: Authentication
 * - layout: App layout components
 * - shared: Shared utilities
 * - voice: Voice input
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

// Future phases
// export * from './workspace';
// export * from './workflow';
// export * from './ai';
// export * from './auth';
// export * from './layout';
// export * from './shared';
// export * from './voice';
