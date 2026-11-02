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

describe('Integrations and OAuth connections', () => {
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

    it('connects a user integration with optional payload', async () => {
        mockAxios.post.mockResolvedValue({ data: { success: true, message: 'ok' } });
        const result = await client.connectIntegration('google', { code: 'c' });
        expect(mockAxios.post).toHaveBeenCalledWith(
            '/users/me/integrations/google/connect',
            { code: 'c' }
        );
        expect(result.success).toBe(true);
    });

    it('disconnects a user integration', async () => {
        mockAxios.delete.mockResolvedValue({ data: { success: true, message: 'ok' } });
        await client.disconnectIntegration('google');
        expect(mockAxios.delete).toHaveBeenCalledWith(
            '/users/me/integrations/google'
        );
    });

    it('gets OAuth client info for the consent screen', async () => {
        mockAxios.get.mockResolvedValue({ data: { clientId: 'app' } });
        const result = await client.getOAuthClientInfo('app', 'read');
        expect(mockAxios.get).toHaveBeenCalledWith('/oauth/authorize/client', {
            params: { client_id: 'app', scope: 'read' },
        });
        expect(result.clientId).toBe('app');
    });

    it('lists OAuth connections', async () => {
        mockAxios.get.mockResolvedValue({ data: [{ clientId: 'app' }] });
        const result = await client.getOAuthConnections();
        expect(mockAxios.get).toHaveBeenCalledWith('/oauth/connections');
        expect(result).toHaveLength(1);
    });

    it('disconnects an OAuth client reporting revoked grants', async () => {
        mockAxios.delete.mockResolvedValue({ data: { revoked: 2 } });
        const result = await client.disconnectOAuthClient('app');
        expect(mockAxios.delete).toHaveBeenCalledWith('/oauth/connections', {
            params: { client_id: 'app' },
        });
        expect(result.revoked).toBe(2);
    });
});
