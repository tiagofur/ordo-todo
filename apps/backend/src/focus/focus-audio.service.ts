import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

/**
 * Ambient audio track for focus sessions
 */
export interface AmbientTrack {
    id: string;
    name: string;
    description: string;
    category: 'nature' | 'cafe' | 'music' | 'white-noise' | 'binaural';
    iconEmoji: string;
    url: string;
    duration: number; // in seconds, 0 = looping
    isPremium: boolean;
}

/**
 * Focus session mode with settings
 */
export interface FocusMode {
    id: string;
    name: string;
    description: string;
    workDuration: number; // minutes
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
    recommendedTracks: string[]; // track IDs
}

/**
 * User's focus audio preferences
 */
export interface FocusAudioPreferences {
    favoriteTrackIds: string[];
    defaultVolume: number; // 0-100
    enableTransitions: boolean;
    preferredModeId: string | null;
}

/**
 * Focus session statistics
 */
export interface FocusSessionStats {
    totalSessions: number;
    totalFocusMinutes: number;
    avgSessionLength: number;
    favoriteTrack: string | null;
    preferredMode: string | null;
    streakDays: number;
}

@Injectable()
export class FocusAudioService {
    private readonly logger = new Logger(FocusAudioService.name);

    // Built-in ambient tracks (in production, these would be CDN URLs)
    private readonly AMBIENT_TRACKS: AmbientTrack[] = [
        // Nature sounds
        {
            id: 'rain-soft',
            name: 'Lluvia Suave',
            description: 'Sonido de lluvia relajante',
            category: 'nature',
            iconEmoji: '🌧️',
            url: '/audio/ambient/rain-soft.mp3',
            duration: 0, // loops
            isPremium: false,
        },
        {
            id: 'rain-thunder',
            name: 'Tormenta',
            description: 'Lluvia con truenos distantes',
            category: 'nature',
            iconEmoji: '⛈️',
            url: '/audio/ambient/rain-thunder.mp3',
            duration: 0,
            isPremium: false,
        },
        {
            id: 'forest',
            name: 'Bosque',
            description: 'Pájaros y brisa en el bosque',
            category: 'nature',
            iconEmoji: '🌲',
            url: '/audio/ambient/forest.mp3',
            duration: 0,
            isPremium: false,
        },
        {
            id: 'ocean-waves',
            name: 'Olas del Mar',
            description: 'Olas rompiendo en la playa',
            category: 'nature',
            iconEmoji: '🌊',
            url: '/audio/ambient/ocean-waves.mp3',
            duration: 0,
            isPremium: false,
        },
        {
            id: 'river-stream',
            name: 'Río',
            description: 'Corriente de agua suave',
            category: 'nature',
            iconEmoji: '🏞️',
            url: '/audio/ambient/river-stream.mp3',
            duration: 0,
            isPremium: false,
        },
        // Cafe/Urban
        {
            id: 'cafe-ambient',
            name: 'Cafetería',
            description: 'Ambiente de café con murmullos',
            category: 'cafe',
            iconEmoji: '☕',
            url: '/audio/ambient/cafe-ambient.mp3',
            duration: 0,
            isPremium: false,
        },
        {
            id: 'library',
            name: 'Biblioteca',
            description: 'Silencio con sonidos sutiles',
            category: 'cafe',
            iconEmoji: '📚',
            url: '/audio/ambient/library.mp3',
            duration: 0,
            isPremium: false,
        },
        // White noise
        {
            id: 'white-noise',
            name: 'Ruido Blanco',
            description: 'Ruido blanco puro',
            category: 'white-noise',
            iconEmoji: '📻',
            url: '/audio/ambient/white-noise.mp3',
            duration: 0,
            isPremium: false,
        },
        {
            id: 'pink-noise',
            name: 'Ruido Rosa',
            description: 'Frecuencias bajas relajantes',
            category: 'white-noise',
            iconEmoji: '🎵',
            url: '/audio/ambient/pink-noise.mp3',
            duration: 0,
            isPremium: false,
        },
        {
            id: 'brown-noise',
            name: 'Ruido Marrón',
            description: 'Profundo y envolvente',
            category: 'white-noise',
            iconEmoji: '🔊',
            url: '/audio/ambient/brown-noise.mp3',
            duration: 0,
            isPremium: false,
        },
        // Binaural beats (premium)
        {
            id: 'focus-binaural',
            name: 'Focus (Beta)',
            description: 'Ondas beta para concentración',
            category: 'binaural',
            iconEmoji: '🧠',
            url: '/audio/ambient/focus-binaural.mp3',
            duration: 0,
            isPremium: true,
        },
        {
            id: 'deep-work-binaural',
            name: 'Deep Work (Alpha)',
            description: 'Ondas alpha para trabajo profundo',
            category: 'binaural',
            iconEmoji: '💫',
            url: '/audio/ambient/deep-work-binaural.mp3',
            duration: 0,
            isPremium: true,
        },
        // Lo-fi music (premium)
        {
            id: 'lofi-beats',
            name: 'Lo-Fi Beats',
            description: 'Música lo-fi relajante',
            category: 'music',
            iconEmoji: '🎧',
            url: '/audio/ambient/lofi-beats.mp3',
            duration: 0,
            isPremium: true,
        },
    ];

    // Built-in focus modes
    private readonly FOCUS_MODES: FocusMode[] = [
        {
            id: 'pomodoro',
            name: 'Pomodoro Clásico',
            description: '25 min trabajo, 5 min descanso',
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLongBreak: 4,
            recommendedTracks: ['rain-soft', 'cafe-ambient', 'white-noise'],
        },
        {
            id: 'deep-work',
            name: 'Deep Work',
            description: '50 min trabajo, 10 min descanso',
            workDuration: 50,
            shortBreakDuration: 10,
            longBreakDuration: 30,
            sessionsBeforeLongBreak: 2,
            recommendedTracks: ['brown-noise', 'forest', 'deep-work-binaural'],
        },
        {
            id: 'flow',
            name: 'Flow State',
            description: '90 min trabajo, 20 min descanso',
            workDuration: 90,
            shortBreakDuration: 20,
            longBreakDuration: 45,
            sessionsBeforeLongBreak: 2,
            recommendedTracks: ['focus-binaural', 'river-stream', 'lofi-beats'],
        },
        {
            id: 'quick-sprint',
            name: 'Sprint Rápido',
            description: '15 min trabajo intenso',
            workDuration: 15,
            shortBreakDuration: 3,
            longBreakDuration: 10,
            sessionsBeforeLongBreak: 6,
            recommendedTracks: ['white-noise', 'focus-binaural'],
        },
        {
            id: 'ultradian',
            name: 'Ciclo Ultradiano',
            description: '90 min siguiendo ritmos naturales',
            workDuration: 90,
            shortBreakDuration: 20,
            longBreakDuration: 20,
            sessionsBeforeLongBreak: 1,
            recommendedTracks: ['ocean-waves', 'forest', 'river-stream'],
        },
    ];

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get all available ambient tracks
     */
    getAvailableTracks(includePremium = true): AmbientTrack[] {
        if (includePremium) {
            return this.AMBIENT_TRACKS;
        }
        return this.AMBIENT_TRACKS.filter((t) => !t.isPremium);
    }

    /**
     * Get tracks by category
     */
    getTracksByCategory(
        category: AmbientTrack['category'],
    ): AmbientTrack[] {
        return this.AMBIENT_TRACKS.filter((t) => t.category === category);
    }

    /**
     * Get a specific track by ID
     */
    getTrack(trackId: string): AmbientTrack | null {
        return this.AMBIENT_TRACKS.find((t) => t.id === trackId) || null;
    }

    /**
     * Get all available focus modes
     */
    getAvailableModes(): FocusMode[] {
        return this.FOCUS_MODES;
    }

    /**
     * Get a specific focus mode by ID
     */
    getMode(modeId: string): FocusMode | null {
        return this.FOCUS_MODES.find((m) => m.id === modeId) || null;
    }

    /**
     * Get user's favorite tracks
     */
    async getUserFavorites(userId: string): Promise<AmbientTrack[]> {
        const prefs = await this.getUserPreferences(userId);
        return this.AMBIENT_TRACKS.filter((t) =>
            prefs.favoriteTrackIds.includes(t.id),
        );
    }

    /**
     * Toggle a track as favorite
     */
    async toggleFavorite(
        userId: string,
        trackId: string,
    ): Promise<{ isFavorite: boolean }> {
        const prefs = await this.getUserPreferences(userId);
        const isFavorite = prefs.favoriteTrackIds.includes(trackId);

        if (isFavorite) {
            prefs.favoriteTrackIds = prefs.favoriteTrackIds.filter(
                (id) => id !== trackId,
            );
        } else {
            prefs.favoriteTrackIds.push(trackId);
        }

        await this.saveUserPreferences(userId, prefs);
        return { isFavorite: !isFavorite };
    }

    /**
     * Get user's audio preferences
     */
    async getUserPreferences(userId: string): Promise<FocusAudioPreferences> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });

        // Extract focus preferences from user preferences JSON
        const prefs = (user?.preferences as any)?.focusAudio;

        return {
            favoriteTrackIds: prefs?.favoriteTrackIds || [],
            defaultVolume: prefs?.defaultVolume ?? 50,
            enableTransitions: prefs?.enableTransitions ?? true,
            preferredModeId: prefs?.preferredModeId || null,
        };
    }

    /**
     * Save user's audio preferences
     */
    async saveUserPreferences(
        userId: string,
        prefs: Partial<FocusAudioPreferences>,
    ): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });

        const currentPrefs = (user?.preferences as any) || {};
        currentPrefs.focusAudio = {
            ...currentPrefs.focusAudio,
            ...prefs,
        };

        await this.prisma.user.update({
            where: { id: userId },
            data: { preferences: currentPrefs },
        });
    }

    /**
     * Record track usage for analytics
     */
    async recordTrackUsage(
        userId: string,
        trackId: string,
        durationMinutes: number,
    ): Promise<void> {
        this.logger.debug(
            `User ${userId} used track ${trackId} for ${durationMinutes} minutes`,
        );

        // Could store in a separate table for analytics
        // For now, just log it
    }

    /**
     * Get focus session statistics for a user
     */
    async getFocusStats(userId: string): Promise<FocusSessionStats> {
        // Get completed work sessions
        const sessions = await this.prisma.timeSession.findMany({
            where: {
                userId,
                type: 'WORK',
                duration: { not: null },
            },
            orderBy: { startedAt: 'desc' },
            take: 100,
        });

        const totalSessions = sessions.length;
        const totalMinutes = sessions.reduce(
            (sum, s) => sum + (s.duration || 0),
            0,
        );
        const avgSessionLength =
            totalSessions > 0 ? totalMinutes / totalSessions : 0;

        // Calculate streak (consecutive days with sessions)
        const streakDays = await this.calculateFocusStreak(userId);

        return {
            totalSessions,
            totalFocusMinutes: totalMinutes,
            avgSessionLength: Math.round(avgSessionLength),
            favoriteTrack: null, // Would need to track this separately
            preferredMode: null,
            streakDays,
        };
    }

    /**
     * Calculate consecutive days with focus sessions
     */
    private async calculateFocusStreak(userId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        const checkDate = new Date(today);

        for (let i = 0; i < 365; i++) {
            const dayStart = new Date(checkDate);
            const dayEnd = new Date(checkDate);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const hasSession = await this.prisma.timeSession.findFirst({
                where: {
                    userId,
                    type: 'WORK',
                    startedAt: { gte: dayStart, lt: dayEnd },
                    duration: { gte: 5 }, // At least 5 minutes
                },
            });

            if (hasSession) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Get recommended tracks based on time of day and user history
     */
    async getRecommendedTracks(userId: string): Promise<AmbientTrack[]> {
        const hour = new Date().getHours();
        const prefs = await this.getUserPreferences(userId);

        // Morning: energizing sounds
        if (hour >= 6 && hour < 12) {
            return this.AMBIENT_TRACKS.filter(
                (t) =>
                    t.category === 'cafe' ||
                    t.id === 'forest' ||
                    t.id === 'focus-binaural',
            );
        }

        // Afternoon: focus sounds
        if (hour >= 12 && hour < 17) {
            return this.AMBIENT_TRACKS.filter(
                (t) =>
                    t.category === 'white-noise' ||
                    t.id === 'rain-soft' ||
                    t.category === 'music',
            );
        }

        // Evening: calming sounds
        if (hour >= 17 && hour < 22) {
            return this.AMBIENT_TRACKS.filter(
                (t) =>
                    t.id === 'rain-soft' ||
                    t.id === 'ocean-waves' ||
                    t.id === 'river-stream',
            );
        }

        // Night: deep focus
        return this.AMBIENT_TRACKS.filter(
            (t) =>
                t.category === 'white-noise' ||
                t.id === 'brown-noise' ||
                t.category === 'binaural',
        );
    }
}
