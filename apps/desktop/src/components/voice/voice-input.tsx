import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@ordo-todo/ui';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { parseTaskInput } from '@/utils/smart-capture';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  onTranscript: (parsedData: ReturnType<typeof parseTaskInput>) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function VoiceInputButton({ 
  onTranscript, 
  className,
  variant = 'outline',
  size = 'default'
}: VoiceInputButtonProps) {
  const [finalTranscript, setFinalTranscript] = useState('');
  
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'es-ES',
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        setFinalTranscript(text);
      }
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
    },
  });

  useEffect(() => {
    if (finalTranscript && !isListening) {
      const parsed = parseTaskInput(finalTranscript);
      onTranscript(parsed);
      setFinalTranscript('');
      resetTranscript();
    }
  }, [finalTranscript, isListening, onTranscript, resetTranscript]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleToggle}
        className={cn(
          'relative',
          isListening && 'ring-2 ring-red-500 ring-offset-2',
          className
        )}
        title={isListening ? 'Detener grabación' : 'Iniciar captura por voz'}
      >
        {isListening ? (
          <>
            <Mic className="h-4 w-4 mr-2 animate-pulse text-red-500" />
            Escuchando...
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            Voz
          </>
        )}
      </Button>
      
      {isListening && interimTranscript && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-popover border border-border rounded-lg p-3 shadow-lg z-50 min-w-[300px]">
          <p className="text-sm text-muted-foreground mb-1">Transcribiendo...</p>
          <p className="text-sm font-medium">{interimTranscript}</p>
        </div>
      )}
    </div>
  );
}

interface VoiceInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (parsedData: ReturnType<typeof parseTaskInput>) => void;
}

export function VoiceInputDialog({ isOpen, onClose, onTranscript }: VoiceInputDialogProps) {
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'es-ES',
    continuous: false,
    interimResults: true,
  });

  useEffect(() => {
    if (isOpen && isSupported) {
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen, isSupported, startListening, stopListening]);

  useEffect(() => {
    if (transcript && !isListening && isOpen) {
      const parsed = parseTaskInput(transcript);
      onTranscript(parsed);
      resetTranscript();
      onClose();
    }
  }, [transcript, isListening, isOpen, onTranscript, onClose, resetTranscript]);

  if (!isOpen || !isSupported) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-6">
          <div className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center',
            isListening ? 'bg-red-500/10 animate-pulse' : 'bg-muted'
          )}>
            {isListening ? (
              <Mic className="h-12 w-12 text-red-500" />
            ) : (
              <MicOff className="h-12 w-12 text-muted-foreground" />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">
              {isListening ? 'Escuchando...' : 'Preparando...'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isListening 
                ? 'Describe tu tarea en voz alta' 
                : 'Iniciando reconocimiento de voz...'}
            </p>
          </div>

          {(transcript || interimTranscript) && (
            <div className="w-full bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">
                {interimTranscript || transcript}
              </p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            {isListening && (
              <Button
                variant="default"
                onClick={stopListening}
                className="flex-1"
              >
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
