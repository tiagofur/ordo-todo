/**
 * Task Selector for Timer - Mobile Version
 *
 * Allows selecting which task to associate with timer session.
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { X, Search, Check } from 'lucide-react-native';

import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { colors } from '@ordo-todo/styles/tokens';

export interface Task {
  id: string;
  title: string;
  projectId?: string;
  projectName?: string;
  color?: string;
}

interface TaskSelectorProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string | null) => void;
  labels?: {
    title?: string;
    searchPlaceholder?: string;
    noTask?: string;
    selectTask?: string;
  };
}

/**
 * TaskSelector Component
 */
export function TaskSelector({
  tasks,
  selectedTaskId,
  onTaskSelect,
  labels = {},
}: TaskSelectorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    title = 'Seleccionar Tarea',
    searchPlaceholder = 'Buscar tarea...',
    noTask = 'Sin tarea',
    selectTask = 'Seleccionar tarea',
  } = labels;

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTaskSelect = (taskId: string) => {
    onTaskSelect(taskId);
    setIsVisible(false);
  };

  const handleClearTask = () => {
    onTaskSelect(null);
  };

  return (
    <>
      {/* Selected Task Display */}
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        style={styles.selectedTaskContainer}
        activeOpacity={0.7}
      >
        <View style={styles.selectedTaskInfo}>
          <Text style={styles.selectedTaskLabel}>
            {selectedTask ? selectedTask.title : noTask}
          </Text>
          {selectedTask?.projectName && (
            <Text style={styles.projectName}>
              {selectedTask.projectName}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Clear Task Button */}
      {selectedTask && (
        <TouchableOpacity
          onPress={handleClearTask}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={colors.mutedForeground} strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      {/* Task Selection Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.foreground} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Task List */}
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedTaskId;
              return (
                <TouchableOpacity
                  onPress={() => handleTaskSelect(item.id)}
                  style={[
                    styles.taskItem,
                    isSelected && { backgroundColor: colors.accent },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskItemContent}>
                    <View style={styles.taskItemInfo}>
                      <Text
                        style={[
                          styles.taskTitle,
                          isSelected && { color: colors.accentForeground },
                        ]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      {item.projectName && (
                        <Text
                          style={[
                            styles.projectName,
                            isSelected && { color: colors.accentForeground + '80' },
                          ]}
                        >
                          {item.projectName}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <View
                        style={[
                          styles.checkIcon,
                          { backgroundColor: colors.accentForeground },
                        ]}
                      >
                        <Check size={16} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tasks found</Text>
              </View>
            }
            contentContainerStyle={styles.taskList}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectedTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    minHeight: 48,
  },
  selectedTaskInfo: {
    flex: 1,
  },
  selectedTaskLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  projectName: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  closeButton: {
    padding: 4,
  },
  taskList: {
    padding: 16,
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  taskItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  taskItemInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 4,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedForeground,
  },
});
