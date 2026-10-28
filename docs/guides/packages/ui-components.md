# UI Components Guide

**Building UI components for ORDO with hybrid architecture**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Strategy](#architecture-strategy)
3. [Creating Components](#creating-components)
4. [Primitives](#primitives)
5. [Composition Components](#composition-components)
6. [Content Components](#content-components)
7. [Testing](#testing)

---

## 🎨 Overview

ORDO uses a **3-layer hybrid architecture** for UI components:

```
Layer 1: Design Tokens (@ordo-todo/styles)
  ↓ Colors, spacing, typography, radii
  ↓
Layer 2: UI Logic (@ordo-todo/ui-shared)
  ↓ Types, hooks, CVA configs, accessibility
  ↓
Layer 3: Platform Components
  ↓ @ordo-todo/ui (Web/Desktop: Radix + Tailwind)
  ↓ @ordo-todo/ui-mobile (Mobile: NativeWind)
```

---

## 🏗️ Architecture Strategy

### Layer 1: Design Tokens

**Purpose:** Single source of truth for design tokens

**Where:** `@ordo-todo/styles`

**Usage:**

```typescript
// In any component (Web or Mobile)
import { colors, spacing, radii, typography } from "@ordo-todo/styles";
```

### Layer 2: UI Logic

**Purpose:** Shared UI logic without platform primitives

**Where:** `@ordo-todo/ui-shared`

**Usage:**

```typescript
// In any component (Web or Mobile)
import type { ButtonProps } from "@ordo-todo/ui-shared";
import { useHover, useFocus } from "@ordo-todo/ui-shared";
```

### Layer 3: Platform Components

**Web/Desktop (`@ordo-todo/ui`):**

- Radix UI primitives
- TailwindCSS v4 classes
- CVA for variants

**Mobile (`@ordo-todo/ui-mobile`):**

- React Native primitives
- NativeWind v4 classes
- Native components

---

## 🔨 Creating Components

### Step 1: Define Types in `@ordo-todo/ui-shared`

```typescript
// packages/ui-shared/src/types/button.ts
export interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  // Platform-specific callbacks
  onClick?: () => void; // Web
  onPress?: () => void; // Mobile
  className?: string; // Web
  style?: object; // Mobile
}
```

### Step 2: Create Web Implementation

```typescript
// packages/ui/src/components/primitives/Button/Button.web.tsx
import React from 'react';
import { cva } from 'class-variance-authority';
import { colors, spacing, radii } from '@ordo-todo/styles';
import type { ButtonProps } from '@ordo-todo/ui-shared';

const buttonVariants = cva('font-medium transition-colors', {
  variants: {
    variant: {
      primary: `bg-[${colors.primary.500}] text-white hover:bg-[${colors.primary.600}]`,
      ghost: 'bg-transparent text-[colors.text.primary] hover:bg-[colors.bg.surface]',
      danger: `bg-[${colors.danger.500}] text-white hover:bg-[${colors.danger.600}]`,
    },
    size: {
      sm: `px-[${spacing.sm}] py-[${spacing.xs}] text-sm rounded-[${radii.sm}px]`,
      md: `px-[${spacing.md}] py-[${spacing.sm}] rounded-[${radii.md}px]`,
      lg: `px-[${spacing.lg}] py-[${spacing.md}] rounded-[${radii.lg}px]`,
    },
  },
});

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  className,
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </button>
  );
}
```

### Step 3: Create Mobile Implementation

```typescript
// packages/ui-mobile/src/components/primitives/Button/Button.native.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import { colors, spacing, radii } from '@ordo-todo/styles';
import type { ButtonProps } from '@ordo-todo/ui-shared';

const StyledTouchable = styled(TouchableOpacity);
const StyledText = styled(Text);

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled,
  style,
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
    },
    md: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.md,
    },
    lg: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radii.lg,
    },
  };

  return (
    <StyledTouchable
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <StyledText style={styles.text}>{title}</StyledText>
    </StyledTouchable>
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

### Step 4: Export from Package

```typescript
// packages/ui/src/components/primitives/Button/index.ts
export { default as Button } from "./Button";
export type { ButtonProps } from "@ordo-todo/ui-shared";

// packages/ui-mobile/src/components/primitives/Button/index.ts
export { default as Button } from "./Button";
export type { ButtonProps } from "@ordo-todo/ui-shared";
```

---

## 🧩 Primitives

### Box

**Web:**

```typescript
// packages/ui/src/components/primitives/Box/Box.web.tsx
import React from 'react';
import { spacing } from '@ordo-todo/styles';
import type { BoxProps } from '@ordo-todo/ui-shared';

export default function Box({
  children,
  padding = 'md',
  className,
}: BoxProps) {
  const paddingClass = `p-[${spacing[padding]}]`;

  return <div className={`${paddingClass} ${className}`}>{children}</div>;
}
```

**Mobile:**

```typescript
// packages/ui-mobile/src/components/primitives/Box/Box.native.tsx
import React from 'react';
import { View } from 'react-native';
import { styled } from 'nativewind';
import { spacing } from '@ordo-todo/styles';
import type { BoxProps } from '@ordo-todo/ui-shared';

const StyledView = styled(View);

export default function Box({
  children,
  padding = 'md',
  style,
}: BoxProps) {
  const paddingStyle = {
    padding: spacing[padding],
  };

  return <StyledView style={[paddingStyle, style]}>{children}</StyledView>;
}
```

### Text

**Web:**

```typescript
// packages/ui/src/components/primitives/Text/Text.web.tsx
import React from 'react';
import { colors, typography } from '@ordo-todo/styles';
import type { TextProps } from '@ordo-todo/ui-shared';

export default function Text({
  children,
  size = 'base',
  color = 'primary',
  className,
}: TextProps) {
  const colorClass = `text-[${colors.text[color]}]`;
  const sizeClass = `text-[${typography.fontSize[size]}]`;

  return <p className={`${colorClass} ${sizeClass} ${className}`}>{children}</p>;
}
```

**Mobile:**

```typescript
// packages/ui-mobile/src/components/primitives/Text/Text.native.tsx
import React from 'react';
import { Text as RNText } from 'react-native';
import { styled } from 'nativewind';
import { colors, typography } from '@ordo-todo/styles';
import type { TextProps } from '@ordo-todo/ui-shared';

const StyledText = styled(RNText);

export default function Text({
  children,
  size = 'base',
  color = 'primary',
  style,
}: TextProps) {
  const textStyle = {
    color: colors.text[color],
    fontSize: typography.fontSize[size],
  };

  return <StyledText style={textStyle}>{children}</StyledText>;
}
```

---

## 🔗 Composition Components

### Dialog (Web: Radix)

```typescript
// packages/ui/src/components/composition/Dialog/Dialog.web.tsx
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { colors, radii, zIndex } from '@ordo-todo/styles';
import type { DialogProps } from '@ordo-todo/ui-shared';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={`fixed inset-0 z-[${zIndex.modal}] bg-black/50 ${className}`}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={`fixed left-[50%] top-[50%] z-[${zIndex.modal}] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-[${colors.bg.surface}] rounded-[${radii.lg}px] ${className}`}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export { Dialog, DialogTrigger, DialogContent };
```

### Modal (Mobile: Native)

```typescript
// packages/ui-mobile/src/components/composition/Modal/Modal.native.tsx
import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { styled } from 'nativewind';
import { colors, radii, zIndex } from '@ordo-todo/styles';

const StyledModal = styled(RNModal);
const StyledView = styled(View);
const StyledTouchable = styled(TouchableOpacity);
const StyledText = styled(Text);

export default function Modal({
  visible,
  onClose,
  children,
}: ModalProps) {
  return (
    <StyledModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StyledView className="flex-1 justify-center items-center bg-black/50">
        <StyledView className="w-[90%] bg-[${colors.bg.surface}] rounded-[${radii.lg}px] p-4">
          {children}
          <StyledTouchable onPress={onClose} className="mt-4 self-end">
            <StyledText className="text-[${colors.danger.500}]">Close</StyledText>
          </StyledTouchable>
        </StyledView>
      </StyledView>
    </StyledModal>
  );
}
```

---

## 📦 Content Components

### ContentPipeline (Both Platforms)

**Web:**

```typescript
// packages/ui/src/components/content/ContentPipeline/ContentPipeline.web.tsx
import React from 'react';
import { colors, spacing } from '@ordo-todo/styles';
import type { ContentPipelineProps } from '@ordo-todo/ui-shared';

export default function ContentPipeline({
  ideas,
  contentPieces,
  onMoveIdea,
  onPublishContent,
  labels = {},
}: ContentPipelineProps) {
  const columns = [
    { id: 'ideas', title: labels.ideas ?? 'Ideas', items: ideas },
    { id: 'scripting', title: labels.scripting ?? 'Scripting', items: contentPieces.filter(c => c.status === 'SCRIPTING') },
    // ... more columns
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(column => (
        <div
          key={column.id}
          className="min-w-[300px] flex-1 bg-[${colors.bg.surface}] rounded-lg p-4"
        >
          <h3 className="font-semibold mb-4">{column.title}</h3>
          <div className="space-y-3">
            {column.items.map(item => (
              <div key={item.id}>
                {/* Render IdeaCard or ContentCard */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Mobile:**

```typescript
// packages/ui-mobile/src/components/content/ContentPipeline/ContentPipeline.native.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import { colors, spacing } from '@ordo-todo/styles';
import type { ContentPipelineProps } from '@ordo-todo/ui-shared';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);

export default function ContentPipeline({
  ideas,
  contentPieces,
  onMoveIdea,
  onPublishContent,
  labels = {},
}: ContentPipelineProps) {
  const columns = [
    { id: 'ideas', title: labels.ideas ?? 'Ideas', items: ideas },
    // ... more columns
  ];

  return (
    <StyledScrollView horizontal className="flex-1 pb-4">
      {columns.map(column => (
        <StyledView
          key={column.id}
          className="min-w-[280px] mr-4 bg-[${colors.bg.surface}] rounded-lg p-4"
        >
          <StyledText className="font-semibold mb-4">{column.title}</StyledText>
          <StyledView className="space-y-3">
            {column.items.map(item => (
              <View key={item.id}>
                {/* Render IdeaCard or ContentCard */}
              </View>
            ))}
          </StyledView>
        </StyledView>
      ))}
    </StyledScrollView>
  );
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
// packages/ui/src/components/primitives/Button/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button.web';

describe('Button (Web)', () => {
  it('renders title', () => {
    render(<Button title="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button title="Click me" onClick={handleClick} />);

    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalled();
  });
});

// packages/ui-mobile/src/components/primitives/Button/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react-native';
import Button from './Button.native';

describe('Button (Mobile)', () => {
  it('renders title', () => {
    render(<Button title="Click me" />);
    expect(screen.getByText('Click me')).toBeTruthy();
  });
});
```

---

## 🎯 Best Practices

### ✅ DO

1. **Use design tokens**: Import from `@ordo-todo/styles`
2. **Define types in ui-shared**: Shared types across platforms
3. **Platform-specific implementations**: Separate Web and Mobile
4. **Identical props API**: Same interface on both platforms
5. **Accessibility first**: ARIA labels, keyboard navigation
6. **Test components**: Unit tests for both platforms

### ❌ DON'T

1. **Mix platform UI**: Don't use Radix in mobile or NativeWind in web
2. **Hardcode values**: Always use tokens
3. **Skip accessibility**: ARIA, keyboard, screen readers
4. **Ignore platform differences**: Respect platform conventions
5. **Forget type safety**: Use proper TypeScript types

---

## 📚 Further Reading

- [Design Tokens Guide](./design-tokens.md)
- [UI Architecture Strategy](./ui-architecture.md)
- [Web Development Guide](../development/web-development.md)
- [Mobile Development Guide](../development/mobile-development.md)

---

## 🧩 Unified Domain Dialog Pattern (ODD 022 / Issue #438)

To maintain cross-platform parity between Web, Desktop, and Mobile without code duplication:

1. **Presentational Dialog in `@ordo-todo/ui`**:
   - Resides in `packages/ui/src/components/[domain]/[name]-dialog.tsx`.
   - Pure UI logic: accessible Radix primitives, layout, form styling, focus rings, localized labels passed as props.
   - Slot-based extensibility (`headerActions`, `titleActions`, `descriptionActions`, etc.) accepting render props `({ setValue, getValues }) => ReactNode`.
   - Never directly calls data hooks (`useQuery`), framework-specific routing, or i18n hooks.

2. **Shared i18n Namespace in `@ordo-todo/i18n`**:
   - Defined in `packages/i18n/src/locales/{en,es,pt-br}.json`.
   - Consumed via `next-intl` on Web (`useTranslations('[Namespace]')`) and via `react-i18next` on Desktop/Mobile (`useTranslation()`).

3. **Thin Containers in Applications**:
   - `apps/web/src/components/[domain]/[name]-dialog.tsx`: fetches web data hooks, attaches web-specific slots (e.g. AI generation), maps `next-intl` labels, and submits.
   - `apps/desktop/src/components/[domain]/[name]-dialog.tsx`: fetches desktop hooks, attaches desktop slots (e.g. voice input, smart parse, template selector), maps `react-i18next` labels, and submits.

