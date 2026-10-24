
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkspace, useProjects } from '@/app/lib/shared-hooks';
import { useDesignTokens } from '@/app/lib/use-design-tokens';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import Card from '@/app/components/shared/card.component';
import { useTranslation } from 'react-i18next';

export default function WorkspaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useDesignTokens();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspace(id!);
  const { data: projects, isLoading: isLoadingProjects } = useProjects(id!);

  // Responsive columns: 1 for mobile, 2 for tablet, 3 for large tablet/desktop-like
  const numColumns = width >= 1024 ? 3 : (width >= 768 ? 2 : 1);
  const isTablet = width >= 768;

  const isLoading = isLoadingWorkspace || isLoadingProjects;

  const handleProjectPress = (projectId: string) => {
    router.push(`/screens/(internal)/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!workspace) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={{ color: colors.foreground }}>Workspace not found</Text>
      </View>
    );
  }

  const workspaceColor = workspace.color || colors.section.workspaces;

  const renderProjectItem = ({ item: project, index }: { item: any, index: number }) => {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        layout={LinearTransition}
        style={[
            styles.cardWrapper,
            { width: isTablet ? `${100 / numColumns}%` : '100%' }
        ]}
      >
        <Card
          onPress={() => handleProjectPress(project.id)}
          style={[styles.projectCard, { borderColor: project.color ? `${project.color}30` : colors.border }]}
          padding={16}
        >
          <View style={styles.projectHeader}>
            <View style={[styles.projectIcon, { backgroundColor: `${project.color || colors.primary}20` }]}>
                <Feather name="folder" size={20} color={project.color || colors.primary} />
            </View>
            <View style={styles.projectInfo}>
                <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>
                    {project.name}
                </Text>
                <Text style={[styles.projectStats, { color: colors.mutedForeground }]}>
                    {project.stats?.totalTasks || 0} tasks
                </Text>
            </View>
          </View>
           {project.description && (
            <Text style={[styles.projectDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
              {project.description}
            </Text>
          )}
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerTitle: workspace.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
        }}
      />

      <Animated.FlatList
        key={numColumns} // Force re-render on column change
        data={projects || []}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={renderProjectItem}
        columnWrapperStyle={numColumns > 1 ? { gap: 0 } : undefined} // Gap handled by padding in wrapper
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Animated.View 
            entering={FadeInDown.springify()} 
            style={styles.headerContainer}
          >
             <View style={[styles.heroCard, { backgroundColor: workspaceColor }]}>
                <View style={styles.heroContent}>
                    <View style={styles.heroIconCircle}>
                         <Feather name="briefcase" size={32} color={workspaceColor} />
                    </View>
                    <View>
                        <Text style={styles.heroTitle}>{workspace.name}</Text>
                    </View>
                </View>
                {workspace.description && (
                    <Text style={styles.heroDescription}>{workspace.description}</Text>
                )}
                
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{projects?.length || 0}</Text>
                        <Text style={styles.statLabel}>Projects</Text>
                    </View>
                    <View style={styles.statDivider} />
                     <View style={styles.statItem}>
                        <Text style={styles.statValue}>{workspace.members ? workspace.members.length : (workspace.stats?.memberCount || 1)}</Text>
                        <Text style={styles.statLabel}>Members</Text>
                    </View>
                </View>
             </View>
             
             <View style={styles.sectionHeader}>
                 <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Projects</Text>
                 <Pressable style={({pressed}) => ({ opacity: pressed ? 0.7 : 1 })}>
                     <Feather name="plus-circle" size={24} color={colors.primary} />
                 </Pressable>
             </View>
          </Animated.View>
        }
        ListEmptyComponent={
             <View style={styles.emptyState}>
                <Feather name="folder" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    No projects found
                </Text>
             </View>
        }
      />
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
    paddingBottom: 40,
  },
  headerContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  heroType: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  heroDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardWrapper: {
      padding: 8,
  },
  projectCard: {
    borderLeftWidth: 4,
  },
  projectHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
  },
  projectIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
  },
  projectInfo: {
      flex: 1,
  },
  projectName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
  },
  projectStats: {
      fontSize: 12,
  },
  projectDesc: {
      fontSize: 13,
      lineHeight: 18,
  },
  emptyState: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
  },
  emptyText: {
      fontSize: 16,
  },
});
