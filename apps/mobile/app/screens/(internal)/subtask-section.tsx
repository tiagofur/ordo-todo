import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  useCreateSubtask,
  useCompleteTask,
  useDeleteTask,
  useTaskDetails,
} from "@/app/lib/shared-hooks";

interface Subtask {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

interface SubtaskSectionProps {
  taskId: string;
}

export function SubtaskSection({ taskId }: SubtaskSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const createSubtask = useCreateSubtask();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const { data: taskDetails, isLoading: isLoadingSubtasks } =
    useTaskDetails(taskId);

  const subtasks = taskDetails?.subTasks || [];

  const handleCreateSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    createSubtask.mutate(
      { parentTaskId: taskId, data: { title: newSubtaskTitle } },
      {
        onSuccess: () => {
          setNewSubtaskTitle("");
          setIsAdding(false);
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "No se pudo crear la subtarea");
        },
      },
    );
  };

  const handleToggleComplete = (subtaskId: string, currentStatus: string) => {
    if (currentStatus === "COMPLETED") {
      Alert.alert("Reabrir subtarea", "Función no implementada aún");
    } else {
      completeTask.mutate(subtaskId, {
        onSuccess: () => {
          console.log("Subtask completed");
        },
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error.message || "No se pudo completar la subtarea",
          );
        },
      });
    }
  };

  const handleDelete = (subtaskId: string) => {
    Alert.alert(
      "Eliminar subtarea",
      "¿Estás seguro de eliminar esta subtarea?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteTask.mutate(subtaskId, {
              onSuccess: () => {
                console.log("Subtask deleted");
              },
              onError: (error: any) => {
                Alert.alert(
                  "Error",
                  error.message || "No se pudo eliminar la subtarea",
                );
              },
            });
          },
        },
      ],
    );
  };

  const handleStartEdit = (subtaskId: string, currentTitle: string) => {
    setEditingId(subtaskId);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = (subtaskId: string) => {
    Alert.alert("Guardar cambios", "Función no implementada aún");
    setEditingId(null);
    setEditingTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const completedCount = subtasks.filter(
    (st) => st.status === "COMPLETED",
  ).length;
  const totalCount = subtasks.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.title}>Subtareas</Text>
          {totalCount > 0 && (
            <Text style={styles.count}>
              {completedCount}/{totalCount}
            </Text>
          )}
        </View>

        {totalCount > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
        )}
      </View>

      {/* Loading State */}
      {isLoadingSubtasks && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando subtareas...</Text>
        </View>
      )}

      {/* Subtasks List */}
      {!isLoadingSubtasks && (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {subtasks.map((subtask) => (
            <View
              key={subtask.id}
              style={[
                styles.subtaskItem,
                subtask.status === "COMPLETED" && styles.subtaskCompleted,
              ]}
            >
              {/* Drag handle (visual only) */}
              <TouchableOpacity style={styles.dragHandle}>
                <Feather name="more-vertical" size={14} color="#6b7280" />
              </TouchableOpacity>

              {/* Checkbox */}
              <TouchableOpacity
                onPress={() => handleToggleComplete(subtask.id, subtask.status)}
                style={[
                  styles.checkbox,
                  subtask.status === "COMPLETED" && { borderColor: "#7c3aed" },
                ]}
              >
                {subtask.status === "COMPLETED" && (
                  <Feather name="check" size={14} color="#10b981" />
                )}
              </TouchableOpacity>

              {/* Title - Editable */}
              <View style={{ flex: 1 }}>
                {editingId === subtask.id ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      value={editingTitle}
                      onChangeText={setEditingTitle}
                      style={styles.editInput}
                      autoFocus
                      onSubmitEditing={() => handleSaveEdit(subtask.id)}
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSaveEdit(subtask.id)}
                      disabled={createSubtask.isPending}
                    >
                      <Feather name="check" size={14} color="#10b981" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelEdit}
                    >
                      <Feather name="x" size={14} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleStartEdit(subtask.id, subtask.title)}
                    onLongPress={() =>
                      handleStartEdit(subtask.id, subtask.title)
                    }
                    style={styles.titleContainer}
                  >
                    <Text
                      style={[
                        styles.subtaskTitle,
                        subtask.status === "COMPLETED" &&
                          styles.subtaskTitleCompleted,
                      ]}
                    >
                      {subtask.title}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Actions */}
              {editingId !== subtask.id && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handleStartEdit(subtask.id, subtask.title)}
                    style={styles.actionButton}
                  >
                    <Feather name="edit-2" size={16} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(subtask.id)}
                    style={styles.actionButton}
                  >
                    <Feather name="trash-2" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {/* Empty State */}
          {subtasks.length === 0 && !isAdding && (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={32} color="#9ca3af" />
              <Text style={styles.emptyText}>Sin subtareas</Text>
              <Text style={styles.emptySubtext}>
                Añade subtareas para organizar mejor tu trabajo
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Add Subtask Form */}
      {isAdding && (
        <View style={styles.addForm}>
          <TextInput
            value={newSubtaskTitle}
            onChangeText={setNewSubtaskTitle}
            placeholder="¿Qué necesitas hacer?"
            style={styles.addInput}
            autoFocus
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateSubtask}
            disabled={!newSubtaskTitle.trim() || createSubtask.isPending}
          >
            <Feather name="check" size={18} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelAddButton}
            onPress={() => {
              setIsAdding(false);
              setNewSubtaskTitle("");
            }}
          >
            <Feather name="x" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      )}

      {!isAdding && (
        <TouchableOpacity
          style={styles.addSubtaskButton}
          onPress={() => setIsAdding(true)}
        >
          <Feather name="plus" size={18} color="#7c3aed" />
          <Text style={styles.addButtonText}>Añadir subtarea</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  count: {
    fontSize: 12,
    color: "#6b7280",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c3aed",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  list: {
    maxHeight: 300,
    paddingHorizontal: 24,
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 8,
  },
  subtaskCompleted: {
    opacity: 0.6,
  },
  dragHandle: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  subtaskTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  subtaskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#9ca3af",
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  editInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  saveButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  addForm: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  addInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
  },
  addSubtaskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7c3aed",
  },
  cancelAddButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
