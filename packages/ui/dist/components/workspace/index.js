/**
 * Workspace Management Components
 *
 * Platform-agnostic components for workspace viewing.
 * Container components have been moved to apps/web.
 */
// Platform-agnostic presentational components
export * from './workspace-card.js';
export * from './invite-member-dialog.js';
export * from './workspace-members-settings.js';
// NOTE: The following components have been moved to apps/web/src/components/workspace/:
// - create-workspace-dialog (uses useState, useForm)
// - workspace-selector (uses useState, useMemo)
