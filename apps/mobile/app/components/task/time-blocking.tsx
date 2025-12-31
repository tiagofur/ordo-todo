import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import DateTimePicker from "@react-native-community/datetimepicker";

export interface TimeBlock {
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  taskId?: string;
  notes?: string;
}

interface TimeBlockingProps {
  scheduledDate: Date | undefined;
  scheduledTime: string;
  scheduledEndTime: string;
  onTimeBlockChange: (block: TimeBlock) => void;
  taskId?: string;
}

export function TimeBlocking({
  scheduledDate,
  scheduledTime,
  scheduledEndTime,
  onTimeBlockChange,
  taskId,
}: TimeBlockingProps) {
  const colors = useThemeColors();
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [notes, setNotes] = useState("");

  const calculateDuration = () => {
    if (!scheduledDate || !scheduledTime || !scheduledEndTime) return 0;

    const [startHour, startMin] = scheduledTime.split(":").map(Number);
    const [endHour, endMin] = scheduledEndTime.split(":").map(Number);

    const startDate = new Date(scheduledDate);
    startDate.setHours(startHour, startMin);

    const endDate = new Date(scheduledDate);
    endDate.setHours(endHour, endMin);

    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffMs / (1000 * 60));
  };

  const duration = calculateDuration();

  const formatTime = (time: string) => {
    const [hour, min] = time.split(":").map(Number);
    return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const time = selectedDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      onTimeBlockChange({
        date: scheduledDate || new Date(),
        startTime: time,
        endTime: scheduledEndTime,
        duration,
        taskId,
        notes,
      });
    }
    setShowStartTimePicker(false);
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const time = selectedDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      onTimeChangeBlockChange({
        date: scheduledDate || new Date(),
        startTime: scheduledTime,
        endTime: time,
        duration: duration,
        taskId,
        notes,
      });
    }
    setShowEndTimePicker(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Feather name="calendar" size={20} color={colors.primary} />
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Bloque de Tiempo
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              {scheduledDate
                ? `Programado para ${scheduledDate.toLocaleDateString("es", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}`
                : "Sin programación"}
            </Text>
          </View>
        </View>
        {duration > 0 && (
          <View
            style={[
              styles.durationBadge,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Feather name="clock" size={16} color={colors.primary} />
            <Text style={[styles.durationText, { color: colors.primary }]}>
              {duration} min
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selection */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Fecha
          </Text>
          <TouchableOpacity
            style={[styles.valueRow, { backgroundColor: colors.background }]}
            onPress={() => {}}
          >
            <Feather name="calendar" size={18} color={colors.textSecondary} />
            <Text style={[styles.value, { color: colors.text }]}>
              {scheduledDate
                ? scheduledDate.toLocaleDateString("es", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Sin fecha"}
            </Text>
            {!scheduledDate && (
              <Feather
                name="chevron-right"
                size={16}
                color={colors.textMuted}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Time Range */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Horario
          </Text>
          <View style={styles.timeRow}>
            <TouchableOpacity
              style={[styles.timeInput, { backgroundColor: colors.background }]}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Feather name="clock" size={18} color={colors.textSecondary} />
              <Text
                style={[
                  styles.timeValue,
                  { color: scheduledTime ? colors.text : colors.textMuted },
                ]}
              >
                {scheduledTime ? formatTime(scheduledTime) : "Inicio"}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.timeSeparator, { color: colors.textMuted }]}>
              -
            </Text>

            <TouchableOpacity
              style={[styles.timeInput, { backgroundColor: colors.background }]}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text
                style={[
                  styles.timeValue,
                  { color: scheduledEndTime ? colors.text : colors.textMuted },
                ]}
              >
                {scheduledEndTime ? formatTime(scheduledEndTime) : "Fin"}
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Duration Summary */}
          {duration > 0 && (
            <View style={styles.durationSummary}>
              <Feather name="clock" size={14} color={colors.textSecondary} />
              <Text
                style={[
                  styles.durationSummaryText,
                  { color: colors.textMuted },
                ]}
              >
                Duración: {duration} minutos
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notas
          </Text>
          <View
            style={[
              styles.notesInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.notesField, { color: colors.text }]}
              placeholder="Agregar notas para este bloque..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            onTimeBlockChange({
              date: scheduledDate || new Date(),
              startTime: scheduledTime || "09:00",
              endTime: scheduledEndTime || "10:00",
              duration: duration || 60,
              taskId,
              notes,
            });
          }}
        >
          <Feather name="check" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Guardar Bloque</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={() => {}}
        >
          <Feather name="x" size={18} color={colors.textSecondary} />
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Pickers */}
      {showStartTimePicker && (
        <DateTimePicker
          value={new Date(scheduledDate || new Date())}
          mode="time"
          onChange={handleStartTimeChange}
          display="default"
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={new Date(scheduledDate || new Date())}
          mode="time"
          onChange={handleEndTimeChange}
          display="default"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  durationText: {
    fontSize: 13,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 10,
  },
  value: {
    flex: 1,
    fontSize: 15,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 10,
    gap: 12,
    backgroundColor: "#F8FAFC",
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  timeSeparator: {
    fontSize: 18,
    color: "#9CA3AF",
  },
  durationSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
  },
  durationSummaryText: {
    fontSize: 14,
  },
  notesInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  notesField: {
    fontSize: 14,
    minHeight: 80,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12,
    gap: 10,
    margin: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12,
    gap: 10,
    margin: 16,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
