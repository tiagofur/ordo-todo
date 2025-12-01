import { Stack } from "expo-router";
import { MessageProvider } from "./data/contexts/message.context";
import { ThemeProvider } from "./data/contexts/theme.context";
import ToastContainer from "./components/shared/toast-container.component";
import { MobileFeaturesProvider } from "./data/contexts/mobile-features.context";
import { QueryProvider } from "./providers/query-provider";
import { AuthProvider } from "./contexts/auth.context";

export default function RootLayout() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <MessageProvider>
          <AuthProvider>
            <MobileFeaturesProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="screens" />
                <Stack.Screen name="index" />
              </Stack>
              <ToastContainer />
            </MobileFeaturesProvider>
          </AuthProvider>
        </MessageProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
