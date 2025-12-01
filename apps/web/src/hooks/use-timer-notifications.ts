import { useCallback, useEffect, useRef } from "react";

interface NotificationOptions {
    soundEnabled: boolean;
    notificationsEnabled: boolean;
}

export function useTimerNotifications({ soundEnabled, notificationsEnabled }: NotificationOptions) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const notificationPermission = useRef<NotificationPermission>("default");

    // Request notification permission on mount
    useEffect(() => {
        if (notificationsEnabled && "Notification" in window) {
            Notification.requestPermission().then(permission => {
                notificationPermission.current = permission;
            });
        }
    }, [notificationsEnabled]);

    // Initialize audio context
    useEffect(() => {
        if (soundEnabled && !audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, [soundEnabled]);

    // Play sound using Web Audio API
    const playSound = useCallback((frequency: number = 440, duration: number = 200) => {
        if (!soundEnabled || !audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000);
    }, [soundEnabled]);

    // Play success sound (two tones)
    const playSuccessSound = useCallback(() => {
        playSound(523.25, 150); // C5
        setTimeout(() => playSound(659.25, 150), 150); // E5
    }, [playSound]);

    // Show browser notification
    const showNotification = useCallback((title: string, body: string, icon?: string) => {
        if (!notificationsEnabled || !("Notification" in window)) return;

        if (notificationPermission.current === "granted") {
            new Notification(title, {
                body,
                icon: icon || "/icon-192.png",
                badge: "/icon-96.png",
                tag: "ordo-timer",
                requireInteraction: false,
                silent: !soundEnabled, // Use browser sound if our sound is disabled
            });
        }
    }, [notificationsEnabled, soundEnabled]);

    // Notify session complete
    const notifySessionComplete = useCallback((sessionType: "WORK" | "SHORT_BREAK" | "LONG_BREAK" | "CONTINUOUS") => {
        const messages = {
            WORK: {
                title: "🍅 Pomodoro Completado!",
                body: "Excelente trabajo! Hora de tomar un descanso.",
            },
            SHORT_BREAK: {
                title: "☕ Descanso Terminado",
                body: "Descanso corto completado. Listo para el siguiente Pomodoro?",
            },
            LONG_BREAK: {
                title: "🎉 Descanso Largo Terminado",
                body: "Gran trabajo! Estás listo para continuar?",
            },
            CONTINUOUS: {
                title: "⏱️ Sesión Terminada",
                body: "Sesión de tiempo corrido finalizada.",
            },
        };

        const { title, body } = messages[sessionType];

        // Play sound
        if (soundEnabled) {
            playSuccessSound();
        }

        // Show notification
        if (notificationsEnabled) {
            showNotification(title, body);
        }
    }, [soundEnabled, notificationsEnabled, playSuccessSound, showNotification]);

    // Notify auto-start
    const notifyAutoStart = useCallback((sessionType: "WORK" | "SHORT_BREAK" | "LONG_BREAK" | "CONTINUOUS") => {
        const messages = {
            WORK: {
                title: "▶️ Iniciando Pomodoro",
                body: "El siguiente Pomodoro ha iniciado automáticamente.",
            },
            SHORT_BREAK: {
                title: "▶️ Iniciando Descanso Corto",
                body: "Es hora de un descanso corto.",
            },
            LONG_BREAK: {
                title: "▶️ Iniciando Descanso Largo",
                body: "Es hora de un descanso largo. Te lo mereces!",
            },
            CONTINUOUS: {
                title: "▶️ Iniciando Cronómetro",
                body: "El cronómetro ha iniciado.",
            },
        };

        const { title, body } = messages[sessionType];

        // Light sound for auto-start
        if (soundEnabled) {
            playSound(440, 100);
        }

        // Show notification
        if (notificationsEnabled) {
            showNotification(title, body);
        }
    }, [soundEnabled, notificationsEnabled, playSound, showNotification]);

    return {
        notifySessionComplete,
        notifyAutoStart,
        playSound,
        playSuccessSound,
        showNotification,
    };
}
