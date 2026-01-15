import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import React, { useState, useCallback } from "react";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
  LinearTransition,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Card from "@/app/components/shared/card.component";
import { useTasks, useCompleteTask, useObjectivesDashboardSummary, useProductivityStreak, useTodayHabits, useCompleteHabit, useUncompleteHabit } from "@/app/lib/shared-hooks";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { MiniTimerWidget } from "@/app/components/dashboard/MiniTimerWidget";
import { NotesWidget } from "@/app/components/dashboard/NotesWidget";
import { MiniAIInsightsWidget } from "@/app/components/dashboard/MiniAIInsightsWidget";
import { TabletAIInsightsWidget } from "@/app/components/dashboard/TabletAIInsightsWidget";
import { useMediaQuery } from "@/app/lib/hooks/use-media-query";

// Filter keys for translation
const FILTER_KEYS = ["all", "today", "upcoming", "completed"] as const;

interface HabitItem {
  id: string;
  name: string;
  currentStreak: number;
  completions?: unknown[];
}

export default function Home() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { isTablet } = useMediaQuery();
  
  const [selectedFilter, setSelectedFilter] = useState<typeof FILTER_KEYS[number]>("all");
  
  // Hooks
  const { data: tasks, isLoading, error, refetch } = useTasks();
  const { data: objectiveSummary } = useObjectivesDashboardSummary();
  const { data: streakData } = useProductivityStreak();
  const { data: todayHabits } = useTodayHabits();
  const completeTaskMutation = useCompleteTask();
  const completeHabitMutation = useCompleteHabit();
  const uncompleteHabitMutation = useUncompleteHabit();

  // Calculate habits summary
  const habitsData = (Array.isArray(todayHabits) ? todayHabits : []) as HabitItem[];
  const completedHabits = habitsData.filter((h) => h.completions && h.completions.length > 0).length;
  const totalHabits = habitsData.length;

  const handleToggleHabit = async (habitId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await uncompleteHabitMutation.mutateAsync(habitId);
      } else {
        await completeHabitMutation.mutateAsync({ habitId });
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

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
      case "HIGH": return colors.priorityHigh;
      case "MEDIUM": return colors.priorityMedium;
      case "LOW": return colors.priorityLow;
      default: return colors.textMuted;
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "HIGH": return colors.priorityHighBg;
      case "MEDIUM": return colors.priorityMediumBg;
      case "LOW": return colors.priorityLowBg;
      default: return colors.backgroundSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "IN_PROGRESS": return "play-circle";
      case "COMPLETED": return "check-circle";
      default: return "circle";
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
        <ActivityIndicator size="large" color={colors.section.dashboard} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error, marginBottom: 10 }}>{t('Mobile.home.loadError')}</Text>
        <Pressable onPress={() => refetch()} style={{ padding: 10, backgroundColor: colors.card, borderRadius: 8 }}>
          <Text style={{ color: colors.section.dashboard, fontWeight: 'bold' }}>{t('Mobile.home.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  // Stats calculation
  const pendingCount = tasks?.filter(t => t.status !== "COMPLETED").length || 0;
  const completedCount = tasks?.filter(t => t.status === "COMPLETED").length || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = tasks?.filter(t => t.dueDate && new Date(t.dueDate).toISOString().startsWith(todayStr)).length || 0;

  // --- COMPONENTES REUTILIZABLES ---
  
  const StatsSummary = () => (
    <View style={styles.statsContainer}>
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
       {/* Streak Badge */}
       {streakData && streakData.currentStreak > 0 && (
         <View style={[styles.statCard, styles.streakCard]}>
           <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
             <Feather name="zap" size={18} color="#f97316" />
             <Text style={[styles.statNumber, {color: '#f97316'}]}>{streakData.currentStreak}</Text>
           </View>
           <Text style={[styles.statLabel, {fontSize: 10}]}>🔥 Racha</Text>
         </View>
       )}
    </View>
  );

  const ObjectivesCard = () => (
    <Pressable 
        onPress={() => router.push('/screens/(internal)/goals')} 
        style={[
            styles.objectivesCard,
            { backgroundColor: isTablet ? colors.card : 'rgba(255,255,255,0.15)', borderColor: isTablet ? colors.border : 'rgba(255,255,255,0.2)' }
        ]}
    >
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <View style={{padding:6, backgroundColor: isTablet ? `${colors.section.dashboard}20` : 'rgba(255,255,255,0.2)', borderRadius:8}}>
                  <Feather name="target" size={18} color={isTablet ? colors.section.dashboard : "#fff"} />
            </View>
            <View>
                <Text style={{color: isTablet ? colors.text : '#fff', fontWeight: '700', fontSize: 14}}>OKRs & Goals</Text>
                <Text style={{color: isTablet ? colors.textMuted : 'rgba(255,255,255,0.8)', fontSize: 11}}>{objectiveSummary?.total || 0} active</Text>
            </View>
        </View>
        <View style={{alignItems:'flex-end'}}>
            <Text style={{color: isTablet ? colors.text : '#fff', fontWeight: '800', fontSize: 16}}>{Math.round(objectiveSummary?.averageProgress || 0)}%</Text>
        </View>
    </Pressable>
  );

  const HabitsList = ({ vertical = false }) => (
     habitsData.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(280)} style={[styles.habitsSection, vertical && { flex: 1, paddingHorizontal: 0 }]}>
          <View style={styles.habitsSectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <View style={[styles.habitsBadge, {backgroundColor: colors.primary}]}>
                <Feather name="star" size={14} color="#fff" />
              </View>
              <Text style={[styles.habitsSectionTitle, {color: colors.text}]}>
                {t('Mobile.home.habitsToday', 'Hábitos de hoy')}
              </Text>
            </View>
            <Text style={{color: colors.textMuted, fontSize: 12}}>
              {completedHabits}/{totalHabits}
            </Text>
          </View>
          
          <ScrollView 
            horizontal={!vertical} 
            showsHorizontalScrollIndicator={false} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{gap: 10, paddingHorizontal: 4, paddingBottom: vertical ? 20 : 0}}
          >
            {habitsData.slice(0, vertical ? 10 : 5).map((habit) => {
              const isCompleted = !!(habit.completions && habit.completions.length > 0);
              return (
                <Pressable
                  key={habit.id}
                  onPress={() => handleToggleHabit(habit.id, isCompleted)}
                  style={[
                    styles.habitChip,
                    vertical && { width: '100%', maxWidth: '100%' },
                    {
                      backgroundColor: isCompleted ? `${colors.success}20` : colors.card,
                      borderColor: isCompleted ? colors.success : colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={isCompleted ? "check-circle" : "circle"}
                    size={16}
                    color={isCompleted ? colors.success : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.habitChipText,
                      {
                        color: isCompleted ? colors.success : colors.text,
                        textDecorationLine: isCompleted ? 'line-through' : 'none',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {habit.name}
                  </Text>
                  {habit.currentStreak > 0 && (
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 2}}>
                      <Feather name="zap" size={12} color="#f97316" />
                      <Text style={{color: '#f97316', fontSize: 10, fontWeight: '700'}}>{habit.currentStreak}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
     ) : null
  );

  const TaskList = () => (
      <>
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
                      {task.priority === "HIGH" ? "Alta" : task.priority === "MEDIUM" ? "Media" : "Baja"}
                    </Text>
                  </View>

                  {task.dueDate && (
                    <View style={styles.dueDateContainer}>
                      <Feather name="clock" size={14} color={colors.textMuted} />
                      <Text style={[styles.dueDate, { color: colors.textMuted }]}>
                         {formattedDate(task.dueDate)}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            </Animated.View>
          ))
        )}
      </>
  );

  const Filters = () => (
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
                    backgroundColor: selectedFilter === filterKey ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: selectedFilter === filterKey ? colors.buttonPrimaryText : colors.textSecondary,
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
  );

  const AddTaskButtonSummary = () => (
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
            <Text style={[styles.addTaskText, { color: colors.buttonPrimaryText }]}>
              Nueva Tarea
            </Text>
          </View>
        </Pressable>
      </Animated.View>
  );

  // --- LAYOUTS ---

  if (isTablet) {
     return (
        <Animated.View 
            layout={LinearTransition.springify().damping(20)}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* Tablet Header */}
            <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={[styles.header, { paddingBottom: 40 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                 <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Animated.View entering={FadeInDown.delay(100)}>
                         <Text style={styles.greeting}>{t('Mobile.home.greeting')}</Text>
                         <Text style={[styles.title, {marginBottom: 0}]}>{t('Mobile.home.myTasks')}</Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(200)} style={{width: 300}}>
                        <StatsSummary />
                    </Animated.View>
                 </View>
            </LinearGradient>

            {/* Tablet Content Grid */}
            <View style={{flexDirection: 'row', flex: 1, marginTop: -30}}>
                {/* Columna Izquierda (Main) */}
                <Animated.View entering={FadeInDown.delay(300)} style={{flex: 1.4, paddingLeft: 20, paddingRight: 10}}>
                     <Filters />
                     <ScrollView 
                        showsVerticalScrollIndicator={false} 
                        style={{flex: 1, marginTop: 10}}
                        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
                     >
                         <TaskList />
                         <View style={{height: 100}} />
                     </ScrollView>
                </Animated.View>

                {/* Columna Derecha (Sidebar) */}
                <Animated.View entering={FadeInDown.delay(400)} style={{flex: 1, paddingRight: 20, paddingLeft: 10, gap: 16}}>
                     <TabletAIInsightsWidget />
                     <MiniTimerWidget />
                     <NotesWidget />
                     <ObjectivesCard />
                     <View style={{flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16}}>
                        <HabitsList vertical />
                     </View>
                </Animated.View>
            </View>

            <AddTaskButtonSummary />
        </Animated.View>
     );
  }

  // --- MOBILE LAYOUT (DEFAULT) ---
  return (
    <Animated.View 
        layout={LinearTransition.springify().damping(20)}
        style={[styles.container, { backgroundColor: colors.background }]}
    >
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

        <Animated.View entering={FadeInDown.delay(200)}>
             <StatsSummary />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250)} style={{marginTop: 16, paddingHorizontal: 20, marginBottom: 10}}>
             <ObjectivesCard />
        </Animated.View>
      </LinearGradient>

      <Animated.View entering={FadeInDown.delay(350)} style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <MiniAIInsightsWidget />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450)}>
        <HabitsList />
        <MiniTimerWidget />
        <View style={{ paddingHorizontal: 20 }}>
          <NotesWidget />
        </View>
      </Animated.View>
      
      <Animated.View style={{flex: 1}} entering={FadeInDown.delay(550)}>
          <Filters />
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }
          >
            <TaskList />
            <View style={{ height: 100 }} />
          </ScrollView>
      </Animated.View>

      <AddTaskButtonSummary />
    </Animated.View>
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
    paddingHorizontal: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: -1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
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
  objectivesCard: {
    padding: 12, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderWidth: 1,
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
  // Streak Badge
  streakCard: {
    minWidth: 60,
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  // Habits Section
  habitsSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  habitsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  habitsBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  habitsSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  habitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 100,
    maxWidth: 180,
  },
  habitChipText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
});

