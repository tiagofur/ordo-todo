import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import React, { useState } from "react";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Card from "@/app/components/shared/card.component";

// Datos de ejemplo de tareas
const EXAMPLE_TASKS = [
  {
    id: "1",
    title: "Diseñar nueva interfaz",
    description: "Crear mockups para la app móvil",
    priority: "high",
    status: "in_progress",
    dueDate: "Hoy, 15:00",
  },
  {
    id: "2",
    title: "Revisar código del backend",
    description: "Code review del PR #234",
    priority: "medium",
    status: "pending",
    dueDate: "Mañana",
  },
  {
    id: "3",
    title: "Actualizar documentación",
    description: "Agregar guías de uso de la API",
    priority: "low",
    status: "pending",
    dueDate: "Esta semana",
  },
  {
    id: "4",
    title: "Meeting con el equipo",
    description: "Daily standup a las 10:00",
    priority: "high",
    status: "pending",
    dueDate: "Hoy, 10:00",
  },
];

const FILTERS = ["Todas", "Hoy", "Próximas", "Completadas"];

export default function Home() {
  const colors = useThemeColors();
  const [selectedFilter, setSelectedFilter] = useState("Todas");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return colors.priorityHigh;
      case "medium":
        return colors.priorityMedium;
      case "low":
        return colors.priorityLow;
      default:
        return colors.textMuted;
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "high":
        return colors.priorityHighBg;
      case "medium":
        return colors.priorityMediumBg;
      case "low":
        return colors.priorityLowBg;
      default:
        return colors.backgroundSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return "play-circle";
      case "completed":
        return "check-circle";
      default:
        return "circle";
    }
  };

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
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.title}>Mis Tareas</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>
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
          {FILTERS.map((filter, index) => (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter)}
            >
              <Animated.View
                entering={FadeInRight.delay(300 + index * 50)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedFilter === filter
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
                        selectedFilter === filter
                          ? colors.buttonPrimaryText
                          : colors.textSecondary,
                      fontWeight: selectedFilter === filter ? "700" : "600",
                    },
                  ]}
                >
                  {filter}
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
      >
        {EXAMPLE_TASKS.map((task, index) => (
          <Animated.View
            key={task.id}
            entering={FadeInDown.delay(400 + index * 100).springify()}
            layout={Layout.springify()}
          >
            <Card
              onPress={() => console.log("Task pressed:", task.id)}
              style={styles.taskCard}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskHeaderLeft}>
                  <Feather
                    name={getStatusIcon(task.status)}
                    size={24}
                    color={
                      task.status === "completed"
                        ? colors.success
                        : colors.primary
                    }
                  />
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: colors.text }]}>
                      {task.title}
                    </Text>
                    <Text
                      style={[
                        styles.taskDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {task.description}
                    </Text>
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
                    {task.priority === "high"
                      ? "Alta"
                      : task.priority === "medium"
                      ? "Media"
                      : "Baja"}
                  </Text>
                </View>

                <View style={styles.dueDateContainer}>
                  <Feather
                    name="clock"
                    size={14}
                    color={colors.textMuted}
                  />
                  <Text
                    style={[styles.dueDate, { color: colors.textMuted }]}
                  >
                    {task.dueDate}
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}

        {/* Botón para agregar tarea */}
        <Animated.View
          entering={FadeInDown.delay(800).springify()}
        >
          <Pressable>
            <View
              style={[
                styles.addTaskButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Feather name="plus" size={24} color={colors.primary} />
              <Text
                style={[styles.addTaskText, { color: colors.primary }]}
              >
                Agregar nueva tarea
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: 20,
    gap: 8,
  },
  addTaskText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
