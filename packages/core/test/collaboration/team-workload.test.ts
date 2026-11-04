import { calculateBalanceScore } from "../../src/collaboration/model/team-workload";

describe('calculateBalanceScore', () => {
  it('maps an idle team to a full balance gauge', () => {
    expect(calculateBalanceScore(0)).toBe(100);
  });

  it('inverts the backend load average (higher load, lower balance)', () => {
    expect(calculateBalanceScore(30)).toBe(70);
    expect(calculateBalanceScore(100)).toBe(0);
  });

  it('clamps out-of-range averages to the 0-100 gauge', () => {
    expect(calculateBalanceScore(-5)).toBe(100);
    expect(calculateBalanceScore(140)).toBe(0);
  });
});
