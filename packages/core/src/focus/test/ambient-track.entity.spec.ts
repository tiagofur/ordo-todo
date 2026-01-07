import { AmbientTrack } from '../model/ambient-track.entity';

describe('AmbientTrack', () => {
  const validProps = {
    id: 'track-1',
    name: 'Lluvia Suave',
    description: 'Sonido de lluvia relajante',
    category: 'nature' as const,
    iconEmoji: '🌧️',
    url: '/audio/rain.mp3',
    duration: 0,
    isPremium: false,
  };

  describe('constructor', () => {
    it('should create a valid ambient track', () => {
      const track = new AmbientTrack(validProps);
      expect(track.id).toBe('track-1');
      expect(track.name).toBe('Lluvia Suave');
      expect(track.category).toBe('nature');
    });

    it('should throw error if name is empty', () => {
      expect(() => new AmbientTrack({ ...validProps, name: '' })).toThrow(
        'AmbientTrack name is required',
      );
    });

    it('should throw error if name is too long', () => {
      expect(
        () => new AmbientTrack({ ...validProps, name: 'a'.repeat(256) }),
      ).toThrow('AmbientTrack name must be 255 characters or less');
    });

    it('should throw error if description is empty', () => {
      expect(() => new AmbientTrack({ ...validProps, description: '' })).toThrow(
        'AmbientTrack description is required',
      );
    });

    it('should throw error if description is too long', () => {
      expect(
        () =>
          new AmbientTrack({ ...validProps, description: 'a'.repeat(1001) }),
      ).toThrow('AmbientTrack description must be 1000 characters or less');
    });

    it('should throw error if URL is empty', () => {
      expect(() => new AmbientTrack({ ...validProps, url: '' })).toThrow(
        'AmbientTrack URL is required',
      );
    });

    it('should throw error if duration is negative', () => {
      expect(() => new AmbientTrack({ ...validProps, duration: -1 })).toThrow(
        'AmbientTrack duration cannot be negative',
      );
    });

    it('should throw error if iconEmoji is empty', () => {
      expect(() => new AmbientTrack({ ...validProps, iconEmoji: '' })).toThrow(
        'AmbientTrack iconEmoji is required',
      );
    });
  });

  describe('business methods', () => {
    it('should identify looping tracks', () => {
      const track = new AmbientTrack({ ...validProps, duration: 0 });
      expect(track.isLooping()).toBe(true);
    });

    it('should identify non-looping tracks', () => {
      const track = new AmbientTrack({ ...validProps, duration: 300 });
      expect(track.isLooping()).toBe(false);
    });

    it('should calculate duration in minutes', () => {
      const track = new AmbientTrack({ ...validProps, duration: 300 }); // 5 minutes
      expect(track.getDurationInMinutes()).toBe(5);
    });

    it('should be accessible to free users for non-premium tracks', () => {
      const track = new AmbientTrack({ ...validProps, isPremium: false });
      expect(track.isAccessibleToUser(false)).toBe(true);
    });

    it('should be accessible to premium users for premium tracks', () => {
      const track = new AmbientTrack({ ...validProps, isPremium: true });
      expect(track.isAccessibleToUser(true)).toBe(true);
    });

    it('should not be accessible to free users for premium tracks', () => {
      const track = new AmbientTrack({ ...validProps, isPremium: true });
      expect(track.isAccessibleToUser(false)).toBe(false);
    });

    it('should match category correctly', () => {
      const track = new AmbientTrack({ ...validProps, category: 'nature' });
      expect(track.matchesCategory('nature')).toBe(true);
      expect(track.matchesCategory('cafe')).toBe(false);
    });

    it('should identify nature category', () => {
      const track = new AmbientTrack({ ...validProps, category: 'nature' });
      expect(track.isNature()).toBe(true);
      expect(track.isCafe()).toBe(false);
    });

    it('should identify cafe category', () => {
      const track = new AmbientTrack({ ...validProps, category: 'cafe' });
      expect(track.isCafe()).toBe(true);
      expect(track.isNature()).toBe(false);
    });

    it('should identify music category', () => {
      const track = new AmbientTrack({ ...validProps, category: 'music' });
      expect(track.isMusic()).toBe(true);
    });

    it('should identify white-noise category', () => {
      const track = new AmbientTrack({ ...validProps, category: 'white-noise' });
      expect(track.isWhiteNoise()).toBe(true);
    });

    it('should identify binaural category', () => {
      const track = new AmbientTrack({ ...validProps, category: 'binaural' });
      expect(track.isBinaural()).toBe(true);
    });
  });

  describe('getters', () => {
    it('should expose all properties', () => {
      const track = new AmbientTrack(validProps);
      expect(track.name).toBe('Lluvia Suave');
      expect(track.description).toBe('Sonido de lluvia relajante');
      expect(track.category).toBe('nature');
      expect(track.iconEmoji).toBe('🌧️');
      expect(track.url).toBe('/audio/rain.mp3');
      expect(track.duration).toBe(0);
      expect(track.isPremium).toBe(false);
    });
  });
});
