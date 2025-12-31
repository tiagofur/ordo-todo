# @ordo-todo/styles

Shared CSS and design tokens for Ordo-Todo applications.

Provides centralized design system with CSS variables (light/dark themes using OKLCH), Tailwind v4 theme mapping, and JavaScript design tokens for React Native.

## Features

- Modern OKLCH color space with light/dark themes
- CSS custom properties for easy theming
- Tailwind v4 compatible theme mapping
- JavaScript design tokens for React Native
- Comprehensive color palette (vibrant colors, semantic colors)
- Spacing, typography, and shadow scales
- Priority, status, and timer color schemes

## Installation

```bash
npm install @ordo-todo/styles
```

## Quick Start

### Web / Desktop (Next.js / Electron)

Import CSS variables in your main CSS file:

```css
/* apps/web/src/app/globals.css */
@import "tailwindcss";
@import "@ordo-todo/styles/variables.css";
@import "@ordo-todo/styles/theme.css";
@import "@ordo-todo/styles/base.css";
@import "@ordo-todo/styles/components.css";

/* App-specific styles */
body {
  background-color: var(--background);
  color: var(--foreground);
}
```

Apply dark theme via class:

```typescript
// apps/web/src/app/providers/theme-provider.tsx
'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return <>{children}</>;
}
```

Use CSS variables in components:

```tsx
<div className="bg-background text-foreground p-4 rounded-lg">
  <h1 style={{ color: "var(--primary)" }}>Hello World</h1>
</div>
```

### Mobile (React Native)

Import design tokens for React Native:

```typescript
// apps/mobile/app/lib/use-design-tokens.ts
import { useColorScheme } from "react-native";
import { tokens } from "@ordo-todo/styles/tokens";

export function useDesignTokens() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    colors: tokens.colors[isDark ? "dark" : "light"],
    spacing: tokens.spacing,
    borderRadius: tokens.borderRadius,
    fontSize: tokens.fontSize,
    fontWeight: tokens.fontWeight,
  };
}
```

Use in components:

```tsx
import { StyleSheet } from "react-native";
import { useDesignTokens } from "../lib/use-design-tokens";

function TaskCard() {
  const { colors, spacing, borderRadius } = useDesignTokens();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
    },
    title: {
      color: colors.foreground,
      fontSize: 18,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Task Title</Text>
    </View>
  );
}
```

## Color System

### Light Theme

| Variable        | Value                        | Description              |
| --------------- | ---------------------------- | ------------------------ |
| `--background`  | `oklch(1 0 0)`               | Background color         |
| `--foreground`  | `oklch(0.141 0.005 285.823)` | Foreground text          |
| `--primary`     | `oklch(0.45 0.24 275)`       | Primary (Vibrant Violet) |
| `--secondary`   | `oklch(0.96 0.01 275)`       | Secondary                |
| `--destructive` | `oklch(0.577 0.245 27.325)`  | Destructive (Red)        |

### Dark Theme

| Variable        | Value                       | Description             |
| --------------- | --------------------------- | ----------------------- |
| `--background`  | `oklch(0.1 0.01 275)`       | Background color        |
| `--foreground`  | `oklch(0.98 0.01 275)`      | Foreground text         |
| `--primary`     | `oklch(0.7 0.15 280)`       | Primary (Bright Violet) |
| `--secondary`   | `oklch(0.2 0.05 275)`       | Secondary               |
| `--destructive` | `oklch(0.704 0.191 22.216)` | Destructive (Red)       |

### Vibrant Color Palette

```css
--color-cyan: #06b6d4;
--color-purple: #a855f7;
--color-pink: #ec4899;
--color-orange: #f97316;
--color-green: #10b981;
```

### Semantic Colors

| Variable                   | Value      | Use Case             |
| -------------------------- | ---------- | -------------------- |
| `--sidebar`                | Light/Dark | Sidebar background   |
| `--sidebar-primary`        | Primary    | Sidebar active items |
| `--chart-1` to `--chart-5` | Multi      | Chart colors         |

## Design Tokens (JavaScript)

### Colors

```typescript
import {
  lightColors,
  darkColors,
  semanticColors,
} from "@ordo-todo/styles/tokens";

// Light theme
console.log(lightColors.primary); // '#7C3AED'
console.log(lightColors.background); // '#FFFFFF'

// Dark theme
console.log(darkColors.primary); // '#A78BFA'
console.log(darkColors.background); // '#0F0F14'

// Semantic colors
console.log(semanticColors.success); // '#10B981'
console.log(semanticColors.warning); // '#F59E0B'
console.log(semanticColors.error); // '#EF4444'
```

### Project & Tag Colors

```typescript
import {
  projectColors,
  tagColors,
  getProjectColor,
  getTagColor,
} from "@ordo-todo/styles/tokens";

// Get project color by index
const color1 = getProjectColor(0); // '#3B82F6' (Blue)
const color2 = getProjectColor(7); // '#3B82F6' (wraps around)

// Get tag color by index
const tagColor1 = getTagColor(0); // '#EF4444' (Red)
const tagColor2 = getTagColor(12); // '#EF4444' (wraps around)
```

### Priority Colors

```typescript
import { priorityColors } from "@ordo-todo/styles/tokens";

console.log(priorityColors.LOW.background); // '#DBEAFE'
console.log(priorityColors.MEDIUM.background); // '#FEF3C7'
console.log(priorityColors.HIGH.background); // '#FECACA'
console.log(priorityColors.URGENT.background); // '#F87171'
```

### Status Colors

```typescript
import { statusColors } from "@ordo-todo/styles/tokens";

console.log(statusColors.TODO.background); // '#F3F4F6'
console.log(statusColors.IN_PROGRESS.background); // '#DBEAFE'
console.log(statusColors.COMPLETED.background); // '#D1FAE5'
console.log(statusColors.CANCELLED.background); // '#F3F4F6'
```

### Timer Colors

```typescript
import { timerColors } from "@ordo-todo/styles/tokens";

console.log(timerColors.WORK.primary); // '#EF4444'
console.log(timerColors.SHORT_BREAK.primary); // '#22C55E'
console.log(timerColors.LONG_BREAK.primary); // '#3B82F6'
```

### Spacing

```typescript
import { spacing, namedSpacing } from "@ordo-todo/styles/tokens";

// Numeric spacing
console.log(spacing.sm); // 8
console.log(spacing.md); // 16
console.log(spacing.lg); // 24

// Named spacing
console.log(namedSpacing.xs); // 4
console.log(namedSpacing.sm); // 8
console.log(namedSpacing.md); // 16
console.log(namedSpacing.lg); // 24
console.log(namedSpacing.xl); // 32
```

### Border Radius

```typescript
import { borderRadius } from "@ordo-todo/styles/tokens";

console.log(borderRadius.sm); // 6
console.log(borderRadius.md); // 8
console.log(borderRadius.lg); // 10
console.log(borderRadius.xl); // 14
console.log(borderRadius.full); // 9999
```

### Typography

```typescript
import { fontSize, fontWeight, lineHeight } from "@ordo-todo/styles/tokens";

// Font sizes
console.log(fontSize.sm); // 14
console.log(fontSize.base); // 16
console.log(fontSize.lg); // 18
console.log(fontSize.xl); // 20

// Font weights
console.log(fontWeight.normal); // '400'
console.log(fontWeight.medium); // '500'
console.log(fontWeight.semibold); // '600'
console.log(fontWeight.bold); // '700'

// Line heights
console.log(lineHeight.tight); // 1.25
console.log(lineHeight.normal); // 1.5
console.log(lineHeight.relaxed); // 1.625
```

### Shadows

```typescript
import { shadows } from "@ordo-todo/styles/tokens";

// React Native shadow styles
const cardStyle = {
  ...shadows.md, // Medium shadow
};

console.log(shadows.none.shadowOpacity); // 0
console.log(shadows.sm.elevation); // 1
console.log(shadows.md.elevation); // 3
console.log(shadows.lg.elevation); // 6
console.log(shadows.xl.elevation); // 12
```

## Helper Functions

### `getColors(isDark: boolean)`

Get colors based on theme:

```typescript
import { getColors } from "@ordo-todo/styles/tokens";

const isDark = document.documentElement.classList.contains("dark");
const colors = getColors(isDark);
console.log(colors.primary);
```

### `hexToRgba(hex: string, alpha: number)`

Convert hex color to RGBA:

```typescript
import { hexToRgba } from "@ordo-todo/styles/tokens";

const rgba = hexToRgba("#7C3AED", 0.5);
console.log(rgba); // 'rgba(124, 58, 237, 0.5)'
```

## Theme Switching

### Web (Next.js)

```tsx
"use client";

import { useEffect } from "react";

export function ThemeToggle() {
  useEffect(() => {
    // Apply class to root element
    const isDark = localStorage.getItem("theme") === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```

### Desktop (Electron)

```typescript
import Store from "electron-store";

const store = new Store();

function setTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  store.set("theme", isDark ? "dark" : "light");
}
```

### Mobile (React Native)

```typescript
import { useColorScheme } from "react-native";

function useTheme() {
  const colorScheme = useColorScheme();
  return {
    isDark: colorScheme === "dark",
    colors: colorScheme === "dark" ? darkColors : lightColors,
  };
}
```

## Custom Properties Reference

### Base Colors

```css
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--destructive-foreground
--border
--input
--ring
```

### Sidebar

```css
--sidebar
--sidebar-foreground
--sidebar-primary
--sidebar-primary-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring
```

### Spacing

```css
--radius
--radius-sm
--radius-md
--radius-lg
--radius-xl
```

## File Structure

```
packages/styles/src/
├── variables.css    # CSS custom properties (light/dark themes)
├── theme.css        # Tailwind v4 @theme mapping
├── base.css         # Base styles (typography, scrollbars)
├── components.css   # Utility classes and animations
├── tokens.ts        # JavaScript design tokens for React Native
└── index.css        # Main export file
```

## Development

```bash
# Build package
npm run build --filter=@ordo-todo/styles

# Watch mode
cd packages/styles && npm run dev

# Type check
npm run check-types --filter=@ordo-todo/styles
```

## Dependencies

- Tailwind CSS v4
- React (for React Native)

## Related Documentation

- [SHARED-CODE-ARCHITECTURE.md](/docs/SHARED-CODE-ARCHITECTURE.md) - Architecture overview
- [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) - Component design patterns
- [Design Guidelines](/docs/design/DESIGN_GUIDELINES.md) - Visual design rules

## License

Part of the Ordo-Todo monorepo.
