import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTasks } from "../../lib/shared-hooks";
import { useDesignTokens } from "../../lib/use-design-tokens";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Task } from "@ordo-todo/api-client";

interface TaskWithExtras extends Task {
  isUrgent?: boolean;
  isImportant?: boolean;
}

interface Quadrant {
  id: "DO" | "SCHEDULE" | "DELEGATE" | "DELETE";
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const quadrants: Quadrant[] = [
  {
    id: "DO",
    title: "Hacer Primero",
    subtitle: "Urgente e Importante",
    iconName: "flame",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.05)",
  },
  {
    id: "SCHEDULE",
    title: "Programar",
    subtitle: "Importante, No Urgente",
    iconName: "calendar",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.05)",
  },
  {
    id: "DELEGATE",
    title: "Delegar",
    subtitle: "Urgente, No Importante",
    iconName: "time",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.05)",
  },
  {
    id: "DELETE",
    title: "Eliminar",
    subtitle: "Ni Urgente Ni Importante",
    iconName: "trash",
    color: "#6B7280",
    bgColor: "rgba(107, 114, 128, 0.05)",
  },
];

function getTaskQuadrant(
  task: Task,
): "DO" | "SCHEDULE" | "DELEGATE" | "DELETE" {
  const isUrgent =
    task.priority === "URGENT" ||
    task.priority === "HIGH" ||
    isTaskDueSoon(task);
  const isImportant =
    task.priority === "URGENT" ||
    task.priority === "HIGH" ||
    task.priority === "MEDIUM";

  if (isUrgent && isImportant) return "DO";
  if (!isUrgent && isImportant) return "SCHEDULE";
  if (isUrgent && !isImportant) return "DELEGATE";
  return "DELETE";
}

function isTaskDueSoon(task: Task): boolean {
  if (!task.dueDate) return false;
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays <= 2 && diffDays >= 0;
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const { colors } = useDesignTokens();
  const isCompleted = task.status === "COMPLETED";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        padding: 12,
        backgroundColor: colors.card,
        borderRadius: 12,
        marginBottom: 8,
      }}
    >
      <TouchableOpacity
        onPress={onToggle}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isCompleted ? colors.primary : colors.border,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
        }}
      >
        {isCompleted && (
          <Ionicons name="checkmark" size={14} color={colors.primary} />
        )}
      </TouchableOpacity>

      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            color: colors.foreground,
            fontSize: 14,
            fontWeight: "500",
          }}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {task.dueDate && (
            <Text
              style={{
                fontSize: 11,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                color: isTaskDueSoon(task) ? "#EF4444" : colors.mutedForeground,
              }}
            >
              {isTaskDueSoon(task) && (
                <Ionicons name="warning" size={12} color="#EF4444" />
              )}
              {format(new Date(task.dueDate), "d MMM", { locale: es })}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function QuadrantCard({
  quadrant,
  tasks,
  onTaskToggle,
}: {
  quadrant: Quadrant;
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
}) {
  const { colors } = useDesignTokens();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: `${quadrant.color}30`,
        padding: 16,
        minHeight: 300,
      }}
    >
      {/* Quadrant Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: quadrant.bgColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={quadrant.iconName} size={16} color={quadrant.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: quadrant.color,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {quadrant.title}
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
            {quadrant.subtitle}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.muted,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: colors.foreground,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {tasks.length}
          </Text>
        </View>
      </View>

      {/* Tasks */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onTaskToggle(task.id)}
          />
        ))}

        {tasks.length === 0 && (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 48,
            }}
          >
            <Ionicons name="apps" size={32} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 14,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Sin tareas
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Arrastra tareas aquí
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function EisenhowerMatrixScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useDesignTokens();

  const { data: allTasks } = useTasks();

  // Group tasks by quadrant
  const tasksByQuadrant = useMemo(() => {
    const tasks = (allTasks || []).filter((t) => t.status !== "COMPLETED");
    const grouped: Record<string, Task[]> = {
      DO: [],
      SCHEDULE: [],
      DELEGATE: [],
      DELETE: [],
    };

    tasks.forEach((task) => {
      const quadrant = getTaskQuadrant(task);
      grouped[quadrant].push(task);
    });

    return grouped;
  }, [allTasks]);

  const handleTaskToggle = (taskId: string) => {
    // Toggle task completion
    console.log("Toggle task:", taskId);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ionicons name="flag" size={20} color={colors.primary} />
          <Text
            style={{
              color: colors.foreground,
              fontSize: 20,
              fontWeight: "700",
            }}
          >
            Matriz de Eisenhower
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginTop: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#EF4444",
              }}
            />
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
              {tasksByQuadrant.DO.length} urgentes
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#3B82F6",
              }}
            />
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
              {tasksByQuadrant.SCHEDULE.length} importantes
            </Text>
          </View>
        </View>
      </View>

      {/* Matrix Grid */}
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {quadrants.map((quadrant) => (
            <View key={quadrant.id} style={{ width: "100%", marginBottom: 12 }}>
              <QuadrantCard
                quadrant={quadrant}
                tasks={tasksByQuadrant[quadrant.id] || []}
                onTaskToggle={handleTaskToggle}
              />
            </View>
          ))}
        </View>

        {/* Legend */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View style={{ gap: 16 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  borderWidth: 2,
                  borderColor: "#EF4444",
                }}
              />
              <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
                Urgente + Importante = Hacer ahora
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  borderWidth: 2,
                  borderColor: "#3B82F6",
                }}
              />
              <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
                Solo Importante = Programar
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
