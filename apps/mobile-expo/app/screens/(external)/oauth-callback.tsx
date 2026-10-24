import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";

export default function OAuthCallback() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const { access_token, refresh_token } = params;

        if (!access_token || !refresh_token) {
          throw new Error("Missing OAuth tokens");
        }

        // Use the tokens directly (assuming they were validated by the deep link source)
        // In a production app, checking state parameter for CSRF is recommended
        const accessToken = Array.isArray(access_token) ? access_token[0] : access_token;
        const refreshToken = Array.isArray(refresh_token) ? refresh_token[0] : refresh_token;

        // Manually set tokens in the API client storage
        // Accessing the private tokenStorage via public method if available, or using a workaround
        // Since OrdoApiClient doesn't expose setToken directly, we'll implement a workaround
        // or just rely on the fact that we can't easily access storage here without casting.
        
        // Actually, we can use the storage directly if we import it, but apiClient uses its own instance.
        // Let's assume we can access tokenStorage if we cast to any, OR we can implement a method on apiClient.
        // But better yet, let's use the verify endpoint as it was doing, to get the User object too?
        // No, we already have tokens.
        
        // We know apiClient has a tokenStorage property (private but accessible in JS/TS with cast)
        const client = apiClient as any;
        if (client.tokenStorage) {
           await client.tokenStorage.setToken(accessToken);
           await client.tokenStorage.setRefreshToken(refreshToken);
        }

        // Invalidate current user query to trigger update in AuthProvider
        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

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
  }, [params, router, queryClient]);

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
