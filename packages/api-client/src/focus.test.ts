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

describe('Focus audio endpoints', () => {
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

    it('lists ambient tracks', async () => {
        mockAxios.get.mockResolvedValue({ data: [{ id: 't1' }] });
        const result = await client.getFocusTracks();
        expect(mockAxios.get).toHaveBeenCalledWith('/focus/tracks');
        expect(result).toHaveLength(1);
    });

    it('lists recommended tracks', async () => {
        mockAxios.get.mockResolvedValue({ data: [] });
        await client.getRecommendedTracks();
        expect(mockAxios.get).toHaveBeenCalledWith('/focus/tracks/recommended');
    });

    it('lists focus modes', async () => {
        mockAxios.get.mockResolvedValue({ data: [{ id: 'm1' }] });
        const result = await client.getFocusModes();
        expect(mockAxios.get).toHaveBeenCalledWith('/focus/modes');
        expect(result).toHaveLength(1);
    });

    it('lists favorite tracks', async () => {
        mockAxios.get.mockResolvedValue({ data: [] });
        await client.getFocusFavorites();
        expect(mockAxios.get).toHaveBeenCalledWith('/focus/favorites');
    });

    it('toggles a track favorite reporting the new state', async () => {
        mockAxios.post.mockResolvedValue({ data: { isFavorite: true } });
        const result = await client.toggleFocusFavorite('t1');
        expect(mockAxios.post).toHaveBeenCalledWith('/focus/favorites/t1');
        expect(result.isFavorite).toBe(true);
    });

    it('gets audio preferences', async () => {
        mockAxios.get.mockResolvedValue({ data: { defaultVolume: 50 } });
        const result = await client.getFocusPreferences();
        expect(mockAxios.get).toHaveBeenCalledWith('/focus/preferences');
        expect(result.defaultVolume).toBe(50);
    });

    it('updates audio preferences with a partial dto', async () => {
        mockAxios.patch.mockResolvedValue({ data: { defaultVolume: 70 } });
        const result = await client.updateFocusPreferences({ defaultVolume: 70 });
        expect(mockAxios.patch).toHaveBeenCalledWith('/focus/preferences', {
            defaultVolume: 70,
        });
        expect(result.defaultVolume).toBe(70);
    });

    it('gets focus session stats', async () => {
        mockAxios.get.mockResolvedValue({ data: { totalSessions: 5 } });
        const result = await client.getFocusStats();
        expect(mockAxios.get).toHaveBeenCalledWith('/focus/stats');
        expect(result.totalSessions).toBe(5);
    });
});
