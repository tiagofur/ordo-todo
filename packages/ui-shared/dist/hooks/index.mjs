// src/hooks/index.ts
import { useState, useCallback, useRef, useEffect } from "react";
function useHover() {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mouseenter", handleMouseEnter);
      node.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        node.removeEventListener("mouseenter", handleMouseEnter);
        node.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [handleMouseEnter, handleMouseLeave]);
  return [ref, isHovered];
}
function useFocus() {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef(null);
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("focus", handleFocus);
      node.addEventListener("blur", handleBlur);
      return () => {
        node.removeEventListener("focus", handleFocus);
        node.removeEventListener("blur", handleBlur);
      };
    }
  }, [handleFocus, handleBlur]);
  return [ref, isFocused];
}
function usePress() {
  const [isPressed, setIsPressed] = useState(false);
  return {
    isPressed,
    pressProps: {
      onMouseDown: () => setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
      onMouseLeave: () => setIsPressed(false),
      onTouchStart: () => setIsPressed(true),
      onTouchEnd: () => setIsPressed(false)
    }
  };
}
function useKeyboardAction(callback, keys = ["Enter", " "]) {
  return {
    onKeyDown: (e) => {
      if (keys.includes(e.key)) {
        e.preventDefault();
        callback();
      }
    }
  };
}
function useControllableState(controlledValue, defaultValue, onChange) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== void 0;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const setValue = useCallback(
    (newValue) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );
  return [value, setValue];
}
function useClickOutside(callback) {
  const ref = useRef(null);
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [callback]);
  return ref;
}
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
export {
  useClickOutside,
  useControllableState,
  useDebounce,
  useFocus,
  useHover,
  useKeyboardAction,
  usePress
};
//# sourceMappingURL=index.mjs.map