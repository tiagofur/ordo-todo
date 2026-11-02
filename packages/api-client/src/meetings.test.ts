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

describe('Meetings endpoints', () => {
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

    it('analyzes a transcript with options', async () => {
        mockAxios.post.mockResolvedValue({ data: { summary: 's' } });
        const result = await client.analyzeMeetingTranscript('hello', {
            meetingTitle: 'Standup',
            participants: ['a'],
            duration: 30,
        });
        expect(mockAxios.post).toHaveBeenCalledWith('/meetings/analyze', {
            transcript: 'hello',
            meetingTitle: 'Standup',
            participants: ['a'],
            duration: 30,
        });
        expect(result.summary).toBe('s');
    });

    it('extracts action items with project context', async () => {
        mockAxios.post.mockResolvedValue({ data: { actionItems: [] } });
        await client.extractMeetingActions('hello', 'proj-1');
        expect(mockAxios.post).toHaveBeenCalledWith('/meetings/extract-actions', {
            transcript: 'hello',
            projectContext: 'proj-1',
        });
    });

    it('generates a summary in a given style', async () => {
        mockAxios.post.mockResolvedValue({ data: { summary: 'x' } });
        await client.generateMeetingSummary('hello', 'bullet-points');
        expect(mockAxios.post).toHaveBeenCalledWith('/meetings/summary', {
            transcript: 'hello',
            style: 'bullet-points',
        });
    });

    it('converts action items to tasks, optionally scoped', async () => {
        mockAxios.post.mockResolvedValue({ data: { created: 2 } });
        const result = await client.convertActionsToTasks([{ title: 't' }], {
            projectId: 'p1',
        });
        expect(mockAxios.post).toHaveBeenCalledWith('/meetings/convert-to-tasks', {
            actionItems: [{ title: 't' }],
            projectId: 'p1',
        });
        expect(result.created).toBe(2);
    });

    it('quick-analyzes a transcript for a project', async () => {
        mockAxios.post.mockResolvedValue({ data: {} });
        await client.quickAnalyzeMeeting('hello', 'p1');
        expect(mockAxios.post).toHaveBeenCalledWith('/meetings/quick-analyze', {
            transcript: 'hello',
            projectId: 'p1',
        });
    });

    it('saves a meeting note', async () => {
        mockAxios.post.mockResolvedValue({ data: { id: 'm1' } });
        const result = await client.saveMeeting({
            title: 'Standup',
            date: '2026-11-01',
            duration: 30,
        });
        expect(mockAxios.post).toHaveBeenCalledWith('/meetings/save', {
            title: 'Standup',
            date: '2026-11-01',
            duration: 30,
        });
        expect(result.id).toBe('m1');
    });

    it('lists meetings with params, gets one by id, deletes one', async () => {
        mockAxios.get.mockResolvedValue({ data: [] });
        await client.getMeetings({ limit: 8 });
        expect(mockAxios.get).toHaveBeenCalledWith('/meetings', {
            params: { limit: 8 },
        });

        mockAxios.get.mockResolvedValue({ data: { id: 'm1' } });
        await client.getMeetingById('m1');
        expect(mockAxios.get).toHaveBeenCalledWith('/meetings/m1');

        mockAxios.delete.mockResolvedValue({ data: undefined });
        await client.deleteMeeting('m1');
        expect(mockAxios.delete).toHaveBeenCalledWith('/meetings/m1');
    });
});
