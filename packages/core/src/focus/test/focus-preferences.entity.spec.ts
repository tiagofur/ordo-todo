import { FocusPreferences } from '../model/focus-preferences.entity';

describe('FocusPreferences', () => {
  const validProps = {
    id: 'prefs',
    userId: 'user-1',
    favoriteTrackIds: ['track-1', 'track-2'],
    defaultVolume: 75,
    enableTransitions: true,
    preferredModeId: 'pomodoro',
  };

  describe('constructor', () => {
    it('should create valid focus preferences', () => {
      const prefs = new FocusPreferences(validProps);
      expect(prefs.userId).toBe('user-1');
      expect(prefs.defaultVolume).toBe(75);
    });

    it('should throw error if userId is empty', () => {
      expect(() => new FocusPreferences({ ...validProps, userId: '' })).toThrow(
        'FocusPreferences userId is required',
      );
    });

    it('should throw error if volume is out of range', () => {
      expect(() => new FocusPreferences({ ...validProps, defaultVolume: -1 })).toThrow(
        'FocusPreferences defaultVolume must be between 0 and 100',
      );
      expect(() => new FocusPreferences({ ...validProps, defaultVolume: 101 })).toThrow(
        'FocusPreferences defaultVolume must be between 0 and 100',
      );
    });

    it('should throw error if favoriteTrackIds is not an array', () => {
      expect(
        () =>
          new FocusPreferences({
            ...validProps,
            favoriteTrackIds: null as unknown as string[],
          }),
      ).toThrow('FocusPreferences favoriteTrackIds must be an array');
    });
  });

  describe('create factory', () => {
    it('should create default preferences', () => {
      const prefs = FocusPreferences.create('user-1');
      expect(prefs.userId).toBe('user-1');
      expect(prefs.defaultVolume).toBe(50);
      expect(prefs.enableTransitions).toBe(true);
      expect(prefs.preferredModeId).toBeNull();
      expect(prefs.favoriteTrackIds).toEqual([]);
    });
  });

  describe('business methods', () => {
    it('should add favorite track', () => {
      const prefs = new FocusPreferences(validProps);
      const updated = prefs.addFavorite('track-3');
      expect(updated.favoriteTrackIds).toContain('track-3');
      expect(updated.favoriteTrackIds).toHaveLength(3);
    });

    it('should not add duplicate favorite track', () => {
      const prefs = new FocusPreferences(validProps);
      const updated = prefs.addFavorite('track-1');
      expect(updated.favoriteTrackIds).toHaveLength(2);
      expect(updated).toBe(prefs); // Returns same instance if already favorited
    });

    it('should remove favorite track', () => {
      const prefs = new FocusPreferences(validProps);
      const updated = prefs.removeFavorite('track-1');
      expect(updated.favoriteTrackIds).not.toContain('track-1');
      expect(updated.favoriteTrackIds).toHaveLength(1);
    });

    it('should toggle favorite track from not favorited to favorited', () => {
      const prefs = new FocusPreferences({
        ...validProps,
        favoriteTrackIds: [],
      });
      const updated = prefs.toggleFavorite('track-1');
      expect(updated.isFavorite('track-1')).toBe(true);
    });

    it('should toggle favorite track from favorited to not favorited', () => {
      const prefs = new FocusPreferences(validProps);
      const updated = prefs.toggleFavorite('track-1');
      expect(updated.isFavorite('track-1')).toBe(false);
    });

    it('should check if track is favorited', () => {
      const prefs = new FocusPreferences(validProps);
      expect(prefs.isFavorite('track-1')).toBe(true);
      expect(prefs.isFavorite('track-3')).toBe(false);
    });

    it('should update volume', () => {
      const prefs = new FocusPreferences(validProps);
      const updated = prefs.updateVolume(50);
      expect(updated.defaultVolume).toBe(50);
    });

    it('should throw error when updating volume to invalid value', () => {
      const prefs = new FocusPreferences(validProps);
      expect(() => prefs.updateVolume(-1)).toThrow('Volume must be between 0 and 100');
      expect(() => prefs.updateVolume(101)).toThrow('Volume must be between 0 and 100');
    });

    it('should set transitions enabled', () => {
      const prefs = new FocusPreferences(validProps);
      const updated = prefs.setTransitionsEnabled(false);
      expect(updated.enableTransitions).toBe(false);
    });

    it('should set preferred mode', () => {
      const prefs = new FocusPreferences({
        ...validProps,
        preferredModeId: null,
      });
      const updated = prefs.setPreferredMode('deep-work');
      expect(updated.preferredModeId).toBe('deep-work');
    });

    it('should clear preferred mode', () => {
      const prefs = new FocusPreferences(validProps);
      const updated = prefs.setPreferredMode(null);
      expect(updated.preferredModeId).toBeNull();
    });

    it('should check if has preferred mode', () => {
      const prefsWithMode = new FocusPreferences(validProps);
      expect(prefsWithMode.hasPreferredMode()).toBe(true);

      const prefsWithoutMode = new FocusPreferences({
        ...validProps,
        preferredModeId: null,
      });
      expect(prefsWithoutMode.hasPreferredMode()).toBe(false);
    });

    it('should count favorite tracks', () => {
      const prefs = new FocusPreferences(validProps);
      expect(prefs.getFavoriteCount()).toBe(2);
    });
  });

  describe('getters', () => {
    it('should expose all properties', () => {
      const prefs = new FocusPreferences(validProps);
      expect(prefs.userId).toBe('user-1');
      expect(prefs.defaultVolume).toBe(75);
      expect(prefs.enableTransitions).toBe(true);
      expect(prefs.preferredModeId).toBe('pomodoro');
    });

    it('should return a copy of favoriteTrackIds', () => {
      const prefs = new FocusPreferences(validProps);
      const favorites1 = prefs.favoriteTrackIds;
      const favorites2 = prefs.favoriteTrackIds;
      expect(favorites1).not.toBe(favorites2); // Different references
      expect(favorites1).toEqual(favorites2); // Same values
    });
  });
});
