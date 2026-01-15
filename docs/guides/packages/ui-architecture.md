# UI Architecture Strategy

**Hybrid UI architecture for ORDO: Web, Mobile, Desktop**

## 📋 Table of Contents

1. [Overview](#overview)
2. [The Strategy](#the-strategy)
3. [Package Structure](#package-structure)
4. [Component Layering](#component-layering)
5. [Platform-Specific Implementation](#platform-specific-implementation)
6. [File Resolution](#file-resolution)
7. [Component API Unification](#component-api-unification)
8. [Trade-offs](#trade-offs)

---

## 🎨 Overview

ORDO uses a **hybrid UI architecture** that maximizes code reuse while respecting platform differences.

### The Problem

- ✅ Web/Desktop uses: React + DOM + TailwindCSS + Radix UI
- ✅ Mobile uses: React Native + Native components + NativeWind
- ❌ Radix UI doesn't work on React Native
- ❌ TailwindCSS doesn't work on React Native (directly)

### The Solution

**3-Layer Hybrid Strategy:**

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
  ↓
Layer 4: Content Components (Platform-specific)
  ↓ ContentPipeline, IdeaCard, SocialPreview
  ↓
Layer 5: Apps (Web/Mobile/Desktop)
  ↓ Pages, screens, features
```

---

## 📦 The Strategy

### Layer 1: Design Tokens (`@ordo-todo/styles`)

**Purpose:** Single source of truth for design tokens

**Contains:**

- Colors (primary, danger, neutral)
- Spacing (xs, sm, md, lg, xl)
- Radii (rounded corners)
- Typography (font families, sizes, weights)
- Shadows, z-index, borders

**Dependencies:** NONE (pure tokens)

```typescript
export const colors = {
  primary: {
    500: "#06b6d4",
    600: "#0891b2",
  },
  bg: {
    DEFAULT: "#0b1020",
    surface: "#0f1724",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

### Layer 2: UI Logic (`@ordo-todo/ui-shared`)

**Purpose:** Shared UI logic without platform primitives

**Contains:**

- Component types (ButtonProps, InputProps, etc.)
- Shared hooks (useHover, useFocus, usePress)
- CVA configs (variant definitions)
- Accessibility utilities (ARIA helpers)
- Platform detection utilities

**Dependencies:** `@ordo-todo/styles` ONLY

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

### Layer 3: Platform Components

**`@ordo-todo/ui` (Web/Desktop)**

**Purpose:** Web/Desktop components (Radix + Tailwind)

**Contains:**

- **Primitives**: Button, Input, Card, Text, Box
- **Composition**: Dialog, Menu, Tooltip, Dropdown
- **Content Components**: ContentPipeline, IdeaCard, SocialPreview

**Dependencies:** `@ordo-todo/styles` + `@ordo-todo/ui-shared` + Radix UI + TailwindCSS

```typescript
// packages/ui/src/components/primitives/Button.web.tsx
import React from 'react';
import { cva } from 'class-variance-authority';
import { colors, spacing, radii } from '@ordo-todo/styles';
import type { ButtonProps } from '@ordo-todo/ui-shared';

const buttonVariants = cva('font-medium transition-colors', {
  variants: {
    variant: {
      primary: `bg-[${colors.primary.500}] text-white hover:bg-[${colors.primary.600}]`,
      ghost: 'bg-transparent text-[colors.text.primary] hover:bg-[colors.bg.surface]',
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
  children,
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
      {title ?? children}
    </button>
  );
}
```

**`@ordo-todo/ui-mobile` (Mobile)**

**Purpose:** Mobile components (React Native + NativeWind)

**Contains:**

- **Primitives**: Button, Input, Card, Text, Box
- **Composition**: Modal, ActionSheet, BottomSheet
- **Content Components**: ContentPipeline, IdeaCard, SocialPreview

**Dependencies:** `@ordo-todo/styles` + `@ordo-todo/ui-shared` + React Native + NativeWind

```typescript
// packages/ui-mobile/src/components/primitives/Button.native.tsx
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
}: ButtonProps) {
  const variantClass = variant === 'primary' ? `bg-[${colors.primary.500}]` : 'bg-transparent';
  const sizeClass = size === 'md' ? `px-[${spacing.md}] py-[${spacing.sm}] rounded-[${radii.md}px]` : `px-[${spacing.sm}] py-[${spacing.xs}] rounded-[${radii.sm}px]`;

  return (
    <StyledTouchable
      className={`${variantClass} ${sizeClass}`}
      onPress={onPress}
      disabled={disabled}
    >
      <StyledText className="text-white font-medium">
        {title}
      </StyledText>
    </StyledTouchable>
  );
}
```

---

## 📂 Package Structure

```
packages/
├── styles/               # Layer 1: Design Tokens
│   ├── src/
│   │   ├── tokens.ts     # All design tokens
│   │   ├── theme.ts      # Theme definitions
│   │   └── index.ts
│   └── package.json
│
├── ui-shared/            # Layer 2: UI Logic
│   ├── src/
│   │   ├── types/       # Component types
│   │   │   ├── button.ts
│   │   │   ├── input.ts
│   │   │   └── card.ts
│   │   ├── hooks/       # Shared UI hooks
│   │   │   ├── useHover.ts
│   │   │   ├── useFocus.ts
│   │   │   └── usePress.ts
│   │   ├── utils/       # CVA configs, accessibility
│   │   │   ├── cva-config.ts
│   │   │   ├── aria.ts
│   │   │   └── platform.ts
│   │   └── index.ts
│   └── package.json
│
├── ui/                  # Layer 3: Web/Desktop UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── primitives/      # Button, Input, Card (Web)
│   │   │   │   ├── Button.web.tsx
│   │   │   │   ├── Input.web.tsx
│   │   │   │   ├── Card.web.tsx
│   │   │   │   ├── Text.web.tsx
│   │   │   │   └── Box.web.tsx
│   │   │   ├── composition/     # Dialog, Menu, Tooltip (Radix)
│   │   │   │   ├── Dialog.web.tsx
│   │   │   │   ├── Menu.web.tsx
│   │   │   │   └── Tooltip.web.tsx
│   │   │   ├── content/        # Content-specific
│   │   │   │   ├── ContentPipeline.web.tsx
│   │   │   │   ├── IdeaCard.web.tsx
│   │   │   │   └── SocialPreview.web.tsx
│   │   │   └── index.ts
│   │   └── lib/
│   │       └── cn.ts         # Class name utility
│   └── package.json
│
└── ui-mobile/            # Layer 3: Mobile UI
    ├── src/
    │   ├── components/
    │   │   ├── primitives/      # Button, Input, Card (Native)
    │   │   │   ├── Button.native.tsx
    │   │   │   ├── Input.native.tsx
    │   │   │   ├── Card.native.tsx
    │   │   │   ├── Text.native.tsx
    │   │   │   └── Box.native.tsx
    │   │   ├── composition/     # Modal, ActionSheet (Native)
    │   │   │   ├── Modal.native.tsx
    │   │   │   ├── ActionSheet.native.tsx
    │   │   │   └── BottomSheet.native.tsx
    │   │   ├── content/        # Content-specific
    │   │   │   ├── ContentPipeline.native.tsx
    │   │   │   ├── IdeaCard.native.tsx
    │   │   │   └── SocialPreview.native.tsx
    │   │   └── index.ts
    │   └── lib/
    │       └── cn.ts         # Style utility
    └── package.json
```

---

## 🧩 Component Layering

### Primitives (Foundation)

**What:** Atomic components (Button, Input, Card, Text, Box)

**Where:** `packages/ui` (Web) and `packages/ui-mobile` (Mobile)

**Dependencies:** Design tokens + UI logic

**Example:**

```typescript
// Web
<button className="px-4 py-2 rounded-md bg-primary-500">
  Click me
</button>

// Mobile
<TouchableOpacity className="px-4 py-2 rounded-md bg-primary-500">
  <Text>Click me</Text>
</TouchableOpacity>
```

### Composition (Complex UI)

**What:** Complex components using primitives

**Web:** Dialog, Menu, Tooltip, Dropdown (using Radix)
**Mobile:** Modal, ActionSheet, BottomSheet (using Native)

**Example:**

```typescript
// Web (Radix)
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>Dialog Title</DialogHeader>
    <DialogFooter>Dialog Content</DialogFooter>
  </DialogContent>
</Dialog>

// Mobile (Native)
<Modal>
  <ModalTrigger>Open</ModalTrigger>
  <ModalContent>
    <ModalHeader>Modal Title</ModalHeader>
    <ModalFooter>Modal Content</ModalFooter>
  </ModalContent>
</Modal>
```

### Content Components (Business Logic)

**What:** ORDO-specific components

**Where:** Both `packages/ui` and `packages/ui-mobile`

**Example:**

```typescript
// Both Web and Mobile
<ContentPipeline
  ideas={ideas}
  contentPieces={contentPieces}
  onMoveIdea={moveIdea}
  onPublishContent={publishContent}
/>
```

---

## 🔧 Platform-Specific Implementation

### File Resolution Strategy

Using `.web.tsx` and `.native.tsx` extensions:

```typescript
// packages/ui-shared/src/Button.tsx
// Re-exports platform-specific implementation
export { default as Button } from "./platform/Button";

// packages/ui-shared/src/platform/Button.web.tsx
// Web implementation (Radix + Tailwind)

// packages/ui-shared/src/platform/Button.native.tsx
// Mobile implementation (NativeWind)
```

### Alternative: Separate Packages

**Better approach:** Separate packages for each platform

```typescript
// Web app imports
import { Button } from "@ordo-todo/ui";

// Mobile app imports
import { Button } from "@ordo-todo/ui-mobile";

// Both use same design tokens
import { colors, spacing } from "@ordo-todo/styles";

// Both use same types
import { ButtonProps } from "@ordo-todo/ui-shared";
```

---

## 📄 File Resolution

### Using Platform-Specific Exports

```typescript
// packages/ui/src/components/primitives/Button/index.ts
// Re-exports platform-specific implementation
export { default as Button } from "./Button";
export type { ButtonProps } from "@ordo-todo/ui-shared";

// packages/ui/src/components/primitives/Button/Button.web.tsx
// Web implementation

// packages/ui-mobile/src/components/primitives/Button/index.ts
export { default as Button } from "./Button";
export type { ButtonProps } from "@ordo-todo/ui-shared";

// packages/ui-mobile/src/components/primitives/Button/Button.native.tsx
// Mobile implementation
```

---

## 🔌 Component API Unification

### Identical Props Interface

Both platforms use the same props interface from `@ordo-todo/ui-shared`:

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

### Web Implementation

```typescript
// packages/ui/src/components/primitives/Button/Button.web.tsx
import React from 'react';
import { cva } from 'class-variance-authority';
import { colors, spacing, radii } from '@ordo-todo/styles';
import type { ButtonProps } from '@ordo-todo/ui-shared';

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
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </button>
  );
}
```

### Mobile Implementation

```typescript
// packages/ui-mobile/src/components/primitives/Button/Button.native.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
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
  return (
    <StyledTouchable
      onPress={onPress}
      disabled={disabled}
      style={style}
    >
      <StyledText>{title}</StyledText>
    </StyledTouchable>
  );
}
```

---

## ⚖️ Trade-offs

### ✅ Pros

1. **Maximum Code Reuse**: Shared design tokens and UI logic
2. **Platform-Optimized**: Native performance on mobile, Radix on web
3. **Type Safety**: Identical props interface across platforms
4. **Maintainability**: Clear separation of concerns
5. **Flexibility**: Easy to add new platforms

### ❌ Cons

1. **Double Implementation**: Need 2 implementations of primitives
2. **Complex Setup**: More packages to configure
3. **Learning Curve**: Team needs to understand 3-layer architecture
4. **Maintenance**: Need to keep 2 UI packages in sync

### 🔄 Alternative: Tamagui

**Alternative approach:** Use Tamagui (write once, run everywhere)

**Pros:**

- Single codebase for web + native
- Native performance
- TypeScript support

**Cons:**

- Steep learning curve
- Migration effort (if already using Tailwind + Radix)
- Less mature ecosystem
- Less flexibility for platform-specific features

**Recommendation:** Stick with hybrid strategy for ORDO (already invested in Radix + Tailwind)

---

## 🎯 Migration Path

### Step 1: Create Design Tokens

```bash
# Create packages/styles
mkdir -p packages/styles/src
cd packages/styles

# Create tokens
cat > src/tokens.ts << 'EOF'
export const colors = { /* ... */ };
export const spacing = { /* ... */ };
export const radii = { /* ... */ };
EOF
```

### Step 2: Create UI Shared

```bash
# Create packages/ui-shared
mkdir -p packages/ui-shared/src/{types,hooks,utils}
cd packages/ui-shared

# Create types
cat > src/types/button.ts << 'EOF'
export interface ButtonProps { /* ... */ };
EOF
```

### Step 3: Create Web UI

```bash
# Create packages/ui
mkdir -p packages/ui/src/components/primitives/Button
cd packages/ui

# Create Web implementation
cat > src/components/primitives/Button/Button.web.tsx << 'EOF'
import type { ButtonProps } from '@ordo-todo/ui-shared';
export default function Button(props: ButtonProps) { /* ... */ }
EOF
```

### Step 4: Create Mobile UI

```bash
# Create packages/ui-mobile
mkdir -p packages/ui-mobile/src/components/primitives/Button
cd packages/ui-mobile

# Create Mobile implementation
cat > src/components/primitives/Button/Button.native.tsx << 'EOF'
import type { ButtonProps } from '@ordo-todo/ui-shared';
export default function Button(props: ButtonProps) { /* ... */ }
EOF
```

### Step 5: Update Apps

```bash
# Update apps/web/package.json
pnpm add @ordo-todo/ui @ordo-todo/ui-shared @ordo-todo/styles

# Update apps/mobile/package.json
pnpm add @ordo-todo/ui-mobile @ordo-todo/ui-shared @ordo-todo/styles
```

---

## 📚 Further Reading

- [Design Tokens Guide](./design-tokens.md)
- [UI Components Guide](./ui-components.md)
- [Web Development Guide](../development/web-development.md)
- [Mobile Development Guide](../development/mobile-development.md)
