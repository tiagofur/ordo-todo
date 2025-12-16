"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export interface AmbientTrack {
    id: string;
    name: string;
    description: string;
    category: 'nature' | 'cafe' | 'music' | 'white-noise' | 'binaural';
    iconEmoji: string;
    url: string;
    duration: number;
    isPremium: boolean;
}

interface UseAmbientAudioOptions {
    onTrackEnd?: () => void;
    crossfadeDuration?: number;
}

export function useAmbientAudio(options: UseAmbientAudioOptions = {}) {
    const { onTrackEnd, crossfadeDuration = 2000 } = options;

    const [currentTrack, setCurrentTrack] = useState<AmbientTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize audio element
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
            audioRef.current.volume = volume / 100;

            audioRef.current.addEventListener('ended', () => {
                onTrackEnd?.();
            });

            audioRef.current.addEventListener('error', (e) => {
                setError('Error loading audio');
                setIsLoading(false);
            });

            audioRef.current.addEventListener('canplaythrough', () => {
                setIsLoading(false);
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
            }
        };
    }, [onTrackEnd, volume]);

    // Update volume when it changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    // Fade in audio
    const fadeIn = useCallback(() => {
        if (!audioRef.current) return;

        const targetVolume = volume / 100;
        audioRef.current.volume = 0;

        const steps = 20;
        const stepDuration = crossfadeDuration / steps;
        const volumeStep = targetVolume / steps;
        let currentStep = 0;

        fadeIntervalRef.current = setInterval(() => {
            if (!audioRef.current) return;
            currentStep++;
            audioRef.current.volume = Math.min(volumeStep * currentStep, targetVolume);

            if (currentStep >= steps) {
                if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current);
                }
            }
        }, stepDuration);
    }, [volume, crossfadeDuration]);

    // Fade out audio
    const fadeOut = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            if (!audioRef.current || audioRef.current.volume === 0) {
                resolve();
                return;
            }

            const startVolume = audioRef.current.volume;
            const steps = 20;
            const stepDuration = crossfadeDuration / steps;
            const volumeStep = startVolume / steps;
            let currentStep = 0;

            fadeIntervalRef.current = setInterval(() => {
                if (!audioRef.current) {
                    resolve();
                    return;
                }
                currentStep++;
                audioRef.current.volume = Math.max(startVolume - (volumeStep * currentStep), 0);

                if (currentStep >= steps) {
                    if (fadeIntervalRef.current) {
                        clearInterval(fadeIntervalRef.current);
                    }
                    audioRef.current.pause();
                    resolve();
                }
            }, stepDuration);
        });
    }, [crossfadeDuration]);

    // Play a track
    const play = useCallback(async (track: AmbientTrack) => {
        if (!audioRef.current) return;

        setError(null);
        setIsLoading(true);

        // Fade out current track if playing
        if (isPlaying) {
            await fadeOut();
        }

        // Set new track
        setCurrentTrack(track);
        audioRef.current.src = track.url;

        try {
            await audioRef.current.play();
            fadeIn();
            setIsPlaying(true);
        } catch (err) {
            setError('Failed to play audio');
            setIsLoading(false);
        }
    }, [isPlaying, fadeOut, fadeIn]);

    // Toggle play/pause
    const togglePlay = useCallback(async () => {
        if (!audioRef.current || !currentTrack) return;

        if (isPlaying) {
            await fadeOut();
            setIsPlaying(false);
        } else {
            try {
                await audioRef.current.play();
                fadeIn();
                setIsPlaying(true);
            } catch (err) {
                setError('Failed to play audio');
            }
        }
    }, [currentTrack, isPlaying, fadeOut, fadeIn]);

    // Stop playback
    const stop = useCallback(async () => {
        await fadeOut();
        setIsPlaying(false);
        setCurrentTrack(null);
        if (audioRef.current) {
            audioRef.current.src = '';
        }
    }, [fadeOut]);

    // Change volume
    const changeVolume = useCallback((newVolume: number) => {
        setVolume(Math.max(0, Math.min(100, newVolume)));
    }, []);

    return {
        currentTrack,
        isPlaying,
        volume,
        isLoading,
        error,
        play,
        togglePlay,
        stop,
        setVolume: changeVolume,
    };
}
