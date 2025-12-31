import { Stack } from "expo-router";
import { MessageProvider } from "./data/contexts/message.context";
import { ThemeProvider } from "./data/contexts/theme.context";
import ToastContainer from "./components/shared/toast-container.component";
import { MobileFeaturesProvider } from "./data/contexts/mobile-features.context";
import { QueryProvider } from "./providers/query-provider";
import { AuthProvider } from "./contexts/auth.context";
import { I18nProvider } from "./providers/i18n-provider";
import { initializeStores } from "./lib/stores";
import { ErrorBoundary } from "./components/shared/error-boundary";
import { PushNotificationsProvider } from "./providers/push-notifications-provider";

// Initialize shared stores persistence with AsyncStorage
initializeStores();

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <I18nProvider>
          <ThemeProvider>
            <MessageProvider>
              <AuthProvider>
                <MobileFeaturesProvider>
                  <PushNotificationsProvider>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                      }}
                    >
                      <Stack.Screen name="screens" />
                      <Stack.Screen name="index" />
                    </Stack>
                    <ToastContainer />
                  </PushNotificationsProvider>
                </MobileFeaturesProvider>
              </AuthProvider>
            </MessageProvider>
          </ThemeProvider>
        </I18nProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
