import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import { OrdoApiClient } from './client';
import { MemoryTokenStorage } from './utils/storage';

// Mock axios with a callable instance so `this.axios(config)` retries work.
vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => {
            const instance: any = vi.fn(async () => ({
                data: 'retried',
                status: 200,
            }));
            instance.get = vi.fn();
            instance.post = vi.fn();
            instance.put = vi.fn();
            instance.patch = vi.fn();
            instance.delete = vi.fn();
            instance.interceptors = {
                request: { use: vi.fn((onFulfilled: any) => onFulfilled) },
                response: {
                    use: vi.fn((onFulfilled: any, onRejected: any) => ({
                        onFulfilled,
                        onRejected,
                    })),
                },
            };
            return instance;
        }),
    },
}));

function setup(config: Record<string, unknown> = {}) {
    const mockAxios: any = axios.create({
        baseURL: 'http://localhost:3001/api/v1',
        headers: { 'Content-Type': 'application/json' },
    });
    vi.mocked(axios.create).mockReturnValue(mockAxios);
    const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        ...config,
    } as any);
    const requestHandler = mockAxios.interceptors.request.use.mock.calls[0][0];
    const responseHandlers = mockAxios.interceptors.response.use.mock.calls[0];
    return { client, mockAxios, requestHandler, onRejected: responseHandlers[1] };
}

const getConfig = (overrides: Record<string, unknown> = {}) => ({
    url: '/tasks',
    method: 'get',
    headers: {} as Record<string, string>,
    ...overrides,
});

describe('credentialed transport (cookie + CSRF)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('sends withCredentials without a Bearer header, even with storage', async () => {
        const storage = new MemoryTokenStorage();
        storage.setToken('stored-token');
        const { requestHandler } = setup({
            authTransport: 'credentialed',
            tokenStorage: storage,
        });
        const config = getConfig();
        await requestHandler(config);
        expect(config.headers.Authorization).toBeUndefined();
    });

    it('creates the instance with withCredentials in credentialed mode', () => {
        setup({ authTransport: 'credentialed' });
        expect(axios.create).toHaveBeenCalledWith(
            expect.objectContaining({ withCredentials: true })
        );
    });

    it('keeps bearer default untouched (no withCredentials key, Bearer attached)', async () => {
        const storage = new MemoryTokenStorage();
        storage.setToken('stored-token');
        const { requestHandler } = setup({ tokenStorage: storage });
        expect(axios.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:3001/api/v1',
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' },
        });
        const config = getConfig();
        await requestHandler(config);
        expect(config.headers.Authorization).toBe('Bearer stored-token');
    });

    it('attaches x-csrf-token on mutating requests, not on GET or /auth/*', async () => {
        const { requestHandler } = setup({
            authTransport: 'credentialed',
            csrfTokenProvider: () => 'csrf-123',
        });
        const post = getConfig({ url: '/tasks', method: 'post' });
        await requestHandler(post);
        expect(post.headers['x-csrf-token']).toBe('csrf-123');

        const get = getConfig({ url: '/tasks', method: 'get' });
        await requestHandler(get);
        expect(get.headers['x-csrf-token']).toBeUndefined();

        const login = getConfig({ url: '/auth/login', method: 'post' });
        await requestHandler(login);
        expect(login.headers['x-csrf-token']).toBeUndefined();
    });

    it('lets the request through when the CSRF provider fails', async () => {
        const { requestHandler } = setup({
            authTransport: 'credentialed',
            csrfTokenProvider: () => {
                throw new Error('csrf down');
            },
        });
        const post = getConfig({ url: '/tasks', method: 'post' });
        await expect(requestHandler(post)).resolves.toBe(post);
        expect(post.headers['x-csrf-token']).toBeUndefined();
    });

    it('refreshes via cookie endpoint and retries once on 401 without storage', async () => {
        const onAuthError = vi.fn();
        const { client, mockAxios, onRejected } = setup({
            authTransport: 'credentialed',
            onAuthError,
        });
        mockAxios.post.mockResolvedValue({
            data: { accessToken: 'a', refreshToken: 'r', user: {} },
        });
        const original = getConfig({ url: '/tasks', method: 'get' });
        const retried = await onRejected({ response: { status: 401 }, config: original });
        expect(mockAxios.post).toHaveBeenCalledWith('/auth/refresh', {});
        expect(mockAxios).toHaveBeenCalledWith(original);
        expect(retried).toEqual({ data: 'retried', status: 200 });
        expect(onAuthError).not.toHaveBeenCalled();
        expect(client).toBeDefined();
    });

    it('calls onAuthError when the cookie refresh fails', async () => {
        const onAuthError = vi.fn();
        const { mockAxios, onRejected } = setup({
            authTransport: 'credentialed',
            onAuthError,
        });
        mockAxios.post.mockRejectedValue(new Error('refresh expired'));
        await expect(
            onRejected({ response: { status: 401 }, config: getConfig() })
        ).rejects.toThrow('refresh expired');
        expect(onAuthError).toHaveBeenCalledTimes(1);
    });

    it('clears the server session on logout in credentialed mode', async () => {
        const { client, mockAxios } = setup({ authTransport: 'credentialed' });
        mockAxios.post.mockResolvedValue({});

        await client.logout();

        // The httpOnly cookie only dies server-side: without this POST the
        // user stays logged in (logout button appears to do nothing).
        expect(mockAxios.post).toHaveBeenCalledWith('/auth/logout', {});
    });

    it('stays client-side-only on logout in bearer mode', async () => {
        const storage = new MemoryTokenStorage();
        storage.setToken('stored-token');
        const { client, mockAxios } = setup({ tokenStorage: storage });

        await client.logout();

        expect(mockAxios.post).not.toHaveBeenCalled();
        expect(storage.getToken()).toBeNull();
    });
});
