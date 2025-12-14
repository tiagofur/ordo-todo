import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { useProjectBySlug } from "@/app/hooks/api/use-projects";
import { useTasks } from "@/app/hooks/api/use-tasks";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Card from "@/app/components/shared/card.component";
import type { Task } from "@ordo-todo/api-client";

export default function ProjectDetailScreen() {
  const colors = useThemeColors();
  const { username, slug, projectSlug } = useLocalSearchParams();

  const { project, isLoading: isLoadingProject } = useProjectBySlug(
    slug as string,
    projectSlug as string
  );
  const { data: allTasks } = useTasks();

  // Filter tasks by project
  const projectTasks = allTasks?.filter(
    (task: Task) => String(task.projectId) === String(project?.id)
  ) || [];

  const handleBack = () => {
    router.back();
  };

  const handleTaskPress = (taskId: string) => {
    router.push({ pathname: "/screens/(internal)/task", params: { id: taskId } });
  };

  if (isLoadingProject) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>Proyecto no encontrado</Text>
        <Pressable onPress={handleBack} style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={styles.buttonText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const todoTasks = projectTasks.filter((t: Task) => t.status === "TODO");
  const inProgressTasks = projectTasks.filter((t: Task) => t.status === "IN_PROGRESS");
  const completedTasks = projectTasks.filter((t: Task) => t.status === "COMPLETED");
  const totalTasks = projectTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[project.color || colors.primary, `${project.color || colors.primary}dd`]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Feather name="folder" size={32} color="#fff" />
          </View>
          <Text style={styles.projectName}>{project.name}</Text>
          {project.description && (
            <Text style={styles.projectDescription}>{project.description}</Text>
          )}
          <Text style={styles.breadcrumb}>@{username} / {slug}</Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{inProgressTasks.length}</Text>
            <Text style={styles.statLabel}>En Progreso</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPercent}%</Text>
        </Animated.View>
      </LinearGradient>

      {/* Tasks Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tareas del Proyecto</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {totalTasks === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={48} color={colors.textMuted} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay tareas en este proyecto
            </Text>
          </View>
        ) : (
          <>
            {/* TODO Tasks */}
            {todoTasks.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={[styles.taskSectionTitle, { color: colors.textSecondary }]}>
                  POR HACER ({todoTasks.length})
                </Text>
                {todoTasks.map((task: Task, index: number) => (
                  <Animated.View
                    key={task.id}
                    entering={FadeInDown.delay(300 + index * 50).springify()}
                  >
                    <Card onPress={() => handleTaskPress(task.id)} style={styles.taskCard}>
                      <View style={styles.taskHeader}>
                        <Feather
                          name={getStatusIcon(task.status)}
                          size={20}
                          color={colors.primary}
                        />
                        <Text style={[styles.taskTitle, { color: colors.text }]}>
                          {task.title}
                        </Text>
                      </View>
                      {task.priority && (
                        <View
                          style={[
                            styles.priorityBadge,
                            { backgroundColor: `${getPriorityColor(task.priority)}20` },
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
                            {task.priority}
                          </Text>
                        </View>
                      )}
                    </Card>
                  </Animated.View>
                ))}
              </View>
            )}

            {/* In Progress Tasks */}
            {inProgressTasks.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={[styles.taskSectionTitle, { color: colors.textSecondary }]}>
                  EN PROGRESO ({inProgressTasks.length})
                </Text>
                {inProgressTasks.map((task: Task, index: number) => (
                  <Animated.View
                    key={task.id}
                    entering={FadeInDown.delay(300 + index * 50).springify()}
                  >
                    <Card onPress={() => handleTaskPress(task.id)} style={styles.taskCard}>
                      <View style={styles.taskHeader}>
                        <Feather
                          name={getStatusIcon(task.status)}
                          size={20}
                          color={colors.primary}
                        />
                        <Text style={[styles.taskTitle, { color: colors.text }]}>
                          {task.title}
                        </Text>
                      </View>
                      {task.priority && (
                        <View
                          style={[
                            styles.priorityBadge,
                            { backgroundColor: `${getPriorityColor(task.priority)}20` },
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
                            {task.priority}
                          </Text>
                        </View>
                      )}
                    </Card>
                  </Animated.View>
                ))}
              </View>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={[styles.taskSectionTitle, { color: colors.textSecondary }]}>
                  COMPLETADAS ({completedTasks.length})
                </Text>
                {completedTasks.map((task: Task, index: number) => (
                  <Animated.View
                    key={task.id}
                    entering={FadeInDown.delay(300 + index * 50).springify()}
                  >
                    <Card onPress={() => handleTaskPress(task.id)} style={styles.taskCard}>
                      <View style={styles.taskHeader}>
                        <Feather
                          name={getStatusIcon(task.status)}
                          size={20}
                          color={colors.success}
                        />
                        <Text
                          style={[
                            styles.taskTitle,
                            { color: colors.text, textDecorationLine: "line-through", opacity: 0.6 },
                          ]}
                        >
                          {task.title}
                        </Text>
                      </View>
                    </Card>
                  </Animated.View>
                ))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    padding: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  projectName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  breadcrumb: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 2,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  taskSection: {
    marginBottom: 24,
  },
  taskSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  taskCard: {
    marginBottom: 12,
    padding: 12,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    alignSelf: "flex-start",
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
