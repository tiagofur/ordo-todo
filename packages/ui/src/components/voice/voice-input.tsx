'use client';

import { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '../ui/button.js';
import { useSpeechRecognition } from '../../hooks/use-speech-recognition.js';
import { cn } from '../../utils/index.js';

export interface VoiceInputButtonLabels {
  start?: string;
  stop?: string;
  listening?: string;
  transcribing?: string;
}

interface VoiceInputButtonProps {
  /** Texto final transcrito (sin interpretar: el consumidor decide). */
  onTranscript: (text: string) => void;
  /** BCP-47 del reconocimiento; el consumidor pasa la locale de la app. */
  lang?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  labels?: VoiceInputButtonLabels;
  /** Muestra el texto junto al micrófono (por defecto solo icono). */
  showLabel?: boolean;
}

/**
 * Botón de dictado del design system (ODD 025 S10). Se auto-oculta si el
 * navegador no soporta SpeechRecognition y entrega el texto final por
 * `onTranscript` — el parseo de lenguaje natural es responsabilidad del
 * consumidor.
 */
export function VoiceInputButton({
  onTranscript,
  lang = 'es-ES',
  className,
  variant = 'outline',
  size = 'default',
  labels,
  showLabel = true,
}: VoiceInputButtonProps) {
  const [finalTranscript, setFinalTranscript] = useState('');

  const {
    isSupported,
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang,
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal) setFinalTranscript(text);
    },
  });

  useEffect(() => {
    if (finalTranscript && !isListening) {
      onTranscript(finalTranscript.trim());
      setFinalTranscript('');
      resetTranscript();
    }
  }, [finalTranscript, isListening, onTranscript, resetTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={isListening ? stopListening : startListening}
        className={cn(
          'relative',
          isListening && 'ring-2 ring-red-500 ring-offset-2',
          className,
        )}
        title={isListening ? (labels?.stop ?? 'Detener grabación') : (labels?.start ?? 'Captura por voz')}
      >
        <Mic className={cn('h-4 w-4', isListening && 'animate-pulse text-red-500', showLabel && 'mr-2')} />
        {showLabel && (
          <span>{isListening ? (labels?.listening ?? 'Escuchando...') : (labels?.start ?? 'Voz')}</span>
        )}
      </Button>

      {isListening && interimTranscript && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-popover border border-border rounded-lg p-3 shadow-lg z-50 min-w-[300px]">
          <p className="text-sm text-muted-foreground mb-1">
            {labels?.transcribing ?? 'Transcribiendo...'}
          </p>
          <p className="text-sm font-medium">{interimTranscript}</p>
        </div>
      )}
    </div>
  );
}
