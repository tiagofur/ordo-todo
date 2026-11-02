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

describe('Billing endpoints', () => {
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

    it('gets the billing usage overview', async () => {
        const overview = { plan: 'PRO', seats: 3 };
        mockAxios.get.mockResolvedValue({ data: overview });
        const result = await client.getBillingOverview();
        expect(mockAxios.get).toHaveBeenCalledWith('/billing/usage');
        expect(result).toEqual(overview);
    });

    it('creates a checkout session with plan, interval and seats', async () => {
        mockAxios.post.mockResolvedValue({
            data: { url: 'https://checkout', sessionId: 'cs_1' },
        });
        const result = await client.createCheckoutSession('pro', 'month', 3);
        expect(mockAxios.post).toHaveBeenCalledWith('/billing/checkout-session', {
            planId: 'pro',
            interval: 'month',
            seats: 3,
        });
        expect(result.sessionId).toBe('cs_1');
    });

    it('creates a portal session without a body', async () => {
        mockAxios.post.mockResolvedValue({ data: { url: 'https://portal' } });
        const result = await client.createPortalSession();
        expect(mockAxios.post).toHaveBeenCalledWith('/billing/portal-session');
        expect(result.url).toBe('https://portal');
    });
});
