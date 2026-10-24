import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";

interface LogoProps {
  big?: boolean;
  animated?: boolean;
}

export default function Logo({ big = false, animated = true }: LogoProps) {
  const colors = useThemeColors();
  const iconScale = useSharedValue(1);
  const iconRotate = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateX = useSharedValue(-20);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateX: textTranslateX.value }],
  }));

  useEffect(() => {
    if (animated) {
      // Animación del icono
      iconScale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
      iconRotate.value = withSequence(
        withTiming(360, { duration: 600, easing: Easing.ease }),
        withTiming(0, { duration: 0 })
      );

      // Animación del texto
      textOpacity.value = withTiming(1, { duration: 500, easing: Easing.ease });
      textTranslateX.value = withSpring(0, { damping: 15 });
    } else {
      iconScale.value = 1;
      iconRotate.value = 0;
      textOpacity.value = 1;
      textTranslateX.value = 0;
    }
  }, [animated]);

  const iconSize = big ? 48 : 32;
  const fontSize = big ? 32 : 24;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={[
            styles.iconGradient,
            {
              width: iconSize + 16,
              height: iconSize + 16,
              borderRadius: (iconSize + 16) / 2,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="check-circle" size={iconSize} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>

      <Animated.View style={textAnimatedStyle}>
        <Text
          style={[
            styles.text,
            {
              fontSize,
              color: colors.text,
            },
          ]}
        >
          Ordo<Text style={{ color: colors.primary }}>Todo</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    gap: 12,
  },
  iconContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconGradient: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "800",
    letterSpacing: -0.5,
  },
});
