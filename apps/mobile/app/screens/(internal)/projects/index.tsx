import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import { useProjects, useWorkspaces } from '@/app/lib/shared-hooks';
import { useWorkspaceStore } from '@/app/lib/stores';
import ProjectCard from '@/app/components/project/project-card.component';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProjectsListScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  // Workspace Sync Logic (Shared with other screens)
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  const effectiveWorkspaceId = selectedWorkspaceId || workspaces?.[0]?.id;

  // Projects logic
  const { data: projects, isLoading: isLoadingProjects, error } = useProjects(effectiveWorkspaceId || "");

  const handleCreateProject = () => {
      router.push('/screens/(internal)/projects/create');
  };

  const handleProjectPress = (projectId: string) => {
      router.push({
          pathname: '/screens/(internal)/projects/[id]',
          params: { id: projectId }
      });
  };

  if (isLoadingWorkspaces || (isLoadingProjects && effectiveWorkspaceId)) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
      return (
        <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
            <Text style={{color: colors.error}}>Error loading projects.</Text>
        </View>
      )
  }

  if (!effectiveWorkspaceId) {
       return (
        <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
            <Text style={{color: colors.text}}>No workspace selected.</Text>
        </View>
      )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={projects}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
             <ProjectCard 
                project={item} 
                onPress={() => handleProjectPress(item.id)} 
             />
          </Animated.View>
        )}
        ListEmptyComponent={
            <View style={styles.emptyState}>
                <Feather name="folder" size={48} color={colors.textMuted} style={{marginBottom: 16}} />
                <Text style={{color: colors.textSecondary, fontSize: 16}}>No hay proyectos todavía</Text>
                <Text style={{color: colors.textMuted, textAlign: 'center', marginTop: 8}}>
                    Crea uno para organizar tus tareas.
                </Text>
            </View>
        }
      />

       {/* FAB for Creating Project */}
       <View style={styles.fabContainer}>
         <Pressable 
            onPress={handleCreateProject}
            style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
         >
            <Feather name="plus" size={24} color="#FFF" />
            <Text style={styles.fabText}>Nuevo Proyecto</Text>
         </Pressable>
       </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
      paddingHorizontal: 32
  },
  fabContainer: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      left: 24, // Optional: make it full width if desired, but centered float is nice
      alignItems: 'center'
  },
  fab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 24,
      elevation: 6,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      gap: 8
  },
  fabText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 16
  }
});
