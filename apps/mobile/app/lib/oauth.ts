import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export interface OAuthResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export async function signInWithGoogle(): Promise<OAuthResult> {
  try {
    await WebBrowser.openBrowserAsync(
      `${process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3001"}/auth/google`,
    );

    return {
      accessToken: "",
      refreshToken: "",
      userId: "",
    };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

export async function signInWithGitHub(): Promise<OAuthResult> {
  try {
    await WebBrowser.openBrowserAsync(
      `${process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3001"}/auth/github`,
    );

    return {
      accessToken: "",
      refreshToken: "",
      userId: "",
    };
  } catch (error) {
    console.error("GitHub sign-in error:", error);
    throw error;
  }
}

export async function closeBrowser() {
  await WebBrowser.dismissBrowser();
}
