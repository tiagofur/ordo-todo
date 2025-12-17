import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import React, { useState, useCallback } from "react";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Card from "@/app/components/shared/card.component";
import { useTasks, useCompleteTask, useObjectivesDashboardSummary } from "@/app/lib/shared-hooks";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

// Filter keys for translation
const FILTER_KEYS = ["all", "today", "upcoming", "completed"] as const;

export default function Home() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<typeof FILTER_KEYS[number]>("all");
  
  // Hooks
  const { data: tasks, isLoading, error, refetch } = useTasks();
  const { data: objectiveSummary } = useObjectivesDashboardSummary();
  const completeTaskMutation = useCompleteTask();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const handeCreateTask = () => {
    router.push('/screens/(internal)/task');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return colors.priorityHigh;
      case "MEDIUM":
        return colors.priorityMedium;
      case "LOW":
        return colors.priorityLow;
      default:
        return colors.textMuted;
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return colors.priorityHighBg;
      case "MEDIUM":
        return colors.priorityMediumBg;
      case "LOW":
        return colors.priorityLowBg;
      default:
        return colors.backgroundSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "play-circle";
      case "COMPLETED":
        return "check-circle";
      default:
        return "circle";
    }
  };

  const formattedDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    if (selectedFilter === "completed") return tasks.filter(t => t.status === "COMPLETED");
    if (selectedFilter === "all") return tasks.filter(t => t.status !== "COMPLETED");
    
    const today = new Date().toISOString().split('T')[0];
    if (selectedFilter === "today") {
      return tasks.filter(t => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate).toISOString().startsWith(today));
    }
    
    if (selectedFilter === "upcoming") {
       return tasks.filter(t => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] > today);
    }

    return tasks.filter(t => t.status !== "COMPLETED");
  }, [tasks, selectedFilter]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error, marginBottom: 10 }}>{t('Mobile.home.loadError')}</Text>
        <Pressable onPress={() => refetch()} style={{ padding: 10, backgroundColor: colors.card, borderRadius: 8 }}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t('Mobile.home.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  // Calculate stats from real data
  const pendingCount = tasks?.filter(t => t.status !== "COMPLETED").length || 0;
  const completedCount = tasks?.filter(t => t.status === "COMPLETED").length || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = tasks?.filter(t => t.dueDate && new Date(t.dueDate).toISOString().startsWith(todayStr)).length || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.greeting}>{t('Mobile.home.greeting')}</Text>
          <Text style={styles.title}>{t('Mobile.home.myTasks')}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>{t('Mobile.home.pending')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>{t('Mobile.home.completed')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todayCount}</Text>
            <Text style={styles.statLabel}>{t('Mobile.home.today')}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250)} style={{marginTop: 16, paddingHorizontal: 20, marginBottom: 10}}>
             <Pressable 
                onPress={() => router.push('/screens/(internal)/goals')} 
                style={{
                    backgroundColor: 'rgba(255,255,255,0.15)', 
                    padding: 12, 
                    borderRadius: 12, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.2)'
                }}
            >
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                    <View style={{padding:6, backgroundColor:'rgba(255,255,255,0.2)', borderRadius:8}}>
                         <Feather name="target" size={18} color="#fff" />
                    </View>
                    <View>
                        <Text style={{color: '#fff', fontWeight: '700', fontSize: 14}}>OKRs & Goals</Text>
                        <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 11}}>{objectiveSummary?.total || 0} active</Text>
                    </View>
                </View>
                <View style={{alignItems:'flex-end'}}>
                    <Text style={{color: '#fff', fontWeight: '800', fontSize: 16}}>{Math.round(objectiveSummary?.averageProgress || 0)}%</Text>
                </View>
            </Pressable>
        </Animated.View>
      </LinearGradient>

      {/* Filtros */}
      <Animated.View entering={FadeInRight.delay(300)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_KEYS.map((filterKey, index) => (
            <Pressable
              key={filterKey}
              onPress={() => setSelectedFilter(filterKey)}
            >
              <Animated.View
                entering={FadeInRight.delay(300 + index * 50)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedFilter === filterKey
                        ? colors.primary
                        : colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        selectedFilter === filterKey
                          ? colors.buttonPrimaryText
                          : colors.textSecondary,
                      fontWeight: selectedFilter === filterKey ? "700" : "600",
                    },
                  ]}
                >
                  {t(`Mobile.filters.${filterKey}`)}
                </Text>
              </Animated.View>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Lista de tareas */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {filteredTasks.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Feather name="check-circle" size={48} color={colors.textMuted} style={{ marginBottom: 10, opacity: 0.5 }} />
            <Text style={{ color: colors.textSecondary }}>
              {selectedFilter === "all" ? t('Mobile.home.noTasks') : t('Mobile.home.noTasksInView')}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task, index) => (
            <Animated.View
              key={task.id}
              entering={FadeInDown.delay(400 + index * 100).springify()}
              layout={Layout.springify()}
            >
              <Card
                onPress={() => router.push({ pathname: '/screens/(internal)/task', params: { id: task.id } })}
                style={styles.taskCard}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskHeaderLeft}>
                    <Pressable 
                      onPress={() => handleCompleteTask(task.id)}
                      hitSlop={10}
                    >
                      <Feather
                        name={getStatusIcon(task.status)}
                        size={24}
                        color={
                          task.status === "COMPLETED"
                            ? colors.success
                            : colors.primary
                        }
                      />
                    </Pressable>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskTitle, { color: colors.text, textDecorationLine: task.status === 'COMPLETED' ? 'line-through' : 'none' }]}>
                        {task.title}
                      </Text>
                      {task.description ? (
                        <Text
                          style={[
                            styles.taskDescription,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={2}
                        >
                          {task.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                <View style={styles.taskFooter}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityBg(task.priority) },
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: getPriorityColor(task.priority) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(task.priority) },
                      ]}
                    >
                      {task.priority === "HIGH"
                        ? "Alta"
                        : task.priority === "MEDIUM"
                        ? "Media"
                        : "Baja"}
                    </Text>
                  </View>

                  {task.dueDate && (
                    <View style={styles.dueDateContainer}>
                      <Feather
                        name="clock"
                        size={14}
                        color={colors.textMuted}
                      />
                      <Text
                        style={[styles.dueDate, { color: colors.textMuted }]}
                      >
                         {formattedDate(task.dueDate)}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            </Animated.View>
          ))
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón para agregar tarea - Fixed Position */}
      <Animated.View
         entering={FadeInDown.delay(800).springify()}
         style={styles.fabContainer}
      >
        <Pressable onPress={handeCreateTask}>
          <View
            style={[
              styles.addTaskButton,
              {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
          >
            <Feather name="plus" size={24} color={colors.buttonPrimaryText} />
            <Text
              style={[styles.addTaskText, { color: colors.buttonPrimaryText }]}
            >
              Nueva Tarea
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    opacity: 0.9,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: -1,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 4,
    fontWeight: "600",
  },
  filtersContainer: {
    marginVertical: 16,
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskCard: {
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  taskHeaderLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "700",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Replaced inline add button with FAB style
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addTaskText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
