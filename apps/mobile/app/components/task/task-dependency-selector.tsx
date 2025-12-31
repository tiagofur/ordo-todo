import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { useTasks } from "@/app/lib/shared-hooks";

export type DependencyType = "BLOCKING" | "RELATED";

export interface TaskDependency {
  dependsOnId: string;
  type: DependencyType;
}

interface TaskDependencySelectorProps {
  projectId?: string;
  selectedDependencies: TaskDependency[];
  onAddDependency: (dependency: TaskDependency) => void;
  onRemoveDependency: (dependsOnId: string) => void;
  excludeTaskId?: string;
}

export function TaskDependencySelector({
  projectId,
  selectedDependencies,
  onAddDependency,
  onRemoveDependency,
  excludeTaskId,
}: TaskDependencySelectorProps) {
  const colors = useThemeColors();
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<DependencyType>("BLOCKING");

  const { data: tasks = [], isLoading } = useTasks(projectId);

  // Filter tasks for selector
  const availableTasks = tasks.filter(
    (task) =>
      task.id !== excludeTaskId &&
      !selectedDependencies.some((dep) => dep.dependsOnId === task.id) &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleAddDependency = (taskId: string) => {
    onAddDependency({
      dependsOnId: taskId,
      type: selectedType,
    });
    setSearchQuery("");
    setShowSelector(false);
  };

  const getTaskForDependency = (taskId: string) => {
    return tasks.find((t) => t.id === taskId);
  };

  const formatDependencyType = (type: DependencyType) => {
    return type === "BLOCKING" ? "Bloqueante" : "Relacionada";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Dependencias
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowSelector(true)}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* Dependencies List */}
      {selectedDependencies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="link" size={32} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Sin dependencias
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            Esta tarea no depende de otras tareas
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {selectedDependencies.map((dependency) => {
            const depTask = getTaskForDependency(dependency.dependsOnId);
            if (!depTask) return null;

            return (
              <View
                key={dependency.dependsOnId}
                style={[
                  styles.dependencyItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.dependencyContent}>
                  <Feather
                    name={dependency.type === "BLOCKING" ? "lock" : "link"}
                    size={16}
                    color={
                      dependency.type === "BLOCKING"
                        ? "#EF4444"
                        : colors.primary
                    }
                  />
                  <Text
                    style={[styles.dependencyTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {depTask.title}
                  </Text>
                </View>
                <View style={styles.dependencyMeta}>
                  <Text
                    style={[styles.dependencyType, { color: colors.textMuted }]}
                  >
                    {formatDependencyType(dependency.type)}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => onRemoveDependency(dependency.dependsOnId)}
                  >
                    <Feather name="x" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Task Selector Modal */}
      {showSelector && (
        <View style={[styles.modalOverlay, { backgroundColor: "#00000080" }]}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Seleccionar Tarea
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSelector(false)}
              >
                <Feather name="x" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  {
                    backgroundColor:
                      selectedType === "BLOCKING"
                        ? colors.primary + "15"
                        : colors.surface,
                    borderColor:
                      selectedType === "BLOCKING"
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setSelectedType("BLOCKING")}
              >
                <Feather
                  name="lock"
                  size={16}
                  color={
                    selectedType === "BLOCKING"
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeText,
                    {
                      color:
                        selectedType === "BLOCKING"
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  Bloqueante
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  {
                    backgroundColor:
                      selectedType === "RELATED"
                        ? colors.primary + "15"
                        : colors.surface,
                    borderColor:
                      selectedType === "RELATED"
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setSelectedType("RELATED")}
              >
                <Feather
                  name="link"
                  size={16}
                  color={
                    selectedType === "RELATED"
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeText,
                    {
                      color:
                        selectedType === "RELATED"
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  Relacionada
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Feather name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Buscar tarea..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            {/* Tasks List */}
            <View style={styles.tasksList}>
              {isLoading ? (
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                  Cargando tareas...
                </Text>
              ) : availableTasks.length === 0 ? (
                <Text
                  style={[styles.noResultsText, { color: colors.textMuted }]}
                >
                  No se encontraron tareas
                </Text>
              ) : (
                <FlatList
                  data={availableTasks}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.taskItem,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => handleAddDependency(item.id)}
                    >
                      <Text
                        style={[styles.taskTitle, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Feather
                        name="chevron-right"
                        size={16}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                  style={styles.flatList}
                />
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  list: {
    gap: 8,
  },
  dependencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dependencyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dependencyTitle: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  dependencyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dependencyType: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  removeButton: {
    padding: 4,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tasksList: {
    flex: 1,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 14,
  },
  noResultsText: {
    textAlign: "center",
    fontSize: 14,
  },
  flatList: {
    maxHeight: 300,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});
