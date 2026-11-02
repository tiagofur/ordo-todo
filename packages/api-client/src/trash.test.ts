import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import { OrdoApiClient } from './client';

// Mock axios (same pattern as client.test.ts)
vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
        })),
    },
}));

describe('Trash endpoints (projects + tasks)', () => {
    let client: OrdoApiClient;
    let mockAxios: any;

    beforeEach(() => {
        mockAxios = axios.create({
            baseURL: 'http://localhost:3001/api/v1',
            headers: { 'Content-Type': 'application/json' },
        });
        vi.mocked(axios.create).mockReturnValue(mockAxios as any);
        client = new OrdoApiClient({ baseURL: 'http://localhost:3001/api/v1' });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('lists deleted projects scoped by workspace', async () => {
        mockAxios.get.mockResolvedValue({ data: [{ id: 'p1' }] });
        const result = await client.getDeletedProjects('w1');
        expect(mockAxios.get).toHaveBeenCalledWith('/projects/deleted', {
            params: { workspaceId: 'w1' },
        });
        expect(result).toHaveLength(1);
    });

    it('restores a deleted project', async () => {
        mockAxios.post.mockResolvedValue({ data: { id: 'p1' } });
        const result = await client.restoreProject('p1');
        expect(mockAxios.post).toHaveBeenCalledWith('/projects/p1/restore');
        expect(result.id).toBe('p1');
    });

    it('permanently deletes a project', async () => {
        mockAxios.delete.mockResolvedValue({ data: undefined });
        await client.permanentDeleteProject('p1');
        expect(mockAxios.delete).toHaveBeenCalledWith('/projects/p1/permanent');
    });

    it('lists deleted tasks, optionally scoped by project', async () => {
        mockAxios.get.mockResolvedValue({ data: [{ id: 't1' }] });
        const scoped = await client.getDeletedTasks('proj-1');
        expect(mockAxios.get).toHaveBeenCalledWith('/tasks/deleted', {
            params: { projectId: 'proj-1' },
        });
        expect(scoped).toHaveLength(1);

        mockAxios.get.mockResolvedValue({ data: [] });
        await client.getDeletedTasks();
        expect(mockAxios.get).toHaveBeenCalledWith('/tasks/deleted', {
            params: {},
        });
    });

    it('restores a deleted task', async () => {
        mockAxios.post.mockResolvedValue({ data: { id: 't1' } });
        const result = await client.restoreTask('t1');
        expect(mockAxios.post).toHaveBeenCalledWith('/tasks/t1/restore');
        expect(result.id).toBe('t1');
    });

    it('permanently deletes a task', async () => {
        mockAxios.delete.mockResolvedValue({ data: undefined });
        await client.permanentDeleteTask('t1');
        expect(mockAxios.delete).toHaveBeenCalledWith('/tasks/t1/permanent');
    });
});
