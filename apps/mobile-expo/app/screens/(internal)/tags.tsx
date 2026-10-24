import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTags, useDeleteTag, useTasks, useCreateTag, useUpdateTag } from "../../lib/shared-hooks";
import { useThemeColors } from "../../data/hooks/use-theme-colors.hook";
import { useWorkspaceStore } from "@ordo-todo/stores";

export default function TagsScreen() {
  const colors = useThemeColors();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#6366f1");

  const { data: tags, isLoading } = useTags(selectedWorkspaceId || "");
  const { data: allTasks } = useTasks();
  const deleteTagMutation = useDeleteTag();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  
  const accentColor = "#6366f1"; // Indigo

  const tagColors = [
    "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", 
    "#EC4899", "#6366F1", "#14B8A6", "#F97316", "#84CC16"
  ];

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
    setTagName(tag.name);
    setTagColor(tag.color || accentColor);
    setShowCreateTag(true);
  };

  const handleOpenCreateDialog = () => {
    if (!selectedWorkspaceId) {
      Alert.alert("Error", "Please select a workspace first");
      return;
    }
    setEditingTag(null);
    setTagName("");
    setTagColor(accentColor);
    setShowCreateTag(true);
  };

  const handleSubmit = () => {
    if (!tagName.trim()) {
      Alert.alert("Error", "Tag name is required");
      return;
    }

    if (!selectedWorkspaceId) return;

    if (editingTag) {
      updateTagMutation.mutate({
        tagId: editingTag.id,
        data: { name: tagName, color: tagColor, workspaceId: selectedWorkspaceId }
      }, {
        onSuccess: () => setShowCreateTag(false),
        onError: (e: any) => Alert.alert("Error", e.message)
      });
    } else {
      createTagMutation.mutate({
        name: tagName,
        color: tagColor,
        workspaceId: selectedWorkspaceId
      }, {
        onSuccess: () => setShowCreateTag(false),
        onError: (e: any) => Alert.alert("Error", e.message)
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
          <View style={[styles.headerMainContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
             {/* Decoration */}
             <View style={[styles.headerDecoration, { backgroundColor: `${accentColor}10` }]} />
             <View style={[styles.headerDecorationSmall, { backgroundColor: `${accentColor}10` }]} />

             <View style={styles.headerContent}>
                 <Animated.View 
                    entering={FadeIn.duration(600)}
                    style={[styles.headerIconBox, { backgroundColor: accentColor, shadowColor: accentColor }]}
                 >
                    <Feather name="tag" size={28} color="white" />
                 </Animated.View>
                 <View style={styles.headerTexts}>
                     <Text style={[styles.headerTitle, { color: colors.text }]}>Tags</Text>
                     <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Organize your tasks</Text>
                 </View>
             </View>
             
             <TouchableOpacity
               onPress={handleOpenCreateDialog}
               style={[styles.addButton, { backgroundColor: accentColor, shadowColor: accentColor }]}
             >
               <Feather name="plus" size={24} color="#FFFFFF" />
             </TouchableOpacity>
          </View>
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
                          size={24}
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

      {/* Create/Edit Modal */}
      <Modal
        visible={showCreateTag}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateTag(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {editingTag ? "Edit Tag" : "New Tag"}
                </Text>

                <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                    placeholder="Tag Name"
                    placeholderTextColor={colors.textMuted}
                    value={tagName}
                    onChangeText={setTagName}
                    autoFocus
                />

                <Text style={[styles.label, { color: colors.textMuted }]}>Color</Text>
                <View style={styles.colorGrid}>
                    {tagColors.map(color => (
                        <TouchableOpacity
                            key={color}
                            onPress={() => setTagColor(color)}
                            style={[
                                styles.colorButton, 
                                { backgroundColor: color },
                                tagColor === color && styles.selectedColor
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.modalButtons}>
                    <TouchableOpacity 
                        onPress={() => setShowCreateTag(false)}
                        style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                    >
                        <Text style={{ color: colors.text }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={handleSubmit}
                        style={[styles.modalButton, { backgroundColor: accentColor }]}
                    >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                            {editingTag ? "Save" : "Create"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
  },
  headerDecoration: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  headerDecorationSmall: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      flex: 1,
  },
  headerIconBox: {
      width: 56,
      height: 56,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      transform: [{ rotate: '-5deg' }]
  },
  headerTexts: {
      flex: 1,
  },
  headerTitle: {
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.5,
  },
  headerSubtitle: {
      fontSize: 15,
      fontWeight: '500',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
    paddingTop: 0,
  },
  loadingContainer: {
    gap: 12,
  },
  skeleton: {
    height: 100,
    borderRadius: 24,
  },
  tagsGrid: {
    gap: 12,
  },
  tagCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderLeftWidth: 6,
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
    width: 44,
    height: 44,
    borderRadius: 14,
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
    gap: 8,
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
    fontSize: 13,
    fontWeight: "600",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
  },
  modalContent: {
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      elevation: 5,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
  },
  input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      marginBottom: 20,
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 10,
  },
  colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 24,
  },
  colorButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
  },
  selectedColor: {
      borderWidth: 3,
      borderColor: 'white',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3,
  },
  modalButtons: {
      flexDirection: 'row',
      gap: 12,
  },
  modalButton: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
  },
  cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
  },
});
