/**
 * Shared color constants for Projects, Tags, and Workspaces
 * These colors are used across all applications (Web, Mobile, Desktop)
 */

export const PROJECT_COLORS = [
    "#EF4444", // red
    "#F59E0B", // amber
    "#10B981", // emerald
    "#3B82F6", // blue
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#6B7280", // gray
] as const;

export const TAG_COLORS = [
    "#EF4444", // red
    "#F59E0B", // amber
    "#10B981", // emerald
    "#3B82F6", // blue
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#F43F5E", // rose
    "#84CC16", // lime
    "#6366F1", // indigo
] as const;

export const WORKSPACE_COLORS = {
    PERSONAL: "#06B6D4", // cyan
    WORK: "#8B5CF6",     // violet/purple
    TEAM: "#EC4899",     // pink
} as const;

export type ProjectColor = typeof PROJECT_COLORS[number];
export type TagColor = typeof TAG_COLORS[number];
export type WorkspaceColor = typeof WORKSPACE_COLORS[keyof typeof WORKSPACE_COLORS];
