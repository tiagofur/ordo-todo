import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useDesignTokens } from '@/app/lib/use-design-tokens';
import { useProject, useTasks, useCompleteTask } from '@/app/lib/shared-hooks';
import { Feather } from '@expo/vector-icons';
import Card from '@/app/components/shared/card.component';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useMediaQuery } from '@/app/lib/hooks/use-media-query';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const projectId = typeof id === 'string' ? id : '';
  
  const router = useRouter();
  const { colors } = useDesignTokens();
  const { isTablet } = useMediaQuery();

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: tasks, isLoading: isLoadingTasks } = useTasks(projectId);
  const completeTaskMutation = useCompleteTask();

  const isLoading = isLoadingProject || isLoadingTasks;

  const handleTaskPress = (taskId: string) => {
    router.push({
        pathname: '/screens/(internal)/task',
        params: { id: taskId }
    });
  };
  
  const handleCreateTaskInProject = () => {
    router.push({
        pathname: '/screens/(internal)/task',
        params: { projectId: projectId }
    });
  };

  if (isLoading) {
      return (
          <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      );
  }

  if (!project) {
       return (
          <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
              <Text style={{ color: colors.foreground }}>Proyecto no encontrado.</Text>
          </View>
      );
  }

  const projectColor = project.color || colors.section.projects;
  const completedCount = tasks?.filter(t => t.status === 'COMPLETED').length || 0;
  const totalCount = tasks?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
            title: project.name,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background }
        }} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Header - Standard Iconic Format */}
        <Animated.View entering={FadeInDown.duration(400).springify()}>
            <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.headerTop}>
                    <View style={[styles.iconBox, { backgroundColor: projectColor, shadowColor: projectColor, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}>
                        <Feather name="folder" size={24} color="#FFF" />
                    </View>
                    <View style={{flex: 1}}>
                         <Text style={[styles.projectName, { color: colors.foreground }]}>{project.name}</Text>
                         {project.description && (
                             <Text style={[styles.projectDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{project.description}</Text>
                         )}
                    </View>
                </View>

                {/* Progress Section */}
                <View style={styles.statsRow}>
                    <View>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Progreso</Text>
                        <Text style={[styles.statValue, { color: projectColor }]}>{progressPercent}%</Text>
                    </View>
                    <View>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Tareas</Text>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{completedCount}/{totalCount}</Text>
                    </View>
                </View>

                 {/* Premium Progress Bar */}
                 <View style={[styles.progressBarBg, { backgroundColor: colors.muted }]}>
                  <Animated.View 
                    layout={LinearTransition}
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${progressPercent}%`,
                        backgroundColor: projectColor,
                        shadowColor: projectColor,
                        shadowOpacity: 0.5,
                        shadowRadius: 4,
                        elevation: 2
                      }
                    ]} 
                  />
                </View>
            </View>
        </Animated.View>

        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tareas del Proyecto</Text>
            {totalCount > 0 && <View style={[styles.badge, { backgroundColor: colors.muted }]}><Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{totalCount}</Text></View>}
        </View>

        {/* Task List - Staggered Animations */}
        {tasks && tasks.length > 0 ? (
            <View style={isTablet ? { flexDirection: 'row', flexWrap: 'wrap', gap: 16 } : undefined}>
            {tasks.map((task, index) => (
                <Animated.View 
                    key={task.id} 
                    entering={FadeInDown.delay(200 + (index * 50)).duration(400).springify()}
                    layout={LinearTransition}
                    style={isTablet ? { width: '48%' } : undefined}
                >
                     <Card 
                        onPress={() => handleTaskPress(task.id)}
                        style={styles.taskCard}
                        padding={16}
                     >
                         <View style={styles.taskRow}>
                            <Pressable 
                                onPress={() => completeTaskMutation.mutate(task.id)}
                                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                            >
                                <View style={[
                                    styles.checkbox, 
                                    { borderColor: task.status === 'COMPLETED' ? colors.semantic.success : colors.border },
                                    task.status === 'COMPLETED' && { backgroundColor: colors.semantic.success }
                                ]}>
                                    {task.status === 'COMPLETED' && <Feather name="check" size={14} color="#FFF" />}
                                </View>
                            </Pressable>
                            <View style={{flex: 1}}>
                                <Text style={[
                                    styles.taskTitle, 
                                    { 
                                        color: task.status === 'COMPLETED' ? colors.mutedForeground : colors.foreground,
                                        textDecorationLine: task.status === 'COMPLETED' ? 'line-through' : 'none',
                                    }
                                ]}>
                                    {task.title}
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                         </View>
                     </Card>
                </Animated.View>
            ))}
            </View>
        ) : (
             <View style={[styles.emptyTasks, { borderColor: colors.border }]}>
                 <Feather name="clipboard" size={40} color={colors.muted} />
                 <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No hay tareas asignadas</Text>
             </View>
        )}
        
        <View style={{height: 100}} />
      </ScrollView>

      {/* FAB - Using Project Color */}
      <View style={styles.fabContainer}>
         <Pressable 
            onPress={handleCreateTaskInProject}
            style={({ pressed }) => [
                styles.fab, 
                { 
                    backgroundColor: projectColor, 
                    shadowColor: projectColor,
                    transform: [{ scale: pressed ? 0.95 : 1 }]
                }
            ]}
         >
            <Feather name="plus" size={24} color="#FFF" />
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
      alignItems: 'center'
  },
  scrollContent: {
      padding: 20
  },
  headerCard: {
      padding: 20,
      borderRadius: 24,
      borderWidth: 1,
      marginBottom: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2
  },
  headerTop: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24
  },
  iconBox: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center'
  },
  projectName: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 4,
  },
  projectDesc: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500'
  },
  statsRow: {
      flexDirection: 'row',
      gap: 32,
      marginBottom: 16
  },
  statLabel: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5
  },
  statValue: {
      fontSize: 22,
      fontWeight: '800'
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
      marginLeft: 4
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
  },
  badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
  },
  badgeText: {
      fontSize: 12,
      fontWeight: '700',
  },
  taskCard: {
      marginBottom: 12,
  },
  taskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
  },
  checkbox: {
      width: 24,
      height: 24,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center'
  },
  taskTitle: {
      fontSize: 16,
      fontWeight: '600'
  },
  emptyTasks: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderRadius: 24,
      borderStyle: 'dashed',
      gap: 12
  },
  emptyText: {
      fontSize: 16,
      fontWeight: '600'
  },
  fabContainer: {
      position: 'absolute',
      bottom: 30,
      right: 24,
  },
  fab: {
      width: 60,
      height: 60,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
  }
});

