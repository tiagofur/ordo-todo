import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDesignTokens } from '@/app/lib/use-design-tokens';
import { useProjects, useWorkspaces } from '@/app/lib/shared-hooks';
import { useWorkspaceStore } from '@/app/lib/stores';
import ProjectCard from '@/app/components/project/project-card.component';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useMediaQuery } from '@/app/lib/hooks/use-media-query';

export default function ProjectsListScreen() {
  const router = useRouter();
  const { colors } = useDesignTokens();
  const { isTablet } = useMediaQuery();

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
        <ActivityIndicator size="large" color={colors.section.projects} />
      </View>
    );
  }

  if (error) {
      return (
        <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
            <Text style={{color: colors.destructive}}>Error loading projects.</Text>
        </View>
      )
  }

  if (!effectiveWorkspaceId) {
       return (
        <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
            <Text style={{color: colors.foreground}}>No workspace selected.</Text>
        </View>
      )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.FlatList
        key={isTablet ? 'tablet' : 'mobile'}
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? { gap: 16, paddingHorizontal: 4 } : undefined}
        itemLayoutAnimation={LinearTransition}
        data={projects}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.headerMain}>
              <View style={[styles.headerIcon, { backgroundColor: colors.section.projects }]}>
                <Feather name="folder" size={24} color="#FFF" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Proyectos</Text>
                <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                  Organiza tus tareas en proyectos
                </Text>
              </View>
            </View>
          </View>
        }
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
                <Feather name="folder" size={48} color={colors.mutedForeground} style={{marginBottom: 16}} />
                <Text style={{color: colors.mutedForeground, fontSize: 16}}>No hay proyectos todavía</Text>
                <Text style={{color: colors.mutedForeground, textAlign: 'center', marginTop: 8}}>
                    Crea uno para organizar tus tareas.
                </Text>
            </View>
        }
      />

       {/* FAB for Creating Project */}
       <View style={styles.fabContainer}>
         <Pressable 
            onPress={handleCreateProject}
            style={[styles.fab, { backgroundColor: colors.section.projects, shadowColor: colors.section.projects }]}
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
  headerContainer: {
      marginBottom: 24,
      paddingTop: 8,
  },
  headerMain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
  },
  headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
  },
  headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
  },
  headerSubtitle: {
      fontSize: 14,
      marginTop: 2,
  },
  listContent: {
    padding: 20,
    paddingBottom: 120, // Space for FAB
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
