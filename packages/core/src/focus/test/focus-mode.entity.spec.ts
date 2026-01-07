import { FocusMode } from '../model/focus-mode.entity';

describe('FocusMode', () => {
  const validProps = {
    id: 'pomodoro',
    name: 'Pomodoro Clásico',
    description: '25 min trabajo, 5 min descanso',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    recommendedTrackIds: ['rain-soft', 'cafe-ambient'],
  };

  describe('constructor', () => {
    it('should create a valid focus mode', () => {
      const mode = new FocusMode(validProps);
      expect(mode.id).toBe('pomodoro');
      expect(mode.name).toBe('Pomodoro Clásico');
      expect(mode.workDuration).toBe(25);
    });

    it('should throw error if name is empty', () => {
      expect(() => new FocusMode({ ...validProps, name: '' })).toThrow(
        'FocusMode name is required',
      );
    });

    it('should throw error if name is too long', () => {
      expect(
        () => new FocusMode({ ...validProps, name: 'a'.repeat(101) }),
      ).toThrow('FocusMode name must be 100 characters or less');
    });

    it('should throw error if description is empty', () => {
      expect(() => new FocusMode({ ...validProps, description: '' })).toThrow(
        'FocusMode description is required',
      );
    });

    it('should throw error if description is too long', () => {
      expect(
        () => new FocusMode({ ...validProps, description: 'a'.repeat(501) }),
      ).toThrow('FocusMode description must be 500 characters or less');
    });

    it('should throw error if workDuration is out of range', () => {
      expect(() => new FocusMode({ ...validProps, workDuration: 0 })).toThrow(
        'FocusMode workDuration must be between 1 and 180 minutes',
      );
      expect(() => new FocusMode({ ...validProps, workDuration: 181 })).toThrow(
        'FocusMode workDuration must be between 1 and 180 minutes',
      );
    });

    it('should throw error if shortBreakDuration is out of range', () => {
      expect(
        () => new FocusMode({ ...validProps, shortBreakDuration: 0 }),
      ).toThrow('FocusMode shortBreakDuration must be between 1 and 60 minutes');
    });

    it('should throw error if longBreakDuration is out of range', () => {
      expect(
        () => new FocusMode({ ...validProps, longBreakDuration: 0 }),
      ).toThrow('FocusMode longBreakDuration must be between 1 and 120 minutes');
    });

    it('should throw error if sessionsBeforeLongBreak is out of range', () => {
      expect(
        () => new FocusMode({ ...validProps, sessionsBeforeLongBreak: 0 }),
      ).toThrow('FocusMode sessionsBeforeLongBreak must be between 1 and 10');
    });
  });

  describe('business methods', () => {
    it('should calculate total cycle time correctly', () => {
      const mode = new FocusMode(validProps); // 25 + 5 = 30
      expect(mode.getTotalCycleTime()).toBe(30);
    });

    it('should calculate total cycle time with long break correctly', () => {
      const mode = new FocusMode(validProps);
      // (25 * 4) + (5 * 3) + 15 = 100 + 15 + 15 = 130
      expect(mode.getTotalCycleTimeWithLongBreak()).toBe(130);
    });

    it('should identify long break sessions', () => {
      const mode = new FocusMode({ ...validProps, sessionsBeforeLongBreak: 4 });
      expect(mode.isLongBreakSession(4)).toBe(true);
      expect(mode.isLongBreakSession(8)).toBe(true);
      expect(mode.isLongBreakSession(3)).toBe(false);
    });

    it('should calculate expected session duration correctly', () => {
      const mode = new FocusMode(validProps);
      expect(mode.getExpectedSessionDuration(1)).toBe(25); // Work
      expect(mode.getExpectedSessionDuration(2)).toBe(5); // Short break
      expect(mode.getExpectedSessionDuration(3)).toBe(25); // Work
      expect(mode.getExpectedSessionDuration(4)).toBe(15); // Long break
    });

    it('should check if track is recommended', () => {
      const mode = new FocusMode(validProps);
      expect(mode.hasRecommendedTrack('rain-soft')).toBe(true);
      expect(mode.hasRecommendedTrack('other-track')).toBe(false);
    });

    it('should identify intensive modes', () => {
      const mode = new FocusMode({ ...validProps, workDuration: 50 });
      expect(mode.isIntensive()).toBe(true);
    });

    it('should identify light modes', () => {
      const mode = new FocusMode({ ...validProps, workDuration: 25 });
      expect(mode.isLight()).toBe(true);
    });

    it('should not identify light mode if workDuration > 25', () => {
      const mode = new FocusMode({ ...validProps, workDuration: 30 });
      expect(mode.isLight()).toBe(false);
    });
  });

  describe('getters', () => {
    it('should expose all properties', () => {
      const mode = new FocusMode(validProps);
      expect(mode.name).toBe('Pomodoro Clásico');
      expect(mode.description).toBe('25 min trabajo, 5 min descanso');
      expect(mode.workDuration).toBe(25);
      expect(mode.shortBreakDuration).toBe(5);
      expect(mode.longBreakDuration).toBe(15);
      expect(mode.sessionsBeforeLongBreak).toBe(4);
      expect(mode.recommendedTrackIds).toEqual(['rain-soft', 'cafe-ambient']);
    });

    it('should return a copy of recommendedTrackIds', () => {
      const mode = new FocusMode(validProps);
      const tracks1 = mode.recommendedTrackIds;
      const tracks2 = mode.recommendedTrackIds;
      expect(tracks1).not.toBe(tracks2); // Different references
      expect(tracks1).toEqual(tracks2); // Same values
    });
  });
});
