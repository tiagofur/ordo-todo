import { OfflineTask, OfflineProject } from './offline-storage';
import { logger } from './logger';

/**
 * Conflict resolution strategies
 */
export type ConflictStrategy =
    | 'client-wins'    // Local changes always win
    | 'server-wins'    // Server changes always win
    | 'last-write-wins' // Most recent timestamp wins
    | 'merge'           // Attempt to merge non-conflicting fields
    | 'prompt'          // Ask user to resolve

/**
 * Represents a field-level conflict
 */
export interface FieldConflict<T = unknown> {
    field: string;
    clientValue: T;
    serverValue: T;
    clientTimestamp: number;
    serverTimestamp: number;
}

/**
 * Result of a conflict resolution
 */
export interface ConflictResolution<T> {
    resolved: boolean;
    result: T;
    conflicts: FieldConflict[];
    strategy: ConflictStrategy;
    requiresUserInput: boolean;
}

/**
 * Fields that are considered critical and should prompt user for conflicts
 */
const CRITICAL_TASK_FIELDS = ['title', 'status', 'priority', 'dueDate', 'completed'];
const CRITICAL_PROJECT_FIELDS = ['name', 'status'];

/**
 * Fields that can be safely auto-merged (last-write-wins)
 */
const AUTO_MERGE_TASK_FIELDS = ['description', 'estimatedPomodoros', 'tags'];
const AUTO_MERGE_PROJECT_FIELDS = ['description', 'color'];

/**
 * Check if two values are different
 */
function valuesAreDifferent(a: unknown, b: unknown): boolean {
    if (a === b) return false;
    if (a == null && b == null) return false;
    if (typeof a !== typeof b) return true;

    if (typeof a === 'object' && a !== null && b !== null) {
        return JSON.stringify(a) !== JSON.stringify(b);
    }

    return true;
}

/**
 * Parse timestamp from ISO string or number
 */
function parseTimestamp(value: string | number | Date | undefined): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (value instanceof Date) return value.getTime();
    return new Date(value).getTime();
}

/**
 * Detect conflicts between client and server versions of a task
 */
export function detectTaskConflicts(
    clientTask: OfflineTask,
    serverTask: OfflineTask
): FieldConflict[] {
    const conflicts: FieldConflict[] = [];
    const clientTime = parseTimestamp(clientTask.updatedAt);
    const serverTime = parseTimestamp(serverTask.updatedAt);

    const fieldsToCheck = [
        'title', 'description', 'status', 'priority', 'dueDate', 'completed'
    ];

    for (const field of fieldsToCheck) {
        const clientValue = clientTask[field as keyof OfflineTask];
        const serverValue = serverTask[field as keyof OfflineTask];

        if (valuesAreDifferent(clientValue, serverValue)) {
            conflicts.push({
                field,
                clientValue,
                serverValue,
                clientTimestamp: clientTime,
                serverTimestamp: serverTime,
            });
        }
    }

    return conflicts;
}

/**
 * Detect conflicts between client and server versions of a project
 */
export function detectProjectConflicts(
    clientProject: OfflineProject,
    serverProject: OfflineProject
): FieldConflict[] {
    const conflicts: FieldConflict[] = [];
    const clientTime = parseTimestamp(clientProject.updatedAt);
    const serverTime = parseTimestamp(serverProject.updatedAt);

    const fieldsToCheck = ['name', 'description', 'status'];

    for (const field of fieldsToCheck) {
        const clientValue = clientProject[field as keyof OfflineProject];
        const serverValue = serverProject[field as keyof OfflineProject];

        if (valuesAreDifferent(clientValue, serverValue)) {
            conflicts.push({
                field,
                clientValue,
                serverValue,
                clientTimestamp: clientTime,
                serverTimestamp: serverTime,
            });
        }
    }

    return conflicts;
}

/**
 * Resolve task conflicts using the specified strategy
 */
export function resolveTaskConflicts(
    clientTask: OfflineTask,
    serverTask: OfflineTask,
    strategy: ConflictStrategy = 'merge'
): ConflictResolution<OfflineTask> {
    const conflicts = detectTaskConflicts(clientTask, serverTask);

    if (conflicts.length === 0) {
        return {
            resolved: true,
            result: serverTask,
            conflicts: [],
            strategy,
            requiresUserInput: false,
        };
    }

    logger.log('[ConflictResolver] Task conflicts detected:', conflicts);

    switch (strategy) {
        case 'client-wins':
            return {
                resolved: true,
                result: { ...serverTask, ...clientTask, id: serverTask.id },
                conflicts,
                strategy,
                requiresUserInput: false,
            };

        case 'server-wins':
            return {
                resolved: true,
                result: serverTask,
                conflicts,
                strategy,
                requiresUserInput: false,
            };

        case 'last-write-wins':
            return resolveByTimestamp(clientTask, serverTask, conflicts);

        case 'merge':
            return mergeTaskConflicts(clientTask, serverTask, conflicts);

        case 'prompt':
            return {
                resolved: false,
                result: serverTask,
                conflicts,
                strategy,
                requiresUserInput: true,
            };

        default:
            return {
                resolved: true,
                result: serverTask,
                conflicts,
                strategy: 'server-wins',
                requiresUserInput: false,
            };
    }
}

/**
 * Resolve project conflicts using the specified strategy
 */
export function resolveProjectConflicts(
    clientProject: OfflineProject,
    serverProject: OfflineProject,
    strategy: ConflictStrategy = 'merge'
): ConflictResolution<OfflineProject> {
    const conflicts = detectProjectConflicts(clientProject, serverProject);

    if (conflicts.length === 0) {
        return {
            resolved: true,
            result: serverProject,
            conflicts: [],
            strategy,
            requiresUserInput: false,
        };
    }

    logger.log('[ConflictResolver] Project conflicts detected:', conflicts);

    switch (strategy) {
        case 'client-wins':
            return {
                resolved: true,
                result: { ...serverProject, ...clientProject, id: serverProject.id },
                conflicts,
                strategy,
                requiresUserInput: false,
            };

        case 'server-wins':
            return {
                resolved: true,
                result: serverProject,
                conflicts,
                strategy,
                requiresUserInput: false,
            };

        case 'last-write-wins':
            return resolveByTimestamp(clientProject, serverProject, conflicts);

        case 'merge':
            return mergeProjectConflicts(clientProject, serverProject, conflicts);

        case 'prompt':
            return {
                resolved: false,
                result: serverProject,
                conflicts,
                strategy,
                requiresUserInput: true,
            };

        default:
            return {
                resolved: true,
                result: serverProject,
                conflicts,
                strategy: 'server-wins',
                requiresUserInput: false,
            };
    }
}

/**
 * Resolve conflicts by timestamp (last-write-wins)
 */
function resolveByTimestamp<T extends { updatedAt: string }>(
    client: T,
    server: T,
    conflicts: FieldConflict[]
): ConflictResolution<T> {
    const clientTime = parseTimestamp(client.updatedAt);
    const serverTime = parseTimestamp(server.updatedAt);

    const winner = clientTime > serverTime ? client : server;

    return {
        resolved: true,
        result: winner,
        conflicts,
        strategy: 'last-write-wins',
        requiresUserInput: false,
    };
}

/**
 * Merge task conflicts intelligently
 * - Critical fields: prompt user if both changed
 * - Non-critical fields: last-write-wins
 */
function mergeTaskConflicts(
    clientTask: OfflineTask,
    serverTask: OfflineTask,
    conflicts: FieldConflict[]
): ConflictResolution<OfflineTask> {
    const result = { ...serverTask };
    const unresolvedConflicts: FieldConflict[] = [];

    for (const conflict of conflicts) {
        const isCritical = CRITICAL_TASK_FIELDS.includes(conflict.field);
        const isAutoMerge = AUTO_MERGE_TASK_FIELDS.includes(conflict.field);

        if (isCritical) {
            // For critical fields, check if client is more recent
            if (conflict.clientTimestamp > conflict.serverTimestamp) {
                // Apply client value
                (result as Record<string, unknown>)[conflict.field] = conflict.clientValue;
            } else {
                // Keep server value, but flag for potential review
                unresolvedConflicts.push(conflict);
            }
        } else if (isAutoMerge) {
            // For non-critical fields, last-write-wins
            if (conflict.clientTimestamp > conflict.serverTimestamp) {
                (result as Record<string, unknown>)[conflict.field] = conflict.clientValue;
            }
        } else {
            // Unknown field, use last-write-wins
            if (conflict.clientTimestamp > conflict.serverTimestamp) {
                (result as Record<string, unknown>)[conflict.field] = conflict.clientValue;
            }
        }
    }

    return {
        resolved: unresolvedConflicts.length === 0,
        result,
        conflicts: unresolvedConflicts,
        strategy: 'merge',
        requiresUserInput: unresolvedConflicts.length > 0,
    };
}

/**
 * Merge project conflicts intelligently
 */
function mergeProjectConflicts(
    clientProject: OfflineProject,
    serverProject: OfflineProject,
    conflicts: FieldConflict[]
): ConflictResolution<OfflineProject> {
    const result = { ...serverProject };
    const unresolvedConflicts: FieldConflict[] = [];

    for (const conflict of conflicts) {
        const isCritical = CRITICAL_PROJECT_FIELDS.includes(conflict.field);
        const isAutoMerge = AUTO_MERGE_PROJECT_FIELDS.includes(conflict.field);

        if (isCritical) {
            if (conflict.clientTimestamp > conflict.serverTimestamp) {
                (result as Record<string, unknown>)[conflict.field] = conflict.clientValue;
            } else {
                unresolvedConflicts.push(conflict);
            }
        } else if (isAutoMerge) {
            if (conflict.clientTimestamp > conflict.serverTimestamp) {
                (result as Record<string, unknown>)[conflict.field] = conflict.clientValue;
            }
        } else {
            if (conflict.clientTimestamp > conflict.serverTimestamp) {
                (result as Record<string, unknown>)[conflict.field] = conflict.clientValue;
            }
        }
    }

    return {
        resolved: unresolvedConflicts.length === 0,
        result,
        conflicts: unresolvedConflicts,
        strategy: 'merge',
        requiresUserInput: unresolvedConflicts.length > 0,
    };
}

/**
 * Apply user's resolution choice to a conflict
 */
export function applyUserResolution<T>(
    conflict: FieldConflict,
    baseObject: T,
    choice: 'client' | 'server'
): T {
    const result = { ...baseObject };
    (result as Record<string, unknown>)[conflict.field] =
        choice === 'client' ? conflict.clientValue : conflict.serverValue;
    return result;
}

/**
 * Create a conflict summary for display to user
 */
export function formatConflictSummary(conflicts: FieldConflict[]): string {
    return conflicts.map(c => {
        const clientDate = new Date(c.clientTimestamp).toLocaleString();
        const serverDate = new Date(c.serverTimestamp).toLocaleString();
        return `${c.field}: Local (${clientDate}) vs Server (${serverDate})`;
    }).join('\n');
}
