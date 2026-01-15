/**
 * Hook to track hover state
 * Works for both web and can be adapted for mobile long press
 */
declare function useHover<T extends HTMLElement = HTMLElement>(): [
    React.RefObject<T | null>,
    boolean
];
/**
 * Hook to track focus state
 */
declare function useFocus<T extends HTMLElement = HTMLElement>(): [
    React.RefObject<T | null>,
    boolean
];
/**
 * Hook to track press state (both web and mobile)
 */
declare function usePress(): {
    isPressed: boolean;
    pressProps: {
        onMouseDown: () => void;
        onMouseUp: () => void;
        onMouseLeave: () => void;
        onTouchStart: () => void;
        onTouchEnd: () => void;
    };
};
/**
 * Hook to handle keyboard interactions for accessibility
 */
declare function useKeyboardAction(callback: () => void, keys?: string[]): {
    onKeyDown: (e: React.KeyboardEvent) => void;
};
/**
 * Hook to manage controlled/uncontrolled state
 */
declare function useControllableState<T>(controlledValue: T | undefined, defaultValue: T, onChange?: (value: T) => void): [T, (value: T) => void];
/**
 * Hook for click outside detection
 */
declare function useClickOutside<T extends HTMLElement = HTMLElement>(callback: () => void): React.RefObject<T | null>;
/**
 * Hook for debounced value
 */
declare function useDebounce<T>(value: T, delay: number): T;

export { useClickOutside, useControllableState, useDebounce, useFocus, useHover, useKeyboardAction, usePress };
