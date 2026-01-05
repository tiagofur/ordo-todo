import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock functions - will be assigned to the mocked module
let mockGet: ReturnType<typeof vi.fn>;
let mockPost: ReturnType<typeof vi.fn>;
let mockPut: ReturnType<typeof vi.fn>;
let mockPatch: ReturnType<typeof vi.fn>;
let mockDelete: ReturnType<typeof vi.fn>;

// Mock all dependencies BEFORE importing api-client
vi.mock('axios', () => {
    const get = vi.fn();
    const post = vi.fn();
    const put = vi.fn();
    const patch = vi.fn();
    const del = vi.fn();

    // Expose mock functions globally
    (globalThis as any).__mockAxios = { get, post, put, patch, delete: del };

    return {
        default: {
            create: vi.fn(() => ({
                get,
                post,
                put,
                patch,
                delete: del,
                interceptors: {
                    request: { use: vi.fn() },
                    response: { use: vi.fn() },
                },
                defaults: { headers: { common: {} } }
            })),
        },
        AxiosError: class AxiosError extends Error { },
    };
});

vi.mock('@/config', () => ({
    config: {
        api: { baseURL: 'http://test-api' }
    }
}));

vi.mock('@/stores/sync-store', () => ({
    useSyncStore: {
        getState: () => ({
            isOnline: true,
            setOnline: vi.fn(),
        })
    }
}));

vi.mock('@/lib/offline-storage', () => ({
    PendingActionType: {
        CREATE_TASK: 'CREATE_TASK',
        UPDATE_TASK: 'UPDATE_TASK',
        DELETE_TASK: 'DELETE_TASK',
    },
    offlineStorage: {
        queuePendingAction: vi.fn(),
    }
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        log: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    }
}));

// Import AFTER mocks are set up
import { apiClient } from '../api-client';

describe('apiClient', () => {
    beforeEach(() => {
        // Get mock functions from global
        const mocks = (globalThis as any).__mockAxios;
        mockGet = mocks.get;
        mockPost = mocks.post;
        mockPut = mocks.put;
        mockPatch = mocks.patch;
        mockDelete = mocks.delete;

        vi.clearAllMocks();
    });

    describe('User Preferences', () => {
        it('updatePreferences calls correct endpoint', async () => {
            const dto = {
                enableAI: true,
                aiAggressiveness: 0.5
            };
            mockPatch.mockResolvedValue({ data: { success: true } });

            await apiClient.updatePreferences(dto);

            expect(mockPatch).toHaveBeenCalledWith('/users/me/preferences', dto);
        });
    });

    describe('Tasks', () => {
        it('getTasks calls correct endpoint with params', async () => {
            mockGet.mockResolvedValue({ data: [] });

            await apiClient.getTasks('proj-1', ['tag1'], true);

            expect(mockGet).toHaveBeenCalledWith('/tasks', {
                params: { projectId: 'proj-1', tags: ['tag1'], assignedToMe: true }
            });
        });

        it('setTaskCustomValues calls patch with correct data', async () => {
            const data = { 'field-1': 'value' };
            mockPatch.mockResolvedValue({ data: { success: true } });

            await apiClient.setTaskCustomValues('task-1', data as any);

            expect(mockPatch).toHaveBeenCalledWith('/tasks/task-1/custom-values', data);
        });
    });

    describe('Habits', () => {
        it('createHabit calls post with DTO', async () => {
            const dto = { name: 'Drink Water', frequency: 'DAILY' };
            mockPost.mockResolvedValue({ data: { id: '1', ...dto } });

            await apiClient.createHabit(dto as any);

            expect(mockPost).toHaveBeenCalledWith('/habits', dto);
        });
    });

    describe('Custom Fields', () => {
        it('createCustomField calls post with correct endpoint', async () => {
            const dto = { name: 'Priority', type: 'SELECT' };
            const workspaceId = 'ws-1';
            mockPost.mockResolvedValue({ data: { id: 'cf-1', ...dto } });

            await apiClient.createCustomField(workspaceId, dto as any);

            expect(mockPost).toHaveBeenCalledWith(`/projects/${workspaceId}/custom-fields`, dto);
        });
    });
});
