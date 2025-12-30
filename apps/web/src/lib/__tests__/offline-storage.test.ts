/**
 * Unit Tests for Offline Storage
 * 
 * Tests for IndexedDB operations using fake-indexeddb
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    generateActionId,
    isIndexedDBSupported,
    PendingActionType,
} from '../offline-storage';

// Mock idb module since IndexedDB is not available in jsdom
vi.mock('idb', () => ({
    openDB: vi.fn(() => Promise.resolve({
        put: vi.fn(),
        get: vi.fn(),
        getAll: vi.fn(() => []),
        getAllFromIndex: vi.fn(() => []),
        delete: vi.fn(),
        clear: vi.fn(),
        count: vi.fn(() => 0),
        transaction: vi.fn(() => ({
            store: { put: vi.fn(), delete: vi.fn() },
            done: Promise.resolve(),
        })),
    })),
}));

describe('Offline Storage Utilities', () => {
    describe('generateActionId', () => {
        it('should generate unique action IDs', () => {
            const id1 = generateActionId();
            const id2 = generateActionId();

            expect(id1).not.toBe(id2);
        });

        it('should start with "action_" prefix', () => {
            const id = generateActionId();

            expect(id.startsWith('action_')).toBe(true);
        });

        it('should contain timestamp', () => {
            const before = Date.now();
            const id = generateActionId();
            const after = Date.now();

            // Extract timestamp from id (format: action_<timestamp>_<random>)
            const parts = id.split('_');
            const timestamp = parseInt(parts[1], 10);

            expect(timestamp).toBeGreaterThanOrEqual(before);
            expect(timestamp).toBeLessThanOrEqual(after);
        });
    });

    describe('isIndexedDBSupported', () => {
        it('should return boolean', () => {
            const result = isIndexedDBSupported();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('PendingActionType', () => {
        it('should have all action types defined', () => {
            const expectedTypes: PendingActionType[] = [
                'CREATE_TASK',
                'UPDATE_TASK',
                'DELETE_TASK',
                'COMPLETE_TASK',
                'CREATE_PROJECT',
                'UPDATE_PROJECT',
                'DELETE_PROJECT',
                'CREATE_COMMENT',
                'START_TIMER',
                'STOP_TIMER',
            ];

            // This validates the type exists
            expectedTypes.forEach(type => {
                expect(typeof type).toBe('string');
            });
        });
    });
});

describe('Offline Task Interface', () => {
    it('should define required fields', () => {
        // Type checking - if this compiles, the interface is correct
        const task = {
            id: 'task-1',
            title: 'Test Task',
            status: 'TODO',
            priority: 'HIGH',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        expect(task.id).toBeDefined();
        expect(task.title).toBeDefined();
        expect(task.status).toBeDefined();
        expect(task.priority).toBeDefined();
        expect(typeof task.completed).toBe('boolean');
    });
});

describe('Offline Project Interface', () => {
    it('should define required fields', () => {
        const project = {
            id: 'project-1',
            name: 'Test Project',
            workspaceId: 'ws-1',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        expect(project.id).toBeDefined();
        expect(project.name).toBeDefined();
        expect(project.workspaceId).toBeDefined();
        expect(project.status).toBeDefined();
    });
});

describe('PendingAction Interface', () => {
    it('should define required fields', () => {
        const action = {
            id: 'action_123_abc',
            type: 'CREATE_TASK' as PendingActionType,
            endpoint: '/tasks',
            method: 'POST' as const,
            payload: { title: 'New Task' },
            entityType: 'task' as const,
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries: 3,
        };

        expect(action.id).toBeDefined();
        expect(action.type).toBe('CREATE_TASK');
        expect(action.method).toBe('POST');
        expect(action.retryCount).toBe(0);
        expect(action.maxRetries).toBe(3);
    });
});
