import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";

interface UserAvatarProps {
  name: string;
  size?: number;
  animated?: boolean;
}

// Conjunto de gradientes vibrantes para avatares
const AVATAR_GRADIENTS = [
  ["#667EEA", "#9F7AEA"], // Purple
  ["#48BB78", "#38A169"], // Green
  ["#ED8936", "#F6AD55"], // Orange
  ["#4299E1", "#63B3ED"], // Blue
  ["#F56565", "#FC8181"], // Red
  ["#9F7AEA", "#B794F4"], // Light Purple
  ["#38B2AC", "#4FD1C5"], // Teal
];

export default function UserAvatar({
  name,
  size = 80,
  animated = true,
}: UserAvatarProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(0.8);
  const rotate = useSharedValue(0);

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const getGradientForName = (fullName: string) => {
    // Genera un índice basado en el nombre para seleccionar un gradiente
    const hash = fullName.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  useEffect(() => {
    if (animated) {
      scale.value = withSpring(1, { damping: 12 });
      rotate.value = withSequence(
        withTiming(-5, { duration: 200 }),
        withTiming(5, { duration: 200 }),
        withTiming(0, { duration: 200 })
      );
    } else {
      scale.value = 1;
    }
  }, [animated]);

  const fontSize = size * 0.4;
  const gradient = getGradientForName(name);

  return (
    <Animated.View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          shadowColor: colors.shadowColor,
        },
        animated && animatedStyle,
      ]}
    >
      <LinearGradient
        colors={gradient}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.initials, { fontSize }]}>
          {getInitials(name)}
        </Text>
      </LinearGradient>

      {/* Ring decorativo */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderColor: `${gradient[0]}40`,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: "relative",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    top: -4,
    left: -4,
    borderWidth: 2,
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
