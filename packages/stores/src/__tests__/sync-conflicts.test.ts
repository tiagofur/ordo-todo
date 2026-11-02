import { describe, it, expect, vi } from 'vitest';
import {
    createConflictRegistry,
    resolveUpdateConflict,
    resolveDeleteConflict,
    suggestMerge,
    type SyncConflict,
} from '../sync-conflicts.js';

const conflict = (overrides: Partial<SyncConflict> = {}): SyncConflict => ({
    id: 'c1',
    type: 'update',
    entityType: 'task',
    entityId: 't1',
    localData: { title: 'Local', updated_at: '2026-01-02', tags: ['a'] },
    remoteData: { title: 'Remote', updated_at: '2026-01-01', tags: ['b'] },
    timestamp: 1,
    ...overrides,
});

describe('conflict strategies (mirrored from desktop)', () => {
    it('merges update conflicts preferring local fields and server timestamps', () => {
        const merged = resolveUpdateConflict(conflict()) as Record<string, unknown>;
        expect(merged.title).toBe('Local');
        expect(merged.tags).toEqual(['a', 'b']);
        expect(merged.updated_at).toBe(new Date('2026-01-02').getTime());
    });

    it('defers delete conflicts to manual resolution', () => {
        expect(resolveDeleteConflict(conflict({ type: 'delete' }))).toBe('manual');
    });

    it('suggests merges preferring local title and union tags', () => {
        const merged = suggestMerge(
            { title: 'Local', tags: ['a'] },
            { title: 'Remote', tags: ['b'] }
        );
        expect(merged.title).toBe('Local');
        expect(merged.tags).toEqual(['a', 'b']);
    });
});

describe('createConflictRegistry', () => {
    it('records conflicts with id and timestamp', () => {
        const registry = createConflictRegistry({ applyResolution: async () => {} });
        const recorded = registry.addConflict({
            type: 'update',
            entityType: 'task',
            entityId: 't1',
            localData: {},
            remoteData: {},
        });
        expect(recorded.id).toBeTruthy();
        expect(recorded.timestamp).toBeGreaterThan(0);
        expect(registry.list()).toHaveLength(1);
    });

    it('resolves local by applying local data and removing the conflict', async () => {
        const applyResolution = vi.fn(async () => {});
        const registry = createConflictRegistry({ applyResolution });
        registry.addConflict({
            type: 'update',
            entityType: 'task',
            entityId: 't1',
            localData: { title: 'Local' },
            remoteData: { title: 'Remote' },
        });
        const [stored] = registry.list();
        const finalData = await registry.resolve(stored!.id, 'local');
        expect(finalData).toEqual({ title: 'Local' });
        expect(applyResolution).toHaveBeenCalledWith('task', 't1', { title: 'Local' }, 'local');
        expect(registry.list()).toHaveLength(0);
    });

    it('resolves remote by applying remote data', async () => {
        const applyResolution = vi.fn(async () => {});
        const registry = createConflictRegistry({ applyResolution });
        registry.addConflict({
            type: 'update',
            entityType: 'task',
            entityId: 't1',
            localData: { title: 'Local' },
            remoteData: { title: 'Remote' },
        });
        const [stored] = registry.list();
        const finalData = await registry.resolve(stored!.id, 'remote');
        expect(finalData).toEqual({ title: 'Remote' });
        expect(registry.list()).toHaveLength(0);
    });

    it('resolves merge with provided data and rejects manual without data', async () => {
        const applyResolution = vi.fn(async () => {});
        const registry = createConflictRegistry({ applyResolution });
        registry.addConflict({
            type: 'update',
            entityType: 'task',
            entityId: 't1',
            localData: {},
            remoteData: {},
        });
        const [stored] = registry.list();
        await registry.resolve(stored!.id, 'merge', { title: 'Merged' });
        expect(applyResolution).toHaveBeenCalledWith(
            'task',
            't1',
            { title: 'Merged' },
            'merge'
        );

        registry.addConflict({
            type: 'delete',
            entityType: 'task',
            entityId: 't2',
            localData: {},
            remoteData: {},
        });
        const [second] = registry.list();
        await expect(registry.resolve(second!.id, 'manual')).rejects.toThrow(
            /merged data/i
        );
        expect(registry.list()).toHaveLength(1);
    });

    it('ignores unknown ids and resolves everything at once', async () => {
        const applyResolution = vi.fn(async () => {});
        const registry = createConflictRegistry({ applyResolution });
        await registry.resolve('missing', 'local');
        expect(applyResolution).not.toHaveBeenCalled();

        registry.addConflict({
            type: 'update',
            entityType: 'task',
            entityId: 't1',
            localData: { v: 1 },
            remoteData: { v: 2 },
        });
        registry.addConflict({
            type: 'update',
            entityType: 'task',
            entityId: 't2',
            localData: { v: 1 },
            remoteData: { v: 2 },
        });
        await registry.resolveAll('remote');
        expect(applyResolution).toHaveBeenCalledTimes(2);
        expect(registry.list()).toHaveLength(0);
    });
});
