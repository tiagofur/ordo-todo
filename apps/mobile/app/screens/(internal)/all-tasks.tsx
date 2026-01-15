import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import { useDesignTokens } from "@/app/lib/use-design-tokens";
import { useTasks } from "@/app/lib/shared-hooks";
import { useWorkspaceStore } from "@ordo-todo/stores";
import { useMediaQuery } from "@/app/lib/hooks/use-media-query";

type FilterType = "ALL" | "TODO" | "IN_PROGRESS" | "COMPLETED";
type SortType = "DUE_DATE" | "PRIORITY" | "CREATED_AT";

interface FilterBadge {
  label: string;
  value: FilterType;
  count?: number;
}

export default function AllTasksScreen() {
  const { colors, spacing, borderRadius } = useDesignTokens();
  const { isTablet } = useMediaQuery();
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("DUE_DATE");

  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: tasks = [], isLoading } = useTasks(selectedWorkspaceId || "");
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
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      case "CREATED_AT":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  const getPriorityColor = (priority: string) => {
    // Fallback to colors.priority if direct mapping fails, but using direct hardcoded tokens mapping for consistency with design-tokens.ts structure if needed
    // Actually, useDesignTokens exposes priorityColors
    const p = priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    // @ts-ignore - Dynamic access to priority colors
    return colors.priority[p]?.background || colors.muted;
  };
  
  const getPriorityForeground = (priority: string) => {
    const p = priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    // @ts-ignore
     return colors.priority[p]?.foreground || colors.mutedForeground;
  }

  const getStatusColor = (status: string) => {
     // @ts-ignore
    return colors.status[status]?.foreground || colors.mutedForeground;
  };
  
  const getStatusBg = (status: string) => {
      // @ts-ignore
      return colors.status[status]?.background || colors.muted;
  }

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, string> = {
      TODO: "circle",
      IN_PROGRESS: "play-circle",
      COMPLETED: "check-circle",
      CANCELLED: "x-circle",
    };
    return (iconMap[status] || "circle") as any;
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

  const renderItem = useCallback(({ item: task, index }: { item: any; index: number }) => {
    const isSelected = selectedTaskId === task.id;
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify().damping(15)}
        layout={LinearTransition.springify()}
        style={[
          { marginBottom: 12 },
          isTablet ? { flex: 1, marginHorizontal: 8 } : { marginHorizontal: 16 }
        ]}
      >
        <TouchableOpacity
            style={[
              styles.taskCard,
              {
                backgroundColor: isSelected ? colors.section.tasks + "10" : colors.card,
                borderColor: isSelected ? colors.section.tasks : colors.border,
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
                    backgroundColor: getStatusBg(task.status),
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
                          ? colors.mutedForeground
                          : colors.foreground,
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
                      style={[styles.projectTag, { color: colors.section.tasks, backgroundColor: colors.section.tasks + '15' }]}
                    >
                      {task.projectName}
                    </Text>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {task.tags.slice(0, 2).map((tag: any) => (
                        <View
                          key={tag}
                          style={[
                            styles.tag,
                            { backgroundColor: colors.muted },
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagText,
                              { color: colors.mutedForeground },
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
                            { color: colors.mutedForeground },
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
                  <Text style={[styles.priorityText, { color: getPriorityForeground(task.priority) }]}>
                    {task.priority}
                  </Text>
                </View>

                {/* Due Date */}
                {task.dueDate && (
                  <View style={styles.dueDateContainer}>
                    <Feather
                      name="calendar"
                      size={14}
                      color={colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.dueDateText,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {formatDate(task.dueDate)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [colors, selectedTaskId]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Todas las Tareas
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            {filteredTasks.length} tareas
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Buscar tareas..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={FILTERS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
          keyExtractor={(item) => item.value}
          renderItem={({ item: f }) => {
              const count =
              f.value === "ALL"
                ? tasks.length
                : tasks.filter((t) => t.status === f.value).length;
              const isActive = filter === f.value;
              
              return (
                <TouchableOpacity
                    style={[
                    styles.filterButton,
                    {
                        backgroundColor: isActive ? colors.section.tasks : colors.card,
                        borderColor: isActive ? colors.section.tasks : colors.border,
                    },
                    ]}
                    onPress={() => setFilter(f.value as FilterType)}
                >
                    <Text
                    style={[
                        styles.filterText,
                        {
                        color: isActive ? "#FFFFFF" : colors.mutedForeground,
                        fontWeight: isActive ? "700" : "500",
                        },
                    ]}
                    >
                    {f.label}
                    </Text>
                    {f.value !== "ALL" && (
                    <View
                        style={[
                        styles.filterCount,
                        { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : colors.muted },
                        ]}
                    >
                        <Text style={[styles.filterCountText, { color: isActive ? '#fff' : colors.mutedForeground }]}>{count}</Text>
                    </View>
                    )}
                </TouchableOpacity>
              )
          }}
        />

        {/* Sort Selector */}
        <TouchableOpacity
          style={[
            styles.sortButton,
            { backgroundColor: colors.card, borderColor: colors.border },
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
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.section.tasks} size="large" />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Cargando tareas...
            </Text>
          </View>
        ) : (
            <Animated.FlatList 
                key={isTablet ? 'tablet' : 'mobile'}
                numColumns={isTablet ? 2 : 1}
                columnWrapperStyle={isTablet ? { gap: 16 } : undefined}
                data={sortedTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.tasksContainer}
                showsVerticalScrollIndicator={false}
                itemLayoutAnimation={LinearTransition}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather
                        name="inbox"
                        size={64}
                        color={colors.muted}
                        style={styles.emptyIcon}
                        />
                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                        Sin tareas
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                        {filter === "ALL"
                            ? "No tienes tareas"
                            : `No hay tareas ${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()}`}
                        </Text>
                    </View>
                }
            />
        )}
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
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 24,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filtersScroll: {
    gap: 8,
    paddingRight: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20, // More rounded like chips
    borderWidth: 1,
    gap: 6,
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
    fontSize: 11,
    fontWeight: "700",
  },
  sortButton: {
    width: 40,
    height: 40, // Match filter button height approx
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tasksContainer: {
    paddingBottom: 40,
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
    opacity: 0.5,
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
    borderRadius: 16, // Consistent with dashboard
    borderWidth: 1,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  statusContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
    gap: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  projectTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
  },
  tagsMore: {
    fontSize: 10,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
  },
});
