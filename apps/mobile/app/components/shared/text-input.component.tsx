import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  Text,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";

const AnimatedView = Animated.View;

interface CustomTextInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function CustomTextInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  ...props
}: CustomTextInputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const borderWidth = useSharedValue(2);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
    transform: [{ scale: scale.value }],
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderWidth.value = withTiming(2.5, { duration: 200 });
    scale.value = withSpring(1.01, { damping: 15 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderWidth.value = withTiming(2, { duration: 200 });
    scale.value = withSpring(1, { damping: 15 });
  };

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.inputFocused;
    return colors.inputBorder;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? colors.inputFocused : colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <AnimatedView
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.input,
            borderColor: getBorderColor(),
            shadowColor: colors.shadowColor,
          },
          animatedStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },
            !!leftIcon && styles.inputWithLeftIcon,
            !!rightIcon && styles.inputWithRightIcon,
            style,
          ] as any}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholderTextColor={colors.inputPlaceholder}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </AnimatedView>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "600",
  },
});
