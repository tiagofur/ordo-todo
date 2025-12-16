"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, ChevronDown, ChevronUp, Heart, Headphones } from 'lucide-react';
import { Button } from '@ordo-todo/ui';
import { cn } from '@/lib/utils';
import { useAmbientAudio, AmbientTrack } from '@/hooks/use-ambient-audio';

// Built-in tracks (matching backend)
const AMBIENT_TRACKS: AmbientTrack[] = [
  // Nature
  { id: 'rain-soft', name: 'Lluvia Suave', description: 'Sonido de lluvia relajante', category: 'nature', iconEmoji: '🌧️', url: '/audio/ambient/rain-soft.mp3', duration: 0, isPremium: false },
  { id: 'rain-thunder', name: 'Tormenta', description: 'Lluvia con truenos', category: 'nature', iconEmoji: '⛈️', url: '/audio/ambient/rain-thunder.mp3', duration: 0, isPremium: false },
  { id: 'forest', name: 'Bosque', description: 'Pájaros y brisa', category: 'nature', iconEmoji: '🌲', url: '/audio/ambient/forest.mp3', duration: 0, isPremium: false },
  { id: 'ocean-waves', name: 'Olas del Mar', description: 'Olas en la playa', category: 'nature', iconEmoji: '🌊', url: '/audio/ambient/ocean-waves.mp3', duration: 0, isPremium: false },
  { id: 'river-stream', name: 'Río', description: 'Corriente suave', category: 'nature', iconEmoji: '🏞️', url: '/audio/ambient/river-stream.mp3', duration: 0, isPremium: false },
  // Cafe
  { id: 'cafe-ambient', name: 'Cafetería', description: 'Ambiente de café', category: 'cafe', iconEmoji: '☕', url: '/audio/ambient/cafe-ambient.mp3', duration: 0, isPremium: false },
  { id: 'library', name: 'Biblioteca', description: 'Silencio sutil', category: 'cafe', iconEmoji: '📚', url: '/audio/ambient/library.mp3', duration: 0, isPremium: false },
  // White noise
  { id: 'white-noise', name: 'Ruido Blanco', description: 'Ruido blanco puro', category: 'white-noise', iconEmoji: '📻', url: '/audio/ambient/white-noise.mp3', duration: 0, isPremium: false },
  { id: 'pink-noise', name: 'Ruido Rosa', description: 'Frecuencias relajantes', category: 'white-noise', iconEmoji: '🎵', url: '/audio/ambient/pink-noise.mp3', duration: 0, isPremium: false },
  { id: 'brown-noise', name: 'Ruido Marrón', description: 'Profundo y envolvente', category: 'white-noise', iconEmoji: '🔊', url: '/audio/ambient/brown-noise.mp3', duration: 0, isPremium: false },
  // Premium
  { id: 'focus-binaural', name: 'Focus (Beta)', description: 'Ondas beta', category: 'binaural', iconEmoji: '🧠', url: '/audio/ambient/focus-binaural.mp3', duration: 0, isPremium: true },
  { id: 'lofi-beats', name: 'Lo-Fi Beats', description: 'Música lo-fi', category: 'music', iconEmoji: '🎧', url: '/audio/ambient/lofi-beats.mp3', duration: 0, isPremium: true },
];

const CATEGORIES = [
  { id: 'nature', name: 'Naturaleza', emoji: '🌿' },
  { id: 'cafe', name: 'Ambiente', emoji: '☕' },
  { id: 'white-noise', name: 'Ruido', emoji: '📻' },
  { id: 'binaural', name: 'Binaural', emoji: '🧠' },
  { id: 'music', name: 'Música', emoji: '🎵' },
];

interface AmbientAudioPlayerProps {
  className?: string;
  compact?: boolean;
}

export function AmbientAudioPlayer({ className, compact = false }: AmbientAudioPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const { currentTrack, isPlaying, volume, isLoading, error, play, togglePlay, stop, setVolume } = useAmbientAudio();

  const filteredTracks = selectedCategory 
    ? AMBIENT_TRACKS.filter(t => t.category === selectedCategory)
    : AMBIENT_TRACKS;

  const toggleFavorite = (trackId: string) => {
    setFavorites(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "relative h-10 w-10 rounded-full transition-all",
            isPlaying && "bg-primary/10 text-primary"
          )}
        >
          <Headphones className="h-5 w-5" />
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </Button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              {currentTrack ? (
                <>
                  <span className="text-sm whitespace-nowrap">{currentTrack.iconEmoji} {currentTrack.name}</span>
                  <Button variant="ghost" size="sm" onClick={togglePlay}>
                    {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </>
              ) : (
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sin audio</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("bg-card/50 backdrop-blur-sm rounded-2xl border p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
            isPlaying ? "bg-primary/20 text-primary" : "bg-muted"
          )}>
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Ambiente Sonoro</h3>
            <p className="text-sm text-muted-foreground">
              {currentTrack ? `${currentTrack.iconEmoji} ${currentTrack.name}` : 'Selecciona un sonido'}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>

      {/* Volume Control */}
      {currentTrack && (
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={togglePlay}
          >
            {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
          
          <span className="text-sm text-muted-foreground w-10 text-right">{volume}%</span>
        </div>
      )}

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedCategory === null ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Button>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.emoji} {cat.name}
                </Button>
              ))}
            </div>

            {/* Track List */}
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {filteredTracks.map(track => (
                <button
                  key={track.id}
                  onClick={() => play(track)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                    "hover:bg-accent/50",
                    currentTrack?.id === track.id && isPlaying && "bg-primary/10 border border-primary/20",
                    track.isPremium && "opacity-60"
                  )}
                  disabled={track.isPremium}
                >
                  <span className="text-2xl">{track.iconEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{track.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className="shrink-0"
                  >
                    <Heart className={cn(
                      "h-4 w-4 transition-colors",
                      favorites.includes(track.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )} />
                  </button>
                </button>
              ))}
            </div>

            {/* Stop Button */}
            {currentTrack && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={stop}
              >
                Detener Audio
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
