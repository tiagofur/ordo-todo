import { Stack } from "expo-router";
import ForceAuthentication from "@/app/components/auth/force-authentication.component";
import { useNotificationsSocket } from "@/app/hooks/use-notifications-socket";

export default function InternalLayout() {
  useNotificationsSocket();

  return (
    <ForceAuthentication>
      <Stack initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="task"
          options={{
            headerTitle: "Editar Tarea",
            headerShown: true,
            headerBackTitle: "Voltar",
          }}
        />
        <Stack.Screen
          name="ai-chat"
          options={{
            headerTitle: "Asistente AI",
            headerShown: true,
            headerBackTitle: "Voltar",
            presentation: 'modal'
          }}
        />
      </Stack>
    </ForceAuthentication>
  );
}
