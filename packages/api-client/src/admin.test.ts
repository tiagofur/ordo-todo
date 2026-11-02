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

describe('Admin endpoints', () => {
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

    it('gets the admin overview', async () => {
        mockAxios.get.mockResolvedValue({ data: { users: { total: 10 } } });
        const result = await client.getAdminOverview();
        expect(mockAxios.get).toHaveBeenCalledWith('/admin/overview');
        expect(result.users.total).toBe(10);
    });

    it('lists admin users with params', async () => {
        mockAxios.get.mockResolvedValue({ data: { total: 1, users: [] } });
        const result = await client.getAdminUsers({ search: 'a', page: 2, limit: 20 });
        expect(mockAxios.get).toHaveBeenCalledWith('/admin/users', {
            params: { search: 'a', page: 2, limit: 20 },
        });
        expect(result.total).toBe(1);
    });

    it('gets one admin user', async () => {
        mockAxios.get.mockResolvedValue({ data: { id: 'u1' } });
        const result = await client.getAdminUser('u1');
        expect(mockAxios.get).toHaveBeenCalledWith('/admin/users/u1');
        expect(result.id).toBe('u1');
    });

    it('blocks and unblocks an admin user', async () => {
        mockAxios.post.mockResolvedValue({ data: { id: 'u1', status: 'BLOCKED' } });
        const blocked = await client.blockAdminUser('u1');
        expect(mockAxios.post).toHaveBeenCalledWith('/admin/users/u1/block');
        expect(blocked.status).toBe('BLOCKED');

        mockAxios.post.mockResolvedValue({ data: { id: 'u1', status: 'ACTIVE' } });
        const unblocked = await client.unblockAdminUser('u1');
        expect(mockAxios.post).toHaveBeenCalledWith('/admin/users/u1/unblock');
        expect(unblocked.status).toBe('ACTIVE');
    });

    it('grants and revokes pro with optional grant body', async () => {
        mockAxios.post.mockResolvedValue({ data: { id: 'u1', plan: 'PRO' } });
        const granted = await client.grantAdminPro('u1', { days: 30 });
        expect(mockAxios.post).toHaveBeenCalledWith('/admin/users/u1/grant-pro', {
            days: 30,
        });
        expect(granted.plan).toBe('PRO');

        await client.revokeAdminPro('u1');
        expect(mockAxios.post).toHaveBeenCalledWith('/admin/users/u1/revoke-pro');
    });

    it('lists invite codes', async () => {
        mockAxios.get.mockResolvedValue({ data: [{ id: 'c1' }] });
        const result = await client.getAdminInviteCodes();
        expect(mockAxios.get).toHaveBeenCalledWith('/admin/invite-codes');
        expect(result).toHaveLength(1);
    });

    it('creates an invite code with optional dto', async () => {
        mockAxios.post.mockResolvedValue({ data: { id: 'c1', code: 'X' } });
        const result = await client.createAdminInviteCode({ label: 'beta', maxUses: 5 });
        expect(mockAxios.post).toHaveBeenCalledWith('/admin/invite-codes', {
            label: 'beta',
            maxUses: 5,
        });
        expect(result.code).toBe('X');
    });

    it('deactivates an invite code via patch', async () => {
        mockAxios.patch.mockResolvedValue({ data: { id: 'c1', isActive: false } });
        const result = await client.deactivateAdminInviteCode('c1');
        expect(mockAxios.patch).toHaveBeenCalledWith('/admin/invite-codes/c1', {
            isActive: false,
        });
        expect(result.isActive).toBe(false);
    });
});
