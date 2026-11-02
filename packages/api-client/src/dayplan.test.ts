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

describe('Day plan endpoints', () => {
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

    it('gets the day plan view', async () => {
        mockAxios.get.mockResolvedValue({ data: { status: 'PROPOSED' } });
        const result = await client.getDayPlan();
        expect(mockAxios.get).toHaveBeenCalledWith('/tasks/day-plan');
        expect(result.status).toBe('PROPOSED');
    });

    it('applies a day plan proposal', async () => {
        mockAxios.post.mockResolvedValue({ data: { status: 'APPLIED' } });
        const result = await client.applyDayPlan('prop-1');
        expect(mockAxios.post).toHaveBeenCalledWith('/tasks/day-plan/apply', {
            proposalId: 'prop-1',
        });
        expect(result.status).toBe('APPLIED');
    });

    it('dismisses a day plan proposal', async () => {
        mockAxios.post.mockResolvedValue({ data: { status: 'DISMISSED' } });
        const result = await client.dismissDayPlan('prop-1');
        expect(mockAxios.post).toHaveBeenCalledWith('/tasks/day-plan/dismiss', {
            proposalId: 'prop-1',
        });
        expect(result.status).toBe('DISMISSED');
    });

    it('freezes and unfreezes a day plan block', async () => {
        mockAxios.post.mockResolvedValue({ data: { status: 'PROPOSED' } });
        await client.freezeDayPlanBlock('task-1');
        expect(mockAxios.post).toHaveBeenCalledWith('/tasks/day-plan/freeze', {
            taskId: 'task-1',
        });
        await client.unfreezeDayPlanBlock('task-1');
        expect(mockAxios.post).toHaveBeenCalledWith('/tasks/day-plan/unfreeze', {
            taskId: 'task-1',
        });
    });

    it('lists day plan risks', async () => {
        mockAxios.get.mockResolvedValue({ data: [{ kind: 'overload' }] });
        const result = await client.getDayPlanRisks();
        expect(mockAxios.get).toHaveBeenCalledWith('/tasks/day-plan/risks');
        expect(result).toHaveLength(1);
    });
});
