/**
 * Unit Tests for Conflict Resolver
 * 
 * Tests for detecting and resolving conflicts between client and server data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    detectTaskConflicts,
    detectProjectConflicts,
    resolveTaskConflicts,
    resolveProjectConflicts,
    applyUserResolution,
    formatConflictSummary,
} from '../conflict-resolver';
import type { OfflineTask, OfflineProject } from '../offline-storage';

// Mock logger
vi.mock('../logger', () => ({
    logger: {
        log: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    }
}));

describe('Conflict Resolver', () => {
    const baseClientTask: OfflineTask = {
        id: 'task-1',
        title: 'Client Task',
        description: 'Client description',
        status: 'TODO',
        priority: 'HIGH',
        completed: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T12:00:00Z',
    };

    const baseServerTask: OfflineTask = {
        id: 'task-1',
        title: 'Server Task',
        description: 'Server description',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        completed: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T10:00:00Z',
    };

    const baseClientProject: OfflineProject = {
        id: 'project-1',
        name: 'Client Project',
        description: 'Client description',
        workspaceId: 'ws-1',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T12:00:00Z',
    };

    const baseServerProject: OfflineProject = {
        id: 'project-1',
        name: 'Server Project',
        description: 'Server description',
        workspaceId: 'ws-1',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T10:00:00Z',
    };

    describe('detectTaskConflicts', () => {
        it('should detect no conflicts when tasks are identical', () => {
            const conflicts = detectTaskConflicts(baseClientTask, baseClientTask);
            expect(conflicts).toHaveLength(0);
        });

        it('should detect conflicts for different field values', () => {
            const conflicts = detectTaskConflicts(baseClientTask, baseServerTask);

            expect(conflicts.length).toBeGreaterThan(0);
            expect(conflicts.some(c => c.field === 'title')).toBe(true);
            expect(conflicts.some(c => c.field === 'status')).toBe(true);
        });

        it('should include timestamps in conflict data', () => {
            const conflicts = detectTaskConflicts(baseClientTask, baseServerTask);

            const titleConflict = conflicts.find(c => c.field === 'title');
            expect(titleConflict).toBeDefined();
            expect(titleConflict?.clientValue).toBe('Client Task');
            expect(titleConflict?.serverValue).toBe('Server Task');
            expect(titleConflict?.clientTimestamp).toBeGreaterThan(0);
            expect(titleConflict?.serverTimestamp).toBeGreaterThan(0);
        });
    });

    describe('detectProjectConflicts', () => {
        it('should detect no conflicts when projects are identical', () => {
            const conflicts = detectProjectConflicts(baseClientProject, baseClientProject);
            expect(conflicts).toHaveLength(0);
        });

        it('should detect name conflict', () => {
            const conflicts = detectProjectConflicts(baseClientProject, baseServerProject);

            expect(conflicts.some(c => c.field === 'name')).toBe(true);
        });
    });

    describe('resolveTaskConflicts', () => {
        it('should return no conflicts when tasks are identical', () => {
            const resolution = resolveTaskConflicts(baseClientTask, baseClientTask);

            expect(resolution.resolved).toBe(true);
            expect(resolution.conflicts).toHaveLength(0);
            expect(resolution.requiresUserInput).toBe(false);
        });

        it('should resolve with client-wins strategy', () => {
            const resolution = resolveTaskConflicts(baseClientTask, baseServerTask, 'client-wins');

            expect(resolution.resolved).toBe(true);
            expect(resolution.result.title).toBe('Client Task');
            expect(resolution.strategy).toBe('client-wins');
        });

        it('should resolve with server-wins strategy', () => {
            const resolution = resolveTaskConflicts(baseClientTask, baseServerTask, 'server-wins');

            expect(resolution.resolved).toBe(true);
            expect(resolution.result.title).toBe('Server Task');
            expect(resolution.strategy).toBe('server-wins');
        });

        it('should resolve with last-write-wins strategy', () => {
            // Client is more recent
            const resolution = resolveTaskConflicts(baseClientTask, baseServerTask, 'last-write-wins');

            expect(resolution.resolved).toBe(true);
            expect(resolution.result.title).toBe('Client Task');
            expect(resolution.strategy).toBe('last-write-wins');
        });

        it('should require user input with prompt strategy', () => {
            const resolution = resolveTaskConflicts(baseClientTask, baseServerTask, 'prompt');

            expect(resolution.resolved).toBe(false);
            expect(resolution.requiresUserInput).toBe(true);
            expect(resolution.strategy).toBe('prompt');
        });

        it('should merge conflicts intelligently', () => {
            const resolution = resolveTaskConflicts(baseClientTask, baseServerTask, 'merge');

            expect(resolution.strategy).toBe('merge');
            // Client is newer, so client values should be applied
            expect(resolution.result.title).toBe('Client Task');
        });
    });

    describe('resolveProjectConflicts', () => {
        it('should resolve with client-wins strategy', () => {
            const resolution = resolveProjectConflicts(baseClientProject, baseServerProject, 'client-wins');

            expect(resolution.resolved).toBe(true);
            expect(resolution.result.name).toBe('Client Project');
        });

        it('should resolve with server-wins strategy', () => {
            const resolution = resolveProjectConflicts(baseClientProject, baseServerProject, 'server-wins');

            expect(resolution.resolved).toBe(true);
            expect(resolution.result.name).toBe('Server Project');
        });
    });

    describe('applyUserResolution', () => {
        it('should apply client choice', () => {
            const conflict = {
                field: 'title',
                clientValue: 'Client Title',
                serverValue: 'Server Title',
                clientTimestamp: Date.now(),
                serverTimestamp: Date.now() - 1000,
            };

            const result = applyUserResolution(conflict, baseServerTask, 'client');

            expect(result.title).toBe('Client Title');
        });

        it('should apply server choice', () => {
            const conflict = {
                field: 'title',
                clientValue: 'Client Title',
                serverValue: 'Server Title',
                clientTimestamp: Date.now(),
                serverTimestamp: Date.now() - 1000,
            };

            const result = applyUserResolution(conflict, baseServerTask, 'server');

            expect(result.title).toBe('Server Title');
        });
    });

    describe('formatConflictSummary', () => {
        it('should format conflict summary', () => {
            const conflicts = [
                {
                    field: 'title',
                    clientValue: 'Client',
                    serverValue: 'Server',
                    clientTimestamp: Date.now(),
                    serverTimestamp: Date.now() - 1000,
                }
            ];

            const summary = formatConflictSummary(conflicts);

            expect(summary).toContain('title');
            expect(summary).toContain('Local');
            expect(summary).toContain('Server');
        });

        it('should handle multiple conflicts', () => {
            const conflicts = [
                {
                    field: 'title',
                    clientValue: 'A',
                    serverValue: 'B',
                    clientTimestamp: Date.now(),
                    serverTimestamp: Date.now(),
                },
                {
                    field: 'status',
                    clientValue: 'TODO',
                    serverValue: 'DONE',
                    clientTimestamp: Date.now(),
                    serverTimestamp: Date.now(),
                }
            ];

            const summary = formatConflictSummary(conflicts);

            expect(summary).toContain('title');
            expect(summary).toContain('status');
        });
    });
});
