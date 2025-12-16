"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "@/i18n/navigation";

interface Shortcut {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
    category: string;
}

interface UseKeyboardShortcutsOptions {
    enabled?: boolean;
    onSearchOpen?: () => void;
    onNewTask?: () => void;
    onNewProject?: () => void;
    onToggleSidebar?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
    const {
        enabled = true,
        onSearchOpen,
        onNewTask,
        onNewProject,
        onToggleSidebar,
    } = options;

    const router = useRouter();
    const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

    const shortcuts: Shortcut[] = [
        // Navigation
        {
            key: "g",
            ctrl: true,
            action: () => router.push("/dashboard"),
            description: "Ir a Dashboard",
            category: "Navegación",
        },
        {
            key: "t",
            ctrl: true,
            shift: true,
            action: () => router.push("/tasks"),
            description: "Ir a Tareas",
            category: "Navegación",
        },
        {
            key: "p",
            ctrl: true,
            shift: true,
            action: () => router.push("/projects"),
            description: "Ir a Proyectos",
            category: "Navegación",
        },
        {
            key: ",",
            ctrl: true,
            action: () => router.push("/settings"),
            description: "Ir a Settings",
            category: "Navegación",
        },
        // Search
        {
            key: "k",
            ctrl: true,
            action: () => onSearchOpen?.(),
            description: "Abrir búsqueda",
            category: "Búsqueda",
        },
        {
            key: "k",
            meta: true,
            action: () => onSearchOpen?.(),
            description: "Abrir búsqueda (Mac)",
            category: "Búsqueda",
        },
        // Creation
        {
            key: "n",
            ctrl: true,
            action: () => onNewTask?.(),
            description: "Nueva tarea",
            category: "Creación",
        },
        {
            key: "n",
            ctrl: true,
            shift: true,
            action: () => onNewProject?.(),
            description: "Nuevo proyecto",
            category: "Creación",
        },
        // UI
        {
            key: "b",
            ctrl: true,
            action: () => onToggleSidebar?.(),
            description: "Toggle sidebar",
            category: "UI",
        },
        {
            key: "?",
            shift: true,
            action: () => setShowShortcutsHelp(prev => !prev),
            description: "Mostrar atajos",
            category: "Ayuda",
        },
        // Quick access to AI features
        {
            key: "m",
            ctrl: true,
            shift: true,
            action: () => router.push("/meetings"),
            description: "Ir a Meetings",
            category: "AI Features",
        },
        {
            key: "w",
            ctrl: true,
            shift: true,
            action: () => router.push("/wellbeing"),
            description: "Ir a Bienestar",
            category: "AI Features",
        },
    ];

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Ignore if typing in input/textarea
            const target = event.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                // Only allow Escape in inputs
                if (event.key !== "Escape") return;
            }

            for (const shortcut of shortcuts) {
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey;
                const metaMatch = shortcut.meta ? event.metaKey : true;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;

                // Special handling for Cmd+K on Mac (only meta, not ctrl)
                if (shortcut.meta && !shortcut.ctrl) {
                    if (keyMatch && event.metaKey && !event.ctrlKey && shiftMatch && altMatch) {
                        event.preventDefault();
                        shortcut.action();
                        return;
                    }
                } else if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
                    event.preventDefault();
                    shortcut.action();
                    return;
                }
            }
        },
        [enabled, shortcuts]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return {
        shortcuts,
        showShortcutsHelp,
        setShowShortcutsHelp,
    };
}

// Grouping shortcuts by category for display
export function getShortcutsByCategory(shortcuts: Shortcut[]) {
    return shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, Shortcut[]>);
}

// Format shortcut key for display
export function formatShortcutKey(shortcut: Shortcut): string {
    const isMac = typeof window !== "undefined" && navigator.platform.includes("Mac");
    const parts: string[] = [];

    if (shortcut.ctrl) parts.push(isMac ? "⌘" : "Ctrl");
    if (shortcut.meta) parts.push("⌘");
    if (shortcut.shift) parts.push("⇧");
    if (shortcut.alt) parts.push(isMac ? "⌥" : "Alt");
    parts.push(shortcut.key.toUpperCase());

    return parts.join(isMac ? "" : "+");
}
