import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'primary' | 'success' | 'warning' | 'error';
  padding?: number;
  animated?: boolean;
}

export default function Card({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 16,
  animated = true,
}: CardProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: 0.1 + pressed.value * 0.05,
      elevation: 4 + pressed.value * 4,
    };
  });

  const handlePressIn = () => {
    if (animated && onPress) {
      scale.value = withSpring(0.98, { damping: 15 });
      pressed.value = withTiming(1, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      scale.value = withSpring(1, { damping: 15 });
      pressed.value = withTiming(0, { duration: 150 });
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surfaceElevated,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.border,
        };
      case 'primary':
        return {
          backgroundColor: colors.primaryLight,
          borderWidth: 0,
        };
      case 'success':
        return {
          backgroundColor: colors.successLight,
          borderWidth: 0,
        };
      case 'warning':
        return {
          backgroundColor: colors.warningLight,
          borderWidth: 0,
        };
      case 'error':
        return {
          backgroundColor: colors.errorLight,
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        };
    }
  };

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        getVariantStyle(),
        {
          padding,
          shadowColor: colors.shadowColor,
        },
        animated ? animatedStyle : {},
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
