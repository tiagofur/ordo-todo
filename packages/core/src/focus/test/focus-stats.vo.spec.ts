import { FocusStats } from '../model/focus-stats.vo';

describe('FocusStats', () => {
  const validProps = {
    totalSessions: 50,
    totalFocusMinutes: 1250, // ~20.8 hours
    avgSessionLength: 25,
    favoriteTrack: 'rain-soft',
    preferredMode: 'pomodoro',
    streakDays: 7,
  };

  describe('constructor', () => {
    it('should create valid focus stats', () => {
      const stats = new FocusStats(validProps);
      expect(stats.totalSessions).toBe(50);
      expect(stats.totalFocusMinutes).toBe(1250);
    });

    it('should throw error if totalSessions is negative', () => {
      expect(() => new FocusStats({ ...validProps, totalSessions: -1 })).toThrow(
        'Total sessions cannot be negative',
      );
    });

    it('should throw error if totalFocusMinutes is negative', () => {
      expect(() => new FocusStats({ ...validProps, totalFocusMinutes: -1 })).toThrow(
        'Total focus minutes cannot be negative',
      );
    });

    it('should throw error if avgSessionLength is negative', () => {
      expect(() => new FocusStats({ ...validProps, avgSessionLength: -1 })).toThrow(
        'Average session length cannot be negative',
      );
    });

    it('should throw error if streakDays is negative', () => {
      expect(() => new FocusStats({ ...validProps, streakDays: -1 })).toThrow(
        'Streak days cannot be negative',
      );
    });
  });

  describe('business methods', () => {
    it('should calculate total focus hours', () => {
      const stats = new FocusStats(validProps);
      expect(stats.getTotalFocusHours()).toBeCloseTo(20.8, 1);
    });

    it('should have data when sessions > 0', () => {
      const stats = new FocusStats(validProps);
      expect(stats.hasData()).toBe(true);
    });

    it('should not have data when sessions = 0', () => {
      const stats = new FocusStats({ ...validProps, totalSessions: 0 });
      expect(stats.hasData()).toBe(false);
    });

    it('should have streak when streakDays > 0', () => {
      const stats = new FocusStats(validProps);
      expect(stats.hasStreak()).toBe(true);
    });

    it('should not have streak when streakDays = 0', () => {
      const stats = new FocusStats({ ...validProps, streakDays: 0 });
      expect(stats.hasStreak()).toBe(false);
    });

    it('should be productive with good stats', () => {
      const stats = new FocusStats(validProps);
      expect(stats.isProductive()).toBe(true); // 25 min avg, 50 sessions
    });

    it('should not be productive with low avg session length', () => {
      const stats = new FocusStats({
        ...validProps,
        avgSessionLength: 15,
        totalSessions: 10,
      });
      expect(stats.isProductive()).toBe(false);
    });

    it('should not be productive with few sessions', () => {
      const stats = new FocusStats({
        ...validProps,
        totalSessions: 3,
        avgSessionLength: 30,
      });
      expect(stats.isProductive()).toBe(false);
    });

    it('should calculate streak levels correctly', () => {
      const none = new FocusStats({ ...validProps, streakDays: 0 });
      expect(none.getStreakLevel()).toBe('none');

      const bronze = new FocusStats({ ...validProps, streakDays: 3 });
      expect(bronze.getStreakLevel()).toBe('bronze');

      const silver = new FocusStats({ ...validProps, streakDays: 10 });
      expect(silver.getStreakLevel()).toBe('silver');

      const gold = new FocusStats({ ...validProps, streakDays: 20 });
      expect(gold.getStreakLevel()).toBe('gold');

      const platinum = new FocusStats({ ...validProps, streakDays: 35 });
      expect(platinum.getStreakLevel()).toBe('platinum');
    });
  });

  describe('toJSON', () => {
    it('should serialize all data correctly', () => {
      const stats = new FocusStats(validProps);
      const json = stats.toJSON();

      expect(json.totalSessions).toBe(50);
      expect(json.totalFocusMinutes).toBe(1250);
      expect(json.totalFocusHours).toBeCloseTo(20.8, 1);
      expect(json.avgSessionLength).toBe(25);
      expect(json.favoriteTrack).toBe('rain-soft');
      expect(json.preferredMode).toBe('pomodoro');
      expect(json.streakDays).toBe(7);
      expect(json.streakLevel).toBe('gold');
      expect(json.hasData).toBe(true);
      expect(json.hasStreak).toBe(true);
      expect(json.isProductive).toBe(true);
    });
  });

  describe('getters', () => {
    it('should expose all properties', () => {
      const stats = new FocusStats(validProps);
      expect(stats.totalSessions).toBe(50);
      expect(stats.totalFocusMinutes).toBe(1250);
      expect(stats.avgSessionLength).toBe(25);
      expect(stats.favoriteTrack).toBe('rain-soft');
      expect(stats.preferredMode).toBe('pomodoro');
      expect(stats.streakDays).toBe(7);
    });
  });
});
