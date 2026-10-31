'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export interface UseSpeechRecognitionOptions {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onResult?: (transcript: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
}

/**
 * Reconocimiento de voz del design system (ODD 025 S10).
 *
 * Los callbacks viven en refs para que el efecto solo dependa de
 * [lang, continuous, interimResults]: con callbacks inline el consumidor
 * re-crea la instancia en cada render y aborta la escucha a mitad de
 * captura (bug del audit desktop).
 */
export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
    const {
        lang = 'es-ES',
        continuous = false,
        interimResults = true,
        onResult,
        onError,
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const onResultRef = useRef(onResult);
    const onErrorRef = useRef(onError);
    onResultRef.current = onResult;
    onErrorRef.current = onError;

    useEffect(() => {
        const SpeechRecognitionCtor =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognitionCtor);
        if (!SpeechRecognitionCtor) return;

        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            onErrorRef.current?.(event.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            let interimText = '';
            let finalText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (!result) continue;
                const text = result[0]?.transcript ?? '';

                if (result.isFinal) {
                    finalText += text;
                } else {
                    interimText += text;
                }
            }

            if (finalText) {
                setTranscript((prev) => prev + ' ' + finalText);
                onResultRef.current?.(finalText, true);
            }

            if (interimText) {
                setInterimTranscript(interimText);
                onResultRef.current?.(interimText, false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
            recognitionRef.current = null;
        };
    }, [lang, continuous, interimResults]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setInterimTranscript('');
            recognitionRef.current.start();
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isSupported,
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
    };
}
