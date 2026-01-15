"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/hooks/index.ts
var hooks_exports = {};
__export(hooks_exports, {
  useClickOutside: () => useClickOutside,
  useControllableState: () => useControllableState,
  useDebounce: () => useDebounce,
  useFocus: () => useFocus,
  useHover: () => useHover,
  useKeyboardAction: () => useKeyboardAction,
  usePress: () => usePress
});
module.exports = __toCommonJS(hooks_exports);
var import_react = require("react");
function useHover() {
  const [isHovered, setIsHovered] = (0, import_react.useState)(false);
  const ref = (0, import_react.useRef)(null);
  const handleMouseEnter = (0, import_react.useCallback)(() => setIsHovered(true), []);
  const handleMouseLeave = (0, import_react.useCallback)(() => setIsHovered(false), []);
  (0, import_react.useEffect)(() => {
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
  const [isFocused, setIsFocused] = (0, import_react.useState)(false);
  const ref = (0, import_react.useRef)(null);
  const handleFocus = (0, import_react.useCallback)(() => setIsFocused(true), []);
  const handleBlur = (0, import_react.useCallback)(() => setIsFocused(false), []);
  (0, import_react.useEffect)(() => {
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
  const [isPressed, setIsPressed] = (0, import_react.useState)(false);
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
  const [uncontrolledValue, setUncontrolledValue] = (0, import_react.useState)(defaultValue);
  const isControlled = controlledValue !== void 0;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const setValue = (0, import_react.useCallback)(
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
  const ref = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
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
  const [debouncedValue, setDebouncedValue] = (0, import_react.useState)(value);
  (0, import_react.useEffect)(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useClickOutside,
  useControllableState,
  useDebounce,
  useFocus,
  useHover,
  useKeyboardAction,
  usePress
});
//# sourceMappingURL=index.js.map