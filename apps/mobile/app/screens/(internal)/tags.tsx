import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTags, useDeleteTag, useTasks } from "../../lib/shared-hooks";
import { useThemeColors } from "../../data/hooks/use-theme-colors.hook";
import { useWorkspaceStore } from "@ordo-todo/stores";

export default function TagsScreen() {
  const colors = useThemeColors();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);

  const { data: tags, isLoading } = useTags(selectedWorkspaceId || "");
  const { data: allTasks } = useTasks();
  const deleteTagMutation = useDeleteTag();
  const accentColor = "#22c55e";

  const getTaskCount = (tagId: string) => {
    if (!allTasks) return 0;
    return allTasks.filter((task: any) =>
      task.tags?.some((tag: any) => tag.id === tagId),
    ).length;
  };

  const handleDelete = (tagId: string) => {
    Alert.alert("Delete Tag", "Are you sure you want to delete this tag?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTagMutation.mutate(tagId, {
            onSuccess: () => {
              console.log("Tag deleted");
            },
            onError: (error: any) => {
              Alert.alert("Error", error.message || "Failed to delete tag");
            },
          });
        },
      },
    ]);
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setShowCreateTag(true);
  };

  const handleOpenCreateDialog = () => {
    if (!selectedWorkspaceId) {
      Alert.alert("Error", "Please select a workspace first");
      return;
    }
    setEditingTag(null);
    setShowCreateTag(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.View
          entering={FadeIn}
          style={[styles.iconContainer, { backgroundColor: accentColor }]}
        >
          <Feather name="tag" size={24} color="#FFFFFF" />
        </Animated.View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Tags</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Organize your tasks with tags
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleOpenCreateDialog}
          style={[styles.addButton, { backgroundColor: accentColor }]}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tags List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[styles.skeleton, { backgroundColor: colors.surface }]}
              />
            ))}
          </View>
        ) : tags && tags.length > 0 ? (
          <View style={styles.tagsGrid}>
            {tags.map((tag: any, index: number) => {
              const taskCount = getTaskCount(tag.id);
              return (
                <Animated.View
                  key={tag.id}
                  entering={FadeInDown.delay(index * 50).springify()}
                  style={[
                    styles.tagCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderLeftColor: tag.color || accentColor,
                    },
                  ]}
                >
                  <View style={styles.tagHeader}>
                    <View style={styles.tagInfo}>
                      <View
                        style={[
                          styles.tagIcon,
                          {
                            backgroundColor: `${tag.color || accentColor}15`,
                          },
                        ]}
                      >
                        <Feather
                          name="tag"
                          size={28}
                          color={tag.color || accentColor}
                        />
                      </View>
                      <Text
                        style={[styles.tagName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {tag.name}
                      </Text>
                    </View>
                    <View style={styles.tagActions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(tag)}
                        style={styles.actionButton}
                      >
                        <Feather
                          name="edit-2"
                          size={18}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(tag.id)}
                        style={styles.actionButton}
                      >
                        <Feather name="trash-2" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.tagFooter}>
                    <Feather
                      name="check-square"
                      size={14}
                      color={colors.textMuted}
                    />
                    <Text
                      style={[styles.taskCount, { color: colors.textMuted }]}
                    >
                      {taskCount} {taskCount === 1 ? "task" : "tasks"}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <View
              style={[styles.emptyIcon, { backgroundColor: colors.surface }]}
            >
              <Feather name="tag" size={48} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No tags yet
            </Text>
            <Text
              style={[styles.emptyDescription, { color: colors.textMuted }]}
            >
              Create tags to organize your tasks and improve productivity
            </Text>
            <TouchableOpacity
              onPress={handleOpenCreateDialog}
              style={[styles.emptyButton, { backgroundColor: accentColor }]}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Create Tag</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    gap: 12,
  },
  skeleton: {
    height: 120,
    borderRadius: 16,
  },
  tagsGrid: {
    gap: 12,
  },
  tagCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tagHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tagInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  tagIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tagName: {
    fontSize: 18,
    fontWeight: "700",
    maxWidth: 150,
  },
  tagActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  tagFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    borderStyle: "dashed",
  },
  taskCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
