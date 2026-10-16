"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getAmbientSynthesizer,
  isSynthesizable,
} from '@/lib/audio/ambient-synthesizer';

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
  const { onTrackEnd, crossfadeDuration = 1200 } = options;

  const [currentTrack, setCurrentTrack] = useState<AmbientTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTrackEndRef = useRef(onTrackEnd);
  const isMountedRef = useRef(true);

  useEffect(() => {
    onTrackEndRef.current = onTrackEnd;
  }, [onTrackEnd]);

  // Initialize volume from localStorage and setup HTMLAudio fallback
  useEffect(() => {
    isMountedRef.current = true;

    if (typeof window !== 'undefined') {
      const savedVol = localStorage.getItem('ordo-ambient-volume');
      if (savedVol !== null) {
        const parsed = parseInt(savedVol, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          setVolumeState(parsed);
          getAmbientSynthesizer().setVolume(parsed);
        }
      }

      const audio = new Audio();
      audio.loop = true;
      audio.volume = (savedVol ? parseInt(savedVol, 10) : 50) / 100;

      audio.addEventListener('ended', () => {
        onTrackEndRef.current?.();
      });

      audio.addEventListener('error', () => {
        if (isMountedRef.current) {
          setError('Error loading audio');
          setIsLoading(false);
        }
      });

      audio.addEventListener('canplaythrough', () => {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      });

      audioRef.current = audio;
    }

    return () => {
      isMountedRef.current = false;
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      const synth = getAmbientSynthesizer();
      if (synth.isPlaying()) {
        void synth.stop(200);
      }
    };
  }, []);

  // HTML Audio Fade In
  const fadeInHtmlAudio = useCallback(() => {
    if (!audioRef.current) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

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
          fadeIntervalRef.current = null;
        }
      }
    }, stepDuration);
  }, [volume, crossfadeDuration]);

  // HTML Audio Fade Out
  const fadeOutHtmlAudio = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

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
        audioRef.current.volume = Math.max(startVolume - volumeStep * currentStep, 0);

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          audioRef.current.pause();
          resolve();
        }
      }, stepDuration);
    });
  }, [crossfadeDuration]);

  // Play a track
  const play = useCallback(
    async (track: AmbientTrack) => {
      setError(null);
      setIsLoading(true);

      const synth = getAmbientSynthesizer();

      try {
        if (isSynthesizable(track.id)) {
          // Stop any HTML Audio element that might be running
          if (audioRef.current && !audioRef.current.paused) {
            await fadeOutHtmlAudio();
            audioRef.current.src = '';
          }

          synth.setVolume(volume);
          await synth.play(track.id, crossfadeDuration);

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('ordo-ambient-last-track', track.id);
            } catch {
              // Ignore
            }
          }

          setCurrentTrack(track);
          setIsPlaying(true);
          setIsLoading(false);
        } else {
          // Fallback to HTMLAudioElement for custom remote URLs
          if (synth.isPlaying()) {
            await synth.stop(crossfadeDuration / 2);
          }

          if (audioRef.current) {
            if (isPlaying) {
              await fadeOutHtmlAudio();
            }
            audioRef.current.src = track.url;
            await audioRef.current.play();
            fadeInHtmlAudio();
            setCurrentTrack(track);
            setIsPlaying(true);
            setIsLoading(false);
          }
        }
      } catch (err) {
        setError('Failed to play audio');
        setIsLoading(false);
      }
    },
    [volume, crossfadeDuration, isPlaying, fadeOutHtmlAudio, fadeInHtmlAudio],
  );

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (!currentTrack) return;

    const synth = getAmbientSynthesizer();

    if (isPlaying) {
      if (isSynthesizable(currentTrack.id)) {
        await synth.stop(crossfadeDuration / 2);
      } else {
        await fadeOutHtmlAudio();
      }
      setIsPlaying(false);
    } else {
      try {
        if (isSynthesizable(currentTrack.id)) {
          synth.setVolume(volume);
          await synth.play(currentTrack.id, crossfadeDuration);
          setIsPlaying(true);
        } else if (audioRef.current) {
          await audioRef.current.play();
          fadeInHtmlAudio();
          setIsPlaying(true);
        }
      } catch (err) {
        setError('Failed to play audio');
      }
    }
  }, [currentTrack, isPlaying, volume, crossfadeDuration, fadeOutHtmlAudio, fadeInHtmlAudio]);

  // Stop playback completely
  const stop = useCallback(async () => {
    const synth = getAmbientSynthesizer();
    if (synth.isPlaying()) {
      await synth.stop(crossfadeDuration / 2);
    }
    if (audioRef.current && !audioRef.current.paused) {
      await fadeOutHtmlAudio();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  }, [crossfadeDuration, fadeOutHtmlAudio]);

  // Change volume
  const setVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(100, newVolume));
    setVolumeState(clamped);

    getAmbientSynthesizer().setVolume(clamped);

    if (audioRef.current) {
      audioRef.current.volume = clamped / 100;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ordo-ambient-volume', String(clamped));
      } catch {
        // Ignore quota errors
      }
    }
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
    setVolume,
  };
}
