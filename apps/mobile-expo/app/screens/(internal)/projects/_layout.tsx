import { Stack } from 'expo-router';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';

export default function ProjectsLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false, // Clean look
        contentStyle: {
            backgroundColor: colors.background,
        }
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Proyectos",
          headerLargeTitle: true, // Native large header feeling on iOS
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "", // Dynamic title usually set in component or options
          headerBackTitle: "Proyectos"
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Nuevo Proyecto",
          presentation: 'modal', // Modal presentation for creation
        }}
      />
    </Stack>
  );
}
