import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { useRouter } from "expo-router";

// Note: Trash functionality requires backend API hooks
// For now, this is a UI-only implementation
const MOCK_DELETED_TASKS = [
  {
    id: "1",
    title: "Tarea eliminada ejemplo 1",
    description: "Esta fue una tarea importante",
    deletedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    status: "TODO",
  },
  {
    id: "2",
    title: "Proyecto cancelado",
    description: "Ya no es necesario",
    deletedAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
    status: "CANCELLED",
  },
];

export default function TaskTrashScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const handleRestore = (taskId: string, taskTitle: string) => {
    Alert.alert(
      "Restaurar Tarea",
      `¿Estás seguro de que quieres restaurar "${taskTitle}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          style: "default",
          onPress: () => {
            console.log("Restore task:", taskId);
            // TODO: Call backend API to restore task
            Alert.alert("Éxito", "Tarea restaurada (demo)");
          },
        },
      ],
    );
  };

  const handleDeletePermanently = (taskId: string, taskTitle: string) => {
    Alert.alert(
      "Eliminar Permanentemente",
      `¿Estás seguro de que quieres eliminar "${taskTitle}" permanentemente? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            console.log("Delete permanently:", taskId);
            // TODO: Call backend API to delete permanently
            Alert.alert("Éxito", "Tarea eliminada permanentemente (demo)");
          },
        },
      ],
    );
  };

  const handleRestoreAll = () => {
    Alert.alert(
      "Restaurar Todo",
      "¿Estás seguro de que quieres restaurar todas las tareas de la papelera?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          style: "default",
          onPress: () => {
            console.log("Restore all tasks");
            // TODO: Call backend API to restore all
            Alert.alert("Éxito", "Todas las tareas restauradas (demo)");
          },
        },
      ],
    );
  };

  const handleEmptyTrash = () => {
    Alert.alert(
      "Vaciar Papelera",
      "¿Estás seguro de que quieres eliminar permanentemente todas las tareas de la papelera? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Vaciar",
          style: "destructive",
          onPress: () => {
            console.log("Empty trash");
            // TODO: Call backend API to empty trash
            Alert.alert("Éxito", "Papelera vaciada (demo)");
          },
        },
      ],
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diffInMs = now - then;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Hoy";
    if (diffInDays === 1) return "Ayer";
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return `Hace ${Math.floor(diffInDays / 30)} meses`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Papelera
        </Text>

        {/* Actions */}
        {MOCK_DELETED_TASKS.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.headerButton,
                { backgroundColor: colors.primary + "15" },
              ]}
              onPress={handleRestoreAll}
            >
              <Feather name="refresh-cw" size={16} color={colors.primary} />
              <Text
                style={[styles.headerButtonText, { color: colors.primary }]}
              >
                Restaurar Todo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.headerButton,
                { backgroundColor: "#EF4444" + "15" },
              ]}
              onPress={handleEmptyTrash}
            >
              <Feather name="trash-2" size={16} color="#EF4444" />
              <Text style={[styles.headerButtonText, { color: "#EF4444" }]}>
                Vaciar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {MOCK_DELETED_TASKS.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="trash-2"
            size={64}
            color={colors.textMuted}
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Papelera Vacía
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            Las tareas eliminadas aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={MOCK_DELETED_TASKS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.taskCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {/* Task Info */}
              <View style={styles.taskInfo}>
                <Text
                  style={[styles.taskTitle, { color: colors.text }]}
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
                  <Feather name="clock" size={14} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    Eliminado {formatTimeAgo(item.deletedAt)}
                  </Text>
                  <Feather name="calendar" size={14} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    {formatDate(item.deletedAt)}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.taskActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                  onPress={() => handleRestore(item.id, item.title)}
                >
                  <Feather name="refresh-cw" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#EF4444" + "15" },
                  ]}
                  onPress={() => handleDeletePermanently(item.id, item.title)}
                >
                  <Feather name="trash-2" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  headerButtonText: {
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    gap: 6,
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
    gap: 8,
  },
  metaText: {
    fontSize: 12,
  },
  taskActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
