import React, { useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  signInWithGoogle,
  signInWithGitHub,
  closeBrowser,
} from "../../lib/oauth";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";

interface OAuthButtonProps {
  provider: "google" | "github";
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function OAuthButton({
  provider,
  onSuccess,
  onError,
}: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const colors = useThemeColors();

  const handlePress = async () => {
    try {
      setIsLoading(true);

      if (provider === "google") {
        await signInWithGoogle();
      } else {
        await signInWithGitHub();
      }

      await closeBrowser();
      onSuccess?.();
    } catch (error) {
      await closeBrowser();
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const isGoogle = provider === "google";
  const icon = isGoogle ? "chrome" : "github";
  const backgroundColor = isGoogle ? "#DB4437" : "#24292e";

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      style={[
        styles.button,
        {
          backgroundColor,
          opacity: isLoading ? 0.7 : 1,
        },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <View style={styles.content}>
          <Feather name={icon as any} size={20} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
