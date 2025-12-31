import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTasks } from "../../lib/shared-hooks";
import { useThemeColors } from "../../data/hooks/use-theme-colors.hook";
import { useWorkspaceStore } from "@ordo-todo/stores";

type Period = "today" | "week" | "month";

export default function TasksPeriodScreen() {
  const colors = useThemeColors();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [period, setPeriod] = React.useState<Period>("today");

  const { data: allTasks, isLoading } = useTasks();

  const filterTasksByPeriod = (tasks: any[], period: Period): any[] => {
    if (!tasks) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const today = new Date(now);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return tasks.filter((task: any) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const startDate = task.startDate ? new Date(task.startDate) : null;

      switch (period) {
        case "today":
          return dueDate && dueDate <= endOfWeek;
        case "week":
          return dueDate && dueDate <= endOfWeek;
        case "month":
          return dueDate && dueDate <= endOfMonth;
        default:
          return true;
      }
    });
  };

  const filteredTasks = filterTasksByPeriod(allTasks || [], period);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>

          <View style={styles.periodSelector}>
            {(["today", "week", "month"] as Period[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodButton,
                  period === p && { backgroundColor: colors.primary },
                ]}
                onPress={() => setPeriod(p)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: period === p ? "#FFFFFF" : colors.text },
                  ]}
                >
                  {p === "today" && "Today"}
                  {p === "week" && "Week"}
                  {p === "month" && "Month"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Loading...
            </Text>
          ) : filteredTasks.length === 0 ? (
            <Animated.View entering={FadeIn} style={styles.emptyState}>
              <Feather name="inbox" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No tasks for this period
              </Text>
            </Animated.View>
          ) : (
            filteredTasks.map((task: any) => (
              <Animated.View
                key={task.id}
                entering={FadeIn}
                style={[
                  styles.taskCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  task.status === "COMPLETED" && styles.taskCompleted,
                ]}
              >
                <Text style={[styles.taskTitle, { color: colors.text }]}>
                  {task.title}
                </Text>
                {task.dueDate && (
                  <Text style={[styles.taskDate, { color: colors.textMuted }]}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </Text>
                )}
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  taskCompleted: {
    opacity: 0.6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 14,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});
