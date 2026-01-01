import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { useTasks } from "@/app/lib/shared-hooks";
import { useRouter } from "expo-router";

export default function TaskSearchScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useTasks();

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim() && !selectedStatus) {
      return [];
    }

    return tasks.filter((task) => {
      const matchesQuery =
        !searchQuery.trim() ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !selectedStatus || task.status === selectedStatus;

      return matchesQuery && matchesStatus;
    });
  }, [tasks, searchQuery, selectedStatus]);

  const STATUS_FILTERS = [
    { value: "TODO", label: "Por hacer", color: "#6B7280" },
    { value: "IN_PROGRESS", label: "En progreso", color: "#3B82F6" },
    { value: "COMPLETED", label: "Completadas", color: "#10B981" },
    { value: "CANCELLED", label: "Canceladas", color: "#EF4444" },
  ];

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      LOW: "#48BB78",
      MEDIUM: "#ECC94B",
      HIGH: "#F56565",
      URGENT: "#DC2626",
    };
    return colorMap[priority] || colors.textMuted;
  };

  const handleTaskPress = (taskId: string) => {
    router.push(`/screens/task?id=${taskId}`);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Sin fecha";
    return new Date(date).toLocaleDateString("es", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Buscar Tareas
        </Text>

        {/* Search Input */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por título o descripción..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: !selectedStatus
                  ? colors.primary
                  : colors.surface,
                borderColor: !selectedStatus ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedStatus(null)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: !selectedStatus ? "#FFFFFF" : colors.textSecondary,
                },
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedStatus === filter.value
                      ? filter.color + "20"
                      : colors.surface,
                  borderColor:
                    selectedStatus === filter.value
                      ? filter.color
                      : colors.border,
                },
              ]}
              onPress={() => setSelectedStatus(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      selectedStatus === filter.value
                        ? filter.color
                        : colors.textSecondary,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Buscando...
          </Text>
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="search"
            size={64}
            color={colors.textMuted}
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {searchQuery.trim() || selectedStatus
              ? "No se encontraron resultados"
              : "Escribe para buscar tareas"}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            Intenta con otros términos o filtros
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.taskCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => handleTaskPress(item.id)}
              activeOpacity={0.7}
            >
              {/* Priority Indicator */}
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              />

              {/* Task Content */}
              <View style={styles.taskContent}>
                <Text
                  style={[
                    styles.taskTitle,
                    {
                      color: colors.text,
                      textDecorationLine:
                        item.status === "COMPLETED" ? "line-through" : "none",
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                {item.description && (
                  <Text
                    style={[
                      styles.taskDescription,
                      { color: colors.textMuted },
                    ]}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                )}
                <View style={styles.taskMeta}>
                  <Feather name="calendar" size={14} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    {formatDate(item.dueDate)}
                  </Text>
                </View>
              </View>

              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === "COMPLETED"
                        ? "#10B981"
                        : item.status === "IN_PROGRESS"
                          ? "#3B82F6"
                          : item.status === "CANCELLED"
                            ? "#EF4444"
                            : "#6B7280",
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {STATUS_FILTERS.find((f) => f.value === item.status)?.label ||
                    item.status}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersScroll: {
    maxHeight: 50,
  },
  filtersContainer: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
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
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  priorityIndicator: {
    width: 4,
    height: "100%",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  taskContent: {
    flex: 1,
    gap: 6,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
