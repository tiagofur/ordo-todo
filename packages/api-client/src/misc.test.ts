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

describe('Remaining bespoke methods', () => {
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

    it('resets a password with token and new password', async () => {
        mockAxios.post.mockResolvedValue({ data: { success: true, message: 'ok' } });
        const result = await client.resetPassword({
            token: 'tok',
            newPassword: 'Newpass1!',
        });
        expect(mockAxios.post).toHaveBeenCalledWith('/auth/reset-password', {
            token: 'tok',
            newPassword: 'Newpass1!',
        });
        expect(result.success).toBe(true);
    });

    it('gets the calendar feed token with urls', async () => {
        mockAxios.get.mockResolvedValue({
            data: { token: 't', feedUrl: 'https://f', webcalUrl: 'webcal://f' },
        });
        const result = await client.getCalendarFeedToken();
        expect(mockAxios.get).toHaveBeenCalledWith('/tasks/calendar-token');
        expect(result.webcalUrl).toBe('webcal://f');
    });

    it('gets a workspace by slug', async () => {
        mockAxios.get.mockResolvedValue({ data: { id: 'w1' } });
        const result = await client.getWorkspaceBySlugOnly('my-ws');
        expect(mockAxios.get).toHaveBeenCalledWith('/workspaces/by-slug/my-ws');
        expect(result.id).toBe('w1');
    });
});
