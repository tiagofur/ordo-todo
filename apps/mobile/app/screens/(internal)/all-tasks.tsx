import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { useTasks } from "@/app/lib/shared-hooks";
import { useWorkspaceStore } from "@ordo-todo/stores";
import DateTimePicker from "@react-native-community/datetimepicker";

type FilterType = "ALL" | "TODO" | "IN_PROGRESS" | "COMPLETED";
type SortType = "DUE_DATE" | "PRIORITY" | "CREATED_AT";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: Date | null;
  projectId: string;
  projectName?: string;
  tags?: string[];
  createdAt: Date;
}

interface FilterBadge {
  label: string;
  value: FilterType;
  count?: number;
}

export default function AllTasksScreen() {
  const colors = useThemeColors();
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("DUE_DATE");

  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: tasks = [], isLoading } = useTasks(selectedWorkspaceId);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const FILTERS: FilterBadge[] = [
    { label: "Todas", value: "ALL" },
    { label: "Por hacer", value: "TODO" },
    { label: "En progreso", value: "IN_PROGRESS" },
    { label: "Completadas", value: "COMPLETED" },
  ];

  const SORT_OPTIONS: SortType[] = ["DUE_DATE", "PRIORITY", "CREATED_AT"];

  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    if (filter !== "ALL" && task.status !== filter) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDesc =
        task.description?.toLowerCase().includes(query) || false;
      if (!matchesTitle && !matchesDesc) return false;
    }

    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "DUE_DATE":
        return (
          (a.dueDate ? new Date(a.dueDate).getTime() : 0) -
          (b.dueDate ? new Date(b.dueDate).getTime() : 0)
        );
      case "PRIORITY":
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case "CREATED_AT":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      LOW: "#48BB78",
      MEDIUM: "#ECC94B",
      HIGH: "#F56565",
      URGENT: "#DC2626",
    };
    return colorMap[priority] || colors.textMuted;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      TODO: "#6B7280",
      IN_PROGRESS: "#3B82F6",
      COMPLETED: "#10B981",
      CANCELLED: "#9CA3AF",
    };
    return colorMap[status] || colors.textMuted;
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, string> = {
      TODO: "circle",
      IN_PROGRESS: "play-circle",
      COMPLETED: "check-circle",
      CANCELLED: "x-circle",
    };
    return iconMap[status] || "circle";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Sin fecha";
    return new Date(date).toLocaleDateString("es", {
      month: "short",
      day: "numeric",
    });
  };

  const handleTaskPress = (taskId: string) => {
    setSelectedTaskId(selectedTaskId === taskId ? null : taskId);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Todas las Tareas
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {filteredTasks.length} tareas
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar tareas..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {FILTERS.map((f) => {
            const count =
              f.value === "ALL"
                ? tasks.length
                : tasks.filter((t) => t.status === f.value).length;

            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      filter === f.value ? colors.primary : colors.surface,
                    borderColor:
                      filter === f.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFilter(f.value as FilterType)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        filter === f.value ? "#FFFFFF" : colors.textSecondary,
                      fontWeight: filter === f.value ? "700" : "500",
                    },
                  ]}
                >
                  {f.label}
                </Text>
                {f.value !== "ALL" && (
                  <View
                    style={[
                      styles.filterCount,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.filterCountText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sort Selector */}
        <TouchableOpacity
          style={[
            styles.sortButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => {
            const currentIndex = SORT_OPTIONS.indexOf(sortBy);
            const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length;
            setSortBy(SORT_OPTIONS[nextIndex]);
          }}
        >
          <Feather
            name={
              sortBy === "DUE_DATE"
                ? "calendar"
                : sortBy === "PRIORITY"
                  ? "flag"
                  : "clock"
            }
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Cargando tareas...
            </Text>
          </View>
        ) : sortedTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather
              name="inbox"
              size={64}
              color={colors.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Sin tareas
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {filter === "ALL"
                ? "No tienes tareas"
                : `No hay tareas ${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()}`}
            </Text>
          </View>
        ) : (
          <View style={styles.tasksContainer}>
            {sortedTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  {
                    backgroundColor:
                      selectedTaskId === task.id
                        ? colors.primary + "10"
                        : colors.surface,
                    borderColor:
                      selectedTaskId === task.id
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => handleTaskPress(task.id)}
                activeOpacity={0.7}
              >
                <View style={styles.taskHeader}>
                  {/* Status Icon */}
                  <View
                    style={[
                      styles.statusContainer,
                      {
                        backgroundColor: getStatusColor(task.status) + "15",
                      },
                    ]}
                  >
                    <Feather
                      name={getStatusIcon(task.status)}
                      size={14}
                      color={getStatusColor(task.status)}
                    />
                  </View>

                  {/* Task Content */}
                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        {
                          color:
                            task.status === "COMPLETED" ||
                            task.status === "CANCELLED"
                              ? colors.textMuted
                              : colors.text,
                          textDecorationLine:
                            task.status === "COMPLETED"
                              ? "line-through"
                              : "none",
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>

                    {/* Meta */}
                    <View style={styles.taskMeta}>
                      {task.projectName && (
                        <Text
                          style={[styles.projectTag, { color: colors.primary }]}
                        >
                          {task.projectName}
                        </Text>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                          {task.tags.slice(0, 2).map((tag) => (
                            <View
                              key={tag}
                              style={[
                                styles.tag,
                                { backgroundColor: colors.surface + "50" },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.tagText,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                {tag}
                              </Text>
                            </View>
                          ))}
                          {task.tags.length > 2 && (
                            <Text
                              style={[
                                styles.tagsMore,
                                { color: colors.textMuted },
                              ]}
                            >
                              +{task.tags.length - 2}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Priority Badge */}
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(task.priority) },
                      ]}
                    >
                      <Text style={[styles.priorityText, { color: "#FFFFFF" }]}>
                        {task.priority}
                      </Text>
                    </View>

                    {/* Due Date */}
                    {task.dueDate && (
                      <View style={styles.dueDateContainer}>
                        <Feather
                          name="calendar"
                          size={14}
                          color={colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.dueDateText,
                            { color: colors.textMuted },
                          ]}
                        >
                          {formatDate(task.dueDate)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.taskActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor:
                          task.status === "COMPLETED"
                            ? "#10B981" + "15"
                            : colors.background + "50",
                      },
                    ]}
                    onPress={() => {
                      console.log("Toggle task status:", task.id);
                    }}
                  >
                    <Feather
                      name={
                        task.status === "COMPLETED" ? "check-circle" : "circle"
                      }
                      size={18}
                      color={
                        task.status === "COMPLETED"
                          ? "#10B981"
                          : colors.textSecondary
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.background + "50" },
                    ]}
                  >
                    <Feather
                      name="chevron-right"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filtersScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
    minWidth: 120,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  tasksList: {
    flex: 1,
  },
  tasksContainer: {
    padding: 0,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  statusContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  taskContent: {
    flex: 1,
    gap: 8,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  projectTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
  },
  tagsMore: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dueDateText: {
    fontSize: 12,
  },
  taskActions: {
    gap: 8,
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
