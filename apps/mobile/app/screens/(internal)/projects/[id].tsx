import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import { useProject, useTasks, useCompleteTask } from '@/app/lib/shared-hooks';
import { Feather } from '@expo/vector-icons';
import Card from '@/app/components/shared/card.component';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const projectId = typeof id === 'string' ? id : '';
  
  const router = useRouter();
  const colors = useThemeColors();

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
    // We would need to pass default Project ID to task creation. 
    // The current task.tsx logic tries to infer project or use first one.
    // Ideally we pass params.
    router.push({
        pathname: '/screens/(internal)/task',
        params: { projectId: projectId } // Need to ensure task.tsx reads this
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
              <Text style={{color: colors.text}}>Proyecto no encontrado.</Text>
          </View>
      );
  }

  const completedCount = tasks?.filter(t => t.status === 'COMPLETED').length || 0;
  const totalCount = tasks?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: project.name }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Project Header Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: project.color }]}>
                <View style={styles.headerTop}>
                    <View style={[styles.iconBox, { backgroundColor: `${project.color}20` }]}>
                        <Feather name="folder" size={24} color={project.color} />
                    </View>
                    <View style={{flex: 1}}>
                         <Text style={[styles.projectName, { color: colors.text }]}>{project.name}</Text>
                         {project.description && (
                             <Text style={[styles.projectDesc, { color: colors.textSecondary }]}>{project.description}</Text>
                         )}
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Progreso</Text>
                        <Text style={[styles.statValue, { color: project.color }]}>{progressPercent}%</Text>
                    </View>
                    <View>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tareas</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{completedCount}/{totalCount}</Text>
                    </View>
                </View>

                 {/* Bar */}
                 <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${progressPercent}%`,
                        backgroundColor: project.color
                      }
                    ]} 
                  />
                </View>
            </View>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tareas</Text>

        {/* Task List */}
        {tasks && tasks.length > 0 ? (
            tasks.map((task, index) => (
                <Animated.View key={task.id} entering={FadeInDown.delay(200 + (index * 50))}>
                     <Card 
                        onPress={() => handleTaskPress(task.id)}
                        style={styles.taskCard}
                     >
                         <View style={styles.taskRow}>
                            <Pressable onPress={() => completeTaskMutation.mutate(task.id)}>
                                <Feather 
                                    name={task.status === 'COMPLETED' ? "check-circle" : "circle"} 
                                    size={24} 
                                    color={task.status === 'COMPLETED' ? colors.success : colors.textMuted}
                                />
                            </Pressable>
                            <View style={{flex: 1}}>
                                <Text style={[
                                    styles.taskTitle, 
                                    { 
                                        color: colors.text,
                                        textDecorationLine: task.status === 'COMPLETED' ? 'line-through' : 'none',
                                        opacity: task.status === 'COMPLETED' ? 0.6 : 1
                                    }
                                ]}>
                                    {task.title}
                                </Text>
                            </View>
                         </View>
                     </Card>
                </Animated.View>
            ))
        ) : (
             <View style={styles.emptyTasks}>
                 <Text style={{color: colors.textMuted}}>No hay tareas en este proyecto.</Text>
             </View>
        )}
        
        <View style={{height: 80}} />
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabContainer}>
         <Pressable 
            onPress={handleCreateTaskInProject}
            style={[styles.fab, { backgroundColor: project.color || colors.primary, shadowColor: project.color }]}
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
      borderRadius: 20,
      borderLeftWidth: 6,
      marginBottom: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5
  },
  headerTop: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 20
  },
  iconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center'
  },
  projectName: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 4
  },
  projectDesc: {
      fontSize: 14,
      lineHeight: 20
  },
  statsRow: {
      flexDirection: 'row',
      gap: 32,
      marginBottom: 16
  },
  statLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 2
  },
  statValue: {
      fontSize: 20,
      fontWeight: 'bold'
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      marginLeft: 4
  },
  taskCard: {
      marginBottom: 12,
      padding: 16
  },
  taskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
  },
  taskTitle: {
      fontSize: 16,
      fontWeight: '500'
  },
  emptyTasks: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
      borderRadius: 12,
      borderStyle: 'dashed'
  },
  fabContainer: {
      position: 'absolute',
      bottom: 24,
      right: 24,
  },
  fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
  }
});
