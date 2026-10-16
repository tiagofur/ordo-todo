# Design Tokens (`@ordo-todo/styles`)

**Single source of truth for ORDO's design system**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Token Categories](#token-categories)
4. [Creating Tokens](#creating-tokens)
5. [Using Tokens](#using-tokens)
6. [Platform-Specific Exports](#platform-specific-exports)

---

## 🎨 Overview

`@ordo-todo/styles` contains **pure design tokens** - the single source of truth for ORDO's visual language.

### Key Principles

1. **Tokens ONLY**: NO components, NO logic, NO dependencies
2. **Platform Agnostic**: Same tokens work on web, mobile, desktop
3. **TypeScript Native**: Full type safety
4. **Single Source of Truth**: All UI consumes these tokens

### What ARE Tokens?

- Colors (primary, danger, neutral)
- Spacing (xs, sm, md, lg, xl)
- Radii (rounded corners)
- Typography (font families, sizes, weights)
- Shadows
- Z-index values
- Border widths

### What ARE NOT Tokens?

- Components (Button, Card, etc.)
- Hooks (useHover, useFocus, etc.)
- Logic (validation, accessibility helpers)
- CSS (Tailwind classes)

---

## 📁 Directory Structure

```
packages/styles/src/
├── tokens.ts                 # All design tokens
├── theme.ts                  # Theme definitions (optional)
└── index.ts                  # Exports

package.json
tsconfig.json
tsup.config.ts
```

---

## 🎨 Token Categories

### Colors

```typescript
// tokens.ts
export const colors = {
  // Primary (cyan-based for modern creator vibe)
  primary: {
    50: "#e6fffa",
    100: "#bff7ef",
    200: "#94f7df",
    300: "#69e9cd",
    400: "#43d5b3",
    500: "#06b6d4", // Primary brand color
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
  },

  // Danger (for destructive actions)
  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444", // Destructive actions
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Backgrounds (dark mode first for creators)
  bg: {
    DEFAULT: "#0b1020", // Main background
    surface: "#0f1724", // Cards, surfaces
    elevated: "#162035", // Modals, dropdowns
    overlay: "rgba(0, 0, 0, 0.5)", // Overlay/backdrop
  },

  // Text colors
  text: {
    primary: "#e6eef8", // Main text
    secondary: "#cbd5e1", // Secondary text
    muted: "#9aa4b2", // Muted text
    inverse: "#ffffff", // On dark backgrounds
  },

  // Border colors
  border: {
    DEFAULT: "#1e293b", // Default border
    light: "#334155", // Light border (hover)
    focus: "#06b6d4", // Focus ring (primary)
  },
} as const;

export type Colors = typeof colors;
```

### Spacing

```typescript
export const spacing = {
  xs: 4, // 0.25rem
  sm: 8, // 0.5rem
  md: 16, // 1rem
  lg: 24, // 1.5rem
  xl: 32, // 2rem
  "2xl": 48, // 3rem
  "3xl": 64, // 4rem
} as const;

export type Spacing = typeof spacing;
```

### Radii

```typescript
export const radii = {
  none: 0,
  sm: 6, // Slight rounding
  md: 12, // Medium rounding
  lg: 18, // Large rounding
  full: 9999, // Pill shape
} as const;

export type Radii = typeof radii;
```

### Typography

```typescript
export const typography = {
  fontFamily: {
    sans: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "sans-serif",
    ],
    mono: ["JetBrains Mono", "Fira Code", "Monaco", "monospace"],
  },

  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const;

export type Typography = typeof typography;
```

### Shadows

```typescript
export const shadows = {
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
} as const;

export type Shadows = typeof shadows;
```

### Z-Index

```typescript
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
} as const;

export type ZIndex = typeof zIndex;
```

---

## 🔨 Creating Tokens

### Adding New Colors

```typescript
export const colors = {
  // Existing colors...
  primary: {
    /* ... */
  },
  danger: {
    /* ... */
  },

  // New: Success (for positive feedback)
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // Success color
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
} as const;
```

### Adding New Spacing

```typescript
export const spacing = {
  // Existing spacing...
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,

  // New: Extra large
  "4xl": 96,
} as const;
```

### Exporting All Tokens

```typescript
// tokens.ts
import { colors } from "./colors";
import { spacing } from "./spacing";
import { radii } from "./radii";
import { typography } from "./typography";
import { shadows } from "./shadows";
import { zIndex } from "./z-index";

export const tokens = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
  zIndex,
} as const;

export type Tokens = {
  colors: typeof colors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
  zIndex: typeof zIndex;
};

export * from "./colors";
export * from "./spacing";
export * from "./radii";
export * from "./typography";
export * from "./shadows";
export * from "./z-index";
```

---

## 💻 Using Tokens

### In Web UI (`@ordo-todo/ui`)

```typescript
// packages/ui/src/components/primitives/Button.tsx
import { colors, spacing, radii, typography } from '@ordo-todo/styles';
import { cva } from 'class-variance-authority';

const buttonVariants = cva('font-medium transition-colors', {
  variants: {
    variant: {
      primary: `bg-[${colors.primary.500}] text-white hover:bg-[${colors.primary.600}]`,
      ghost: 'bg-transparent text-[${colors.text.primary}] hover:bg-[${colors.bg.surface}]',
      danger: `bg-[${colors.danger.500}] text-white hover:bg-[${colors.danger.600}]`,
    },
    size: {
      sm: `px-[${spacing.sm}] py-[${spacing.xs}] text-[${typography.fontSize.sm}] rounded-[${radii.sm}px]`,
      md: `px-[${spacing.md}] py-[${spacing.sm}] text-[${typography.fontSize.base}] rounded-[${radii.md}px]`,
      lg: `px-[${spacing.lg}] py-[${spacing.md}] text-[${typography.fontSize.lg}] rounded-[${radii.lg}px]`,
    },
  },
});
```

### In Mobile UI (`@ordo-todo/ui-mobile`)

```typescript
// packages/ui-mobile/src/components/primitives/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from '@ordo-todo/styles';

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled,
}: ButtonProps) {
  const variantStyles = {
    primary: { backgroundColor: colors.primary.500 },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.danger.500 },
  };

  const sizeStyles = {
    sm: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radii.sm,
      fontSize: typography.fontSize.sm,
    },
    md: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.md,
      fontSize: typography.fontSize.base,
    },
    lg: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radii.lg,
      fontSize: typography.fontSize.lg,
    },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, sizeStyles[size].fontSize]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
});
```

### In Tailwind Configuration (Web)

```javascript
// packages/ui/tailwind.config.js
const {
  colors,
  spacing,
  radii,
  typography,
  shadows,
} = require("@ordo-todo/styles");

module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius: radii,
      fontSize: typography.fontSize,
      fontFamily: typography.fontFamily,
      boxShadow: shadows,
    },
  },
};
```

---

## 🌐 Platform-Specific Exports

### Web CSS Variables

```typescript
// packages/styles/src/index.ts
// Export CSS variables for web
export const cssVars = {
  '--colors-primary-500': colors.primary.500,
  '--colors-primary-600': colors.primary.600,
  '--colors-text-primary': colors.text.primary,
  '--colors-bg-default': colors.bg.DEFAULT,
  '--spacing-md': `${spacing.md}px`,
  '--radii-md': `${radii.md}px`,
  // ... etc
} as const;
```

Use in global CSS:

```css
/* apps/web/src/styles/globals.css */
@import "@ordo-todo/styles";

:root {
  --colors-primary-500: #06b6d4;
  --colors-text-primary: #e6eef8;
  --spacing-md: 16px;
}

.dark {
  --colors-bg-default: #0b1020;
}
```

### Mobile Native Styles

```typescript
// packages/ui-mobile/src/lib/theme.ts
import { colors, spacing, radii, typography } from "@ordo-todo/styles";

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  // Add mobile-specific values
  scale: 1, // For accessibility scaling
} as const;
```

Use in React Native components:

```typescript
import { theme } from "@ordo-todo/ui-mobile/lib/theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg.DEFAULT,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
  },
});
```

---

## 🧪 Testing Tokens

### Type Safety Check

```typescript
// tokens.test.ts
import { tokens } from "./tokens";

describe("Design Tokens", () => {
  it("should have all required categories", () => {
    expect(tokens).toHaveProperty("colors");
    expect(tokens).toHaveProperty("spacing");
    expect(tokens).toHaveProperty("radii");
    expect(tokens).toHaveProperty("typography");
    expect(tokens).toHaveProperty("shadows");
    expect(tokens).toHaveProperty("zIndex");
  });

  it("should have primary color palette", () => {
    expect(tokens.colors.primary).toHaveProperty("500");
    expect(tokens.colors.primary[500]).toBe("#06b6d4");
  });

  it("should have spacing tokens", () => {
    expect(tokens.spacing.md).toBe(16);
    expect(tokens.spacing.lg).toBe(24);
  });
});
```

---

## 🎯 Best Practices

### ✅ DO

1. **Tokens ONLY**: NO components, NO logic
2. **Type Safe**: Use `as const` for type inference
3. **Platform Agnostic**: Same tokens everywhere
4. **Single Source**: All UI consumes these tokens
5. **Version Tokens**: Use semantic versioning

### ❌ DON'T

1. **Add Components**: Components belong in `packages/ui` or `packages/ui-mobile`
2. **Add Logic**: Logic belongs in `packages/ui-shared`
3. **Hardcode Values**: Always use tokens
4. **Ignore Platform**: Ensure tokens work on all platforms
5. **Break Type Safety**: Don't use `any`

---

## 📚 Further Reading

- [UI Architecture Strategy](../packages/ui-architecture.md)
- [UI Components Guide](../packages/ui-components.md)
- [Mobile Development Guide](../development/mobile-development.md)
