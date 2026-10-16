import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook to track hover state
 * Works for both web and can be adapted for mobile long press
 */
export function useHover<T extends HTMLElement = HTMLElement>(): [
    React.RefObject<T | null>,
    boolean,
] {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef<T | null>(null);

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    useEffect(() => {
        const node = ref.current;
        if (node) {
            node.addEventListener('mouseenter', handleMouseEnter);
            node.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                node.removeEventListener('mouseenter', handleMouseEnter);
                node.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }, [handleMouseEnter, handleMouseLeave]);

    return [ref, isHovered];
}

/**
 * Hook to track focus state
 */
export function useFocus<T extends HTMLElement = HTMLElement>(): [
    React.RefObject<T | null>,
    boolean,
] {
    const [isFocused, setIsFocused] = useState(false);
    const ref = useRef<T | null>(null);

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    useEffect(() => {
        const node = ref.current;
        if (node) {
            node.addEventListener('focus', handleFocus);
            node.addEventListener('blur', handleBlur);

            return () => {
                node.removeEventListener('focus', handleFocus);
                node.removeEventListener('blur', handleBlur);
            };
        }
    }, [handleFocus, handleBlur]);

    return [ref, isFocused];
}

/**
 * Hook to track press state (both web and mobile)
 */
export function usePress(): {
    isPressed: boolean;
    pressProps: {
        onMouseDown: () => void;
        onMouseUp: () => void;
        onMouseLeave: () => void;
        onTouchStart: () => void;
        onTouchEnd: () => void;
    };
} {
    const [isPressed, setIsPressed] = useState(false);

    return {
        isPressed,
        pressProps: {
            onMouseDown: () => setIsPressed(true),
            onMouseUp: () => setIsPressed(false),
            onMouseLeave: () => setIsPressed(false),
            onTouchStart: () => setIsPressed(true),
            onTouchEnd: () => setIsPressed(false),
        },
    };
}

/**
 * Hook to handle keyboard interactions for accessibility
 */
export function useKeyboardAction(
    callback: () => void,
    keys: string[] = ['Enter', ' ']
): {
    onKeyDown: (e: React.KeyboardEvent) => void;
} {
    return {
        onKeyDown: (e: React.KeyboardEvent) => {
            if (keys.includes(e.key)) {
                e.preventDefault();
                callback();
            }
        },
    };
}

/**
 * Hook to manage controlled/uncontrolled state
 */
export function useControllableState<T>(
    controlledValue: T | undefined,
    defaultValue: T,
    onChange?: (value: T) => void
): [T, (value: T) => void] {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const setValue = useCallback(
        (newValue: T) => {
            if (!isControlled) {
                setUncontrolledValue(newValue);
            }
            onChange?.(newValue);
        },
        [isControlled, onChange]
    );

    return [value, setValue];
}

/**
 * Hook for click outside detection
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    callback: () => void
): React.RefObject<T | null> {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [callback]);

    return ref;
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
