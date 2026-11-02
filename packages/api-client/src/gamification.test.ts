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

describe('Gamification endpoints', () => {
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

    it('gets the gamification profile with achievements', async () => {
        mockAxios.get.mockResolvedValue({
            data: {
                xp: 120,
                level: 3,
                currentLevelProgress: 0.4,
                nextLevelXp: 200,
                achievementsTotal: 10,
                achievementsUnlocked: 4,
                achievements: [
                    {
                        id: 'a1',
                        code: 'FIRST_TASK',
                        name: 'First task',
                        description: 'Complete one task',
                        icon: 'star',
                        xpReward: 10,
                        isUnlocked: true,
                        unlockedAt: '2026-01-01',
                    },
                ],
            },
        });
        const result = await client.getGamificationProfile();
        expect(mockAxios.get).toHaveBeenCalledWith('/gamification/me');
        expect(result.level).toBe(3);
        expect(result.achievements).toHaveLength(1);
    });
});
