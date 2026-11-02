/**
 * Portable sync conflict handling (phase 3 of the sync unification).
 *
 * Strategies mirrored from the desktop offline store:
 * - update conflicts merge (local fields win, server timestamps kept,
 *   tags and custom fields unioned);
 * - delete conflicts defer to manual resolution;
 * - merge suggestions prefer the local title/description.
 *
 * The registry is framework-free: conflict *detection* (comparing local
 * vs remote) and *application* (writing the winning data back) stay
 * platform-side via the injected `applyResolution`. UI concerns from the
 * desktop original (toasts, store status flags) are intentionally absent:
 * callers observe returns and `list()` instead.
 */

export type ConflictType = 'update' | 'delete' | 'create';
export type ConflictResolution = 'local' | 'remote' | 'merge' | 'manual';

export type ConflictData = Record<string, unknown>;

export interface SyncConflict {
    id: string;
    type: ConflictType;
    entityType: string;
    entityId: string;
    localData: ConflictData;
    remoteData: ConflictData;
    timestamp: number;
    resolution?: ConflictResolution;
    resolvedAt?: number;
}

export type NewConflict = Omit<SyncConflict, 'id' | 'timestamp'>;

/**
 * Merge an update conflict: local fields win, server timestamps are
 * preserved, tags and custom fields are unioned.
 */
export function resolveUpdateConflict(conflict: SyncConflict): ConflictData {
    const { localData, remoteData } = conflict;
    const localTags = Array.isArray(localData.tags) ? localData.tags : [];
    const remoteTags = Array.isArray(remoteData.tags) ? remoteData.tags : [];
    const localFields =
        typeof localData.custom_fields === 'object' && localData.custom_fields !== null
            ? (localData.custom_fields as ConflictData)
            : {};
    const remoteFields =
        typeof remoteData.custom_fields === 'object' && remoteData.custom_fields !== null
            ? (remoteData.custom_fields as ConflictData)
            : {};
    return {
        ...remoteData,
        ...localData,
        updated_at: Math.max(
            new Date(localData.updated_at as string).getTime(),
            new Date(remoteData.updated_at as string).getTime()
        ),
        tags: [...new Set([...localTags, ...remoteTags])],
        custom_fields: { ...remoteFields, ...localFields },
    };
}

/**
 * Delete conflicts always need a human: neither side can win silently.
 */
export function resolveDeleteConflict(_conflict: SyncConflict): ConflictResolution {
    return 'manual';
}

/**
 * Suggest a merge for conflicting data: local title/description win when
 * present, tags are unioned.
 */
export function suggestMerge(
    local: ConflictData,
    remote: ConflictData
): ConflictData {
    const localTags = Array.isArray(local.tags) ? local.tags : [];
    const remoteTags = Array.isArray(remote.tags) ? remote.tags : [];
    return {
        ...remote,
        title: local.title || remote.title,
        description: local.description || remote.description,
        tags: [...new Set([...localTags, ...remoteTags])],
    };
}

export interface ConflictRegistryOptions {
    applyResolution: (
        entityType: string,
        entityId: string,
        data: ConflictData,
        resolution: ConflictResolution
    ) => Promise<unknown> | unknown;
    generateId?: () => string;
    now?: () => number;
}

export function createConflictRegistry(options: ConflictRegistryOptions) {
    const {
        applyResolution,
        generateId = () =>
            `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
        now = () => Date.now(),
    } = options;

    const conflicts = new Map<string, SyncConflict>();

    return {
        list(): SyncConflict[] {
            return [...conflicts.values()];
        },

        addConflict(input: NewConflict): SyncConflict {
            const recorded: SyncConflict = {
                ...input,
                id: generateId(),
                timestamp: now(),
            };
            conflicts.set(recorded.id, recorded);
            return recorded;
        },

        async resolve(
            conflictId: string,
            resolution: ConflictResolution,
            mergedData?: ConflictData
        ): Promise<ConflictData | undefined> {
            const conflict = conflicts.get(conflictId);
            if (!conflict) return undefined;

            let finalData: ConflictData;
            switch (resolution) {
                case 'local':
                    finalData = conflict.localData;
                    break;
                case 'remote':
                    finalData = conflict.remoteData;
                    break;
                case 'merge':
                    finalData = mergedData ?? suggestMerge(conflict.localData, conflict.remoteData);
                    break;
                case 'manual':
                    if (!mergedData) {
                        throw new Error('Manual resolution needs merged data');
                    }
                    finalData = mergedData;
                    break;
            }

            await applyResolution(
                conflict.entityType,
                conflict.entityId,
                finalData,
                resolution
            );
            conflicts.set(conflictId, {
                ...conflict,
                resolution,
                resolvedAt: now(),
            });
            conflicts.delete(conflictId);
            return finalData;
        },

        async resolveAll(
            resolution: ConflictResolution,
            mergedData?: ConflictData
        ): Promise<void> {
            for (const conflict of [...conflicts.values()]) {
                await this.resolve(conflict.id, resolution, mergedData);
            }
        },
    };
}

export type ConflictRegistry = ReturnType<typeof createConflictRegistry>;
