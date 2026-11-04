import { describe, it, expect } from 'vitest';
import { normalizeMeetingAnalysis } from './meeting-analysis';

describe('normalizeMeetingAnalysis', () => {
  it('passes a canonical analysis through untouched', () => {
    const canonical = {
      summary: 'Sprint review',
      keyPoints: ['shipped X'],
      actionItems: [{ title: 'Fix bug', priority: 'HIGH', context: 'prod' }],
      decisions: [{ decision: 'Ship it', context: 'review' }],
      participants: [{ name: 'Ana', role: 'Dev' }],
      topics: [{ topic: 'Release', summary: 'ok' }],
      sentiment: 'POSITIVE',
    };
    expect(normalizeMeetingAnalysis(canonical)).toEqual(canonical);
  });

  it('coerces AI string variants into objects', () => {
    const result = normalizeMeetingAnalysis({
      summary: 'Sync',
      keyPoints: 'not-an-array',
      actionItems: ['Call the client', { action: 'Write docs' }],
      decisions: ['Go live'],
      participants: ['Ana'],
      topics: [{ topic: 'Q3' }],
      sentiment: 'UNKNOWN',
    });
    expect(result.keyPoints).toEqual([]);
    expect(result.actionItems).toEqual([
      { title: 'Call the client', priority: 'MEDIUM', context: '' },
      { title: 'Write docs', priority: 'MEDIUM', context: '' },
    ]);
    expect(result.decisions).toEqual([{ decision: 'Go live', context: '' }]);
    expect(result.participants).toEqual([{ name: 'Ana' }]);
    expect(result.topics).toEqual([{ topic: 'Q3', summary: '' }]);
    expect(result.sentiment).toBe('NEUTRAL');
  });

  it('never throws on nullish or garbage input', () => {
    for (const input of [null, undefined, 42, 'nope', []]) {
      const result = normalizeMeetingAnalysis(input);
      expect(result.summary).toBe('');
      expect(result.actionItems).toEqual([]);
      expect(result.decisions).toEqual([]);
      expect(result.participants).toEqual([]);
      expect(result.topics).toEqual([]);
    }
  });

  it('rejects off-union priorities to MEDIUM', () => {
    const result = normalizeMeetingAnalysis({
      actionItems: [{ title: 'X', priority: 'ASAP' }],
    });
    expect(result.actionItems[0].priority).toBe('MEDIUM');
  });
});
