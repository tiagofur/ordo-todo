# Mobile Rules (React Native)

**Specific rules for `apps/mobile/` (React Native + Expo)**

## 📱 Core Principles

### 1. Performance is Feature #1

- **The Bridge is the Bottle-neck**: Minimize passes over the bridge. Batch updates.
- **Lists Matter**: Use `FlashList` or strictly optimized `FlatList`. No `ScrollView` for long lists.
- **Memoization**: Aggressively use `useMemo` and `useCallback` to prevent useless re-renders.

### 2. Platform Awareness

- The UI must look "correct" on both iOS (Human Interface Guidelines) and Android (Material Design).
- Use `Platform.select` and `.ios.ts` / `.android.ts` extensions effectively.
- Handle Safe Areas (`react-native-safe-area-context`) correctly on ALL screens.

### 3. Navigation Best Practices

- Use `expo-router` (file-based navigation).
- Proper nesting of Stacks, Tabs, and Drawers.
- Passing minimal params (IDs only) in navigation routes; fetch full data on the screen.

---

## 🏗️ Decision Framework

When building a screen or feature:

1.  **Layout**: Flexbox is your tool. Avoid absolute positioning unless necessary for overlays.
2.  **Styling**: Use `NativeWind` (TailwindCSS) to keep styles consistent.
3.  **Interaction**: Use `Pressable` for touch handling with proper feedback (ripples/opacity).
4.  **Animation**: Use `react-native-reanimated` for everything. Run animations on the UI thread.

---

## 🎨 Common Patterns

### 1. Optimized List Item

```typescript
const MyListItem = React.memo(({ id, title, onPress }: ItemProps) => {
  return (
    <Pressable onPress={() => onPress(id)} className="p-4 bg-white dark:bg-gray-800">
      <Text className="text-base text-gray-900 dark:text-gray-100">{title}</Text>
    </Pressable>
  );
});
```

### 2. Platform Logic

```typescript
const containerStyle = {
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
    },
    android: {
      elevation: 4,
    },
  }),
};
```

### 3. Reanimated Usage

```typescript
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const animatedStyles = useAnimatedStyle(() => {
  return {
    transform: [{ scale: withSpring(isPressed.value ? 0.95 : 1) }],
  };
});
```

---

## ✅ Quality Checks

1.  **Images**: Are we caching remote images? Are they sized correctly?
2.  **Touches**: Are hit slops large enough (min 44px)?
3.  **Permissions**: Do we handle permission formatting and graceful fallbacks?
4.  **Offline**: Does the app crash without internet? (NetInfo usage).
5.  **Jank**: Zero frame drops allowed (60fps target).
