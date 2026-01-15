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

// src/utils/cva-configs.ts
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { cva as cva2 } from "class-variance-authority";
import { clsx as clsx2 } from "clsx";
function cn(...inputs) {
  return clsx(inputs);
}
var buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-cyan-500 text-white hover:bg-cyan-600 focus-visible:ring-cyan-500",
        secondary: "bg-gray-700 text-white hover:bg-gray-600 focus-visible:ring-gray-500",
        ghost: "bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white",
        danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500"
      },
      size: {
        xs: "h-7 px-2 text-xs rounded",
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-10 px-4 text-sm rounded-lg",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-xl"
      },
      fullWidth: {
        true: "w-full",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false
    }
  }
);
var inputVariants = cva(
  // Base styles
  "w-full bg-gray-900 border transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-10 px-4 text-sm rounded-lg",
        lg: "h-12 px-4 text-base rounded-lg"
      },
      error: {
        true: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        false: "border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/20"
      }
    },
    defaultVariants: {
      size: "md",
      error: false
    }
  }
);
var cardVariants = cva(
  // Base styles
  "rounded-xl transition-all",
  {
    variants: {
      variant: {
        default: "bg-gray-900 border border-gray-800",
        outlined: "bg-transparent border-2 border-gray-700",
        elevated: "bg-gray-900 shadow-lg shadow-black/20",
        glass: "bg-gray-900/50 backdrop-blur-md border border-gray-800/50"
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-6"
      },
      clickable: {
        true: "cursor-pointer hover:border-gray-600 active:scale-[0.99]",
        false: ""
      },
      selected: {
        true: "border-cyan-500 ring-2 ring-cyan-500/20",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      clickable: false,
      selected: false
    }
  }
);
var badgeVariants = cva(
  // Base styles
  "inline-flex items-center font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-700 text-gray-300",
        primary: "bg-cyan-500/20 text-cyan-400",
        secondary: "bg-purple-500/20 text-purple-400",
        success: "bg-green-500/20 text-green-400",
        warning: "bg-yellow-500/20 text-yellow-400",
        danger: "bg-red-500/20 text-red-400"
      },
      size: {
        sm: "px-2 py-0.5 text-xs rounded",
        md: "px-2.5 py-1 text-sm rounded-md",
        lg: "px-3 py-1.5 text-base rounded-lg"
      },
      pill: {
        true: "rounded-full",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      pill: false
    }
  }
);
var textVariants = cva("", {
  variants: {
    variant: {
      h1: "text-4xl font-bold tracking-tight",
      h2: "text-3xl font-bold tracking-tight",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-semibold",
      h5: "text-lg font-medium",
      h6: "text-base font-medium",
      body: "text-sm",
      caption: "text-xs",
      label: "text-sm font-medium"
    },
    color: {
      default: "text-gray-100",
      muted: "text-gray-400",
      primary: "text-cyan-400",
      danger: "text-red-400",
      success: "text-green-400"
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold"
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    },
    truncate: {
      true: "truncate",
      false: ""
    }
  },
  defaultVariants: {
    variant: "body",
    color: "default",
    weight: "normal",
    align: "left",
    truncate: false
  }
});

// src/utils/platform.ts
var isBrowser = typeof window !== "undefined";
var isReactNative = typeof navigator !== "undefined" && navigator.product === "ReactNative";
var isIOS = isBrowser && (/iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
var isAndroid = isBrowser && /Android/.test(navigator.userAgent);
var isMobile = isIOS || isAndroid || isReactNative;
var isElectron = isBrowser && typeof window !== "undefined" && // @ts-expect-error electron specific
(window.process?.type === "renderer" || window.electron !== void 0);
var isTouchDevice = isBrowser && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
function getPlatform() {
  if (isElectron) return "electron";
  if (isReactNative) {
    return isIOS ? "ios" : "android";
  }
  if (isMobile) return "mobile-web";
  return "web";
}
function useWebComponents() {
  const platform = getPlatform();
  return platform === "web" || platform === "mobile-web" || platform === "electron";
}
function useNativeComponents() {
  const platform = getPlatform();
  return platform === "ios" || platform === "android";
}

// src/utils/accessibility.ts
var idCounter = 0;
function generateId(prefix = "ordo") {
  return `${prefix}-${++idCounter}`;
}
function getButtonAriaProps(props) {
  return {
    role: "button",
    "aria-disabled": props.disabled || props.loading,
    "aria-pressed": props.pressed,
    tabIndex: props.disabled ? -1 : 0
  };
}
function getDialogAriaProps(props) {
  return {
    role: "dialog",
    "aria-labelledby": props.titleId,
    "aria-describedby": props.descriptionId
  };
}
function getMenuAriaProps(props) {
  return {
    role: "menu",
    "aria-expanded": props.expanded,
    "aria-labelledby": props.triggerId
  };
}
function getMenuTriggerAriaProps(props) {
  return {
    "aria-haspopup": "menu",
    "aria-expanded": props.expanded,
    "aria-controls": props.menuId
  };
}
var srOnly = "sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0";
var skipLink = "sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-gray-900 focus:text-white";
function getFocusableElements(container) {
  const focusableSelectors = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ];
  return Array.from(
    container.querySelectorAll(focusableSelectors.join(","))
  );
}
function trapFocus(container) {
  const focusableElements = getFocusableElements(container);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  const handleKeyDown = (e) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };
  container.addEventListener("keydown", handleKeyDown);
  firstFocusable?.focus();
  return () => container.removeEventListener("keydown", handleKeyDown);
}
export {
  badgeVariants,
  buttonVariants,
  cardVariants,
  clsx2 as clsx,
  cn,
  cva2 as cva,
  generateId,
  getButtonAriaProps,
  getDialogAriaProps,
  getFocusableElements,
  getMenuAriaProps,
  getMenuTriggerAriaProps,
  getPlatform,
  inputVariants,
  isAndroid,
  isBrowser,
  isElectron,
  isIOS,
  isMobile,
  isReactNative,
  isTouchDevice,
  skipLink,
  srOnly,
  textVariants,
  trapFocus,
  useClickOutside,
  useControllableState,
  useDebounce,
  useFocus,
  useHover,
  useKeyboardAction,
  useNativeComponents,
  usePress,
  useWebComponents
};
//# sourceMappingURL=index.mjs.map