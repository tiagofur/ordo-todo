import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/app/contexts/auth.context";

export default function OAuthCallback() {
  const router = useRouter();
  const { user, login } = useAuth();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const { access_token, refresh_token, user_id } = params;

        if (!access_token || !refresh_token) {
          throw new Error("Missing OAuth tokens");
        }

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3001"}/auth/oauth/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accessToken: access_token,
              refreshToken: refresh_token,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to verify OAuth tokens");
        }

        const data = await response.json();

        if (data.accessToken && data.refreshToken && data.user) {
          login({
            email: data.user.email,
            password: "",
          });
        }

        setTimeout(() => {
          router.replace("/(tabs)");
        }, 500);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(err instanceof Error ? err.message : "OAuth callback failed");

        setTimeout(() => {
          router.replace("/(external)/auth");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [params, router, login]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.text}>Signing you in...</Text>
        </>
      ) : error ? (
        <>
          <Text style={styles.error}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.text}>Redirecting to login...</Text>
        </>
      ) : (
        <>
          <Text style={styles.success}>✓</Text>
          <Text style={styles.text}>Signed in successfully!</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: "#666666",
  },
  error: {
    fontSize: 48,
    color: "#FF6B6B",
  },
  errorMessage: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  success: {
    fontSize: 48,
    color: "#22C55E",
  },
});
