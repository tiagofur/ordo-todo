import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";

interface CustomButtonProps {
  title: string;
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export default function CustomButton({
  title,
  variant = "primary",
  size = "md",
  onPress,
  style,
  textStyle,
  disabled,
  icon,
  isLoading = false,
}: CustomButtonProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (isLoading || disabled) return;
    scale.value = withSpring(0.96, { damping: 15 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    if (isLoading || disabled) return;
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const getButtonStyle = () => {
    const baseStyle = {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    };

    switch (variant) {
      case "primary":
        return { ...baseStyle, backgroundColor: colors.buttonPrimary };
      case "secondary":
        return { ...baseStyle, backgroundColor: colors.secondary };
      case "danger":
        return { ...baseStyle, backgroundColor: colors.error };
      case "success":
        return { ...baseStyle, backgroundColor: colors.success };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: colors.buttonPrimary,
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return { ...baseStyle, backgroundColor: colors.buttonPrimary };
    }
  };

  const getTextStyle = () => {
    if (variant === "outline") return { color: colors.buttonPrimary };
    return { color: colors.buttonPrimaryText };
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case "lg":
        return { paddingVertical: 18, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 16, paddingHorizontal: 24 };
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case "sm":
        return { fontSize: 14 };
      case "lg":
        return { fontSize: 18 };
      default:
        return { fontSize: 16 };
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
    >
      <Animated.View
        style={[
          styles.button,
          getButtonStyle(),
          getSizeStyle(),
          (disabled || isLoading) && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === "outline" ? colors.buttonPrimary : colors.buttonPrimaryText} />
        ) : (
          <>
            {icon && <Animated.View style={styles.icon}>{icon}</Animated.View>}
            <Text
              style={[
                styles.buttonText,
                getTextStyle(),
                getTextSizeStyle(),
                disabled && { color: colors.textMuted },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginVertical: 8,
  },
  buttonText: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 8,
  },
});
